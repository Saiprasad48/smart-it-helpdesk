from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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