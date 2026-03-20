import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#0D93F2",
          hover: "#0B7DD0",
          light: "#E8F4FD",
        },
      },

      maxWidth: {
        timeline: "600px",
      },
    },
  },

  plugins: [],
};

export default config;
