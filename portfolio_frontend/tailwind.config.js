export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        ink: 'var(--text)',
        paper: 'var(--bg)',
        line: 'var(--border)',
        moss: 'var(--accent)',
        surface: 'var(--surface)',
        raised: 'var(--raised)',
        secondary: 'var(--secondary)',
        muted: 'var(--muted)',
        stone: {
          50: 'var(--surface)',
          100: 'var(--raised)',
          200: 'var(--border)',
          400: 'var(--muted)',
          500: 'var(--muted)',
          600: 'var(--secondary)',
          700: 'var(--text)',
          800: 'var(--text)',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Cascadia Code', 'Consolas', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
