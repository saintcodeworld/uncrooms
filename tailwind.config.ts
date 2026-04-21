import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#f4ecdf',
          dark: '#e6dac5',
          light: '#fbf6ea',
        },
        ink: {
          DEFAULT: '#0d0d0d',
          soft: '#2b2b2b',
          faded: '#6a6a6a',
        },
        skin: {
          DEFAULT: '#fbd4bc',
          dark: '#d89577',
          shade: '#c47a5a',
          blush: '#ff7aa4',
        },
        pepto: {
          DEFAULT: '#ffb5d8',
          dark: '#ff7aa4',
          light: '#ffd9ea',
        },
        cope: {
          tear: '#8fc8f2',
          green: '#a8dd6b',
          gmi: '#6db933',
          ngmi: '#e83333',
          hopium: '#ffd54a',
        },
      },
      fontFamily: {
        hand: ['var(--font-hand)', 'Comic Sans MS', 'cursive'],
        scribble: ['var(--font-scribble)', 'cursive'],
        bang: ['var(--font-bang)', 'Impact', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'paper-grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'wobble': 'wobble 0.4s ease-in-out infinite',
        'sob': 'sob 1.8s ease-in-out infinite',
        'shake': 'shake 0.25s linear infinite',
        'cope': 'cope 2.5s ease-in-out infinite',
        'tear-drop': 'tearDrop 1.4s ease-in infinite',
        'sway': 'sway 3s ease-in-out infinite',
      },
      keyframes: {
        wobble: {
          '0%, 100%': { transform: 'rotate(-1.2deg)' },
          '50%': { transform: 'rotate(1.2deg)' },
        },
        sob: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-2px) scale(1.02)' },
        },
        shake: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '25%': { transform: 'translate(-1px,1px)' },
          '50%': { transform: 'translate(1px,-1px)' },
          '75%': { transform: 'translate(-1px,-1px)' },
        },
        cope: {
          '0%, 100%': { transform: 'translateY(0) rotate(-1deg)' },
          '50%': { transform: 'translateY(-3px) rotate(1deg)' },
        },
        tearDrop: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { transform: 'translateY(24px)', opacity: '0' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      boxShadow: {
        'doodle': '3px 3px 0 0 #0d0d0d',
        'doodle-lg': '6px 6px 0 0 #0d0d0d',
        'doodle-pink': '3px 3px 0 0 #ff7aa4',
        'sticker': 'inset 0 -4px 0 rgba(0,0,0,0.12), 2px 2px 0 #0d0d0d',
      },
    },
  },
  plugins: [],
}
export default config
