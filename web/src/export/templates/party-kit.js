// Gemeinsame Helfer fuer die Partyspiel-Vorlagen (Impostor, Werwolf, Mafia, Verraeter, Am ehesten). kit.js bleibt unveraendert.
// Plex Mono (Entwurf-Schrift fuer Zeilen und Datum) wird hier als FontFace registriert; document.fonts.load in den Vorlagen laedt sie.
const F_MONO = '"Plex Mono","Inter","GT Clean","GT CJK",monospace';
const F_FRAUNCES = '"Fraunces","Inter","GT Clean","GT CJK",serif';
const F_ARCHIVO = '"Plex Mono"';
try {
  if (typeof document !== "undefined" && document.fonts && typeof FontFace !== "undefined") {
    [["IBMPlexMono-Regular.ttf", "400"], ["IBMPlexMono-SemiBold.ttf", "600"]].forEach(([f, w]) => {
      const ff = new FontFace("Plex Mono", 'url("' + new URL("fonts/" + f, document.baseURI).href + '")', { weight: w, style: "normal", display: "block" });
      document.fonts.add(ff);
    });
  }
} catch (_) { /* weich: dann Ersatzschrift */ }

/* Zahl-zu-Zufall, stabil pro Text (nur Dekoration: Hoehen, Neigungen) */
function hash(s) { let h = 2166136261; const t = String(s); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
function listJoin(items, locale) {
  try { return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(items); } catch (_) { return items.join(", "); }
}
/* "Samstag, 1. November 2026" -> ["Samstag","1. November 2026"] */
function dateLines(date) {
  const m = String(date).match(/^([^,\s]+)[,\s]+(.+)$/u);
  return m ? [m[1], m[2]] : [String(date)];
}
/* Fusszeile wie im Entwurf: Logo 96 px, GameTab (Baloo), Datum rechts in zwei Zeilen. bottom = Abstand des Logos zum Rand */
function footer(c, k, d, color, bottom) {
  const h = 96, y = k.TPL_H - bottom - h, cy = y + h / 2;
  const lw = k.logo(c, d.logo, 70, y, h, color);
  const x = 70 + lw + 22;
  c.fillStyle = color; k.setFont(c, 800, 50, k.F_BALOO); c.fillText("GameTab", x, cy + 17);
  const L = dateLines(d.date), lh = 31.2;
  c.textAlign = "right";
  const fs = [24];
  k.setFont(c, 600, 24, F_MONO);
  const wmax = Math.max(...L.map((s) => c.measureText(s).width)), room = 1010 - (x + 330);
  const sz = wmax > room ? Math.max(16, 24 * room / wmax) : 24;
  k.setFont(c, 600, sz, F_MONO);
  const top = cy - lh * L.length / 2;
  L.forEach((s, i) => c.fillText(s, 1010, k.cssBase(c, top + i * lh, lh)));
  c.textAlign = "left"; void fs;
}
/* Text in einer Zeile in Box zentriert zeichnen (Schrift passt sich an) */
function fitLine(c, k, text, o) {
  const f = k.fit(c, text, o); k.setFont(c, o.w, f.size, o.fam); return f;
}
/* Gemeinsame Schriftliste fuer tplFonts */
const FONTS_BASE = ['800 50px "Baloo 2"', '600 24px "Plex Mono"', '400 24px "Plex Mono"'];

/* Passt Text in hoechstens o.lines Zeilen: ganze Woerter bleiben ganz (Bindestrich darf umbrechen), erst zuletzt schrumpft die Schrift unter o.min.
   Gekuerzt wird nie, solange die Schrift noch bis o.floor (Standard 15) verkleinert werden kann. */
function fitWords(c, k, text, o) {
  const L = o.lines || 1, floor = Math.min(o.min, o.floor || 15), step = Math.max(0.5, o.max * 0.02);
  const variants = [String(text), String(text).replace(/-(?=\S)/g, "- ")];
  // Stufe 1: Schrift bis o.min, Stufe 2: bis floor; ein Wort darf nie gebrochen werden
  for (const lim of [o.min, floor]) {
    for (let size = o.max; size >= lim - 0.01; size -= step) {
      k.setFont(c, o.w, size, o.fam);
      for (const v of variants) {
        const ws = v.split(/\s+/u).filter(Boolean);
        if (ws.some((w) => c.measureText(w).width > o.maxW)) continue;
        const lines = k.wrap(c, v, o.maxW);
        if (lines.length <= L) return { size, lines: lines.map((l) => l.replace(/- /g, "-")), cut: false };
      }
    }
  }
  return k.fit(c, text, Object.assign({}, o, { min: floor }));
}
export { fitWords, F_MONO, F_FRAUNCES, F_ARCHIVO, hash, listJoin, dateLines, footer, fitLine, FONTS_BASE };
