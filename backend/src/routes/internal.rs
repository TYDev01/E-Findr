use axum::{
    extract::{Path, State},
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
    Path(photo_id): Path<Uuid>,
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
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

    let image_url = crate::services::storage::signed_asset_url(&state, &photo.storage_key).await?;
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
            sqlx::query("UPDATE photos SET processing_status = 'failed' WHERE id = $1")
                .bind(photo.id)
                .execute(&state.db)
                .await?;
            Err(error)
        }
    }
}
