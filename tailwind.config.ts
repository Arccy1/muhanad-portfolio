import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#E50914",
          50: "#FFE9EA",
          100: "#FFC9CD",
          200: "#F99AA0",
          300: "#F2676F",
          400: "#F63E48",
          500: "#E50914",
          600: "#C60712",
          700: "#9D050E",
          800: "#74030A",
          900: "#4D0207",
          950: "#2E0104",
        },
        ink: {
          DEFAULT: "#050505",
          700: "#0f0f0f",
          800: "#0b0b0b",
          900: "#080808",
          950: "#050505",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "Arial Black", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(229,9,20,0.35)",
        "glow-sm": "0 0 12px rgba(229,9,20,0.35)",
        "glow-lg": "0 0 70px rgba(229,9,20,0.45)",
        card: "0 24px 60px rgba(0,0,0,0.55)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow": "spin 14s linear infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
