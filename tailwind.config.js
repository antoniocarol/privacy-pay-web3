/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#E84142',
        secondary: '#FF9B45',
        dark: '#0B0F19',
        darkblue: '#0D1025',
        accent: '#00FFA3',
        avax: {
          red: '#E84142',
          orange: '#FF9B45',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-main': 'linear-gradient(to bottom, #0D1025, #171C3C, #131740)',
        'gradient-btn': 'linear-gradient(to right, #E84142, #FF9B45)',
        'gradient-btn-blue': 'linear-gradient(to right, #5667FF, #9257FF)',
        'gradient-card': 'linear-gradient(140deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        'gradient-card-premium': 'linear-gradient(140deg, rgba(232, 65, 66, 0.03), rgba(255, 155, 69, 0.02))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 20%, rgba(255,255,255,0.15) 60%, transparent 100%)',
      },
      boxShadow: {
        'soft': '0 10px 30px -15px rgba(0, 0, 0, 0.3)',
        'glow': '0 5px 15px -5px rgba(232, 65, 66, 0.3)',
        'glow-blue': '0 5px 15px -5px rgba(86, 103, 255, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'slide-out': 'slideOut 0.3s ease-out forwards',
        shimmer: 'shimmer 1.5s infinite linear',
        'shimmer-move': 'shimmerMove 2s infinite linear',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        shimmerMove: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      backgroundSize: {
        'shimmer-position': '200% 100%',
      },
    },
  },
  plugins: [],
}

