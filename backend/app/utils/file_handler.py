import base64
import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".pdf"}


def get_upload_dir() -> Path:
    path = Path(settings.upload_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path


async def save_upload(file: UploadFile) -> tuple[str, str]:
    """Save an uploaded file and return (saved_path, original_filename)."""
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"File type {ext} not allowed. Allowed: {ALLOWED_EXTENSIONS}")

    unique_name = f"{uuid.uuid4()}{ext}"
    save_path = get_upload_dir() / unique_name

    content = await file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise ValueError(f"File too large. Max size: {settings.max_upload_size_mb}MB")

    with open(save_path, "wb") as f:
        f.write(content)

    return str(save_path), file.filename


def file_to_base64(file_path: str) -> tuple[str, str]:
    """Read a file and return (base64_data, media_type)."""
    ext = Path(file_path).suffix.lower()
    media_type_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".bmp": "image/bmp",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
    }
    media_type = media_type_map.get(ext, "application/octet-stream")

    with open(file_path, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode("utf-8")

    return data, media_type


def delete_file(file_path: str) -> None:
    """Delete a file if it exists."""
    if os.path.exists(file_path):
        os.remove(file_path)
