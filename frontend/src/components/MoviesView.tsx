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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const watchedCount = movies.filter(m => m.watched).length;
  const totalRuntimeMins = movies.reduce((sum, m) => sum + m.runtime, 0);

  const formatRuntime = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return hrs > 0 ? `${hrs}h ${rem}m` : `${rem}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-mcu-card via-mcu-dark to-mcu-card border border-mcu-border overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-mcu-red/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-mcu-red/10 border border-mcu-red/30 text-mcu-red text-xs font-bold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Marvel Cinematic Universe Timeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              MCU Movies & Prerequisite Graph
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Track your watch progress, inspect chronological dependencies, and configure Directed Acyclic Graph (DAG) prerequisites.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-mcu-red to-mcu-redDark hover:opacity-95 text-white font-bold text-sm shadow-glow-red transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Movie</span>
          </button>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-mcu-border/60">
          <div className="bg-mcu-dark/60 p-3.5 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 block font-medium">Total Movies</span>
            <span className="text-xl sm:text-2xl font-bold text-white mt-1 block">
              {movies.length}
            </span>
          </div>

          <div className="bg-mcu-dark/60 p-3.5 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 block font-medium">Watched</span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 block">
              {watchedCount} <span className="text-xs text-slate-400 font-normal">/ {movies.length}</span>
            </span>
          </div>

          <div className="bg-mcu-dark/60 p-3.5 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 block font-medium">Total Runtime</span>
            <span className="text-xl sm:text-2xl font-bold text-mcu-cyan mt-1 block">
              {formatRuntime(totalRuntimeMins)}
            </span>
          </div>

          <div className="bg-mcu-dark/60 p-3.5 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400 block font-medium">Graph Integrity</span>
            <span className="text-xl sm:text-2xl font-bold text-mcu-gold mt-1 block">
              DAG Verified
            </span>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search movie title..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-mcu-card border border-mcu-border text-white text-sm placeholder-slate-500 focus:outline-none focus:border-mcu-cyan focus:ring-1 focus:ring-mcu-cyan transition-all"
          />
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 space-x-2">
          <div className="w-6 h-6 border-2 border-mcu-cyan border-t-transparent rounded-full animate-spin" />
          <span>Loading movies catalog...</span>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-16 bg-mcu-card/50 rounded-2xl border border-mcu-border">
          <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white">No Movies Found</h3>
          <p className="text-sm text-slate-400 mt-1">
            {searchTerm ? `No movies matching "${searchTerm}"` : 'Your database has no movies yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMovies.map(movie => {
            return (
              <div
                key={movie.id}
                className={`relative flex flex-col justify-between rounded-2xl p-5 border transition-all duration-200 ${
                  movie.watched
                    ? 'bg-mcu-card/90 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                    : 'bg-mcu-card border-mcu-border hover:border-slate-600 hover:shadow-lg'
                }`}
              >
                <div>
                  {/* Top card header: Watched toggle & Release Year */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <button
                      onClick={() => onToggleWatched(movie)}
                      className="group flex items-center space-x-2 text-left focus:outline-none"
                    >
                      {movie.watched ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          movie.watched ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {movie.watched ? 'Watched' : 'Mark as Watched'}
                      </span>
                    </button>

                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                      <Calendar className="w-3.5 h-3.5 text-mcu-gold" />
                      <span>{movie.release_year}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white tracking-wide mt-1 line-clamp-1">
                    {movie.title}
                  </h3>

                  {/* Runtime */}
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1 mb-4">
                    <Clock className="w-3.5 h-3.5 text-mcu-cyan" />
                    <span>
                      {movie.runtime} mins ({formatRuntime(movie.runtime)})
                    </span>
                  </div>

                  {/* Prerequisites Badges */}
                  <div className="mt-3 pt-3 border-t border-mcu-border/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center space-x-1">
                        <GitFork className="w-3 h-3 text-mcu-cyan" />
                        <span>Prerequisites ({movie.prerequisites?.length || 0})</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                      {movie.prerequisites && movie.prerequisites.length > 0 ? (
                        movie.prerequisites.map(p => (
                          <span
                            key={p.id}
                            className="inline-flex items-center text-xs px-2.5 py-1 rounded-lg bg-mcu-dark text-slate-200 border border-mcu-border/90 hover:border-mcu-cyan/50 transition-colors truncate max-w-[200px]"
                            title={p.title}
                          >
                            {p.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic py-1">
                          No prerequisites (standalone entry)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-mcu-border/50 gap-2">
                  <button
                    onClick={() => onViewPlanForMovie(movie.id)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-mcu-cyan/15 hover:text-mcu-cyan hover:border-mcu-cyan/40 border border-transparent text-xs font-semibold text-slate-300 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Rewatch Plan</span>
                  </button>

                  <button
                    onClick={() => setEditingMovie(movie)}
                    className="py-1.5 px-3 rounded-lg bg-mcu-dark hover:bg-white/10 border border-mcu-border text-xs font-semibold text-slate-200 transition-colors flex items-center space-x-1.5"
                    title="Edit Prerequisites with Cycle Detection"
                  >
                    <GitFork className="w-3.5 h-3.5 text-mcu-gold" />
                    <span>Edit Prereqs</span>
                  </button>

                  <button
                    onClick={() => onDeleteMovie(movie.id)}
                    className="p-1.5 rounded-lg bg-mcu-dark hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-mcu-border transition-colors"
                    title="Delete Movie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Movie Modal */}
      <MovieModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onCreateMovie}
        existingMovies={movies}
      />

      {/* Edit Prerequisites Modal */}
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
