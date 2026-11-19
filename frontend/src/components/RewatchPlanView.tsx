import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Film,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Movie, RewatchPlan } from '../types';
import { api } from '../services/api';

interface RewatchPlanViewProps {
  movies: Movie[];
  selectedMovieId: number | null;
  onSelectMovieId: (id: number) => void;
  onMovieWatchedToggled: () => Promise<void>;
}

export const RewatchPlanView: React.FC<RewatchPlanViewProps> = ({
  movies,
  selectedMovieId,
  onSelectMovieId,
  onMovieWatchedToggled,
}) => {
  const [plan, setPlan] = useState<RewatchPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Default to Avengers: Doomsday if available, else first movie
  useEffect(() => {
    if (!selectedMovieId && movies.length > 0) {
      const doomsday = movies.find(m => m.title.includes('Doomsday'));
      if (doomsday) {
        onSelectMovieId(doomsday.id);
      } else {
        onSelectMovieId(movies[0].id);
      }
    }
  }, [movies, selectedMovieId, onSelectMovieId]);

  // Fetch rewatch order when selectedMovieId changes
  const fetchPlan = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRewatchOrder(id);
      setPlan(data);
    } catch (err: any) {
      setError(err?.data?.detail || err?.message || 'Failed to fetch rewatch plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMovieId) {
      fetchPlan(selectedMovieId);
    }
  }, [selectedMovieId]);

  const handleToggleWatched = async (movie: Movie) => {
    try {
      setTogglingId(movie.id);
      await api.updateMovie(movie.id, { watched: !movie.watched });
      // Notify parent to refresh global state
      await onMovieWatchedToggled();
      // Re-fetch current plan to recalculate stats
      if (selectedMovieId) {
        await fetchPlan(selectedMovieId);
      }
    } catch (err: any) {
      console.error('Failed to toggle watched status', err);
    } finally {
      setTogglingId(null);
    }
  };

  const formatRuntime = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    if (hrs === 0) return `${rem} mins`;
    if (rem === 0) return `${hrs} hrs`;
    return `${mins} mins (${hrs} hrs ${rem} mins)`;
  };

  const currentMovie = movies.find(m => m.id === selectedMovieId);

  // Compute progress percentage
  const totalCount = plan?.total_count || 0;
  const watchedCount = plan?.watched_count || 0;
  const progressPct = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Target Selector Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-mcu-card via-mcu-dark to-mcu-card border border-mcu-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-mcu-cyan/10 border border-mcu-cyan/30 text-mcu-cyan text-xs font-bold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Topological Sort Watch Order</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Curated Rewatch Roadmap
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Select any target movie to generate its mathematically verified prerequisite sequence using Kahn's topological sort.
            </p>
          </div>

          {/* Target Movie Dropdown */}
          <div className="w-full md:w-80 flex-shrink-0">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Film className="w-3.5 h-3.5 text-mcu-cyan" />
              <span>Target Premiere Movie</span>
            </label>
            <select
              value={selectedMovieId || ''}
              onChange={e => onSelectMovieId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-mcu-dark border border-mcu-border text-white text-sm font-semibold focus:outline-none focus:border-mcu-cyan focus:ring-1 focus:ring-mcu-cyan transition-all"
            >
              {movies.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.release_year})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress & Stats Card */}
        {plan && (
          <div className="mt-8 pt-6 border-t border-mcu-border/70 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Progress Bar */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-200 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>
                    Prerequisite Progress: <strong className="text-white">{watchedCount} of {totalCount} watched</strong>
                  </span>
                </span>
                <span className="font-mono font-bold text-mcu-cyan">{progressPct}%</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-mcu-dark overflow-hidden border border-mcu-border p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mcu-cyan via-blue-500 to-emerald-400 transition-all duration-500 shadow-glow-cyan"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Remaining Runtime */}
            <div className="p-4 rounded-xl bg-mcu-dark/80 border border-mcu-border flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-mcu-cyan/10 text-mcu-cyan">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  Remaining Watch Time
                </span>
                <span className="text-base sm:text-lg font-bold text-white block">
                  {plan.remaining_runtime === 0
                    ? 'All Caught Up! 🎉'
                    : formatRuntime(plan.remaining_runtime)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ordered Prerequisite List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center space-x-2">
            <Play className="w-4 h-4 text-mcu-red" />
            <span>
              Rewatch Order for <span className="text-mcu-cyan">{currentMovie?.title}</span>
            </span>
          </h2>
          {plan && (
            <span className="text-xs text-slate-400 bg-mcu-card px-3 py-1 rounded-full border border-mcu-border">
              {plan.total_count} prerequisite movie{plan.total_count !== 1 ? 's' : ''} in total
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 space-x-2">
            <div className="w-6 h-6 border-2 border-mcu-cyan border-t-transparent rounded-full animate-spin" />
            <span>Calculating topological order...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : !plan || plan.rewatch_order.length === 0 ? (
          <div className="p-8 rounded-2xl bg-mcu-card border border-mcu-border text-center">
            <Sparkles className="w-10 h-10 text-mcu-gold mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white">No Prerequisites Required!</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              <strong>{currentMovie?.title}</strong> is a standalone entry or the beginning of this MCU storyline branch. You can jump straight in!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {plan.rewatch_order.map((movie, index) => {
              const isToggling = togglingId === movie.id;
              return (
                <div
                  key={movie.id}
                  className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                    movie.watched
                      ? 'bg-mcu-card/70 border-emerald-500/30 opacity-80 hover:opacity-100'
                      : 'bg-mcu-card border-mcu-border hover:border-mcu-cyan/50 hover:shadow-glow-cyan'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Step badge */}
                    <div className="w-8 h-8 rounded-lg bg-mcu-dark border border-mcu-border flex items-center justify-center text-xs font-mono font-bold text-mcu-cyan flex-shrink-0">
                      #{index + 1}
                    </div>

                    {/* Interactive Watch Checkbox */}
                    <button
                      onClick={() => handleToggleWatched(movie)}
                      disabled={isToggling}
                      className="text-left focus:outline-none flex items-center space-x-2"
                      title={movie.watched ? 'Click to mark as unwatched' : 'Click to mark as watched'}
                    >
                      {movie.watched ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-mcu-cyan transition-colors" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-bold text-sm sm:text-base ${
                            movie.watched ? 'text-slate-300 line-through' : 'text-white'
                          }`}
                        >
                          {movie.title}
                        </span>
                        {movie.watched && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Watched
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-mcu-gold" />
                          <span>{movie.release_year}</span>
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-mcu-cyan" />
                          <span>{movie.runtime} mins</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side helper info */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleWatched(movie)}
                      disabled={isToggling}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                        movie.watched
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'border-mcu-border bg-mcu-dark text-slate-300 hover:border-mcu-cyan/40 hover:text-white'
                      }`}
                    >
                      {movie.watched ? 'Watched ✓' : 'Mark as Done'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
