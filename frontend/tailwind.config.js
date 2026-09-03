/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1f3a5f',
          gold: '#e8a33d',
          brown: '#5b4636',
          bronze: '#a36a2d',
          cream: '#fffdf9',
          border: '#e4d9c7',
          borderLight: '#efe6d6',
          muted: '#8a7a68',
          green: '#3f6b4f',
          red: '#b75b3d',
          yellow: '#c98a1f',
        }
      },
      fontFamily: {
        heading: ['Poppins', 'Noto Sans Devanagari', 'sans-serif'],
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
