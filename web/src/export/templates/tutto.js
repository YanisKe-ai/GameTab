// Ergebnisbild Tutto (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/tutto.png).
// Daten: gtEcModel (Raenge, Gleichstand, Summen) plus shareExtra {target}. Balken = Summe / Ziel (bei mehr als dem Ziel gekappt, nie negativ).
// Oben Kartenfaecher als reine Deko (kleiner bei vielen Personen), darunter die Liste; Sieger nur in der Liste (roter Balken).
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

/* Deko: gefaecherte Tutto-Karten, eigenes Canvas-Zeichnen (Bonus 500, Bonus 300, x2, Plus/Minus), ohne Spieldaten */
const CARDS = [
  { v: "500", face: "#C8102E", ink: "#FFFFFF", top: "BONUS" },
  { v: "300", face: "#F08A1C", ink: "#14101C", top: "BONUS" },
  { v: "×2", face: "#1E6FB8", ink: "#FFFFFF", top: "" },
  { v: "±", face: "#2E8B57", ink: "#FFFFFF", top: "" },
];
function card(c, k, cd, w, h) {
  const r = w * 0.09;
  c.save(); c.shadowColor = "rgba(20,16,28,0.38)"; c.shadowBlur = w * 0.14; c.shadowOffsetY = w * 0.05; c.shadowOffsetX = w * 0.015;
  c.fillStyle = "#FFFDF6"; k.rrect(c, -w / 2, -h / 2, w, h, r); c.fill(); c.restore();
  c.strokeStyle = "rgba(20,16,28,0.25)"; c.lineWidth = 2; k.rrect(c, -w / 2, -h / 2, w, h, r); c.stroke();
  const m = w * 0.07, iw = w - 2 * m, ih = h - 2 * m;
  c.fillStyle = cd.face; k.rrect(c, -iw / 2, -ih / 2, iw, ih, r * 0.6); c.fill();
  c.strokeStyle = "rgba(255,255,255,0.55)"; c.lineWidth = Math.max(2, w * 0.012); k.rrect(c, -iw / 2 + w * 0.035, -ih / 2 + w * 0.035, iw - w * 0.07, ih - w * 0.07, r * 0.4); c.stroke();
  c.fillStyle = cd.ink; c.textAlign = "center";
  const mid = cd.v.length > 2 ? w * 0.4 : w * 0.56;
  k.setFont(c, 400, mid, k.F_ANTON); c.fillText(cd.v, 0, k.capH(c) / 2 + (cd.top ? h * 0.03 : 0));
  if (cd.top) { k.setFont(c, 700, w * 0.085, k.F_INTER); c.fillText(cd.top, 0, -h * 0.2); }
  const cs = w * 0.17, cx = -iw / 2 + w * 0.13, cy = -ih / 2 + w * 0.17;
  k.setFont(c, 400, cs, k.F_ANTON);
  const q = cd.v === "500" || cd.v === "300" ? cd.v : cd.v;
  c.fillText(q, cx + (q.length > 2 ? w * 0.04 : 0), cy + k.capH(c) / 2);
  c.save(); c.rotate(Math.PI); c.fillText(q, cx + (q.length > 2 ? w * 0.04 : 0), cy + k.capH(c) / 2); c.restore();
  c.textAlign = "left";
}
function fan(c, k, cx, cy, avail) {
  const h = Math.min(avail * 0.86, 440), w = h * 0.7, n = CARDS.length, ang = [-21, -7, 7, 21];
  c.save(); c.translate(cx, cy + h * 0.06);
  CARDS.forEach((cd, i) => {
    c.save();
    c.translate((i - (n - 1) / 2) * w * 0.62, Math.abs(i - (n - 1) / 2) * h * 0.035);
    c.rotate(ang[i] * Math.PI / 180);
    card(c, k, cd, w, h);
    c.restore();
  });
  c.restore();
}

