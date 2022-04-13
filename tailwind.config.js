module.exports = {
  mode: "jit",
  content: [
    "./apps/**/*.{html,js,ts,jsx,tsx}",
    "./@lib/**/*.{html,js,ts,jsx,tsx}",
    "./@shared/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 400ms",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
