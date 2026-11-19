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
    <div className="min-h-screen bg-[#05060A] text-slate-100 flex flex-col font-sans selection:bg-mcu-red selection:text-white pb-20 md:pb-0">
      {/* Top Cinematic Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiOnline={apiOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080B15]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => { setActiveTab('movies'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'movies'
                ? 'bg-mcu-red text-white shadow-glow-red font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono tracking-wider uppercase">Vault</span>
          </button>

          <button
            onClick={() => { setActiveTab('plan'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'plan'
                ? 'bg-mcu-cyan text-black shadow-glow-cyan font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono tracking-wider uppercase">Rewatch</span>
          </button>

          <button
            onClick={() => { setActiveTab('booking'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'booking'
                ? 'bg-mcu-gold text-black shadow-glow-gold font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono tracking-wider uppercase">Cinema</span>
          </button>
        </div>
      </div>

      {/* Cinematic Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center bg-[#030407] text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <span className="font-cinematic text-lg tracking-widest text-slate-300">
            DOOMSDAY <span className="text-mcu-red">READY</span>
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-[11px] font-mono uppercase text-slate-400">
            BLINTO TALENT ACCELERATOR 2027
          </span>
        </div>
        <p className="text-[11px] text-slate-500 font-mono max-w-xl mx-auto">
          Production Architecture: FastAPI &bull; PostgreSQL &bull; React 18+ TypeScript &bull; Tailwind CSS &bull; Docker Compose
        </p>
      </footer>
    </div>
  );
};

export default App;
