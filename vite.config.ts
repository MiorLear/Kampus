// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Usa PORT o VITE_PORT si existen; si no, arranca en 3000
const BASE_PORT =
  Number(process.env.PORT) || Number(process.env.VITE_PORT) || 3000;

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    outDir: "build",
  },
  server: {
    port: BASE_PORT,
    strictPort: false, // 👈 si está ocupado, Vite probará 3001, 3002, ...
    open: true,
    // host: true, // descomenta si quieres aceptar conexiones de la red local
  },
  preview: {
    port: Number(process.env.PREVIEW_PORT) || 4173,
    strictPort: false, // también permite cambiar en preview
  },
});
