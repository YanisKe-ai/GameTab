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
};
