/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D9488',
        greyRock: '#6B7280',
        yellowRock: '#F59E0B',
        highlight: '#EF4444',
        success: '#10B981',
      },
    },
  },
  plugins: [],
}
