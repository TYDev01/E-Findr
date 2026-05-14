use axum::{
    extract::{Path, State},
    http::{header, HeaderMap},
    routing::post,
    Json, Router,
};
use pgvector::Vector;
use sqlx::query_as;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::Photo,
    services::ai::{process_event_photo, ProcessPhotoRequest},
    state::AppState,
};

pub fn router() -> Router<AppState> {
    Router::new().route("/internal/photos/:photo_id/process", post(process_photo))
}

pub async fn process_photo(
    headers: HeaderMap,
    Path(photo_id): Path<Uuid>,
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    authorize_internal_request(&headers, &state)?;

    let photo = query_as::<_, Photo>(
        "SELECT id, event_id, storage_key, thumbnail_key, original_filename, mime_type, size_bytes, width, height, processing_status, created_at
         FROM photos WHERE id = $1",
    )
    .bind(photo_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::NotFound)?;

    sqlx::query("UPDATE photos SET processing_status = 'processing' WHERE id = $1")
        .bind(photo_id)
        .execute(&state.db)
        .await?;

    let image_url = match crate::services::storage::signed_asset_url(&state, &photo.storage_key).await {
        Ok(url) => url,
        Err(e) => {
            tracing::error!(photo_id = %photo_id, "failed to generate signed URL: {:?}", e);
            return Err(e);
        }
    };

    tracing::info!(photo_id = %photo_id, "calling AI service at {}", state.settings.ai_service_url);
    match process_event_photo(
        &state,
        &ProcessPhotoRequest {
            photo_id: photo.id,
            event_id: photo.event_id,
            image_url,
        },
    )
    .await
    {
        Ok(result) => {
            sqlx::query("DELETE FROM face_embeddings WHERE photo_id = $1")
                .bind(photo.id)
                .execute(&state.db)
                .await?;

            for embedding in result.embeddings {
                sqlx::query(
                    "INSERT INTO face_embeddings (id, photo_id, event_id, embedding, face_box, confidence)
                     VALUES ($1, $2, $3, $4, $5, $6)",
                )
                .bind(Uuid::new_v4())
                .bind(photo.id)
                .bind(photo.event_id)
                .bind(Vector::from(embedding.embedding))
                .bind(embedding.face_box)
                .bind(embedding.confidence)
                .execute(&state.db)
                .await?;
            }

            sqlx::query("UPDATE photos SET processing_status = 'completed' WHERE id = $1")
                .bind(photo.id)
                .execute(&state.db)
                .await?;

            Ok(Json(serde_json::json!({
                "processed": true,
                "photoId": photo.id,
                "status": result.status
            })))
        }
        Err(error) => {
            tracing::error!(photo_id = %photo_id, "AI service processing failed: {:?}", error);
            sqlx::query("UPDATE photos SET processing_status = 'failed' WHERE id = $1")
                .bind(photo.id)
                .execute(&state.db)
                .await?;
            Err(error)
        }
    }
}

fn authorize_internal_request(headers: &HeaderMap, state: &AppState) -> Result<(), AppError> {
    let token = headers
        .get(header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "))
        .ok_or(AppError::Unauthorized)?;

    if token != state.settings.internal_service_token {
        return Err(AppError::Unauthorized);
    }

    Ok(())
}
