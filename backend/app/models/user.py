from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student")
    # allowed roles: student, it_staff, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    tickets = relationship(
        "Ticket",
        back_populates="created_by_user",
        foreign_keys="Ticket.created_by"
    )
    assigned_tickets = relationship(
        "Ticket",
        back_populates="assigned_to_user",
        foreign_keys="Ticket.assigned_to"
    )