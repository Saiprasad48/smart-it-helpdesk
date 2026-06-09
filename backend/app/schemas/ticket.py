from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class TicketCreate(BaseModel):
    title: str
    description: str
    priority: str = "Medium"

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None

class TicketAssign(BaseModel):
    assigned_to: int

class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    priority: str
    status: str
    created_by: int
    assigned_to: Optional[int]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)