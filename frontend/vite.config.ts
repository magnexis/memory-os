import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          radix: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-slider",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip"
          ],
          graph: ["@xyflow/react"],
          three: ["three", "@react-three/fiber"],
          charts: ["echarts"],
          animation: ["gsap"],
          search: ["fuse.js"],
          query: ["@tanstack/react-query", "zustand"]
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4400",
      "/realtime": {
        target: "ws://localhost:4400",
        ws: true
      }
    }
  }
});
