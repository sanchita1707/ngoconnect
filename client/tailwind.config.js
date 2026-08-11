/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#10b981',
          DEFAULT: '#047857',
          dark: '#065f46',
        },
        secondary: {
          light: '#fdfbf7',
          DEFAULT: '#fbf8f1',
          dark: '#f5efe0',
        },
        accent: {
          light: '#fbbf24',
          DEFAULT: '#d97706',
          dark: '#b45309',
        },
        charcoal: {
          light: '#334155',
          DEFAULT: '#1e293b',
          dark: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
