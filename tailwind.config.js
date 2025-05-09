/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'success': {
          '100': '#49de50',
          '200': '#42c748',
        },
        'destructive': {
          '100': '#f75353',
          '200': '#c44141',
        },
        'primary': {
          '100': '#4facff',
          '200': '#1e88e5',
        },
        'light': {
          '100': '#c6d8ff',
          '400': '#5272a4',
          '600': '#3e507a',
          '800': '#1a2036',
        },
        'dark': {
          '100': '#000a14',
          '200': '#001326',
          '300': '#001e3d',
        },
      },
    },
  },
  plugins: [],
} 