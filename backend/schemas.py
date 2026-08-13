from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- USER SCHEMAS ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    account_points: int
    water_count: int

    class Config:
        from_attributes = True

# --- AI MEAL LOG SCHEMAS ---
class MealQuery(BaseModel):
    query: str