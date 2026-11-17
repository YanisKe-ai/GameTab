// Ergebnisbild Schieber: Titelseite einer Wirtshaus-Zeitung (Entwurf F, dev-notes/schieber-export/neu/, von Yanis gewaehlt am 05.11.2026).
// Daten (shareExtra aus SchieberGame): teams[{name, entries}], target. Jedes Team traegt selbst ein, darum heissen die Zeilen Eintraege, nicht Runden.
// Das Schieber-TURNIER hat eigene Exporte (schieber-sheet.js) und nutzt diese Vorlage nicht.
import BAUER_URL from "../../assets/img/sch-bauer.webp";
import DAME_URL from "../../assets/img/sch-dame.webp";
import PAPIER_URL from "../../assets/img/sch-papier.webp";

const FR_STACK = '"Fraunces","Inter","GT Clean","GT CJK",serif';
const INK = "#241C14", TAU = Math.PI * 2;
/* Verbform: Teamname mit Konjunktion ("Tony und Yanis") -> Mehrzahl */
const PLURAL = /\s(und|and|et|e|y|&|\+)\s|,|\//iu;

function buildModel(d) {
  const teams = d.extra.teams.map((tm, i) => {
    const entries = tm.entries.filter((v) => typeof v === "number" && isFinite(v));
    return { name: d.clean(tm.name || "") || (d.rows[i] && d.rows[i].name) || "Team " + (i + 1), entries, total: entries.reduce((a, b) => a + b, 0) };
  });
  /* Sieger aus gtEcModel (Name + Punkte), keine eigene Berechnung */
  const byName = teams.filter((tm) => d.winners.some((r) => r.name === tm.name && r.score === tm.total));
  const wins = byName.length ? byName : teams.filter((tm) => d.winners.some((r) => r.score === tm.total));
  teams.forEach((tm) => { tm.win = wins.indexOf(tm) >= 0; tm.bestIdx = tm.entries.length ? tm.entries.indexOf(Math.max(...tm.entries)) : -1; });
  let msg;
  if (wins.length !== 1) { const f = d.tr("tplSchTie"); msg = typeof f === "function" ? f(d.num(teams[0].total)) : d.tr("ecTied", ""); }
  else { const w = wins[0]; const f = d.tr(PLURAL.test(" " + w.name + " ") ? "tplSchWinN" : "tplSchWin1"); msg = typeof f === "function" ? f(w.name, d.num(w.total)) : w.name; }
  return { teams, tgt: d.num(d.extra.target), tie: wins.length !== 1, msg, date: d.date, gameLabel: d.gameLabel, logo: d.logo, img: d.img, num: d.num, up: d.up,
    rounds: Math.max(...teams.map((t) => t.entries.length)), lblTarget: d.tr("targetLabel", "Ziel"), lblEntries: d.tr("tplNewsEntries", "Einträge"), lblEntryOne: d.tr("schieberEntryOne", "Eintrag"), lblWinner: d.up(d.tr("tplNewsWinner", "Sieger")), lblSum: d.tr("tplNewsSum", "Summe") };
}

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function put(c, k, s, x, y, w, size, fam, col, align, sp) { // y = Grundlinie
  k.setFont(c, w, size, fam); c.fillStyle = col;
  if (sp) return k.spaced(c, s, x, y, sp, align || "left");
  c.textAlign = align || "left"; c.fillText(s, x, y); c.textAlign = "left"; return c.measureText(s).width;
}
function tiers(c, k, s, w, fam, maxW, list) { let f = null; for (const t of list) { f = k.fit(c, s, { w, fam, maxW, max: t.max, min: t.min, lines: t.lines }); if (!f.cut) return f; } return f; }
function star(c, x, y, s, col) {
  const p = [[10, 1], [12, 8], [19, 10], [12, 12], [10, 19], [8, 12], [1, 10], [8, 8]];
  c.save(); c.translate(x - s / 2, y - s / 2); c.scale(s / 20, s / 20); c.beginPath(); p.forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b))); c.closePath(); c.fillStyle = col; c.fill(); c.restore();
}
const SUITS = {
  heart: ["M50 92 C8 60 0 42 0 26 C0 9 14 0 27 0 C38 0 46 6 50 15 C54 6 62 0 73 0 C86 0 100 9 100 26 C100 42 92 60 50 92Z", 100, 92],
  spade: ["M50 0 C50 0 100 38 100 62 C100 80 84 88 70 82 C68 82 66 81 65 80 C67 90 73 96 82 100 L18 100 C27 96 33 90 35 80 C34 81 32 82 30 82 C16 88 0 80 0 62 C0 38 50 0 50 0Z", 100, 100],
  diamond: ["M50 0 L92 50 L50 100 L8 50Z", 100, 100],
  club: ["M50 4a22 22 0 1 0 0.01 0Z M26 36a22 22 0 1 0 0.01 0Z M74 36a22 22 0 1 0 0.01 0Z M44 50 L36 100 L64 100 L56 50Z", 100, 100],
};
const CROP = { bauer: [300, 450, 300, 380], dame: [640, 470, 310, 360] };
function portrait(img, which, oh, ink) {
  const [cx, cy, rx, ry] = CROP[which], ow = Math.round(oh * rx / ry), s = 2;
  const o = document.createElement("canvas"); o.width = ow * s; o.height = oh * s; const g = o.getContext("2d");
  g.imageSmoothingQuality = "high"; g.drawImage(img, cx - rx, cy - ry, rx * 2, ry * 2, 0, 0, o.width, o.height);
  if (ink) {
    const id = g.getImageData(0, 0, o.width, o.height), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], gg = d[i + 1], b = d[i + 2], lum = 0.3 * r + 0.59 * gg + 0.11 * b;
      let t = Math.min(1, Math.max(0, (lum - 30) / 205)); t = Math.pow(t, 1.1); const L = t * 255;
      const ta = 1 - Math.min(1, Math.max(0, (t - 0.72) / 0.22)); const sr = L, sg = L * (1 - 0.1 * ta), sb = L * (1 - 0.28 * ta); // Sepia, helle Flaechen bleiben neutral
      const sat = Math.max(r, gg, b) - Math.min(r, gg, b); const keep = Math.min(0.62, sat / 255 * 1.0);
      d[i] = Math.min(255, sr * (1 - keep) + r * keep * 0.95); d[i + 1] = Math.min(255, sg * (1 - keep) + gg * keep * 0.8); d[i + 2] = Math.min(255, sb * (1 - keep) + b * keep * 0.72);
    }
    g.putImageData(id, 0, 0);
  }
  g.globalCompositeOperation = "destination-in"; g.save(); g.translate(o.width / 2, o.height / 2); g.scale(o.width / 2, o.height / 2);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, "#000"); gr.addColorStop(0.8, "#000"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(-1, -1, 2, 2); g.restore();
  return { cv: o, w: ow, h: oh };
}
function drawPortrait(c, p, cx, cy, mode) { c.save(); if (mode) c.globalCompositeOperation = mode; c.drawImage(p.cv, cx - p.w / 2, cy - p.h / 2, p.w, p.h); c.restore(); }
function newsPaper(c, k, m) {
  const W = k.TPL_W, H = k.TPL_H, r = rng(23);
  c.fillStyle = "#EBDFC2"; c.fillRect(0, 0, W, H);
  const pat = c.createPattern(m.img.papier, "repeat"); c.save(); c.globalAlpha = 0.75; c.fillStyle = pat; c.fillRect(0, 0, W, H); c.restore();
  c.save(); c.globalCompositeOperation = "multiply"; c.fillStyle = "rgba(226,204,152,0.45)"; c.fillRect(0, 0, W, H); c.restore();
  for (let i = 0; i < 22; i++) { const x = r() * W, y = r() * H, rad = 40 + r() * 140, g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, "rgba(140,96,40," + (0.03 + r() * 0.06) + ")"); g.addColorStop(1, "rgba(140,96,40,0)"); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  const id = c.getImageData(0, 0, W, H), d = id.data; for (let p = 0; p < d.length; p += 4) { const n = (r() - 0.5) * 14; d[p] += n; d[p + 1] += n; d[p + 2] += n; } c.putImageData(id, 0, 0);
}
function newsFinish(c, k) {
  const W = k.TPL_W, H = k.TPL_H;
  // Falz (Querbruch und Laengsbruch)
  [[0, H * 0.5, W, 3, true], [W / 2, 0, 3, H, false]].forEach(([x, y, w, h, horiz]) => {
    const g = horiz ? c.createLinearGradient(0, y - 18, 0, y + 20) : c.createLinearGradient(x - 18, 0, x + 20, 0);
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.45, "rgba(0,0,0,0.10)"); g.addColorStop(0.52, "rgba(255,255,255,0.18)"); g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g; if (horiz) c.fillRect(0, y - 18, W, 38); else c.fillRect(x - 18, 0, 38, H);
  });
  k.cssEllipse(c, 0, 0, W, H, W / 2, H / 2, [[0, "rgba(0,0,0,0)"], [0.7, "rgba(70,40,10,0.06)"], [1, "rgba(60,32,8,0.34)"]]);
}
function rule(c, x1, x2, y, th) { c.fillStyle = INK; c.fillRect(x1, y, x2 - x1, th); }
function dblRule(c, x1, x2, y) { rule(c, x1, x2, y, 5); rule(c, x1, x2, y + 9, 1.8); }
function inkText(c, k, s, x, y, w, size, fam, align, sp, col) { return put(c, k, s, x, y, w, size, fam, col || INK, align, sp); }
function boldFrau(c, k, s, x, y, size, align, col) { // Fraunces 700 mit leichter Verstaerkung
  const F = FR_STACK; k.setFont(c, 700, size, F); c.fillStyle = col || INK; c.strokeStyle = col || INK; c.lineWidth = size * 0.012; c.textAlign = align || "left"; c.strokeText(s, x, y); c.fillText(s, x, y); c.textAlign = "left";
}
function drawF(c, k, m) {
  const W = k.TPL_W, H = k.TPL_H, INT = k.F_INTER, FR = FR_STACK, X1 = 60, X2 = 1020;
  newsPaper(c, k, m);
  // Kopf
  dblRule(c, X1, X2, 52);
  const lw = k.logo(c, m.logo, X1, 78, 40, INK); inkText(c, k, "GameTab", X1 + lw + 12, 78 + 30, 800, 28, k.F_BALOO, "left");
  const df = k.fit(c, m.date, { w: 600, fam: INT, max: 24, min: 15, maxW: 1020 - X1 - lw - 190 }); inkText(c, k, df.lines[0], X2, 106, 600, df.size, INT, "right");
  rule(c, X1, X2, 128, 1.8);
  // Zeitungstitel
  const title = m.gameLabel; const tf = k.fit(c, title, { w: 700, fam: FR, max: 150, min: 80, maxW: 860 });
  k.setFont(c, 700, tf.size, FR); const cap = k.capH(c); const by = 142 + 18 + cap;
  boldFrau(c, k, tf.lines[0], W / 2, by, tf.size, "center");
  const tw2 = c.measureText(tf.lines[0]).width; star(c, W / 2 - tw2 / 2 - 44, by - cap / 2, 30, INK); star(c, W / 2 + tw2 / 2 + 44, by - cap / 2, 30, INK);
  const ry = by + 26; dblRule(c, X1, X2, ry);
  // Leiste: Ziel | Runden
  const sy = ry + 46; const left = m.lblTarget + " " + m.tgt, right = m.rounds + " " + (m.rounds === 1 ? m.lblEntryOne : m.lblEntries);
  inkText(c, k, m.up(left), X1, sy, 700, 24, INT, "left", 3); inkText(c, k, m.up(right), X2, sy, 700, 24, INT, "right", 3);
  star(c, W / 2, sy - 8, 22, INK); rule(c, X1, X2, sy + 20, 1.8);
  // Schlagzeile
  const hf = tiers(c, k, m.msg, 700, FR, 940, [{ max: 80, min: 50, lines: 1 }, { max: 60, min: 30, lines: 2 }]);
  const hy = sy + 20 + 18 + hf.size * 0.8, hlh = hf.size * 1.06;
  c.save(); c.globalAlpha = 1; hf.lines.forEach((l, i) => boldFrau(c, k, l, W / 2, hy + i * hlh, hf.size, "center")); c.restore();
  const hbot = hy + (hf.lines.length - 1) * hlh + 22; dblRule(c, X1, X2, hbot);
  // Stich-Illustration: zwei Felder, Bauer und Dame blicken sich an
  // Wenige Eintraege: freie Flaeche unten geht ans Bild (sonst bleibt das untere Drittel leer), bei 6 oder mehr Zeilen unveraendert
  const iy = hbot + 28, cw = 450, xs = [X1, X2 - cw], nRows = Math.min(m.rounds, 9) + (m.rounds > 9 ? 1 : 0);
  const ih = 332 + Math.max(0, Math.min(210, 1292 - (iy + 332 + 132 + 80 + nRows * 76)));
  const arts = ["bauer", "dame"];
  m.teams.forEach((tm, i) => {
    const x = xs[i];
    c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(x, iy, cw, ih); c.lineWidth = 1.2; c.strokeRect(x + 7, iy + 7, cw - 14, ih - 14);
    const p = portrait(m.img[arts[i]], arts[i], ih - 22, true);
    drawPortrait(c, p, x + cw / 2, iy + ih / 2, "multiply");
  });
  // Mittelsaeule zwischen den Bildern
  const mx = W / 2; c.fillStyle = INK; c.fillRect(mx - 1, iy, 2, ih); star(c, mx, iy + ih / 2, 26, INK);
  // Unterschriften mit Punktfuehrung
  const cy = iy + ih + 48;
  m.teams.forEach((tm, i) => {
    const x = xs[i], sc = m.num(tm.total); k.setFont(c, 700, 46, FR); const sw = c.measureText(sc).width + 4;
    boldFrau(c, k, sc, x + cw, cy, 46, "right");
    // Langer Name: erst eine Zeile bis 26 px, sonst zwei Zeilen (Name bleibt ganz lesbar), ohne Punktfuehrung
    const nf = tiers(c, k, tm.name, 700, FR, cw - sw - 70, [{ max: 36, min: 26, lines: 1 }, { max: 26, min: 20, lines: 2 }]);
    if (nf.lines.length > 1) { nf.lines.forEach((l, li) => boldFrau(c, k, l, x, cy - 26 + li * (nf.size * 1.08), nf.size, "left")); }
    else {
      k.setFont(c, 700, nf.size, FR); const nw = c.measureText(nf.lines[0]).width;
      boldFrau(c, k, nf.lines[0], x, cy, nf.size, "left");
      c.fillStyle = INK; for (let q = x + nw + 14; q < x + cw - sw - 12; q += 9) { c.beginPath(); c.arc(q, cy - 5, 1.7, 0, TAU); c.fill(); }
    }
    if (tm.win && !m.tie) { const t = m.lblWinner; k.setFont(c, 800, 34, INT); const w = k.spacedW(c, t, 6) + 40; c.save(); c.translate(xs[i] + 116, iy + ih - 46); c.rotate(-0.17); c.globalAlpha = 0.9; c.strokeStyle = "#B2231A"; c.lineWidth = 4; c.strokeRect(-w / 2, -28, w, 56); c.lineWidth = 1.5; c.strokeRect(-w / 2 + 5, -23, w - 10, 46); put(c, k, t, 0, 12, 800, 34, INT, "#B2231A", "center", 6); c.restore(); }
  });
  // Tabelle Runde fuer Runde
  const ty = cy + 34; dblRule(c, X1, X2, ty);
  const colw = [140, 410, 410]; const cxs = [X1, X1 + colw[0], X1 + colw[0] + colw[1]];
  const hy2 = ty + 22 + 28, maxRows = 9, shown = Math.min(m.rounds, maxRows), extra = m.rounds > maxRows ? 1 : 0;
  const rowH = Math.max(26, Math.min(76, Math.floor((1292 - (hy2 + 10) - 70) / Math.max(1, shown + extra)))), fs = Math.max(25, Math.min(40, Math.round(rowH * 0.66)));
  inkText(c, k, "#", cxs[0] + 6, hy2, 800, 19, INT, "left", 3);
  const cc = (i) => cxs[i + 1] + colw[i + 1] / 2;
  m.teams.forEach((tm, i) => { const f = k.fit(c, tm.name, { w: 700, fam: FR, max: 26, min: 18, maxW: colw[i + 1] - 40, lines: 1 }); boldFrau(c, k, f.lines[0], cc(i), hy2 + 1, f.size, "center"); });
  rule(c, X1, X2, hy2 + 12, 1.8);
  let yy = hy2 + 12; const first = m.rounds - shown;
  if (extra) { yy += rowH; inkText(c, k, "...", cxs[0] + 6, yy - 10, 700, 22, FR, "left"); }
  for (let j = first; j < m.rounds; j++) {
    yy += rowH; const bl = yy - Math.round(rowH * 0.28);
    inkText(c, k, String(j + 1), cxs[0] + 6, bl, 600, fs - 3, FR, "left");
    m.teams.forEach((tm, i) => { const v = tm.entries[j]; if (v == null) return; const best = tm.bestIdx === j; k.setFont(c, best ? 700 : 500, fs, FR); const tw3 = c.measureText(m.num(v)).width;
      if (best) { c.fillStyle = "rgba(213,43,30,0.16)"; k.rrect(c, cc(i) - tw3 / 2 - 14, yy - rowH + 3, tw3 + 28, rowH - 6, 6); c.fill(); }
      inkText(c, k, m.num(v), cc(i), bl, best ? 700 : 500, fs, FR, "center", 0, best ? "#A81D12" : INK); });
    c.fillStyle = "rgba(36,28,20,0.28)"; c.fillRect(X1, yy, X2 - X1, 1.2);
  }
  yy += 10; rule(c, X1, X2, yy, 3);
  inkText(c, k, m.up(m.lblSum), cxs[0] + 6, yy + 44, 800, 20, INT, "left", 3);
  m.teams.forEach((tm, i) => boldFrau(c, k, m.num(tm.total), cc(i), yy + 46, 42, "center", tm.win ? "#A81D12" : INK));
  // Spaltenlinien
  c.fillStyle = "rgba(36,28,20,0.4)"; [cxs[1], cxs[2]].forEach((x) => c.fillRect(x, hy2 - 24, 1.4, yy - hy2 + 24));
  newsFinish(c, k);
}

