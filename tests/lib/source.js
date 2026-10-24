// Liefert den App-Quelltext fuer die Logiktests.
// Standard: Inhalt der HTML-Datei (Argument, GAMETAB_HTML oder index.html).
// GAMETAB_SRC=web und web/src vorhanden: Module in Import-Reihenfolge von
// web/src/main.js zusammengesetzt, Import/Export-Zeilen entfernt (wie tools/split.mjs --verify).
// JSX (Etappe 4c) wird dabei zeilenerhaltend zurueck in React.createElement verwandelt (tools/jsx2ce.cjs),
// damit die Tests Codezeilen weiterhin mit new Function auswerten koennen.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");

function htmlPath(arg) {
  if (arg) return path.resolve(arg);
  return path.resolve(ROOT, process.env.GAMETAB_HTML || "index.html");
}

const IMPORT_RE = /^\s*import\s+(?:[^"'()]*?\s+from\s+)?["']([^"']+)["'];?\s*$/;

function stripLine(line) {
  // Bild-Import ("import X from './img/x.png'") -> Platzhalter-String, damit der Name definiert bleibt
  const asset = line.match(/^\s*import\s+([A-Za-z_$][\w$]*)\s+from\s+["'][^"']+\.(png|webp|jpe?g|svg|gif|woff2?)["'];?\s*$/);
  if (asset) return `const ${asset[1]} = "data:,";`;
  if (IMPORT_RE.test(line)) return null;
  // "export { a, b };" und "export * from ..." entfernen
  if (/^\s*export\s*\{[^}]*\}\s*(from\s*["'][^"']+["'])?\s*;?\s*$/.test(line)) return null;
  if (/^\s*export\s+\*\s+from\s/.test(line)) return null;
  // "export const/function/..." -> Schluesselwort entfernen
  return line.replace(/^(\s*)export\s+(default\s+)?(?=(const|let|var|function|async|class)\b)/, "$1");
}

let jsxToCeSplice = null;
function jsxToCe(text) {
  if (!/<\/|\/>|<>/.test(text)) return text;
  if (!jsxToCeSplice) jsxToCeSplice = require(path.join(ROOT, "tools", "jsx2ce.cjs")).jsxToCeSplice;
  return jsxToCeSplice(text);
}

function composeWeb() {
  const entry = path.join(ROOT, "web", "src", "main.js");
  const seen = new Set(), out = [];
  function visit(file) {
    if (seen.has(file)) return;
    seen.add(file);
    const text = jsxToCe(fs.readFileSync(file, "utf8"));
    // Importe in Quellreihenfolge zuerst besuchen (ES-Modul-Auswertungsreihenfolge)
    for (const line of text.split("\n")) {
      const m = line.match(IMPORT_RE);
      if (m && m[1].startsWith(".")) {
        let t = path.resolve(path.dirname(file), m[1]);
        if (!fs.existsSync(t) && fs.existsSync(t + ".js")) t += ".js";
        if (fs.existsSync(t) && fs.statSync(t).isFile() && t.endsWith(".js")) visit(t);
      }
    }
    const kept = [];
    for (const line of text.split("\n")) { const r = stripLine(line); if (r !== null) kept.push(r); }
    out.push(kept.join("\n"));
  }
  visit(entry);
  return out.join("\n");
}

function getSource(arg) {
  if (process.env.GAMETAB_SRC === "web" && fs.existsSync(path.join(ROOT, "web", "src", "main.js"))) return composeWeb();
  return fs.readFileSync(htmlPath(arg), "utf8");
}

module.exports = { getSource, htmlPath, ROOT };
