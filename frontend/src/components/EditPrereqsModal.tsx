import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, GitCommit, Check } from 'lucide-react';
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
      const isCircular =
        err?.status === 409 &&
        (err?.data?.code === 'CIRCULAR_DEPENDENCY' ||
          err?.data?.detail === 'CIRCULAR_DEPENDENCY');

      if (isCircular) {
        setCircularError(true);
        setErrorMessage(
          `Circular dependency paradox detected! Setting these prerequisites would cause '${movie.title}' to depend on itself.`
        );
      } else {
        setErrorMessage(err?.data?.detail || err?.message || 'Failed to update prerequisites');
      }
    } finally {
      setLoading(false);
    }
  };

  const candidateMovies = allMovies.filter(m => m.id !== movie.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-mcu-card border border-white/10 rounded-3xl shadow-cinematic overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-mcu-dark/80">
          <div className="flex items-center space-x-2.5">
            <GitCommit className="w-5 h-5 text-mcu-cyan" />
            <div>
              <h3 className="font-cinematic text-2xl text-white tracking-wide uppercase leading-tight">
                Prerequisites: <span className="text-mcu-cyan">{movie.title}</span>
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Direct predecessors required in canon order
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Prominent Circular Dependency Warning Banner */}
          {circularError && (
            <div className="p-4 sm:p-5 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-100 shadow-glow-red animate-pulse">
              <div className="flex items-start space-x-3.5">
                <ShieldAlert className="w-7 h-7 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-cinematic text-xl tracking-wider text-red-300 uppercase">
                    HTTP 409 CONFLICT: CIRCULAR DEPENDENCY
                  </h4>
                  <p className="text-xs text-red-200 mt-1 leading-relaxed">
                    {errorMessage}
                  </p>
                  <div className="mt-2 text-[10px] font-mono bg-black/50 p-2 rounded-lg border border-red-500/30 text-red-300">
                    STATUS: 409 &bull; CODE: CIRCULAR_DEPENDENCY (Directed Acyclic Graph Violation)
                  </div>
                </div>
              </div>
            </div>
          )}

          {!circularError && errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm">
              {errorMessage}
            </div>
          )}

          <div className="text-xs font-mono text-slate-300 bg-[#080D1C] p-3.5 rounded-2xl border border-white/10 flex items-center justify-between shadow-inner">
            <span>
              Configured Prerequisites: <strong className="text-emerald-400 font-bold">{selectedIds.length}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white underline text-[11px] font-mono"
            >
              Clear All
            </button>
          </div>

          {/* Candidate List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {candidateMovies.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6 font-mono">No other movies in database</p>
            ) : (
              candidateMovies.map(candidate => {
                const isSelected = selectedIds.includes(candidate.id);
                return (
                  <div
                    key={candidate.id}
                    onClick={() => handleToggle(candidate.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400/70 text-white shadow-glow-cyan'
                        : 'bg-black/40 border-white/5 text-slate-300 hover:border-slate-500 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-cyan-400 border-cyan-400 text-black'
                            : 'border-slate-600 bg-black'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm leading-tight">{candidate.title}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {candidate.release_year} &bull; {candidate.runtime} mins
                        </div>
                      </div>
                    </div>

                    {candidate.watched && (
                      <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Watched
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-mcu-dark/80 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-mcu-cyan to-blue-600 hover:brightness-110 text-black shadow-glow-cyan transition-all"
          >
            {loading ? 'Validating DAG...' : 'Save Prerequisites'}
          </button>
        </div>
      </div>
    </div>
  );
};
