// Vite-Build: web/ -> docs/index.html als EINE Datei (wie bisher die Wurzel-index.html).
import { defineConfig, transformWithOxc } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import tailwindcss from "@tailwindcss/vite";
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

// JSX in .js (Etappe 4c): Vites oxc-Plugin schliesst .js aus und parst .js ohne JSX.
// Darum eigene Vorstufe: .js-Dateien aus web/src mit JSX (klassisch) nach React.createElement.
const JSX_CLASSIC = { runtime: "classic", pragma: "React.createElement", pragmaFrag: "React.Fragment" };
const jsxInJs = {
  name: "gt-jsx-in-js",
  enforce: "pre",
  async transform(code, id) {
    const file = id.split("?")[0];
    if (!file.endsWith(".js") || file.includes("/node_modules/") || !/<\/|\/>|<>/.test(code)) return null;
    const r = await transformWithOxc(code, file, { lang: "jsx", jsx: JSX_CLASSIC, sourcemap: false });
    return { code: r.code, map: null };
  },
};

export default defineConfig({
  root: "web",
  base: "./",
  publicDir: "public",
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  // Vite 8 nutzt oxc. Klassische JSX-Runtime, damit der Emoji-Filter in prelude.js
  // (Patch auf React.createElement) auch fuer JSX greift. JSX ist auch in .js erlaubt.
  oxc: { include: /\.(m?[jt]sx?)$/, jsx: { runtime: "classic", pragma: "React.createElement", pragmaFrag: "React.Fragment" } },
  plugins: [jsxInJs, tailwindcss(), viteSingleFile({ removeViteModuleLoader: true }), precacheList()],
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
