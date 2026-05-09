use std::{env, time::Duration};

use redis::Client as RedisClient;
use reqwest::Client as HttpClient;
use serde::Deserialize;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use uuid::Uuid;

const PHOTO_QUEUE: &str = "efindr:photo-processing";

#[derive(Debug, Deserialize)]
struct PhotoProcessingJob {
    photo_id: Uuid,
    event_id: Uuid,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let redis_url = env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".into());
    let internal_api_url =
        env::var("INTERNAL_API_URL").unwrap_or_else(|_| "http://localhost:8080".into());
    let internal_service_token =
        env::var("INTERNAL_SERVICE_TOKEN").unwrap_or_else(|_| "internal-token".into());

    let redis = RedisClient::open(redis_url).expect("redis client");
    let http = HttpClient::new();

    tracing::info!("worker listening on queue {}", PHOTO_QUEUE);

    loop {
        if let Err(error) =
            process_next_job(&redis, &http, &internal_api_url, &internal_service_token).await
        {
            tracing::error!("worker job error: {error}");
            tokio::time::sleep(Duration::from_secs(2)).await;
        }
    }
}

async fn process_next_job(
    redis: &RedisClient,
    http: &HttpClient,
    internal_api_url: &str,
    internal_service_token: &str,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let mut connection = redis.get_multiplexed_tokio_connection().await?;
    let response: Vec<String> = redis::cmd("BRPOP")
        .arg(PHOTO_QUEUE)
        .arg("0")
        .query_async(&mut connection)
        .await?;

    if response.len() != 2 {
        return Ok(());
    }

    let payload = &response[1];
    let job: PhotoProcessingJob = serde_json::from_str(payload)?;
    tracing::info!(
        "processing photo {} for event {}",
        job.photo_id,
        job.event_id
    );

    let response = http
        .post(format!(
            "{}/internal/photos/{}/process",
            internal_api_url.trim_end_matches('/'),
            job.photo_id
        ))
        .bearer_auth(internal_service_token)
        .send()
        .await?;

    if !response.status().is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(format!("internal processing failed: {}", body).into());
    }

    Ok(())
}
