from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.db.base import Base
from app.db.session import engine
from app.db.session import get_db
from app.models.user import User
from app.models.ticket import Ticket
from app.models.asset import Asset

Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Smart IT Helpdesk & Asset Management API",
    description="Backend API for managing IT support tickets, assets, users, and ML-based ticket categorization.",
    version="1.0.0"
)
origins = [
    "http://localhost:5173",
    "http://localhost:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def root():
    return {
        "message": "Smart IT Helpdesk API is running successfully"
    }
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
@app.get("/db-test")
def test_database():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT current_database();"))
        database_name = result.scalar()
    return {
        "status": "Database connected successfully",
        "database": database_name
    }