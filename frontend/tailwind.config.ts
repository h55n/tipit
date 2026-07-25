import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f2c23",
        "primary-70": "#314c41",
        "primary-80": "#17362d",
        secondary: "#10271d",
        neutral: "#f8ffe8",
        surface: "#f8ffe8",
        "on-surface": "#10271d",
        tertiary: "#e5e7eb",
        error: "#b42318",
      },
      fontFamily: {
        display: ["Funnel Sans", "sans-serif"],
        sans: ["Funnel Sans", "sans-serif"],
      },
      borderRadius: {
        full: "9999px",
        xl: "24px",
        lg: "16px",
        md: "8px",
        sm: "4px",
      },
    },
  },
  plugins: [],
};
export default config;
