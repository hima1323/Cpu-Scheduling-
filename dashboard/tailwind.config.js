/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        bg:      '#050505',
        surface: '#0a0a0a',
        card:    '#111111',
        border:  '#1a1a1a',
        accent:  '#10b981',
        accentH: '#34d399',
        good:    '#22d3ee',
        warn:    '#f59e0b',
        danger:  '#ef4444',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease both',
        'slide-up':   'slideUp 0.4s ease both',
        'float':      'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s ease-in-out infinite',
        'aurora':     'aurora 15s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                                to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        float:     { '0%, 100%': { transform: 'translateY(0)' },          '50%': { transform: 'translateY(-12px)' } },
        glowPulse: { '0%, 100%': { opacity: 0.4 },                       '50%': { opacity: 1 } },
        shimmer:   { '0%':   { backgroundPosition: '-200% 0' },          '100%': { backgroundPosition: '200% 0' } },
        aurora:    { '0%, 100%': { transform: 'translate(0, 0) scale(1)' }, '33%': { transform: 'translate(30px, -20px) scale(1.05)' }, '66%': { transform: 'translate(-20px, 15px) scale(0.95)' } },
      },
    },
  },
  plugins: [],
}
