from datetime import datetime
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.asset import Asset
from app.models.ticket import Ticket
from app.models.user import User
from app.services.ticket_classifier import predict_ticket_category

Base.metadata.create_all(bind=engine)

def get_or_create_user(db, full_name, email, password, role):
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(
        full_name=full_name,
        email=email,
        hashed_password=get_password_hash(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_or_create_ticket(db, title, description, priority, created_by, assigned_to=None, status="Open"):
    existing_ticket = db.query(Ticket).filter(Ticket.title == title).first()
    if existing_ticket:
        return existing_ticket
    category = predict_ticket_category(title, description)
    ticket = Ticket(
        title=title,
        description=description,
        priority=priority,
        category=category,
        status=status,
        created_by=created_by,
        assigned_to=assigned_to,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

def get_or_create_asset(
    db,
    asset_tag,
    asset_type,
    brand,
    model,
    serial_number,
    status,
    assigned_to=None,
):
    existing_asset = db.query(Asset).filter(Asset.asset_tag == asset_tag).first()
    if existing_asset:
        return existing_asset
    asset = Asset(
        asset_tag=asset_tag,
        asset_type=asset_type,
        brand=brand,
        model=model,
        serial_number=serial_number,
        status=status,
        assigned_to=assigned_to,
        created_at=datetime.utcnow(),
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

def seed_database():
    db = SessionLocal()
    try:
        admin = get_or_create_user(
            db=db,
            full_name="Demo Admin",
            email="admin.demo@example.com",
            password="Password123",
            role="admin",
        )
        it_staff = get_or_create_user(
            db=db,
            full_name="Demo IT Staff",
            email="it.staff@example.com",
            password="Password123",
            role="it_staff",
        )
        student = get_or_create_user(
            db=db,
            full_name="Demo Student",
            email="student.demo@example.com",
            password="Password123",
            role="student",
        )
        get_or_create_ticket(
            db=db,
            title="Cannot connect to campus WiFi",
            description="My laptop is unable to connect to the campus WiFi network in the library.",
            priority="High",
            created_by=student.id,
            assigned_to=it_staff.id,
            status="In Progress",
        )
        get_or_create_ticket(
            db=db,
            title="Forgot student portal password",
            description="I cannot login to my student account and need a password reset.",
            priority="Critical",
            created_by=student.id,
            assigned_to=it_staff.id,
            status="Open",
        )
        get_or_create_ticket(
            db=db,
            title="Laptop screen flickering",
            description="The laptop display keeps flickering and has horizontal lines.",
            priority="Medium",
            created_by=student.id,
            assigned_to=it_staff.id,
            status="Resolved",
        )
        get_or_create_ticket(
            db=db,
            title="Zoom application keeps crashing",
            description="Zoom crashes whenever I join an online meeting.",
            priority="Medium",
            created_by=student.id,
            assigned_to=None,
            status="Open",
        )
        get_or_create_ticket(
            db=db,
            title="Need help setting up workstation",
            description="I need general IT help setting up my computer and monitor.",
            priority="Low",
            created_by=student.id,
            assigned_to=admin.id,
            status="Closed",
        )
        get_or_create_asset(
            db=db,
            asset_tag="OU-LAP-001",
            asset_type="Laptop",
            brand="Dell",
            model="Latitude 5420",
            serial_number="SN-LAP-001",
            status="Assigned",
            assigned_to=student.id,
        )
        get_or_create_asset(
            db=db,
            asset_tag="OU-MON-001",
            asset_type="Monitor",
            brand="Dell",
            model="24-inch Monitor",
            serial_number="SN-MON-001",
            status="Assigned",
            assigned_to=student.id,
        )
        get_or_create_asset(
            db=db,
            asset_tag="OU-KEY-001",
            asset_type="Keyboard",
            brand="Logitech",
            model="K120",
            serial_number="SN-KEY-001",
            status="Active",
            assigned_to=None,
        )
        get_or_create_asset(
            db=db,
            asset_tag="OU-LAP-002",
            asset_type="Laptop",
            brand="HP",
            model="EliteBook 840",
            serial_number="SN-LAP-002",
            status="Damaged",
            assigned_to=None,
        )
        get_or_create_asset(
            db=db,
            asset_tag="OU-PRN-001",
            asset_type="Printer",
            brand="Canon",
            model="ImageCLASS",
            serial_number="SN-PRN-001",
            status="Retired",
            assigned_to=None,
        )
        print("Database seeded successfully.")
        print("")
        print("Demo accounts:")
        print(f"Admin: {admin.email} | Password: Password123 | ID: {admin.id}")
        print(f"IT Staff: {it_staff.email} | Password: Password123 | ID: {it_staff.id}")
        print(f"Student: {student.email} | Password: Password123 | ID: {student.id}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()