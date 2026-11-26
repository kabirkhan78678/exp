import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aurora: {
          bg: "#141617",          // Deep Matte Slate Obsidian Black (Figma background)
          surface: "#212526",     // Figma Card Surface Charcoal
          elevated: "#2A3031",    // Figma Elevated Panel / Input
          card: "rgba(33, 37, 38, 0.88)",
          border: "rgba(255, 255, 255, 0.08)", // Subtle clean outline
          gold: "#F59E0B",        // Figma Coin Token Amber
          cyan: "#47EC84",        // Figma Vibrant Neon Emerald Green (#47EC84)
          green: "#47EC84",       // Figma Signature Action Green
          purple: "#A855F7",      // Royal Accent
          text: "#FFFFFF",        // Pure Crisp White
          muted: "#9CA3AF",       // Cool Slate Gray
          success: "#47EC84",     // Neon Win Green
          danger: "#FF2A4D",      // Vibrant Crash Red
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -2px rgba(71, 236, 132, 0.5)",
        glowGreen: "0 0 25px -2px rgba(71, 236, 132, 0.55)",
        glowGold: "0 0 20px -4px rgba(245, 158, 11, 0.4)",
        glowRed: "0 0 20px -4px rgba(255, 42, 77, 0.4)",
        card: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
