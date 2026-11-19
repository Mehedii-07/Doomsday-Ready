from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Cinema
from app.schemas import CinemaCreate, CinemaResponse, BookingResponse
from app.core.dp import solve_bundle_booking

router = APIRouter(prefix="/cinemas", tags=["Cinemas"])


@router.post("", response_model=CinemaResponse, status_code=status.HTTP_201_CREATED)
def create_cinema(payload: CinemaCreate, db: Session = Depends(get_db)):
    existing = db.query(Cinema).filter(Cinema.name == payload.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cinema with name '{payload.name}' already exists"
        )

    cinema = Cinema(
        name=payload.name,
        bundle_sizes=payload.bundle_sizes
    )
    db.add(cinema)
    db.commit()
    db.refresh(cinema)
    return cinema


@router.get("", response_model=list[CinemaResponse])
def get_cinemas(db: Session = Depends(get_db)):
    return db.query(Cinema).order_by(Cinema.id.asc()).all()


@router.get("/{cinema_id}", response_model=CinemaResponse)
def get_cinema(cinema_id: int, db: Session = Depends(get_db)):
    cinema = db.query(Cinema).filter(Cinema.id == cinema_id).first()
    if not cinema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cinema with ID {cinema_id} not found"
        )
    return cinema


@router.get("/{cinema_id}/booking", response_model=BookingResponse)
def get_cinema_booking(
    cinema_id: int,
    group_size: int = Query(..., alias="groupSize", ge=1, le=10000, description="Watch-party group size (1-10000)"),
    db: Session = Depends(get_db)
):
    cinema = db.query(Cinema).filter(Cinema.id == cinema_id).first()
    if not cinema:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cinema with ID {cinema_id} not found"
        )

    result = solve_bundle_booking(group_size=group_size, bundle_sizes=cinema.bundle_sizes)

    return BookingResponse(
        possible=result["possible"],
        message=result["message"],
        cinema_id=cinema.id,
        cinema_name=cinema.name,
        group_size=group_size,
        total_bundles=result["total_bundles"],
        breakdown=result["breakdown"],
        bundle_sizes=cinema.bundle_sizes
    )
