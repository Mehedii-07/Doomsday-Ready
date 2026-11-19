import React from 'react';
import { Film, Shield, Ticket, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'movies' | 'plan' | 'booking';
  setActiveTab: (tab: 'movies' | 'plan' | 'booking') => void;
  apiOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, apiOnline }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-mcu-border/80 bg-mcu-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('movies')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-mcu-red to-mcu-redDark shadow-glow-red">
              <Shield className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-lg border border-white/20 animate-pulse pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white">
                  DOOMSDAY <span className="text-mcu-red">READY</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-mcu-red/20 text-mcu-red border border-mcu-red/30">
                  MCU Core
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Blinto Talent Accelerator 2027 Full-Stack System
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('movies')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'movies'
                  ? 'bg-mcu-card border border-mcu-cyan/50 text-mcu-cyan shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Movies</span>
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'plan'
                  ? 'bg-mcu-card border border-mcu-cyan/50 text-mcu-cyan shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Rewatch Plan</span>
            </button>

            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'booking'
                  ? 'bg-mcu-card border border-mcu-cyan/50 text-mcu-cyan shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Cinema Booking</span>
            </button>
          </nav>

          {/* Health status badge */}
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-mcu-card/70 px-3 py-1.5 rounded-full border border-mcu-border">
            <span
              className={`w-2 h-2 rounded-full ${
                apiOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' : 'bg-red-500 animate-ping'
              }`}
            />
            <span>{apiOnline ? 'API Connected' : 'Offline'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
