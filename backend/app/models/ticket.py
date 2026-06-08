from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, default="Other")
    priority = Column(String, default="Medium")
    status = Column(String, default="Open")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    created_by_user = relationship(
        "User",
        back_populates="tickets",
        foreign_keys=[created_by]
    )
    assigned_to_user = relationship(
        "User",
        back_populates="assigned_tickets",
        foreign_keys=[assigned_to]
    )