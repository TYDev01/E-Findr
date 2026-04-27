use chrono::{DateTime, Utc};
use pgvector::Vector;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Event {
    pub id: Uuid,
    pub organizer_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub location: Option<String>,
    pub event_date: Option<DateTime<Utc>>,
    pub slug: String,
    pub access_code_hash: Option<String>,
    pub is_private: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EventView {
    pub id: Uuid,
    pub organizer_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub location: Option<String>,
    pub event_date: Option<DateTime<Utc>>,
    pub slug: String,
    pub is_private: bool,
    pub requires_access_code: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Photo {
    pub id: Uuid,
    pub event_id: Uuid,
    pub storage_key: String,
    pub thumbnail_key: String,
    pub original_filename: String,
    pub mime_type: String,
    pub size_bytes: i64,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub processing_status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchMatch {
    pub photo_id: Uuid,
    pub thumbnail_url: String,
    pub image_url: String,
    pub similarity_score: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PhotoView {
    pub id: Uuid,
    pub original_filename: String,
    pub processing_status: String,
    pub created_at: DateTime<Utc>,
    pub thumbnail_url: String,
    pub image_url: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct FaceEmbedding {
    pub id: Uuid,
    pub photo_id: Uuid,
    pub event_id: Uuid,
    pub embedding: Vector,
    pub face_box: serde_json::Value,
    pub confidence: f32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UploadResponse {
    pub uploaded: Vec<PhotoView>,
    pub queued_jobs: usize,
}

impl From<Event> for EventView {
    fn from(event: Event) -> Self {
        Self {
            id: event.id,
            organizer_id: event.organizer_id,
            title: event.title,
            description: event.description,
            location: event.location,
            event_date: event.event_date,
            slug: event.slug,
            is_private: event.is_private,
            requires_access_code: event.access_code_hash.is_some(),
            created_at: event.created_at,
            updated_at: event.updated_at,
        }
    }
}
