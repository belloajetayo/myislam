/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./global.css",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["PlusJakartaSans", "system-ui", "sans-serif"],
        arabic: ["Amiri", "serif"],
      },
      colors: {
        islamic: {
          gold: "#F59E0B",
          green: "#10B981",
          sky: "#0EA5E9",
          purple: "#8B5CF6",
          light: "#F8F0FF",
          cream: "#FFF8F0",
        },
      },
    },
  },
  plugins: [],
};
