module.exports = {
  mode: "jit",
  purge: [
    `./@lib/**/*.{html,ts,tsx}`,
    `./apps/${process.env.npm_config_app_name}/**/*.{html,ts,tsx}`,
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
