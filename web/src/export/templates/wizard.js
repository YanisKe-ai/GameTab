// Ergebnisbild Wizard (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/wizard.png).
// Daten: Rang und Punkte (gtEcModel). Zusatz (shareExtra aus WizardGame): {roundCount, players:[{name, hits}]} (hits = Runden, in denen die Ansage genau getroffen wurde).
// "Prophezeiung erfuellt" nur, wenn alle Sieger jede Ansage getroffen haben; sonst der Gleichstand-Hinweis. Die getroffenen Ansagen stehen in der Rangliste, darum kein Untertitel.
import { pickRows, star, setI } from "./util.js";
import { row2, titleTilt, pill } from "./ryu-b.js";

const GOLD = "#E0BA72", HERO = "#F3DFA9", DARK = "#070818";
const F_FRAU = '"Fraunces","Inter","GT Clean","GT CJK",serif';
const STARS = [[100, 360, 60, 1], [983, 443, 46, 1], [130, 760, 40, 1], [971, 811, 62, 1], [918, 268, 36, 0.7], [57, 617, 34, 0.6], [1025, 665, 30, 0.6]];

function bg(c, k) {
  c.fillStyle = "#0E1030"; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  k.cssEllipse(c, 0, 0, k.TPL_W, k.TPL_H, 540, 513, [[0, "#1B1E52"], [0.55, "#0E1030"], [1, "#070818"]]);
}
/* Zauberkarte 400 x 540 (Entwurf), um die Mitte (cx, cy) gedreht und skaliert */
function wizCard(c, k, cx, cy, s, rot, letter, word) {
  c.save(); c.translate(cx, cy); c.rotate(rot * Math.PI / 180); c.scale(s, s); c.translate(-200, -270);
  c.fillStyle = "#0008"; k.rrect(c, 16, 22, 400, 540, 30); c.fill();
  c.fillStyle = DARK; k.rrect(c, -6, -6, 412, 552, 36); c.fill();
  c.fillStyle = GOLD; k.rrect(c, 0, 0, 400, 540, 30); c.fill();
  // Innenflaeche: inset 14, Rand 5 px
  c.fillStyle = DARK; k.rrect(c, 14, 14, 372, 512, 20); c.fill();
  c.save(); k.rrect(c, 19, 19, 362, 502, 15); c.clip();
  k.cssEllipse(c, 19, 19, 362, 502, 200, 230, [[0, "#2A2E78"], [0.8, "#171A45"], [1, "#171A45"]]);
  const ox = 14, oy = 14;
  [[40, 60, 40, 1], [350, 80, 30, 1], [70, 500, 28, 1], [340, 460, 44, 1], [190, 70, 22, 0.7]].forEach(([x, y, z, a]) => star(c, ox + x + z / 2, oy + y + z / 2, z, GOLD, a));
  // grosser Buchstabe
  setI(c, 700, 410, F_FRAU); c.fillStyle = GOLD; c.textAlign = "center";
  c.fillText(letter, ox + 186, k.cssBase(c, oy + 30, 410)); c.textAlign = "left";
  setI(c, 700, 40, F_FRAU); c.fillStyle = GOLD; c.fillText(letter, ox + 20, k.cssBase(c, oy + 84, 40));
  c.save(); c.translate(ox + 372 - 20, oy + 512 - 84); c.rotate(Math.PI); c.fillText(letter, 0, 0); c.restore();
  // Mond
  c.save(); c.translate(ox + 372 - 22 - 54, oy + 14); c.scale(0.54, 0.54); c.fillStyle = GOLD; c.fill(new Path2D("M70 8 A44 44 0 1 0 92 70 A36 36 0 1 1 70 8Z")); c.restore();
  const wf = k.fit(c, word, { w: 500, fam: F_FRAU, max: 32, min: 18, maxW: 320 });
  setI(c, 500, wf.size, F_FRAU); c.fillStyle = GOLD; c.textAlign = "center"; c.fillText(wf.lines[0], ox + 186, k.cssBase(c, oy + 512 - 20 - wf.size * 1.2, wf.size * 1.2)); c.textAlign = "left";
  c.restore(); c.restore();
}
function footer(c, k, d) {
  const lw = k.logo(c, d.logo, 60, 1210, 100, GOLD);
  const x = 60 + lw + 20;
  k.setFont(c, 800, 52, k.F_BALOO); c.fillStyle = GOLD; c.fillText("GameTab", x, 1252);
  const f = k.fit(c, d.date, { w: 700, fam: k.F_BALOO, max: 26, min: 18, maxW: 1020 - x });
  k.setFont(c, 700, f.size, k.F_BALOO); c.globalAlpha = 0.9; c.fillText(f.lines[0], x, 1293); c.globalAlpha = 1;
}
const NAME_FAM = F_FRAU;
function layoutRows(c, k, d, extras, N) {
  const n = d.rows.length;
  const base = (r) => r.winner ? 84 : n <= 3 ? 54 : n === 4 ? 46 : n === 5 ? 40 : 36;
  const sc = (r) => r.winner ? 100 : n <= 3 ? 60 : n === 4 ? 52 : 46;
  return d.rows.map((r, i) => {
    const e = extras[i];
    const ra = e && e.hits != null ? d.tr("tplWzBids", (a, b) => a + "/" + b)(e.hits, N) : "";
    k.setFont(c, 700, sc(r), NAME_FAM); const vw = Math.max(c.measureText(r.value).width, 130);
    setI(c, 500, 28, NAME_FAM); const rw = ra ? Math.min(c.measureText(ra).width, 340) : 0;
    const maxW = 1020 - 152 - vw - 22 - (rw ? rw + 22 : 0);
    const b = base(r);
    let f = k.nameFit(c, r.name, { w: 700, fam: NAME_FAM, max: b, maxW, max2: b * 0.72 });
    // Name wird sonst zu klein: Ansagen-Text wandert unter den Namen, der Name bekommt die ganze Breite
    let raBelow = false;
    if (ra && (f.cut || f.size < 30)) {
      const wide = k.nameFit(c, r.name, { w: 700, fam: NAME_FAM, max: b, maxW: maxW + rw + 22, max2: b * 0.72 });
      if (wide.size > f.size || (f.cut && !wide.cut)) { f = wide; raBelow = true; }
    }
    const h = Math.max(r.winner ? (n <= 3 ? 132 : 112) : (n <= 3 ? 88 : n === 4 ? 76 : n === 5 ? 66 : 58), f.lines.length * f.size * 1.1 + 24 + (raBelow ? 30 : 0));
    return { r, f, ra, vw, rw, h, sc: sc(r), raBelow };
  });
}
function page1(d, k, N, rowsData) {
  const { cv, c } = k.tplCanvas();
  bg(c, k);
  const n = d.rows.length;
  const extras = rowsData;
  const L = layoutRows(c, k, d, extras, N);
  const total = L.reduce((a, l) => a + l.h, 0);
  const rowsTop = Math.min(880, 1180 - total);
  // Titel und Untertitel
  const tf = k.fit(c, d.gameLabel, { w: 700, fam: F_FRAU, max: 170, min: 70, maxW: 940, lines: 1 });
  k.setFont(c, 700, tf.size, F_FRAU); c.fillStyle = GOLD; c.textAlign = "center"; c.fillText(tf.lines[0], 540, k.cssBase(c, 14, tf.size * 1.05));
  const win = d.winners;
  const perfect = N > 0 && win.length > 0 && win.every((r) => { const e = extras[d.rows.indexOf(r)]; return e && e.hits === N; });
  let sub = "";
  if (perfect) sub = d.tr("tplWzPerfect", "Prophezeiung erfüllt");
  else if (d.tie) sub = d.tr("ecTied", "Gemeinsamer erster Platz");
  else { const e = extras[d.rows.indexOf(win[0])]; if (!(e && e.hits != null && N > 0)) sub = d.tr("ecWon", "Gewonnen"); }
  if (sub) {
    const sf = k.fit(c, sub, { w: 500, fam: F_FRAU, max: 68, min: 30, maxW: 940, lines: 1 });
    setI(c, 500, sf.size, F_FRAU); c.fillStyle = GOLD; c.fillText(sf.lines[0], 540, k.cssBase(c, 196, sf.size));
  }
  c.textAlign = "left";
  // Karte im verbleibenden Raum
  const top = sub ? 290 : 200, avail = rowsTop - 24 - top;
  const s = Math.min(1.25, avail / 600);
  const cy = top + avail / 2;
  STARS.forEach(([x, y, z, a]) => { if (y < rowsTop - 40) star(c, x, Math.min(y, top + avail - 20), z, GOLD, a); });
  const word = d.tr("tplWzCard", "Zauberer");
  const letter = d.up(k.seg(word)[0] || "Z");
  wizCard(c, k, 540, cy, s, -4, letter, word);
  // Rangliste
  let y = rowsTop;
  L.forEach((l, i) => {
    const r = l.r;
    c.fillStyle = "rgba(224,186,114,0.45)"; c.fillRect(60, y, 960, 3);
    const lastBase = y + l.h - 10 - (l.f.lines.length - 1) * 0; // Grundlinie der letzten Zeile
    const bl = y + 3 + 6 + (l.h - 9 - 6) / 2 + l.f.size * 0.34 + (l.f.lines.length - 1) * l.f.size * 0.55;
    setI(c, 500, 40, F_FRAU); c.fillStyle = GOLD; c.fillText(String(r.rank), 60, bl);
    k.setFont(c, 700, l.sc, NAME_FAM); c.fillStyle = r.winner ? HERO : GOLD; c.textAlign = "right"; c.fillText(r.value, 1020, bl); c.textAlign = "left";
    k.setFont(c, 700, l.f.size, NAME_FAM); c.fillStyle = r.winner ? HERO : GOLD;
    const lh = l.f.size * 1.1, shift = l.raBelow ? 15 : 0, first = bl - (l.f.lines.length - 1) * lh - shift;
    l.f.lines.forEach((ln, j) => c.fillText(ln, 152, first + j * lh));
    if (l.ra && l.raBelow) {
      const rf = k.fit(c, l.ra, { w: 500, fam: NAME_FAM, max: 28, min: 24, maxW: 700, lines: 1 });
      setI(c, 500, rf.size, NAME_FAM); c.fillStyle = GOLD; c.globalAlpha = 0.85; c.fillText(rf.lines[0], 152, first + (l.f.lines.length - 1) * lh + 34); c.globalAlpha = 1;
    } else if (l.ra) {
      const rf = k.fit(c, l.ra, { w: 500, fam: NAME_FAM, max: 28, min: 18, maxW: 340, lines: 1 });
      setI(c, 500, rf.size, NAME_FAM); c.fillStyle = GOLD; c.globalAlpha = 0.85; c.textAlign = "right"; c.fillText(rf.lines[0], 1020 - l.vw - 22, bl); c.textAlign = "left"; c.globalAlpha = 1;
    }
    y += l.h; void lastBase; void i;
  });
  footer(c, k, d);
  return cv;
}

