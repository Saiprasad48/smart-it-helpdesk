from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.asset import Asset
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.analytics import DashboardSummary, CountItem

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

def require_staff_or_admin(current_user: User):
    if current_user.role not in ["it_staff", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only IT staff or admin can view analytics"
        )

def get_grouped_counts(db: Session, model, column):
    results = (
        db.query(column, func.count(model.id))
        .group_by(column)
        .all()
    )
    return [
        CountItem(name=row[0] if row[0] else "Unknown", count=row[1])
        for row in results
    ]

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_staff_or_admin(current_user)
    total_tickets = db.query(Ticket).count()
    open_tickets = db.query(Ticket).filter(Ticket.status == "Open").count()
    in_progress_tickets = db.query(Ticket).filter(Ticket.status == "In Progress").count()
    resolved_tickets = db.query(Ticket).filter(Ticket.status == "Resolved").count()
    closed_tickets = db.query(Ticket).filter(Ticket.status == "Closed").count()
    total_assets = db.query(Asset).count()
    active_assets = db.query(Asset).filter(Asset.status == "Active").count()
    assigned_assets = db.query(Asset).filter(Asset.status == "Assigned").count()
    damaged_assets = db.query(Asset).filter(Asset.status == "Damaged").count()
    retired_assets = db.query(Asset).filter(Asset.status == "Retired").count()
    tickets_by_category = get_grouped_counts(db, Ticket, Ticket.category)
    tickets_by_priority = get_grouped_counts(db, Ticket, Ticket.priority)
    tickets_by_status = get_grouped_counts(db, Ticket, Ticket.status)
    assets_by_status = get_grouped_counts(db, Asset, Asset.status)
    return DashboardSummary(
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        in_progress_tickets=in_progress_tickets,
        resolved_tickets=resolved_tickets,
        closed_tickets=closed_tickets,
        total_assets=total_assets,
        active_assets=active_assets,
        assigned_assets=assigned_assets,
        damaged_assets=damaged_assets,
        retired_assets=retired_assets,
        tickets_by_category=tickets_by_category,
        tickets_by_priority=tickets_by_priority,
        tickets_by_status=tickets_by_status,
        assets_by_status=assets_by_status
    )