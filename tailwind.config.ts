import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // "slate" re-tinted as deep-sea teal so every surface matches her favourite colour
        slate: {
          50: "#f0fbfa",
          100: "#e2f5f4",
          200: "#c8e8e6",
          300: "#a3d3d0",
          400: "#76b2ae",
          500: "#4f8f8b",
          600: "#2f6e6b",
          700: "#1d5552",
          800: "#123e3c",
          900: "#0a2b2a",
          950: "#041b1b"
        }
      }
    }
  },
  plugins: []
};
export default config;
