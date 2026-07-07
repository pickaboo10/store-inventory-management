from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import logging
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

db_url = settings.database_url
engine = None

try:
    # Try connecting to the configured database URL
    if db_url.startswith("postgresql"):
        # We can add a connect timeout so it doesn't hang forever if the postgres database is offline
        engine = create_engine(db_url, connect_args={"connect_timeout": 3})
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info("Successfully connected to PostgreSQL database.")
    else:
        engine = create_engine(db_url, connect_args={"check_same_thread": False} if "sqlite" in db_url else {})
        logger.info(f"Connected to database: {db_url}")
except Exception as e:
    logger.warning(f"Failed to connect to database at {db_url}: {e}")
    logger.warning("Falling back to local SQLite database (sqlite:///./store_inventory.db) for evaluation/testing.")
    db_url = "sqlite:///./store_inventory.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
