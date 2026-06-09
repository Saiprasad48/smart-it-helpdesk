from pydantic import BaseModel

class CountItem(BaseModel):
    name: str
    count: int

class DashboardSummary(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    closed_tickets: int
    total_assets: int
    active_assets: int
    assigned_assets: int
    damaged_assets: int
    retired_assets: int
    tickets_by_category: list[CountItem]
    tickets_by_priority: list[CountItem]
    tickets_by_status: list[CountItem]
    assets_by_status: list[CountItem]