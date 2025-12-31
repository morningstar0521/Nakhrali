/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Purple shades from logo
                'purple': {
                    50: '#F5F3FF',
                    100: '#E9D8FD',
                    200: '#D6BCFA',
                    300: '#B794F4',
                    400: '#9F7AEA',
                    500: '#6B46C1', // Primary purple
                    600: '#553C9A',
                    700: '#44337A',
                    800: '#322659',
                    900: '#21183C',
                },
                // Gold shades from logo
                'gold': {
                    50: '#FFFBEB',
                    100: '#F4E4C1',
                    200: '#EDD9A3',
                    300: '#E5CE85',
                    400: '#DEC367',
                    500: '#D4AF37', // Primary gold
                    600: '#B8960F',
                    700: '#8A7008',
                    800: '#5C4A05',
                    900: '#2E2503',
                },
                // Neutral warm colors
                'cream': '#FAF3E0',
                'warm-white': '#FFFBF5',
                'soft-beige': '#F5EBD9',
            },
            fontFamily: {
                'heading': ['Playfair Display', 'serif'],
                'script': ['Great Vibes', 'cursive'],
                'body': ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'purple': '0 4px 12px rgba(107, 70, 193, 0.3)',
                'gold': '0 4px 12px rgba(212, 175, 55, 0.3)',
                'purple-lg': '0 8px 24px rgba(107, 70, 193, 0.15)',
            },
        },
    },
    plugins: [],
}
