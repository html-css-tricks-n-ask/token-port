import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// ❌ remove this
// import { componentTagger } from "vite-plugin-component-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()], // 👈 removed componentTagger
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
