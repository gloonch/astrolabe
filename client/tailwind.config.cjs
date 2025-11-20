/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        mono: ['"Share Tech Mono"', 'ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas'],
      },
      colors: {
        night: '#0a0a0f',
        ghost: '#e8e8ed',
        slate8: '#cfd0d7',
        ink: '#050505',
      },
      boxShadow: {
        pixel: '0 0 0 2px #0a0a0f, 4px 4px 0 0 #e8e8ed',
      },
    },
  },
  plugins: [],
}
