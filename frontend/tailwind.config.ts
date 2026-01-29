import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* Larger font sizes for readability */
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.5' }],
        sm: ['0.9375rem', { lineHeight: '1.5' }],
        base: ['1.125rem', { lineHeight: '1.6' }],
        lg: ['1.25rem', { lineHeight: '1.6' }],
        xl: ['1.375rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
        '5xl': ['3rem', { lineHeight: '1.2' }],
        '6xl': ['3.75rem', { lineHeight: '1.15' }],
      },
      maxWidth: {
        content: '72rem',
      },
      colors: {
        primary: {
          DEFAULT: '#137fec',
          hover: '#0066d6',
          dark: '#0284c7',
        },
        'background-dark': '#0a0f14',
        'background-light': '#FFFFFF',
        'card-dark': '#1E1E1E',
        'border-dark': '#2A2A2A',
        'deep-charcoal': '#121212',
        surface: '#F8FAFC',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Noto Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        glow: '0 4px 20px -2px rgba(0, 122, 255, 0.25)',
      },
    },
  },
  plugins: [],
}

export default config
