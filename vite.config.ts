import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "./@lib"),
      "@shared": path.resolve(__dirname, "./@shared"),
    },
  },
});
