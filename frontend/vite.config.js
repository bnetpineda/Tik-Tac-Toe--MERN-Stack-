// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // You can specify the frontend port
    proxy: {
      // Proxy /api requests to your backend server
      "/api": {
        target: "http://localhost:5001", // Your backend server address
        changeOrigin: true, // Recommended for virtual hosted sites
        // rewrite: (path) => path.replace(/^\/api/, ''), // if your backend doesn't have /api prefix
      },
    },
  },
});
