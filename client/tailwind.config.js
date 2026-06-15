/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'np-black':  '#0A0A0A',
        'np-white':  '#F5F0E8',
        'np-gray':   { 100: '#E8E3D8', 400: '#9A9487', 700: '#4A4540' },
        'np-red':    { DEFAULT: '#D32F2F', dark: '#B71C1C' },
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'serif-tc': ['"Noto Serif TC"', 'serif'],
        'sans-tc':  ['"Noto Sans TC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
