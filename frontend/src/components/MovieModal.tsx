import React, { useState } from 'react';
import { X, Film, Clock, Calendar, CheckSquare, AlertCircle } from 'lucide-react';
import { Movie, MovieCreatePayload } from '../types';

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MovieCreatePayload) => Promise<void>;
  existingMovies: Movie[];
}

export const MovieModal: React.FC<MovieModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingMovies,
}) => {
  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [runtime, setRuntime] = useState<number>(120);
  const [watched, setWatched] = useState(false);
  const [selectedPrereqIds, setSelectedPrereqIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrereqToggle = (id: number) => {
    setSelectedPrereqIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (runtime < 1 || runtime > 300) {
      setError('Runtime must be between 1 and 300 minutes');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        title: title.trim(),
        release_year: Number(releaseYear),
        runtime: Number(runtime),
        watched,
        prerequisite_ids: selectedPrereqIds,
      });
      setTitle('');
      setReleaseYear(new Date().getFullYear());
      setRuntime(120);
      setWatched(false);
      setSelectedPrereqIds([]);
      onClose();
    } catch (err: any) {
      setError(err?.data?.detail || err?.message || 'Failed to create movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-astral-surface border border-white/10 rounded-3xl shadow-cinematic overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/10 bg-[#090E20]/90">
          <div className="flex items-center space-x-2.5">
            <Film className="w-5 h-5 text-emerald-400" />
            <h3 className="font-cinematic text-2xl text-white tracking-wide uppercase">Add MCU Premiere</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with cinematic-input */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-start space-x-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Movie Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fantastic Four: First Steps"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl cinematic-input text-sm font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                <span>Release Year</span>
              </label>
              <input
                type="number"
                required
                min={1900}
                max={2050}
                value={releaseYear}
                onChange={e => setReleaseYear(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl cinematic-input text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Runtime (1-300 min)</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={300}
                value={runtime}
                onChange={e => setRuntime(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl cinematic-input text-sm font-mono"
              />
            </div>
          </div>

          {/* Watched Status Checkbox */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#080D1C] border border-white/5">
            <input
              type="checkbox"
              id="new-movie-watched"
              checked={watched}
              onChange={e => setWatched(e.target.checked)}
              className="w-4 h-4 rounded border-mcu-border text-emerald-500 focus:ring-emerald-500 bg-mcu-dark cursor-pointer"
            />
            <label htmlFor="new-movie-watched" className="text-xs sm:text-sm font-medium text-slate-300 cursor-pointer">
              Mark as already watched in theaters
            </label>
          </div>

          {/* Prerequisites Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Direct Prerequisites</span>
            </label>
            <div className="max-h-48 overflow-y-auto p-3 rounded-2xl bg-[#080D1C] border border-white/10 space-y-1.5 shadow-inner">
              {existingMovies.length === 0 ? (
                <p className="text-xs text-slate-500 py-1">No other movies available</p>
              ) : (
                existingMovies.map(movie => (
                  <label
                    key={movie.id}
                    className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-white/5 cursor-pointer text-xs sm:text-sm text-slate-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPrereqIds.includes(movie.id)}
                      onChange={() => handlePrereqToggle(movie.id)}
                      className="w-4 h-4 rounded border-mcu-border text-emerald-400 focus:ring-emerald-400 bg-mcu-dark"
                    />
                    <span className="truncate">{movie.title} ({movie.release_year})</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white shadow-glow-doom transition-all"
            >
              {loading ? 'Creating...' : 'Save Premiere'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
