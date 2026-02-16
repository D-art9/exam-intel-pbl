/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neo-black': '#0a0a0a',      // Deepest Black
        'neo-surface': '#121212',    // Slightly Lighter Black for Cards
        'neo-orange': '#ff5500',     // Electric / Safety Orange
        'neo-white': '#fafafa',      // Not quite pure white
        'glass-white': 'rgba(255, 255, 255, 0.05)',
        'glass-dim': 'rgba(0, 0, 0, 0.4)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'Space Grotesk', 'sans-serif'], // Recommend installing Space Grotesk
      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #ff5500', // Hard Shadow (Brutalist)
        'neo-sm': '2px 2px 0px 0px #ff5500',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'blur-in': 'blur-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
      },
      keyframes: {
        'blur-in': {
          '0%': { filter: 'blur(10px)', opacity: '0', transform: 'translateY(10px)' },
          '100%': { filter: 'blur(0)', opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Ensure this is installed
  ],
}
