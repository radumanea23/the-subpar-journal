import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Hard-override border-radius to 0 site-wide; nothing rounds by default
    borderRadius: {
      none: "0",
      DEFAULT: "0",
      sm: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      full: "9999px", // keep for utility when explicitly needed
    },
    extend: {
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-baskerville)", "Georgia", "serif"],
        mono: ["var(--font-ibm-mono)", "monospace"],
      },
      colors: {
        // Public surface
        parchment: {
          DEFAULT: "var(--color-parchment)",
          dark: "var(--color-parchment-dark)",
          deep: "var(--color-parchment-deep)",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          mid: "var(--color-ink-mid)",
          faint: "var(--color-ink-faint)",
        },
        rule: {
          DEFAULT: "var(--color-rule)",
          light: "var(--color-rule-light)",
        },
        // Category accents
        accent: {
          ai: "var(--color-accent-ai)",
          music: "var(--color-accent-music)",
          sports: "var(--color-accent-sports)",
          stocks: "var(--color-accent-stocks)",
          life: "var(--color-accent-life)",
        },
        // Dashboard surface
        dash: {
          bg: "var(--color-dash-bg)",
          surface: "var(--color-dash-surface)",
          border: "var(--color-dash-border)",
          text: "var(--color-dash-text)",
          "text-mid": "var(--color-dash-text-mid)",
          accent: "var(--color-dash-accent)",
        },
        // Check-in calendar
        checkin: {
          full: "var(--checkin-full)",
          partial: "var(--checkin-partial)",
          minimal: "var(--checkin-minimal)",
        },
      },
      maxWidth: {
        site: "1100px",
        prose: "680px",
      },
    },
  },
  plugins: [],
}

export default config
