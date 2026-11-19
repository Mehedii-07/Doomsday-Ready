import React, { useState } from 'react';
import {
  Play,
  Clock,
  Calendar,
  Sparkles,
  Volume2,
  Tv,
  Maximize2,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { Movie } from '../types';

interface CinemaTVDisplayProps {
  movies: Movie[];
  selectedMovie: Movie | null;
  onSelectMovie: (movie: Movie) => void;
  onToggleWatched: (movie: Movie) => void;
  onViewPlan: (movieId: number) => void;
}

export const CinemaTVDisplay: React.FC<CinemaTVDisplayProps> = ({
  movies,
  selectedMovie,
  onSelectMovie,
  onToggleWatched,
  onViewPlan,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Default to Doomsday or first movie if none selected
  const activeMovie = selectedMovie || movies.find(m => m.title.includes('Doomsday')) || movies[0];

  if (!activeMovie) return null;

  // Determine ambient lighting color according to active movie
  const getAmbientGlow = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('doomsday')) {
      return {
        glow: 'rgba(16, 185, 129, 0.45)',
        accent: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        tag: 'PHASE 6 CLIMAX &bull; LATVERIA ONSLAUGHT',
        bgCover: 'from-emerald-950/80 via-slate-950/90 to-black',
      };
    }
    if (t.includes('endgame') || t.includes('infinity war')) {
      return {
        glow: 'rgba(139, 92, 246, 0.45)',
        accent: 'text-violet-400',
        badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
        tag: 'INFINITY SAGA CLIMAX &bull; THANOS WAR',
        bgCover: 'from-violet-950/80 via-slate-950/90 to-black',
      };
    }
    if (t.includes('civil war') || t.includes('captain america')) {
      return {
        glow: 'rgba(0, 229, 255, 0.4)',
        accent: 'text-cyan-400',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        tag: 'AVENGERS DIVIDED &bull; CAPTAIN AMERICA',
        bgCover: 'from-blue-950/80 via-slate-950/90 to-black',
      };
    }
    if (t.includes('iron man')) {
      return {
        glow: 'rgba(230, 36, 41, 0.45)',
        accent: 'text-red-400',
        badge: 'bg-red-500/20 text-red-300 border-red-500/40',
        tag: 'MCU GENESIS &bull; STARK INDUSTRIES',
        bgCover: 'from-red-950/80 via-slate-950/90 to-black',
      };
    }
    return {
      glow: 'rgba(255, 184, 0, 0.4)',
      accent: 'text-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      tag: 'MARVEL CANON MILESTONE',
      bgCover: 'from-slate-900/90 via-slate-950/90 to-black',
    };
  };

  const theme = getAmbientGlow(activeMovie.title);

  return (
    <div className="relative my-8 sm:my-10 animate-fadeIn">
      {/* TV Frame Container */}
      <div className="relative cinematic-tv-frame max-w-5xl mx-auto overflow-hidden">
        {/* Dynamic Ambilight Glow behind screen */}
        <div
          className="tv-ambilight"
          style={{
            background: `radial-gradient(ellipse at center, ${theme.glow} 0%, rgba(7, 10, 20, 0) 70%)`,
          }}
        />

        {/* TV Top Bezel Header: Sensor & Screen Spec */}
        <div className="flex items-center justify-between px-3 pb-2.5 text-[10px] font-mono tracking-widest text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
            <span className="text-slate-300 uppercase font-bold">IMAX LASER 8K HUD</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <span className="hidden sm:inline">DOLBY VISION &bull; ATMOS</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="hover:text-white transition-colors"
              title="Toggle Audio Simulation"
            >
              <Volume2 className={`w-3.5 h-3.5 ${soundEnabled ? 'text-cyan-400' : 'text-slate-600'}`} />
            </button>
            <Tv className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* The Screen Display */}
        <div className="cinematic-screen relative aspect-[16/9] sm:aspect-[21/9] w-full flex flex-col justify-between p-5 sm:p-8 select-none">
          {/* Background Ambient Art Cover */}
          <div className={`absolute inset-0 bg-gradient-to-r ${theme.bgCover} z-0 opacity-90`} />

          {/* Top Screen HUD: Tag & Projection Status */}
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-[10px] font-mono font-bold tracking-widest uppercase backdrop-blur-md shadow-sm"
              style={{ borderColor: theme.glow }}
            >
              <Flame className="w-3 h-3 text-yellow-400 animate-pulse" />
              <span className="text-white">{theme.tag}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-slate-300">
                FRAME: 2.39:1 CINEMASCOPE
              </span>
              <button
                onClick={() => onViewPlan(activeMovie.id)}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                title="Open Fullscreen Roadmap"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Center Title & Theatrical Info */}
          <div className="relative z-10 space-y-2.5 max-w-2xl py-4">
            <div className="flex items-center space-x-3 text-xs font-mono text-slate-300">
              <span className="flex items-center space-x-1 bg-black/50 px-2 py-0.5 rounded border border-white/10">
                <Calendar className="w-3 h-3 text-yellow-400" />
                <span>{activeMovie.release_year}</span>
              </span>
              <span className="flex items-center space-x-1 bg-black/50 px-2 py-0.5 rounded border border-white/10">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{activeMovie.runtime} MINS</span>
              </span>
              {activeMovie.watched && (
                <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px] uppercase font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>PREVIOUSLY WATCHED</span>
                </span>
              )}
            </div>

            <h2 className="font-cinematic text-3xl sm:text-5xl lg:text-6xl text-white tracking-wider uppercase leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
              {activeMovie.title}
            </h2>

            {/* Direct Prerequisites Preview */}
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 pt-1 flex-wrap gap-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px]">Prerequisites:</span>
              {activeMovie.prerequisites && activeMovie.prerequisites.length > 0 ? (
                activeMovie.prerequisites.map(p => (
                  <span
                    key={p.id}
                    className="px-2 py-0.5 rounded bg-black/60 text-slate-200 border border-white/10 text-[10px]"
                  >
                    {p.title}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-500 italic">None &bull; Standalone Genesis Entry</span>
              )}
            </div>
          </div>

          {/* Bottom Screen Bar: Interactive Player Controls & Quick Selector */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
            {/* Play & Roadmap Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-glow-doom transition-all transform active:scale-95"
              >
                <Play className={`w-4 h-4 fill-white ${isPlaying ? 'animate-bounce' : ''}`} />
                <span>{isPlaying ? 'STREAMING ACTIVE' : 'STREAM PREVIEW'}</span>
              </button>

              <button
                onClick={() => onViewPlan(activeMovie.id)}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Calculate Order</span>
              </button>

              <button
                onClick={() => onToggleWatched(activeMovie)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-black/50 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 transition-colors"
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${activeMovie.watched ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{activeMovie.watched ? 'Seen' : 'Mark Seen'}</span>
              </button>
            </div>

            {/* Quick Channel / Movie Hopper */}
            <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase pr-1 hidden lg:inline">
                CHANNEL:
              </span>
              {movies.slice(0, 5).map(m => (
                <button
                  key={m.id}
                  onClick={() => onSelectMovie(m)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold truncate max-w-[110px] transition-all border ${
                    m.id === activeMovie.id
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-glow-doom'
                      : 'bg-black/50 text-slate-400 border-white/10 hover:text-white hover:border-slate-500'
                  }`}
                  title={m.title}
                >
                  {m.title.split(':')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TV Bottom Stand & Speaker Mesh */}
        <div className="mt-2.5 flex items-center justify-between px-4 text-[9px] font-mono text-slate-400">
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10B981]" />
            <span className="tracking-wider">STARK THEATER OS v2.7</span>
          </div>
          <div className="w-24 h-1 bg-white/10 rounded-full mx-auto" />
          <span className="tracking-widest">MCU QUANTUM HUD</span>
        </div>
      </div>
    </div>
  );
};
