// Zusatzschriften fuer die Ergebnisbild-Vorlagen der Gruppe A (Skyjo, Flip 7, Tutto, Freies Spiel, HeadsUp, 5 Sekunden).
// Als woff2 (nur Latein, klein) in fonts/, im Precache. Die Faces werden hier nur angemeldet (kein Netz), geladen wird erst beim ersten Bild
// ueber die Angabe in `fonts` der Vorlage (document.fonts.load). Fehlt eine Schrift, zeichnet der Stapel mit Inter/GT Clean weiter.
const FACES = [
  ["GTR Archivo", "ArchivoBlack-Regular-lat.woff2", "400", "normal"],
  ["GTR Brush", "CaveatBrush-Regular-lat.woff2", "400", "normal"],
  ["GTR Mono", "IBMPlexMono-Regular-lat.woff2", "400", "normal"],
  ["GTR Mono", "IBMPlexMono-SemiBold-lat.woff2", "600", "normal"],
  ["GTR InterBI", "Inter-BlackItalic-lat.woff2", "900", "normal"],
  ["GTR Bowlby", "BowlbyOne-Regular-lat.woff2", "400", "normal"],
];
let done = false;
function registerA() {
  if (done || typeof document === "undefined" || typeof FontFace === "undefined") return;
  done = true;
  FACES.forEach(([fam, file, w, st]) => {
    try { document.fonts.add(new FontFace(fam, 'url("' + new URL("fonts/" + file, document.baseURI).href + '") format("woff2")', { weight: w, style: st, display: "block" })); } catch (_) { /* weich */ }
  });
}
registerA();

const FB = ',"Inter","GT Clean","GT CJK",sans-serif';
const F_ARCHIVO = '"GTR Archivo"' + FB;
const F_BRUSH = '"GTR Brush"' + FB;
const F_MONO = '"GTR Mono"' + FB;
const F_INTERBI = '"GTR InterBI"' + FB;
const F_BOWLBY = '"GTR Bowlby"' + FB;
const F_SPACE = '"Space Grotesk"' + FB;
const F_FRAUNCES = '"Fraunces"' + FB;

export { F_BOWLBY, F_ARCHIVO, F_BRUSH, F_MONO, F_INTERBI, F_SPACE, F_FRAUNCES, registerA };
