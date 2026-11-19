import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert, GitCommit, Check } from 'lucide-react';
import { Movie } from '../types';

interface EditPrereqsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
  allMovies: Movie[];
  onSave: (movieId: number, prereqIds: number[]) => Promise<void>;
}

export const EditPrereqsModal: React.FC<EditPrereqsModalProps> = ({
  isOpen,
  onClose,
  movie,
  allMovies,
  onSave,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [circularError, setCircularError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (movie) {
      setSelectedIds(movie.prerequisite_ids || []);
      setCircularError(false);
      setErrorMessage(null);
    }
  }, [movie]);

  if (!isOpen || !movie) return null;

  const handleToggle = (id: number) => {
    setCircularError(false);
    setErrorMessage(null);
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setCircularError(false);
    setErrorMessage(null);
    setLoading(true);

    try {
      await onSave(movie.id, selectedIds);
      onClose();
    } catch (err: any) {
      // Check for 409 CIRCULAR_DEPENDENCY
      const isCircular =
        err?.status === 409 &&
        (err?.data?.code === 'CIRCULAR_DEPENDENCY' ||
          err?.data?.detail === 'CIRCULAR_DEPENDENCY');

      if (isCircular) {
        setCircularError(true);
        setErrorMessage(
          `Circular dependency detected! Adding these prerequisites creates an invalid timeline cycle where '${movie.title}' depends on itself.`
        );
      } else {
        setErrorMessage(err?.data?.detail || err?.message || 'Failed to update prerequisites');
      }
    } finally {
      setLoading(false);
    }
  };

  // Other movies that can be prerequisites (excluding self)
  const candidateMovies = allMovies.filter(m => m.id !== movie.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-mcu-card border border-mcu-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mcu-border/80 bg-mcu-dark/60">
          <div className="flex items-center space-x-2">
            <GitCommit className="w-5 h-5 text-mcu-cyan" />
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Edit Prerequisites for <span className="text-mcu-cyan">{movie.title}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure which movies must be watched before this one
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Prominent Circular Dependency Warning Banner */}
          {circularError && (
            <div className="p-4 rounded-xl bg-red-950/80 border-2 border-red-500 text-red-200 shadow-glow-red animate-bounce-short">
              <div className="flex items-start space-x-3">
                <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-red-300">
                    409 CONFLICT: CIRCULAR DEPENDENCY DETECTED
                  </h4>
                  <p className="text-xs text-red-200/90 mt-1 leading-relaxed">
                    {errorMessage}
                  </p>
                  <p className="text-[11px] text-red-400/80 mt-1.5 italic font-mono">
                    HTTP 409 Code: CIRCULAR_DEPENDENCY rejected by Directed Acyclic Graph validator.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* General Error Banner */}
          {!circularError && errorMessage && (
            <div className="flex items-start space-x-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
            <span>
              Selected Prerequisites: <strong className="text-mcu-cyan">{selectedIds.length}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white text-xs underline"
            >
              Clear All
            </button>
          </div>

          {/* Movie candidate list */}
          <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
            {candidateMovies.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No other movies in database</p>
            ) : (
              candidateMovies.map(candidate => {
                const isSelected = selectedIds.includes(candidate.id);
                return (
                  <div
                    key={candidate.id}
                    onClick={() => handleToggle(candidate.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-mcu-cyan/10 border-mcu-cyan/60 text-white shadow-glow-cyan'
                        : 'bg-mcu-dark/80 border-mcu-border/70 text-slate-300 hover:border-slate-500 hover:bg-mcu-dark'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-mcu-cyan border-mcu-cyan text-black'
                            : 'border-slate-600 bg-mcu-dark'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{candidate.title}</div>
                        <div className="text-xs text-slate-400">
                          {candidate.release_year} &bull; {candidate.runtime} mins
                        </div>
                      </div>
                    </div>

                    {candidate.watched && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Watched
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-mcu-dark/60 border-t border-mcu-border">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-mcu-cyan to-blue-600 hover:opacity-90 text-black font-bold shadow-glow-cyan transition-all flex items-center space-x-2"
          >
            {loading ? <span>Validating & Saving...</span> : <span>Save Prerequisites</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
