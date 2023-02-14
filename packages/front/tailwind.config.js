/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app.{vue,js,ts,jsx,tsx}',
    './src/components/**/*.{vue,js,ts,jsx,tsx}',
    './src/layouts/**/*.{vue,js,ts,jsx,tsx}',
    './src/pages/**/*.{vue,js,ts,jsx,tsx}',
    './src/plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
