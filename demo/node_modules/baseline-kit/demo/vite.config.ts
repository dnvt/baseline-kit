import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": resolve(__dirname, "../src/components"),
      "@context": resolve(__dirname, "../src/context"),
      "@hooks": resolve(__dirname, "../src/hooks"),
      "@types": resolve(__dirname, "../src/types"),
      "@utils": resolve(__dirname, "../src/utils"),
    },
  },
});
