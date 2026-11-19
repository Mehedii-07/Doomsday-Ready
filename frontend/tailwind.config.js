/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mcu: {
          bg: '#05060A',
          dark: '#0A0D18',
          card: '#101426',
          cardHover: '#161D36',
          border: '#1F2947',
          borderLight: '#2D3A63',
          red: '#E62429',
          redDark: '#8A0F13',
          cyan: '#00E5FF',
          cyanGlow: 'rgba(0, 229, 255, 0.25)',
          gold: '#FFB800',
          doom: '#10B981',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        cinematic: ['"Bebas Neue"', 'sans-serif'],
        title: ['"Cinzel"', 'serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 229, 255, 0.3)',
        'glow-red': '0 0 30px rgba(230, 36, 41, 0.35)',
        'glow-gold': '0 0 25px rgba(255, 184, 0, 0.3)',
        'glow-doom': '0 0 25px rgba(16, 185, 129, 0.35)',
        'cinematic': '0 20px 50px rgba(0, 0, 0, 0.8)',
      },
      backgroundImage: {
        'radial-vignette': 'radial-gradient(circle at center, transparent 30%, rgba(5,6,10,0.95) 100%)',
        'doomsday-gradient': 'linear-gradient(135deg, rgba(230,36,41,0.15) 0%, rgba(10,13,24,0.8) 50%, rgba(16,185,129,0.12) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

