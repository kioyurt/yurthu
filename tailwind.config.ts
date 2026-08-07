import type { Config } from "tailwindcss";

const config: Config = {
  // 🔧 必须是 "class"，next-themes 通过添加 class="dark" 来切换
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;