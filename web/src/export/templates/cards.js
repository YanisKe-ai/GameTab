// Ergebnisbild: gezeichnete Spielkarten (franzoesische Farben) fuer Romme und Differenzler. Reine Dekoration (keine Spieldaten).
// Nutzt nur Canvas 2D, keine Schrift ausser der uebergebenen Familie.

const RED = "#C8102E", BLACK = "#1B1B1B", FACE = "#FBF6EA";
/* Pfade in einer 100 x 100 Box */
const PATHS = {
  heart: "M50 92 C8 58 0 38 0 24 C0 10 12 2 26 2 C38 2 46 9 50 18 C54 9 62 2 74 2 C88 2 100 10 100 24 C100 38 92 58 50 92Z",
  diamond: "M50 0 L92 50 L50 100 L8 50Z",
  spade: "M50 0 C86 34 100 54 100 68 C100 82 89 90 76 90 C65 90 56 84 52 75 C53 86 57 95 67 100 L33 100 C43 95 47 86 48 75 C44 84 35 90 24 90 C11 90 0 82 0 68 C0 54 14 34 50 0Z",
  club: "M50 56 C52 78 56 92 67 100 L33 100 C44 92 48 78 50 56Z M50 2 A24 24 0 1 1 50 50 A24 24 0 1 1 50 2Z M26 42 A24 24 0 1 1 26 90 A24 24 0 1 1 26 42Z M74 42 A24 24 0 1 1 74 90 A24 24 0 1 1 74 42Z",
};
const P2D = {};
function suitPath(s) { if (!P2D[s]) P2D[s] = new Path2D(PATHS[s]); return P2D[s]; }
const isRed = (s) => s === "heart" || s === "diamond";
/* Farbe s zeichnen: Mittelpunkt (cx, cy), Hoehe/Breite size */
function suit(c, s, cx, cy, size, color) {
  c.save(); c.translate(cx - size / 2, cy - size / 2); c.scale(size / 100, size / 100);
  c.fillStyle = color || (isRed(s) ? RED : BLACK); c.fill(suitPath(s)); c.restore();
}
/* Eine Karte: obere linke Ecke (x, y), Breite w, Hoehe h = w * 1.4, Drehung deg um die Mitte. fam: Schrift fuer den Wert */
function card(c, k, x, y, w, o) {
  const h = w * 1.4, s = o.suit, col = isRed(s) ? RED : BLACK;
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate((o.rot || 0) * Math.PI / 180); c.translate(-w / 2, -h / 2);
  if (o.shadow !== false) { c.fillStyle = "rgba(0,0,0,0.28)"; k.rrect(c, w * 0.04, w * 0.06, w, h, w * 0.08); c.fill(); }
  c.fillStyle = FACE; k.rrect(c, 0, 0, w, h, w * 0.08); c.fill();
  const fs = w * 0.2;
  k.setFont(c, 700, fs, o.fam); c.fillStyle = col; c.textAlign = "center";
  c.fillText(o.rank, w * 0.16, w * 0.2 + fs * 0.1);
  suit(c, s, w * 0.16, w * 0.2 + fs * 0.1 + w * 0.12, w * 0.13);
  c.save(); c.translate(w, h); c.rotate(Math.PI);
  c.fillText(o.rank, w * 0.16, w * 0.2 + fs * 0.1); suit(c, s, w * 0.16, w * 0.2 + fs * 0.1 + w * 0.12, w * 0.13); c.restore();
  c.textAlign = "left";
  if (o.big !== false) suit(c, s, w * 0.56, h * 0.5, w * 0.46);
  c.restore();
}
export { RED, BLACK, FACE, suit, card, isRed };
