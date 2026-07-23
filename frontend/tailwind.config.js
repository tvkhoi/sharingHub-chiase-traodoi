/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spec design tokens (Emerald Teal System)
        "brand-green": "#10B981",     // Primary CTA & Branding (Emerald Teal)
        "brand-blue": "#6366F1",      // Secondary Link & Highlight (Indigo)
        "brand-orange": "#F59E0B",    // Accent Badge & Stars (Amber)
        "brand-success": "#10B981",   // Success state
        "brand-warning": "#F59E0B",   // Warning state
        "brand-danger": "#F43F5E",    // Danger / Error state
        "brand-bg": "#F8FAFC",        // Background Slate-50
        "brand-surface": "#FFFFFF",   // Surface / Card White
        "brand-text": "#0F172A",      // Text Main Slate-900
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
