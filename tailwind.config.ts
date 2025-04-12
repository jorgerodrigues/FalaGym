import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        caption: ["12px", { lineHeight: "18px", fontWeight: "300" }],
        base: ["16px", { lineHeight: "24px", fontWeight: "300" }],
        large: ["24px", { lineHeight: "36px", fontWeight: "600" }],
        number: ["32px", { lineHeight: "48px", fontWeight: "400" }],
        ["base-bold"]: ["16px", { lineHeight: "24px", fontWeight: "500" }],
      },
      fontFamily: {
        // Adding our fonts while keeping Tailwind defaults
        sans: ["var(--font-lexend)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-dm-mono)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        bg: {
          default: colors.neutral[50],
        },
        text: {
          dark: colors.slate[600],
          light: colors.slate[400],
          placeholder: colors.slate[300],
          white: colors.white,
        },
        control: {
          cta: colors.yellow[400],
          ctaHover: colors.yellow[600],
          default: colors.slate[600],
          hover: colors.slate[400],
          secondary: colors.white,
          secondaryHover: colors.slate[400],
          disabled: colors.slate[200],
        },
        border: {
          default: colors.slate[200],
        },
      },
      // Custom spacing for our larger gaps while keeping Tailwind defaults
      spacing: {
        xSmall: "4px",
        small: "16px",
        large: "24px",
        xLarge: "48px",
      },
      maxWidth: {
        content: "42rem", // 672px - our main content width
      },
    },
  },
  plugins: [],
} satisfies Config;
