use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{error::AppError, state::AppState};

pub const PHOTO_QUEUE: &str = "efindr:photo-processing";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PhotoProcessingJob {
    pub photo_id: Uuid,
    pub event_id: Uuid,
}

pub async fn enqueue_photo_job(state: &AppState, job: &PhotoProcessingJob) -> Result<(), AppError> {
    let mut connection = state
        .redis
        .get_multiplexed_tokio_connection()
        .await
        .map_err(|_| AppError::Internal)?;
    let payload = serde_json::to_string(job).map_err(|_| AppError::Internal)?;
    let _: usize = connection
        .lpush(PHOTO_QUEUE, payload)
        .await
        .map_err(|_| AppError::Internal)?;
    Ok(())
}
