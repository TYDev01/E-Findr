use std::{env, sync::Arc};

#[derive(Clone)]
pub struct Settings {
    pub database_url: String,
    pub redis_url: String,
    pub jwt_secret: String,
    pub ai_service_url: String,
    pub internal_service_token: String,
    pub r2_region: String,
    pub r2_endpoint: String,
    pub r2_bucket: String,
    pub r2_access_key_id: String,
    pub r2_secret_access_key: String,
    pub r2_public_base_url: String,
    pub signed_url_ttl_seconds: u64,
    pub frontend_origin: String,
}

impl Settings {
    pub fn from_env() -> Arc<Self> {
        Arc::new(Self {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/efindr".into()),
            redis_url: env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".into()),
            jwt_secret: env::var("JWT_SECRET").unwrap_or_else(|_| "change-me".into()),
            ai_service_url: env::var("AI_SERVICE_URL")
                .unwrap_or_else(|_| "http://localhost:8001".into()),
            internal_service_token: env::var("INTERNAL_SERVICE_TOKEN")
                .unwrap_or_else(|_| "internal-token".into()),
            r2_region: env::var("R2_REGION").unwrap_or_else(|_| "auto".into()),
            r2_endpoint: env::var("R2_ENDPOINT")
                .unwrap_or_else(|_| "https://<accountid>.r2.cloudflarestorage.com".into()),
            r2_bucket: env::var("R2_BUCKET").unwrap_or_else(|_| "efindr".into()),
            r2_access_key_id: env::var("R2_ACCESS_KEY_ID").unwrap_or_default(),
            r2_secret_access_key: env::var("R2_SECRET_ACCESS_KEY").unwrap_or_default(),
            r2_public_base_url: env::var("R2_PUBLIC_BASE_URL")
                .unwrap_or_else(|_| "https://cdn.example.com".into()),
            signed_url_ttl_seconds: env::var("SIGNED_URL_TTL_SECONDS")
                .ok()
                .and_then(|value| value.parse().ok())
                .unwrap_or(3600),
            frontend_origin: env::var("FRONTEND_ORIGIN")
                .unwrap_or_else(|_| "http://localhost:3000".into()),
        })
    }
}
