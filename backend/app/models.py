from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    Table,
    CheckConstraint,
    JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

movie_prerequisites = Table(
    "movie_prerequisites",
    Base.metadata,
    Column(
        "movie_id",
        Integer,
        ForeignKey("movies.id", ondelete="CASCADE"),
        primary_key=True
    ),
    Column(
        "prerequisite_id",
        Integer,
        ForeignKey("movies.id", ondelete="CASCADE"),
        primary_key=True
    ),
)


class Movie(Base):
    __tablename__ = "movies"
    __table_args__ = (
        CheckConstraint("runtime >= 1 AND runtime <= 300", name="check_runtime_range"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), unique=True, nullable=False, index=True)
    release_year = Column(Integer, nullable=False)
    runtime = Column(Integer, nullable=False)
    watched = Column(Boolean, default=False, nullable=False)

    prerequisites = relationship(
        "Movie",
        secondary=movie_prerequisites,
        primaryjoin=id == movie_prerequisites.c.movie_id,
        secondaryjoin=id == movie_prerequisites.c.prerequisite_id,
        backref="dependent_movies",
        lazy="selectin",
    )


class Cinema(Base):
    __tablename__ = "cinemas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    bundle_sizes = Column(JSON, nullable=False)
