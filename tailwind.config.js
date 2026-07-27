/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wayfare: {
          ink: '#1a2332',
          slate: '#2c3e50',
          mist: '#e8eef4',
          sky: '#3d7ea6',
          amber: '#d97706',
          danger: '#b91c1c',
          forest: '#1e4d3a',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 3px rgba(26, 35, 50, 0.08), 0 8px 24px rgba(26, 35, 50, 0.06)',
      },
    },
  },
  plugins: [],
};
