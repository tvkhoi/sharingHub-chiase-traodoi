/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spec design tokens
        "brand-green": "#2E7D32",     // Primary CTA & Branding
        "brand-blue": "#1976D2",      // Secondary Link & Highlight
        "brand-orange": "#FF9800",    // Accent Badge & Stars
        "brand-success": "#4CAF50",   // Success state
        "brand-warning": "#FB8C00",   // Warning state
        "brand-danger": "#E53935",    // Danger / Error state
        "brand-bg": "#F8FAFC",        // Background Slate-50
        "brand-surface": "#FFFFFF",   // Surface / Card White
        "brand-text": "#1E293B",      // Text Main Slate-800
        "brand-muted": "#64748B",     // Text Muted Slate-500
        "brand-border": "#E2E8F0",    // Border Slate-200

        // CSS Variables aliases
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
        "brand-secondary": "var(--brand-secondary)",
        "brand-emerald": "var(--brand-emerald)",
        "brand-amber": "var(--brand-amber)",
        "brand-rose": "var(--brand-rose)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}