function render(d, k) {
  const { cv, c } = k.tplCanvas();
  drawF(c, k, buildModel(d));
  return [cv];
}

/* ---------- Ryū-Fassung: Box-Plakat ----------
   Roter Grund mit Speedlines, Titel, zwei Kämpfer-Sticker: Sieger gross, schwarz, mit Krone und riesiger Punktzahl, Verlierer kleiner, schräg, mit K.O.-Stern
   und Stempel (Ausgejasst.). VS-Explosion dazwischen, Schlagzeile unten. Keine Eintragstabelle. Gleichstand: beide Kämpfer gleich gross mit Krone. */
function ryuChip(c, k, R, text, x, y, w0, deg, fill) {
  const f = k.fit(c, text, { w: 400, fam: R.F_BAGEL, max: 40, min: 20, maxW: w0 - 40, lines: 1 });
  k.setFont(c, 400, f.size, R.F_BAGEL); const w = Math.min(w0, c.measureText(f.lines[0]).width + 44), h = f.size + 28, bx = x - w;
  R.sticker(c, bx, y, w, h, { r: h / 2, fill: fill || R.INK, rot: deg, sh: 6, lw: fill ? 4 : 0 });
  R.rot(c, bx, y, w, h, deg, () => { k.setFont(c, 400, f.size, R.F_BAGEL); c.fillStyle = fill ? R.INK : R.CR; c.fillText(f.lines[0], 22, h / 2 + f.size * 0.34); });
  return h;
}
function ryuCrown(c, R, cx, cy, w, deg) {
  const h = w * 0.78; c.save(); c.translate(cx, cy); c.rotate(deg * Math.PI / 180);
  const path = (o) => { c.beginPath(); c.moveTo(-w / 2 + o, h / 2 + o); c.lineTo(-w / 2 + o, -h / 4 + o); c.lineTo(-w / 4 + o, h / 10 + o); c.lineTo(o, -h / 2 + o); c.lineTo(w / 4 + o, h / 10 + o); c.lineTo(w / 2 + o, -h / 4 + o); c.lineTo(w / 2 + o, h / 2 + o); c.closePath(); };
  c.fillStyle = R.INK; path(8); c.fill(); c.fillStyle = R.CR; path(0); c.fill();
  c.lineWidth = 6; c.lineJoin = "miter"; c.strokeStyle = R.INK; path(0); c.stroke(); c.lineJoin = "round";
  c.fillStyle = R.RED; c.fillRect(-w / 2 + 3, h / 2 - h * 0.2, w - 6, h * 0.2 - 3);
  [[-w / 2, -h / 4], [0, -h / 2], [w / 2, -h / 4]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, w * 0.06, 0, 7); c.fillStyle = R.RED; c.fill(); c.lineWidth = 4; c.stroke(); });
  c.restore();
}
function ryuFighter(c, k, R, m, tm, x, y, w, h, deg, hot, o) {
  const fill = hot ? R.INK : R.CR, ink = hot ? R.CR : R.INK, pad = 34;
  R.sticker(c, x, y, w, h, { r: 30, fill, rot: deg, sh: o.sh, lw: 6, stroke: hot ? R.CR : R.INK });
  R.rot(c, x, y, w, h, deg, () => {
    const nf = k.nameFit(c, tm.name, { w: 400, fam: R.F_BAGEL, max: o.nameMax, maxW: w - pad * 2 - (o.nameRes || 0), lines: 2, max2: o.nameMax * 0.78 });
    const nlh = nf.size * 1.04, nBot = 20 + nf.size * 0.85 + (nf.lines.length - 1) * nlh + nf.size * 0.2;
    const sMax = Math.max(40, Math.min(o.totMax, (h - 22 - nBot - 6) / 0.74));
    const sf = k.fit(c, m.num(tm.total), { w: 400, fam: R.F_BAGEL, max: sMax, min: Math.min(44, sMax), maxW: w - pad * 2, lines: 1 });
    k.setFont(c, 400, nf.size, R.F_BAGEL); c.fillStyle = ink;
    nf.lines.forEach((ln, j) => c.fillText(ln, pad, 20 + nf.size * 0.85 + j * nlh));
    k.setFont(c, 400, sf.size, R.F_BAGEL); c.fillStyle = hot ? R.RED : R.INK; c.textAlign = "right"; c.fillText(m.num(tm.total), w - pad, h - 24); c.textAlign = "left";
  });
}
function ryuPage(d, k, R, m) {
  const { cv, c } = k.tplCanvas(); R.bg(c, R.RED, 6101);
  /* Speedlines aus der Mitte */
  c.save(); c.fillStyle = "rgba(26,23,22,0.16)"; const ox = 540, oy = 640, N = 30;
  for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2, da = 0.045 + (i % 3) * 0.012; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.cos(a - da) * 1700, oy + Math.sin(a - da) * 1700); c.lineTo(ox + Math.cos(a + da) * 1700, oy + Math.sin(a + da) * 1700); c.closePath(); c.fill(); }
  c.restore();
  R.dots(c, 0, 0, 1080, 200, 26, 4, "rgba(26,23,22,0.14)");
  /* Titel und Ziel */
  c.save(); c.translate(56, 150); c.rotate(-3 * Math.PI / 180);
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: R.F_BAGEL, max: 110, min: 56, maxW: 560, lines: 1 });
  R.pop(c, tf.lines[0], 0, 0, tf.size, { sh: tf.size * 0.08 }); c.restore();
  const h1 = ryuChip(c, k, R, m.up(m.lblTarget + " " + m.tgt), 1030, 52, 380, 3);
  ryuChip(c, k, R, m.rounds + " " + (m.rounds === 1 ? m.lblEntryOne : m.lblEntries), 1030, 52 + h1 + 14, 380, -2, R.CR);
  const tie = m.tie, win = m.teams.filter((t) => t.win && !tie)[0], los = m.teams.filter((t) => t !== win)[0];
  let vs, crowns = [];
  if (!tie) {
    ryuFighter(c, k, R, m, win, 40, 225, 880, 430, -2.6, true, { sh: 14, nameMax: 112, totMax: 270, nameRes: 120 });
    crowns.push([120, 198, 190, -12]);
    const wf = k.fit(c, m.lblWinner, { w: 400, fam: R.F_BAGEL, max: 34, min: 18, maxW: 210, lines: 1 }); k.setFont(c, 400, wf.size, R.F_BAGEL);
    const ww = c.measureText(wf.lines[0]).width + 40, wh = wf.size + 26, wx = 920 - ww - 20, wy = 215;
    R.sticker(c, wx, wy, ww, wh, { r: wh / 2, fill: R.RED, rot: 6, sh: 6, lw: 4, stroke: R.CR });
    R.rot(c, wx, wy, ww, wh, 6, () => { k.setFont(c, 400, wf.size, R.F_BAGEL); c.fillStyle = R.CR; c.fillText(wf.lines[0], 20, wh / 2 + wf.size * 0.34); });
    ryuFighter(c, k, R, m, los, 300, 712, 730, 290, 3.4, false, { sh: 10, nameMax: 76, totMax: 150, nameRes: 160 });
    vs = [150, 700, 105, -8];
  } else {
    ryuFighter(c, k, R, m, m.teams[0], 40, 225, 880, 350, -2.4, true, { sh: 13, nameMax: 96, totMax: 210, nameRes: 110 });
    ryuFighter(c, k, R, m, m.teams[1], 150, 650, 880, 350, 2.4, true, { sh: 13, nameMax: 96, totMax: 210, nameRes: 110 });
    crowns.push([130, 222, 150, -14], [1000 - 40, 648, 150, 12]);
    vs = [112, 610, 100, 8];
  }
  /* VS-Explosion */
  R.burst(c, vs[0], vs[1], vs[2], vs[2] * 0.62, 14, { fill: R.CR, sh: 9, lw: 6, rot: vs[3] });
  k.setFont(c, 400, vs[2] * 0.8, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = "center"; c.fillText("VS", vs[0], vs[1] + vs[2] * 0.28); c.textAlign = "left";
  crowns.forEach((q) => ryuCrown(c, R, q[0], q[1], q[2] * 0.6, q[3]));
  if (!tie) {
    /* K.O.-Stern am Verlierer, Stempel links daneben */
    R.burst(c, 960, 742, 92, 54, 11, { fill: R.CR, sh: 8, lw: 6, rot: 12 });
    k.setFont(c, 400, 62, R.F_BAGEL); c.fillStyle = R.RED; c.save(); c.translate(960, 742); c.rotate(10 * Math.PI / 180); c.textAlign = "center"; c.lineWidth = 7; c.strokeStyle = R.INK; c.lineJoin = "round"; c.strokeText("K.O.", 0, 21); c.fillText("K.O.", 0, 21); c.restore(); c.textAlign = "left";
    const sp = d.tr("ryuTOver", "Ausgejasst.");
    R.sticker(c, 40, 835, 250, 80, { r: 14, fill: R.CR, rot: -8, sh: 6, lw: 4 });
    R.stamp(c, k, sp, 165, 876, 36, -8, R.RED, 215);
  }
  /* Schlagzeile */
  const my = 1030, mh = 150;
  R.sticker(c, 40, my, 1000, mh, { r: 28, fill: R.CR, rot: -0.8, sh: 10, lw: 6 });
  R.rot(c, 40, my, 1000, mh, -0.8, () => {
    const hf = k.heroFit(c, m.msg, { w: 400, fam: R.F_BAGEL, maxW: 920 }, [{ max: 64, min: 44, lines: 1 }, { max: 56, min: 32, lines: 2 }, { max: 40, min: 24, lines: 3 }]);
    k.setFont(c, 400, hf.size, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = "center"; const lh = hf.size * 1.08;
    hf.lines.forEach((ln, i) => c.fillText(ln, 500, mh / 2 + hf.size * 0.34 - ((hf.lines.length - 1) * lh) / 2 + i * lh)); c.textAlign = "left";
  });
  R.footer(c, k, d);
  return cv;
}

export default {
  games: ["schieber"],
  fonts: ["700 80px Fraunces", "500 25px Fraunces", "800 28px \"Baloo 2\"", "600 24px Inter", "700 24px Inter", "800 34px Inter"],
  accepts: (d) => !!(d.extra && Array.isArray(d.extra.teams) && d.extra.teams.length === 2 && d.extra.teams.every((tm) => tm && Array.isArray(tm.entries)) && isFinite(Number(d.extra.target))),
  prepare: async (k) => { const [bauer, dame, papier] = await Promise.all([BAUER_URL, DAME_URL, PAPIER_URL].map((u) => k.tplImg(u))); return { bauer, dame, papier }; },
  texts: (d) => ["−'’!¡#… " + d.tr("tplNewsEntries", "") + d.tr("schieberEntryOne", "") + d.up(d.tr("tplNewsWinner", "") + d.tr("tplNewsSum", "") + d.tr("targetLabel", "")) + (d.extra ? d.extra.teams.map((t) => t.name).join(" ") : "")],
  render,
  renderRyu(d, k, R) { const { cv } = { cv: ryuPage(d, k, R, buildModel(d)) }; return [cv]; },
};
