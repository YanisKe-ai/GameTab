// Ergebnisbild Jass Differenzler (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/differenzler.png, Look: gruener Jassteppich mit Goldrahmen).
// Regel der App: pro Kategorie zaehlt Punkte x Faktor; die Differenz ist der eigene Wert minus der Schnitt der anderen, die Gesamtdifferenz ist die Summe.
// HOECHSTE Gesamtdifferenz gewinnt (nicht "kleinste Differenz"). Sieger und Reihenfolge kommen aus gtEcModel, nichts davon wird hier berechnet.
// Zusatz (shareExtra aus JassGame): {title, players:[{name, diff, points}]} (points = Summe der Kategorie-Punkte x Faktor).
import { card } from "./cards.js";
import { pickRows, breakHy, unHy, signed } from "./util.js";

const GOLD = "#E8C46A", CREAM = "#FBF8EE", SOFT = "#CDE5BE";
const F_FRAU = '"Fraunces","Inter","GT Clean","GT CJK",serif';
const MONO = '"Space Grotesk","Inter","GT Clean","GT CJK",sans-serif';
/* Faecher: [Pivot x, Pivot y, Drehung, Wert, Farbe] (Karte 168 breit, Drehpunkt unten Mitte) */
const FAN = [[408, 521, -18, "6", "spade"], [528, 497, -6, "7", "heart"], [648, 497, 6, "8", "diamond"], [768, 521, 18, "9", "club"]];
let dotPat = null;

