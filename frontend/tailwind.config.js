/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          black: '#121212',
          dark: '#181818',
          lightDark: '#282828',
          green: '#1DB954',
          greenHover: '#1ed760',
        },
      },
    },
  },
  plugins: [],
}
