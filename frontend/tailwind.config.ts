import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', "cursive"],
        sans: ["Outfit", "sans-serif"],
      },
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          2:       "hsl(var(--surface-2))",
          3:       "hsl(var(--surface-3))",
        },
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dim:        "hsl(var(--primary) / .1)",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          dim:     "hsl(var(--gold) / .1)",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          dim:     "hsl(var(--success) / .1)",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          dim:     "hsl(var(--danger) / .1)",
        },
        purple: {
          DEFAULT: "hsl(var(--purple))",
        },
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xl:  "calc(var(--radius) + 4px)",
        "2xl":"calc(var(--radius) + 8px)",
      },
      keyframes: {
        "fade-up":   { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in":   { from: { opacity: "0" }, to: { opacity: "1" } },
        ping:        { "75%,100%": { transform: "scale(2)", opacity: "0" } },
        pulse:       { "0%,100%": { opacity: "1" }, "50%": { opacity: ".3" } },
        spin:        { to: { transform: "rotate(360deg)" } },
        "scale-pop": { from: { transform: "scale(.93)", opacity: "0" }, to: { transform: "scale(1)", opacity: "1" } },
        shimmer:     { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
      animation: {
        "fade-up":   "fade-up .4s ease both",
        "fade-in":   "fade-in .3s ease both",
        "scale-pop": "scale-pop .35s ease both",
        ping:        "ping 1.4s ease infinite",
        pulse:       "pulse 2s ease infinite",
        spin:        "spin .8s linear infinite",
        shimmer:     "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
