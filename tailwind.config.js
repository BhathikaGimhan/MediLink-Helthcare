/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "fade-in-out": "fade 2s ease-in-out infinite",
        glow: "glow 1.5s ease-in-out infinite",
        spark: "spark 3s ease-in-out infinite",
      },
      keyframes: {
        fade: {
          "0%, 100%": { opacity: 0 },
          "50%": { opacity: 1 },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 10px #00f6ff, 0 0 20px #00f6ff" },
          "50%": { boxShadow: "0 0 15px #00f6ff, 0 0 30px #00f6ff" },
        },
        spark: {
          "0%": { transform: "translate(0, 0)", opacity: 1 },
          "50%": { transform: "translate(20px, 20px)", opacity: 0.5 },
          "100%": { transform: "translate(40px, 40px)", opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
