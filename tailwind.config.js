/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        paper: "#ffffff",
        dim: "#f1f1f1",
        steel: "#5c5c5c",
        line: "#111111",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        comic: "5px 5px 0 0 #0a0a0a",
        "comic-sm": "3px 3px 0 0 #0a0a0a",
        "comic-lg": "8px 8px 0 0 #0a0a0a",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        flicker: "flicker 1.6s steps(2,end) infinite",
      },
    },
  },
  plugins: [],
};
