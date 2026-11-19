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
        astral: {
          bg: '#070A14',
          surface: '#0C1224',
          card: '#121A33',
          cardHover: '#182344',
          border: '#1F2C52',
          borderLight: '#2C3E75',
          cyan: '#00E5FF',
          cyanGlow: 'rgba(0, 229, 255, 0.35)',
          emerald: '#10B981',
          emeraldGlow: 'rgba(16, 185, 129, 0.35)',
          crimson: '#E62429',
          crimsonGlow: 'rgba(230, 36, 41, 0.4)',
          gold: '#FFB800',
          goldGlow: 'rgba(255, 184, 0, 0.35)',
          violet: '#8B5CF6',
          violetGlow: 'rgba(139, 92, 246, 0.35)',
        },
        mcu: {
          bg: '#070A14',
          dark: '#0C1224',
          card: '#121A33',
          cardHover: '#182344',
          border: '#1F2C52',
          borderLight: '#2C3E75',
          red: '#E62429',
          redDark: '#8A0F13',
          cyan: '#00E5FF',
          cyanGlow: 'rgba(0, 229, 255, 0.35)',
          gold: '#FFB800',
          doom: '#10B981',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        cinematic: ['"Bebas Neue"', 'sans-serif'],
        title: ['"Cinzel"', 'serif'],
        mythic: ['"Cinzel Decorative"', 'serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 30px rgba(0, 229, 255, 0.35)',
        'glow-red': '0 0 35px rgba(230, 36, 41, 0.4)',
        'glow-gold': '0 0 30px rgba(255, 184, 0, 0.35)',
        'glow-doom': '0 0 30px rgba(16, 185, 129, 0.4)',
        'glow-violet': '0 0 30px rgba(139, 92, 246, 0.4)',
        'cinematic': '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 40px rgba(16, 185, 129, 0.1)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
      },
      backgroundImage: {
        'nebula-gradient': 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.22) 0%, rgba(16, 185, 129, 0.15) 35%, rgba(7, 10, 20, 0.95) 75%)',
        'doomsday-mesh': 'linear-gradient(135deg, rgba(230,36,41,0.2) 0%, rgba(12,18,36,0.85) 45%, rgba(16,185,129,0.2) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'aurora': 'aurora 15s ease infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      }
    },
  },
  plugins: [],
}
