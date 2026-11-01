// Ergebnisbild Tutto (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/tutto.png).
// Daten: gtEcModel (Raenge, Gleichstand, Summen) plus shareExtra {target}. Balken = Summe / Ziel (bei mehr als dem Ziel gekappt, nie negativ).
// Wuerfel und Bonuskarten sind Spielsymbole (Dekoration, keine Wurf- oder Kartendaten).
import { F_INTERBI } from "./fonts-a.js";

const INK = "#14101C", RED = "#D7141F", BARRED = "#C8102E", YEL = "#F7C32E", CARD = "#C1798F";
const FIRST_CAP = 8;
const DICE = [[60, 540, -8, 1], [225, 565, 6, 1], [390, 535, -4, 1], [100, 700, 7, 5], [270, 720, -9, 5], [440, 700, 5, 5]];
const PIPS = { 1: [[1, 1]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]] };
const BONUS = [["500", -8], ["2x", 5], ["1000", -3]];

function bg(c, k) {
  c.fillStyle = YEL; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  const rx = Math.hypot(540, 1350 - 297);
  const g = c.createRadialGradient(540, 297, 0, 540, 297, rx);
  g.addColorStop(0, "#FFE27A"); g.addColorStop(0.6, "rgba(255,226,122,0)"); g.addColorStop(1, "rgba(255,226,122,0)");
  c.fillStyle = g; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
}
/* Titel schraeg, mit weissem Rand und hartem Schatten (Inter Black Italic) */
function hero(c, k, d) {
  const label = d.up(d.gameLabel), ls = -0.02;
  const f = k.fit(c, label, { w: 900, fam: F_INTERBI, max: 262, min: 110, maxW: 900, ls, lines: 1 });
  const fs = f.size, txt = f.lines[0];
  k.setFont(c, 900, fs, F_INTERBI);
  const g = k.seg(txt), ws = g.map((q) => c.measureText(q).width), tot = ws.reduce((a, b) => a + b, 0) + ls * fs * Math.max(0, g.length - 1);
  c.save();
  c.translate(540, 171); c.rotate(-5 * Math.PI / 180); c.transform(1, 0, Math.tan(-6 * Math.PI / 180), 1, 0, 0);
  const base = k.cssBase(c, -fs / 2, fs);
  c.lineJoin = "round"; c.lineWidth = 34; c.textAlign = "left";
  const pass = (dx, dy, style, stroke) => { let x = -tot / 2 + dx; g.forEach((q, i) => { c[stroke ? "strokeText" : "fillText"](q, x, base + dy); x += ws[i] + ls * fs; }); c[stroke ? "strokeStyle" : "fillStyle"] = style; };
  c.strokeStyle = INK; pass(14, 16, INK, true);
  c.strokeStyle = "#FFFFFF"; pass(0, 0, "#FFFFFF", true);
  c.fillStyle = RED; pass(0, 0, RED, false);
  c.restore();
}
function die(c, k, x, y, rot, n, s) {
  const h = s / 2;
  c.save(); c.translate(x + h, y + h); c.rotate(rot * Math.PI / 180);
  c.fillStyle = INK; k.rrect(c, -h + 10 * s / 140, -h + 12 * s / 140, s, s, 26 * s / 140); c.fill();
  c.fillStyle = INK; k.rrect(c, -h, -h, s, s, 26 * s / 140); c.fill();
  c.fillStyle = "#FFFFFF"; const b = 6 * s / 140; k.rrect(c, -h + b, -h + b, s - 2 * b, s - 2 * b, Math.max(2, 20 * s / 140)); c.fill();
  c.fillStyle = INK;
  const inner = s - 2 * b, pr = s / 5 / 2;
  PIPS[n].forEach(([px, py]) => { c.beginPath(); c.arc(-h + b + (0.18 + px * 0.32) * inner, -h + b + (0.18 + py * 0.32) * inner, pr, 0, Math.PI * 2); c.fill(); });
  c.restore();
}
function bonus(c, k, d, i, dx, dy) {
  const [lab, rot] = BONUS[i];
  const x = 610 + i * 135, y = 560 + (i % 2) * 40, w = 130, h = 190;
  c.save(); c.translate(x + w / 2 + dx, y + h / 2 + dy); c.rotate(rot * Math.PI / 180);
  c.fillStyle = INK; k.rrect(c, -w / 2 + 8, -h / 2 + 10, w, h, 16); c.fill();
  k.rrect(c, -w / 2, -h / 2, w, h, 16); c.fill();
  c.fillStyle = CARD; k.rrect(c, -w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 11); c.fill();
  c.fillStyle = "#FFFFFF"; c.textAlign = "center";
  const f = k.fit(c, lab, { w: 400, fam: k.F_ANTON, max: 58, min: 30, maxW: w - 28 });
  k.setFont(c, 400, f.size, k.F_ANTON); c.fillText(lab, 0, k.capH(c) / 2);
  c.textAlign = "left"; c.restore();
}
function footer(c, k, d) {
  const lw = k.logo(c, d.logo, 60, 1210, 100, INK);
  const x = 60 + lw + 20;
  k.setFont(c, 800, 52, k.F_BALOO); c.fillStyle = INK; c.fillText("GameTab", x, 1252);
  const f = k.fit(c, d.date, { w: 700, fam: k.F_BALOO, max: 26, min: 18, maxW: 1020 - x });
  k.setFont(c, 700, f.size, k.F_BALOO); c.globalAlpha = 0.9; c.fillText(f.lines[0], x, 1293); c.globalAlpha = 1;
}

