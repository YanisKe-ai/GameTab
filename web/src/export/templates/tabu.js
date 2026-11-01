// Ergebnisbild Tabu (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/tabu.png): Tabu-Karte "Pokal" mit durchgestrichenen Woertern, roter Buzzer, Teamtafeln.
// Daten: Teamname, Rang und Punkte (gtEcModel). Die Teammitglieder speichert das Spiel nicht, darum zeigt das Bild sie nicht.
// Das Kartenwort und die verbotenen Woerter sind Dekoration (Text tplTbCard je Sprache: [Pokal, 4 Woerter]).
import { breakHy, unHy } from "./util.js";

const YEL = "#FFC93C", INK = "#111111", RED = "#D4202C";
const FIRST_CAP = 6;

function card(c, k, words, cx, cy, sc) {
  c.save(); c.translate(cx, cy); c.rotate(-2.5 * Math.PI / 180); c.scale(sc, sc); c.translate(-410, -360);
  // Schatten, Rand, Flaeche (820 x 720, Rand 10 innen)
  c.fillStyle = INK; k.rrect(c, 14, 16, 820, 720, 30); c.fill();
  c.fillStyle = INK; k.rrect(c, 0, 0, 820, 720, 30); c.fill();
  c.fillStyle = "#fff"; k.rrect(c, 10, 10, 800, 700, 20); c.fill();
  c.save(); k.rrect(c, 10, 10, 800, 700, 20); c.clip();
  c.fillStyle = INK; c.fillRect(10, 10, 800, 190);
  const tf = k.fit(c, "TABU", { w: 400, fam: k.F_ANTON, max: 160, min: 80, maxW: 700, lines: 1, ls: 0.04 });
  k.setFont(c, 400, tf.size, k.F_ANTON); c.fillStyle = YEL; k.spaced(c, "TABU", 410, 10 + 100 + k.capH(c) / 2, tf.size * 0.04, "center");
  words.forEach((w, i) => {
    const y = 200 + i * 92;
    if (i === 0) { c.fillStyle = YEL; c.fillRect(80, y, 660, 92); }
    else { c.fillStyle = "rgba(17,17,17,0.13)"; c.fillRect(80, y + 89, 660, 3); }
    const fam = i === 0 ? k.F_ANTON : k.F_BALOO;
    const f = k.fit(c, d_up(w, i), { w: i === 0 ? 400 : 800, fam, max: i === 0 ? 84 : 64, min: 30, maxW: 600, lines: 1, ls: i === 0 ? 0.06 : 0 });
    k.setFont(c, i === 0 ? 400 : 800, f.size, fam); c.fillStyle = INK; c.textAlign = "center";
    const cy2 = y + 46 + k.capH(c) / 2 + (i === 0 ? 0 : 3);
    if (i === 0) k.spaced(c, f.lines[0], 410, cy2, f.size * 0.06, "center"); else c.fillText(f.lines[0], 410, cy2);
    c.textAlign = "left";
    if (i > 0) { c.save(); c.translate(410, y + 48); c.rotate(-1.5 * Math.PI / 180); c.fillStyle = RED; c.fillRect(-0.38 * 660, -4.5, 0.76 * 660, 9); c.restore(); }
  });
  c.restore(); c.restore();
}
function d_up(w) { return String(w); }
/* Roter Buzzer: x, y = Mitte der Grundflaeche, Breite w */
function buzzer(c, x, y, w) {
  const s = w / 230;
  c.save(); c.translate(x, y); c.scale(s, s);
  const ell = (cx, cy, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, 7); c.fill(); };
  c.fillStyle = "#171717"; c.fillRect(-115, -4, 230, 50); ell(0, 46, 115, 44, "#171717");
  ell(0, -4, 115, 44, "#555555");
  c.fillStyle = INK; c.fillRect(-85, -60, 170, 54); ell(0, -6, 85, 36, INK);
  c.fillStyle = "#D61F26"; c.fillRect(-85, -108, 170, 48); ell(0, -60, 85, 36, "#D61F26");
  ell(0, -108, 85, 40, "#EE4A50");
  c.restore();
}
function footer(c, k, d) {
  const lw = k.logo(c, d.logo, 80, 1216, 96, INK);
  k.setFont(c, 800, 50, k.F_BALOO); c.fillStyle = INK; c.fillText("GameTab", 80 + lw + 22, 1216 + 96 / 2 + k.capH(c) / 2);
  const parts = d.date.indexOf(",") > 0 ? [d.date.slice(0, d.date.indexOf(",")), d.date.slice(d.date.indexOf(",") + 1).trim()] : [d.date];
  const room = 1010 - (80 + lw + 22 + 260);
  const f = k.fit(c, parts.reduce((a, b) => (a.length > b.length ? a : b), ""), { w: 600, fam: k.F_INTER, max: 24, min: 14, maxW: room, lines: 1 });
  k.setFont(c, 600, f.size, k.F_INTER); c.textAlign = "right";
  parts.forEach((ln, i) => c.fillText(ln, 1010, 1264 - (parts.length - 1) * f.size * 0.65 + i * f.size * 1.3));
  c.textAlign = "left";
}
function board(c, k, d, rows, top, pitch) {
  const h = pitch - 18, big = h >= 120;
  rows.forEach((r, i) => {
    const y = top + i * pitch, dark = r.winner;
    if (dark) { c.fillStyle = INK; k.rrect(c, 80, y, 620, h, 22); c.fill(); }
    else { c.fillStyle = INK; k.rrect(c, 80, y, 620, h, 22); c.fill(); c.fillStyle = "#fff"; k.rrect(c, 88, y + 8, 604, h - 16, 15); c.fill(); }
    const ink = dark ? YEL : INK;
    const ss = Math.min(110, h * 0.78);
    k.setFont(c, 400, ss, k.F_ANTON); const vw = c.measureText(r.value).width; const cap = k.capH(c);
    c.fillStyle = ink; c.textAlign = "right"; c.fillText(r.value, 664, y + h / 2 + cap / 2); c.textAlign = "left";
    const ns = Math.min(60, h * 0.5), nw = 620 - 36 - 28 - vw - 20;
    let f = k.fit(c, r.name, { w: 400, fam: k.F_ANTON, max: ns, min: ns * 0.6, maxW: nw, lines: 1 });
    if (f.cut) { f = k.fit(c, breakHy(r.name), { w: 400, fam: k.F_ANTON, max: Math.min(ns * 0.8, (h - 20) / 2.1), min: 14, maxW: nw, lines: 2 }); f.lines = unHy(f.lines); }
    if (f.cut) { f = k.fit(c, breakHy(r.name), { w: 400, fam: k.F_ANTON, max: (h - 14) / 3.2, min: 12, maxW: nw, lines: big ? 3 : 2 }); f.lines = unHy(f.lines); }
    k.setFont(c, 400, f.size, k.F_ANTON); c.fillStyle = ink;
    const lh = f.size * 1.08, cp = k.capH(c);
    f.lines.forEach((ln, q) => c.fillText(ln, 116, y + h / 2 - ((f.lines.length - 1) * lh) / 2 + q * lh + cp / 2));
  });
}
function page1(d, k, rows, wordsArr) {
  const { cv, c } = k.tplCanvas();
  c.fillStyle = YEL; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  const n = rows.length, many = n > 3;
  if (many) { card(c, k, wordsArr, 540, 70 + 360 * 0.62, 0.62); buzzer(c, 885, 700, 230); }
  else { card(c, k, wordsArr, 540, 430, 1); buzzer(c, 885, 935, 230); }
  const top = many ? 590 : 830, pitch = Math.min(158, (1196 - top) / n);
  board(c, k, d, rows, top, pitch);
  footer(c, k, d);
  return cv;
}

export default {
  games: ["tabu"],
  fonts: ["400 160px \"GTR Anton\"", "800 64px \"Baloo 2\"", "800 50px \"Baloo 2\"", "600 24px Inter"],
  texts: (d) => { const w = d.tr("tplTbCard", []); return [].concat(Array.isArray(w) ? w : [], "TABU0123456789"); },
  accepts: (d) => d.rows.length > 0 && d.rows.length <= 6,
  render(d, k) {
    const w = d.tr("tplTbCard", ["Pokal", "Gewinner", "Meister", "Preis", "Sieg"]);
    const words = Array.isArray(w) && w.length >= 5 ? w.slice(0, 5) : ["Pokal", "Gewinner", "Meister", "Preis", "Sieg"];
    return [page1(d, k, d.rows.slice(0, FIRST_CAP), words)];
  },
};
