import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";

// Define aliases directly here to ensure they're properly resolved
const alias = {
  "@utils": resolve(__dirname, "src/utils"),
  "@hooks": resolve(__dirname, "src/hooks"),
  "@components": resolve(__dirname, "src/components"),
  "@context": resolve(__dirname, "src/context"),
  "@types": resolve(__dirname, "src/types"),
};

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    visualizer({
      filename: "stats.html",
      gzipSize: true,
    }),
  ],
  resolve: { alias },
  css: {
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[local]_[hash:base64:5]",
    },
  },
  build: {
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "BaselineKit",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: { react: "React", "react-dom": "ReactDOM" },
        assetFileNames: (assetInfo) =>
          assetInfo.name && assetInfo.name.endsWith(".css")
            ? "styles.css"
            : (assetInfo.name ?? "[name]-[hash][extname]"),
      },
    },
    sourcemap: true,
  },
}));
