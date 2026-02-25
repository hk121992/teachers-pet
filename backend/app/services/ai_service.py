import anthropic

from app.config import settings


def get_client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


def chat(system_prompt: str, user_message: str) -> str:
    """Simple text chat with Claude."""
    client = get_client()
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )
    return response.content[0].text


def vision_chat(system_prompt: str, user_text: str, image_data: str, media_type: str) -> str:
    """Send an image + text to Claude Vision."""
    client = get_client()

    image_content = {
        "type": "image",
        "source": {
            "type": "base64",
            "media_type": media_type,
            "data": image_data,
        },
    }

    # PDFs use document type instead of image
    if media_type == "application/pdf":
        image_content = {
            "type": "document",
            "source": {
                "type": "base64",
                "media_type": media_type,
                "data": image_data,
            },
        }

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": [
                    image_content,
                    {"type": "text", "text": user_text},
                ],
            }
        ],
    )
    return response.content[0].text
