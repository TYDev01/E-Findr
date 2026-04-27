mod config;
mod error;
mod models;
mod routes;
mod services;
mod state;
#[cfg(test)]
mod tests;

use std::net::SocketAddr;

use axum::{routing::get, Router};
use config::Settings;
use state::AppState;
use tower_http::{
    cors::{Any, CorsLayer},
    limit::RequestBodyLimitLayer,
    timeout::TimeoutLayer,
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info,sqlx=warn".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let settings = Settings::from_env();
    let state = AppState::new(settings.clone()).await.expect("state");
    sqlx::migrate!("./migrations")
        .run(&state.db)
        .await
        .expect("migrations");

    let cors = CorsLayer::new()
        .allow_origin(
            settings
                .frontend_origin
                .parse::<http::HeaderValue>()
                .unwrap(),
        )
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(|| async { "EFindr API" }))
        .merge(routes::health::router())
        .merge(routes::auth::router())
        .merge(routes::events::router())
        .merge(routes::internal::router())
        .merge(routes::public::router())
        .layer(TraceLayer::new_for_http())
        .layer(RequestBodyLimitLayer::new(20 * 1024 * 1024))
        .layer(TimeoutLayer::new(std::time::Duration::from_secs(30)))
        .layer(cors)
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    tracing::info!("listening on {addr}");
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind");
    axum::serve(listener, app).await.expect("server");
}
