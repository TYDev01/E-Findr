# EFindr

EFindr is an AI event photo finder MVP for organizers who need private event galleries and attendees who want a fast selfie-based photo search. The stack is split across a Next.js frontend, a Rust Axum API, and a Python FastAPI AI worker.

## Architecture

- `frontend/`: Next.js 15 app router UI with organizer login/register forms, cookie-backed session gating for dashboard routes, attendee search flow, and a stronger branded visual system.
- `backend/`: Rust Axum API with auth, event CRUD, multipart uploads, internal photo processing, signed Cloudflare R2 access, and event-scoped face search.
- `worker`: Dedicated Rust queue worker that drains Redis and triggers the protected internal photo-processing endpoint.
- `ai/`: FastAPI service exposing face embedding and event photo processing contracts with deterministic local-development behavior and explicit no-face / multi-face errors.
- `docker-compose.yml`: Local orchestration for frontend, API, worker, AI service, PostgreSQL + pgvector, and Redis.

## Cloudflare R2

This implementation is configured for Cloudflare R2 instead of MinIO.

- `R2_ENDPOINT` should point to your account endpoint, for example `https://<account-id>.r2.cloudflarestorage.com`
- `R2_REGION` should typically be `auto` for Cloudflare R2
- `R2_BUCKET` is the bucket storing originals and thumbnails
- `R2_PUBLIC_BASE_URL` can point to your public R2 dev URL or custom domain for signed / proxied delivery
- `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` should be provisioned from Cloudflare
- `SIGNED_URL_TTL_SECONDS` controls presigned asset lifetime for organizer and attendee results
- `INTERNAL_API_URL` is used by the queue worker to call the API’s protected internal processing route

## Local setup

1. Copy `.env.example` to `.env` and fill in secrets, especially the R2 values and JWT secret.
2. Start the stack with `docker compose up --build`.
3. Frontend runs on `http://localhost:3000`, API on `http://localhost:8080`, AI service on `http://localhost:8001`.
4. The worker runs automatically in Docker Compose and will start processing queued photo jobs after uploads land.

## Product coverage

- Organizer registration and login endpoints
- Cookie-backed organizer session handling in the frontend
- Event creation, listing, detail, update, and deletion routes bound to the authenticated organizer
- Multipart event photo upload with validation, thumbnailing, Redis queue push, and internal AI processing trigger
- Dedicated Redis worker that processes queued photo jobs out-of-band instead of inline from the upload request
- Public event page and attendee selfie search flow using multipart upload instead of external selfie URLs
- Privacy notice and event-scoped search contract
- PostgreSQL schema with `pgvector` extension and ivfflat cosine index
- Redis-backed background processing shape for photo indexing
- Cloudflare R2 upload and signed delivery flow for image storage

## Current implementation notes

- The AI service currently uses deterministic embeddings for local development and testability. Replace `ai/app/face_service.py` with InsightFace or DeepFace integration in production.
- The upload route stores originals and thumbnails in R2, records metadata in PostgreSQL, and pushes Redis jobs for the dedicated worker.
- The frontend dashboard and public event page now fetch live API data when available and fall back safely when the backend is empty or offline.
- The frontend now protects `/dashboard` routes by checking `/api/auth/me` against a session cookie set at login/registration.
- Backend event and photo routes now derive organizer identity from the JWT instead of trusting `organizer_id` from the client payload.
- Public attendee search remains event-scoped, while organizer APIs are now ownership-scoped.
- The internal processing route now requires the shared `INTERNAL_SERVICE_TOKEN`, so only the worker can hit it.

## Testing

- Python AI tests: `cd ai && pytest`
- Rust auth unit test: `cd backend && cargo test`
- Frontend lint/build: `cd frontend && npm run build`

## Key files

- [frontend/app/page.tsx](/home/tony/Desktop/Dev/EFindr/frontend/app/page.tsx)
- [frontend/app/dashboard/events/[id]/page.tsx](/home/tony/Desktop/Dev/EFindr/frontend/app/dashboard/events/[id]/page.tsx)
- [backend/src/main.rs](/home/tony/Desktop/Dev/EFindr/backend/src/main.rs)
- [backend/migrations/001_init.sql](/home/tony/Desktop/Dev/EFindr/backend/migrations/001_init.sql)
- [ai/app/main.py](/home/tony/Desktop/Dev/EFindr/ai/app/main.py)
