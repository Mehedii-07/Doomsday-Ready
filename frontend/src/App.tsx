import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MoviesView } from './components/MoviesView';
import { RewatchPlanView } from './components/RewatchPlanView';
import { BookingView } from './components/BookingView';
import { Movie, Cinema, MovieCreatePayload } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'movies' | 'plan' | 'booking'>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [selectedPlanMovieId, setSelectedPlanMovieId] = useState<number | null>(null);

  // Load initial movies and cinemas
  const loadData = async () => {
    try {
      setLoadingMovies(true);
      const [moviesData, cinemasData] = await Promise.all([
        api.getMovies(),
        api.getCinemas(),
      ]);
      setMovies(moviesData);
      setCinemas(cinemasData);
      setApiOnline(true);
    } catch (err) {
      console.error('Failed to load initial data', err);
      setApiOnline(false);
    } finally {
      setLoadingMovies(false);
    }
  };

  useEffect(() => {
    loadData();
    // Health check ping
    const interval = setInterval(async () => {
      try {
        await api.checkHealth();
        setApiOnline(true);
      } catch {
        setApiOnline(false);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateMovie = async (payload: MovieCreatePayload) => {
    const newMovie = await api.createMovie(payload);
    setMovies(prev => [...prev, newMovie]);
  };

  const handleToggleWatched = async (movie: Movie) => {
    const updated = await api.updateMovie(movie.id, { watched: !movie.watched });
    setMovies(prev => prev.map(m => (m.id === updated.id ? updated : m)));
  };

  const handleUpdatePrerequisites = async (movieId: number, prereqIds: number[]) => {
    const updated = await api.updateMovie(movieId, { prerequisite_ids: prereqIds });
    setMovies(prev => prev.map(m => (m.id === updated.id ? updated : m)));
  };

  const handleDeleteMovie = async (movieId: number) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    await api.deleteMovie(movieId);
    setMovies(prev => prev.filter(m => m.id !== movieId));
    if (selectedPlanMovieId === movieId) {
      setSelectedPlanMovieId(null);
    }
  };

  const handleViewPlanForMovie = (movieId: number) => {
    setSelectedPlanMovieId(movieId);
    setActiveTab('plan');
  };

  return (
    <div className="min-h-screen bg-[#08090E] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiOnline={apiOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'movies' && (
          <MoviesView
            movies={movies}
            loading={loadingMovies}
            onRefresh={loadData}
            onCreateMovie={handleCreateMovie}
            onToggleWatched={handleToggleWatched}
            onUpdatePrerequisites={handleUpdatePrerequisites}
            onDeleteMovie={handleDeleteMovie}
            onViewPlanForMovie={handleViewPlanForMovie}
          />
        )}

        {activeTab === 'plan' && (
          <RewatchPlanView
            movies={movies}
            selectedMovieId={selectedPlanMovieId}
            onSelectMovieId={setSelectedPlanMovieId}
            onMovieWatchedToggled={loadData}
          />
        )}

        {activeTab === 'booking' && (
          <BookingView
            cinemas={cinemas}
            onCinemaCreated={loadData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-mcu-border/50 py-6 text-center text-xs text-slate-500">
        <p>
          Doomsday Ready &bull; Blinto Talent Accelerator 2027 Full-Stack Developer Assessment
        </p>
        <p className="mt-1 font-mono text-[11px] text-slate-600">
          FastAPI &bull; React 18+ &bull; TypeScript &bull; Tailwind CSS &bull; PostgreSQL / SQLite
        </p>
      </footer>
    </div>
  );
};

export default App;
