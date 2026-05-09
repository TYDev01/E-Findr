use axum::{
    extract::{Multipart, Path, State},
    routing::{delete, get, patch, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::query_as;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{Event, EventView, Photo, PhotoView, UploadResponse},
    services::{
        auth::{hash_password, AuthenticatedUser},
        queue::{enqueue_photo_job, PhotoProcessingJob},
        storage::{photo_to_view, upload_photo_assets, validate_upload},
    },
    state::AppState,
};

#[derive(Debug, Deserialize)]
pub struct CreateEventPayload {
    pub title: String,
    pub description: Option<String>,
    pub location: Option<String>,
    pub event_date: Option<DateTime<Utc>>,
    pub access_code: Option<String>,
    pub is_private: bool,
}

#[derive(Debug, Deserialize)]
pub struct UpdateEventPayload {
    pub title: Option<String>,
    pub description: Option<String>,
    pub location: Option<String>,
    pub event_date: Option<DateTime<Utc>>,
    pub access_code: Option<String>,
    pub is_private: Option<bool>,
}

#[derive(Serialize)]
pub struct EventDetailResponse {
    pub event: EventView,
    pub photos: Vec<PhotoView>,
    pub share_url: String,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/events", post(create_event).get(list_events))
        .route(
            "/api/events/:id",
            get(get_event).patch(update_event).delete(delete_event),
        )
        .route("/api/events/:id/photos", get(list_photos))
        .route("/api/events/:id/photos/upload", post(upload_photos))
        .route("/api/events/:id/photos/:photo_id", delete(delete_photo))
}

async fn create_event(
    authenticated_user: AuthenticatedUser,
    State(state): State<AppState>,
    Json(payload): Json<CreateEventPayload>,
) -> Result<Json<EventView>, AppError> {
    let slug = format!("evt-{}", Uuid::new_v4().simple());
    let access_code_hash = match payload.access_code {
        Some(access_code) if !access_code.trim().is_empty() => Some(hash_password(&access_code)?),
        _ => None,
    };

    let event = query_as::<_, Event>(
        "INSERT INTO events
         (id, organizer_id, title, description, location, event_date, slug, access_code_hash, is_private)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, organizer_id, title, description, location, event_date, slug, access_code_hash, is_private, created_at, updated_at",
    )
    .bind(Uuid::new_v4())
    .bind(authenticated_user.id)
    .bind(payload.title)
    .bind(payload.description)
    .bind(payload.location)
    .bind(payload.event_date)
    .bind(slug)
    .bind(access_code_hash)
    .bind(payload.is_private)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(event.into()))
}

async fn list_events(
    authenticated_user: AuthenticatedUser,
    State(state): State<AppState>,
) -> Result<Json<Vec<EventView>>, AppError> {
    let events = query_as::<_, Event>(
        "SELECT id, organizer_id, title, description, location, event_date, slug, access_code_hash, is_private, created_at, updated_at
         FROM events WHERE organizer_id = $1 ORDER BY created_at DESC",
    )
    .bind(authenticated_user.id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(events.into_iter().map(Into::into).collect()))
}

async fn get_event(
    authenticated_user: AuthenticatedUser,
    Path(id): Path<Uuid>,
    State(state): State<AppState>,
) -> Result<Json<EventDetailResponse>, AppError> {
    let event = load_owned_event(&state, id, authenticated_user.id).await?;

    let photos = load_photo_views(&state, id).await?;

    Ok(Json(EventDetailResponse {
        share_url: format!("{}/events/{}", state.settings.frontend_origin, event.slug),
        event: event.into(),
        photos,
    }))
}

async fn update_event(
    authenticated_user: AuthenticatedUser,
    Path(id): Path<Uuid>,
    State(state): State<AppState>,
    Json(payload): Json<UpdateEventPayload>,
) -> Result<Json<EventView>, AppError> {
    let access_code_hash = match payload.access_code {
        Some(access_code) if !access_code.trim().is_empty() => Some(hash_password(&access_code)?),
        Some(_) => None,
        None => {
            let existing = load_owned_event(&state, id, authenticated_user.id).await?;
            existing.access_code_hash
        }
    };

    let event = query_as::<_, Event>(
        "UPDATE events
         SET title = COALESCE($2, title),
             description = COALESCE($3, description),
             location = COALESCE($4, location),
             event_date = COALESCE($5, event_date),
             access_code_hash = $6,
             is_private = COALESCE($7, is_private),
             updated_at = NOW()
         WHERE id = $1 AND organizer_id = $8
         RETURNING id, organizer_id, title, description, location, event_date, slug, access_code_hash, is_private, created_at, updated_at",
    )
    .bind(id)
    .bind(payload.title)
    .bind(payload.description)
    .bind(payload.location)
    .bind(payload.event_date)
    .bind(access_code_hash)
    .bind(payload.is_private)
    .bind(authenticated_user.id)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(event.into()))
}

