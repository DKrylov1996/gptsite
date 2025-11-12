import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      colors: {
        night: '#0b0d17',
        accent: '#6c5ce7',
        accentSoft: '#a29bfe',
        highlight: '#00cec9'
      },
      fontFamily: {
        display: ['"Clash Display"', '"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif']
      },
      boxShadow: {
        glow: '0 15px 45px rgba(108, 92, 231, 0.35)'
      }
    }
  },
  plugins: []
} satisfies Config
