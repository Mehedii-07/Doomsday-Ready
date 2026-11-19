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
      // Reset form and close
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-mcu-card border border-mcu-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mcu-border/80 bg-mcu-dark/60">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-mcu-cyan" />
            <h3 className="text-lg font-bold text-white tracking-wide">Add New MCU Movie</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start space-x-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Movie Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fantastic Four: First Steps"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-mcu-dark border border-mcu-border text-white placeholder-slate-500 focus:outline-none focus:border-mcu-cyan focus:ring-1 focus:ring-mcu-cyan transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-mcu-gold" />
                <span>Release Year</span>
              </label>
              <input
                type="number"
                required
                min={1900}
                max={2050}
                value={releaseYear}
                onChange={e => setReleaseYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-mcu-dark border border-mcu-border text-white focus:outline-none focus:border-mcu-cyan text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-mcu-cyan" />
                <span>Runtime (mins, 1-300)</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={300}
                value={runtime}
                onChange={e => setRuntime(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-mcu-dark border border-mcu-border text-white focus:outline-none focus:border-mcu-cyan text-sm"
              />
            </div>
          </div>

          {/* Watched Status */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="new-movie-watched"
              checked={watched}
              onChange={e => setWatched(e.target.checked)}
              className="w-4 h-4 rounded border-mcu-border text-mcu-cyan focus:ring-mcu-cyan bg-mcu-dark"
            />
            <label htmlFor="new-movie-watched" className="text-sm font-medium text-slate-300 cursor-pointer">
              I have already watched this movie
            </label>
          </div>

          {/* Prerequisites Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <CheckSquare className="w-3.5 h-3.5 text-mcu-cyan" />
              <span>Prerequisites (Movies to watch before this)</span>
            </label>
            <div className="max-h-40 overflow-y-auto p-2.5 rounded-xl bg-mcu-dark border border-mcu-border space-y-1.5">
              {existingMovies.length === 0 ? (
                <p className="text-xs text-slate-500 py-1">No other movies available</p>
              ) : (
                existingMovies.map(movie => (
                  <label
                    key={movie.id}
                    className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-sm text-slate-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPrereqIds.includes(movie.id)}
                      onChange={() => handlePrereqToggle(movie.id)}
                      className="w-4 h-4 rounded border-mcu-border text-mcu-cyan focus:ring-mcu-cyan bg-mcu-dark"
                    />
                    <span className="truncate">{movie.title} ({movie.release_year})</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-mcu-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-mcu-red to-mcu-redDark hover:opacity-90 text-white shadow-glow-red transition-all flex items-center space-x-2"
            >
              {loading ? (
                <span>Adding Movie...</span>
              ) : (
                <span>Save Movie</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
