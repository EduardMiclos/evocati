/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark professional palette: deep slate/navy base with a warm gold accent.
        ink: {
          950: '#070a12',
          900: '#0b0f1a',
          850: '#0f1524',
          800: '#141c2e',
          700: '#1d2740',
          600: '#28344f',
        },
        gold: {
          300: '#f5d98b',
          400: '#e8c46b',
          500: '#d4a94a',
          600: '#b98f34',
        },
        accent: {
          400: '#5eb0f7',
          500: '#3b9df0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(212,169,74,0.15), 0 20px 60px -20px rgba(212,169,74,0.35)',
        card: '0 20px 50px -25px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        'radial-fade':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,169,74,0.18), transparent 60%)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
