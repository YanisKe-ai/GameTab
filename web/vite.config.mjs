// Vite-Build: web/ -> docs/index.html als EINE Datei (wie bisher die Wurzel-index.html).
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import fs from "node:fs";
import path from "node:path";

// Nach dem Build: PRECACHE_EXTRA in docs/sw.js aus den tatsaechlich vorhandenen Dateien erzeugen.
// Schrift-Quelldateien (ttf/otf, nur fuer den Bildexport) werden nicht vorab geladen.
function precacheList() {
  return {
    name: "gametab-precache",
    apply: "build",
    closeBundle() {
      const out = path.resolve(import.meta.dirname, "..", "docs");
      const swp = path.join(out, "sw.js");
      if (!fs.existsSync(swp)) return;
      const list = [];
      const walk = (dir) => {
        for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) walk(full);
          else list.push("./" + path.relative(out, full).split(path.sep).join("/"));
        }
      };
      for (const d of ["fonts", "icons", "img"]) if (fs.existsSync(path.join(out, d))) walk(path.join(out, d));
      const files = list.filter((f) => /\.(woff2|png|ico|webp)$/.test(f) && !/og-image/.test(f));
      files.push("./manifest.webmanifest");
      const sw = fs.readFileSync(swp, "utf8");
      const re = /const PRECACHE_EXTRA = \[[^\]]*\];/;
      if (!re.test(sw)) throw new Error("PRECACHE_EXTRA in sw.js nicht gefunden");
      fs.writeFileSync(swp, sw.replace(re, () => "const PRECACHE_EXTRA = " + JSON.stringify(files) + ";"));
      console.log(`docs/sw.js: ${files.length} Dateien im Precache`);
    },
  };
}

export default defineConfig({
  root: "web",
  base: "./",
  publicDir: "public",
  plugins: [viteSingleFile({ removeViteModuleLoader: true }), precacheList()],
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
