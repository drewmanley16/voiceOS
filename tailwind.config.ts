import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aura: {
          idle: '#4f46e5',
          listening: '#7c3aed',
          speaking: '#f59e0b',
          executing: '#06b6d4',
        },
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.03)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
