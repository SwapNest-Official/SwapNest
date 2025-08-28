import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Import 'path' to resolve file paths

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Add alias
    },
  },
});
