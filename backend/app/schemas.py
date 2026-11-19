from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class MoviePrerequisiteBrief(BaseModel):
    id: int
    title: str

    model_config = ConfigDict(from_attributes=True)


class MovieBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Unique movie title")
    release_year: int = Field(..., ge=1888, le=2100, description="Release year")
    runtime: int = Field(..., ge=1, le=300, description="Runtime in minutes (1-300)")
    watched: bool = Field(default=False, description="Whether the user has watched the movie")


class MovieCreate(MovieBase):
    prerequisite_ids: list[int] = Field(default_factory=list, description="List of prerequisite movie IDs")


class MovieUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    release_year: Optional[int] = Field(None, ge=1888, le=2100)
    runtime: Optional[int] = Field(None, ge=1, le=300)
    watched: Optional[bool] = None
    prerequisite_ids: Optional[list[int]] = None


class MovieResponse(MovieBase):
    id: int
    prerequisites: list[MoviePrerequisiteBrief] = Field(default_factory=list)
    prerequisite_ids: list[int] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class RewatchOrderResponse(BaseModel):
    target_movie: MoviePrerequisiteBrief
    rewatch_order: list[MovieResponse]
    total_count: int
    watched_count: int
    unwatched_count: int = 0
    remaining_runtime: int
    unwatched_runtime: int = 0
    total_runtime: int = 0


class CinemaBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Unique cinema name")
    bundle_sizes: list[int] = Field(..., description="List of 1 to 10 unique bundle sizes (1-500)")

    @field_validator("bundle_sizes")
    @classmethod
    def validate_bundle_sizes(cls, v: list[int]) -> list[int]:
        if not (1 <= len(v) <= 10):
            raise ValueError("bundle_sizes must contain between 1 and 10 items")
        if len(set(v)) != len(v):
            raise ValueError("bundle_sizes must contain distinct integers")
        for size in v:
            if not (1 <= size <= 500):
                raise ValueError("Each bundle size must be between 1 and 500")
        return sorted(v)


class CinemaCreate(CinemaBase):
    pass


class CinemaResponse(CinemaBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class BookingResponse(BaseModel):
    possible: bool
    message: str
    summary: Optional[str] = None
    cinema_id: Optional[int] = None
    cinema_name: Optional[str] = None
    group_size: Optional[int] = None
    total_bundles: Optional[int] = None
    breakdown: Optional[dict[str, int]] = None
    bundle_sizes: Optional[list[int]] = None
