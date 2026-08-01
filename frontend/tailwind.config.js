/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eefbf3",
          100: "#d5f5e3",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        dark: {
          900: "#0a0f1e",
          800: "#0f172a",
          700: "#1e293b",
          600: "#334155",
          500: "#475569",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
}
