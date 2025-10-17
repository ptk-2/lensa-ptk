import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",      // <-- Pastikan mengacu ke folder app di root
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // <-- Pastikan mengacu ke folder components di root
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",     // <-- Untuk jaga-jaga jika ada folder pages
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
export default config;