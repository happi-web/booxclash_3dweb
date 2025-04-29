// tailwind.config.js
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust paths as needed
  ],
};
