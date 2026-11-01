// Ergebnisbild Romme (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/romme.png): gruener Filz, Karten als Dekoration (Reihen und Saetze, keine echten Haende).
// Daten: Rang und Minuspunkte (gtEcModel, weniger ist besser). Zusatz (shareExtra aus Romme): {rounds, target}. Fehlt rounds, fehlt die Zeile.
import { card } from "./cards.js";
import { breakHy, unHy, setI } from "./util.js";

const GOLD = "#E8D8A8", F_FRAU = '"Fraunces","Inter","GT Clean","GT CJK",serif';
const FIRST_CAP = 6;
/* Dekorkarten: [x, y, Drehung, Wert, Farbe] (Karte 150 x 210). Nur Zahlenwerte, damit nichts sprachabhaengig ist. */
const DECO = [
  [50, 370, -2.0, "5", "heart"], [145, 374, -0.8, "6", "heart"], [240, 370, 0.4, "7", "heart"], [335, 374, 1.6, "8", "heart"],
  [560, 372, 2.0, "9", "spade"], [655, 376, 3.2, "9", "heart"], [750, 372, 4.4, "9", "club"],
  [50, 610, 1.0, "2", "club"], [145, 614, 2.2, "3", "club"], [240, 610, 3.4, "4", "club"], [335, 614, 4.6, "5", "club"],
  [560, 612, 1.0, "3", "diamond"], [655, 616, 2.2, "4", "diamond"], [750, 612, 3.4, "5", "diamond"],
  [100, 880, -11, "5", "diamond"], [270, 870, 7, "7", "club"],
];
function bg(c, k) {
  c.fillStyle = "#0B3B25"; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  k.cssEllipse(c, 0, 0, k.TPL_W, k.TPL_H, 540, 540, [[0, "#17663F"], [0.75, "#0B3B25"], [1, "#0B3B25"]]);
  c.strokeStyle = "rgba(232,216,168,0.33)"; c.lineWidth = 4; k.rrect(c, 28, 28, 1024, 1294, 40); c.stroke();
}
function footer(c, k, d) {
  const lw = k.logo(c, d.logo, 60, 1210, 100, GOLD);
  const x = 60 + lw + 20;
  k.setFont(c, 800, 52, k.F_BALOO); c.fillStyle = GOLD; c.fillText("GameTab", x, 1252);
  const f = k.fit(c, d.date, { w: 700, fam: k.F_BALOO, max: 26, min: 18, maxW: 1020 - x });
  k.setFont(c, 700, f.size, k.F_BALOO); c.globalAlpha = 0.9; c.fillText(f.lines[0], x, 1293); c.globalAlpha = 1;
}
function page1(d, k, rows, rounds, target) {
  const { cv, c } = k.tplCanvas();
  bg(c, k);
  // Titel
  const tf = k.fit(c, d.gameLabel, { w: 700, fam: F_FRAU, max: 112, min: 56, maxW: 700, lines: 1 });
  setI(c, 700, tf.size, F_FRAU); c.fillStyle = GOLD; c.fillText(tf.lines[0], 64, k.cssBase(c, 26, tf.size * 1.1));
  // Wert rechts, Name links
  const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
  const val = win[0].value;
  k.setFont(c, 400, 160, k.F_ANTON); const vw = c.measureText(val).width;
  const lab = d.tr("tplRmPts", "Minuspunkte");
  const lf = k.fit(c, lab, { w: 700, fam: F_FRAU, max: 44, min: 22, maxW: 400, lines: 1 });
  const rw = Math.max(vw, 0);
  c.fillStyle = GOLD; c.textAlign = "right"; k.setFont(c, 400, 160, k.F_ANTON); c.fillText(val, 1016, 150 + k.capH(c) + 8);
  k.setFont(c, 700, lf.size, F_FRAU); c.fillText(lf.lines[0], 1016, 150 + 160 + 36); c.textAlign = "left";
  const name = d.up(win.map((r) => r.name).join(" & "));
  const nW = 1016 - 60 - Math.max(rw, c.measureText(lf.lines[0]).width) - 40;
  const fo = { w: 400, fam: k.F_ANTON, maxW: Math.max(300, nW) };
  let nf = k.fit(c, name, Object.assign({ max: 160, min: 90, lines: 1 }, fo));
  if (nf.cut) { nf = k.fit(c, breakHy(name), Object.assign({ max: 112, min: 54, lines: 2 }, fo)); nf.lines = unHy(nf.lines); }
  if (nf.cut) { nf = k.fit(c, breakHy(name), Object.assign({ max: 72, min: 34, lines: 3 }, fo)); nf.lines = unHy(nf.lines); }
  k.setFont(c, 400, nf.size, k.F_ANTON); c.fillStyle = "#fff"; const cap = k.capH(c);
  nf.lines.forEach((ln, i) => c.fillText(ln, 60, 150 + cap + 8 + i * (cap + nf.size * 0.24)));
  if (d.tie) { const tl = k.fit(c, d.tr("ecTied", ""), { w: 700, fam: F_FRAU, max: 32, min: 18, maxW: 560, lines: 1 }); setI(c, 700, tl.size, F_FRAU); c.fillStyle = GOLD; c.textAlign = "right"; c.fillText(tl.lines[0], 1016, 96); c.textAlign = "left"; }
  // Karten
  DECO.forEach(([x, y, r, rank, s]) => card(c, k, x, y, 150, { rank, suit: s, rot: r, fam: F_FRAU }));
  if (rounds != null) {
    const txt = d.tr("tplRmSub", (n) => n + "")(rounds, target);
    const sf = k.fit(c, txt, { w: 700, fam: F_FRAU, max: 36, min: 20, maxW: 440, lines: 1 });
    setI(c, 600, sf.size, F_FRAU); c.fillStyle = GOLD; c.fillText(sf.lines[0], 70, 1166);
  }
  // Tabelle rechts
  const n = rows.length, pitch = Math.min(91, (1190 - 884) / n), fs = Math.min(70, pitch * 0.74);
  const lf2 = k.fit(c, lab, { w: 700, fam: F_FRAU, max: 34, min: 20, maxW: 440, lines: 1 });
  k.setFont(c, 700, lf2.size, F_FRAU); c.fillStyle = GOLD; c.fillText(lf2.lines[0], 560, 868);
  // Namen: eine Zeile, sonst bis 2 Zeilen (nie unter 24 px). Zeilen mit Umbruch werden hoeher, kurze Zeilen rutschen etwas zusammen.
  const AV = 1200 - 884;
  const fits = rows.map((r) => {
    k.setFont(c, 400, fs, k.F_ANTON);
    return k.nameFit(c, r.name, { w: 400, fam: k.F_ANTON, max: fs, maxW: 456 - c.measureText(r.value).width - 24, max2: Math.max(24, (pitch - 6) / 2.2) });
  });
  const need = fits.map((f) => (f.lines.length > 1 ? f.lines.length * f.size * 1.08 + 12 : 0));
  const tall = need.filter((v) => v > pitch);
  const basePitch = tall.length ? Math.max(42, Math.min(pitch, (AV - tall.reduce((a2, v) => a2 + v, 0)) / Math.max(1, n - tall.length))) : pitch;
  let yy = 884;
  rows.forEach((r, i) => {
    const f = fits[i], ph = Math.max(basePitch, need[i]), y = yy; yy += ph;
    c.fillStyle = "rgba(232,216,168,0.33)"; c.fillRect(560, y + ph - 3, 456, 3);
    c.fillStyle = r.winner ? GOLD : "#fff"; k.setFont(c, 400, fs, k.F_ANTON); c.textAlign = "right"; c.fillText(r.value, 1016, y + ph / 2 + k.capH(c) / 2);
    c.textAlign = "left"; k.setFont(c, 400, f.size, k.F_ANTON);
    const lh = f.size * 1.08, cp = k.capH(c);
    f.lines.forEach((ln, q) => c.fillText(ln, 560, y + ph / 2 - ((f.lines.length - 1) * lh) / 2 + q * lh + cp / 2));
  });
  footer(c, k, d);
  return cv;
}

export default {
  games: ["romme"],
  fonts: ["400 100px \"GTR Anton\"", "italic 700 112px Fraunces", "700 44px Fraunces", "600 36px Fraunces", "800 52px \"Baloo 2\"", "700 26px \"Baloo 2\""],
  texts: (d) => [d.tr("ecTied", ""), d.tr("tplRmPts", ""), d.tr("tplRmSub", (n) => n)(0, 0), "0123456789"],
  accepts: (d) => d.rows.length > 0 && d.rows.length <= 6 && d.rows.every((r) => r.score != null),
  render(d, k) {
    const ex = d.extra || {};
    const rounds = ex.rounds != null && isFinite(Number(ex.rounds)) ? Number(ex.rounds) : null;
    const target = ex.target != null && isFinite(Number(ex.target)) ? Number(ex.target) : null;
    return [page1(d, k, d.rows.slice(0, FIRST_CAP), rounds != null && target != null ? rounds : null, target)];
  },
};
