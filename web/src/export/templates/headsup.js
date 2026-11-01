// Ergebnisbild HeadsUp (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/headsup.png).
// Daten: gtEcModel (Raenge, Gleichstand, Zahl der erratenen Begriffe). Kein shareExtra noetig.
// Das Wort auf der vordersten Karte ("Velo") speichert das Spiel nicht: die Kartenreihe ist leer, vorne nur ein "?".
import { F_MONO } from "./fonts-a.js";

const BG = "#6C7FE8", NAVY = "#12163A", LILA = "#B7C1FF", GREEN = "#2FD9A8";

function bg(c, k) {
  c.fillStyle = BG; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  c.fillStyle = "rgba(255,255,255,0.08)";
  const cx = 540, cy = 520, R = 2400;
  for (let a = 0; a < 360; a += 20) {
    const a0 = (a - 90) * Math.PI / 180, a1 = (a + 10 - 90) * Math.PI / 180;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + R * Math.cos(a0), cy + R * Math.sin(a0)); c.lineTo(cx + R * Math.cos(a1), cy + R * Math.sin(a1)); c.closePath(); c.fill();
  }
}
function ell(c, x, y, rx, ry, fill) { c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
function stroke(c, d, col, w) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.stroke(new Path2D(d)); }
/* Kopf mit Oberkoerper, Koordinaten des Entwurfs (SVG 1080 x 1350) */
function person(c) {
  c.fillStyle = "#2B2F6B"; c.fill(new Path2D("M330 1060 C340 940 400 900 460 880 L460 800 L620 800 L620 880 C690 900 740 940 750 1060Z"));
  c.fillStyle = "#E3B48C"; c.fillRect(465, 760, 150, 130);
  ell(c, 376, 660, 34, 52, "#E9BF98"); ell(c, 704, 660, 34, 52, "#E9BF98");
  stroke(c, "M366 640 q-14 20 0 40", "#C48F68", 7); stroke(c, "M714 640 q14 20 0 40", "#C48F68", 7);
  ell(c, 540, 620, 170, 215, "#F1C9A5");
  c.fillStyle = "#3A2418"; c.fill(new Path2D("M366 560 C350 380 460 330 540 330 C640 330 740 390 714 560 C690 470 630 440 540 440 C450 440 392 470 366 560Z"));
  ell(c, 480, 680, 16, 21, NAVY); ell(c, 600, 680, 16, 21, NAVY);
  c.fillStyle = "#FFFFFF"; c.beginPath(); c.arc(486, 672, 5, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(606, 672, 5, 0, Math.PI * 2); c.fill();
  stroke(c, "M450 640 q30 -22 60 -4 M570 636 q30 -18 60 4", "#3A2418", 10);
  stroke(c, "M540 700 q-14 40 6 50", "#C48F68", 8);
  const mouth = new Path2D("M470 790 q70 60 140 0 q-70 20 -140 0Z");
  c.fillStyle = "#FFFFFF"; c.fill(mouth); c.strokeStyle = NAVY; c.lineWidth = 8; c.lineJoin = "round"; c.stroke(mouth);
  c.globalAlpha = 0.55; c.fillStyle = "#F08A8A"; c.beginPath(); c.arc(440, 745, 20, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(640, 745, 20, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
}
function phone(c, k, d, val, label) {
  c.save(); c.translate(540, 495); c.rotate(-4 * Math.PI / 180);
  const w = 500, h = 260, x = -w / 2, y = -h / 2;
  c.fillStyle = "rgba(10,13,38,0.53)"; k.rrect(c, x, y + 20, w, h, 44); c.fill();
  c.fillStyle = "#0A0D26"; k.rrect(c, x, y, w, h, 44); c.fill();
  c.save(); k.rrect(c, x + 10, y + 10, w - 20, h - 20, 34); c.clip();
  c.fillStyle = NAVY; c.fillRect(x, y, w, h);
  c.textAlign = "center";
  const vf = k.fit(c, val, { w: 400, fam: k.F_ANTON, max: 130, min: 70, maxW: 420 });
  c.fillStyle = "#FFFFFF"; k.setFont(c, 400, vf.size, k.F_ANTON); c.fillText(val, 0, y + 16 + vf.size * 0.86);
  const lf = k.fit(c, d.tr("tplHeadsGuessed", "Begriffe erraten"), { w: 800, fam: k.F_BALOO, max: 36, min: 20, maxW: 440 });
  c.fillStyle = LILA; k.setFont(c, 800, lf.size, k.F_BALOO); c.fillText(lf.lines[0], 0, y + 16 + vf.size * 0.86 + lf.size * 1.15);
  c.fillStyle = GREEN; c.fillRect(x, y + h - 60, w, 60);
  const bf = k.fit(c, label, { w: 800, fam: k.F_BALOO, max: 32, min: 18, maxW: 440 });
  c.fillStyle = "#06241B"; k.setFont(c, 800, bf.size, k.F_BALOO); c.fillText(bf.lines[0], 0, y + h - 30 + bf.size * 0.3);
  c.textAlign = "left"; c.restore(); c.restore();
}
function stack(c, k) {
  const rots = [5, -4, 3, -6, 2];
  rots.forEach((r, i) => {
    c.save(); c.translate(740 + 140, 640 + i * 40 + 85); c.rotate(r * Math.PI / 180);
    c.fillStyle = "rgba(18,22,58,0.33)"; k.rrect(c, -140, -85 + 8, 280, 170, 22); c.fill();
    c.fillStyle = NAVY; k.rrect(c, -140, -85, 280, 170, 22); c.fill();
    c.fillStyle = "#FFFFFF"; k.rrect(c, -134, -79, 268, 158, 17); c.fill();
    if (i === rots.length - 1) { c.fillStyle = NAVY; c.textAlign = "center"; k.setFont(c, 800, 92, k.F_BALOO); c.fillText("?", 0, 32); c.textAlign = "left"; }
    c.restore();
  });
}
function pills(c, k, d, rows, top, ph, cols) {
  const gap = 16, pw = (920 - gap * (cols - 1)) / cols;
  rows.forEach((r, i) => {
    const col = i % cols, row = Math.floor(i / cols), x = 80 + col * (pw + gap), y = top + row * (ph + gap);
    c.fillStyle = NAVY; k.rrect(c, x, y, pw, ph, 22); c.fill();
    const fs = Math.min(46, ph * 0.33), ls = Math.min(26, ph * 0.19);
    const txt = r.name + " " + r.value;
    let f = k.fit(c, txt, { w: 800, fam: k.F_BALOO, max: fs, min: Math.max(16, fs * 0.6), maxW: pw - 28, lines: 1 });
    if (f.cut && ph >= 100) f = k.fit(c, txt, { w: 800, fam: k.F_BALOO, max: fs * 0.82, min: Math.max(14, fs * 0.4), maxW: pw - 28, lines: 2 });
    c.textAlign = "center"; c.fillStyle = "#FFFFFF"; k.setFont(c, 800, f.size, k.F_BALOO);
    const lh = f.size * 1.08, mid = y + ph * 0.5 - ls * 0.05 - 4 - (f.lines.length - 1) * lh / 2;
    f.lines.forEach((l, li) => c.fillText(l, x + pw / 2, mid + li * lh));
    const lab = r.rank === 1 ? d.tr("ecWon", "Gewonnen") : d.tr("ecRank", "Platz") + " " + r.rank;
    c.fillStyle = LILA; k.setFont(c, 600, ls, k.F_BALOO); c.fillText(lab, x + pw / 2, y + ph - ph * 0.17);
    c.textAlign = "left";
  });
}
/* Viele Spieler (ab 7): zweispaltig, je Zeile Rang, Name und Zahl in einer Reihe, Sieger gruen */
function pillsRow(c, k, rows, top, ph) {
  const cols = 2, gap = 16, vg = 12, pw = (920 - gap) / 2;
  rows.forEach((r, i) => {
    const col = i % cols, row = Math.floor(i / cols), x = 80 + col * (pw + gap), y = top + row * (ph + vg);
    const hot = r.winner;
    c.fillStyle = hot ? GREEN : NAVY; k.rrect(c, x, y, pw, ph, 22); c.fill();
    const fs = Math.min(42, ph * 0.46), base = y + ph / 2 + fs * 0.34;
    k.setFont(c, 800, fs, k.F_BALOO); c.fillStyle = hot ? "#06241B" : GREEN; c.textAlign = "right"; c.fillText(r.value, x + pw - 24, base); const vw = c.measureText(r.value).width;
    c.textAlign = "left"; c.fillStyle = hot ? "#06241B" : LILA; k.setFont(c, 800, fs * 0.9, k.F_BALOO); c.fillText(String(r.rank), x + 24, base);
    const nx = x + 24 + c.measureText("00").width + 14;
    const f = k.fit(c, r.name, { w: 800, fam: k.F_BALOO, max: fs, min: Math.max(22, fs * 0.6), maxW: x + pw - 24 - vw - 16 - nx, lines: 1 });
    k.setFont(c, 800, f.size, k.F_BALOO); c.fillStyle = hot ? "#06241B" : "#FFFFFF"; c.fillText(f.lines[0], nx, base);
  });
}
function footer(c, k, d) {
  const lw = k.logo(c, d.logo, 70, 1220, 100, "#FFFFFF");
  const x = 70 + lw + 22;
  k.setFont(c, 800, 52, k.F_BALOO); c.fillStyle = "#FFFFFF"; c.fillText("GameTab", x, 1285);
  /* Datum rechts, zweizeilig am Komma */
  const parts = String(d.date).split(/,\s*/);
  const ls = parts.length > 1 ? [parts[0], parts.slice(1).join(", ")] : [d.date];
  let fs = 26; k.setFont(c, 600, fs, F_MONO);
  const maxW = 1010 - (x + c.measureText("GameTab").width + 30);
  while (fs > 16 && Math.max(...ls.map((l) => c.measureText(l).width)) > maxW) { fs -= 1; k.setFont(c, 600, fs, F_MONO); }
  c.textAlign = "right"; c.globalAlpha = 0.95;
  ls.forEach((l, i) => c.fillText(l, 1010, (ls.length === 1 ? 1277 : 1262) + i * fs * 1.15));
  c.globalAlpha = 1; c.textAlign = "left";
}

function page1(d, k, rows) {
  const { cv, c } = k.tplCanvas();
  bg(c, k);
  /* Titel */
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: k.F_ANTON, max: 190, min: 90, maxW: 920, ls: 0.02, lines: 1 });
  k.setFont(c, 400, tf.size, k.F_ANTON); c.fillStyle = "#FFFFFF"; k.spaced(c, tf.lines[0], 80, 50 + tf.size * 0.5 + k.capH(c) * 0.5 + (190 - tf.size) * 0.0 + 0, tf.size * 0.02, "left");
  const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
  const names = win.map((r) => r.name);
  const joined = names.length < 2 ? names[0] : names.slice(0, -1).join(", ") + " " + d.tr("stuAnd", "&") + " " + names[names.length - 1];
  const fn = d.tr(names.length > 1 ? "tplHeadsWinN" : "tplHeadsWin1");
  const sub = typeof fn === "function" ? fn(joined) : joined;
  const sf = k.fit(c, sub, { w: 800, fam: k.F_BALOO, max: 58, min: 26, maxW: 900, lines: 2 });
  if (sf.lines.length > 1) { const sf2 = k.fit(c, sub, { w: 800, fam: k.F_BALOO, max: 46, min: 24, maxW: 900, lines: 2 }); sf.size = sf2.size; sf.lines = sf2.lines; }
  k.setFont(c, 800, sf.size, k.F_BALOO); c.fillStyle = "#FFFFFF";
  const subTop = 50 + tf.size * 1.0 + 8;
  sf.lines.forEach((l, i) => c.fillText(l, 80, subTop + sf.size * 0.82 + i * sf.size * 1.1));
  const subBottom = subTop + sf.lines.length * sf.size * 1.1;
  /* Pillen unten */
  const n = rows.length, dense = n >= 7, cols = dense ? 2 : Math.max(1, Math.min(3, n)), nr = Math.ceil(n / cols);
  const ph = dense ? (nr <= 4 ? 96 : 86) : nr <= 1 ? 140 : nr === 2 ? 120 : nr === 3 ? 100 : 86, pgap = dense ? 12 : 16;
  const pillsTop = 1140 - nr * ph - (nr - 1) * pgap;
  /* Person, Handy und Kartenstapel; bei vielen Zeilen verkleinert */
  const topY = Math.max(340, subBottom + 10);
  const sc = Math.max(0.4, Math.min(1, (pillsTop - 14 - topY) / 720));
  c.save(); c.translate(540, topY); c.scale(sc, sc); c.translate(-540, -340);
  person(c);
  phone(c, k, d, win[0].value, d.tie ? d.tr("ecWonMany", "Gemeinsam gewonnen") : d.tr("ecWon", "Gewonnen"));
  stack(c, k);
  c.restore();
  if (dense) pillsRow(c, k, rows, pillsTop, ph); else pills(c, k, d, rows, pillsTop, ph, cols);
  footer(c, k, d);
  return cv;
}

export default {
  games: ["headsup"],
  fonts: ["400 100px \"GTR Anton\"", "800 58px \"Baloo 2\"", "600 26px \"Baloo 2\"", "600 26px \"GTR Mono\""],
  texts: (d) => [d.up(d.gameLabel), d.tr("tplHeadsGuessed", ""), d.tr("ecWon", ""), d.tr("ecWonMany", ""), d.tr("ecRank", ""), d.tr("stuAnd", ""), "?0123456789", d.winners.map((r) => r.name).join(" "), d.date],
  render(d, k) {
    const parts = k.chunks(d.rows, k.ONE_PAGE, 12);
    const out = [page1(d, k, parts[0])];
    const sty = { bg: (c) => bg(c, k), ink: "#FFFFFF", sub: LILA, acc: "#FFFFFF", line: "rgba(255,255,255,0.25)", fam: k.F_BALOO, logo: "#FFFFFF", titleFam: k.F_ANTON, titleCase: true, subFam: k.F_BALOO,
      rowFill: NAVY, rowFillWin: GREEN, winInk: "#06241B" };
    parts.slice(1).forEach((p, i) => out.push(k.continuationPage(d, p, i + 2, parts.length, sty)));
    return out;
  },
};
