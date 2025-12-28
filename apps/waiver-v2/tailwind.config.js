/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#EF4444',
          bronze: '#C08457',
          gold: '#FACC15',
          dark: '#0F172A',
          mid: '#111827',
          light: '#F8FAFC',
          surface: '#FFFFFF',
          'surface-variant': '#F3F4F6',
          outline: '#CBD5F5',
          'on-surface': '#1E293B',
          primary: '#2563EB',
          'primary-container': '#0C1E70',
          secondary: '#475569',
          accent: '#8B5CF6',
          'accent-secondary': '#EC4899',
          'accent-tertiary': '#38BDF8',
          error: '#DC2626',
        },
      },
      borderRadius: {
        layout: '24px',
        card: '20px',
      },
      fontFamily: {
        sans: ['"Roboto"', '"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'brand-soft': '0 20px 60px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};


