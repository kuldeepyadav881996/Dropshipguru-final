import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: "#F5B400",
        goldDark: "#FF8C00",
        purple: "#8B5CF6",
        purpleDeep: "#6D28D9",
        bgDark: "#05050A",
        cardDark: "#12121A",
        bodyText: "#A0A0A8",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
