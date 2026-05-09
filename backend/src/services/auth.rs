use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use async_trait::async_trait;
use axum::{
    extract::FromRequestParts,
    http::{header, request::Parts},
};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{error::AppError, models::User, state::AppState};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: Uuid,
    pub email: String,
    pub exp: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuthenticatedUser {
    pub id: Uuid,
    pub email: String,
    pub name: String,
}

pub fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|_| AppError::Internal)
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool, AppError> {
    let parsed = PasswordHash::new(hash).map_err(|_| AppError::Internal)?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok())
}

pub fn encode_token(user_id: Uuid, email: &str, secret: &str) -> Result<String, AppError> {
    let claims = Claims {
        sub: user_id,
        email: email.to_owned(),
        exp: (Utc::now() + Duration::days(7)).timestamp(),
    };
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|_| AppError::Internal)
}

pub fn decode_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| AppError::Unauthorized)?;

    Ok(data.claims)
}

pub fn bearer_token_from_headers(headers: &http::HeaderMap) -> Option<&str> {
    headers
        .get(header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "))
}

impl From<User> for AuthenticatedUser {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            email: user.email,
            name: user.name,
        }
    }
}

#[async_trait]
impl FromRequestParts<AppState> for AuthenticatedUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let token = bearer_token_from_headers(&parts.headers).ok_or(AppError::Unauthorized)?;
        let claims = decode_token(token, &state.settings.jwt_secret)?;

        let user = sqlx::query_as::<_, User>(
            "SELECT id, email, password_hash, name, created_at FROM users WHERE id = $1",
        )
        .bind(claims.sub)
        .fetch_optional(&state.db)
        .await?
        .ok_or(AppError::Unauthorized)?;

        Ok(user.into())
    }
}
