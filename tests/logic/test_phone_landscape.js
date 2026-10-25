// Logiktest Handy-Querformat: Entscheidungsfunktion decidePhoneLandscape (web/src/shared/phone-landscape.js)
// und ihr Spiegel im Inline-Script (web/index.html, Marker pl-decide-begin/-end; zusaetzlich docs/index.html falls gebaut).
// Aufruf: node tests/logic/test_phone_landscape.js
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");

function fromModule() {
  const src = fs.readFileSync(path.join(ROOT, "web/src/shared/phone-landscape.js"), "utf8");
  const a = src.indexOf("const PL_MAX_SHORT");
  const b0 = src.indexOf("function decidePhoneLandscape(");
  const b = src.indexOf("\n}\n", b0);
  if (a < 0 || b0 < 0 || b < 0) throw Error("decidePhoneLandscape nicht gefunden");
  const body = src.slice(a, src.indexOf("\n", a)) + "\n" + src.slice(b0, b + 2);
  return new Function(body + "\nreturn decidePhoneLandscape;")();
}
function fromInline(file) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return null;
  const html = fs.readFileSync(p, "utf8");
  const a = html.indexOf("/*pl-decide-begin*/"), b = html.indexOf("/*pl-decide-end*/");
  if (a < 0 || b < 0) throw Error("Marker pl-decide fehlen in " + file);
  return new Function(html.slice(a, b) + "\nreturn plDecide;")();
}

// Basis: Touch-Handy (iPhone 15 Pro, 393x852), Handy-Modus, keine Uebersteuerung.
const P = { viewMode: "mobile", force: null, touch: true, screenW: 393, screenH: 852, orientationType: "portrait-primary", windowOrientation: 0, mqLandscape: false, innerW: 393, innerH: 852 };
const L = { ...P, orientationType: "landscape-primary", windowOrientation: 90, mqLandscape: true, screenW: 852, screenH: 393, innerW: 852, innerH: 393 };
const CASES = [
  ["Hochformat", P, false],
  ["Hochformat + Tastatur (Fenster breiter als hoch)", { ...P, innerW: 393, innerH: 300, mqLandscape: true }, false],
  ["Hochformat + Tastatur, nur window.orientation (alte iOS)", { ...P, orientationType: null, innerH: 300, mqLandscape: true }, false],
  ["Hochformat + Tastatur, nur screen-Masse (Android ohne Orientation-API)", { ...P, orientationType: null, windowOrientation: null, innerH: 300, mqLandscape: true }, false],
  ["Querformat Handy", L, true],
  ["Querformat Handy 568x320", { ...L, screenW: 568, screenH: 320, innerW: 568, innerH: 320 }, true],
  ["Querformat Handy 932x430 (Pro Max)", { ...L, screenW: 932, screenH: 430, innerW: 932, innerH: 430 }, true],
  ["Querformat iOS (screen bleibt hochkant, orientation-API)", { ...L, screenW: 393, screenH: 852 }, true],
  ["Querformat altes iOS (nur window.orientation)", { ...L, orientationType: null, windowOrientation: -90, screenW: 393, screenH: 852 }, true],
  ["Querformat + Tastatur (Drehen mit offenem Feld)", { ...L, innerH: 180 }, true],
  ["Querformat, Split-Screen hochkant", { ...L, innerW: 380, innerH: 393 }, false],
  ["Tablet quer 1024x768", { ...L, screenW: 1024, screenH: 768, innerW: 1024, innerH: 768 }, false],
  ["iPad mini quer 1133x744", { ...L, screenW: 1133, screenH: 744, innerW: 1133, innerH: 744 }, false],
  ["Laptop-Modus auf Handy quer", { ...L, viewMode: "laptop" }, false],
  ["Laptop-Modus mit Uebersteuerung 1", { ...L, viewMode: "laptop", force: true }, false],
  ["Laptop-Modus 900x600", { ...L, viewMode: "laptop", touch: false, screenW: 1512, screenH: 982, innerW: 900, innerH: 600 }, false],
  ["Desktop 1512x982 Handy-Modus", { ...L, touch: false, screenW: 1512, screenH: 982, innerW: 1512, innerH: 982 }, false],
  ["Desktop, kleines Fenster 844x390 ohne Touch", { ...L, touch: false, screenW: 1512, screenH: 982, innerW: 844, innerH: 390 }, false],
  ["Touch-Laptop, kleines Fenster", { ...L, screenW: 1920, screenH: 1080, innerW: 844, innerH: 390 }, false],
  ["Uebersteuerung 1 im Hochformat", { ...P, force: true }, true],
  ["Uebersteuerung 0 im Querformat", { ...L, force: false }, false],
  ["Ohne screen-Masse, Fenster quer", { ...L, screenW: 0, screenH: 0 }, true],
  ["Leere Umgebung", {}, false],
];

let fails = 0, oks = 0;
const impls = [["Modul", fromModule()], ["web/index.html", fromInline("web/index.html")], ["docs/index.html", fromInline("docs/index.html")]];
for (const [label, fn] of impls) {
  if (!fn) { console.log("SKIP " + label + " (nicht vorhanden)"); continue; }
  for (const [name, env, want] of CASES) {
    const got = fn(env);
    if (got === want) oks++; else { fails++; console.log("FAIL [" + label + "] " + name + ": erwartet " + want + ", erhalten " + got); }
  }
}
console.log((fails ? "FEHLER" : "OK") + " phone-landscape: " + oks + " ok, " + fails + " fehlgeschlagen");
process.exit(fails ? 1 : 0);
