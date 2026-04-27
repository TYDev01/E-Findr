use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{error::AppError, state::AppState};

#[derive(Debug, Serialize)]
pub struct ExtractFaceRequest {
    pub image_base64: String,
    pub event_id: Option<Uuid>,
}

#[derive(Debug, Serialize)]
pub struct ProcessPhotoRequest {
    pub photo_id: Uuid,
    pub event_id: Uuid,
    pub image_url: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct AiFaceEmbedding {
    pub embedding: Vec<f32>,
    pub face_box: serde_json::Value,
    pub confidence: f32,
    pub faces_detected: usize,
}

#[derive(Debug, Deserialize)]
pub struct ProcessPhotoResponse {
    pub photo_id: Uuid,
    pub event_id: Uuid,
    pub embeddings: Vec<AiFaceEmbedding>,
    pub status: String,
}

pub async fn extract_face_embedding(
    state: &AppState,
    payload: &ExtractFaceRequest,
) -> Result<AiFaceEmbedding, AppError> {
    let response = state
        .http
        .post(format!(
            "{}/extract-face-embedding",
            state.settings.ai_service_url
        ))
        .bearer_auth(&state.settings.internal_service_token)
        .json(payload)
        .send()
        .await?;

    if !response.status().is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(AppError::BadRequest(if body.is_empty() {
            "Unable to process selfie. Please upload a clear image with only your face.".into()
        } else {
            body
        }));
    }

    response.json::<AiFaceEmbedding>().await.map_err(Into::into)
}

pub async fn process_event_photo(
    state: &AppState,
    payload: &ProcessPhotoRequest,
) -> Result<ProcessPhotoResponse, AppError> {
    let response = state
        .http
        .post(format!(
            "{}/process-event-photo",
            state.settings.ai_service_url
        ))
        .bearer_auth(&state.settings.internal_service_token)
        .json(payload)
        .send()
        .await?;

    if !response.status().is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(AppError::BadRequest(if body.is_empty() {
            "Unable to process event photo.".into()
        } else {
            body
        }));
    }

    response
        .json::<ProcessPhotoResponse>()
        .await
        .map_err(Into::into)
}
