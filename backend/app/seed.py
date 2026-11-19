from sqlalchemy.orm import Session
from app.models import Movie, Cinema, movie_prerequisites


def seed_database(db: Session) -> None:
    """Seeds the initial MCU movie dataset and cinema venues if the database is empty."""
    # Seed Movies if table is empty
    if db.query(Movie).count() == 0:
        movies_data = [
            {"title": "Iron Man", "release_year": 2008, "runtime": 126, "watched": False},
            {"title": "Captain America: The First Avenger", "release_year": 2011, "runtime": 124, "watched": False},
            {"title": "The Avengers", "release_year": 2012, "runtime": 143, "watched": False},
            {"title": "Captain America: Civil War", "release_year": 2016, "runtime": 147, "watched": False},
            {"title": "Thor: Ragnarok", "release_year": 2017, "runtime": 130, "watched": False},
            {"title": "Avengers: Infinity War", "release_year": 2018, "runtime": 149, "watched": False},
            {"title": "Avengers: Endgame", "release_year": 2019, "runtime": 181, "watched": False},
            {"title": "Avengers: Doomsday", "release_year": 2026, "runtime": 150, "watched": False},
        ]

        movie_objs = {}
        for m_data in movies_data:
            movie = Movie(**m_data)
            db.add(movie)
            db.flush()  # populate movie.id
            movie_objs[movie.title] = movie

        # Define prerequisite relations
        prereqs_map = {
            "The Avengers": ["Iron Man", "Captain America: The First Avenger"],
            "Captain America: Civil War": ["The Avengers"],
            "Avengers: Infinity War": ["Captain America: Civil War", "Thor: Ragnarok"],
            "Avengers: Endgame": ["Avengers: Infinity War"],
            "Avengers: Doomsday": ["Avengers: Endgame"],
        }

        for title, prereq_titles in prereqs_map.items():
            movie = movie_objs[title]
            for p_title in prereq_titles:
                prereq_movie = movie_objs[p_title]
                movie.prerequisites.append(prereq_movie)

        db.commit()

    # Seed Cinemas if table is empty
    if db.query(Cinema).count() == 0:
        cinemas_data = [
            {"name": "Starplex IMAX", "bundle_sizes": [1, 3, 4]},
            {"name": "Metro Cinema", "bundle_sizes": [2, 5]},
            {"name": "Grand Premiere Hall", "bundle_sizes": [6, 9, 20]},
            {"name": "Indie Screen", "bundle_sizes": [4, 6]},
        ]

        for c_data in cinemas_data:
            cinema = Cinema(**c_data)
            db.add(cinema)

        db.commit()
