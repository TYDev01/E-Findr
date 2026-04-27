use std::{io::Cursor, time::Duration};

use aws_config::BehaviorVersion;
use aws_sdk_s3::{
    config::{Builder as S3ConfigBuilder, Credentials, Region},
    presigning::PresigningConfig,
    primitives::ByteStream,
    Client as S3Client,
};
use image::{GenericImageView, ImageFormat};
use uuid::Uuid;

use crate::{error::AppError, models::Photo, models::PhotoView, state::AppState};

const MAX_UPLOAD_BYTES: usize = 15 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES: &[&str] = &["image/jpeg", "image/png", "image/webp"];

pub async fn build_s3_client(state: &AppState) -> S3Client {
    let shared = aws_config::defaults(BehaviorVersion::latest())
        .region(Region::new(state.settings.r2_region.clone()))
        .credentials_provider(Credentials::new(
            state.settings.r2_access_key_id.clone(),
            state.settings.r2_secret_access_key.clone(),
            None,
            None,
            "efindr-r2",
        ))
        .load()
        .await;

    let config = S3ConfigBuilder::from(&shared)
        .endpoint_url(state.settings.r2_endpoint.clone())
        .force_path_style(true)
        .build();

    S3Client::from_conf(config)
}

pub fn validate_upload(
    file_name: &str,
    content_type: &str,
    size_bytes: usize,
) -> Result<(), AppError> {
    if size_bytes == 0 {
        return Err(AppError::BadRequest("Uploaded file is empty.".into()));
    }

    if size_bytes > MAX_UPLOAD_BYTES {
        return Err(AppError::BadRequest(
            "Image exceeds the 15MB upload limit.".into(),
        ));
    }

    if !ALLOWED_CONTENT_TYPES.contains(&content_type) {
        return Err(AppError::BadRequest(
            "Unsupported file type. Use JPG, PNG, or WEBP.".into(),
        ));
    }

    let lower = file_name.to_lowercase();
    if !(lower.ends_with(".jpg")
        || lower.ends_with(".jpeg")
        || lower.ends_with(".png")
        || lower.ends_with(".webp"))
    {
        return Err(AppError::BadRequest(
            "File extension must be JPG, JPEG, PNG, or WEBP.".into(),
        ));
    }

    Ok(())
}

pub async fn upload_photo_assets(
    state: &AppState,
    event_id: Uuid,
    photo_id: Uuid,
    file_name: &str,
    content_type: &str,
    bytes: &[u8],
) -> Result<(String, String, Option<i32>, Option<i32>), AppError> {
    let client = build_s3_client(state).await;
    let original_key = format!(
        "events/{event_id}/photos/{photo_id}/{}",
        sanitize_filename(file_name)
    );
    let thumbnail_key = format!("events/{event_id}/thumbnails/{photo_id}.jpg");

    client
        .put_object()
        .bucket(&state.settings.r2_bucket)
        .key(&original_key)
        .content_type(content_type)
        .body(ByteStream::from(bytes.to_vec()))
        .send()
        .await
        .map_err(|_| AppError::Internal)?;

    let image = image::load_from_memory(bytes)
        .map_err(|_| AppError::BadRequest("Invalid image data.".into()))?;
    let (width, height) = image.dimensions();
    let thumbnail = image.thumbnail(640, 640);
    let mut thumbnail_bytes = Vec::new();
    thumbnail
        .write_to(&mut Cursor::new(&mut thumbnail_bytes), ImageFormat::Jpeg)
        .map_err(|_| AppError::Internal)?;

    client
        .put_object()
        .bucket(&state.settings.r2_bucket)
        .key(&thumbnail_key)
        .content_type("image/jpeg")
        .body(ByteStream::from(thumbnail_bytes))
        .send()
        .await
        .map_err(|_| AppError::Internal)?;

    Ok((
        original_key,
        thumbnail_key,
        Some(width as i32),
        Some(height as i32),
    ))
}

pub async fn signed_asset_url(state: &AppState, key: &str) -> Result<String, AppError> {
    let client = build_s3_client(state).await;
    let presigned = client
        .get_object()
        .bucket(&state.settings.r2_bucket)
        .key(key)
        .presigned(
            PresigningConfig::expires_in(Duration::from_secs(
                state.settings.signed_url_ttl_seconds,
            ))
            .map_err(|_| AppError::Internal)?,
        )
        .await
        .map_err(|_| AppError::Internal)?;

    Ok(presigned.uri().to_string())
}

pub async fn photo_to_view(state: &AppState, photo: &Photo) -> Result<PhotoView, AppError> {
    Ok(PhotoView {
        id: photo.id,
        original_filename: photo.original_filename.clone(),
        processing_status: photo.processing_status.clone(),
        created_at: photo.created_at,
        thumbnail_url: signed_asset_url(state, &photo.thumbnail_key).await?,
        image_url: signed_asset_url(state, &photo.storage_key).await?,
    })
}

fn sanitize_filename(file_name: &str) -> String {
    file_name
        .chars()
        .map(|character| match character {
            'a'..='z' | 'A'..='Z' | '0'..='9' | '.' | '-' | '_' => character,
            _ => '-',
        })
        .collect()
}
