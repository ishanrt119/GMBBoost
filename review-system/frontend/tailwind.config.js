/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:  '#4f6ef7',
        brand2: '#7c3aed',
        dark:   '#0a0a0f',
        dark2:  '#111118',
        dark3:  '#16161f',
        dark4:  '#1c1c28',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
