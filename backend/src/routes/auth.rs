use axum::http::header;
use axum::{
    extract::{Request, State},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::query_as;
use uuid::Uuid;

use crate::{
    error::AppError,
    models::User,
    services::auth::{decode_token, encode_token, hash_password, verify_password},
    state::AppState,
};

#[derive(Deserialize)]
struct RegisterPayload {
    email: String,
    password: String,
    name: String,
}

#[derive(Deserialize)]
struct LoginPayload {
    email: String,
    password: String,
}

#[derive(Serialize)]
struct AuthResponse {
    token: String,
    user: UserSummary,
}

#[derive(Serialize)]
struct UserSummary {
    id: Uuid,
    email: String,
    name: String,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        .route("/api/auth/logout", post(logout))
        .route("/api/auth/me", get(me))
}

async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterPayload>,
) -> Result<Json<AuthResponse>, AppError> {
    let hash = hash_password(&payload.password)?;
    let user = query_as::<_, User>(
        "INSERT INTO users (id, email, password_hash, name)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, password_hash, name, created_at",
    )
    .bind(Uuid::new_v4())
    .bind(payload.email.to_lowercase())
    .bind(hash)
    .bind(payload.name)
    .fetch_one(&state.db)
    .await?;

    let token = encode_token(user.id, &user.email, &state.settings.jwt_secret)?;
    Ok(Json(AuthResponse {
        token,
        user: UserSummary {
            id: user.id,
            email: user.email,
            name: user.name,
        },
    }))
}

async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginPayload>,
) -> Result<Json<AuthResponse>, AppError> {
    let user = query_as::<_, User>(
        "SELECT id, email, password_hash, name, created_at FROM users WHERE email = $1",
    )
    .bind(payload.email.to_lowercase())
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::Unauthorized)?;

    if !verify_password(&payload.password, &user.password_hash)? {
        return Err(AppError::Unauthorized);
    }

    let token = encode_token(user.id, &user.email, &state.settings.jwt_secret)?;
    Ok(Json(AuthResponse {
        token,
        user: UserSummary {
            id: user.id,
            email: user.email,
            name: user.name,
        },
    }))
}

async fn logout() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "ok": true }))
}

async fn me(
    request: Request,
    State(state): State<AppState>,
) -> Result<Json<UserSummary>, AppError> {
    let token = bearer_token(&request).ok_or(AppError::Unauthorized)?;
    let claims = decode_token(token, &state.settings.jwt_secret)?;

    let user = query_as::<_, User>(
        "SELECT id, email, password_hash, name, created_at FROM users WHERE id = $1",
    )
    .bind(claims.sub)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::Unauthorized)?;

    Ok(Json(UserSummary {
        id: user.id,
        email: user.email,
        name: user.name,
    }))
}

fn bearer_token(request: &Request) -> Option<&str> {
    request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "))
}
