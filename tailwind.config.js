/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [
    require("nativewind/preset") // Ensure this is correctly placed and no typos
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
