use std::sync::Arc;

use redis::Client;
use reqwest::Client as HttpClient;
use sqlx::{postgres::PgPoolOptions, PgPool};

use crate::config::Settings;

#[derive(Clone)]
pub struct AppState {
    pub settings: Arc<Settings>,
    pub db: PgPool,
    pub redis: Client,
    pub http: HttpClient,
}

impl AppState {
    pub async fn new(settings: Arc<Settings>) -> Result<Self, sqlx::Error> {
        let db = PgPoolOptions::new()
            .max_connections(10)
            .connect(&settings.database_url)
            .await?;

        Ok(Self {
            db,
            redis: Client::open(settings.redis_url.clone()).expect("redis client"),
            http: HttpClient::new(),
            settings,
        })
    }
}
