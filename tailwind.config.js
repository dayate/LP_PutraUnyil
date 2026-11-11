/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./404.html", "./assets/app.js"],
  theme: {
    extend: {
      screens: {
        xs: "420px",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      colors: {
        stone: {
          50: "#FAF8F5",
          100: "#F4EFEA",
          200: "#E7DFD5",
          700: "#44403C",
          800: "#2A2624",
          900: "#1C1917",
        },
        terracotta: {
          DEFAULT: "#C05621",
          dark: "#9C4215",
        },
      },
    },
  },
  plugins: [],
};
