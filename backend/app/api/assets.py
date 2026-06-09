from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.asset import Asset
from app.models.user import User
from app.schemas.asset import (
    AssetCreate,
    AssetUpdate,
    AssetAssign,
    AssetResponse
)
router = APIRouter(
    prefix="/assets",
    tags=["Assets"]
)

def require_staff_or_admin(current_user: User):
    if current_user.role not in ["it_staff", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only IT staff or admin can perform this action"
        )

@router.post("/", response_model=AssetResponse)
def create_asset(
    asset_data: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_staff_or_admin(current_user)
    existing_asset = db.query(Asset).filter(
        Asset.asset_tag == asset_data.asset_tag
    ).first()
    if existing_asset:
        raise HTTPException(
            status_code=400,
            detail="Asset with this asset tag already exists"
        )
    if asset_data.serial_number:
        existing_serial = db.query(Asset).filter(
            Asset.serial_number == asset_data.serial_number
        ).first()
        if existing_serial:
            raise HTTPException(
                status_code=400,
                detail="Asset with this serial number already exists"
            )
    new_asset = Asset(
        asset_tag=asset_data.asset_tag,
        asset_type=asset_data.asset_type,
        brand=asset_data.brand,
        model=asset_data.model,
        serial_number=asset_data.serial_number,
        status=asset_data.status
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

@router.get("/", response_model=list[AssetResponse])
def get_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role in ["it_staff", "admin"]:
        return db.query(Asset).order_by(Asset.created_at.desc()).all()
    return db.query(Asset).filter(
        Asset.assigned_to == current_user.id
    ).order_by(Asset.created_at.desc()).all()

@router.get("/my-assets", response_model=list[AssetResponse])
def get_my_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Asset).filter(
        Asset.assigned_to == current_user.id
    ).order_by(Asset.created_at.desc()).all()

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset_by_id(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )
    if current_user.role not in ["it_staff", "admin"]:
        if asset.assigned_to != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view assets assigned to you"
            )
    return asset

@router.patch("/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int,
    asset_update: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_staff_or_admin(current_user)
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )
    if asset_update.asset_type is not None:
        asset.asset_type = asset_update.asset_type
    if asset_update.brand is not None:
        asset.brand = asset_update.brand
    if asset_update.model is not None:
        asset.model = asset_update.model
    if asset_update.serial_number is not None:
        asset.serial_number = asset_update.serial_number
    if asset_update.status is not None:
        asset.status = asset_update.status
    db.commit()
    db.refresh(asset)
    return asset

@router.patch("/{asset_id}/assign", response_model=AssetResponse)
def assign_asset(
    asset_id: int,
    assign_data: AssetAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_staff_or_admin(current_user)
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )
    assigned_user = db.query(User).filter(
        User.id == assign_data.assigned_to
    ).first()
    if not assigned_user:
        raise HTTPException(
            status_code=404,
            detail="Assigned user not found"
        )
    asset.assigned_to = assigned_user.id
    asset.status = "Assigned"
    db.commit()
    db.refresh(asset)
    return asset