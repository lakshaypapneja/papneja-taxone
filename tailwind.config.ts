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
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1a56db", // TaxOne/Suvit Royal Blue
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#0f275e", // Papneja Navy Deep
          950: "#081638",
        },
      },
    },
  },
  plugins: [],
};
export default config;
