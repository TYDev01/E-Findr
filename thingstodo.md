# EFindr — Things To Do

## Critical (broken or missing core flows)

- **Wire real search results into the results page** — `/app/events/[slug]/results/page.tsx` still renders mock data from `lib/mock-data.ts`. The backend `/api/public/events/:slug/search-face` already returns real matches; the frontend needs to read them (pass via query params, session storage, or a server action) and render them.
- **Download photo button on results page** — the Download button is static HTML with no action. Should trigger a signed-URL download of the full-res image.
- **Two-step access code flow on public search** — `PublicSearchForm` needs to gate the selfie upload behind an access code step when `requiresAccessCode` is true. Currently the form exists but the flow is unclear.

## Dashboard features

- **Edit event UI** — the backend supports `PATCH /api/events/:id` but there is no edit form in the dashboard. Add an edit sheet or modal on the event detail page to update title, description, location, date, access code, and visibility.
- **Delete individual photos** — the backend supports `DELETE /api/events/:id/photos/:photo_id` but there is no delete button next to photos in the gallery grid.
- **Reprocess failed photos** — if a photo ends up in `failed` status there is no way to retry. Add a retry button that hits the internal processing endpoint (or a new organizer-facing reprocess route).
- **Real-time processing status** — the gallery shows status as a static badge fetched at page load. Add polling (or a WebSocket) so badges update from `pending → processing → completed` without a manual refresh.
- **Export processing log** — the Export log button in the gallery panel has no action. Should download a CSV of photo filenames and their processing statuses for the event.
- **Search analytics panel** — the `search_logs` table is populated on every attendee search but nothing in the dashboard reads it. Add a simple panel showing total searches, unique attendees, and recent search timestamps per event.

## Backend gaps

- **Capture real request IP in search logs** — `request_ip` is hardcoded as `"unknown"` in `public.rs:204`. Extract from `X-Forwarded-For` or `ConnectInfo`.
- **Pagination on photo listing** — `GET /api/events/:id/photos` returns all photos with no limit. Add `?page=` and `?per_page=` query params.
- **Rate limiting on public search** — `/api/public/events/:slug/search-face` has no rate limit. Add per-IP throttling (e.g. via a Redis counter) to prevent abuse.
- **Similarity threshold config** — the cosine threshold `0.72` and confidence floor `0.75` are hardcoded in `public.rs`. Move to config so they can be tuned per deployment.
- **Bulk photo delete** — add `DELETE /api/events/:id/photos` accepting an array of photo IDs so organizers can clear a batch at once.
- **Organizer profile endpoint** — `GET /api/auth/me` returns the current user but there is no `PATCH /api/auth/me` to update name or password.

## AI service

- **Production face model swap** — `face_service.py` uses InsightFace `buffalo_l` with CPU provider. Document (or automate) the swap to GPU providers for production and add a config flag to select model size.
- **Graceful no-face handling on event photos** — when `process_event_photo` raises `FaceDetectionError` the worker marks the photo as `failed`. Consider a separate `no_face` status so organizers know the photo was processed but contained no identifiable faces.

## Frontend polish

- **Loading and error states on results page** — show a spinner while the search request is in flight and a clear error message if it fails or returns zero matches.
- **Attendee name field on search form** — the backend accepts `attendee_name` in the search multipart payload and logs it, but `PublicSearchForm` does not include a name input. Add an optional name field.
- **Event date and location display** — the event detail page shows `"Private location"` and `"Date pending"` as fallbacks. If values exist they should be formatted properly (e.g. locale date string, not raw ISO).
- **Responsive gallery grid** — the photo grid in the event detail page is `md:grid-cols-[96px,1fr,auto]` but collapses poorly on narrow screens. Review mobile layout.

## Infrastructure / ops

- **Email notification on processing complete** — notify the organizer when all queued photos for an event finish processing.
- **Worker retry logic** — the Redis worker drains jobs but has no dead-letter queue or retry cap. Add exponential backoff and a max-retry count before marking a job as permanently failed.
- **Health checks for AI and worker** — `GET /health` exists on the API but there is no liveness check for the Python AI service or the worker process in `docker-compose.yml`.
- **Environment variable validation at startup** — missing or malformed env vars (e.g. bad R2 endpoint) currently surface as runtime panics. Add an explicit validation step at boot with clear error messages.

- **Email Notification for registeration welcome message** - Users should receive notifications after account creation, otp for verification, forgot password email

- **Add sooner for alert messages** - Show an alert (success or error) message.