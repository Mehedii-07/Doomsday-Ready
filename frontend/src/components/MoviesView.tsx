import React, { useState } from 'react';
import {
  Plus,
  Search,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  GitFork,
  Trash2,
  Sparkles,
  Layers,
  Clapperboard,
  Film,
  Flame,
} from 'lucide-react';
import { Movie, MovieCreatePayload } from '../types';
import { MovieModal } from './MovieModal';
import { EditPrereqsModal } from './EditPrereqsModal';

interface MoviesViewProps {
  movies: Movie[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onCreateMovie: (payload: MovieCreatePayload) => Promise<void>;
  onToggleWatched: (movie: Movie) => Promise<void>;
  onUpdatePrerequisites: (movieId: number, prereqIds: number[]) => Promise<void>;
  onDeleteMovie: (movieId: number) => Promise<void>;
  onViewPlanForMovie: (movieId: number) => void;
}

export const MoviesView: React.FC<MoviesViewProps> = ({
  movies,
  loading,
  onCreateMovie,
  onToggleWatched,
  onUpdatePrerequisites,
  onDeleteMovie,
  onViewPlanForMovie,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'watched' | 'unwatched'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // Thematic styling per MCU film
  const getMovieTheme = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('doomsday')) {
      return {
        badge: 'PHASE 6 &bull; MULTIVERSE SAGA',
        accentBorder: 'hover:border-astral-emerald hover:shadow-glow-doom',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        gradient: 'from-emerald-950/30 via-astral-card to-[#090D1A]',
        glow: 'shadow-[0_0_30px_rgba(16,185,129,0.18)]',
        colorPill: 'text-emerald-400',
      };
    }
    if (t.includes('endgame') || t.includes('infinity war')) {
      return {
        badge: 'PHASE 3 &bull; INFINITY SAGA CLIMAX',
        accentBorder: 'hover:border-astral-violet hover:shadow-glow-violet',
        badgeBg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
        gradient: 'from-violet-950/25 via-astral-card to-[#090D1A]',
        glow: 'shadow-[0_0_25px_rgba(139,92,246,0.18)]',
        colorPill: 'text-violet-400',
      };
    }
    if (t.includes('civil war')) {
      return {
        badge: 'PHASE 3 &bull; HEROES DIVIDED',
        accentBorder: 'hover:border-blue-500/80 hover:shadow-glow-cyan',
        badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        gradient: 'from-blue-950/25 via-astral-card to-[#090D1A]',
        glow: 'shadow-[0_0_25px_rgba(59,130,246,0.15)]',
        colorPill: 'text-blue-400',
      };
    }
    if (t.includes('ragnarok')) {
      return {
        badge: 'PHASE 3 &bull; ASGARD FALLEN',
        accentBorder: 'hover:border-yellow-500/80 hover:shadow-glow-gold',
        badgeBg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
        gradient: 'from-amber-950/20 via-astral-card to-[#090D1A]',
        glow: 'shadow-[0_0_25px_rgba(255,184,0,0.18)]',
        colorPill: 'text-yellow-400',
      };
    }
    if (t.includes('iron man')) {
      return {
        badge: 'PHASE 1 &bull; GENESIS',
        accentBorder: 'hover:border-red-500/80 hover:shadow-glow-red',
        badgeBg: 'bg-red-500/15 text-red-300 border-red-500/30',
        gradient: 'from-red-950/25 via-astral-card to-[#090D1A]',
        glow: 'shadow-[0_0_25px_rgba(230,36,41,0.18)]',
        colorPill: 'text-red-400',
      };
    }
    return {
      badge: 'MCU CANON TIMELINE',
      accentBorder: 'hover:border-astral-cyan/70 hover:shadow-glow-cyan',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      gradient: 'from-slate-900/40 via-astral-card to-[#090D1A]',
      glow: 'shadow-md',
      colorPill: 'text-cyan-400',
    };
  };