function page1(d, k, rows) {
  const { cv, c } = k.tplCanvas();
  bg(c, k);
  hero(c, k, d);
  /* Sieger */
  const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
  const name = d.up(win.map((r) => r.name).join(" & "));
  const val = win[0].value;
  const hv = k.fit(c, val, { w: 400, fam: k.F_ANTON, max: 150, min: 90, maxW: 380, lines: 1 });
  k.setFont(c, 400, hv.size, k.F_ANTON); const vw = c.measureText(val).width;
  const fo = { w: 400, fam: k.F_ANTON, maxW: 960 - vw - 40 };
  let nf = k.fit(c, name, Object.assign({}, fo, { max: 150, min: 96, lines: 1 }));
  if (nf.cut) nf = k.fit(c, name, Object.assign({}, fo, { max: 90, min: 52, lines: 2 }));
  if (nf.cut) nf = k.fit(c, name, Object.assign({}, fo, { max: 56, min: 38, lines: 3 }));
  k.setFont(c, 400, nf.size, k.F_ANTON); const cap = k.capH(c);
  const asc = nf.lines.map((l) => Math.max(cap, c.measureText(l).actualBoundingBoxAscent || cap));
  const dsc = nf.lines.map((l) => Math.max(0, c.measureText(l).actualBoundingBoxDescent || 0));
  const heroBase = nf.lines.length === 1 ? 497 : 515;
  const bl = new Array(nf.lines.length); bl[nf.lines.length - 1] = heroBase;
  for (let i = nf.lines.length - 2; i >= 0; i--) bl[i] = bl[i + 1] - (asc[i + 1] + dsc[i] + nf.size * 0.1);
  c.fillStyle = INK; nf.lines.forEach((ln, i) => c.fillText(ln, 60, bl[i]));
  k.setFont(c, 400, hv.size, k.F_ANTON); c.fillStyle = RED; c.textAlign = "right"; c.fillText(val, 1020, heroBase); c.textAlign = "left";
  if (d.tie) { const tl = d.up(d.tr("ecTied", "")); k.setFont(c, 700, 28, k.F_INTER); c.fillStyle = INK; k.spaced(c, tl, 62, bl[0] - asc[0] - 16, 3, "left"); }
  /* Balken */
  const N = rows.length, p = N <= 3 ? 90 : N <= 5 ? 72 : N === 6 ? 62 : N === 7 ? 54 : 48, rowH = Math.round(p * 0.82);
  const endY = 1160, rowsTop = endY - (N - 1) * p - rowH;
  const target = d.target;
  /* Dekoration (Wuerfel und Karten) im Platz zwischen Sieger und Balken, bei vielen Spielern kleiner */
  const zoneTop = heroBase + 30, zoneBottom = rowsTop - 62;
  const sc = Math.max(0.38, Math.min(1, (zoneBottom - zoneTop) / 330));
  c.save(); c.translate(60, 540); c.scale(sc, sc); c.translate(-60, -540 + (zoneTop - 540) / sc);
  DICE.forEach(([x, y, r, n]) => die(c, k, x, y, r, n, 140));
  BONUS.forEach((_, i) => bonus(c, k, d, i, 0, 0));
  c.restore();
  /* Namen- und Wertespalte nach Inhalt */
  k.setFont(c, 400, rowH * 0.74, k.F_ANTON);
  const vwMax = Math.max(...rows.map((r) => c.measureText(r.value).width));
  const nameW = Math.min(340, Math.max(200, Math.max(...rows.map((r) => c.measureText(r.name).width)) + 6));
  const valW = Math.max(130, vwMax + 4);
  const tx = 60 + nameW + 20, tw = 1020 - valW - 20 - tx;
  /* Skala */
  const sl = [0, target / 3, target * 2 / 3, target].map((v) => Math.round(v));
  const nice = target % 3 === 0;
  const marks = nice ? sl : [0, Math.round(target / 2), target];
  k.setFont(c, 700, 24, k.F_INTER); c.fillStyle = INK;
  marks.forEach((m, i) => { const t = d.num(m); c.textAlign = i === 0 ? "left" : i === marks.length - 1 ? "right" : "center"; c.fillText(t, i === 0 ? tx : i === marks.length - 1 ? tx + tw : tx + tw * i / (marks.length - 1), rowsTop - 18); });
  c.textAlign = "left";
  rows.forEach((r, i) => {
    const y = rowsTop + i * p, hot = r.winner, col = hot ? BARRED : INK;
    const fs = rowH * 0.74;
    const two = rowH >= 44;
    let f = k.fit(c, r.name, { w: 400, fam: k.F_ANTON, max: fs, min: Math.max(18, fs * 0.5), maxW: nameW, lines: 1 });
    if (f.cut && two) f = k.fit(c, r.name, { w: 400, fam: k.F_ANTON, max: Math.min(fs, rowH * 0.42), min: 20, maxW: nameW, lines: 2 });
    k.setFont(c, 400, f.size, k.F_ANTON); c.fillStyle = INK;
    const lh = f.size * 1.05, cy = y + rowH / 2, n0 = f.lines.length;
    f.lines.forEach((ln, li) => c.fillText(ln, 60, cy - (n0 - 1) * lh / 2 + li * lh + k.capH(c) / 2));
    const bh = Math.round(rowH * 0.6), by = y + (rowH - bh) / 2, bw = 6 * Math.max(0.6, bh / 44);
    c.save(); k.rrect(c, tx, by, tw, bh, bh / 2 + 2); c.clip();
    c.fillStyle = "#FFFFFF"; c.fillRect(tx, by, tw, bh);
    const pct = r.score != null && target > 0 ? Math.max(0, Math.min(1, r.score / target)) : 0;
    c.fillStyle = col; c.fillRect(tx, by, tw * pct, bh);
    c.restore();
    c.strokeStyle = INK; c.lineWidth = bw; k.rrect(c, tx + bw / 2, by + bw / 2, tw - bw, bh - bw, bh / 2); c.stroke();
    k.setFont(c, 400, fs * 1.0, k.F_ANTON); c.fillStyle = col; c.textAlign = "right"; c.fillText(r.value, 1020, y + rowH / 2 + k.capH(c) / 2); c.textAlign = "left";
  });
  footer(c, k, d);
  return cv;
}

