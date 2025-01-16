/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0040FF',
          50: '#E5EBFF',
          100: '#CCD6FF',
          200: '#99ADFF',
          300: '#6685FF',
          400: '#335CFF',
          500: '#0040FF', // cor principal
          600: '#0033CC',
          700: '#002699',
          800: '#001A66',
          900: '#000D33',
        }
      }
    },
  },
  plugins: [],
}
