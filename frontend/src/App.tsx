import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MoviesView } from './components/MoviesView';
import { RewatchPlanView } from './components/RewatchPlanView';
import { BookingView } from './components/BookingView';
import { Movie, Cinema, MovieCreatePayload } from './types';
import { api } from './services/api';
import { Film, Sparkles, Ticket } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'movies' | 'plan' | 'booking'>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [selectedPlanMovieId, setSelectedPlanMovieId] = useState<number | null>(null);

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
    const interval = setInterval(async () => {
      try {
        await api.checkHealth();
        setApiOnline(prev => {
          if (!prev) {
            // Server just woke up! Reload data automatically
            loadData();
          }
          return true;
        });
      } catch {
        setApiOnline(false);
      }
    }, 8000);
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
    if (!window.confirm(`Are you sure you want to delete this premiere entry?`)) return;
    await api.deleteMovie(movieId);
    setMovies(prev => prev.filter(m => m.id !== movieId));
    if (selectedPlanMovieId === movieId) {
      setSelectedPlanMovieId(null);
    }
  };

  const handleViewPlanForMovie = (movieId: number) => {
    setSelectedPlanMovieId(movieId);
    setActiveTab('plan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070A14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black pb-20 md:pb-0">
      {/* Top Cinematic Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiOnline={apiOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Cloud Spin-up Notice if Server is waking up */}
        {!apiOnline && movies.length === 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-mono flex items-center space-x-3 shadow-glow-gold animate-fadeIn">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div className="flex-1">
              <strong>Connecting to Server...</strong> If this is your first visit, Render free tier spins down after inactivity and takes ~30–45s to wake up. Timeline data will load automatically once connected.
            </div>
          </div>
        )}

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

      {/* Mobile Bottom Navigation Bar (Thumb-friendly for iPhone / Android) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080D1C]/95 backdrop-blur-2xl border-t border-white/10 px-4 py-2 shadow-2xl">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => { setActiveTab('movies'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${
              activeTab === 'movies'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-700 text-white shadow-glow-doom font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono tracking-wider uppercase">Vault</span>
          </button>

          <button
            onClick={() => { setActiveTab('plan'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${
              activeTab === 'plan'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black shadow-glow-cyan font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono tracking-wider uppercase">Rewatch</span>
          </button>

          <button
            onClick={() => { setActiveTab('booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${
              activeTab === 'booking'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-600 text-black shadow-glow-gold font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono tracking-wider uppercase">Cinema</span>
          </button>
        </div>
      </div>

      {/* Cinematic Footer */}
      <footer className="border-t border-astral-border/70 py-10 px-4 text-center bg-[#050811] text-xs text-slate-500 space-y-2.5">
        <div className="flex items-center justify-center space-x-2.5">
          <span className="font-cinematic text-xl tracking-widest text-slate-200">
            DOOMSDAY <span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">READY</span>
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            BLINTO TALENT ACCELERATOR 2027
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono max-w-xl mx-auto">
          Architectural Foundation: FastAPI &bull; PostgreSQL 18 &bull; React 18+ TypeScript &bull; Tailwind CSS &bull; Docker Compose
        </p>
      </footer>
    </div>
  );
};

export default App;
