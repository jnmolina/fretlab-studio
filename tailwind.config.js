/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        obsidian: '#0b0c10',
        slatecard: '#13151c',
        slateborder: '#232735',
        amberwarm: '#f59e0b',
        cyanmath: '#22d3ee',
      }
    },
  },
  plugins: [],
}
