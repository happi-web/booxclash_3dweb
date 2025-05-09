// tailwind.config.js
import defaultTheme from 'tailwindcss/defaultTheme';
// tailwind.config.js
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
      fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
      },
      animation: {
        flash: 'flash 0.8s ease-in-out',
        shake: 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}
