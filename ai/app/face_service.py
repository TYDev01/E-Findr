from __future__ import annotations

import base64
import io
from dataclasses import dataclass

import cv2
import httpx
import numpy as np
from insightface.app import FaceAnalysis
from PIL import Image

from .errors import FaceDetectionError
from .schemas import FaceBox, FaceEmbeddingResponse

_analyzer: FaceAnalysis | None = None


def _get_analyzer() -> FaceAnalysis:
    global _analyzer
    if _analyzer is None:
        _analyzer = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
        _analyzer.prepare(ctx_id=0, det_size=(640, 640))
    return _analyzer


def _load_from_base64(b64: str) -> np.ndarray:
    img_bytes = base64.b64decode(b64)
    pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    return cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)


def _load_from_url(url: str) -> np.ndarray:
    resp = httpx.get(url, timeout=20, follow_redirects=True)
    resp.raise_for_status()
    pil = Image.open(io.BytesIO(resp.content)).convert("RGB")
    return cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)


def _to_response(face, total_faces: int) -> FaceEmbeddingResponse:
    x1, y1, x2, y2 = face.bbox.astype(int)
    return FaceEmbeddingResponse(
        embedding=face.normed_embedding.tolist(),
        face_box=FaceBox(x=int(x1), y=int(y1), width=int(x2 - x1), height=int(y2 - y1)),
        confidence=float(face.det_score),
        faces_detected=total_faces,
    )


@dataclass
class DetectionResult:
    embeddings: list[FaceEmbeddingResponse]


class FaceService:
    def extract_single_face(self, image_source: str) -> FaceEmbeddingResponse:
        try:
            img = _load_from_base64(image_source)
        except Exception:
            img = _load_from_url(image_source)

        faces = _get_analyzer().get(img)

        if len(faces) == 0:
            raise FaceDetectionError(
                "no_face_detected",
                "No face found. Upload a clear selfie with your full face visible.",
            )
        if len(faces) > 1:
            raise FaceDetectionError(
                "multiple_faces_detected",
                "Multiple faces detected. Upload a photo with only yourself.",
            )

        return _to_response(faces[0], total_faces=1)

    def process_event_photo(self, image_url: str, photo_id: str, event_id: str) -> DetectionResult:
        img = _load_from_url(image_url)
        faces = _get_analyzer().get(img)

        if len(faces) == 0:
            raise FaceDetectionError("no_face_detected", "No faces detected in the event photo.")

        return DetectionResult(embeddings=[_to_response(f, total_faces=len(faces)) for f in faces])
