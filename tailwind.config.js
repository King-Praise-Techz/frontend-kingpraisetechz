/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff3ff",
          100: "#dbe4ff",
          200: "#bac8ff",
          300: "#91a7ff",
          400: "#748ffc",
          500: "#1a4dff",
          600: "#1541e6",
          700: "#1035cc",
          800: "#0b28a6",
          900: "#081d80",
        },
        emerald: { DEFAULT: "#34d399" },
        rose:    { DEFAULT: "#f87171" },
        gold:    { DEFAULT: "#f0a429" },
      },
      fontFamily: {
        display: ["Clash Display", "Syne", "system-ui", "sans-serif"],
        sans:    ["Satoshi", "DM Sans", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};