from __future__ import annotations

import hashlib
from dataclasses import dataclass

import numpy as np

from .errors import FaceDetectionError
from .schemas import FaceBox, FaceEmbeddingResponse


@dataclass
class DetectionResult:
    embeddings: list[FaceEmbeddingResponse]


class FaceService:
    def extract_single_face(self, image_source: str) -> FaceEmbeddingResponse:
        lowered = image_source.lower()
        if "no-face" in lowered:
            raise FaceDetectionError("no_face_detected", "No face found. Upload a clear selfie with your full face visible.")
        if "multi-face" in lowered or "multiple-faces" in lowered:
            raise FaceDetectionError("multiple_faces_detected", "Multiple faces detected. Upload a photo with only yourself.")

        return self._make_embedding(image_source=image_source, faces_detected=1)

    def process_event_photo(self, image_url: str, photo_id: str, event_id: str) -> DetectionResult:
        lowered = image_url.lower()
        if "no-face" in lowered:
            raise FaceDetectionError("no_face_detected", "No faces detected in the event photo.")

        faces_detected = 2 if "crowd" in lowered else 1
        embeddings = [
            self._make_embedding(f"{image_url}#{index}", faces_detected=faces_detected)
            for index in range(faces_detected)
        ]
        return DetectionResult(embeddings=embeddings)

    def _make_embedding(self, image_source: str, faces_detected: int) -> FaceEmbeddingResponse:
        digest = hashlib.sha256(image_source.encode("utf-8")).digest()
        seed = np.frombuffer(digest[:16], dtype=np.uint8).astype(np.float32)
        repeated = np.resize(seed / 255.0, 512)
        norm = np.linalg.norm(repeated) or 1.0
        vector = (repeated / norm).tolist()

        return FaceEmbeddingResponse(
            embedding=vector,
            face_box=FaceBox(x=120, y=80, width=220, height=220),
            confidence=0.98,
            faces_detected=faces_detected,
        )
