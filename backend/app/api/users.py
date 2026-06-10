from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

def require_staff_or_admin(current_user: User):
    if current_user.role not in ["it_staff", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only IT staff or admin can view users"
        )

@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_staff_or_admin(current_user)
    return db.query(User).order_by(User.full_name.asc()).all()

@router.get("/staff", response_model=list[UserResponse])
def get_staff_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_staff_or_admin(current_user)
    return (
        db.query(User)
        .filter(User.role.in_(["it_staff", "admin"]))
        .order_by(User.full_name.asc())
        .all()
    )