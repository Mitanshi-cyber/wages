/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef8ff',
          100: '#d9f1ff',
          500: '#1d9bf0',
          600: '#1677c2',
          700: '#0f5e9d',
        },
        ink: '#111827',
        muted: '#6b7280',
        border: '#e5e7eb',
      },
      boxShadow: {
        soft: '0 12px 30px rgba(17, 24, 39, 0.08)',
      },
    },
  },
  plugins: [],
};
