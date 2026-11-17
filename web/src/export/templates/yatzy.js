// Ergebnisbild Yatzy, Variante A (freigegebener Entwurf Export7, 432 x 540, hier Faktor 2.5).
// Daten: nur Namen, Raenge und Endpunkte (gtEcModel: d.rows, d.winners, Gleichstand). Die Wuerfel sind Spielsymbol (fuenf Sechser), keine Wurfdaten.
// Podest 2-1-3 (Sieger Mitte), bei Gleichstand stehen alle Sieger nebeneinander auf Platz 1. Ab Platz 4 eine kurze Liste unter dem Podest, ab 9 Eintraegen Folgeseiten.
import { F_BOWLBY } from "./fonts-a.js";

const BG = "#7E8BFF", INK = "#14101C", WHITE = "#FFFFFF";
const FIRST_CAP = 8; // Eintraege auf Seite 1 (Podest plus Liste)
const ROT = [-6, 4, -2, 5, -4];
const SIX = [[0.27, 0.25], [0.73, 0.25], [0.27, 0.5], [0.73, 0.5], [0.27, 0.75], [0.73, 0.75]];
const FAM = F_BOWLBY;

function die(c, k, x, y, s, rot) {
  const h = s / 2, r = s * 0.22, bw = 5, sh = Math.max(7.5, Math.round(s * 0.07 / 2.5) * 2.5);
  c.save(); c.translate(x + h, y + h); c.rotate(rot * Math.PI / 180);
  c.fillStyle = INK; k.rrect(c, -h, -h + sh, s, s, r); c.fill();
  c.fillStyle = WHITE; k.rrect(c, -h, -h, s, s, r); c.fill();
  c.strokeStyle = INK; c.lineWidth = bw; k.rrect(c, -h + bw / 2, -h + bw / 2, s - bw, s - bw, r - bw / 2); c.stroke();
  c.fillStyle = INK;
  SIX.forEach(([px, py]) => { c.beginPath(); c.arc(-h + px * s, -h + py * s, s * 0.08, 0, Math.PI * 2); c.fill(); });
  c.restore();
}
/* Weisse Schrift mit schwarzem Rand und hartem Versatzschatten (text-stroke + paint-order stroke fill + text-shadow) */
function pop(c, text, x, y, stroke, off) {
  c.lineJoin = "round";
  c.fillStyle = INK; c.strokeStyle = INK; c.lineWidth = stroke * 2;
  c.strokeText(text, x + off, y + off); c.fillText(text, x + off, y + off);
  c.strokeText(text, x, y); c.fillStyle = WHITE; c.fillText(text, x, y);
}
function title(c, k, d, base) {
  const f = k.fit(c, d.up(d.gameLabel), { w: 400, fam: FAM, max: 145, min: 70, maxW: 940, lines: 1 });
  k.setFont(c, 400, f.size, FAM); c.textAlign = "center";
  pop(c, f.lines[0], 540, base, 2.5 * f.size / 145, 12.5 * f.size / 145);
  c.textAlign = "left";
}
function footer(c, k, d) {
  const lw = k.logo(c, d.logo, 60, 1210, 100, INK);
  const x = 60 + lw + 20;
  k.setFont(c, 800, 52, k.F_BALOO); c.fillStyle = INK; c.fillText("GameTab", x, 1262);
  const f = k.fit(c, d.date, { w: 600, fam: k.F_INTER, max: 30, min: 18, maxW: 1020 - x - 300 - 20, lines: 1 });
  k.setFont(c, 600, f.size, k.F_INTER); c.textAlign = "right"; c.fillText(f.lines[0], 1020, 1262); c.textAlign = "left";
}
/* Podium-Spalten in Anzeigereihenfolge: ein Sieger -> 2, 1, 3; Gleichstand -> alle Sieger nebeneinander (dann ggf. Platz 3) */
function podiumCols(rows, winners) {
  const win = winners.length ? winners : rows.slice(0, 1);
  const rest = rows.filter((r) => win.indexOf(r) < 0);
  if (win.length === 1) {
    const cols = [];
    if (rest[0]) cols.push(rest[0]);
    cols.push(win[0]);
    if (rest[1]) cols.push(rest[1]);
    return cols;
  }
  const w = win.slice(0, 4);
  return w.concat(w.length < 3 ? rest.slice(0, 3 - w.length) : []);
}
function column(c, k, r, x, w, base, H, hero) {
  const rank = Math.min(r.rank, 3);
  const bt = base - H, rad = 35, bw = 7.5;
  const body = (dx) => { c.beginPath(); c.moveTo(x + dx, base); c.lineTo(x + dx, bt + rad); c.arcTo(x + dx, bt, x + dx + rad, bt, rad); c.lineTo(x + dx + w - rad, bt); c.arcTo(x + dx + w, bt, x + dx + w, bt + rad, rad); c.lineTo(x + dx + w, base); c.closePath(); };
  c.fillStyle = INK; body(15); c.fill();
  if (rank !== 1) { c.fillStyle = BG; body(0); c.fill(); }
  c.fillStyle = rank === 1 ? WHITE : "rgba(255,255,255,0.7)"; body(0); c.fill();
  c.strokeStyle = INK; c.lineWidth = bw; c.lineJoin = "miter";
  const a = bw / 2;
  c.beginPath(); c.moveTo(x + a, base); c.lineTo(x + a, bt + rad); c.arcTo(x + a, bt + a, x + rad, bt + a, rad - a); c.lineTo(x + w - rad, bt + a); c.arcTo(x + w - a, bt + a, x + w - a, bt + rad, rad - a); c.lineTo(x + w - a, base); c.stroke();
  /* Platznummer */
  const ns = Math.min(hero ? 180 : 120, H * 0.5);
  k.setFont(c, 400, ns, FAM); c.fillStyle = INK; c.textAlign = "center";
  c.fillText(String(r.rank), x + w / 2, bt + H / 2 + k.capH(c) / 2);
  /* Punkte */
  const sf = k.fit(c, r.value, { w: 400, fam: FAM, max: hero ? 115 : 70, min: 36, maxW: w - 10, lines: 1 });
  k.setFont(c, 400, sf.size, FAM); const sb = bt - 20;
  if (hero) pop(c, r.value, x + w / 2, sb, 3.75 * sf.size / 115, 7.5 * sf.size / 115); else { c.fillStyle = INK; c.fillText(r.value, x + w / 2, sb); }
  const scap = k.capH(c);
  /* Name in Grossbuchstaben, Zeilen nach oben gestapelt */
  let nf = k.nameFit(c, d0(r), { w: 400, fam: FAM, max: hero ? 75 : 50, min: hero ? 30 : 26, maxW: w - 8, lines: 2 });
  // zu lang: drei Zeilen und kleinere Schrift (nie mitten im Wort), Ellipse nur als letzte Loesung
  if (nf.cut) nf = k.fit(c, d0(r), { w: 400, fam: FAM, max: hero ? 56 : 40, min: 15, maxW: w - 8, lines: 3 });
  k.setFont(c, 400, nf.size, FAM); c.fillStyle = INK;
  let nb = sb - scap - 24;
  for (let i = nf.lines.length - 1; i >= 0; i--) { c.fillText(nf.lines[i], x + w / 2, nb); nb -= nf.size * 1.12; }
  c.textAlign = "left";
}
let upFn = (s) => s;
function d0(r) { return upFn(r.name); }
/* Kurze Liste ab Platz 4: Raster, Platz links, Name, Punkte rechts */
function list(c, k, rows, top, cols, pitch) {
  const gap = 30, cw = cols === 1 ? 760 : (960 - gap) / 2, x0 = cols === 1 ? 160 : 60;
  rows.forEach((r, i) => {
    const col = i % cols, row = Math.floor(i / cols), x = x0 + col * (cw + gap), y = top + row * pitch;
    c.fillStyle = INK; c.fillRect(x, y, cw, 5);
    const fs = 38, mid = y + 5 + (pitch - 5) / 2;
    k.setFont(c, 400, fs, FAM); const base = mid + k.capH(c) / 2;
    c.fillStyle = INK; c.fillText(String(r.rank), x + 4, base);
    const rw = c.measureText("00").width + 24;
    c.textAlign = "right"; const vw = c.measureText(r.value).width; c.fillText(r.value, x + cw - 4, base); c.textAlign = "left";
    const nf = k.nameFit(c, d0(r), { w: 400, fam: FAM, max: fs, min: 24, maxW: cw - rw - vw - 36 - 8, lines: 2 });
    k.setFont(c, 400, nf.size, FAM);
    nf.lines.forEach((ln, j) => c.fillText(ln, x + rw, mid + nf.size * 0.36 - (nf.lines.length - 1) * nf.size * 0.55 + j * nf.size * 1.1));
  });
}

