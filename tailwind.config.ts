import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx}", "./content/**/*.{md,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-satoshi)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      transitionTimingFunction: {
        fluid: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      // shadcn/ui components (Card, Sidebar, Chart, etc.) expect Tailwind
      // color utilities like bg-primary, text-muted-foreground, border-border.
      // These are new color keys (the site had none before), mapped to the
      // --sh-* CSS vars in globals.css so they don't collide with the site's
      // own rgb(var(--x)) tokens of similar names.
      colors: {
        background: "var(--sh-background)",
        foreground: "var(--sh-foreground)",
        card: { DEFAULT: "var(--sh-card)", foreground: "var(--sh-card-foreground)" },
        popover: { DEFAULT: "var(--sh-popover)", foreground: "var(--sh-popover-foreground)" },
        primary: { DEFAULT: "var(--sh-primary)", foreground: "var(--sh-primary-foreground)" },
        secondary: { DEFAULT: "var(--sh-secondary)", foreground: "var(--sh-secondary-foreground)" },
        muted: { DEFAULT: "var(--sh-muted)", foreground: "var(--sh-muted-foreground)" },
        accent: { DEFAULT: "var(--sh-accent)", foreground: "var(--sh-accent-foreground)" },
        destructive: "var(--sh-destructive)",
        // Row hover wash used by ask-user-questions' morphing hover indicator.
        // Not a stock shadcn token — that component assumes a `hover` colour,
        // so bg-hover resolved to nothing and the indicator was invisible.
        hover: "var(--sh-hover)",
        // Filled/selected wash, the settled counterpart to `hover`. Same story:
        // ask-user-questions assumes it, stock shadcn has no such token.
        active: "var(--sh-active)",
        border: "var(--sh-border)",
        input: "var(--sh-input)",
        ring: "var(--sh-ring)",
        sidebar: {
          DEFAULT: "var(--sh-sidebar)",
          foreground: "var(--sh-sidebar-foreground)",
          primary: "var(--sh-sidebar-primary)",
          "primary-foreground": "var(--sh-sidebar-primary-foreground)",
          accent: "var(--sh-sidebar-accent)",
          "accent-foreground": "var(--sh-sidebar-accent-foreground)",
          border: "var(--sh-sidebar-border)",
          ring: "var(--sh-sidebar-ring)",
        },
        chart: {
          "1": "var(--sh-chart-1)",
          "2": "var(--sh-chart-2)",
          "3": "var(--sh-chart-3)",
          "4": "var(--sh-chart-4)",
          "5": "var(--sh-chart-5)",
        },
      },
      borderRadius: {
        lg: "var(--sh-radius)",
        md: "calc(var(--sh-radius) - 2px)",
        sm: "calc(var(--sh-radius) - 4px)",
      },
      borderColor: {
        DEFAULT: "var(--sh-border)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom variant for the /admin dark toggle, scoped separately from the
    // site-wide (permanently-on) `dark:` variant which targets `.dark`.
    function ({ addVariant }: { addVariant: (name: string, selector: string) => void }) {
      addVariant("admin-dark", ".admin-dark &");
    },
  ],
};

export default config;
