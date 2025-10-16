from app.routers.auth import router as auth_router
from app.routers.clients import router as clients_router
from app.routers.reports import router as reports_router

__all__ = ["auth_router", "clients_router", "reports_router"]
