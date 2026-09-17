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
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          cardHover: '#F1F5F9',
          border: '#E2E8F0',
          borderHover: '#CBD5E1',
          nav: 'rgba(255, 255, 255, 0.85)',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          accent: '#06B6D4',
          glow: 'rgba(99, 102, 241, 0.15)'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'floating': '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 25px 0 rgba(99, 102, 241, 0.1)',
        'floating-hover': '0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px 0 rgba(99, 102, 241, 0.22)',
        'glow-cyan': '0 0 30px 0 rgba(6, 182, 212, 0.25)',
        'glow-emerald': '0 0 30px 0 rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
