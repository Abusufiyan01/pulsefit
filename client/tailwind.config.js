/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary gradient stops
        primary: {
          DEFAULT: '#FF5A1F',
          50: '#FFF4F0',
          100: '#FFE4D6',
          200: '#FFC4A3',
          300: '#FF9E6B',
          400: '#FF7340',
          500: '#FF5A1F',
          600: '#F0261B',
          700: '#D01810',
          800: '#A8120C',
          900: '#8A0E09',
        },
        // Dark mode surfaces
        dark: {
          900: '#0B0B0F',
          800: '#14141A',
          700: '#1C1C24',
          600: '#252530',
          500: '#2E2E3D',
          400: '#3A3A4E',
          300: '#4A4A62',
          200: '#6B6B8A',
          100: '#9090B0',
        },
        // Light mode surfaces
        light: {
          DEFAULT: '#FAF7F5',
          50: '#FFFFFF',
          100: '#FAF7F5',
          200: '#F0EDE9',
          300: '#E5E0DB',
          400: '#D5CEC7',
          500: '#C0B8AF',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF5A1F 0%, #F0261B 100%)',
        'gradient-primary-soft': 'linear-gradient(135deg, rgba(255,90,31,0.15) 0%, rgba(240,38,27,0.15) 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1C1C24 0%, #14141A 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 90, 31, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 90, 31, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.12)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'float': '0 20px 60px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'count-up': 'countUp 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0px)' },
        },
        slideDown: {
          from: { opacity: 0, transform: 'translateY(-10px)' },
          to: { opacity: 1, transform: 'translateY(0px)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      screens: {
        'xs': '360px',
      },
    },
  },
  plugins: [],
}

