import React, { useState } from 'react';
import { Film, Shield, Ticket, Sparkles, Menu, X, Radio } from 'lucide-react';

interface NavbarProps {
  activeTab: 'movies' | 'plan' | 'booking';
  setActiveTab: (tab: 'movies' | 'plan' | 'booking') => void;
  apiOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, apiOnline }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabSwitch = (tab: 'movies' | 'plan' | 'booking') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-astral-border/70 bg-[#070A14]/85 backdrop-blur-2xl shadow-lg">
      {/* Top Iridescent Cosmic Aura Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-astral-violet via-astral-cyan via-astral-emerald via-astral-gold to-astral-crimson opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Cinematic Brand */}
          <div
            className="flex items-center space-x-3.5 cursor-pointer group select-none"
            onClick={() => handleTabSwitch('movies')}
          >
            {/* The Doom Mask / Shield Sigil */}
            <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-900 to-[#070A14] border border-emerald-400/40 shadow-glow-doom group-hover:scale-105 transition-all">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-200 stroke-[2.2]" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <div className="absolute -bottom-1 w-4 h-1 bg-astral-cyan rounded-full shadow-[0_0_10px_#00E5FF]" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-cinematic text-2xl sm:text-3xl tracking-widest text-white leading-none uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                  DOOMSDAY <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">READY</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  PHASE 6
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-sans tracking-wide text-slate-400 font-medium">
                Blinto Talent Accelerator 2027 &bull; Celestial Cinematic Engine
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-2 bg-astral-surface/90 p-1.5 rounded-2xl border border-astral-border shadow-inner">
            <button
              onClick={() => handleTabSwitch('movies')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeTab === 'movies'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-700 text-white shadow-glow-doom font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4" />
              <span className="tracking-wide">Movies Vault</span>
            </button>

            <button
              onClick={() => handleTabSwitch('plan')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeTab === 'plan'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black shadow-glow-cyan font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="tracking-wide">Rewatch Planner</span>
            </button>

            <button
              onClick={() => handleTabSwitch('booking')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeTab === 'booking'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-600 text-black shadow-glow-gold font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span className="tracking-wide">Cinema Booking</span>
            </button>
          </nav>

          {/* Right Status Badge & Mobile Hamburger */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2.5 text-xs text-slate-300 bg-astral-surface/90 px-3.5 py-1.5 rounded-full border border-astral-border shadow-sm">
              <Radio className={`w-3.5 h-3.5 ${apiOnline ? 'text-emerald-400 animate-pulse' : 'text-red-500'}`} />
              <span className="font-mono text-[11px] tracking-wider text-slate-300">
                {apiOnline ? 'CELESTIAL NET LIVE' : 'CONNECTING...'}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-2xl bg-astral-surface border border-astral-border text-slate-300 hover:text-white hover:border-emerald-400 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-astral-border bg-[#080D1E]/98 px-4 pt-3 pb-6 space-y-2.5 backdrop-blur-2xl animate-fadeIn">
          <div className="flex items-center justify-between py-1 px-2 mb-1 border-b border-white/5 text-[11px] text-slate-400 uppercase tracking-widest font-mono">
            <span>Navigation View</span>
            <span className={`inline-flex items-center space-x-1 ${apiOnline ? 'text-emerald-400' : 'text-red-400'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{apiOnline ? 'Database Connected' : 'Offline'}</span>
            </span>
          </div>

          <button
            onClick={() => handleTabSwitch('movies')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'movies'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-700 text-white shadow-glow-doom font-bold'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Film className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <div className="text-left">
              <div className="leading-tight">Movies Vault</div>
              <div className="text-[11px] opacity-75 font-normal">Catalog, timeline & prerequisites</div>
            </div>
          </button>

          <button
            onClick={() => handleTabSwitch('plan')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'plan'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black shadow-glow-cyan font-bold'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-5 h-5 flex-shrink-0 text-cyan-400" />
            <div className="text-left">
              <div className="leading-tight">Rewatch Planner</div>
              <div className="text-[11px] opacity-75 font-normal">Topological DAG roadmap</div>
            </div>
          </button>

          <button
            onClick={() => handleTabSwitch('booking')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'booking'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-600 text-black shadow-glow-gold font-bold'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Ticket className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <div className="text-left">
              <div className="leading-tight">Cinema Booking</div>
              <div className="text-[11px] opacity-75 font-normal">Dynamic Programming solver</div>
            </div>
          </button>
        </div>
      )}
    </header>
  );
};
