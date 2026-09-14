import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tema "sakura cerah": bg terang, teks gelap, aksen pink mekar + gold hangat.
        ink: "#FFF5F8",
        shoji: "#FFE3ED",
        shoji2: "#FFD3E3",
        vermilion: "#E0559B",
        vermilionDark: "#B93A7C",
        gold: "#B8863A",
        washi: "#3D1B2E",
        washiDim: "#8C6478"
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
