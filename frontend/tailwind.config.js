/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs Sonitelecom
        soni: {
          navy: '#1a237e',      // Bleu foncé principal
          'navy-light': '#3949ab', // Bleu navy clair
          'navy-dark': '#0d1757',  // Bleu navy très foncé
          blue: '#3949ab',      // Bleu moyen
          orange: '#ff6d00',    // Orange principal
          'orange-light': '#ff8f00', // Orange clair
          'orange-dark': '#e65100',  // Orange foncé
          gray: '#37474f',      // Gris foncé
          'gray-light': '#607d8b', // Gris clair
        },
        primary: {
          50: '#e8eaf6',
          100: '#c5cae9',
          200: '#9fa8da',
          300: '#7986cb',
          400: '#5c6bc0',
          500: '#3f51b5',  // Bleu principal Soni
          600: '#3949ab',
          700: '#303f9f',
          800: '#283593',
          900: '#1a237e',  // Navy Soni
        },
        accent: {
          50: '#fff3e0',
          100: '#ffe0b2',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#ffa726',
          500: '#ff9800',
          600: '#ff8f00',  // Orange Soni
          700: '#ff6d00',
          800: '#e65100',
          900: '#bf360c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'gradient-soni': 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
        'gradient-soni-orange': 'linear-gradient(135deg, #ff6d00 0%, #ff8f00 100%)',
      },
      boxShadow: {
        'soni': '0 10px 25px rgba(26, 35, 126, 0.1)',
        'soni-lg': '0 20px 40px rgba(26, 35, 126, 0.15)',
      }
    },
  },
}
