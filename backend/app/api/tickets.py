from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.ticket import Ticket
from app.models.user import User
from app.services.ticket_classifier import predict_ticket_category
from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate,
    TicketAssign,
    TicketResponse
)
router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"]
)

def require_staff_or_admin(current_user: User):
    if current_user.role not in ["it_staff", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only IT staff or admin can perform this action"
        )

@router.post("/", response_model=TicketResponse)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    predicted_category = predict_ticket_category(
        ticket_data.title,
        ticket_data.description
    )

    new_ticket = Ticket(
        title=ticket_data.title,
        description=ticket_data.description,
        priority=ticket_data.priority,
        category=predicted_category,
        created_by=current_user.id
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket

@router.get("/", response_model=list[TicketResponse])
def get_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role in ["it_staff", "admin"]:
        return db.query(Ticket).order_by(Ticket.created_at.desc()).all()
    return db.query(Ticket).filter(
        Ticket.created_by == current_user.id
    ).order_by(Ticket.created_at.desc()).all()

@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket_by_id(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )
    if current_user.role not in ["it_staff", "admin"]:
        if ticket.created_by != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own tickets"
            )
    return ticket

@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    ticket_update: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_staff_or_admin(current_user)
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )
    if ticket_update.status is not None:
        ticket.status = ticket_update.status
    if ticket_update.priority is not None:
        ticket.priority = ticket_update.priority
    if ticket_update.category is not None:
        ticket.category = ticket_update.category
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    return ticket

@router.patch("/{ticket_id}/assign", response_model=TicketResponse)
def assign_ticket(
    ticket_id: int,
    assign_data: TicketAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_staff_or_admin(current_user)
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )
    assigned_user = db.query(User).filter(
        User.id == assign_data.assigned_to
    ).first()
    if not assigned_user:
        raise HTTPException(
            status_code=404,
            detail="Assigned user not found"
        )
    if assigned_user.role not in ["it_staff", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Ticket can only be assigned to IT staff or admin"
        )
    ticket.assigned_to = assigned_user.id
    ticket.status = "In Progress"
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)
    return ticket