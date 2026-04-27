from pydantic import BaseModel, HttpUrl, model_validator


class ExtractFaceEmbeddingRequest(BaseModel):
    image_url: HttpUrl | None = None
    image_base64: str | None = None
    event_id: str | None = None

    @model_validator(mode="after")
    def require_image_source(self) -> "ExtractFaceEmbeddingRequest":
        if not self.image_url and not self.image_base64:
            raise ValueError("Either image_url or image_base64 is required.")
        return self


class ProcessEventPhotoRequest(BaseModel):
    photo_id: str
    image_url: HttpUrl
    event_id: str


class FaceBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


class FaceEmbeddingResponse(BaseModel):
    embedding: list[float]
    face_box: FaceBox
    confidence: float
    faces_detected: int


class ProcessEventPhotoResponse(BaseModel):
    photo_id: str
    event_id: str
    embeddings: list[FaceEmbeddingResponse]
    status: str
