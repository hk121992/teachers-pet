from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    database_url: str = "sqlite:///./teachers_pet.db"
    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 10

    model_config = {"env_file": ".env"}


settings = Settings()