async fn delete_event(
    authenticated_user: AuthenticatedUser,
    Path(id): Path<Uuid>,
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query("DELETE FROM events WHERE id = $1 AND organizer_id = $2")
        .bind(id)
        .bind(authenticated_user.id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({ "deleted": true })))
}

async fn list_photos(
    authenticated_user: AuthenticatedUser,
    Path(id): Path<Uuid>,
    State(state): State<AppState>,
) -> Result<Json<Vec<PhotoView>>, AppError> {
    load_owned_event(&state, id, authenticated_user.id).await?;
    let photos = load_photo_views(&state, id).await?;
    Ok(Json(photos))
}

async fn upload_photos(
    authenticated_user: AuthenticatedUser,
    Path(event_id): Path<Uuid>,
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<UploadResponse>, AppError> {
    load_owned_event(&state, event_id, authenticated_user.id).await?;
    let mut uploaded = Vec::new();

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_| AppError::BadRequest("Invalid multipart payload.".into()))?
    {
        if field.name() != Some("photos") {
            continue;
        }

        let file_name = field
            .file_name()
            .map(ToOwned::to_owned)
            .unwrap_or_else(|| format!("upload-{}.jpg", Uuid::new_v4()));
        let content_type = field
            .content_type()
            .map(|value| value.to_string())
            .unwrap_or_else(|| "application/octet-stream".to_string());
        let bytes = field
            .bytes()
            .await
            .map_err(|_| AppError::BadRequest("Unable to read upload.".into()))?;

        validate_upload(&file_name, &content_type, bytes.len())?;

        let photo_id = Uuid::new_v4();
        let (storage_key, thumbnail_key, width, height) = upload_photo_assets(
            &state,
            event_id,
            photo_id,
            &file_name,
            &content_type,
            &bytes,
        )
        .await?;

        let photo = query_as::<_, Photo>(
            "INSERT INTO photos
             (id, event_id, storage_key, thumbnail_key, original_filename, mime_type, size_bytes, width, height, processing_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
             RETURNING id, event_id, storage_key, thumbnail_key, original_filename, mime_type, size_bytes, width, height, processing_status, created_at",
        )
        .bind(photo_id)
        .bind(event_id)
        .bind(storage_key.clone())
        .bind(thumbnail_key.clone())
        .bind(file_name.clone())
        .bind(content_type)
        .bind(bytes.len() as i64)
        .bind(width)
        .bind(height)
        .fetch_one(&state.db)
        .await?;

        let job = PhotoProcessingJob { photo_id, event_id };
        enqueue_photo_job(&state, &job).await?;

        uploaded.push(photo_to_view(&state, &photo).await?);
    }

    if uploaded.is_empty() {
        return Err(AppError::BadRequest(
            "Attach at least one image in the photos field.".into(),
        ));
    }

    Ok(Json(UploadResponse {
        queued_jobs: uploaded.len(),
        uploaded,
    }))
}

async fn delete_photo(
    authenticated_user: AuthenticatedUser,
    Path((event_id, photo_id)): Path<(Uuid, Uuid)>,
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    load_owned_event(&state, event_id, authenticated_user.id).await?;

    let result = sqlx::query("DELETE FROM photos WHERE id = $1 AND event_id = $2")
        .bind(photo_id)
        .bind(event_id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({ "deleted": true })))
}

async fn load_photo_views(state: &AppState, event_id: Uuid) -> Result<Vec<PhotoView>, AppError> {
    let photos = query_as::<_, Photo>(
        "SELECT id, event_id, storage_key, thumbnail_key, original_filename, mime_type, size_bytes, width, height, processing_status, created_at
         FROM photos WHERE event_id = $1 ORDER BY created_at DESC",
    )
    .bind(event_id)
    .fetch_all(&state.db)
    .await?;

    let mut views = Vec::with_capacity(photos.len());
    for photo in photos {
        views.push(photo_to_view(state, &photo).await?);
    }

    Ok(views)
}

async fn load_owned_event(
    state: &AppState,
    event_id: Uuid,
    organizer_id: Uuid,
) -> Result<Event, AppError> {
    query_as::<_, Event>(
        "SELECT id, organizer_id, title, description, location, event_date, slug, access_code_hash, is_private, created_at, updated_at
         FROM events WHERE id = $1 AND organizer_id = $2",
    )
    .bind(event_id)
    .bind(organizer_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)
}
