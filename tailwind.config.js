/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#3AD0E3",
       "primary-text": "#20646D",
        "gray-border": "#E5E5E5",
        "gray-text": "#737373",
        "gray-light": "#E8EBE6",
        "black-text": "#0A0A0A",
      },
    },
  },
  plugins: [],
};