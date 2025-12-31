import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
const proxyTarget = process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:8080';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // bind to all interfaces so dev server is reachable from host and other containers
    host: true,
    port: 5173,
    proxy: {
      // Proxy API-like routes to the configured backend target. In Docker use VITE_DEV_PROXY_TARGET=http://backend:8080
      '^/(api|admin|auth|user|doctor|feedback|vaccination|appointments|invoices)(.*)': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
