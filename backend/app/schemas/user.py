from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str
    role: Literal["student", "it_staff", "admin"] = "student"
class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
class Token(BaseModel):
    access_token: str
    token_type: str