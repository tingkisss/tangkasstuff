import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0D",
        shoji: "#16151A",
        shoji2: "#1D1B22",
        vermilion: "#C8362A",
        vermilionDark: "#8E241C",
        gold: "#C9A15A",
        washi: "#EDE7DD",
        washiDim: "#B9B3A6"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(237,231,221,0.035) 1px, transparent 0)"
      },
      keyframes: {
        stamp: {
          "0%": { transform: "scale(2.2) rotate(-14deg)", opacity: "0" },
          "60%": { transform: "scale(0.94) rotate(-8deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-8deg)", opacity: "1" }
        },
        driftPetal: {
          "0%": { transform: "translateY(-10%) translateX(0) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "0.6" },
          "100%": { transform: "translateY(120vh) translateX(40px) rotate(220deg)", opacity: "0" }
        }
      },
      animation: {
        stamp: "stamp 0.6s cubic-bezier(0.2,0.9,0.3,1.1) forwards",
        driftPetal: "driftPetal 14s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
