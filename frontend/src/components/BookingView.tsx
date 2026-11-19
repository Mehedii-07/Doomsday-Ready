import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Users,
  CheckCircle,
  XCircle,
  Sparkles,
  Layers,
  Plus,
  Building,
} from 'lucide-react';
import { Cinema, BookingResult } from '../types';
import { api } from '../services/api';

interface BookingViewProps {
  cinemas: Cinema[];
  onCinemaCreated: () => Promise<void>;
}

export const BookingView: React.FC<BookingViewProps> = ({ cinemas, onCinemaCreated }) => {
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [groupSize, setGroupSize] = useState<number>(44);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Cinema Form state
  const [isAddCinemaOpen, setIsAddCinemaOpen] = useState(false);
  const [newCinemaName, setNewCinemaName] = useState('');
  const [newCinemaBundles, setNewCinemaBundles] = useState('2, 4, 8');
  const [creatingCinema, setCreatingCinema] = useState(false);
  const [addCinemaError, setAddCinemaError] = useState<string | null>(null);

  // Default to Grand Premiere Hall if available, else first cinema
  useEffect(() => {
    if (!selectedCinemaId && cinemas.length > 0) {
      const grandPremiere = cinemas.find(c => c.name.includes('Grand Premiere'));
      if (grandPremiere) {
        setSelectedCinemaId(grandPremiere.id);
      } else {
        setSelectedCinemaId(cinemas[0].id);
      }
    }
  }, [cinemas, selectedCinemaId]);

  const selectedCinema = cinemas.find(c => c.id === selectedCinemaId);

  const handleCalculate = async (cinemaId?: number, size?: number) => {
    const targetCinemaId = cinemaId || selectedCinemaId;
    const targetGroupSize = size !== undefined ? size : groupSize;

    if (!targetCinemaId) return;

    if (targetGroupSize < 1 || targetGroupSize > 10000) {
      setError('Group size must be between 1 and 10,000');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.getBooking(targetCinemaId, targetGroupSize);
      setBookingResult(res);
    } catch (err: any) {
      setError(err?.data?.detail || err?.message || 'Failed to calculate booking');
      setBookingResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial calculation on load
  useEffect(() => {
    if (selectedCinemaId) {
      handleCalculate(selectedCinemaId, groupSize);
    }
  }, [selectedCinemaId]);

  const handleQuickPreset = (cinemaNameSub: string, size: number) => {
    const target = cinemas.find(c => c.name.toLowerCase().includes(cinemaNameSub.toLowerCase()));
    if (target) {
      setSelectedCinemaId(target.id);
      setGroupSize(size);
      handleCalculate(target.id, size);
    }
  };

  const handleCreateCinema = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddCinemaError(null);

    const sizes = newCinemaBundles
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);

    if (!newCinemaName.trim()) {
      setAddCinemaError('Cinema name is required');
      return;
    }
    if (sizes.length === 0 || sizes.length > 10) {
      setAddCinemaError('Please provide between 1 and 10 valid bundle sizes');
      return;
    }
    if (new Set(sizes).size !== sizes.length) {
      setAddCinemaError('Bundle sizes must all be distinct');
      return;
    }

    try {
      setCreatingCinema(true);
      await api.createCinema({
        name: newCinemaName.trim(),
        bundle_sizes: sizes,
      });
      await onCinemaCreated();
      setNewCinemaName('');
      setNewCinemaBundles('2, 4, 8');
      setIsAddCinemaOpen(false);
    } catch (err: any) {
      setAddCinemaError(err?.data?.detail || err?.message || 'Failed to create cinema');
    } finally {
      setCreatingCinema(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-mcu-card via-mcu-dark to-mcu-card border border-mcu-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-mcu-gold/10 border border-mcu-gold/30 text-mcu-gold text-xs font-bold tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unbounded Coin Change Dynamic Programming</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Watch-Party Cinema Booking
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Determine the absolute minimum number of seat bundles required to seat your watch-party guests exactly, without leaving empty seats.
            </p>
          </div>

          <button
            onClick={() => setIsAddCinemaOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-mcu-card hover:bg-white/10 text-white font-semibold text-xs border border-mcu-border transition-colors flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cinema Venue</span>
          </button>
        </div>

        {/* Quick Test Presets */}
        <div className="mt-6 pt-6 border-t border-mcu-border/60">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2.5">
            Specification Assessment Test Cases:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickPreset('Grand Premiere', 44)}
              className="text-xs px-3 py-1.5 rounded-lg bg-mcu-dark border border-mcu-border hover:border-mcu-cyan text-slate-300 hover:text-white transition-all font-mono"
            >
              Grand Premiere [6, 9, 20] &bull; Group 44
            </button>
            <button
              onClick={() => handleQuickPreset('Starplex', 6)}
              className="text-xs px-3 py-1.5 rounded-lg bg-mcu-dark border border-mcu-border hover:border-mcu-cyan text-slate-300 hover:text-white transition-all font-mono"
            >
              Starplex IMAX [1, 3, 4] &bull; Group 6
            </button>
            <button
              onClick={() => handleQuickPreset('Metro', 11)}
              className="text-xs px-3 py-1.5 rounded-lg bg-mcu-dark border border-mcu-border hover:border-mcu-cyan text-slate-300 hover:text-white transition-all font-mono"
            >
              Metro Cinema [2, 5] &bull; Group 11
            </button>
            <button
              onClick={() => handleQuickPreset('Indie', 7)}
              className="text-xs px-3 py-1.5 rounded-lg bg-mcu-dark border border-mcu-border hover:border-red-400 text-slate-300 hover:text-white transition-all font-mono"
            >
              Indie Screen [4, 6] &bull; Group 7 (Impossible)
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-mcu-card border border-mcu-border space-y-5">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Building className="w-4 h-4 text-mcu-cyan" />
            <span>Select Venue & Guests</span>
          </h2>

          {/* Select Cinema */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Cinema Venue
            </label>
            <select
              value={selectedCinemaId || ''}
              onChange={e => setSelectedCinemaId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-mcu-dark border border-mcu-border text-white text-sm focus:outline-none focus:border-mcu-cyan"
            >
              {cinemas.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Available Bundle Sizes Preview */}
          {selectedCinema && (
            <div className="p-3.5 rounded-xl bg-mcu-dark border border-mcu-border/70 space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                Available Bundle Sizes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCinema.bundle_sizes.map(size => (
                  <span
                    key={size}
                    className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono font-bold text-mcu-cyan"
                  >
                    {size} seats
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Group Size Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-mcu-gold" />
                <span>Group Size (1 - 10,000)</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">guests</span>
            </label>
            <input
              type="number"
              min={1}
              max={10000}
              value={groupSize}
              onChange={e => setGroupSize(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-mcu-dark border border-mcu-border text-white text-sm font-mono focus:outline-none focus:border-mcu-cyan"
            />
          </div>

          {/* Quick Increment Buttons */}
          <div className="flex items-center gap-1.5">
            {[10, 25, 50, 100, 500].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setGroupSize(amt)}
                className="flex-1 py-1 text-xs rounded bg-mcu-dark hover:bg-white/10 text-slate-400 hover:text-white border border-mcu-border font-mono transition-colors"
              >
                {amt}
              </button>
            ))}
          </div>

          {/* Calculate Button */}
          <button
            onClick={() => handleCalculate()}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-mcu-cyan to-blue-600 hover:opacity-95 text-black font-extrabold text-sm shadow-glow-cyan transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Running Dynamic Programming...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Calculate Minimum Bundles</span>
              </>
            )}
          </button>
        </div>

        {/* Right: DP Optimization Output */}
        <div className="lg:col-span-2">
          {error ? (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-center">
              <XCircle className="w-10 h-10 mx-auto mb-2 text-red-400" />
              <h3 className="font-bold text-lg">Calculation Error</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : !bookingResult ? (
            <div className="p-12 rounded-2xl bg-mcu-card border border-mcu-border text-center text-slate-400">
              <Ticket className="w-12 h-12 mx-auto mb-3 text-slate-500" />
              <p className="text-sm font-semibold">Select your venue and party size to run allocation</p>
            </div>
          ) : bookingResult.possible ? (
            /* Possible Result Card */
            <div className="p-6 sm:p-8 rounded-2xl bg-mcu-card border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Exact Match Feasible</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    Optimal Bundle Allocation Found
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Venue: <strong className="text-slate-200">{bookingResult.cinema_name}</strong> &bull; Total Guests: <strong className="text-mcu-cyan">{bookingResult.group_size}</strong>
                  </p>
                </div>

                {/* Total Bundles Hero Badge */}
                <div className="p-4 rounded-xl bg-mcu-dark border border-emerald-500/40 text-center min-w-[140px]">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                    Total Bundles
                  </span>
                  <span className="text-3xl font-extrabold text-emerald-400 font-mono mt-0.5 block">
                    {bookingResult.total_bundles}
                  </span>
                </div>
              </div>

              {/* Breakdown Cards */}
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-300 block mb-3 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-mcu-cyan" />
                  <span>Optimal Bundle Breakdown</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {bookingResult.breakdown &&
                    Object.entries(bookingResult.breakdown).map(([sizeStr, count]) => {
                      const size = Number(sizeStr);
                      const subtotal = size * count;
                      return (
                        <div
                          key={sizeStr}
                          className="p-4 rounded-xl bg-mcu-dark border border-mcu-border flex items-center justify-between"
                        >
                          <div>
                            <div className="text-lg font-bold text-white font-mono">
                              {size} <span className="text-xs font-normal text-slate-400">seats</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {subtotal} seats total
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs uppercase font-bold text-mcu-cyan tracking-wider block">
                              Quantity
                            </span>
                            <span className="text-xl font-extrabold text-white font-mono">
                              &times; {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Mathematical Verification Equation */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-mono flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-400">Seat Equation:</span>
                <span className="text-emerald-300 font-bold">
                  {bookingResult.breakdown &&
                    Object.entries(bookingResult.breakdown)
                      .map(([size, count]) => `(${size} × ${count})`)
                      .join(' + ')}{' '}
                  = {bookingResult.group_size} seats
                </span>
              </div>
            </div>
          ) : (
            /* Impossible Result Card */
            <div className="p-8 rounded-2xl bg-mcu-card border border-red-500/40 shadow-glow-red text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 inline-block mb-2">
                  NOT POSSIBLE
                </span>
                <h3 className="text-xl font-bold text-white">No Exact Combination Exists</h3>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                  {bookingResult.message}
                </p>
                <p className="text-xs text-slate-500 mt-2 font-mono">
                  Available bundle sizes: [{selectedCinema?.bundle_sizes.join(', ')}] cannot sum to exactly {bookingResult.group_size}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Cinema Modal */}
      {isAddCinemaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-mcu-card border border-mcu-border rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Cinema Venue</h3>

            {addCinemaError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {addCinemaError}
              </div>
            )}

            <form onSubmit={handleCreateCinema} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Cinema Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stark Cinema Lounge"
                  value={newCinemaName}
                  onChange={e => setNewCinemaName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-mcu-dark border border-mcu-border text-white text-sm focus:outline-none focus:border-mcu-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Bundle Sizes (comma-separated, 1-500 each)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5, 10, 25"
                  value={newCinemaBundles}
                  onChange={e => setNewCinemaBundles(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-mcu-dark border border-mcu-border text-white text-sm focus:outline-none focus:border-mcu-cyan font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-mcu-border">
                <button
                  type="button"
                  onClick={() => setIsAddCinemaOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCinema}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-mcu-cyan hover:opacity-90 text-black shadow-glow-cyan"
                >
                  {creatingCinema ? 'Creating...' : 'Create Cinema'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
