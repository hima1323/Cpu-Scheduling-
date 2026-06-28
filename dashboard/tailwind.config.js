/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        bg:      '#0a0a0f',
        surface: '#12121a',
        card:    '#1a1a28',
        border:  '#2a2a3d',
        accent:  '#6366f1',
        accentH: '#818cf8',
        good:    '#22d3ee',
        warn:    '#f59e0b',
        danger:  '#ef4444',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease both',
        'slide-up': 'slideUp 0.3s ease both',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
