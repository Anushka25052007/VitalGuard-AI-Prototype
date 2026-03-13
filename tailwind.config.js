/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "vg-bg": "#020817",
        "vg-card": "rgba(15, 23, 42, 0.9)",
        "vg-accent": "#22c55e",
        "vg-accent-soft": "rgba(34, 197, 94, 0.15)",
        "vg-border": "rgba(148, 163, 184, 0.35)",
        "vg-danger": "#ef4444",
        "vg-warning": "#f97316",
        "vg-safe": "#22c55e",
      },
    },
  },
  plugins: [],
};

