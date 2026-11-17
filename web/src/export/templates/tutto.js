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
function tSpiky(c, cx, cy, rx, ry, n, inn, seed) {
  let sd = seed || 11; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, f = i % 2 ? inn : 0.9 + rnd() * 0.1;
    const px = cx + Math.cos(a) * rx * f, py = cy + Math.sin(a) * ry * f; if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.closePath();
}
/* Zerdrueckter Wuerfel mit Rissen, Mittelpunkt (0,0) lokal */
function crushedDie(c, R, s) {
  c.save(); c.scale(1.1, 0.8);
  c.fillStyle = R.RED; R.rr(c, -s / 2 + s * 0.08, -s / 2 + s * 0.08, s, s, s * 0.2); c.fill();
  c.fillStyle = R.CR; R.rr(c, -s / 2, -s / 2, s, s, s * 0.2); c.fill();
  c.restore();
  c.save(); c.scale(1.1, 0.8);
  c.lineWidth = s * 0.03; c.strokeStyle = R.INK; R.rr(c, -s / 2, -s / 2, s, s, s * 0.2); c.stroke(); c.restore();
  c.fillStyle = R.INK; PIPS[5].forEach(([px, py]) => { c.beginPath(); c.ellipse((px - 0.5) * s * 1.1, (py - 0.5) * s * 0.8, s * 0.075 * 1.1, s * 0.075 * 0.8, 0, 0, 6.2832); c.fill(); });
  /* Risse */
  c.strokeStyle = R.INK; c.lineWidth = Math.max(4, s * 0.025); c.lineJoin = "miter"; c.lineCap = "round";
  const cr = [[[0.02, -0.02], [0.12, -0.1], [0.08, -0.2], [0.2, -0.3], [0.17, -0.42]], [[0.02, -0.02], [-0.1, 0.06], [-0.08, 0.16], [-0.22, 0.24], [-0.3, 0.4]], [[0.02, -0.02], [0.14, 0.04], [0.22, 0.02], [0.3, 0.12], [0.42, 0.1]], [[0.02, -0.02], [-0.08, -0.1], [-0.2, -0.08], [-0.3, -0.18], [-0.44, -0.16]]];
  cr.forEach((pts) => { c.beginPath(); pts.forEach(([x, y], i) => { const px = x * s * 1.1, py = y * s * 0.8 * 1.25; if (i) c.lineTo(px, py); else c.moveTo(px, py); }); c.stroke(); });
  c.lineJoin = "round"; c.lineCap = "butt";
}
function ticketPath(c, w, h, amp, step) {
  c.beginPath(); c.moveTo(0, 0);
  for (let x = step, i = 1; x <= w + 0.5; x += step, i++) c.lineTo(Math.min(x, w), i % 2 ? amp : 0);
  c.lineTo(w, h);
  for (let x = w - step, i = 1; x >= -0.5; x -= step, i++) c.lineTo(Math.max(x, 0), h - (i % 2 ? amp : 0));
  c.closePath();
}
function ryuPage1(d, k, R, rows) {
  const { cv, c } = k.tplCanvas(); R.bg(c, R.RED, 2701);
  const win = rows.filter((r) => r.winner), rest = rows.filter((r) => !r.winner);
  const winners = win.length ? win : rows.slice(0, 1), losers = win.length ? rest : rows.slice(1);
  const L = losers.length, dense = L > 6;
  R.dots(c, 0, 0, 1080, 500, 26, 4.2, "rgba(26,23,22,0.18)");
  /* Titel-Explosion */
  const tRy = dense ? 112 : L === 0 ? 190 : 170, tcy = 34 + tRy;
  c.fillStyle = R.INK; tSpiky(c, 552, tcy + 12, 540, tRy, 19, 0.78, 3); c.fill();
  c.fillStyle = R.CR; tSpiky(c, 540, tcy, 540, tRy, 19, 0.78, 3); c.fill();
  c.lineWidth = 6; c.lineJoin = "miter"; c.strokeStyle = R.INK; tSpiky(c, 540, tcy, 540, tRy, 19, 0.78, 3); c.stroke(); c.lineJoin = "round";
  c.save(); c.translate(540, tcy); c.rotate(-3 * Math.PI / 180);
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: R.F_BAGEL, max: dense ? 140 : 210, min: 70, maxW: 760, lines: 1 });
  R.pop(c, tf.lines[0], 0, tf.size * 0.34, tf.size, { align: "center", fill: R.RED, stroke: R.INK, shadow: R.INK, sw: tf.size * 0.05, sh: tf.size * 0.06 });
  c.restore();
  /* Siegerpanel */
  const names = winners.map((w) => d.up(w.name)).join(" · ");
  const big = L === 0;
  const nf = k.heroFit(c, names, { w: 400, fam: R.F_BAGEL, maxW: 610 }, [{ max: big ? 150 : dense ? 84 : 120, min: 60, lines: 1 }, { max: big ? 110 : dense ? 66 : 90, min: 44, lines: 2 }, { max: 66, min: 36, lines: 3 }, { max: 46, min: 24, lines: 4 }]);
  const lh = nf.size * 1.04, nameH = nf.lines.length * lh, ss = big ? 112 : dense ? 66 : 92;
  const val = String(winners[0].value), stampH = ss + 40, y0 = 28;
  const stampTop = y0 + nameH + 14, labBase = stampTop + stampH + 46, barTop = labBase + 10, H = barTop + 26 + 26;
  const pTop0 = tcy + tRy + 34;
  const head = 100, pad = 40, pitchMax = L <= 3 ? 130 : 100, thWant = head + L * pitchMax + 36;
  const tTop = L ? Math.max(pTop0 + H + 40, 1170 - thWant) : 1170, th = 1170 - tTop;
  const pTop = L === 0 ? pTop0 + Math.max(0, (1176 - pTop0 - H) * 0.4) : pTop0 + Math.max(0, (tTop - 40 - pTop0 - H) * 0.5);
  const px = 40, pw = 1000;
  R.sticker(c, px, pTop, pw, H, { r: 28, fill: R.INK, stroke: R.CR, rot: -1.5, sh: 12, lw: 6 });
  R.rot(c, px, pTop, pw, H, -1.5, () => {
    const ds = Math.min(L === 0 ? 300 : 240, H - 44);
    c.save(); c.translate(48 + ds * 0.6, H / 2 + 6); c.rotate(-9 * Math.PI / 180); crushedDie(c, R, ds); c.restore();
    const nx = 52 + ds * 1.2 + 24, nw = pw - nx - 36;
    nf.lines.forEach((ln, j) => R.pop(c, ln, nx, y0 + nf.size * 0.82 + j * lh, nf.size, { fill: R.CR, shadow: R.RED, stroke: R.INK, sw: nf.size * 0.01, sh: nf.size * 0.05 }));
    /* Stempel mit Punkten */
    const vf = k.fit(c, val, { w: 400, fam: R.F_BAGEL, max: ss, min: 30, maxW: nw - 80, lines: 1 });
    k.setFont(c, 400, vf.size, R.F_BAGEL); const vw = c.measureText(vf.lines[0]).width, sw = vw + 76, sh = vf.size + 40;
    const sx = Math.max(52 + ds * 0.75, nx - 20);
    R.sticker(c, sx, stampTop, sw, sh, { r: 16, fill: R.RED, stroke: R.CR, rot: -7, sh: 9, lw: 5 });
    R.rot(c, sx, stampTop, sw, sh, -7, () => { k.setFont(c, 400, vf.size, R.F_BAGEL); c.fillStyle = R.CR; c.textAlign = "center"; c.fillText(vf.lines[0], sw / 2, sh / 2 + vf.size * 0.36); c.textAlign = "left"; });
    /* Balken Summe / Ziel */
    const bw = nw, bh = 26, pct = winners[0].score != null && d.target > 0 ? Math.max(0, Math.min(1, winners[0].score / d.target)) : 0;
    k.setFont(c, 700, 28, R.F_TXT); c.fillStyle = R.CR; c.textAlign = "left"; c.fillText(d.num(0), nx, labBase); c.textAlign = "right"; c.fillText(d.num(d.target), nx + bw, labBase); c.textAlign = "left";
    c.save(); R.rr(c, nx, barTop, bw, bh, bh / 2); c.clip(); c.fillStyle = R.CR3; c.fillRect(nx, barTop, bw, bh); c.fillStyle = R.RED; c.fillRect(nx, barTop, bw * pct, bh); c.restore();
    c.lineWidth = 4; c.strokeStyle = R.CR; R.rr(c, nx + 2, barTop + 2, bw - 4, bh - 4, bh / 2); c.stroke();
    if (d.tie) {
      const tt = d.up(d.tr("ecTied", "")); const tfz = k.fit(c, tt, { w: 400, fam: R.F_BAGEL, max: 30, min: 18, maxW: 360, lines: 1 });
      k.setFont(c, 400, tfz.size, R.F_BAGEL); const w2 = c.measureText(tfz.lines[0]).width + 36, h2 = tfz.size + 20;
      R.sticker(c, pw - w2 - 30, -h2 / 2, w2, h2, { r: h2 / 2, fill: R.RED, stroke: R.CR, rot: 3, sh: 5, lw: 4 });
      R.rot(c, pw - w2 - 30, -h2 / 2, w2, h2, 3, () => { k.setFont(c, 400, tfz.size, R.F_BAGEL); c.fillStyle = R.CR; c.fillText(tfz.lines[0], 18, h2 / 2 + tfz.size * 0.36); });
    }
  });
  /* Verlierer-Kassenzettel */
  if (L) {
    const pitch = Math.min(pitchMax, (th - head - 30) / L), tw = 900, tx = 90;
    c.save(); c.translate(tx, tTop); c.rotate(1.6 * Math.PI / 180);
    c.fillStyle = R.INK; c.save(); c.translate(12, 12); ticketPath(c, tw, th, 10, 30); c.fill(); c.restore();
    c.fillStyle = R.CR; ticketPath(c, tw, th, 10, 30); c.fill();
    c.strokeStyle = R.CR3; c.lineWidth = 3; [[0.18, 0, 0.3, 1], [0.62, 0, 0.5, 1], [0, 0.45, 1, 0.55]].forEach(([a, b, e, f]) => { c.beginPath(); c.moveTo(a * tw, b * th); c.lineTo((a + e) / 2 * tw + 20, (b + f) / 2 * th - 14); c.lineTo(e * tw, f * th); c.stroke(); });
    c.lineWidth = 5; c.lineJoin = "miter"; c.strokeStyle = R.INK; ticketPath(c, tw, th, 10, 30); c.stroke(); c.lineJoin = "round";
    const bx = 460, bw = 180, bhh = Math.max(12, Math.min(22, pitch * 0.28)), vx = tw - pad;
    k.setFont(c, 700, 24, R.F_TXT); c.fillStyle = R.INK; c.textAlign = "left"; c.fillText(d.num(0), bx, head - 14); c.textAlign = "right"; c.fillText(d.num(d.target), bx + bw, head - 14); c.textAlign = "left";
    losers.forEach((r, i) => {
      const y = head + i * pitch, rh = pitch * 0.86, cyr = y + rh / 2, fs = Math.min(60, rh * 0.6);
      c.fillStyle = R.INK; c.fillRect(pad, y - 4, tw - pad * 2, 3);
      k.setFont(c, 400, fs, R.F_BAGEL); c.textAlign = "center"; c.fillStyle = R.RED2; c.fillText(String(r.rank), pad + 24, cyr + fs * 0.34); c.textAlign = "left";
      const vf = k.fit(c, String(r.value), { w: 400, fam: R.F_BAGEL, max: fs, min: 20, maxW: 170, lines: 1 });
      k.setFont(c, 400, vf.size, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = "right"; c.fillText(vf.lines[0], vx, cyr + vf.size * 0.34); c.textAlign = "left";
      const nf2 = k.nameFit(c, d.up(r.name), { w: 400, fam: R.F_BAGEL, max: fs, maxW: bx - pad - 64 - 24, lines: rh >= 50 ? 2 : 1, max2: Math.min(fs, rh / 2.1) });
      k.setFont(c, 400, nf2.size, R.F_BAGEL); const l2 = nf2.size * 1.05;
      nf2.lines.forEach((ln, j) => c.fillText(ln, pad + 64, cyr + nf2.size * 0.34 - ((nf2.lines.length - 1) * l2) / 2 + j * l2));
      const pct = r.score != null && d.target > 0 ? Math.max(0, Math.min(1, r.score / d.target)) : 0, by = cyr - bhh / 2;
      c.save(); R.rr(c, bx, by, bw, bhh, bhh / 2); c.clip(); c.fillStyle = R.CR3; c.fillRect(bx, by, bw, bhh); c.fillStyle = R.INK; c.fillRect(bx, by, bw * pct, bhh); c.restore();
      c.lineWidth = 3; c.strokeStyle = R.INK; R.rr(c, bx + 1.5, by + 1.5, bw - 3, bhh - 3, bhh / 2); c.stroke();
    });
    /* Spruch-Stempel */
    const sp = d.tr("ryuTCash", "Kassiert.");
    const sf = k.fit(c, sp, { w: 400, fam: R.F_BAGEL, max: 54, min: 28, maxW: 330, lines: 1 });
    k.setFont(c, 400, sf.size, R.F_BAGEL); const ssw = c.measureText(sf.lines[0]).width + 52, ssh = sf.size + 30;
    R.sticker(c, 36, -14, ssw, ssh, { r: 12, fill: R.RED, stroke: R.INK, rot: -6, sh: 7, lw: 5 });
    R.rot(c, 36, -14, ssw, ssh, -6, () => { k.setFont(c, 400, sf.size, R.F_BAGEL); c.fillStyle = R.CR; c.textAlign = "center"; c.fillText(sf.lines[0], ssw / 2, ssh / 2 + sf.size * 0.36); c.textAlign = "left"; });
    c.restore();
  }
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
