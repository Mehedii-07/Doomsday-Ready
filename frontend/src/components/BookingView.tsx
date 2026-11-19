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
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Cinema Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 border border-astral-border/80 bg-gradient-to-br from-[#1C162E] via-[#0D1022] to-[#070A14] shadow-cinematic overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-astral-gold/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-astral-emerald/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-xs font-mono font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>DYNAMIC PROGRAMMING ALLOCATION</span>
            </div>

            <h1 className="font-cinematic text-3xl sm:text-4xl lg:text-5xl tracking-wider text-white uppercase leading-none">
              Watch-Party <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600">Cinema Booking</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              Calculate the absolute minimum total number of seat bundles required to seat your watch-party guests exactly, without leaving a single empty seat.
            </p>
          </div>

          <button
            onClick={() => setIsAddCinemaOpen(true)}
            className="self-start lg:self-center flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 hover:from-yellow-500 hover:to-amber-600 hover:text-black text-yellow-300 font-mono text-xs font-bold uppercase tracking-wider border border-yellow-500/40 shadow-glow-gold transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4 text-yellow-400" />
            <span>Add Venue</span>
          </button>
        </div>

        {/* Assessment Quick Presets */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <span className="text-[11px] uppercase font-mono font-bold tracking-widest text-slate-400 block mb-3">
            ASSESSMENT BENCHMARK PRESETS:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleQuickPreset('Grand Premiere', 44)}
              className="p-3.5 rounded-2xl bg-[#090E20]/90 border border-white/10 hover:border-yellow-400 text-left transition-all group shadow-sm hover:shadow-glow-gold"
            >
              <div className="text-xs font-cinematic text-white group-hover:text-yellow-400 tracking-wide text-base">
                Grand Premiere Hall
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Sizes [6, 9, 20] &bull; <strong className="text-yellow-400">44 Guests</strong>
              </div>
            </button>

            <button
              onClick={() => handleQuickPreset('Starplex', 6)}
              className="p-3.5 rounded-2xl bg-[#090E20]/90 border border-white/10 hover:border-cyan-400 text-left transition-all group shadow-sm hover:shadow-glow-cyan"
            >
              <div className="text-xs font-cinematic text-white group-hover:text-cyan-400 tracking-wide text-base">
                Starplex IMAX
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Sizes [1, 3, 4] &bull; <strong className="text-cyan-400">6 Guests</strong>
              </div>
            </button>

            <button
              onClick={() => handleQuickPreset('Metro', 11)}
              className="p-3.5 rounded-2xl bg-[#090E20]/90 border border-white/10 hover:border-blue-400 text-left transition-all group shadow-sm hover:shadow-glow-cyan"
            >
              <div className="text-xs font-cinematic text-white group-hover:text-blue-400 tracking-wide text-base">
                Metro Cinema
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Sizes [2, 5] &bull; <strong className="text-blue-400">11 Guests</strong>
              </div>
            </button>

            <button
              onClick={() => handleQuickPreset('Indie', 7)}
              className="p-3.5 rounded-2xl bg-[#090E20]/90 border border-white/10 hover:border-red-400 text-left transition-all group shadow-sm hover:shadow-glow-red"
            >
              <div className="text-xs font-cinematic text-white group-hover:text-red-400 tracking-wide text-base">
                Indie Screen
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Sizes [4, 6] &bull; <strong className="text-red-400">7 (Impossible)</strong>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Controls with Upgraded Field Area CSS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Venue & Configuration Form Area */}
        <div className="lg:col-span-1 p-6 sm:p-7 rounded-3xl bg-astral-surface/90 border border-astral-border space-y-6 shadow-xl">
          <h2 className="font-cinematic text-2xl tracking-wide text-white flex items-center space-x-2 uppercase">
            <Building className="w-5 h-5 text-yellow-400" />
            <span>Select Theater & Guests</span>
          </h2>

          {/* Select Cinema Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Cinema Venue
            </label>
            <div className="relative">
              <select
                value={selectedCinemaId || ''}
                onChange={e => setSelectedCinemaId(Number(e.target.value))}
                className="w-full px-4 py-3.5 rounded-2xl cinematic-select text-sm font-semibold tracking-wide"
              >
                {cinemas.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#090E20] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bundle Sizes Display */}
          {selectedCinema && (
            <div className="p-4 rounded-2xl bg-[#080D1C] border border-white/10 space-y-2 shadow-inner">
              <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-slate-400 block">
                Available Seat Bundle Sizes
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedCinema.bundle_sizes.map(size => (
                  <span
                    key={size}
                    className="px-3 py-1.5 rounded-xl bg-yellow-500/15 border border-yellow-500/35 text-yellow-300 text-xs font-mono font-bold shadow-sm"
                  >
                    {size} seats
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Party Size Input Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-yellow-400" />
                <span>Watch-Party Size</span>
              </span>
              <span className="font-mono text-yellow-400 font-bold">1 - 10,000 Guests</span>
            </label>
            <input
              type="number"
              min={1}
              max={10000}
              value={groupSize}
              onChange={e => setGroupSize(Number(e.target.value))}
              className="w-full px-4 py-3.5 rounded-2xl cinematic-input text-lg font-mono font-bold"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            {[6, 11, 44, 100, 500].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setGroupSize(amt)}
                className={`py-2 text-xs rounded-xl border font-mono font-semibold transition-all ${
                  groupSize === amt
                    ? 'bg-yellow-400 text-black border-yellow-400 shadow-glow-gold'
                    : 'bg-[#080D1C] hover:bg-white/10 text-slate-300 border-white/10'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>

          {/* Calculate Button */}
          <button
            onClick={() => handleCalculate()}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-600 hover:brightness-110 text-black font-extrabold text-sm uppercase tracking-wider shadow-glow-gold transition-all flex items-center justify-center space-x-2 transform active:scale-98"
          >
            {loading ? (
              <span>Running Solver...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Calculate Minimum Bundles</span>
              </>
            )}
          </button>
        </div>

        {/* Right DP Output */}
        <div className="lg:col-span-2">
          {error ? (
            <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-400 text-center space-y-2">
              <XCircle className="w-12 h-12 mx-auto text-red-400" />
              <h3 className="font-cinematic text-2xl tracking-wide">Allocation Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          ) : !bookingResult ? (
            <div className="p-16 rounded-3xl bg-astral-surface/70 border border-astral-border text-center text-slate-400 space-y-2">
              <Ticket className="w-14 h-14 mx-auto text-slate-600 mb-2" />
              <p className="font-cinematic text-2xl text-white">Awaiting Watch-Party Parameter</p>
              <p className="text-xs text-slate-500">Pick a cinema and group size to optimize bundle counts</p>
            </div>
          ) : bookingResult.possible ? (
            /* Feasible Result Ticket */
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121B38] via-[#0C1225] to-[#070A14] border border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.18)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exact Combination Feasible</span>
                  </div>
                  <h3 className="font-cinematic text-3xl sm:text-4xl text-white tracking-wide uppercase">
                    Optimal Bundle Solution
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Venue: <strong className="text-white">{bookingResult.cinema_name}</strong> &bull; Total Guests: <strong className="text-emerald-400 font-bold">{bookingResult.group_size}</strong>
                  </p>
                </div>

                {/* Total Bundles Hero Badge */}
                <div className="p-4 rounded-2xl bg-[#090E20] border border-emerald-500/40 text-center min-w-[140px] shadow-glow-doom">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 block">
                    Total Bundles
                  </span>
                  <span className="font-cinematic text-4xl sm:text-5xl text-emerald-400 mt-0.5 block leading-none">
                    {bookingResult.total_bundles}
                  </span>
                </div>
              </div>

              {/* Breakdown Cards */}
              <div>
                <span className="text-xs uppercase font-mono font-bold tracking-widest text-slate-300 block mb-3 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Optimal Seat Allocation Breakdown</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {bookingResult.breakdown &&
                    Object.entries(bookingResult.breakdown).map(([sizeStr, count]) => {
                      const size = Number(sizeStr);
                      const subtotal = size * count;
                      return (
                        <div
                          key={sizeStr}
                          className="p-4 rounded-2xl bg-[#090E20]/90 border border-white/10 flex items-center justify-between shadow-sm"
                        >
                          <div>
                            <div className="font-cinematic text-3xl text-white">
                              {size} <span className="text-xs font-mono text-slate-400 font-normal">Seats</span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                              {subtotal} total seats
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-mono font-bold text-yellow-400 tracking-widest block">
                              Quantity
                            </span>
                            <span className="font-cinematic text-3xl text-white">
                              &times; {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Formula & Verification */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300 font-mono flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Seat Verification:</span>
                <span className="text-emerald-300 font-bold">
                  {bookingResult.breakdown &&
                    Object.entries(bookingResult.breakdown)
                      .map(([size, count]) => `(${size} × ${count})`)
                      .join(' + ')}{' '}
                  = {bookingResult.group_size} Seats (Exact Match)
                </span>
              </div>
            </div>
          ) : (
            /* Impossible Result Card */
            <div className="p-10 rounded-3xl bg-red-950/20 border border-red-500/40 shadow-glow-red text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <XCircle className="w-10 h-10" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 inline-block mb-2">
                  NOT POSSIBLE
                </span>
                <h3 className="font-cinematic text-3xl text-white tracking-wide uppercase">
                  No Exact Partition Exists
                </h3>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto font-sans">
                  {bookingResult.message}
                </p>
                <p className="text-xs text-slate-500 mt-2 font-mono">
                  Bundle sizes [{selectedCinema?.bundle_sizes.join(', ')}] cannot sum to exactly {bookingResult.group_size} seats.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Cinema Venue Modal with Upgraded Field Area CSS */}
      {isAddCinemaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-astral-surface border border-white/10 rounded-3xl shadow-cinematic p-6 sm:p-8 space-y-5">
            <h3 className="font-cinematic text-2xl text-white tracking-wide uppercase">Add Theater Venue</h3>

            {addCinemaError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {addCinemaError}
              </div>
            )}

            <form onSubmit={handleCreateCinema} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Cinema Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stark Cinema Lounge"
                  value={newCinemaName}
                  onChange={e => setNewCinemaName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl cinematic-input text-sm font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Bundle Sizes (comma-separated, 1-500)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5, 10, 25"
                  value={newCinemaBundles}
                  onChange={e => setNewCinemaBundles(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl cinematic-input text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddCinemaOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCinema}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-yellow-400 hover:brightness-110 text-black shadow-glow-gold"
                >
                  {creatingCinema ? 'Creating...' : 'Create Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
