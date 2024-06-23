/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-pink': '#de5f8a',
        'light-pink': '#fff0f1',
        'darker-pink': '#c2406c',
        'dark-gray': '#474038',
        'medium-gray': '#635648',
        'light-gray': '#c2b3a3',
        'highlight-pink': '#ffd561',
        'darkest-gray': '#2b2823'
      },
      spacing: {
        'piece-ratio': '90%',
      },
      screens: {
        'md-lg': '896px',
        'sm-sm': '600px'
      }
    },
  },
  plugins: [],
}

