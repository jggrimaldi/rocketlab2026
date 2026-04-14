from app.routers.produtos import router as produtos_router
from app.routers.consumidores import router as consumidores_router
from app.routers.dashboard import router as dashboard_router
from app.routers.vendedores import router as vendedores_router

__all__ = ["produtos_router", "consumidores_router", "dashboard_router", "vendedores_router"]
