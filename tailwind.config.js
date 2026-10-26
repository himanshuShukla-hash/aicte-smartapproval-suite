/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        seva: {
          navy: '#002147',
          'navy-dark': '#00142b',
          'navy-light': '#0a366b',
          blue: '#0B3C5D',
          saffron: '#FF9933',
          'saffron-dark': '#E65100',
          green: '#138808',
          'green-dark': '#0e6406',
          surface: '#F4F6F9',
          border: '#CBD5E1',
          gold: '#C5A059'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif']
      }
    },
  },
  plugins: [],
}