function bg(c, k) {
  c.fillStyle = "#0F5A34"; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  k.cssEllipse(c, 0, 0, k.TPL_W, k.TPL_H, 540, 472.5, [[0, "#16794A"], [0.55, "#0F5A34"], [1, "#093D23"]]);
  if (!dotPat) { const t = document.createElement("canvas"); t.width = t.height = 5; const x = t.getContext("2d"); x.fillStyle = "#000"; x.beginPath(); x.arc(2.5, 2.5, 0.8, 0, 7); x.fill(); dotPat = c.createPattern(t, "repeat"); }
  c.save(); c.globalAlpha = 0.18; c.globalCompositeOperation = "multiply"; c.fillStyle = dotPat; c.fillRect(0, 0, k.TPL_W, k.TPL_H); c.restore();
  c.strokeStyle = GOLD; c.lineWidth = 4; k.rrect(c, 38, 38, 1004, 1274, 24); c.stroke();
  c.strokeStyle = "rgba(232,196,106,0.53)"; c.lineWidth = 1.5; k.rrect(c, 50.75, 50.75, 978.5, 1248.5, 17); c.stroke();
}
function fan(c, k) {
  FAN.forEach(([px, py, rot, rank, s]) => {
    c.save(); c.translate(px, py); c.rotate(rot * Math.PI / 180);
    c.save(); c.shadowColor = "rgba(0,0,0,0.47)"; c.shadowBlur = 22; c.shadowOffsetY = 10; c.fillStyle = "#FBF8EE"; k.rrect(c, -84, -235, 168, 235, 13); c.fill(); c.restore();
    card(c, k, -84, -235, 168, { rank, suit: s, rot: 0, fam: F_FRAU, shadow: false });
    c.restore();
  });
}
function head(c, k, d, title) {
  const lw = k.logo(c, d.logo, 100, 92, 100, GOLD);
  k.setFont(c, 800, 50, k.F_BALOO); c.fillStyle = GOLD; c.fillText("GameTab", 100 + lw + 22, 92 + 50 + 17);
  // Spielname gross, rechts
  const x1 = 980, room = x1 - (100 + lw + 22 + 230);
  const a = k.fit(c, d.gameLabel, { w: 700, fam: F_FRAU, max: 40, min: 20, maxW: room, lines: 1 });
  k.setFont(c, 700, a.size, F_FRAU); c.fillStyle = GOLD; c.textAlign = "right"; c.fillText(a.lines[0], x1, 138);
  if (title) { const b = k.fit(c, title, { w: 700, fam: F_FRAU, max: 64, min: 24, maxW: room, lines: 1 }); k.setFont(c, 700, b.size, F_FRAU); c.fillStyle = CREAM; c.fillText(b.lines[0], x1, 138 + 8 + b.size * 0.86); }
  c.textAlign = "left";
}
function layoutRows(c, k, d, pts, hasPts, nameW, availH) {
  const n = d.rows.length;
  const base = n <= 2 ? { w: [112, 84], v: [96, 72], df: [124, 92] } : n <= 3 ? { w: [92, 60], v: [80, 54], df: [104, 68] } : { w: [70, 48], v: [60, 42], df: [80, 54] };
  for (let s = 1; s >= 0.55; s -= 0.05) {
    const L = d.rows.map((r, i) => {
      const w = r.winner ? 0 : 1, nsz = base.w[w] * s, vs = base.v[w] * s, ds = base.df[w] * s;
      let f = k.fit(c, r.name, { w: 700, fam: F_FRAU, max: nsz, min: nsz * 0.7, maxW: nameW, lines: 1 });
      if (f.cut) { f = k.fit(c, breakHy(r.name), { w: 700, fam: F_FRAU, max: nsz * 0.62, min: 18, maxW: nameW, lines: 2 }); f.lines = unHy(f.lines); }
      const h = Math.max(ds * 1.12, f.lines.length * f.size * 1.08) + 24;
      return { r, f, nsz, vs, ds, h, pts: pts[i] };
    });
    const tot = L.reduce((a, l) => a + l.h, 0);
    if (tot <= availH || s <= 0.56) return L;
  }
  return [];
}
function page1(d, k, extras, title) {
  const { cv, c } = k.tplCanvas();
  bg(c, k); head(c, k, d, title); fan(c, k);
  const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
  // Schlagzeile
  const names = win.map((r) => r.name).join(" & ");
  const line = d.tie ? d.tr("tplDfWinN", (nm) => nm + "")(names) : d.tr("tplDfWin1", (nm) => nm + "")(names);
  let hf = k.fit(c, line, { w: 700, fam: F_FRAU, max: 104, min: 54, maxW: 940, lines: 1 });
  let hl = hf.lines, hs = hf.size;
  if (hf.cut) { const h2 = k.fit(c, breakHy(line), { w: 700, fam: F_FRAU, max: 62, min: 34, maxW: 940, lines: 2 }); hl = unHy(h2.lines); hs = h2.size; }
  k.setFont(c, 700, hs, F_FRAU); c.fillStyle = CREAM; c.textAlign = "center";
  hl.forEach((ln, i) => c.fillText(ln, 540, k.cssBase(c, 600 + i * hs * 1.05 + (hl.length > 1 ? -6 : 0), hs)));
  const rule = d.up(d.tr("tplDfRule", "Höchste Gesamtdifferenz gewinnt"));
  const rf = k.fit(c, rule, { w: 700, fam: MONO, max: 28, min: 14, maxW: 900, lines: 1, ls: 0.04 });
  k.setFont(c, 700, rf.size, MONO); c.fillStyle = GOLD; k.spaced(c, rule, 540, 735 + rf.size * 0.95, rf.size * 0.04, "center"); c.textAlign = "left";
  // Tabelle
  const hasPts = extras.some((e) => e && e.points != null);
  const big = d.rows.length <= 3;
  const huge = d.rows.length <= 2;
  k.setFont(c, 700, huge ? 124 : big ? 104 : 80, F_FRAU); const dw = Math.max(...d.rows.map((r) => c.measureText(signed(d, r.score != null ? r.score : 0)).width));
  k.setFont(c, 700, huge ? 96 : big ? 80 : 60, F_FRAU); const pw = hasPts ? Math.max(...extras.map((e) => (e && e.points != null ? c.measureText(d.num(e.points)).width : 0))) : 0;
  const colD = Math.min(400, Math.max(170, dw + 30)), colP = hasPts ? Math.min(330, Math.max(150, pw + 30)) : 0, nameW = 880 - colD - colP - 20;
  const top = 800;
  const L = layoutRows(c, k, d, extras.map((e) => (e && e.points != null ? e.points : null)), hasPts, nameW, 1205 - top - 44);
  const hfs = 22;
  k.setFont(c, 500, hfs, MONO); c.fillStyle = SOFT;
  k.spaced(c, d.up(d.model.playerLabel), 100, top + hfs, 2, "left");
  if (hasPts) k.spaced(c, d.up(d.tr("tplDfPts", "Punkte")), 980 - colD, top + hfs, 2, "right");
  k.spaced(c, d.up(d.tr("tplDfDiff", "Differenz")), 980, top + hfs, 2, "right");
  let y = top + 44;
  L.forEach((l) => {
    const r = l.r;
    c.fillStyle = "rgba(232,196,106,0.33)"; c.fillRect(100, y, 880, 2);
    const mid = y + 2 + (l.h - 2) / 2;
    k.setFont(c, 700, l.ds, F_FRAU); const cap = k.capH(c);
    c.fillStyle = GOLD; if (r.winner) c.fillStyle = "#fff"; c.textAlign = "right"; c.fillText(r.score != null ? signed(d, r.score) : r.value, 980, mid + cap / 2);
    if (hasPts && l.pts != null) { k.setFont(c, 700, l.vs, F_FRAU); c.fillStyle = r.winner ? "#fff" : CREAM; c.fillText(d.num(l.pts), 980 - colD, mid + k.capH(c) / 2); }
    c.textAlign = "left"; k.setFont(c, 700, l.f.size, F_FRAU); c.fillStyle = r.winner ? "#fff" : CREAM;
    const lh = l.f.size * 1.08, cp = k.capH(c);
    l.f.lines.forEach((ln, i) => c.fillText(ln, 100, mid - ((l.f.lines.length - 1) * lh) / 2 + i * lh + cp / 2));
    y += l.h;
  });
  k.setFont(c, 500, 24, MONO); c.fillStyle = SOFT; c.textAlign = "center"; c.fillText(d.date, 540, 1262); c.textAlign = "left";
  return cv;
}

export default {
  games: ["jass-differenzler"],
  fonts: ["700 104px Fraunces", "800 52px \"Baloo 2\"", "700 28px \"Space Grotesk\"", "500 22px \"Space Grotesk\""],
  texts: (d) => [d.tr("tplDfWin1", (n) => n)(""), d.tr("tplDfWinN", (n) => n)(""), d.up(d.tr("tplDfRule", "")), d.up(d.tr("tplDfPts", "")), d.up(d.tr("tplDfDiff", "")), d.up(d.model.playerLabel), (d.extra && d.extra.title) || "", "+-0123456789"],
  accepts: (d) => d.rows.length >= 2 && d.rows.length <= 4 && d.rows.every((r) => r.score != null),
  render(d, k) {
    const ex = d.extra || {};
    const picked = pickRows(d, ex.players, "diff");
    const extras = picked.map((e) => (e && e.points != null && isFinite(Number(e.points)) ? { points: Number(e.points) } : null));
    const title = typeof ex.title === "string" && ex.title ? ex.title : null;
    return [page1(d, k, extras, title)];
  },
};
