/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0efff",
          200: "#b9dbff",
          300: "#7bbeff",
          400: "#3598ff",
          500: "#0a75f5",
          600: "#0057d1",
          700: "#0043ab",
          800: "#063b8d",
          900: "#0b3274",
          950: "#07204d",
        },
      },
    },
  },
  plugins: [],
};
