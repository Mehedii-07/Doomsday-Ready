from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import Movie, movie_prerequisites
from app.schemas import (
    MovieCreate,
    MovieUpdate,
    MovieResponse,
    MoviePrerequisiteBrief,
    RewatchOrderResponse,
)
from app.core.graph import (
    has_circular_dependency,
    get_transitive_prerequisites,
    topological_sort_prerequisites,
)

router = APIRouter(prefix="/movies", tags=["Movies"])


class CircularDependencyException(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="CIRCULAR_DEPENDENCY"
        )


def _build_graph(db: Session, exclude_movie_id: int | None = None) -> dict[int, list[int]]:
    """Builds the prerequisite adjacency list: movie_id -> [prerequisite_ids]."""
    graph: dict[int, list[int]] = {}
    # Fetch all movies to ensure all node IDs exist in graph
    all_movies = db.query(Movie.id).all()
    for (m_id,) in all_movies:
        graph[m_id] = []

    rows = db.execute(movie_prerequisites.select()).fetchall()
    for row in rows:
        m_id, p_id = row[0], row[1]
        if exclude_movie_id is not None and m_id == exclude_movie_id:
            continue
        graph.setdefault(m_id, []).append(p_id)
    return graph


def _format_movie_response(movie: Movie) -> MovieResponse:
    return MovieResponse(
        id=movie.id,
        title=movie.title,
        release_year=movie.release_year,
        runtime=movie.runtime,
        watched=movie.watched,
        prerequisites=[
            MoviePrerequisiteBrief(id=p.id, title=p.title)
            for p in movie.prerequisites
        ],
        prerequisite_ids=[p.id for p in movie.prerequisites]
    )


@router.post("", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
def create_movie(payload: MovieCreate, db: Session = Depends(get_db)):
    # Check title uniqueness
    existing = db.query(Movie).filter(Movie.title == payload.title).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Movie with title '{payload.title}' already exists"
        )

    # Validate prerequisites exist
    prereq_movies = []
    if payload.prerequisite_ids:
        prereq_movies = db.query(Movie).filter(Movie.id.in_(payload.prerequisite_ids)).all()
        if len(prereq_movies) != len(payload.prerequisite_ids):
            found_ids = {m.id for m in prereq_movies}
            missing_ids = [pid for pid in payload.prerequisite_ids if pid not in found_ids]
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Prerequisite movie IDs not found: {missing_ids}"
            )

    movie = Movie(
        title=payload.title,
        release_year=payload.release_year,
        runtime=payload.runtime,
        watched=payload.watched,
    )
    db.add(movie)
    db.flush()

    if prereq_movies:
        # Check cycle detection if any
        graph = _build_graph(db, exclude_movie_id=movie.id)
        if has_circular_dependency(movie.id, payload.prerequisite_ids, graph):
            db.rollback()
            raise CircularDependencyException()
        movie.prerequisites = prereq_movies

    db.commit()
    db.refresh(movie)
    return _format_movie_response(movie)


@router.get("", response_model=list[MovieResponse])
def get_movies(db: Session = Depends(get_db)):
    movies = db.query(Movie).order_by(Movie.release_year.asc(), Movie.id.asc()).all()
    return [_format_movie_response(m) for m in movies]


@router.get("/{movie_id}", response_model=MovieResponse)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movie with ID {movie_id} not found"
        )
    return _format_movie_response(movie)


@router.patch("/{movie_id}", response_model=MovieResponse)
def update_movie(movie_id: int, payload: MovieUpdate, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movie with ID {movie_id} not found"
        )

    # Check title uniqueness if title is changing
    if payload.title is not None and payload.title != movie.title:
        existing = db.query(Movie).filter(Movie.title == payload.title).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Movie with title '{payload.title}' already exists"
            )
        movie.title = payload.title

    if payload.release_year is not None:
        movie.release_year = payload.release_year

    if payload.runtime is not None:
        movie.runtime = payload.runtime

    if payload.watched is not None:
        movie.watched = payload.watched

    # Handle prerequisite updates
    if payload.prerequisite_ids is not None:
        # Check direct self-loop
        if movie_id in payload.prerequisite_ids:
            raise CircularDependencyException()

        # Validate that all requested prerequisite IDs exist
        if payload.prerequisite_ids:
            prereq_movies = db.query(Movie).filter(Movie.id.in_(payload.prerequisite_ids)).all()
            if len(prereq_movies) != len(payload.prerequisite_ids):
                found_ids = {m.id for m in prereq_movies}
                missing_ids = [pid for pid in payload.prerequisite_ids if pid not in found_ids]
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Prerequisite movie IDs not found: {missing_ids}"
                )
        else:
            prereq_movies = []

        # Cycle detection check
        graph = _build_graph(db, exclude_movie_id=movie_id)
        if has_circular_dependency(movie_id, payload.prerequisite_ids, graph):
            raise CircularDependencyException()

        # Update prerequisites relationship
        movie.prerequisites = prereq_movies

    try:
        db.commit()
        db.refresh(movie)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return _format_movie_response(movie)


@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movie with ID {movie_id} not found"
        )
    db.delete(movie)
    db.commit()
    return None


@router.get("/{movie_id}/rewatch-order", response_model=RewatchOrderResponse)
def get_rewatch_order(movie_id: int, db: Session = Depends(get_db)):
    target_movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not target_movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movie with ID {movie_id} not found"
        )

    # Build entire prerequisite graph
    graph = _build_graph(db)

    # 1. Traverse backwards from movie_id to find all transitive prerequisites
    transitive_ids = get_transitive_prerequisites(movie_id, graph)

    if not transitive_ids:
        return RewatchOrderResponse(
            target_movie=MoviePrerequisiteBrief(id=target_movie.id, title=target_movie.title),
            rewatch_order=[],
            total_count=0,
            watched_count=0,
            remaining_runtime=0
        )

    # Fetch movie details for all transitive prerequisites
    prereq_movies = db.query(Movie).filter(Movie.id.in_(transitive_ids)).all()
    movies_map = {m.id: m for m in prereq_movies}
    movie_metadata = {
        m.id: {"release_year": m.release_year, "title": m.title}
        for m in prereq_movies
    }

    # 2. Perform custom Topological Sort (Kahn's Algorithm)
    ordered_ids = topological_sort_prerequisites(transitive_ids, graph, movie_metadata)

    ordered_movies = [_format_movie_response(movies_map[mid]) for mid in ordered_ids]

    total_count = len(ordered_movies)
    watched_count = sum(1 for m in ordered_movies if m.watched)
    unwatched_count = total_count - watched_count
    remaining_runtime = sum(m.runtime for m in ordered_movies if not m.watched)
    total_runtime = sum(m.runtime for m in ordered_movies)

    return RewatchOrderResponse(
        target_movie=MoviePrerequisiteBrief(id=target_movie.id, title=target_movie.title),
        rewatch_order=ordered_movies,
        total_count=total_count,
        watched_count=watched_count,
        unwatched_count=unwatched_count,
        remaining_runtime=remaining_runtime,
        unwatched_runtime=remaining_runtime,
        total_runtime=total_runtime,
    )
