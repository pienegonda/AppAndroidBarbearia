/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { dark: "#2C1E16", light: "#F4EFEA", gold: "#C5A059", surface: "#FDFBF7", success: "#2E7D32", danger: "#C62828" }
      },
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Lora", "serif"]
      },
      boxShadow: { gold: "0 8px 30px rgba(197,160,89,.18)" }
    }
  },
  plugins: []
};