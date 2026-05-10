import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#03060b",
        ink: "#07111f",
        panel: "#0a1322",
        line: "#1f395d",
        signal: "#49b8ff",
        cyan: "#62f0ff",
        gold: "#ffc86a",
        rose: "#ff6f91"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        signal: "0 0 24px rgba(73, 184, 255, .28)",
        node: "0 0 32px rgba(98, 240, 255, .2)"
      }
    }
  },
  plugins: []
} satisfies Config;
