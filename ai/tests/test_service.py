from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_no_face_error() -> None:
    response = client.post(
        "/extract-face-embedding",
        json={"image_url": "https://example.com/no-face.jpg"},
    )
    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "no_face_detected"


def test_multiple_faces_error() -> None:
    response = client.post(
        "/extract-face-embedding",
        json={"image_url": "https://example.com/multi-face.jpg"},
    )
    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "multiple_faces_detected"


def test_event_photo_processing() -> None:
    response = client.post(
        "/process-event-photo",
        json={
            "photo_id": "photo-1",
            "event_id": "event-1",
            "image_url": "https://example.com/crowd-shot.jpg",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert len(body["embeddings"]) == 2


def test_base64_face_extraction() -> None:
    response = client.post(
        "/extract-face-embedding",
        json={"image_base64": "ZmFrZS1zZWxmaWU="},
    )
    assert response.status_code == 200
    assert response.json()["faces_detected"] == 1
