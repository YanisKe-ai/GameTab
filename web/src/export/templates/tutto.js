// Ergebnisbild Tutto (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/tutto.png).
// Daten: gtEcModel (Raenge, Gleichstand, Summen) plus shareExtra {target}. Balken = Summe / Ziel (bei mehr als dem Ziel gekappt, nie negativ).
// Keine Deko: nur echte Daten, die Balken nutzen den Platz zwischen Sieger und Fussleiste.
import { F_INTERBI } from "./fonts-a.js";

const INK = "#14101C", RED = "#D7141F", BARRED = "#C8102E", YEL = "#F7C32E";
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
  const N = rows.length, dense = N >= 8, hmax = dense ? 118 : 150;
  const hv = k.fit(c, val, { w: 400, fam: k.F_ANTON, max: hmax, min: 90, maxW: 380, lines: 1 });
  k.setFont(c, 400, hv.size, k.F_ANTON); const vw = c.measureText(val).width;
  const fo = { w: 400, fam: k.F_ANTON, maxW: 960 - vw - 50 };
  const nf = k.heroFit(c, name, fo, [{ max: hmax, min: dense ? 80 : 96, lines: 1 }, { max: dense ? 80 : 90, min: 52, lines: 2 }, { max: 56, min: 30, lines: 3 }]);
  k.setFont(c, 400, nf.size, k.F_ANTON); const cap = k.capH(c);
  const asc = nf.lines.map((l) => Math.max(cap, c.measureText(l).actualBoundingBoxAscent || cap));
  const dsc = nf.lines.map((l) => Math.max(0, c.measureText(l).actualBoundingBoxDescent || 0));
  const gapL = (i) => asc[i + 1] + dsc[i] + nf.size * 0.1;
  let heroH = asc[0]; for (let i = 0; i < nf.lines.length - 1; i++) heroH += gapL(i);
  /* Sieger direkt unter dem Titelschild, bei vielen Spielern naeher am Titel (mehr Platz fuer die Balken) */
  const base0 = dense ? (nf.lines.length === 1 ? 450 : 470) : (nf.lines.length === 1 ? 497 : 515);
  const heroBase = Math.max(base0, 340 + (d.tie ? 48 : 0) + heroH);
  const bl = new Array(nf.lines.length); bl[nf.lines.length - 1] = heroBase;
  for (let i = nf.lines.length - 2; i >= 0; i--) bl[i] = bl[i + 1] - gapL(i);
  c.fillStyle = INK; k.setFont(c, 400, nf.size, k.F_ANTON); nf.lines.forEach((ln, i) => c.fillText(ln, 60, bl[i]));
  k.setFont(c, 400, hv.size, k.F_ANTON); c.fillStyle = RED; c.textAlign = "right"; c.fillText(val, 1020, heroBase); c.textAlign = "left";
  if (d.tie) { const tl = d.up(d.tr("ecTied", "")); k.setFont(c, 700, 28, k.F_INTER); c.fillStyle = INK; k.spaced(c, tl, 62, bl[0] - asc[0] - 16, 3, "left"); }
  /* Balken */
  const endY = 1160;
  /* Skala-Beschriftung braucht ca. 60 px ueber dem ersten Balken, der Block wird im freien Platz zentriert */
  const zoneTop = heroBase + 96;
  const p = Math.min(N <= 3 ? 170 : N <= 5 ? 130 : 118, (endY - zoneTop) / (N - 0.18));
  const rowH = Math.round(p * 0.82);
  const blockH = (N - 1) * p + rowH;
  const rowsTop = Math.round(zoneTop + Math.max(0, (endY - zoneTop - blockH) / 2));
  const target = d.target;
  /* Namen- und Wertespalte nach Inhalt */
  k.setFont(c, 400, rowH * 0.74, k.F_ANTON);
  const vwMax = Math.max(...rows.map((r) => c.measureText(r.value).width));
  const nameW = Math.min(360, Math.max(200, Math.max(...rows.map((r) => c.measureText(r.name).width)) + 6));
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
    /* Umbruch nur an Leerstellen und Bindestrichen, nie mitten im Wort: lieber kleinere Schrift */
    const f = k.nameFit(c, r.name, { w: 400, fam: k.F_ANTON, max: fs, maxW: nameW, min: two ? 24 : Math.max(18, fs * 0.5), lines: two ? 2 : 1, oneMin: 0.72, max2: Math.min(fs, rowH * 0.46) });
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
    const parts = k.chunks(d.rows, k.ONE_PAGE, 12);
    const out = [page1(d, k, parts[0])];
    const sty = { bg: (c) => bg(c, k), ink: INK, sub: "rgba(20,16,28,0.7)", acc: RED, line: "rgba(20,16,28,0.25)", fam: k.F_ANTON, logo: INK, titleFam: F_INTERBI, titleW: 900, titleCase: true, subFam: k.F_INTER,
      rowFill: "#FFFFFF", rowEdge: INK };
    parts.slice(1).forEach((p, i) => out.push(k.continuationPage(d, p, i + 2, parts.length, sty)));
    return out;
  },
};
