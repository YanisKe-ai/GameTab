// Vite-Build: web/ -> docs/index.html als EINE Datei (wie bisher die Wurzel-index.html).
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  root: "web",
  base: "./",
  publicDir: "public",
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    outDir: "../docs",
    emptyOutDir: true,
    minify: false,
    cssMinify: false,
    target: "esnext",
    modulePreload: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 10000,
    rolldownOptions: { treeshake: false },
  },
  server: { port: 5173 },
});