export default {
  games: ["tutto"],
  fonts: ["900 100px \"GTR InterBI\"", "400 100px \"GTR Anton\"", "800 52px \"Baloo 2\"", "700 26px \"Baloo 2\"", "700 24px Inter", "700 28px Inter"],
  /* Ziel aus shareExtra, sonst hoechste Summe (nur fuer die Balkenlaenge) */
  accepts: (d) => { const t = Number(d.extra && d.extra.target); d.target = isFinite(t) && t > 0 ? t : Math.max(1, ...d.rows.map((r) => r.score || 0)); return true; },
  texts: (d) => [d.up(d.gameLabel), d.up(d.tr("ecTied", "")), "×0123456789", d.winners.map((r) => r.name).join(" ")],
  render(d, k) {
    if (!d.target) { const t = Number(d.extra && d.extra.target); d.target = isFinite(t) && t > 0 ? t : Math.max(1, ...d.rows.map((r) => r.score || 0)); }
    const parts = k.chunks(d.rows, FIRST_CAP, 12);
    const out = [page1(d, k, parts[0])];
    const sty = { bg: (c) => bg(c, k), ink: INK, sub: "rgba(20,16,28,0.7)", acc: RED, line: "rgba(20,16,28,0.25)", fam: k.F_ANTON, logo: INK };
    parts.slice(1).forEach((p, i) => out.push(k.listPage(d, p, i + 2, parts.length, sty)));
    return out;
  },
};
