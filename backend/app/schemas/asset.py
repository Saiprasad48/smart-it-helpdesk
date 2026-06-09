from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AssetCreate(BaseModel):
    asset_tag: str
    asset_type: str
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    status: str = "Active"

class AssetUpdate(BaseModel):
    asset_type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[str] = None

class AssetAssign(BaseModel):
    assigned_to: int

class AssetResponse(BaseModel):
    id: int
    asset_tag: str
    asset_type: str
    brand: Optional[str]
    model: Optional[str]
    serial_number: Optional[str]
    status: str
    assigned_to: Optional[int]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)