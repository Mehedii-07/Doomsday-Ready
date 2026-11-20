from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, SessionLocal, get_db
from app.seed import seed_database
from app.api.movies import router as movies_router, CircularDependencyException
from app.api.cinemas import router as cinemas_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: attempt to create tables and seed default dataset
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
    except Exception as e:
        print(f"[Warning] Database initialization deferred or error on startup: {e}")
    yield
    # Shutdown logic if needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-Stack Production Ready Application for Blinto Talent Accelerator 2027 Assessment",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom exception handler for CircularDependencyException
@app.exception_handler(CircularDependencyException)
async def circular_dependency_handler(request: Request, exc: CircularDependencyException):
    return JSONResponse(
        status_code=409,
        content={"detail": "CIRCULAR_DEPENDENCY", "code": "CIRCULAR_DEPENDENCY"},
    )


# Root landing endpoint for browser visits on Render URL
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "healthy",
        "service": "Doomsday Ready API",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/health",
    }


# Health check endpoints for Render and frontend monitoring
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "Doomsday Ready API", "version": settings.VERSION}


# Include API Routers under /api
app.include_router(movies_router, prefix="/api")
app.include_router(cinemas_router, prefix="/api")


@app.post("/api/reset", tags=["Admin"])
def reset_canonical_dataset(db: Session = Depends(get_db)):
    """Restores database to the pristine canonical MCU seed state."""
    seed_database(db, force=True)
    return {"status": "success", "message": "Database reset to canonical MCU assessment state"}
