// Ergebnisbild Werwolf (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/werwolf.png).
// Daten (shareExtra): {winner:"dorf"|"wolf"|"lovers", players:[{name, role (Rollenname in App-Sprache), team:"wolf"|"dorf", alive:bool, lover:bool}]}
// Rollen und lebt/tot stehen erst im Bild (nach Spielende). Bis 18 Spielende: Szene schrumpft, Raster passt sich an.
import { F_MONO, F_FRAUNCES, footer, fitWords, FONTS_BASE } from "./party-kit.js";

const RED = "#D9384A", CREAM = "#f4ecdd";

function pickGrid(N, W, H, gap) {
  const cols = N <= 4 ? N : N <= 8 ? 4 : 3, rows = Math.ceil(N / cols);
  return { cols, rows, w: (W - gap * (cols - 1)) / cols, h: Math.min(124, (H - gap * (rows - 1)) / rows) };
}

function render(d, k) {
  const { cv, c } = k.tplCanvas();
  const ex = d.extra, P = ex.players, N = P.length;
  const sc = N <= 8 ? 1 : N <= 12 ? 0.62 : 0.44;
  // Himmel
  const g = c.createLinearGradient(0, 0, 0, 1350); g.addColorStop(0, "#0a1030"); g.addColorStop(0.55, "#1a1b3f"); g.addColorStop(1, "#2a1a33");
  c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
  // Mond und Wolf (Entwurf-Koordinaten, Ursprung oben Mitte des Mondes)
  c.save(); c.translate(540, 200); c.scale(sc, sc);
  const mx = 0, my = 270, R = 270;
  [[R + 60, "rgba(255,255,255,0.03)"], [R + 22, "rgba(255,255,255,0.05)"]].forEach(([r, col]) => { c.fillStyle = col; c.beginPath(); c.arc(mx, my, r, 0, 7); c.fill(); });
  c.save(); c.beginPath(); c.arc(mx, my, R, 0, 7); c.clip();
  const fx = -270 + 0.36 * 540, fy = 0.34 * 540, far = Math.hypot(270 + 270 - 0.36 * 540 + 0, 540 - 0.34 * 540 + 0);
  const mg = c.createRadialGradient(fx, fy, 0, fx, fy, Math.hypot(Math.max(fx + 270, 270 - fx), Math.max(fy, 540 - fy)));
  mg.addColorStop(0, "#fffaf0"); mg.addColorStop(0.55, "#efe4cc"); mg.addColorStop(1, "#d4c6a6"); c.fillStyle = mg; c.fillRect(-270, 0, 540, 540);
  c.fillStyle = "rgba(0,0,0,0.078)";
  [[-170, 180, 50], [115, 105, 35], [170, 410, 70]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); });
  c.restore(); void far;
  // Wolf
  c.save(); c.translate(125 - 270, 210); const ws = 290 / 360; c.scale(ws, ws);
  c.fillStyle = "#0a0b16"; c.beginPath();
  [[0, 330], [10, 250], [60, 215], [95, 140], [110, 40], [145, 120], [185, 110], [225, 120], [255, 40], [268, 145], [305, 215], [350, 250], [360, 330]].forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
  c.fillStyle = RED; c.beginPath(); c.moveTo(135, 195); c.lineTo(165, 215); c.lineTo(150, 225); c.closePath(); c.moveTo(225, 195); c.lineTo(195, 215); c.lineTo(210, 225); c.closePath(); c.fill();
  c.restore(); c.restore();
  // Huegel
  c.fillStyle = "#05060d";
  [[0, 180, 1030, 1100], [170, 300, 980, 1070], [280, 480, 1060, 1120], [560, 730, 1010, 1090], [720, 870, 950, 1050], [860, 1080, 1050, 1110]].forEach(([a, b, peak, base]) => { c.beginPath(); c.moveTo(a, 1350); c.lineTo(a, base); c.lineTo((a + b) / 2, peak); c.lineTo(b, base); c.lineTo(b, 1350); c.closePath(); c.fill(); });
  c.fillRect(0, 1170, 1080, 180);
  // Titel
  const tf = k.fit(c, d.gameLabel, { w: 700, fam: F_FRAUNCES, max: 120, min: 56, maxW: 920 });
  k.setFont(c, 700, tf.size, F_FRAUNCES); c.fillStyle = CREAM; c.textAlign = "center";
  spacedC(c, k, tf.lines[0], 540, k.cssBase(c, 40, 120), 0.02 * tf.size);
  // Sieger
  const fb = ex.winner === "wolf" ? ["Die Werwoelfe", "haben gewonnen"] : ex.winner === "lovers" ? ["Das Liebespaar", "hat gewonnen"] : ["Das Dorf", "hat gewonnen"];
  const key = ex.winner === "wolf" ? "tplWerWinW" : ex.winner === "lovers" ? "tplWerWinL" : "tplWerWinV";
  const win = d.tr(key, fb), hs = sc >= 0.99 ? 96 : sc >= 0.6 ? 72 : 60, accent = ex.winner === "lovers" ? "#EE7B9B" : RED;
  const h1Top = 200 + 570 * sc;
  const fo = { w: 700, fam: F_FRAUNCES, max: hs, min: 40, maxW: 960 };
  const a1 = k.fit(c, win[0], fo), a2 = k.fit(c, win[1], fo), hz = Math.min(a1.size, a2.size);
  k.setFont(c, 700, hz, F_FRAUNCES); c.textAlign = "center";
  c.fillStyle = CREAM; c.fillText(a1.lines[0], 540, k.cssBase(c, h1Top, hz));
  c.fillStyle = accent; c.fillText(a2.lines[0], 540, k.cssBase(c, h1Top + hz, hz)); c.textAlign = "left";
  // Rollen-Raster
  const top = h1Top + 2 * hz + 22, H = 1196 - top, gap = N > 8 ? 8 : 16;
  const G = pickGrid(N, 940, H, gap);
  const alive = d.tr("tplPartyAlive", "lebt"), dead = d.tr("tplPartyDead", "tot"), lover = d.tr("tplWerLover", "verliebt");
  P.forEach((p, i) => {
    const row = Math.floor(i / G.cols), inRow = Math.min(G.cols, N - row * G.cols);
    const rowW = inRow * G.w + (inRow - 1) * gap, y = top + row * (G.h + gap);
    const xx = 540 - rowW / 2 + (i - row * G.cols) * (G.w + gap);
    const wolf = p.team === "wolf", hl = wolf ? RED : p.lover ? "#EE7B9B" : null;
    c.fillStyle = "rgba(5,6,13,0.8)"; k.rrect(c, xx, y, G.w, G.h, 18 * Math.min(1, G.h / 100)); c.fill();
    c.strokeStyle = hl || "rgba(255,255,255,0.13)"; c.lineWidth = 3; k.rrect(c, xx + 1.5, y + 1.5, G.w - 3, G.h - 3, 17 * Math.min(1, G.h / 100)); c.stroke();
    const nm = d.clean(p.name);
    const stat = [d.clean(p.role)].concat(p.lover ? [lover] : []).concat([p.alive ? alive : dead]).join(", ");
    let nf, rf, nlh, rlh, th, fac = 1;
    for (let it = 0; it < 14; it++) {
      const ns = Math.min(44, G.h * (N > 8 ? 0.34 : 0.4)) * fac, rs = Math.max(14, Math.min(24, G.h * 0.2) * fac);
      nf = fitWords(c, k, nm, { w: 700, fam: F_FRAUNCES, max: ns, min: Math.max(22, ns * 0.6), maxW: G.w - 20, lines: G.h > 70 ? 2 : 1 });
      k.setFont(c, 600, rs, F_MONO);
      rf = fitWords(c, k, stat, { w: 600, fam: F_MONO, max: rs, min: 14, maxW: G.w - 16, lines: 2 });
      nlh = nf.size * 1.08; rlh = rf.size * 1.2; th = nlh * nf.lines.length + 4 + rlh * rf.lines.length;
      if (th <= G.h - 8 || (nf.size <= 22 && rf.size <= 14)) break;
      fac *= 0.9;
    }
    let yy = y + (G.h - th) / 2;
    c.textAlign = "center";
    k.setFont(c, 700, nf.size, F_FRAUNCES); c.fillStyle = hl && wolf ? RED : p.lover ? "#EE7B9B" : CREAM; c.globalAlpha = p.alive ? 1 : 0.8;
    nf.lines.forEach((l) => { c.fillText(l, xx + G.w / 2, k.cssBase(c, yy, nlh)); yy += nlh; });
    yy += 4; k.setFont(c, 600, rf.size, F_MONO); c.fillStyle = "#cdbf9f";
    rf.lines.forEach((l) => { c.fillText(l, xx + G.w / 2, k.cssBase(c, yy, rlh)); yy += rlh; });
    c.globalAlpha = 1; c.textAlign = "left";
  });
  footer(c, k, d, CREAM, 34);
  return [cv];
}
function spacedC(c, k, text, cx, y, sp) { k.spaced(c, text, cx, y, sp, "center"); }

export default {
  games: ["werwolf"],
  fonts: ['700 100px "Fraunces"', '700 40px "Fraunces"'].concat(FONTS_BASE),
  accepts: (d) => !!(d.extra && Array.isArray(d.extra.players) && d.extra.players.length >= 2 && d.extra.winner),
  texts: (d) => (d.extra ? [d.extra.players.map((p) => p.name + " " + p.role).join(" "), ["tplWerWinV", "tplWerWinW", "tplWerWinL"].map((q) => [].concat(d.tr(q, [""])).join(" ")).join(" "), d.tr("tplPartyAlive", "") + d.tr("tplPartyDead", "") + d.tr("tplWerLover", "")] : []),
  render,
};
