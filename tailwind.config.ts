import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // MeFamous brand tokens — see lib/constants/brand.ts for the source of truth
        slate: {
          DEFAULT: "#0F172A",
          950: "#0B1120",
        },
        violet: {
          DEFAULT: "#7C3AED",
          600: "#6D28D9",
        },
        cyan: {
          DEFAULT: "#06B6D4",
          400: "#22D3EE",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-geist)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0F172A 0%, #1E1B4B 45%, #7C3AED 100%)",
        "brand-glow": "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.35), transparent 60%)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