function page1(d, k, rows) {
  const { cv, c } = k.tplCanvas();
  upFn = d.up;
  c.fillStyle = BG; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  const pc = podiumCols(rows, d.winners.filter((w) => rows.indexOf(w) >= 0));
  const rest = rows.filter((r) => pc.indexOf(r) < 0);
  const lcols = rest.length > 4 ? 2 : 1, lrows = Math.ceil(rest.length / lcols), pitch = 72;
  const listH = rest.length ? lrows * pitch + 30 : 0;
  title(c, k, d, 165);
  const dsz = rest.length > 3 ? 110 : 140, dgap = dsz / 8, dw = 5 * dsz + 4 * dgap, dtop = 215;
  ROT.forEach((r, i) => die(c, k, 540 - dw / 2 + i * (dsz + dgap), dtop, dsz, r));
  const pb = 1185 - listH, ztop = dtop + dsz + 45;
  const m = pc.length, colW = Math.min(460, Math.floor((960 - 20 * (m - 1)) / Math.max(m, 3))), tot = m * colW + (m - 1) * 20, x0 = (1080 - tot) / 2 - 7;
  const nWin = pc.filter((r) => r.rank === 1).length;
  const H1 = Math.max(170, Math.min(500, pb - ztop - 290));
  const hOf = (r) => (r.rank === 1 ? H1 : r.rank === 2 ? Math.round(H1 * 0.7) : Math.round(H1 * 0.5));
  pc.forEach((r, i) => column(c, k, r, x0 + i * (colW + 20), colW, pb, Math.max(hOf(r), 110), r.rank === 1 && nWin <= 2));
  if (rest.length) list(c, k, rest, pb + 30, lcols, pitch);
  footer(c, k, d);
  return cv;
}

