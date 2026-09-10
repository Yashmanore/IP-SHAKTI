/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest-green': '#174A3A',
        'deep-teal': '#1E5B57',
        'warm-ivory': '#F7F5EF',
        'muted-gold': '#B18A45',
        'charcoal': '#202A27',
        'slate': '#65736D',
        'border-color': '#DDE1DB',
        'success': '#287A55',
        'warning': '#B47A24',
        'error': '#A64B43',
      },
      fontFamily: {
        heading: ['"Source Serif 4"', 'serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
