// Ergebnisbild Phase 10 (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/phase10.png): Treppe mit zehn Stufen, Spielfiguren auf der erreichten Phase.
// Daten: Rang und geschaffte Phasen (gtEcModel, Score = Phasen). Zusatz (shareExtra aus S8GameOver): {players:[{name, done, total}]} (total = Strafpunkte).
// Ohne Strafpunkte-Daten wird die Zeile weggelassen (nie als 0 gezeigt).
import { pickRows, breakHy, unHy } from "./util.js";

const BG = "#14141C", YEL = "#F2C230", DARKINK = "#14141C";
const STEP_COL = [["#E2453C", "#fff"], ["#2F6FDE", "#fff"], ["#2FA84F", "#fff"], ["#F2C230", DARKINK]];
const PAWN_COL = ["#FFFFFF", "#9CC9FF", "#FFB38A", "#B6F2A0", "#F5A6E6", "#FFE27A"];
const X0 = 130, SW = 90, BASE = 930;

function stairs(c, k) {
  for (let i = 1; i <= 10; i++) {
    const [col, ink] = STEP_COL[(i - 1) % 4], x = X0 + (i - 1) * SW, h = 108 + 48 * (i - 1), top = BASE - h;
    c.fillStyle = BG; k.rrect(c, x, top, SW, h + 2, 14); c.fill();
    c.fillStyle = col; k.rrect(c, x + 4, top + 4, SW - 8, h - 4, 11); c.fill();
    c.fillStyle = "rgba(0,0,0,0.13)"; c.fillRect(x + 4, BASE - 80, SW - 8, 80);
    c.fillStyle = BG; c.fillRect(x, BASE, SW, 4);
    k.setFont(c, 400, 62, k.F_ANTON); c.fillStyle = ink; c.textAlign = "center"; c.fillText(String(i), x + SW / 2, top + 10 + k.capH(c) + 8); c.textAlign = "left";
  }
  c.fillStyle = "rgba(255,255,255,0.2)"; c.fillRect(0, BASE, 1080, 8);
}
/* Spielfigur: cx Mitte, feet = Fusspunkt, sc Massstab, lift = Etikett hoeher setzen (bei mehreren Figuren auf einer Stufe) */
function pawn(c, k, cx, feet, sc, col, name, crown, chips, obst) {
  const T = feet - 158 * sc;
  c.fillStyle = col; c.beginPath(); c.arc(cx, T + 70 * sc, 26 * sc, 0, 7); c.fill();
  c.save(); c.translate(cx - 44 * sc, T + 92 * sc); c.scale(sc, sc);
  c.beginPath(); c.moveTo(44, 0); c.arcTo(88, 0, 88, 12, 44); c.lineTo(88, 58); c.arcTo(88, 70, 76, 70, 12); c.lineTo(12, 70); c.arcTo(0, 70, 0, 58, 12); c.lineTo(0, 44); c.arcTo(0, 0, 44, 0, 44); c.closePath(); c.fill(); c.restore();
  if (crown) { c.save(); c.translate(cx - 30 * sc, T + 18 * sc); c.scale(sc, sc); c.fillStyle = YEL; c.fill(new Path2D("M2 34 L6 8 L20 22 L30 2 L40 22 L54 8 L58 34Z")); c.restore(); }
  const fs = 24 * Math.max(sc, 0.85);
  const f = k.fit(c, name, { w: 800, fam: k.F_BALOO, max: fs, min: 20, maxW: 230, lines: 1 });
  k.setFont(c, 800, f.size, k.F_BALOO);
  const w = c.measureText(f.lines[0]).width + 24, h = f.size * 1.5;
  chips.push({ cx, w, h, y: T - 34 * sc - h, text: f.lines[0], size: f.size, col, T, sc });
  obst.push({ x: cx - 44 * sc, y: T + 14 * sc, w: 88 * sc, h: feet - T - 14 * sc });
}
/* Namensschildchen ohne Ueberlappung: von links nach rechts, jedes Schild so weit nach oben, bis es kein anderes beruehrt */
function drawChips(c, k, chips, obst) {
  const placed = [], hit = (a, q) => a.x < q.x + q.w + 6 && a.x + a.w + 6 > q.x && a.y < q.y + q.h + 6 && a.y + a.h + 6 > q.y;
  const clampX = (x, w) => Math.max(16, Math.min(1064 - w, x));
  chips.slice().sort((a, b) => a.cx - b.cx || b.y - a.y).forEach((ch) => {
    const y0 = ch.y, hy = ch.T + 70 * ch.sc - ch.h / 2;
    const cands = [{ x: ch.cx - ch.w / 2, y: y0 }, { x: ch.cx - 46 * ch.sc - 8 - ch.w, y: hy }, { x: ch.cx + 46 * ch.sc + 8, y: hy }];
    for (let q = 1; q < 40; q++) cands.push({ x: ch.cx - ch.w / 2, y: y0 - q * (ch.h + 6) });
    let pick = null;
    for (const cd of cands) { const t = { x: clampX(cd.x, ch.w), y: cd.y, w: ch.w, h: ch.h }; if (!placed.some((o) => hit(t, o)) && !obst.some((o) => hit(t, o))) { pick = t; break; } }
    if (!pick) pick = { x: clampX(ch.cx - ch.w / 2, ch.w), y: y0, w: ch.w, h: ch.h };
    ch.x = pick.x; ch.y = pick.y; placed.push(ch);
  });
  placed.forEach((ch) => {
    c.fillStyle = ch.col; k.rrect(c, ch.x, ch.y, ch.w, ch.h, 14); c.fill();
    k.setFont(c, 800, ch.size, k.F_BALOO); c.fillStyle = DARKINK; c.textAlign = "center"; c.fillText(ch.text, ch.x + ch.w / 2, ch.y + ch.h / 2 + k.capH(c) / 2); c.textAlign = "left";
  });
}
function footer(c, k, d) {
  const lw = k.logo(c, d.logo, 60, 1210, 100, YEL);
  const x = 60 + lw + 20;
  k.setFont(c, 800, 52, k.F_BALOO); c.fillStyle = YEL; c.fillText("GameTab", x, 1252);
  const f = k.fit(c, d.date, { w: 700, fam: k.F_BALOO, max: 26, min: 18, maxW: 1020 - x });
  k.setFont(c, 700, f.size, k.F_BALOO); c.globalAlpha = 0.9; c.fillText(f.lines[0], x, 1293); c.globalAlpha = 1;
}
function cell(c, k, d, x, y, w, r, col, pen, big) {
  c.fillStyle = col; c.fillRect(x, y, w, big ? 8 : 6);
  const rs = big ? 70 : 50, nsz = big ? 60 : 42, top = y + (big ? 16 : 10);
  k.setFont(c, 400, rs, k.F_ANTON); c.fillStyle = col; const rw = c.measureText(String(r.rank)).width;
  c.fillText(String(r.rank), x, top + (big ? 66 : 42));
  const nx = x + rw + 12, nw = w - rw - 12;
  const f = k.nameFit(c, r.name, { w: 400, fam: k.F_ANTON, max: nsz, maxW: nw, oneMin: 0.7, lines: big ? 3 : 2, max2: big ? 44 : 30 });
  k.setFont(c, 400, f.size, k.F_ANTON); c.fillStyle = "#fff";
  const nb = top + (big ? 56 : 38), lh = f.size * 1.05;
  f.lines.forEach((ln, i) => c.fillText(ln, nx, nb + i * lh));
  const nameBottom = nb + (f.lines.length - 1) * lh;
  const ph = d.tr("tplP10Phases", (n) => n + "/10")(r.score);
  const sf = k.fit(c, ph, { w: 700, fam: k.F_BALOO, max: big ? 26 : 21, min: 18, maxW: nw, lines: 1 });
  const pyb = Math.max(top + (big ? 90 : 66), nameBottom + sf.size * 1.15);
  k.setFont(c, 700, sf.size, k.F_BALOO); c.fillStyle = "rgba(255,255,255,0.8)"; c.fillText(sf.lines[0], nx, pyb);
  if (pen != null) {
    const v = d.num(pen), lab = d.tr("tplP10Pen", "Strafpunkte");
    const vs = big ? 58 : 36; k.setFont(c, 400, vs, k.F_ANTON); const vw = c.measureText(v).width;
    const pb = Math.max(top + (big ? 150 : 100), pyb + (big ? 58 : 32));
    c.fillStyle = "#fff"; c.fillText(v, x, pb);
    const lf = k.fit(c, lab, { w: 700, fam: k.F_BALOO, max: big ? 26 : 19, min: 15, maxW: Math.max(40, w - vw - 14), lines: 1 });
    k.setFont(c, 700, lf.size, k.F_BALOO); c.fillStyle = "rgba(255,255,255,0.67)"; c.fillText(lf.lines[0], x + vw + 8, pb);
    return pb + 10 - y;
  }
  return pyb + 12 - y;
}
function page1(d, k, pens) {
  const { cv, c } = k.tplCanvas();
  c.fillStyle = BG; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  stairs(c, k);
  // Titel
  const tf = k.fit(c, d.up(d.gameLabel), { w: 800, fam: k.F_BALOO, max: 104, min: 50, maxW: 760, lines: 1 });
  k.setFont(c, 800, tf.size, k.F_BALOO); c.fillStyle = YEL; c.fillText(tf.lines[0], 56, k.cssBase(c, 34, tf.size));
  // Sieger gross (1 bis 2 Zeilen)
  const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
  const name = d.up(win.map((r) => r.name).join(" & "));
  const fo = { w: 400, fam: k.F_ANTON, maxW: 790 };
  let nf = k.fit(c, name, Object.assign({ max: 170, min: 90, lines: 1 }, fo));
  if (nf.cut) { nf = k.fit(c, breakHy(name), Object.assign({ max: 130, min: 54, lines: 2 }, fo)); nf.lines = unHy(nf.lines); }
  k.setFont(c, 400, nf.size, k.F_ANTON); c.fillStyle = "#fff";
  const lh = nf.size * 1.0, cap = k.capH(c); let ny = 148 + (170 - nf.size) * 0 + cap + 6;
  nf.lines.forEach((ln, i) => c.fillText(ln, 52, ny + i * (cap + nf.size * 0.22)));
  const subBase = ny + (nf.lines.length - 1) * (cap + nf.size * 0.22) + 70;
  const w0 = win[0];
  let sub;
  if (d.tie) sub = d.tr("ecTied", "Gemeinsamer erster Platz");
  else if (w0 && w0.score >= 10) sub = d.tr("tplP10Top", "ganz oben angekommen");
  else sub = d.tr("tplP10Reach", (n) => n + "/10")(w0 ? w0.score : 0);
  const sf = k.fit(c, sub, { w: 700, fam: '"Kalam","Inter","GT Clean","GT CJK",sans-serif', max: 60, min: 28, maxW: 760, lines: 1 });
  k.setFont(c, 700, sf.size, '"Kalam","Inter","GT Clean","GT CJK",sans-serif'); c.fillStyle = YEL; c.fillText(sf.lines[0], 60, subBase); void lh;
  const subW = c.measureText(sf.lines[0]).width;
  k.setFont(c, 400, nf.size, k.F_ANTON); const titW = Math.max.apply(null, nf.lines.map((l) => c.measureText(l).width));
  // Figuren
  const groups = {};
  d.rows.forEach((r, i) => { const s = Math.max(0, Math.min(10, Math.round(r.score || 0))); (groups[s] = groups[s] || []).push(i); });
  const chips = [], obst = [{ x: 52, y: ny - cap - 10, w: Math.max(titW, subW + 8) + 10, h: subBase - ny + cap + 30 }];
  Object.keys(groups).forEach((s) => {
    const idx = groups[s], m = idx.length, n = Number(s);
    const sc = m === 1 ? 1 : m === 2 ? 0.85 : 0.74;
    const cx0 = n === 0 ? 70 : X0 + (n - 0.5) * SW;
    const top = n === 0 ? BASE : BASE - (108 + 48 * (n - 1)) + 4;
    const span = m === 1 ? 0 : Math.min(60, 150 / (m - 1));
    idx.forEach((ri, j) => {
      const r = d.rows[ri];
      const cx = Math.min(1030 - 40, Math.max(60, cx0 + (j - (m - 1) / 2) * span));
      pawn(c, k, cx, top, sc, PAWN_COL[ri % PAWN_COL.length], r.name, r.winner, chips, obst);
    });
  });
  drawChips(c, k, chips, obst);
  // Rangliste unten
  const n = d.rows.length, big = n <= 3, cols = Math.min(3, n), cw = (1000 - 18 * (cols - 1)) / cols;
  let rowY = big ? 960 : 948, rowH = 0;
  d.rows.forEach((r, i) => {
    const col = i % 3;
    if (i > 0 && col === 0) { rowY += Math.max(rowH, 112) + 6; rowH = 0; }
    const x = 40 + col * (cw + 18);
    rowH = Math.max(rowH, cell(c, k, d, x, rowY, cw, r, PAWN_COL[i % PAWN_COL.length], pens[i], big));
  });
  footer(c, k, d);
  return cv;
}

export default {
  games: ["phase10"],
  fonts: ["400 100px \"GTR Anton\"", "800 104px \"Baloo 2\"", "700 26px \"Baloo 2\"", "700 60px Kalam"],
  texts: (d) => [d.tr("ecTied", ""), d.tr("tplP10Top", ""), d.tr("tplP10Reach", (n) => n)(10), d.tr("tplP10Phases", (n) => n)(10), d.tr("tplP10Pen", ""), "0123456789/"],
  accepts: (d) => d.rows.length > 0 && d.rows.length <= 6 && d.rows.every((r) => r.score != null),
  render(d, k) {
    const ex = d.extra || {};
    const picked = pickRows(d, ex.players, "done");
    const pens = picked.map((e) => (e && e.total != null && isFinite(Number(e.total)) ? Number(e.total) : null));
    return [page1(d, k, pens)];
  },
};
