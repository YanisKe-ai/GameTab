// Ergebnisbild 5 Sekunden (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/fuenfsek.png).
// Daten: gtEcModel (Raenge, Gleichstand, Punkte). Kein shareExtra. Der Ring zeigt den Anteil des Siegers an allen vergebenen Punkten
// (aus den echten Punkten abgeleitet). Fehlversuche und Quote speichert das Spiel nicht: "in 5 Sekunden" aus dem Entwurf entfaellt,
// die Beschriftung unter der grossen Zahl ist die vorhandene Einheit "Punkte".
import { F_MONO, F_SPACE } from "./fonts-a.js";

const BG = "#1B1209", ORG = "#FF9640", PEACH = "#FFD7B0", INK = "#FFFFFF";

function bg(c, k) { c.fillStyle = BG; c.fillRect(0, 0, k.TPL_W, k.TPL_H); }
function clock(c, k, frac) {
  const cx = 540, cy = 550;
  c.fillStyle = ORG; k.rrect(c, 500, 230, 80, 32, 8); c.fill();
  c.fillStyle = "#2A1B0D"; c.beginPath(); c.arc(cx, cy, 316, 0, Math.PI * 2); c.fill();
  c.strokeStyle = ORG; c.globalAlpha = 0.5; c.lineCap = "butt";
  for (let a = 0; a < 60; a++) {
    const t = a / 60 * 2 * Math.PI, r0 = 296, r1 = (a % 5 ? 268 : 256);
    c.lineWidth = a % 5 === 0 ? 4.8 : 2.4;
    c.beginPath(); c.moveTo(cx + r0 * Math.sin(t), cy - r0 * Math.cos(t)); c.lineTo(cx + r1 * Math.sin(t), cy - r1 * Math.cos(t)); c.stroke();
  }
  c.globalAlpha = 1;
  c.lineWidth = 35.2; c.strokeStyle = "rgba(255,255,255,0.1)"; c.beginPath(); c.arc(cx, cy, 216, 0, Math.PI * 2); c.stroke();
  if (frac > 0) { c.strokeStyle = ORG; c.lineCap = "round"; c.beginPath(); c.arc(cx, cy, 216, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, frac)); c.stroke(); }
}
function footer(c, k, d) {
  const lw = k.logo(c, d.logo, 70, 1220, 100, ORG);
  const x = 70 + lw + 22;
  k.setFont(c, 800, 52, k.F_BALOO); c.fillStyle = ORG; c.fillText("GameTab", x, 1285);
  const parts = String(d.date).split(/,\s*/);
  const ls = parts.length > 1 ? [parts[0], parts.slice(1).join(", ")] : [d.date];
  let fs = 26; k.setFont(c, 600, fs, F_MONO);
  const maxW = 1010 - (x + c.measureText("GameTab").width + 30);
  while (fs > 16 && Math.max(...ls.map((l) => c.measureText(l).width)) > maxW) { fs -= 1; k.setFont(c, 600, fs, F_MONO); }
  c.textAlign = "right";
  ls.forEach((l, i) => c.fillText(l, 1010, (ls.length === 1 ? 1277 : 1262) + i * fs * 1.15));
  c.textAlign = "left";
}

