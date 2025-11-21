import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Noto Serif SC"', 'serif'],
                sans: ['"Noto Sans SC"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                accent: '#c9a961',
                primary: {
                    50: '#fbf8f1',
                    100: '#f5efde',
                    200: '#ebdbb8',
                    300: '#dfc28e',
                    400: '#d1a566',
                    500: '#c9a961', // Base accent
                    600: '#b07d3a',
                    700: '#8d5e2f',
                    800: '#744c2b',
                    900: '#603f26',
                }
            },
        },
    },
    plugins: [
        typography,
    ],
}
