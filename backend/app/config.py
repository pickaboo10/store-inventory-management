from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/store_inventory"
    secret_key: str = "8c2a9c336b1d4ef68ef6187768564b73b5b158ee9d4f2b96316279f688e147d3"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
