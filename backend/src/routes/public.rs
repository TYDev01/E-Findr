use axum::{
    extract::{Multipart, Path, State},
    routing::{get, post},
    Json, Router,
};
use base64::{engine::general_purpose::STANDARD, Engine};
use pgvector::Vector;
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as, FromRow};
use uuid::Uuid;

use crate::{
    error::AppError,
    models::{Event, SearchMatch},
    services::{
        ai::{extract_face_embedding, ExtractFaceRequest},
        auth::verify_password,
        storage::signed_asset_url,
    },
    state::AppState,
};

#[derive(Deserialize)]
pub struct VerifyAccessCodePayload {
    pub access_code: String,
}

#[derive(Serialize)]
pub struct PublicEventResponse {
    pub id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub location: Option<String>,
    pub requires_access_code: bool,
    pub privacy_notice: &'static str,
}

#[derive(FromRow)]
struct MatchRow {
    photo_id: Uuid,
    storage_key: String,
    thumbnail_key: String,
    similarity_score: f32,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/public/events/:slug", get(get_public_event))
        .route(
            "/api/public/events/:slug/verify-access-code",
            post(verify_access_code),
        )
        .route("/api/public/events/:slug/search-face", post(search_face))
}

async fn get_public_event(
    Path(slug): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<PublicEventResponse>, AppError> {
    let event = query_as::<_, Event>(
        "SELECT id, organizer_id, title, description, location, event_date, slug, access_code_hash, is_private, created_at, updated_at
         FROM events WHERE slug = $1",
    )
    .bind(slug)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(PublicEventResponse {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        requires_access_code: event.access_code_hash.is_some(),
        privacy_notice: "Upload a clear selfie to find your photos from this event. Your selfie is used only for this search and is deleted after processing. Results are limited to this event gallery.",
    }))
}

async fn verify_access_code(
    Path(slug): Path<String>,
    State(state): State<AppState>,
    Json(payload): Json<VerifyAccessCodePayload>,
) -> Result<Json<serde_json::Value>, AppError> {
    let event = load_event_by_slug(&state, &slug).await?;
    let valid = match event.access_code_hash {
        Some(hash) => verify_password(&payload.access_code, &hash)?,
        None => true,
    };

    Ok(Json(serde_json::json!({ "valid": valid })))
}

async fn search_face(
    Path(slug): Path<String>,
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<serde_json::Value>, AppError> {
    let event = load_event_by_slug(&state, &slug).await?;
    let mut selfie_bytes: Option<Vec<u8>> = None;
    let mut access_code: Option<String> = None;
    let mut attendee_name: Option<String> = None;

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|_| AppError::BadRequest("Invalid multipart payload.".into()))?
    {
        match field.name() {
            Some("selfie") => {
                let content_type = field
                    .content_type()
                    .map(|value| value.to_string())
                    .unwrap_or_else(|| "application/octet-stream".into());
                let file_name = field
                    .file_name()
                    .map(ToOwned::to_owned)
                    .unwrap_or_else(|| "selfie.jpg".into());
                let bytes = field
                    .bytes()
                    .await
                    .map_err(|_| AppError::BadRequest("Unable to read selfie upload.".into()))?;
                crate::services::storage::validate_upload(&file_name, &content_type, bytes.len())?;
                selfie_bytes = Some(bytes.to_vec());
            }
            Some("access_code") => {
                access_code = Some(
                    field
                        .text()
                        .await
                        .map_err(|_| AppError::BadRequest("Invalid access code.".into()))?,
                );
            }
            Some("attendee_name") => {
                attendee_name = Some(
                    field
                        .text()
                        .await
                        .map_err(|_| AppError::BadRequest("Invalid attendee name.".into()))?,
                );
            }
            _ => {}
        }
    }

    if let Some(hash) = &event.access_code_hash {
        let provided = access_code.unwrap_or_default();
        if !verify_password(&provided, hash)? {
            return Err(AppError::Forbidden);
        }
    }

    let selfie_bytes = selfie_bytes
        .ok_or_else(|| AppError::BadRequest("Upload a selfie to run the search.".into()))?;

    let embedding_response = extract_face_embedding(
        &state,
        &ExtractFaceRequest {
            image_base64: STANDARD.encode(selfie_bytes),
            event_id: Some(event.id),
        },
    )
    .await?;

    if embedding_response.faces_detected != 1 {
        return Err(AppError::BadRequest(
            "Please upload a selfie with only your face visible.".into(),
        ));
    }

    let search_vector = Vector::from(embedding_response.embedding);
    let rows = query_as::<_, MatchRow>(
        "SELECT photos.id AS photo_id, photos.storage_key, photos.thumbnail_key,
         (1 - (face_embeddings.embedding <=> $1))::real AS similarity_score
         FROM face_embeddings
         JOIN photos ON photos.id = face_embeddings.photo_id
         WHERE face_embeddings.event_id = $2
         AND face_embeddings.confidence >= 0.75
         AND 1 - (face_embeddings.embedding <=> $1) >= 0.72
         ORDER BY face_embeddings.embedding <=> $1 ASC
         LIMIT 24",
    )
    .bind(search_vector)
    .bind(event.id)
    .fetch_all(&state.db)
    .await?;

    let mut matches = Vec::with_capacity(rows.len());
    for row in rows {
        matches.push(SearchMatch {
            photo_id: row.photo_id,
            thumbnail_url: signed_asset_url(&state, &row.thumbnail_key).await?,
            image_url: signed_asset_url(&state, &row.storage_key).await?,
            similarity_score: row.similarity_score,
        });
    }

    query(
        "INSERT INTO search_logs (id, event_id, attendee_name, request_ip)
         VALUES ($1, $2, $3, $4)",
    )
    .bind(Uuid::new_v4())
    .bind(event.id)
    .bind(attendee_name)
    .bind("unknown")
    .execute(&state.db)
    .await?;

    Ok(Json(
        serde_json::json!({ "matches": matches, "eventId": event.id }),
    ))
}

async fn load_event_by_slug(state: &AppState, slug: &str) -> Result<Event, AppError> {
    query_as::<_, Event>(
        "SELECT id, organizer_id, title, description, location, event_date, slug, access_code_hash, is_private, created_at, updated_at
         FROM events WHERE slug = $1",
    )
    .bind(slug)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)
}
