from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# We use SQLite for rapid prototyping. It will create a local file named dietpilot.db
SQLALCHEMY_DATABASE_URL = "sqlite:///./dietpilot.db"

# check_same_thread=False is required for SQLite and FastAPI to play nicely together
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# This creates a factory for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This Base class is what our models will inherit from
Base = declarative_base()