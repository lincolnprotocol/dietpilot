from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String) # We will hash passwords later using bcrypt
    
    # App State & Gamification
    account_points = Column(Integer, default=150)
    water_count = Column(Integer, default=0)
    
    # Relationships (Linking user to their logs and cards)
    meals = relationship("Meal", back_populates="owner")
    collectibles = relationship("Collectible", back_populates="owner")

class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    meal_name = Column(String, index=True)
    calories = Column(Integer)
    protein = Column(Integer)
    carbs = Column(Integer)
    fats = Column(Integer)
    time_logged = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="meals")

class Collectible(Base):
    __tablename__ = "collectibles"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(String) # Matches the frontend 'c1', 'c2' IDs
    name = Column(String)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="collectibles")