/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'Outfit'", "'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        // Theme-based CSS variable mappings
        'bg-base': 'var(--bg-base)',
        'bg-panel': 'var(--bg-panel)',
        'bg-card': 'var(--bg-card)',
        'bg-hover': 'var(--bg-hover)',
        'bg-input': 'var(--bg-input)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-placeholder': 'var(--text-placeholder)',
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        'border-orange': 'var(--border-orange)',
        'sidebar-bg': 'var(--sidebar-bg)',

        // Brand Palette
        brand: {
          primary: "#FF5A14",
          button: "#FF7A45",
          hover: "#F56B2F",
          orangeBorder: "#FF8A55",
          bgLight: "var(--bg-base)",
          inputBg: "var(--bg-input)",
          border: "var(--border-subtle)",
          textPrimary: "var(--text-primary)",
          textSecondary: "var(--text-secondary)",
          placeholder: "var(--text-placeholder)",
          kbGreen: "#10b981",
          llmBlue: "#3b82f6"
        }
      }
    },
  },
  plugins: [],
}