  const filteredMovies = movies.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'watched') return m.watched;
    if (filterMode === 'unwatched') return !m.watched;
    return true;
  });

  const watchedCount = movies.filter(m => m.watched).length;
  const totalRuntimeMins = movies.reduce((sum, m) => sum + m.runtime, 0);

  const formatRuntime = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return hrs > 0 ? `${hrs}h ${rem}m` : `${rem}m`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Astral Cosmic Hero Premiere Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden border border-astral-border/80 bg-gradient-to-br from-[#121B38] via-[#0C1225] to-[#070A14] shadow-cinematic">
        {/* Luminous Glowing Halos */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-astral-violet/20 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-astral-emerald/18 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full cosmic-grid-overlay opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3.5 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
              <Flame className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>THE CHRONOLOGICAL ROAD TO AVENGERS: DOOMSDAY (2026)</span>
            </div>

            <h1 className="font-cinematic text-4xl sm:text-5xl lg:text-6xl tracking-wider text-white uppercase leading-none drop-shadow-md">
              Celestial Timeline & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Rewatch Vault</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-2xl">
              Inspect Marvel Studios canonical milestones through an interactive Directed Acyclic Graph. Mathematically guarantees zero circular timeline loops and calculates exact group cinema seating.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 hover:brightness-110 text-white font-extrabold text-sm tracking-wider uppercase shadow-glow-doom transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Add Premiere</span>
            </button>
          </div>
        </div>

        {/* Thematic Metric Strips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-[#090E1F]/80 border border-white/5 backdrop-blur-md">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Film className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vault Movies</span>
            </span>
            <span className="font-cinematic text-3xl sm:text-4xl text-white mt-1 block tracking-wider">
              {movies.length} <span className="text-sm font-sans text-slate-400 font-normal">Entries</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090E1F]/80 border border-white/5 backdrop-blur-md">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Seen In Theaters</span>
            </span>
            <span className="font-cinematic text-3xl sm:text-4xl text-emerald-400 mt-1 block tracking-wider">
              {watchedCount} <span className="text-sm font-sans text-slate-400 font-normal">/ {movies.length}</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090E1F]/80 border border-white/5 backdrop-blur-md">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Total Runtime</span>
            </span>
            <span className="font-cinematic text-3xl sm:text-4xl text-cyan-300 mt-1 block tracking-wider">
              {formatRuntime(totalRuntimeMins)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090E1F]/80 border border-white/5 backdrop-blur-md">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Clapperboard className="w-3.5 h-3.5 text-yellow-400" />
              <span>DAG Integrity</span>
            </span>
            <span className="font-cinematic text-3xl sm:text-4xl text-yellow-400 mt-1 block tracking-wider">
              CANON LOCKED
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search premiere title or year..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-astral-surface border border-astral-border text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-sans"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-astral-surface border border-astral-border self-start sm:self-auto overflow-x-auto shadow-inner">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              filterMode === 'all'
                ? 'bg-white/15 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({movies.length})
          </button>
          <button
            onClick={() => setFilterMode('unwatched')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              filterMode === 'unwatched'
                ? 'bg-gradient-to-r from-red-600 to-red-800 text-white font-bold shadow-glow-red'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            To Watch ({movies.length - watchedCount})
          </button>
          <button
            onClick={() => setFilterMode('watched')}
            className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              filterMode === 'watched'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-bold shadow-glow-doom'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Watched ({watchedCount})
          </button>
        </div>
      </div>

      {/* Thematic Movie Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
          <div className="w-9 h-9 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm tracking-wider uppercase text-slate-400">Loading Celestial Vault...</span>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-20 bg-astral-surface/70 rounded-3xl border border-astral-border p-6">
          <Layers className="w-14 h-14 text-slate-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white font-cinematic tracking-wider">No Movies Found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto font-sans">
            {searchTerm ? `No movies matching "${searchTerm}" in current filter.` : 'Your vault has no movies yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredMovies.map(movie => {
            const theme = getMovieTheme(movie.title);
            return (
              <div
                key={movie.id}
                className={`group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 border transition-all duration-300 bg-gradient-to-b ${theme.gradient} ${
                  movie.watched
                    ? 'border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.12)]'
                    : `border-astral-border ${theme.accentBorder} ${theme.glow}`
                } hover:-translate-y-1.5`}
              >
                <div>
                  {/* Top Badge Strip: Era / Saga + Year */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[9px] uppercase font-mono font-bold tracking-widest px-2.5 py-1 rounded-full border truncate max-w-[170px] ${theme.badgeBg}`}
                      dangerouslySetInnerHTML={{ __html: theme.badge }}
                    />
                    <div className="flex items-center space-x-1 text-xs text-slate-300 font-mono bg-[#080D1C] px-2 py-0.5 rounded-lg border border-white/10">
                      <Calendar className="w-3 h-3 text-yellow-400" />
                      <span>{movie.release_year}</span>
                    </div>
                  </div>

                  {/* Movie Title */}
                  <h3 className="font-cinematic text-2xl sm:text-3xl tracking-wide text-white group-hover:text-cyan-300 transition-colors leading-tight line-clamp-2 mt-1">
                    {movie.title}
                  </h3>

                  {/* Runtime & Technical Meta */}
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{movie.runtime} min ({formatRuntime(movie.runtime)})</span>
                  </div>

                  {/* Watched Toggle Button */}
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <button
                      onClick={() => onToggleWatched(movie)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        movie.watched
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-[#080D1C] border-white/10 text-slate-400 hover:text-white hover:border-slate-500'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        {movie.watched ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="uppercase tracking-wider font-mono text-[11px]">
                          {movie.watched ? 'Seen In Theaters' : 'Mark Watched'}
                        </span>
                      </span>
                      {movie.watched && (
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                          DONE ✓
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Prerequisites Badges */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                      <span className="flex items-center space-x-1.5">
                        <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Prerequisites ({movie.prerequisites?.length || 0})</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                      {movie.prerequisites && movie.prerequisites.length > 0 ? (
                        movie.prerequisites.map(p => (
                          <span
                            key={p.id}
                            className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-lg bg-[#080D1C] text-slate-200 border border-white/10 hover:border-cyan-400 transition-colors truncate max-w-[190px] font-sans"
                            title={p.title}
                          >
                            {p.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic py-1 font-sans">
                          Standalone / Saga Origin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 gap-2">
                  <button
                    onClick={() => onViewPlanForMovie(movie.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500 hover:to-teal-600 hover:text-black border border-emerald-500/30 text-xs font-bold text-emerald-300 transition-all flex items-center justify-center space-x-1.5 uppercase font-mono tracking-wider shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Roadmap</span>
                  </button>

                  <button
                    onClick={() => setEditingMovie(movie)}
                    className="py-2 px-3 rounded-xl bg-[#080D1C] hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors flex items-center space-x-1 font-mono"
                    title="Configure Prerequisites"
                  >
                    <GitFork className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => onDeleteMovie(movie.id)}
                    className="p-2 rounded-xl bg-[#080D1C] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 transition-colors"
                    title="Delete Movie"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <MovieModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onCreateMovie}
        existingMovies={movies}
      />

      <EditPrereqsModal
        isOpen={!!editingMovie}
        onClose={() => setEditingMovie(null)}
        movie={editingMovie}
        allMovies={movies}
        onSave={onUpdatePrerequisites}
      />
    </div>
  );
};
