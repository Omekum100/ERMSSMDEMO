/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f8f4ee",
          100: "#efe2cf",
          500: "#a54d2d",
          600: "#8f4024",
          700: "#73331e",
          900: "#38211b"
        },
        tribal: {
          clay: "#a54d2d",
          ochre: "#c58b2b",
          forest: "#355b4c",
          charcoal: "#38211b",
          ivory: "#f8f4ee",
          earth: "#e8d7bf"
        },
        accent: "#355b4c",
        surface: "#fcfaf6",
        line: "#dfd1be"
      },
      boxShadow: {
        panel: "0 12px 30px rgba(56, 33, 27, 0.08)",
        tribal: "0 18px 40px rgba(56, 33, 27, 0.12)"
      },
      backgroundImage: {
        "tribal-wash": "radial-gradient(circle at top right, rgba(197,139,43,0.14), transparent 28%), radial-gradient(circle at bottom left, rgba(165,77,45,0.10), transparent 30%)"
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-6px,0)" }
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.45" }
        }
      },
      animation: {
        drift: "drift 7s ease-in-out infinite",
        "pulse-line": "pulseLine 5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
