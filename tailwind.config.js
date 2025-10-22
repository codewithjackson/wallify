/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./hooks/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        glass: "rgba(255,255,255,0.06)",
        accent: "#6366f1"
      },
      boxShadow: {
        "soft-glow": "0 6px 24px rgba(99,102,241,0.08)"
      }
    }
  },
  plugins: []
};
