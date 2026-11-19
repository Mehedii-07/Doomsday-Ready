from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed import seed_database
from app.api.movies import router as movies_router, CircularDependencyException
from app.api.cinemas import router as cinemas_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed default dataset if empty
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
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


# Include API Routers under /api
app.include_router(movies_router, prefix="/api")
app.include_router(cinemas_router, prefix="/api")


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "Doomsday Ready API", "version": settings.VERSION}
