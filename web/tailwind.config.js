/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{svelte,js,ts,jsx,tsx}",
      ],
  theme: {

    extend: {
        colors: {
            primary: 'hsl(var(--primary) / <alpha-value>)',
            secondary: 'hsl(var(--secondary) / <alpha-value>)',
            tertiary: 'hsl(var(--tertiary) / <alpha-value>)',
            accent: 'hsl(var(--accent) / <alpha-value>)',
            fail: 'hsl(var(--fail) / <alpha-value>)',
            success: 'hsl(var(--success) / <alpha-value>)',
          },
    },
  },
  plugins: [],
}

