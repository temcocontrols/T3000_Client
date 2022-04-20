/* eslint-disable */
// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  plugins: [
    require("tailwindcss"),
    // https://github.com/postcss/autoprefixer
    require("autoprefixer")({
      overrideBrowserslist: [
        "last 10 Chrome versions",
        "last 10 Firefox versions",
        "last 10 Edge versions",
        "last 10 Safari versions",
        "last 4 Android versions",
        "last 10 ChromeAndroid versions",
        "last 10 FirefoxAndroid versions",
        "last 4 iOS versions",
      ],
    }),

    // https://github.com/elchininet/postcss-rtlcss
    // If you want to support RTL css, then
    // 1. yarn/npm install postcss-rtlcss
    // 2. optionally set quasar.config.js > framework > lang to an RTL language
    // 3. uncomment the following line:
    // require('postcss-rtlcss')
  ],
};
