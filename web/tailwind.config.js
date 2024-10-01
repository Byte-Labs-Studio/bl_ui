/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{svelte,js,ts,jsx,tsx}",
      ],
  theme: {

    extend: {
        colors: {
            border: "rgba(var(--border) / <alpha-value>)",
            background: "rgba(var(--background) / <alpha-value>)",
            foreground: "rgba(var(--foreground) / <alpha-value>)",
            primary: {
                DEFAULT: "rgba(var(--primary) / <alpha-value>)",
                foreground: "rgba(var(--primary-foreground)/ <alpha-value>)"
            },
            secondary: {
                DEFAULT: "rgba(var(--secondary) / <alpha-value>)",
                foreground: "rgba(var(--secondary-foreground)/ <alpha-value>)"
            },
            tertiary: {
                DEFAULT: "rgba(var(--tertiary) / <alpha-value>)",
                foreground: "rgba(var(--tertiary-foreground)/ <alpha-value>)"
            },
            accent: {
                DEFAULT: "rgba(var(--accent) / <alpha-value>)",
                foreground: "rgba(var(--accent-foreground)/ <alpha-value>)"
            },
            success: {
                DEFAULT: "rgba(var(--success) / <alpha-value>)",
                foreground: "rgba(var(--success-foreground)/ <alpha-value>)"
            },
            error: {
                DEFAULT: "rgba(var(--error) / <alpha-value>)",
                foreground: "rgba(var(--error-foreground)/ <alpha-value>)"
            },
            warning: {
                DEFAULT: "rgba(var(--warning) / <alpha-value>)",
                foreground: "rgba(var(--warning-foreground)/ <alpha-value>)"
            },
        },
        borderRadius: {
            lg: "var(--radius)",
            md: "calc(var(--radius) - 2px)",
            sm: "calc(var(--radius) - 4px)"
        },
    },
  },
  plugins: [],
}

