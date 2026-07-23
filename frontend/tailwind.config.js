/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        panchayat: {
          saffron: "#FF9933",
          white: "#FFFFFF",
          green: "#138808",
          blue: "#000080",
          dark: "#0F172A",
          card: "#1E293B",
          accent: "#2563EB"
        }
      }
    },
  },
  plugins: [],
}
