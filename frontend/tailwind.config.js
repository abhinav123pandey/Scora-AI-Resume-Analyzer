/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#020817',
        foreground: '#f8fafc',
        secondary: '#94a3b8',
        accent: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(59,130,246,0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(59,130,246,0.4)' },
        },
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(59,130,246,0.08), 0 4px 24px rgba(0,0,0,0.5)',
        'card-hover': '0 0 0 1px rgba(59,130,246,0.25), 0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(59,130,246,0.1)',
        'glow': '0 0 24px rgba(59,130,246,0.4)',
        'glow-sm': '0 0 12px rgba(59,130,246,0.3)',
      },
    },
  },
  plugins: [],
}
