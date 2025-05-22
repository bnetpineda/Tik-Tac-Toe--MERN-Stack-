// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./main.jsx", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pixelify: ['"Pixelify Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
