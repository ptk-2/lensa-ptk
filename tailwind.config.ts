import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Hapus 'src/' dari sini
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
export default config;