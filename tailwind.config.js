/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: "#090d16",
        panel: "#0f172a",
        subpanel: "#182235",
        surface: {
          DEFAULT: "#0b1326",
          dim: "#0b1326",
          bright: "#31394d",
          low: "#131b2e",
          high: "#222a3d",
          highest: "#2d3449",
        },
        border: {
          DEFAULT: "#1e293b",
          highlight: "#334155",
        },
        brand: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          muted: "rgba(99, 102, 241, 0.15)",
        },
        telemetry: {
          rest: "#818cf8",
          soap: "#22d3ee",
          proxy: "#10b981",
          mock: "#f43f5e",
          fallback: "#f59e0b",
        }
      },
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "4px",
        lg: "6px",
        xl: "8px",
      },
      boxShadow: {
        glowRose: "0 0 12px rgba(244, 63, 94, 0.28)",
        glowEmerald: "0 0 10px rgba(16, 185, 129, 0.35)",
        glowIndigo: "0 0 10px rgba(99, 102, 241, 0.35)",
        glowAmber: "0 0 10px rgba(245, 158, 11, 0.35)",
        panel: "0 12px 32px -4px rgba(0, 0, 0, 0.7)",
      }
    },
  },
  plugins: [],
};