/* Folgeseite: Titel wie Seite 1, Hinweis Fortsetzung, einspaltige Liste, unten Logo, GameTab und Datum wie Seite 1 (kein Logo oben) */
function contPage(d, k, rows, no, count) {
  const { cv, c } = k.tplCanvas();
  upFn = d.up;
  c.fillStyle = BG; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  title(c, k, d, 165);
  const pg = d.tr("ecPage", (x, y) => x + "/" + y);
  const pgt = typeof pg === "function" ? pg(no, count) : no + "/" + count;
  const cont = d.tr("ecContinued", "Fortsetzung") + "  " + pgt;
  const cf = k.fit(c, cont, { w: 700, fam: k.F_BALOO, max: 46, min: 26, maxW: 900, lines: 1 });
  k.setFont(c, 700, cf.size, k.F_BALOO); c.fillStyle = INK; c.textAlign = "center"; c.fillText(cf.lines[0], 540, 245); c.textAlign = "left";
  const top = 300, avail = 1170 - top, pitch = Math.min(88, avail / Math.max(rows.length, 1)), rh = pitch - 12, fs = Math.min(44, rh * 0.55);
  rows.forEach((r, i) => {
    const y = top + i * pitch, base = y + rh / 2 + fs * 0.36;
    c.fillStyle = r.winner ? WHITE : "rgba(255,255,255,0.55)"; k.rrect(c, 60, y, 960, rh, rh * 0.22); c.fill();
    c.strokeStyle = INK; c.lineWidth = 4; k.rrect(c, 62, y + 2, 956, rh - 4, rh * 0.22 - 2); c.stroke();
    k.setFont(c, 400, fs, FAM); c.fillStyle = INK; c.fillText(String(r.rank), 90, base);
    const rw = c.measureText("00").width + 30;
    c.textAlign = "right"; const vw = c.measureText(r.value).width; c.fillText(r.value, 990, base); c.textAlign = "left";
    const nf = k.nameFit(c, d0(r), { w: 400, fam: FAM, max: fs, min: 24, maxW: 960 - 60 - rw - vw - 50, lines: 2 });
    k.setFont(c, 400, nf.size, FAM);
    nf.lines.forEach((ln, j) => c.fillText(ln, 90 + rw, y + rh / 2 + nf.size * 0.36 - (nf.lines.length - 1) * nf.size * 0.55 + j * nf.size * 1.1));
  });
  footer(c, k, d);
  return cv;
}


