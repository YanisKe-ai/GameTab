// Ergebnisbild Gruppe B: kleine gemeinsame Helfer (nicht Teil von kit.js).

/* Ordnet die Zusatzdaten (Liste in beliebiger Reihenfolge, je {name, ...}) den Zeilen von d.rows zu.
   Zuerst Name (und, wenn key gesetzt, gleicher Wert wie d.rows[i].score), jeder Eintrag nur einmal. Fehlt ein Treffer: null. */
function pickRows(d, list, key) {
  const left = (Array.isArray(list) ? list : []).slice();
  const clean = (s) => d.clean(String(s == null ? "" : s));
  const out = d.rows.map(() => null);
  const take = (i, ok) => { const j = left.findIndex(ok); if (j >= 0) { out[i] = left[j]; left.splice(j, 1); return true; } return false; };
  d.rows.forEach((r, i) => {
    const sc = d.rows[i].score;
    if (key && sc != null) take(i, (e) => e && clean(e.name) === r.name && Number(e[key]) === sc);
  });
  d.rows.forEach((r, i) => { if (!out[i]) take(i, (e) => e && clean(e.name) === r.name); });
  return out;
}
/* Vierzackiger Stern (Pfad in 40 x 40) */
const STAR = typeof Path2D !== "undefined" ? new Path2D("M20 0 C21 12 28 19 40 20 C28 21 21 28 20 40 C19 28 12 21 0 20 C12 19 19 12 20 0Z") : null;
function star(c, cx, cy, size, color, alpha) {
  c.save(); c.globalAlpha = alpha == null ? 1 : alpha; c.translate(cx - size / 2, cy - size / 2); c.scale(size / 40, size / 40); c.fillStyle = color; c.fill(STAR); c.restore();
}
/* Anzahl Eintraege im Namenstext, Zahl mit Vorzeichen */
function signed(d, n) { return (n > 0 ? "+" : "") + d.num(n); }
/* Kursive Schrift direkt setzen (kein Umweg ueber c.font, das je nach Browser anders ausgegeben wird) */
function setI(c, w, s, fam) { c.font = "italic " + w + " " + Math.round(s * 10) / 10 + "px " + fam; }
export { pickRows, star, signed, setI };
