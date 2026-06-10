/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mint: { 50: "#f0fdf4", 400: "#4ade80", 600: "#16a34a", 700: "#15803d" },
        trash: { 400: "#fb923c", 600: "#ea580c" },
      },
    },
  },
  plugins: [],
};
