// Vite-Build: web/ -> docs/index.html als EINE Datei (wie bisher die Wurzel-index.html).
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  root: "web",
  base: "./",
  publicDir: "public",
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  // Vite 8 nutzt oxc. Klassische JSX-Runtime, damit der Emoji-Filter in prelude.js
  // (Patch auf React.createElement) auch fuer JSX greift. JSX ist auch in .js erlaubt.
  oxc: { include: /\.(m?[jt]sx?)$/, jsx: { runtime: "classic", pragma: "React.createElement", pragmaFrag: "React.Fragment" } },
  plugins: [tailwindcss(), viteSingleFile({ removeViteModuleLoader: true })],
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
