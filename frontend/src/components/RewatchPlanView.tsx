import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Calendar,
  AlertCircle,
  TrendingUp,
  Clapperboard,
  Check,
  RotateCcw,
  CheckCheck,
  Filter,
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
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [filterUnwatchedOnly, setFilterUnwatchedOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live Countdown to May 1, 2026 Avengers: Doomsday premiere
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const premiereTime = new Date('2026-05-01T00:00:00Z').getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, premiereTime - now);
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

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
      await onMovieWatchedToggled();
      if (selectedMovieId) {
        await fetchPlan(selectedMovieId);
      }
    } catch (err: any) {
      console.error('Failed to toggle watched status', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleMarkAllWatched = async () => {
    if (!plan || plan.rewatch_order.length === 0) return;
    const unwatched = plan.rewatch_order.filter(m => !m.watched);
    if (unwatched.length === 0) return;

    try {
      setIsBulkUpdating(true);
      await Promise.all(
        unwatched.map(m => api.updateMovie(m.id, { watched: true }))
      );
      await onMovieWatchedToggled();
      if (selectedMovieId) {
        await fetchPlan(selectedMovieId);
      }
    } catch (err: any) {
      console.error('Failed to mark all watched', err);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleResetAllProgress = async () => {
    if (!plan || plan.rewatch_order.length === 0) return;
    const watched = plan.rewatch_order.filter(m => m.watched);
    if (watched.length === 0) return;

    try {
      setIsBulkUpdating(true);
      await Promise.all(
        watched.map(m => api.updateMovie(m.id, { watched: false }))
      );
      await onMovieWatchedToggled();
      if (selectedMovieId) {
        await fetchPlan(selectedMovieId);
      }
    } catch (err: any) {
      console.error('Failed to reset progress', err);
    } finally {
      setIsBulkUpdating(false);
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

  const totalCount = plan?.total_count || 0;
  const watchedCount = plan?.watched_count || 0;
  const progressPct = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 100;

  const displayMovies = plan?.rewatch_order.filter(m => {
    if (filterUnwatchedOnly) return !m.watched;
    return true;
  }) || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Astral Cosmic Header & Projection Controller */}
      <div className="relative rounded-3xl p-6 sm:p-10 border border-astral-border/80 bg-gradient-to-br from-[#121B38] via-[#0C1225] to-[#070A14] shadow-cinematic overflow-hidden">
        {/* Neon Light Flares */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-astral-cyan/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-astral-emerald/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>TOPOLOGICAL SORT REWATCH TIMELINE</span>
            </div>

            <h1 className="font-cinematic text-3xl sm:text-4xl lg:text-5xl tracking-wider text-white uppercase leading-none">
              Roadmap: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">{currentMovie?.title || 'Selected Premiere'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              Every prerequisite is mathematically organized using Kahn's DAG algorithm so every required plot milestone is watched strictly in chronological order before the target premiere.
            </p>
          </div>

          {/* Right Header: Target Dropdown & Doomsday Countdown */}
          <div className="w-full lg:w-96 flex-shrink-0 space-y-3">
            {/* Live Avengers: Doomsday Premiere Countdown HUD */}
            <div className="p-3.5 rounded-2xl bg-[#090E20]/90 border border-white/10 backdrop-blur-md shadow-inner flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-[11px] font-mono font-bold uppercase text-slate-300 tracking-wider">
                  DOOMSDAY PREMIERE
                </span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono text-xs font-extrabold text-white">
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-emerald-400">{countdown.days}d</span>
                <span>:</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-400">{countdown.hours}h</span>
                <span>:</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-yellow-400">{countdown.minutes}m</span>
                <span>:</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-red-400">{countdown.seconds}s</span>
              </div>
            </div>

            {/* Premiere Target Dropdown */}
            <div className="bg-[#090E20]/90 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
              <label className="block text-xs font-mono uppercase tracking-widest text-slate-300 mb-1.5 flex items-center space-x-1.5 font-bold">
                <Clapperboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target Premiere</span>
              </label>
              <select
                value={selectedMovieId || ''}
                onChange={e => onSelectMovieId(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl cinematic-select text-sm font-semibold tracking-wide font-sans"
              >
                {movies.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#090E20] text-white">
                    {m.title} ({m.release_year})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Progress & Runtime Theatrical Meter */}
        {plan && (
          <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Progress Gauge */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-slate-200 flex items-center space-x-2 font-mono uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>
                    Prerequisite Progress: <strong className="text-white font-sans">{watchedCount} of {totalCount} Seen</strong>
                  </span>
                </span>
                <span className="font-mono font-extrabold text-base sm:text-lg text-emerald-400">
                  {progressPct}%
                </span>
              </div>

              {/* Glowing High-Tech Progress Bar */}
              <div className="w-full h-4 rounded-full bg-[#080D1C] overflow-hidden border border-white/10 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700 shadow-glow-doom"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Phase 1 Initiation</span>
                <span>Infinity Climax</span>
                <span>Doomsday Ready</span>
              </div>
            </div>

            {/* Remaining Runtime Card */}
            <div className="p-5 rounded-2xl bg-[#090E20]/90 border border-white/10 flex items-center space-x-4 shadow-lg">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-widest font-mono font-bold block">
                  Remaining Screen Time
                </span>
                <span className="text-lg sm:text-xl font-bold font-cinematic tracking-wide text-white block mt-0.5">
                  {plan.remaining_runtime === 0
                    ? 'READY FOR DOOMSDAY 🎉'
                    : formatRuntime(plan.remaining_runtime)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ordered Prerequisite Timeline List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <h2 className="font-cinematic text-2xl sm:text-3xl tracking-wide text-white flex items-center space-x-2 uppercase">
            <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
            <span>Chronological Prerequisite Sequence</span>
          </h2>

          {/* Timeline Action Strip */}
          {plan && plan.rewatch_order.length > 0 && (
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {/* Unwatched Only Toggle */}
              <button
                onClick={() => setFilterUnwatchedOnly(!filterUnwatchedOnly)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                  filterUnwatchedOnly
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-glow-cyan'
                    : 'bg-astral-surface border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{filterUnwatchedOnly ? 'Showing Unwatched' : 'All Milestones'}</span>
              </button>

              {/* Mark All Watched */}
              <button
                onClick={handleMarkAllWatched}
                disabled={isBulkUpdating || watchedCount === totalCount}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                title="Mark all prerequisites on this roadmap as watched"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Watched</span>
              </button>

              {/* Reset Progress */}
              <button
                onClick={handleResetAllProgress}
                disabled={isBulkUpdating || watchedCount === 0}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#090E20] hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Reset all watched marks for this roadmap"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isBulkUpdating ? 'animate-spin' : ''}`} />
                <span>Reset</span>
              </button>

              <span className="text-xs font-mono text-slate-400 bg-astral-surface/90 px-3 py-1.5 rounded-xl border border-astral-border">
                {plan.total_count} Steps
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-xs uppercase tracking-wider">Solving Kahn's Topological Sort...</span>
          </div>
        ) : error ? (
          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        ) : !plan || plan.rewatch_order.length === 0 ? (
          <div className="p-10 sm:p-14 rounded-3xl bg-astral-surface/80 border border-white/10 text-center space-y-3">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto" />
            <h3 className="font-cinematic text-3xl text-white tracking-wider">Zero Prerequisites Required!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto font-sans">
              <strong>{currentMovie?.title}</strong> is a self-contained saga genesis or standalone milestone. You are ready to stream immediately!
            </p>
          </div>
        ) : filterUnwatchedOnly && displayMovies.length === 0 ? (
          <div className="p-10 sm:p-14 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-cinematic text-3xl text-white tracking-wider">All Prerequisites Watched!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto font-sans">
              You have completed every transitive prerequisite leading to <strong>{currentMovie?.title}</strong>. You are completely ready for premiere night!
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-400 before:to-cyan-400">
            {displayMovies.map((movie, index) => {
              const isToggling = togglingId === movie.id;
              return (
                <div
                  key={movie.id}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 gap-4 ${
                    movie.watched
                      ? 'bg-emerald-950/20 border-emerald-500/30 opacity-85 hover:opacity-100 shadow-[0_0_15px_rgba(16,185,129,0.06)]'
                      : 'bg-astral-surface/90 border-astral-border hover:border-emerald-400/70 hover:shadow-glow-doom'
                  }`}
                >
                  {/* Timeline Node Pin */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-6 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      movie.watched
                        ? 'bg-emerald-500 border-emerald-300 text-black shadow-glow-doom'
                        : 'bg-[#070A14] border-emerald-400 text-emerald-300'
                    }`}
                  >
                    {movie.watched ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Left Info & Title */}
                  <div className="flex items-center space-x-3.5">
                    {/* Interactive Watch Checkbox */}
                    <button
                      onClick={() => handleToggleWatched(movie)}
                      disabled={isToggling}
                      className="p-1 rounded-lg text-left focus:outline-none group/chk"
                      title={movie.watched ? 'Click to mark unwatched' : 'Click to mark watched'}
                    >
                      {movie.watched ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 group-hover/chk:scale-110 transition-transform" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500 group-hover/chk:text-emerald-400 transition-colors" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span
                          className={`font-cinematic text-2xl tracking-wide ${
                            movie.watched ? 'text-slate-300 line-through' : 'text-white'
                          }`}
                        >
                          {movie.title}
                        </span>

                        {movie.watched && (
                          <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Completed ✓
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-yellow-400" />
                          <span>{movie.release_year}</span>
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{movie.runtime} min ({formatRuntime(movie.runtime)})</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div className="flex items-center justify-end sm:flex-shrink-0">
                    <button
                      onClick={() => handleToggleWatched(movie)}
                      disabled={isToggling}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl border text-xs font-mono font-bold tracking-wider uppercase transition-all ${
                        movie.watched
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'border-white/10 bg-[#070A14] text-slate-200 hover:border-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      {movie.watched ? 'Mark as Unwatched' : 'Mark as Watched'}
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
