/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0F172A',
          mid: '#334155',
          primary: '#2563EB',
          surface: '#FFFFFF',
          'surface-variant': '#F1F5F9',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
