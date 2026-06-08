from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.db.base import Base

class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String, unique=True, index=True, nullable=False)
    asset_type = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    model = Column(String, nullable=True)
    serial_number = Column(String, unique=True, nullable=True)
    status = Column(String, default="Active")
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)