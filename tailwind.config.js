/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'success-100': '#49de50',
        'success-200': '#42c748',
        'destructive-100': '#f75353',
        'destructive-200': '#c44141',
        'primary-100': '#4facff',
        'primary-200': '#1e88e5',
        'light-100': '#c6d8ff',
        'light-400': '#5272a4',
        'light-600': '#3e507a',
        'light-800': '#1a2036',
        'dark-100': '#000a14',
        'dark-200': '#001326',
        'dark-300': '#001e3d',
      },
      borderRadius: {
        'lg': '0.625rem',
        'md': 'calc(0.625rem - 2px)',
        'sm': 'calc(0.625rem - 4px)',
      },
      spacing: {
        '5/6': '83.333333%',
      }
    },
  },
  plugins: [],
} 