/* ---------- Ryū-Fassung: Zauberhut-Sticker ----------
   Roter Grund, Titel schräg, Untertitel als schwarze Pille, Zauberkarte (Creme-Sticker mit grossem Buchstaben) mit Zauberhut oben rechts,
   alle Plätze als Sticker-Zeilen (Sieger schwarz und grösser) mit Ansagen unter dem Wert. Gleiche Inhalte wie render(). */
function ryuHat(c, R, cx, by, W, deg) {
  c.save(); c.translate(cx, by); c.rotate(deg * Math.PI / 180);
  const cone = () => { c.beginPath(); c.moveTo(-W * 0.34, 0); c.quadraticCurveTo(-W * 0.14, -W * 0.5, W * 0.22, -W * 0.95); c.quadraticCurveTo(W * 0.2, -W * 0.4, W * 0.34, 0); c.closePath(); };
  c.fillStyle = R.INK; cone(); c.fill(); c.lineWidth = 4; c.strokeStyle = R.CR; c.lineJoin = "round"; cone(); c.stroke();
  c.fillStyle = R.INK; c.beginPath(); c.ellipse(0, 0, W * 0.6, W * 0.13, 0, 0, 6.2832); c.fill(); c.lineWidth = 4.5; c.strokeStyle = R.CR; c.stroke();
  c.fillStyle = R.CR; R.starPath(c, W * 0.03, -W * 0.34, W * 0.14, W * 0.06, 5, 0); c.fill();
  c.fillStyle = R.RED; c.fillRect(-W * 0.3, -W * 0.1, W * 0.6, W * 0.05);
  c.restore();
}
function ryuWizCard(c, k, R, cx, cy, ch, deg, letter, word) {
  const s = ch / 540, cw = 400 * s;
  c.save(); c.translate(cx, cy); c.rotate(deg * Math.PI / 180); c.translate(-cw / 2, -ch / 2);
  R.sticker(c, 0, 0, cw, ch, { r: 34 * s, sh: 14 * s, lw: Math.max(4, 7 * s) });
  c.lineWidth = Math.max(3, 4 * s); c.strokeStyle = R.INK; R.rr(c, 24 * s, 24 * s, cw - 48 * s, ch - 48 * s, 20 * s); c.stroke();
  [[70, 82, 20, R.RED], [330, 82, 20, R.RED], [70, 458, 16, R.INK], [330, 458, 16, R.INK]].forEach(([x, y, r, col]) => { c.fillStyle = col; R.starPath(c, x * s, y * s, r * s * 1.6, r * s * 0.6, 4, 0); c.fill(); });
  k.setFont(c, 400, 330 * s, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = "center"; c.fillText(letter, cw / 2, ch / 2 + 125 * s);
  const wf = k.fit(c, word, { w: 400, fam: R.F_BAGEL, max: 44 * s, min: 14, maxW: cw - 100 * s, lines: 1 });
  k.setFont(c, 400, wf.size, R.F_BAGEL); c.fillStyle = R.RED; c.fillText(wf.lines[0], cw / 2, ch - 62 * s); c.textAlign = "left";
  c.restore();
}
function ryuPage1(d, k, R, N, extras) {
  const { cv, c } = k.tplCanvas(); R.bg(c, R.RED, 3373);
  R.dots(c, 0, 0, 520, 360, 26, 4.2, "rgba(26,23,22,0.16)");
  const n = d.rows.length, bh = n <= 3 ? 104 : n === 4 ? 92 : n === 5 ? 84 : 78, gap = 14;
  const hs = d.rows.map((r) => (r.winner ? Math.round(bh * 1.32) : bh)), total = hs.reduce((a, b) => a + b + gap, 0) - gap, listTop = 1176 - total;
  titleTilt(c, k, R, d, 64, 215, -5, 900, 150);
  const win = d.winners, perfect = N > 0 && win.length > 0 && win.every((r) => { const e = extras[d.rows.indexOf(r)]; return e && e.hits === N; });
  let sub = "";
  if (perfect) sub = d.tr("tplWzPerfect", "Prophezeiung erfüllt");
  else if (d.tie) sub = d.tr("ecTied", "Gemeinsamer erster Platz");
  else { const e = extras[d.rows.indexOf(win[0])]; if (!(e && e.hits != null && N > 0)) sub = d.tr("ecWon", "Gewonnen"); }
  if (sub) pill(c, k, R, sub, 64, 262, 40, -2, { maxW: 540 });
  const zt = sub ? 318 : 280, ch = Math.max(240, Math.min(470, listTop - 36 - zt)), cw = ch * 400 / 540, ccx = sub ? 760 : 540, ccy = zt + (listTop - 36 - zt) / 2;
  ryuWizCard(c, k, R, ccx, ccy, ch, 4, d.up(k.seg(d.tr("tplWzCard", "Zauberer"))[0] || "Z"), d.tr("tplWzCard", "Zauberer"));
  ryuHat(c, R, ccx - cw / 2 + 24, ccy - ch / 2 + 46, Math.min(220, ch * 0.5), -16);
  let y = listTop;
  d.rows.forEach((r, i) => {
    const e = extras[i], ra = e && e.hits != null ? d.tr("tplWzBids", (a, b) => a + "/" + b)(e.hits, N) : "";
    row2(c, k, R, { x: 60, y, w: 960, h: hs[i], rot: i % 2 ? 0.8 : -0.8, hot: r.winner, rank: r.rank, name: r.name, right: r.value, rightSub: ra, fs: Math.min(r.winner ? 62 : 46, hs[i] * 0.5) });
    y += hs[i] + gap;
  });
  R.footer(c, k, d);
  return cv;
}

export default {
  games: ["wizard"],
  fonts: ["700 170px Fraunces", "italic 500 68px Fraunces", "italic 700 410px Fraunces", "800 52px \"Baloo 2\"", "700 26px \"Baloo 2\""],
  texts: (d) => [d.tr("tplWzCard", "Zauberer"), d.up(d.tr("tplWzCard", "Zauberer")), d.tr("tplWzPerfect", ""), d.tr("ecTied", ""), d.tr("ecWon", ""), "0123456789/"],
  accepts: (d) => d.rows.length <= 6,
  render(d, k) {
    const ex = d.extra || {};
    const N = Number(ex.roundCount) || 0;
    const picked = pickRows(d, ex.players, "total");
    const extras = picked.map((e) => (e && e.hits != null ? { hits: Number(e.hits) } : null));
    return [page1(d, k, N, extras)];
  },
  renderRyu(d, k, R) {
    const ex = d.extra || {};
    const N = Number(ex.roundCount) || 0;
    const picked = pickRows(d, ex.players, "total");
    const extras = picked.map((e) => (e && e.hits != null ? { hits: Number(e.hits) } : null));
    return [ryuPage1(d, k, R, N, extras)];
  },
};
