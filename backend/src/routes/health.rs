use axum::{extract::State, routing::get, Json, Router};
use serde::Serialize;

use crate::state::AppState;

#[derive(Serialize)]
struct HealthResponse<'a> {
    status: &'a str,
    service: &'a str,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/health", get(health))
        .route("/internal/health", get(internal_health))
}

async fn health() -> Json<HealthResponse<'static>> {
    Json(HealthResponse {
        status: "ok",
        service: "efindr-api",
    })
}

async fn internal_health(State(state): State<AppState>) -> Json<HealthResponse<'static>> {
    let _ = sqlx::query("SELECT 1").execute(&state.db).await;
    Json(HealthResponse {
        status: "ok",
        service: "efindr-api-internal",
    })
}
