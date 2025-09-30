/**** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--color-bg) / <alpha-value>)",
        foreground: "hsl(var(--color-fg) / <alpha-value>)",
        muted: "hsl(var(--color-fg-muted) / <alpha-value>)",
        accent: "hsl(var(--color-primary) / <alpha-value>)",
        accentForeground:
          "hsl(var(--color-primary-foreground) / <alpha-value>)",
        border: "hsl(var(--color-border) / <alpha-value>)",
        surface: "hsl(var(--color-surface) / <alpha-value>)",
        primary: "var(--md-sys-color-primary)",
        onPrimary: "var(--md-sys-color-on-primary)",
        primaryContainer: "var(--md-sys-color-primary-container)",
        onPrimaryContainer: "var(--md-sys-color-on-primary-container)",
        secondary: "var(--md-sys-color-secondary)",
        onSecondary: "var(--md-sys-color-on-secondary)",
        secondaryContainer: "var(--md-sys-color-secondary-container)",
        onSecondaryContainer: "var(--md-sys-color-on-secondary-container)",
        tertiary: "var(--md-sys-color-tertiary)",
        onTertiary: "var(--md-sys-color-on-tertiary)",
        error: "var(--md-sys-color-error)",
        onError: "var(--md-sys-color-on-error)",
        surfaceVariant: "var(--md-sys-color-surface-variant)",
        onSurfaceVariant: "var(--md-sys-color-on-surface-variant)",
        outline: "var(--md-sys-color-outline)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
