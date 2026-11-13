import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F7F4EF",
        lilac: "#B9A5F5",
        indigo: { DEFAULT: "#7770C9", deep: "#554EA8", ink: "#3F3A86" },
        sage: { DEFAULT: "#A7C9B4", deep: "#3E6B52" },
        peach: { DEFAULT: "#F1BBAA", deep: "#9A4A33" },
        midnight: { DEFAULT: "#25243A", soft: "#4A4960", mute: "#6B6A80" },
        mist: "#E6DDFB",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: { "4xl": "2rem", "5xl": "2.5rem" },
      boxShadow: {
        soft: "0 1px 2px rgba(37,36,58,0.04), 0 8px 24px -8px rgba(37,36,58,0.10)",
        lift: "0 2px 4px rgba(37,36,58,0.04), 0 24px 48px -16px rgba(85,78,168,0.22)",
        glow: "0 0 0 1px rgba(255,255,255,0.6) inset, 0 20px 60px -20px rgba(119,112,201,0.45)",
      },
      letterSpacing: { label: "0.16em" },
      keyframes: {
        breathe: { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.04)" } },
        drift: { "0%,100%": { transform: "translate3d(0,0,0)" }, "50%": { transform: "translate3d(0,-10px,0)" } },
        spinslow: { to: { transform: "rotate(360deg)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        breathe: "breathe 7s ease-in-out infinite",
        drift: "drift 9s ease-in-out infinite",
        spinslow: "spinslow 40s linear infinite",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
