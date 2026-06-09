/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        medical: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
          800: "#1E3A8A",
          900: "#0A2540",
          950: "#061B2E",
        },
        accent: {
          cyan: "#06B6D4",
          green: "#10B981",
          yellow: "#F59E0B",
          red: "#EF4444",
          purple: "#8B5CF6",
        },
        viewer: {
          bg: "#0B0F1A",
          panel: "#111827",
          border: "#1F2937",
        }
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        "soft": "0 2px 8px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card": "0 4px 20px -2px rgb(0 0 0 / 0.08)",
        "viewer": "0 0 40px 0 rgb(0 0 0 / 0.3)",
      },
      borderRadius: {
        "lg2": "10px",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        "slide-right": "slideRight 250ms cubic-bezier(0.4,0,0.2,1)",
        "slide-up": "slideUp 250ms cubic-bezier(0.4,0,0.2,1)",
        "pulse-dot": "pulseDot 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseDot: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.2)" },
        },
      },
    },
  },
  plugins: [],
};
