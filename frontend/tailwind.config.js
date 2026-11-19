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
          dark: '#08090E',
          card: '#111422',
          cardHover: '#181D33',
          border: '#232946',
          red: '#E62429',
          redDark: '#B71C1C',
          cyan: '#00E5FF',
          cyanGlow: 'rgba(0, 229, 255, 0.25)',
          gold: '#FBBF24',
          purple: '#A855F7',
          emerald: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.25)',
        'glow-red': '0 0 20px rgba(230, 36, 41, 0.3)',
      }
    },
  },
  plugins: [],
}
