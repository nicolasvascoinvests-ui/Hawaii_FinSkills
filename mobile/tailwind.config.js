/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF7',
        foreground: '#1B2633',
        card: '#FFFFFF',
        'card-foreground': '#1B2633',
        popover: '#FFFFFF',
        'popover-foreground': '#1B2633',
        primary: '#0B5E8C',
        'primary-foreground': '#FFFFFF',
        secondary: '#ECF1F5',
        'secondary-foreground': '#0B4870',
        muted: '#F0EDE4',
        'muted-foreground': '#676D76',
        accent: '#FF6B4A',
        'accent-foreground': '#FFFFFF',
        success: '#2F9950',
        'success-foreground': '#FFFFFF',
        destructive: '#EF4444',
        'destructive-foreground': '#FFFFFF',
        border: '#DDE3EA',
        input: '#DDE3EA',
        ring: '#0B5E8C',
        ocean: {
          DEFAULT: '#0B5E8C',
          deep: '#08486B',
        },
        coral: {
          DEFAULT: '#FF6B4A',
          hover: '#FF5432',
        },
        jade: {
          DEFAULT: '#2F9950',
          light: '#E4F3E8',
        },
        sand: {
          DEFAULT: '#FAFAF7',
          dark: '#E9E6DD',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        purple: {
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
        },
        fuchsia: {
          400: '#E879F9',
          500: '#D946EF',
        },
        indigo: {
          400: '#818CF8',
          500: '#6366F1',
        },
        blue: {
          400: '#60A5FA',
          500: '#3B82F6',
        },
        orange: {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        },
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
        },
        pink: {
          400: '#F472B6',
          500: '#EC4899',
        },
        gray: {
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
        },
      },
      fontSize: {
        body: ['17px', { lineHeight: '28px' }],
        'body-sm': ['15px', { lineHeight: '24px' }],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
};
