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

  // Determine thematic poster styling per movie
  const getMovieTheme = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('doomsday')) {
      return {
        badge: 'PHASE 6 &bull; MULTIVERSE SAGA',
        accentBorder: 'hover:border-mcu-doom/80 hover:shadow-glow-doom',
        badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        gradient: 'from-emerald-950/40 via-mcu-card to-slate-900',
        glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
      };
    }
    if (t.includes('endgame') || t.includes('infinity war')) {
      return {
        badge: 'PHASE 3 &bull; INFINITY SAGA CLIMAX',
        accentBorder: 'hover:border-purple-500/80 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]',
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        gradient: 'from-purple-950/30 via-mcu-card to-slate-900',
        glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
      };
    }
    if (t.includes('civil war')) {
      return {
        badge: 'PHASE 3 &bull; HEROES DIVIDED',
        accentBorder: 'hover:border-blue-500/80 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]',
        badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        gradient: 'from-blue-950/30 via-mcu-card to-slate-900',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
      };
    }
    if (t.includes('ragnarok')) {
      return {
        badge: 'PHASE 3 &bull; ASGARD DESTROYED',
        accentBorder: 'hover:border-yellow-500/80 hover:shadow-glow-gold',
        badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        gradient: 'from-yellow-950/25 via-mcu-card to-slate-900',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]',
      };
    }
    if (t.includes('iron man')) {
      return {
        badge: 'PHASE 1 &bull; GENESIS',
        accentBorder: 'hover:border-red-500/80 hover:shadow-glow-red',
        badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
        gradient: 'from-red-950/30 via-mcu-card to-slate-900',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
      };
    }
    return {
      badge: 'MCU CANON TIMELINE',
      accentBorder: 'hover:border-mcu-cyan/70 hover:shadow-glow-cyan',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      gradient: 'from-slate-900 via-mcu-card to-slate-950',
      glow: 'shadow-lg',
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
      {/* Cinematic Hero Premiere Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden border border-white/10 bg-gradient-to-br from-[#12162A] via-[#090C16] to-[#040508] shadow-cinematic">
        {/* Atmospheric Glow Highlights */}
        <div className="absolute -top-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 bg-mcu-red/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 bg-mcu-doom/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-vignette pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-mcu-red/20 border border-mcu-red/40 text-mcu-red text-xs font-mono font-bold tracking-widest uppercase">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>THE ROAD TO AVENGERS: DOOMSDAY (2026)</span>
            </div>

            <h1 className="font-cinematic text-4xl sm:text-5xl lg:text-6xl tracking-wider text-white uppercase leading-none drop-shadow-md">
              Cinematic MCU Rewatch & <span className="text-transparent bg-clip-text bg-gradient-to-r from-mcu-red via-yellow-400 to-mcu-cyan">Timeline Vault</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-2xl">
              Construct, verify, and traverse the Directed Acyclic Graph (DAG) of Marvel Studios cinematic milestones. Guarantee zero circular paradoxes and calculate exact watch-party seat bundles.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-mcu-red via-mcu-redDark to-red-700 hover:brightness-110 text-white font-extrabold text-sm tracking-wider uppercase shadow-glow-red transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Add New Premiere</span>
            </button>
          </div>
        </div>

        {/* Cinematic Metric Strips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-[#090C18]/80 border border-white/5 backdrop-blur-md">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Film className="w-3.5 h-3.5 text-mcu-red" />
              <span>Cataloged Movies</span>
            </span>
            <span className="font-cinematic text-3xl sm:text-4xl text-white mt-1 block tracking-wider">
              {movies.length} <span className="text-sm font-sans text-slate-500 font-normal">Titles</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090C18]/80 border border-white/5 backdrop-blur-md">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Watched Progress</span>
            </span>
            <span className="font-cinematic text-3xl sm:text-4xl text-emerald-400 mt-1 block tracking-wider">
              {watchedCount} <span className="text-sm font-sans text-slate-500 font-normal">/ {movies.length}</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090C18]/80 border border-white/5 backdrop-blur-md">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-mcu-cyan" />
              <span>Total Runtime</span>
            </span>
            <span className="font-cinematic text-3xl sm:text-4xl text-mcu-cyan mt-1 block tracking-wider">
              {formatRuntime(totalRuntimeMins)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090C18]/80 border border-white/5 backdrop-blur-md">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Clapperboard className="w-3.5 h-3.5 text-yellow-400" />
              <span>Graph Engine</span>
            </span>
            <span className="font-cinematic text-3xl sm:text-4xl text-yellow-400 mt-1 block tracking-wider">
              DAG LOCKED
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search premiere title or year..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-mcu-card border border-mcu-border text-white text-sm placeholder-slate-500 focus:outline-none focus:border-mcu-cyan focus:ring-2 focus:ring-mcu-cyan/20 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-mcu-card border border-mcu-border self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              filterMode === 'all'
                ? 'bg-white/15 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({movies.length})
          </button>
          <button
            onClick={() => setFilterMode('unwatched')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              filterMode === 'unwatched'
                ? 'bg-mcu-red text-white font-bold shadow-glow-red'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            To Watch ({movies.length - watchedCount})
          </button>
          <button
            onClick={() => setFilterMode('watched')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              filterMode === 'watched'
                ? 'bg-emerald-500 text-black font-bold shadow-glow-doom'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Watched ({watchedCount})
          </button>
        </div>
      </div>

      {/* Responsive Movie Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
          <div className="w-8 h-8 border-3 border-mcu-red border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-sm tracking-wider uppercase text-slate-400">Loading MCU Reel...</span>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-20 bg-mcu-card/60 rounded-3xl border border-mcu-border p-6">
          <Layers className="w-14 h-14 text-slate-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white font-cinematic tracking-wider">No Movies Found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
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
                    ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : `border-mcu-border ${theme.accentBorder} ${theme.glow}`
                } hover:-translate-y-1.5`}
              >
                <div>
                  {/* Top Badge Strip: Era / Saga + Year */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[9px] uppercase font-mono font-bold tracking-widest px-2.5 py-1 rounded-full border truncate max-w-[170px] ${theme.badgeBg}`}
                      dangerouslySetInnerHTML={{ __html: theme.badge }}
                    />
                    <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono bg-black/40 px-2 py-0.5 rounded-lg border border-white/5">
                      <Calendar className="w-3 h-3 text-yellow-400" />
                      <span>{movie.release_year}</span>
                    </div>
                  </div>

                  {/* Movie Title */}
                  <h3 className="font-cinematic text-2xl sm:text-3xl tracking-wide text-white group-hover:text-mcu-cyan transition-colors leading-tight line-clamp-2 mt-1">
                    {movie.title}
                  </h3>

                  {/* Runtime & Technical Meta */}
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-mcu-cyan" />
                    <span>{movie.runtime} min ({formatRuntime(movie.runtime)})</span>
                  </div>

                  {/* Watched Toggle Button */}
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <button
                      onClick={() => onToggleWatched(movie)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        movie.watched
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                          : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:border-slate-500'
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
                        <GitFork className="w-3.5 h-3.5 text-mcu-cyan" />
                        <span>Prerequisites ({movie.prerequisites?.length || 0})</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                      {movie.prerequisites && movie.prerequisites.length > 0 ? (
                        movie.prerequisites.map(p => (
                          <span
                            key={p.id}
                            className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-lg bg-black/50 text-slate-200 border border-white/10 hover:border-mcu-cyan/60 transition-colors truncate max-w-[190px]"
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
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500 hover:to-blue-600 hover:text-black border border-cyan-500/30 text-xs font-bold text-cyan-300 transition-all flex items-center justify-center space-x-1.5 uppercase font-mono tracking-wider shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Roadmap</span>
                  </button>

                  <button
                    onClick={() => setEditingMovie(movie)}
                    className="py-2 px-3 rounded-xl bg-black/40 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors flex items-center space-x-1 font-mono"
                    title="Configure Prerequisites"
                  >
                    <GitFork className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => onDeleteMovie(movie.id)}
                    className="p-2 rounded-xl bg-black/40 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 transition-colors"
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