function page1(d, k, rows) {
  const { cv, c } = k.tplCanvas();
  bg(c, k);
  hero(c, k, d);
  /* Layout: Deko (Kartenfaecher) oben, Liste darunter. Viele Personen: Deko schrumpft, Liste geht vor. */
  const N = rows.length, endY = 1160, topY = 356;
  const pMax = N <= 3 ? 150 : N <= 5 ? 124 : 112, pMin = 70, SCALE = 64, GAP = 22, MINDECO = 190;
  let p = pMax, decoH = 0;
  for (; p >= pMin; p -= 2) {
    const rh = Math.round(p * 0.82), listH = (N - 1) * p + rh;
    const free = endY - topY - SCALE - listH - GAP;
    if (free >= MINDECO) { decoH = Math.min(470, free); break; }
  }
  if (!decoH) p = Math.min(pMax, (endY - topY - SCALE) / (N - 0.18));
  const rowH = Math.round(p * 0.82), blockH = (N - 1) * p + rowH;
  const target = d.target;
  const listTop = decoH ? endY - blockH : Math.round(topY + SCALE + Math.max(0, (endY - topY - SCALE - blockH) / 2));
  const rowsTop = listTop;
  if (decoH) fan(c, k, 540, topY + (rowsTop - SCALE - topY) / 2 + 6, rowsTop - SCALE - topY - GAP / 2);
  /* Namen- und Wertespalte nach Inhalt */
  k.setFont(c, 400, rowH * 0.74, k.F_ANTON);
  const vwMax = Math.max(...rows.map((r) => c.measureText(r.value).width));
  const nameW = Math.min(360, Math.max(200, Math.max(...rows.map((r) => c.measureText(r.name).width)) + 6));
  const valW = Math.max(130, vwMax + 4);
  const tx = 60 + nameW + 20, tw = 1020 - valW - 20 - tx;
  /* Skala: nur 0 und Ziel, ueberlappt nie */
  k.setFont(c, 700, 24, k.F_INTER); c.fillStyle = INK;
  c.textAlign = "left"; c.fillText(d.num(0), tx, rowsTop - 18);
  c.textAlign = "right"; c.fillText(d.num(target), tx + tw, rowsTop - 18);
  c.textAlign = "left";
  /* Gleichstand: in der Liste erkennbar (alle Sieger rot, Hinweis ueber den Namen) */
  if (d.tie) { const tl = d.up(d.tr("ecTied", "")); const tf = k.fit(c, tl, { w: 700, fam: k.F_INTER, max: 22, min: 13, maxW: nameW - 4 }); k.setFont(c, 700, tf.size, k.F_INTER); c.fillStyle = BARRED; c.fillText(tf.lines[0], 60, rowsTop - 18); }
  rows.forEach((r, i) => {
    const y = rowsTop + i * p, hot = r.winner, col = hot ? BARRED : INK;
    const fs = rowH * 0.74;
    const two = rowH >= 44;
    /* Umbruch nur an Leerstellen und Bindestrichen, nie mitten im Wort: lieber kleinere Schrift */
    const f = k.nameFit(c, r.name, { w: 400, fam: k.F_ANTON, max: fs, maxW: nameW, min: two ? 24 : Math.max(18, fs * 0.5), lines: two ? 2 : 1, oneMin: 0.72, max2: Math.min(fs, rowH * 0.46) });
    k.setFont(c, 400, f.size, k.F_ANTON); c.fillStyle = hot ? BARRED : INK;
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

/* ---------- Ryū-Fassung: Würfeltisch-Ticket ----------
   Roter Grund, Titel schräg als Pop-Schrift, zwei Creme-Würfel (Eins und Fünf, wie die Tutto-Karten), darunter ein schräges Creme-Ticket mit
   Klebeband. Balken Summe / Ziel (Sieger rot auf schwarzem Band). Gleiche Seitenaufteilung und gleiche Daten wie render(). */
const PIPS = { 1: [[0.5, 0.5]], 5: [[0.27, 0.27], [0.73, 0.27], [0.5, 0.5], [0.27, 0.73], [0.73, 0.73]] };
function ryuDie(c, R, cx, cy, s, deg, n) {
  c.save(); c.translate(cx, cy); c.rotate(deg * Math.PI / 180);
  c.fillStyle = R.INK; R.rr(c, -s / 2 + s * 0.09, -s / 2 + s * 0.09, s, s, s * 0.2); c.fill();
  c.fillStyle = R.CR; R.rr(c, -s / 2, -s / 2, s, s, s * 0.2); c.fill();
  c.lineWidth = Math.max(4, s * 0.05); c.strokeStyle = R.INK; R.rr(c, -s / 2, -s / 2, s, s, s * 0.2); c.stroke();
  PIPS[n].forEach(([px, py]) => { c.fillStyle = n === 1 ? R.RED : R.INK; c.beginPath(); c.arc(-s / 2 + px * s, -s / 2 + py * s, s * (n === 1 ? 0.15 : 0.085), 0, Math.PI * 2); c.fill(); if (n === 1) { c.lineWidth = 4; c.strokeStyle = R.INK; c.stroke(); } });
  c.restore();
}
function ryuPage1(d, k, R, rows) {
  const { cv, c } = k.tplCanvas(); R.bg(c, R.RED, 2701);
  R.dots(c, 600, 0, 480, 400, 26, 4.2, "rgba(26,23,22,0.18)");
  c.save(); c.translate(64, 215); c.rotate(-5 * Math.PI / 180);
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: R.F_BAGEL, max: 175, min: 70, maxW: 570, lines: 1 });
  R.pop(c, tf.lines[0], 0, 0, tf.size, { sh: tf.size * 0.08 }); c.restore();
  ryuDie(c, R, 790, 150, 140, -14, 1); ryuDie(c, R, 935, 245, 130, 13, 5);
  const N = rows.length, tx = 60, tw = 960, pad = 36, head = 58, areaTop = 340, areaBot = 1176;
  const pMax = N <= 2 ? 290 : N <= 3 ? 240 : N <= 5 ? 170 : 130;
  const p = Math.min(pMax, (areaBot - areaTop - head - pad * 2 - 10) / N);
  const th = head + pad * 2 + N * p, ty = areaTop + Math.max(0, (areaBot - areaTop - th) * 0.35);
  R.sticker(c, tx, ty, tw, th, { r: 30, rot: -1.2, sh: 14, lw: 6 });
  R.rot(c, tx, ty, tw, th, -1.2, () => {
    const rh = p * 0.84, rankW = 64, x0 = pad + rankW, x1 = tw - pad;
    k.setFont(c, 700, 26, R.F_TXT); c.fillStyle = R.INK; c.textAlign = "left"; c.fillText(d.num(0), x0, pad + 30); c.textAlign = "right"; c.fillText(d.num(d.target), x1, pad + 30); c.textAlign = "left";
    if (d.tie) R.stamp(c, k, d.up(d.tr("ecTied", "")), tw / 2, pad + 18, 28, -2, R.RED2, 560);
    rows.forEach((r, i) => {
      const y = pad + head + i * p, hot = r.winner, ink = hot ? R.CR : R.INK;
      if (hot) { c.fillStyle = R.INK; R.rr(c, pad - 14, y - 4, tw - pad * 2 + 28, rh + 8, 22); c.fill(); }
      const bh = Math.max(18, Math.round(rh * 0.26)), nh = rh - bh - 8, fs = Math.min(64, nh * 0.8 + (nh > 90 ? 10 : 0));
      k.setFont(c, 400, fs, R.F_BAGEL); const vw = c.measureText(r.value).width + 20, cyN = y + nh / 2;
      k.setFont(c, 400, fs * 0.95, R.F_BAGEL); c.fillStyle = hot ? R.RED : R.INK; c.textAlign = "center"; c.fillText(String(r.rank), pad + rankW / 2 - 6, cyN + fs * 0.33); c.textAlign = "left";
      const two = nh >= 56, nf = k.nameFit(c, r.name, { w: 400, fam: R.F_BAGEL, max: fs, maxW: x1 - x0 - vw, lines: two ? 2 : 1, max2: Math.min(fs, nh / 2.15) });
      k.setFont(c, 400, nf.size, R.F_BAGEL); c.fillStyle = ink; const lh = nf.size * 1.05;
      nf.lines.forEach((ln, j) => c.fillText(ln, x0, cyN + nf.size * 0.34 - ((nf.lines.length - 1) * lh) / 2 + j * lh));
      k.setFont(c, 400, fs, R.F_BAGEL); c.fillStyle = ink; c.textAlign = "right"; c.fillText(r.value, x1, cyN + fs * 0.34); c.textAlign = "left";
      const by = y + rh - bh, bx = x0, bw = x1 - x0, pct = r.score != null && d.target > 0 ? Math.max(0, Math.min(1, r.score / d.target)) : 0, lw = 4;
      c.save(); R.rr(c, bx, by, bw, bh, bh / 2); c.clip(); c.fillStyle = hot ? R.CR : R.CR2; c.fillRect(bx, by, bw, bh); c.fillStyle = hot ? R.RED : R.INK; c.fillRect(bx, by, bw * pct, bh); c.restore();
      c.lineWidth = lw; c.strokeStyle = hot ? R.CR : R.INK; R.rr(c, bx + lw / 2, by + lw / 2, bw - lw, bh - lw, bh / 2); c.stroke();
    });
  });
  R.footer(c, k, d);
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
  renderRyu(d, k, R) {
    if (!d.target) { const t = Number(d.extra && d.extra.target); d.target = isFinite(t) && t > 0 ? t : Math.max(1, ...d.rows.map((r) => r.score || 0)); }
    const parts = k.chunks(d.rows, k.ONE_PAGE, 12);
    const out = [ryuPage1(d, k, R, parts[0])];
    parts.slice(1).forEach((p, i) => out.push(R.contPage(d, k, p, i + 2, parts.length)));
    return out;
  },
};
