/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rappi: {
          DEFAULT: '#FF441F',
          dark: '#e03518',
          light: '#ff6b4a',
          bg: '#fff3f0',
        },
        attainment: {
          low: '#ef4444',
          mid: '#f59e0b',
          good: '#22c55e',
          high: '#059669',
        },
      },
    },
  },
  plugins: [],
}

