FROM rust:1.91-slim-bookworm AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./
COPY src src
COPY migrations migrations
RUN cargo build --release --bins

FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/efindr-api /usr/local/bin/efindr-api
COPY --from=builder /app/target/release/worker /usr/local/bin/efindr-worker
EXPOSE 8080
CMD ["efindr-api"]
