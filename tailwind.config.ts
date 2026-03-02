import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "money-market": "#00d4ff",
        "us-treasuries": "#4ade80",
        "private-credit": "#f97316",
        "private-equity": "#a855f7",
        commodities: "#eab308",
        equity: "#ec4899",
        bonds: "#6366f1",
      },
    },
  },
  plugins: [],
};
export default config;