function page1(d, k, rows) {
  const { cv, c } = k.tplCanvas();
  bg(c, k);
  /* Titel */
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: k.F_ANTON, max: 110, min: 50, maxW: 960, ls: 0.04, lines: 1 });
  k.setFont(c, 400, tf.size, k.F_ANTON); c.fillStyle = ORG; k.spaced(c, tf.lines[0], 540, 20 + 0.5 * tf.size + k.capH(c) * 0.5, tf.size * 0.04, "center");
  /* Liste */
  const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
  const nW = rows.filter((r) => r.winner).length, N = rows.length;
  /* Ab 7 Spielern zweispaltig (links Rang 1 bis ...), damit die Uhr gross bleibt und die Namen gross lesbar sind */
  const dense = N >= 7, RR = Math.ceil(N / 2);
  const pitch = dense ? (RR <= 4 ? 84 : 76) : Math.max(36, Math.min(83, 560 / (N + 0.4 * nW)));
  const wExtra = dense ? 0 : pitch * 0.2;
  const H = dense ? RR * pitch : N * pitch + nW * wExtra;
  const bottom = dense ? 1185 : N <= 3 ? 1125 : Math.min(1185, 1125 + (N - 3) * 15);
  const listTop = bottom - H;
  /* Uhr: Mittelpunkt (540, 550), bei viel Liste verkleinert */
  const total = d.rows.reduce((a, r) => a + (r.score > 0 ? r.score : 0), 0);
  const frac = total > 0 && win[0].score > 0 ? win[0].score / total : 0;
  const sc = Math.max(0.42, Math.min(1, (listTop - 24 - 150) / 720));
  c.save(); c.translate(540, 150); c.scale(sc, sc); c.translate(-540, -150);
  clock(c, k, frac);
  const val = win[0].value;
  const vf = k.fit(c, val, { w: 400, fam: k.F_ANTON, max: 300, min: 120, maxW: 380 });
  k.setFont(c, 400, vf.size, k.F_ANTON); c.fillStyle = INK; c.textAlign = "center"; c.fillText(val, 540, 590 + (300 - vf.size) * 0.2);
  const unit = d.tr("fiveSecScoreLabel", "Punkte");
  const uf = k.fit(c, unit, { w: 700, fam: F_SPACE, max: 28, min: 18, maxW: 320 });
  k.setFont(c, 700, uf.size, F_SPACE); c.fillStyle = PEACH; c.fillText(unit, 540, 590 + (300 - vf.size) * 0.2 + 36);
  c.textAlign = "left"; c.restore();
  /* Rangliste */
  if (dense) {
    const colW = 450, fs = Math.min(48, pitch * 0.6);
    rows.forEach((r, i) => {
      const col = Math.floor(i / RR), rw = i % RR, x = col ? 1010 - colW : 70, y = listTop + rw * pitch, base = y + pitch / 2 + fs * 0.36;
      k.setFont(c, 700, fs * 0.8, F_SPACE); c.fillStyle = r.winner ? ORG : PEACH; c.globalAlpha = r.winner ? 1 : 0.75; c.fillText(String(r.rank), x, base); c.globalAlpha = 1;
      const rkW = c.measureText("00").width + 16;
      k.setFont(c, 700, fs, F_SPACE); c.fillStyle = r.winner ? ORG : INK; c.textAlign = "right"; c.fillText(r.value, x + colW, base); const vw = c.measureText(r.value).width; c.textAlign = "left";
      const f = k.fit(c, r.name, { w: 700, fam: F_SPACE, max: fs, min: Math.max(22, fs * 0.55), maxW: colW - rkW - vw - 20, lines: 1 });
      k.setFont(c, 700, f.size, F_SPACE); c.fillText(f.lines[0], x + rkW, base);
      c.fillStyle = "rgba(255,255,255,0.13)"; c.fillRect(x, y + pitch - 3, colW, 3);
    });
  } else {
    let y = listTop;
    rows.forEach((r) => {
      const h = pitch + (r.winner ? wExtra : 0), fs = Math.min(r.winner ? 64 : 50, h * 0.62);
      const base = y + h * 0.5 + fs * 0.36;
      c.fillStyle = r.winner ? ORG : INK;
      k.setFont(c, 700, fs, F_SPACE); c.textAlign = "right"; c.fillText(r.value, 1010, base); const vw = c.measureText(r.value).width; c.textAlign = "left";
      const f = k.fit(c, r.name, { w: 700, fam: F_SPACE, max: fs, min: Math.max(16, fs * 0.5), maxW: 940 - vw - 24, lines: 1 });
      k.setFont(c, 700, f.size, F_SPACE); c.fillText(f.lines[0], 70, base);
      c.fillStyle = "rgba(255,255,255,0.13)"; c.fillRect(70, y + h - 3, 940, 3);
      y += h;
    });
  }
  if (d.tie) { const tl = d.up(d.tr("ecTied", "")); k.setFont(c, 600, 24, F_MONO); c.fillStyle = PEACH; k.spaced(c, tl, 540, 190 + 0.0, 2, "center"); }
  footer(c, k, d);
  return cv;
}

export default {
  games: ["fivesec"],
  fonts: ["400 100px \"GTR Anton\"", "700 50px \"Space Grotesk\"", "700 28px \"Space Grotesk\"", "800 52px \"Baloo 2\"", "600 26px \"GTR Mono\""],
  texts: (d) => [d.up(d.gameLabel), d.tr("fiveSecScoreLabel", ""), d.up(d.tr("ecTied", "")), "0123456789", d.date],
  render(d, k) {
    const parts = k.chunks(d.rows, k.ONE_PAGE, 12);
    const out = [page1(d, k, parts[0])];
    const sty = { bg: (c) => bg(c, k), ink: INK, sub: PEACH, acc: ORG, line: "rgba(255,255,255,0.15)", fam: F_SPACE, logo: ORG, titleFam: k.F_ANTON, titleCase: true, subFam: F_MONO,
      rowFill: "#2A1B0D", rowEdge: "rgba(255,150,64,0.35)", rowFillWin: "#2A1B0D" };
    parts.slice(1).forEach((p, i) => out.push(k.continuationPage(d, p, i + 2, parts.length, sty)));
    return out;
  },
};
