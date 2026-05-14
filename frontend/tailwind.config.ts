import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        mist: "#EFEFEF",
        fern: "#2f6b4f",
        gold: "#F5C430",
        clay: "#d86f45",
        sea: "#9cd7cb",
        canvas: "#EFEFEF"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(16, 34, 29, 0.12)"
      },
      backgroundImage: {
        grid: "radial-gradient(circle at center, rgba(14, 27, 23, 0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;

