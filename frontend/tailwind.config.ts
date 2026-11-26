import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "380px",
      },
      colors: {
        aurora: {
          bg: "#07090A",          // Deep Black Diamond Obsidian
          surface: "#111517",     // Anodized Carbon Card
          elevated: "#181D20",    // Tactile Elevated Panel / Input
          card: "rgba(17, 21, 23, 0.86)",
          border: "rgba(255, 255, 255, 0.08)",
          gold: "#F5B041",        // Imperial Champagne Gold
          cyan: "#47EC84",        // Kinetic Emerald Green
          green: "#47EC84",       // Signature Action Emerald
          purple: "#8B5CF6",      // High-Roller Electric Violet
          text: "#F8FAFC",        // Diamond Crisp White
          muted: "#94A3B8",       // Slate Titanium Gray
          success: "#47EC84",     // Emerald Win
          danger: "#FF2E54",      // Crimson Velocity
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 28px -4px rgba(71, 236, 132, 0.45)",
        glowGreen: "0 0 28px -4px rgba(71, 236, 132, 0.55), inset 0 1px 0 rgba(255,255,255,0.45)",
        glowGold: "0 0 24px -4px rgba(245, 176, 65, 0.45), inset 0 1px 0 rgba(255,255,255,0.4)",
        glowRed: "0 0 24px -4px rgba(255, 46, 84, 0.45)",
        card: "0 16px 40px -12px rgba(0, 0, 0, 0.75)",
        lux: "0 20px 50px -12px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.09)",
      },
      keyframes: {
        shimmerSweep: {
          "0%": { transform: "translateX(-120%) skewX(-20deg)" },
          "100%": { transform: "translateX(220%) skewX(-20deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        scaleUp: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmerSweep 3.2s infinite ease-in-out",
        marquee: "marquee 28s linear infinite",
        floatSlow: "floatSlow 4s ease-in-out infinite",
        "scale-up": "scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
