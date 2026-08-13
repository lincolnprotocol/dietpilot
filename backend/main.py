from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models, schemas
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

# Load environment variables securely from your .env file
load_dotenv()

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Generate database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DietPilot API")

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency: Opens a secure database session per request and closes it after
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
async def health_check():
    return {"status": "online", "message": "DietPilot API is secure and active."}

# --- AUTHENTICATION ENDPOINTS ---

@app.post("/api/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # 2. Create the user
    new_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=user.password # Placeholder for hashed password
    )
    
    # 3. Save to database securely
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/login")
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    # Verify user exists and password matches
    if not db_user or db_user.hashed_password != user.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {"message": "Login successful", "user_id": db_user.id, "name": db_user.name}

# --- AI ENDPOINTS ---

@app.post("/api/parse-meal")
async def parse_meal(request: schemas.MealQuery):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key missing on server")
        
    # Strict prompt engineering to ensure we get a clean JSON response
    prompt = f"""
    You are an expert nutritionist. Analyze this food query: "{request.query}".
    Extract the ingredients, estimate the weight in grams, and calculate the calories, protein, carbs, and fats.
    Return ONLY a valid JSON object matching this exact structure, with no markdown formatting or extra text:
    {{
      "meal_name": "Short descriptive title",
      "total_calories": 0,
      "total_protein": 0,
      "total_carbs": 0,
      "total_fats": 0,
      "ingredients": [
        {{ "name": "string", "weight": 0, "calories": 0 }}
      ]
    }}
    """
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Strip markdown code blocks just in case the AI adds them
        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        parsed_data = json.loads(raw_text)
        
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI parsing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)