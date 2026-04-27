from fastapi import FastAPI, HTTPException

from .errors import FaceDetectionError
from .face_service import FaceService
from .schemas import (
    ExtractFaceEmbeddingRequest,
    FaceEmbeddingResponse,
    ProcessEventPhotoRequest,
    ProcessEventPhotoResponse,
)

app = FastAPI(title="EFindr AI Service", version="0.1.0")
service = FaceService()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "efindr-ai"}


@app.post("/extract-face-embedding", response_model=FaceEmbeddingResponse)
def extract_face_embedding(payload: ExtractFaceEmbeddingRequest) -> FaceEmbeddingResponse:
    try:
        return service.extract_single_face(payload.image_base64 or str(payload.image_url))
    except FaceDetectionError as exc:
        raise HTTPException(status_code=422, detail={"code": exc.code, "message": exc.message}) from exc


@app.post("/process-event-photo", response_model=ProcessEventPhotoResponse)
def process_event_photo(payload: ProcessEventPhotoRequest) -> ProcessEventPhotoResponse:
    try:
        result = service.process_event_photo(str(payload.image_url), payload.photo_id, payload.event_id)
    except FaceDetectionError as exc:
        raise HTTPException(status_code=422, detail={"code": exc.code, "message": exc.message}) from exc

    return ProcessEventPhotoResponse(
        photo_id=payload.photo_id,
        event_id=payload.event_id,
        embeddings=result.embeddings,
        status="completed",
    )
