// Ryū-Baukasten fuer die Ergebnisbilder (nur im Modus Ryū, data-gt-skin="plakat").
// Nur drei Farben: Rot #E4312B mit Koernung, warmes Schwarz #1A1716, Creme #F3EAD3 (dazu helle Creme-Stufen).
// Sticker-Sprache: Creme-Flaechen mit schwarzem Rand und hartem Versatzschatten, leicht schraeg, Zackensticker, Explosionssterne,
// Klebeband, Stempel. Schrift Bagel Fat One (Titel, Namen, Zahlen), Inter (Kleintext), Archivo Black fuer erweiterte Lateinzeichen.
// Jede Vorlage bekommt renderRyu(d, k, R) mit R = dieses Modul. Inhalt (Rangliste, Werte, Seitenaufteilung) bleibt wie in render().

import "./fonts-a.js"; // meldet GTR Archivo an (Ersatz fuer erweiterte Lateinzeichen)

const GT_RYU_KIT = (() => {
const RED = "#E4312B", INK = "#1A1716", CR = "#F3EAD3", CR2 = "#E6DAB9", CR3 = "#D8CBA8", RED2 = "#B9241F";
const PAL = { RED, INK, CR, CR2, CR3, RED2 };
/* Bagel fuer Gross-Text; erweiterte Lateinzeichen (ū, ő ...) fallen auf Archivo Black, CJK und Rest auf Inter/GT Clean */
const F_BAGEL = '"Bagel Fat One","GT Ryu Ext","GTR Archivo","Inter","GT Clean","GT CJK",sans-serif';
const F_TXT = '"Inter","GT Clean","GT CJK",sans-serif';
/* In `fonts` der Vorlage ergaenzen (index.js macht das im Ryū-Modus automatisch) */
const RYU_FONTS = ['400 100px "Bagel Fat One"', '400 100px "GTR Archivo"', "700 30px Inter", "800 30px Inter"];
const D2R = Math.PI / 180;

/* ---------- Hintergrund ---------- */
/* Flaeche in Farbe col mit Koernung (fest gesetzter Zufall, jedes Bild gleich) */
function grain(c, x, y, w, h, seed, amount) {
  let sd = seed || 7919; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const n = Math.round((amount || 1) * w * h / 160);
  for (let i = 0; i < n; i++) {
    const px = x + rnd() * w, py = y + rnd() * h, r = 0.7 + rnd() * 1.5;
    c.fillStyle = rnd() < 0.62 ? "rgba(26,23,22," + (0.05 + rnd() * 0.09).toFixed(3) + ")" : "rgba(243,234,211," + (0.03 + rnd() * 0.06).toFixed(3) + ")";
    c.beginPath(); c.arc(px, py, r, 0, 6.2832); c.fill();
  }
}
function bg(c, col, seed) { c.fillStyle = col || RED; c.fillRect(0, 0, 1080, 1350); grain(c, 0, 0, 1080, 1350, seed, col === CR ? 0.5 : 1); }
/* Halbton-Punktraster (Comic), z. B. dunkle Punkte auf Rot */
function dots(c, x, y, w, h, step, r, col) {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = col || "rgba(26,23,22,0.16)";
  for (let yy = y, row = 0; yy < y + h + step; yy += step * 0.866, row++) for (let xx = x + (row % 2 ? step / 2 : 0); xx < x + w + step; xx += step) { c.beginPath(); c.arc(xx, yy, r, 0, 6.2832); c.fill(); }
  c.restore();
}

/* ---------- Formen ---------- */
function rr(c, x, y, w, h, r) {
  const q = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath(); c.moveTo(x + q, y); c.lineTo(x + w - q, y); c.arcTo(x + w, y, x + w, y + q, q); c.lineTo(x + w, y + h - q); c.arcTo(x + w, y + h, x + w - q, y + h, q);
  c.lineTo(x + q, y + h); c.arcTo(x, y + h, x, y + h - q, q); c.lineTo(x, y + q); c.arcTo(x, y, x + q, y, q); c.closePath();
}
/* Drehung um den Mittelpunkt (x,y,w,h), fn zeichnet in lokalen Koordinaten mit Ursprung oben links */
function rot(c, x, y, w, h, deg, fn) { c.save(); c.translate(x + w / 2, y + h / 2); c.rotate((deg || 0) * D2R); c.translate(-w / 2, -h / 2); fn(); c.restore(); }
/* Sticker: harter Schatten (sh px nach rechts unten), Flaeche, schwarzer Rand. o: {r, fill, rot, sh, lw, stroke} */
function sticker(c, x, y, w, h, o) {
  o = o || {}; const r = o.r == null ? 26 : o.r, sh = o.sh == null ? 10 : o.sh, lw = o.lw == null ? 5 : o.lw;
  rot(c, x, y, w, h, o.rot, () => {
    if (sh) { c.fillStyle = INK; rr(c, sh, sh, w, h, r); c.fill(); }
    c.fillStyle = o.fill || CR; rr(c, 0, 0, w, h, r); c.fill();
    if (lw) { c.lineWidth = lw; c.strokeStyle = o.stroke || INK; rr(c, lw / 2, lw / 2, w - lw, h - lw, Math.max(0, r - lw / 2)); c.stroke(); }
  });
}
/* Pfad eines Sterns/Zackenkreises um (cx,cy): n Zacken zwischen ro und ri */
function starPath(c, cx, cy, ro, ri, n, deg, jag) {
  c.beginPath(); let sd = 31; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (let i = 0; i < n * 2; i++) {
    const a = (deg || 0) * D2R + (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, rr0 = i % 2 ? ri : ro * (jag ? 0.86 + rnd() * 0.14 : 1);
    const px = cx + Math.cos(a) * rr0, py = cy + Math.sin(a) * rr0; if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.closePath();
}
/* Explosionsstern (Comic-Burst) mit hartem Schatten und Rand */
function burst(c, cx, cy, ro, ri, n, o) {
  o = o || {}; const sh = o.sh == null ? 10 : o.sh;
  if (sh) { c.fillStyle = INK; starPath(c, cx + sh, cy + sh, ro, ri, n, o.rot, o.jag !== false); c.fill(); }
  c.fillStyle = o.fill || CR; starPath(c, cx, cy, ro, ri, n, o.rot, o.jag !== false); c.fill();
  c.lineWidth = o.lw == null ? 5 : o.lw; c.lineJoin = "miter"; c.strokeStyle = o.stroke || INK; starPath(c, cx, cy, ro, ri, n, o.rot, o.jag !== false); c.stroke(); c.lineJoin = "round";
}
/* Runder Zackensticker (wie die Startseite R1) */
function zig(c, cx, cy, r, o) { o = o || {}; burst(c, cx, cy, r, r * (o.depth || 0.9), o.n || 22, Object.assign({ jag: false }, o)); }
/* Klebeband: halbtransparentes Creme mit gezackten Enden */
function tape(c, cx, cy, w, h, deg, col) {
  c.save(); c.translate(cx, cy); c.rotate((deg || 0) * D2R); c.fillStyle = col || "rgba(243,234,211,0.82)";
  c.beginPath(); const z = 6, n = Math.max(3, Math.round(h / 10));
  c.moveTo(-w / 2, -h / 2); c.lineTo(w / 2, -h / 2);
  for (let i = 1; i <= n; i++) c.lineTo(w / 2 + (i % 2 ? z : 0), -h / 2 + (h * i) / n);
  c.lineTo(-w / 2, h / 2);
  for (let i = 1; i <= n; i++) c.lineTo(-w / 2 - (i % 2 ? z : 0), h / 2 - (h * i) / n);
  c.closePath(); c.fill(); c.restore();
}
/* Stempel: doppelter Rahmen, Text in Bagel, leicht gedreht, Farbe col (Standard Schwarz) */
function stamp(c, k, text, cx, cy, size, deg, col, maxW) {
  c.save(); c.translate(cx, cy); c.rotate((deg || 0) * D2R);
  const f = k.fit(c, text, { w: 400, fam: F_BAGEL, max: size, min: Math.max(18, size * 0.5), maxW: maxW || 600, lines: 1 });
  k.setFont(c, 400, f.size, F_BAGEL); const tw = c.measureText(f.lines[0]).width, ph = f.size * 0.55, w = tw + ph * 2, h = f.size * 1.5;
  c.strokeStyle = col || INK; c.fillStyle = col || INK; c.lineWidth = Math.max(3, f.size * 0.08);
  rr(c, -w / 2, -h / 2, w, h, h * 0.18); c.stroke(); c.lineWidth = Math.max(2, f.size * 0.04); rr(c, -w / 2 + 8, -h / 2 + 8, w - 16, h - 16, h * 0.14); c.stroke();
  c.textAlign = "center"; c.fillText(f.lines[0], 0, f.size * 0.36); c.textAlign = "left"; c.restore();
  return { w, h };
}

/* ---------- Text ---------- */
/* Grosser Bagel-Text mit Rand und hartem Schatten (wie das Ryū-Logo). o: {fill, stroke, sw (Randstaerke), sh (Schatten), align} */
function pop(c, text, x, y, size, o) {
  o = o || {}; const sw = o.sw == null ? size * 0.12 : o.sw, sh = o.sh == null ? size * 0.07 : o.sh;
  c.save(); c.font = "400 " + Math.round(size * 10) / 10 + "px " + F_BAGEL; c.textAlign = o.align || "left"; c.lineJoin = "round";
  c.lineWidth = sw * 2; c.strokeStyle = o.shadow || INK; c.fillStyle = o.shadow || INK;
  if (sh) { c.strokeText(text, x + sh, y + sh); c.fillText(text, x + sh, y + sh); }
  c.strokeStyle = o.stroke || INK; c.strokeText(text, x, y); c.fillStyle = o.fill || CR; c.fillText(text, x, y);
  c.restore();
}
/* Titel des Spiels (Grossbuchstaben) als Pop-Schrift, passt sich in maxW ein. Gibt {size, base} zurueck */
function title(c, k, d, x, base, o) {
  o = o || {}; const t = o.text || d.up(d.gameLabel);
  const f = k.fit(c, t, { w: 400, fam: F_BAGEL, max: o.max || 130, min: o.min || 56, maxW: o.maxW || 900, lines: 1 });
  pop(c, f.lines[0], x, base, f.size, { align: o.align || "left", fill: o.fill, sh: o.sh, rot: 0 });
  return { size: f.size, text: f.lines[0] };
}
function font(c, k, s, fam, w) { k.setFont(c, w == null ? 400 : w, s, fam || F_BAGEL); }

/* ---------- Logo und Fuss ---------- */
/* Ryū-Logo: Drache + GAMETAB-Maske in Schwarz mit Creme-Kontur und hartem Schatten (wie das Logo auf der Startseite). Gibt die Breite zurueck. */
function logo(c, k, img, x, y, h, o) {
  o = o || {}; const w = h * k.LOGO_AR, pad = Math.max(2.5, h * 0.035), sh = o.sh == null ? h * 0.05 : o.sh;
  const s = 2, ow = Math.ceil((w + pad * 2 + sh) * s), oh = Math.ceil((h + pad * 2 + sh) * s);
  const mk = (col) => { const o2 = document.createElement("canvas"); o2.width = Math.ceil(w * s); o2.height = Math.ceil(h * s); const q = o2.getContext("2d"); q.imageSmoothingQuality = "high"; q.drawImage(img, 0, 0, o2.width, o2.height); q.globalCompositeOperation = "source-in"; q.fillStyle = col; q.fillRect(0, 0, o2.width, o2.height); return o2; };
  const ink = mk(o.fill || INK), edge = mk(o.edge || CR), shadow = mk(INK);
  const off = document.createElement("canvas"); off.width = ow; off.height = oh; const q = off.getContext("2d");
  const P = pad * s;
  if (sh) { for (let a = 0; a < 16; a++) q.drawImage(shadow, P + sh * s + Math.cos(a / 16 * 6.2832) * P, P + sh * s + Math.sin(a / 16 * 6.2832) * P); }
  for (let a = 0; a < 16; a++) q.drawImage(edge, P + Math.cos(a / 16 * 6.2832) * P, P + Math.sin(a / 16 * 6.2832) * P);
  q.drawImage(ink, P, P);
  c.save(); c.imageSmoothingQuality = "high"; c.drawImage(off, x - pad, y - pad, ow / s, oh / s); c.restore();
  [ink, edge, shadow, off].forEach((v) => { v.width = v.height = 0; });
  return w;
}
/* Fuss: Logo unten links (Hoehe 96, wie bisher), rechts Datum auf kleinem Creme-Etikett. o.dark = Fuss auf Creme-Grund */
function footer(c, k, d, o) {
  o = o || {};
  const lw = logo(c, k, d.logo, 60, 1218, 84);
  pop(c, "GameTab", 60 + lw + 18, 1278, 46, { sh: 4, sw: 5 });
  k.setFont(c, 400, 46, F_BAGEL); const gx = 60 + lw + 18 + c.measureText("GameTab").width + 30;
  const f = k.fit(c, d.date, { w: 700, fam: F_TXT, max: 28, min: 18, maxW: 1020 - gx - 40, lines: 1 });
  k.setFont(c, 700, f.size, F_TXT); const tw = c.measureText(f.lines[0]).width, bw = tw + 40, bh = f.size + 26;
  const bx = 1020 - bw, by = 1262 - bh / 2 - 4;
  sticker(c, bx, by, bw, bh, { r: bh / 2, rot: -2, sh: 5, lw: 3.5, fill: o.dateFill || CR });
  rot(c, bx, by, bw, bh, -2, () => { k.setFont(c, 700, f.size, F_TXT); c.fillStyle = INK; c.fillText(f.lines[0], 20, bh / 2 + f.size * 0.36); });
}

/* ---------- Rangliste ---------- */
/* Eine Ranglistenzeile als Sticker: Platz (Zackenkreis), Name, Wert. o: {x,y,w,h, rot, hot, fam} */
function row(c, k, r, o) {
  const hot = !!o.hot, h = o.h, w = o.w, fs = o.fs || Math.min(48, h * 0.48);
  sticker(c, o.x, o.y, w, h, { r: Math.min(22, h * 0.3), rot: o.rot || 0, sh: o.sh == null ? 7 : o.sh, lw: 4, fill: hot ? (o.hotFill || INK) : (o.fill || CR) });
  rot(c, o.x, o.y, w, h, o.rot || 0, () => {
    const ink = hot ? CR : INK, cx = h * 0.56;
    k.setFont(c, 400, fs * 0.92, F_BAGEL); c.fillStyle = hot ? RED : INK; c.textAlign = "center"; c.fillText(String(r.rank), cx, h / 2 + fs * 0.33); c.textAlign = "left";
    const nx = h * 1.06;
    k.setFont(c, 400, fs, F_BAGEL); c.textAlign = "right";
    const vf = k.fit(c, String(r.value), { w: 400, fam: F_BAGEL, max: fs, min: fs * 0.55, maxW: Math.min(340, w * 0.4), lines: 1 }); k.setFont(c, 400, vf.size, F_BAGEL);
    const vw = c.measureText(vf.lines[0]).width; c.fillStyle = ink; c.fillText(vf.lines[0], w - 24, h / 2 + vf.size * 0.36); c.textAlign = "left";
    const nf = k.nameFit(c, r.name, { w: 400, fam: F_BAGEL, max: fs, maxW: w - nx - vw - 52, lines: 2 });
    k.setFont(c, 400, nf.size, F_BAGEL); c.fillStyle = ink; const lh = nf.size * 1.05;
    nf.lines.forEach((ln, j) => c.fillText(ln, nx, h / 2 + nf.size * 0.36 - ((nf.lines.length - 1) * lh) / 2 + j * lh));
  });
}
/* Liste in einem Bereich: rows, top, bottom, x, w, cols (1|2). Zeilenhoehe passt sich an. */
function list(c, k, rows, o) {
  if (!rows.length) return;
  const cols = o.cols || 1, gap = 16, n = Math.ceil(rows.length / cols), avail = o.bottom - o.top;
  const pitch = Math.min(o.maxPitch || 104, avail / n), h = pitch - gap * 0.9, cw = (o.w - (cols - 1) * 24) / cols;
  rows.forEach((r, i) => {
    const col = cols === 1 ? 0 : i % cols, ri = cols === 1 ? i : Math.floor(i / cols);
    row(c, k, r, { x: o.x + col * (cw + 24), y: o.top + ri * pitch, w: cw, h, rot: o.tilt === false ? 0 : (i % 2 ? 0.8 : -0.8), hot: r.winner && o.hotWin !== false, fs: Math.min(o.fs || 46, h * 0.5) });
  });
}

/* ---------- Folgeseite ---------- */
/* Gemeinsame Ryū-Folgeseite: roter Grund, Titel, «Fortsetzung n/m» als schwarzer Sticker, Liste als Sticker, Fuss.
   o: {bgCol, deco(c)} optional */
function contPage(d, k, rows, no, count, o) {
  o = o || {};
  const { cv, c } = k.tplCanvas(); bg(c, o.bgCol || RED, 4243 + no);
  if (o.deco) o.deco(c);
  title(c, k, d, 60, 170, { max: 120, maxW: 960 });
  const pg = d.tr("ecPage", (x, y) => x + "/" + y), pgt = typeof pg === "function" ? pg(no, count) : no + "/" + count;
  const cont = d.tr("ecContinued", "Fortsetzung") + "  " + pgt;
  const f = k.fit(c, cont, { w: 400, fam: F_BAGEL, max: 40, min: 24, maxW: 700, lines: 1 });
  k.setFont(c, 400, f.size, F_BAGEL); const tw = c.measureText(f.lines[0]).width;
  sticker(c, 60, 210, tw + 56, f.size + 34, { r: (f.size + 34) / 2, fill: INK, rot: -2, sh: 6, lw: 0 });
  rot(c, 60, 210, tw + 56, f.size + 34, -2, () => { k.setFont(c, 400, f.size, F_BAGEL); c.fillStyle = CR; c.fillText(f.lines[0], 28, (f.size + 34) / 2 + f.size * 0.36); });
  list(c, k, rows, { x: 60, w: 950, top: 310, bottom: 1180, maxPitch: 92 });
  footer(c, k, d);
  return cv;
}

return { PAL, RED, INK, CR, CR2, CR3, RED2, F_BAGEL, F_TXT, RYU_FONTS, grain, bg, dots, rr, rot, sticker, starPath, burst, zig, tape, stamp, pop, title, font, logo, footer, row, list, contPage };
})();
export { GT_RYU_KIT };
