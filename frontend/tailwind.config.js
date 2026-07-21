/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        color: "var(--border-color)",
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-card": "var(--bg-card)",
        "bg-card-hover": "var(--bg-card-hover)",
        "bg-input": "var(--bg-input)",
        "bg-glass": "var(--bg-glass)",
        "border-color": "var(--border-color)",
        "border-accent": "var(--border-accent)",
        "brand-primary": "var(--brand-primary)",
        "brand-emerald": "var(--brand-emerald)",
        "brand-amber": "var(--brand-amber)",
        "brand-rose": "var(--brand-rose)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        heading: ["var(--font-heading)"],
      }
    },
  },
  plugins: [],
}
