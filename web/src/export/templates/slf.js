// Ergebnisbild Stadt Land Fluss (neue Vorlage, gleicher Aufbau wie Molotow, siehe molotow.js).
// Daten: nur gtEcModel (Raenge, Gleichstand, Punkte). Das Spiel meldet je Handy Name und Punkte, mehr Zusatzdaten gibt es nicht.
import { makeListTemplate } from "./molotow.js";

/* Deko Ryū: Antwortblatt (schraeg) mit leeren Kategorienspalten und grossem Fragezeichen-Zackensticker, nur Rot, Schwarz, Creme */
function slfDeco(c, R) {
  c.save(); c.translate(870, 205); c.rotate(8 * Math.PI / 180);
  const w = 300, h = 370;
  c.fillStyle = R.INK; R.rr(c, -w / 2 + 14, -h / 2 + 14, w, h, 18); c.fill();
  c.fillStyle = R.CR; R.rr(c, -w / 2, -h / 2, w, h, 18); c.fill(); c.lineWidth = 6; c.strokeStyle = R.INK; R.rr(c, -w / 2, -h / 2, w, h, 18); c.stroke();
  const cw = (w - 40) / 3;
  for (let i = 0; i < 3; i++) { c.fillStyle = i === 1 ? R.RED : R.INK; R.rr(c, -w / 2 + 20 + i * cw + 3, -h / 2 + 24, cw - 6, 34, 10); c.fill(); }
  c.strokeStyle = R.CR3; c.lineWidth = 3;
  for (let y = -h / 2 + 90; y < h / 2 - 20; y += 44) { c.beginPath(); c.moveTo(-w / 2 + 20, y); c.lineTo(w / 2 - 20, y); c.stroke(); }
  for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(-w / 2 + 20 + i * cw, -h / 2 + 70); c.lineTo(-w / 2 + 20 + i * cw, h / 2 - 20); c.stroke(); }
  c.restore();
  R.zig(c, 700, 330, 82, { fill: R.CR, n: 20, sh: 8, lw: 5 });
  R.pop(c, "?", 700, 362, 108, { align: "center", fill: R.RED, sh: 6, sw: 9 });
}

export default makeListTemplate({ id: "slf", acc: "#8B6CFF", bgFrom: "#201A3A", bgTo: "#0B0914", ink: "#EFEBFF", winInk: "#150E33", seed: 7701, deco: slfDeco });
