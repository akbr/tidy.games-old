module.exports = {
  mode: "jit",
  purge: [
    `./@lib/**/*.{html,tsx}`,
    `./apps/${process.env.npm_config_app_name}/**/*.{html,tsx}`,
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