/* ---------- Ryū-Fassung: Würfelbecher-Plakat ----------
   Roter Grund mit Körnung, Titel YATZY als Pop-Schrift, schwarzer Becher kippt oben rechts fünf Creme-Würfel (Sechser) aus,
   Sieger als grosser schräger Creme-Sticker mit Zackenkreis «1», übrige Plätze als Sticker-Zeilen. Gleiche Seitenaufteilung wie render(). */
function ryuDie(c, R, cx, cy, s, deg) {
  c.save(); c.translate(cx, cy); c.rotate(deg * Math.PI / 180);
  c.fillStyle = R.INK; R.rr(c, -s / 2 + s * 0.08, -s / 2 + s * 0.08, s, s, s * 0.2); c.fill();
  c.fillStyle = R.CR; R.rr(c, -s / 2, -s / 2, s, s, s * 0.2); c.fill();
  c.lineWidth = Math.max(3, s * 0.05); c.strokeStyle = R.INK; R.rr(c, -s / 2, -s / 2, s, s, s * 0.2); c.stroke();
  c.fillStyle = R.INK; SIX.forEach(([px, py]) => { c.beginPath(); c.arc(-s / 2 + px * s, -s / 2 + py * s, s * 0.085, 0, Math.PI * 2); c.fill(); });
  c.restore();
}
function ryuCup(c, R, cx, cy, s, deg) {
  c.save(); c.translate(cx, cy); c.rotate(deg * Math.PI / 180);
  const top = s * 0.5, bot = s * 0.36, h = s;
  const path = (dx, dy) => { c.beginPath(); c.moveTo(-top + dx, -h / 2 + dy); c.lineTo(top + dx, -h / 2 + dy); c.lineTo(bot + dx, h / 2 + dy); c.lineTo(-bot + dx, h / 2 + dy); c.closePath(); };
  path(s * 0.06, s * 0.06); c.fillStyle = R.INK; c.fill();
  path(0, 0); c.fillStyle = R.INK; c.fill(); c.lineWidth = Math.max(4, s * 0.03); c.strokeStyle = R.CR; c.stroke();
  /* Rillen und Rand in Creme */
  c.lineWidth = Math.max(3, s * 0.022); c.strokeStyle = R.CR;
  [0.18, 0.62].forEach((f) => { const y = -h / 2 + h * f, w = top - (top - bot) * f; c.beginPath(); c.moveTo(-w + 14, y); c.lineTo(w - 14, y); c.stroke(); });
  c.fillStyle = R.CR; R.rr(c, -top - s * 0.04, -h / 2 - s * 0.07, top * 2 + s * 0.08, s * 0.12, s * 0.05); c.fill();
  c.lineWidth = Math.max(3, s * 0.025); c.strokeStyle = R.INK; R.rr(c, -top - s * 0.04, -h / 2 - s * 0.07, top * 2 + s * 0.08, s * 0.12, s * 0.05); c.stroke();
  c.restore();
}
/* Gezackter Explosionsstern als Ellipse (rx, ry), fester Zufall. */
function ryuSpiky(c, cx, cy, rx, ry, n, inn, seed) {
  let sd = seed || 11; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, f = i % 2 ? inn : 0.9 + rnd() * 0.1;
    const px = cx + Math.cos(a) * rx * f, py = cy + Math.sin(a) * ry * f; if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.closePath();
}
/* Strahlen (Speedlines) aus dem Mittelpunkt, dunkleres Rot */
function ryuSpeed(c, R, cx, cy, n, yMax) {
  c.save(); c.beginPath(); c.rect(0, 0, 1080, yMax); c.clip(); c.fillStyle = R.RED2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.1, w = 0.05 + (i % 3) * 0.018;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a - w) * 1500, cy + Math.sin(a - w) * 1500); c.lineTo(cx + Math.cos(a + w) * 1500, cy + Math.sin(a + w) * 1500); c.closePath(); c.fill();
  }
  c.restore();
}
/* Verlierer-Sticker: kleiner Wuerfel mit Platz, Name, Wert */
function ryuLoser(c, k, R, r, x, y, w, h, deg, d) {
  R.sticker(c, x, y, w, h, { r: Math.min(20, h * 0.28), rot: deg, sh: 7, lw: 4 });
  R.rot(c, x, y, w, h, deg, () => {
    const s = h - 22, dx = 12, dy = 11;
    c.save(); c.translate(dx + s / 2, dy + s / 2); c.rotate(-deg * 1.6 * Math.PI / 180);
    c.fillStyle = R.INK; R.rr(c, -s / 2 + 4, -s / 2 + 4, s, s, s * 0.22); c.fill();
    c.fillStyle = R.CR2; R.rr(c, -s / 2, -s / 2, s, s, s * 0.22); c.fill(); c.lineWidth = 3.5; c.strokeStyle = R.INK; R.rr(c, -s / 2, -s / 2, s, s, s * 0.22); c.stroke();
    c.fillStyle = R.INK; k.setFont(c, 400, s * 0.62, R.F_BAGEL); c.textAlign = "center"; c.fillText(String(r.rank), 0, s * 0.22); c.textAlign = "left";
    c.restore();
    const fs = Math.min(46, h * 0.46), nx = dx + s + 18;
    const vf = k.fit(c, String(r.value), { w: 400, fam: R.F_BAGEL, max: fs, min: 20, maxW: w * 0.3, lines: 1 });
    k.setFont(c, 400, vf.size, R.F_BAGEL); const vw = c.measureText(vf.lines[0]).width;
    c.fillStyle = R.INK; c.textAlign = "right"; c.fillText(vf.lines[0], w - 20, h / 2 + vf.size * 0.36); c.textAlign = "left";
    const nf = k.nameFit(c, d.up(r.name), { w: 400, fam: R.F_BAGEL, max: fs, maxW: w - nx - vw - 44, lines: 2 });
    k.setFont(c, 400, nf.size, R.F_BAGEL); c.fillStyle = R.INK; const lh = nf.size * 1.05;
    nf.lines.forEach((ln, j) => c.fillText(ln, nx, h / 2 + nf.size * 0.36 - ((nf.lines.length - 1) * lh) / 2 + j * lh));
  });
}
function ryuPage1(d, k, R, rows) {
  const { cv, c } = k.tplCanvas(); R.bg(c, R.RED, 1301);
  const win = d.winners.filter((w) => rows.indexOf(w) >= 0), rest = rows.filter((r) => win.indexOf(r) < 0);
  const L = rest.length, cols = L > 4 ? 2 : 1, nRow = Math.ceil(L / cols);
  const labelH = L ? 66 : 0;
  /* Sieger-Name */
  const names = (win.length ? win : rows.slice(0, 1)).map((w) => d.up(w.name)).join(" · ");
  const innerW = 740;
  const nf = k.heroFit(c, names, { w: 400, fam: R.F_BAGEL, maxW: innerW }, [{ max: 175, min: 90, lines: 1 }, { max: 130, min: 66, lines: 2 }, { max: 92, min: 46, lines: 3 }, { max: 62, min: 24, lines: 4 }]);
  const lh = nf.size * 1.02, nameH = nf.lines.length * lh;
  let ry = Math.max(215, nameH * 0.74 + 40); const top = 300;
  if (!L) ry = Math.max(ry, 330);
  else { const ip = L <= 2 ? 118 : L <= 4 ? 104 : 96; ry = Math.max(ry, Math.min(300, (1180 - (labelH + nRow * ip + 14) - 60 - top) / 2)); }
  let cy = top + ry;
  if (!L) cy = Math.max(cy, (top + 1130) / 2);
  let lossTop = L ? cy + ry + 60 : 1180;
  const pitch = L ? Math.max(60, Math.min(L <= 2 ? 118 : L <= 4 ? 104 : 96, (1180 - lossTop - labelH - 14) / nRow)) : 0;
  if (L && lossTop + labelH + nRow * pitch + 14 > 1190) { const sh = lossTop + labelH + nRow * pitch + 14 - 1190; cy -= sh; lossTop -= sh; }
  const cx = 540, rx = 520;
  ryuSpeed(c, R, cx, cy, 30, 1350);
  R.dots(c, 0, 0, 1080, 330, 26, 4.2, "rgba(26,23,22,0.18)");
  /* Titel und Becher */
  c.save(); c.translate(60, 175); c.rotate(-6 * Math.PI / 180);
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: R.F_BAGEL, max: 150, min: 64, maxW: 560, lines: 1 });
  R.pop(c, tf.lines[0], 0, 0, tf.size, { sh: tf.size * 0.08 }); c.restore();
  ryuCup(c, R, 850, 207, 250, 196);
  /* Explosion */
  c.fillStyle = R.INK; ryuSpiky(c, cx + 12, cy + 12, rx, ry, 17, 0.76, 5); c.fill();
  c.fillStyle = R.CR; ryuSpiky(c, cx, cy, rx, ry, 17, 0.76, 5); c.fill();
  c.lineWidth = 6; c.lineJoin = "miter"; c.strokeStyle = R.INK; ryuSpiky(c, cx, cy, rx, ry, 17, 0.76, 5); c.stroke(); c.lineJoin = "round";
  ryuDie(c, R, 95, top + 25, 86, -18);
  /* Name */
  c.save(); c.translate(cx, cy - 8); c.rotate(-2.5 * Math.PI / 180);
  nf.lines.forEach((ln, j) => R.pop(c, ln, 0, (j - (nf.lines.length - 1) / 2) * lh + nf.size * 0.34, nf.size, { align: "center", fill: R.INK, shadow: R.RED, stroke: R.INK, sw: nf.size * 0.015, sh: nf.size * 0.05 }));
  c.restore();
  /* Punktzahl als Wuerfel-Stempel */
  const val = String((win[0] || rows[0]).value), vs = 84;
  k.setFont(c, 400, vs, R.F_BAGEL); const vtw = c.measureText(val).width, dw = Math.max(210, vtw + 120), dh = 156, dcx = cx + 340, dcy = cy + ry * 0.9;
  c.save(); c.translate(dcx, dcy); c.rotate(7 * Math.PI / 180);
  c.fillStyle = R.INK; R.rr(c, -dw / 2 + 10, -dh / 2 + 10, dw, dh, 30); c.fill();
  c.fillStyle = R.INK; R.rr(c, -dw / 2, -dh / 2, dw, dh, 30); c.fill(); c.lineWidth = 5; c.strokeStyle = R.CR; R.rr(c, -dw / 2 + 5, -dh / 2 + 5, dw - 10, dh - 10, 26); c.stroke();
  c.fillStyle = R.CR; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { c.beginPath(); c.arc(sx * (dw / 2 - 24), sy * (dh / 2 - 24), 8, 0, 6.2832); c.fill(); });
  k.setFont(c, 400, vs, R.F_BAGEL); c.textAlign = "center"; c.fillText(val, 0, vs * 0.34); c.textAlign = "left"; c.restore();
  if (L) {
    /* Spruch */
    const tx = d.tr("ryuTEasy", "Zu einfach.");
    const sf = k.fit(c, tx, { w: 400, fam: R.F_BAGEL, max: 58, min: 30, maxW: 360, lines: 1 });
    k.setFont(c, 400, sf.size, R.F_BAGEL); const sw = c.measureText(sf.lines[0]).width + 56, sh = sf.size + 36;
    const scx = cx - 300, scy = cy + ry * 0.9;
    R.sticker(c, scx - sw / 2, scy - sh / 2, sw, sh, { r: 14, fill: R.RED, stroke: R.INK, rot: -8, sh: 8, lw: 5 });
    R.rot(c, scx - sw / 2, scy - sh / 2, sw, sh, -8, () => { k.setFont(c, 400, sf.size, R.F_BAGEL); c.fillStyle = R.CR; c.textAlign = "center"; c.fillText(sf.lines[0], sw / 2, sh / 2 + sf.size * 0.36); c.textAlign = "left"; });
    /* Verlierer */
    const nt = d.tr("ryuTNext", "Nächstes Mal vielleicht.");
    const lf = k.fit(c, nt, { w: 400, fam: R.F_BAGEL, max: 40, min: 24, maxW: 760, lines: 1 });
    k.setFont(c, 400, lf.size, R.F_BAGEL); const lw = c.measureText(lf.lines[0]).width + 56, lhh = lf.size + 26;
    R.sticker(c, 60, lossTop, lw, lhh, { r: lhh / 2, fill: R.INK, rot: -2, sh: 0, lw: 0 });
    R.rot(c, 60, lossTop, lw, lhh, -2, () => { k.setFont(c, 400, lf.size, R.F_BAGEL); c.fillStyle = R.CR; c.fillText(lf.lines[0], 28, lhh / 2 + lf.size * 0.36); });
    const gap = 24, cw = cols === 1 ? 860 : (960 - gap) / 2, x0 = cols === 1 ? 110 : 60, ty = lossTop + labelH, rot = [-2.5, 2, -1.5, 3, -3, 1.5, -2, 2.5];
    rest.forEach((r, i) => {
      const col = cols === 1 ? 0 : i % cols, ri = cols === 1 ? i : Math.floor(i / cols);
      ryuLoser(c, k, R, r, x0 + col * (cw + gap) + ((i * 37) % 22) - 8, ty + ri * pitch, cw, pitch - 14, rot[i % rot.length], d);
    });
  }
  R.footer(c, k, d);
  return cv;
}

export default {
  games: ["yatzy"],
  fonts: ["400 100px \"GTR Bowlby\"", "800 52px \"Baloo 2\"", "600 30px Inter"],
  texts: (d) => [d.up(d.gameLabel)],
  render(d, k) {
    const parts = k.chunks(d.rows, FIRST_CAP, 12);
    const out = [page1(d, k, parts[0])];
    parts.slice(1).forEach((p, i) => out.push(contPage(d, k, p, i + 2, parts.length)));
    return out;
  },
  renderRyu(d, k, R) {
    upFn = d.up;
    const parts = k.chunks(d.rows, FIRST_CAP, 12);
    const out = [ryuPage1(d, k, R, parts[0])];
    parts.slice(1).forEach((p, i) => out.push(R.contPage(d, k, p, i + 2, parts.length)));
    return out;
  },
};
