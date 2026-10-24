// Kopiert die statischen Dateien aus der Projektwurzel nach web/public (Quelle bleibt die Wurzel).
// Vite legt sie beim Build unveraendert neben docs/index.html.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PUB = path.join(ROOT, "web", "public");
const ITEMS = ["sw.js", "version.json", "manifest.webmanifest", "fonts", "icons", "datenschutz.html", "impressum.html"];

fs.rmSync(PUB, { recursive: true, force: true });
fs.mkdirSync(PUB, { recursive: true });
let n = 0;
for (const it of ITEMS) {
  const src = path.join(ROOT, it);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, path.join(PUB, it), { recursive: true, filter: (p) => !p.endsWith(".DS_Store") });
  n++;
}
console.log(`web/public: ${n} Eintraege aus der Wurzel kopiert`);
