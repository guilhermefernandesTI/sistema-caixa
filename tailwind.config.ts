import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#15231f", forest: "#0f766e", mint: "#d9f99d", cream: "#f7f8f3" }, boxShadow: { soft: "0 12px 40px rgba(21, 35, 31, 0.08)" } } },
  plugins: [],
};
export default config;
