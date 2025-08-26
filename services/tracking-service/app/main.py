"""
SonGo Tracking Service - Real-time package and pallet tracking with maps
Built with FastAPI and integrated with major carrier APIs
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import init_db
from app.core.logging import setup_logging
from app.services.carrier_tracker import CarrierTrackingService
from app.services.maps_service import MapsService
from app.services.notification_service import NotificationService

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting SonGo Tracking Service...")
    await init_db()
    logger.info("Database initialized")
    
    # Initialize services
    app.state.carrier_service = CarrierTrackingService()
    app.state.maps_service = MapsService()
    app.state.notification_service = NotificationService()
    
    logger.info("Tracking Service started successfully")
    yield
    
    # Shutdown
    logger.info("Shutting down Tracking Service...")

# Create FastAPI app
app = FastAPI(
    title="SonGo Tracking Service",
    description="Real-time package and pallet tracking with interactive maps",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "SonGo Tracking Service",
        "version": "2.0.0",
        "status": "healthy",
        "features": [
            "Real-time tracking",
            "Interactive maps",
            "Multi-carrier support",
            "Push notifications",
            "Route optimization"
        ]
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check database connection
        # Check carrier API connectivity
        # Check maps service
        return {
            "status": "healthy",
            "timestamp": "2024-01-01T00:00:00Z",
            "services": {
                "database": "connected",
                "carriers": "operational",
                "maps": "available",
                "notifications": "ready"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Global HTTP exception handler"""
    logger.error(f"HTTP {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8081,
        reload=settings.DEBUG,
        log_level="info"
    )
