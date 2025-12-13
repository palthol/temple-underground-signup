/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#9B1B30',
          bronze: '#C17900',
          gold: '#F2C94C',
          dark: '#101522',
          mid: '#1E2433',
          light: '#F7F7F7',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};


