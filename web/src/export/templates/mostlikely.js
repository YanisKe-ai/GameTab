// Ergebnisbild Am ehesten (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/amehesten.png).
// Daten: nur Namen und Stimmen (ranked.score = Stimmen). Die Frage wird im Spiel nicht gespeichert und fehlt darum im Bild.
// Seite 1: Liebling der Runde und bis zu 8 Balken; weitere Spielende folgen auf Folgeseiten.
import { footer, fitWords, FONTS_BASE } from "./party-kit.js";

const TEAL = "#2DD4BF", INK = "#10201f", DEEP = "#14766c", BG = "#0e2a28";
const firstCap = (n) => (n <= 10 ? n : 8), PER_CONT = 11;

function slipBg(c) { c.fillStyle = BG; c.fillRect(0, 0, 1080, 1350); }
function render(d, k, cont) {
  const { cv, c } = k.tplCanvas();
  slipBg(c);
  const rows = d.rows.map((r) => ({ name: r.name, v: r.score == null ? 0 : r.score, rank: r.rank, winner: r.winner }));
  const total = rows.reduce((a, r) => a + r.v, 0), maxV = Math.max(1, ...rows.map((r) => r.v));
  const winners = rows.filter((r) => r.winner), tie = winners.length > 1;
  const first = cont ? rows.slice(cont.from, cont.from + PER_CONT) : rows.slice(0, firstCap(rows.length));
  // Zettel
  c.save(); c.translate(540, 610); c.rotate(-1.2 * Math.PI / 180); c.translate(-460, -550);
  c.shadowColor = "rgba(0,0,0,0.53)"; c.shadowBlur = 50; c.shadowOffsetY = 24;
  c.fillStyle = "#F2F7F4"; k.rrect(c, 0, 0, 920, 1100, 14); c.fill(); c.shadowColor = "transparent";
  c.save(); k.rrect(c, 0, 0, 920, 1100, 14); c.clip(); c.fillStyle = BG;
  for (let x = 15; x < 940; x += 40) { c.beginPath(); c.arc(x, 0, 12, 0, 7); c.fill(); }
  c.restore();
  // Titelschild
  const tf = k.fit(c, d.gameLabel, { w: 800, fam: k.F_BALOO, max: 92, min: 40, maxW: 800 - 52 });
  k.setFont(c, 800, tf.size, k.F_BALOO);
  const tw = c.measureText(tf.lines[0]).width + 52;
  c.fillStyle = TEAL; k.rrect(c, 60, 56, tw, tf.size + 6, 14); c.fill();
  c.fillStyle = INK; c.fillText(tf.lines[0], 60 + 26, k.cssBase(c, 56 + 6, tf.size));
  let sepY;
  if (cont) {
    const cl = d.up(d.tr("tplMlCont", "Fortsetzung")), cf = k.fit(c, cl, { w: 800, fam: k.F_BALOO, max: 48, min: 24, maxW: 800 - 44 });
    k.setFont(c, 800, cf.size, k.F_BALOO);
    const cw = c.measureText(cf.lines[0]).width + 44, cy = 56 + tf.size + 6 + 28;
    c.fillStyle = TEAL; k.rrect(c, 60, cy, cw, cf.size * 1.25, 10); c.fill(); c.fillStyle = INK; c.fillText(cf.lines[0], 82, k.cssBase(c, cy, cf.size * 1.25));
    sepY = cy + cf.size * 1.25 + 30; c.fillStyle = "rgba(16,32,31,0.13)"; c.fillRect(60, sepY, 800, 4);
  } else {
  // Liebling
  const nm = winners.map((r) => r.name).join(" & ");
  const cmp = first.length > 7, wf = fitWords(c, k, nm, { w: 800, fam: k.F_BALOO, max: cmp ? 104 : 150, min: 44, floor: 28, maxW: 595, lines: 3 });
  const wlh = wf.size * (wf.lines.length > 1 ? 0.95 : 1);
  let y = 56 + tf.size + 6 + (first.length > 7 ? 24 : 36);
  k.setFont(c, 800, wf.size, k.F_BALOO); c.fillStyle = INK;
  wf.lines.forEach((ln, i) => c.fillText(ln, 60, k.cssBase(c, y + i * wlh, wlh)));
  const nameBottom = y + wlh * wf.lines.length;
  // Haken
  c.save(); const hs = cmp ? 1.0 : 1.5; c.translate(700 + 75, y + 50 * hs); c.scale(hs, hs); c.translate(-50, -50);
  c.strokeStyle = "#c0392b"; c.lineWidth = 6; c.beginPath(); c.arc(50, 50, 42, 0, 7); c.stroke();
  c.lineWidth = 10; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(28, 52); c.lineTo(45, 68); c.lineTo(74, 30); c.stroke(); c.restore();
  // Label
  const lbT = d.tr(tie ? "tplMlTie" : "tplMlFav", "Liebling der Runde");
  const lf = k.fit(c, lbT, { w: 800, fam: k.F_BALOO, max: 48, min: 24, maxW: 800 - 44 });
  k.setFont(c, 800, lf.size, k.F_BALOO);
  const lw = c.measureText(lf.lines[0]).width + 44, ly = nameBottom + 12;
  c.fillStyle = TEAL; k.rrect(c, 60, ly, lw, lf.size * 1.25, 10); c.fill();
  c.fillStyle = INK; c.fillText(lf.lines[0], 82, k.cssBase(c, ly, lf.size * 1.25));
  sepY = ly + lf.size * 1.25 + 34;
  c.fillStyle = "rgba(16,32,31,0.13)"; c.fillRect(60, sepY, 800, 4);
  }
  // Balken
  const rTop = sepY + 26, rBot = 1100 - 120, pitch = Math.min(160, (rBot - rTop) / first.length), rh = pitch * 0.85;
  const nfs = Math.min(56, rh * 0.58), vfs = Math.min(80, rh * 0.67);
  k.setFont(c, 800, nfs, k.F_BALOO);
  let nameW = 150; first.forEach((r) => { nameW = Math.max(nameW, Math.min(320, c.measureText(r.name).width + 20)); });
  const vW = (k.setFont(c, 800, vfs, k.F_BALOO), Math.max(...first.map((r) => c.measureText(String(r.v)).width)) + 20);
  const barX = 60 + nameW + 14, barMax = 860 - vW - barX, bh = rh * 0.7;
  first.forEach((r, i) => {
    const yy = rTop + i * pitch;
    const nf = fitWords(c, k, r.name, { w: 800, fam: k.F_BALOO, max: nfs, min: 14, maxW: nameW - 8, lines: 2 });
    const lh = nf.size * 1.0;
    k.setFont(c, 800, nf.size, k.F_BALOO); c.fillStyle = INK;
    nf.lines.forEach((ln, q) => c.fillText(ln, 60, k.cssBase(c, yy + (rh - lh * nf.lines.length) / 2 + q * lh, lh)));
    const bw = r.v > 0 ? Math.max(14, (r.v / maxV) * barMax) : 0, by = yy + (rh - bh) / 2;
    if (bw > 0) {
      c.fillStyle = r.winner ? TEAL : "#bfece6"; c.strokeStyle = INK; c.lineWidth = Math.max(2, 4 * rh / 120);
      const rr = Math.min(12, bh / 3);
      c.beginPath(); c.moveTo(barX, by); c.lineTo(barX + bw - rr, by); c.arcTo(barX + bw, by, barX + bw, by + rr, rr); c.lineTo(barX + bw, by + bh - rr); c.arcTo(barX + bw, by + bh, barX + bw - rr, by + bh, rr); c.lineTo(barX, by + bh); c.closePath(); c.fill(); c.stroke();
    } else { c.fillStyle = "rgba(16,32,31,0.25)"; c.fillRect(barX, by, 4, bh); }
    k.setFont(c, 800, vfs, k.F_BALOO); c.fillStyle = INK; c.textAlign = "right"; c.fillText(String(r.v), 860, k.cssBase(c, yy, rh)); c.textAlign = "left";
  });
  // Fuss
  const pgf = d.tr("ecPage", (x, y2) => x + "/" + y2), ft = cont ? (typeof pgf === "function" ? pgf(cont.no, cont.count) : cont.no + "/" + cont.count) : d.tr("tplMlFoot", (v, p) => v + ", " + p)(total, rows.length);
  const ff = k.fit(c, ft, { w: 600, fam: k.F_BALOO, max: 34, min: 18, maxW: 800 });
  k.setFont(c, 600, ff.size, k.F_BALOO); c.fillStyle = DEEP; c.fillText(ff.lines[0], 60, k.cssBase(c, 1100 - 90, 44));
  c.restore();
  footer(c, k, d, TEAL, 36);
  return [cv];
}

export default {
  games: ["mostlikely"],
  fonts: ['800 100px "Baloo 2"', '600 34px "Baloo 2"'].concat(FONTS_BASE),
  accepts: (d) => d.rows.length >= 2 && d.rows.reduce((a, r) => a + (r.score || 0), 0) > 0,
  texts: (d) => [d.tr("tplMlFav", "") + d.tr("tplMlTie", ""), "0123456789 &,", (() => { const f = d.tr("tplMlFoot", null); return typeof f === "function" ? f(1, 2) : ""; })()],
  render(d, k) {
    const out = render(d, k);
    const rest = d.rows.length - firstCap(d.rows.length);
    const nCont = rest > 0 ? Math.ceil(rest / PER_CONT) : 0;
    for (let i = 0; i < nCont; i++) out.push(render(d, k, { from: firstCap(d.rows.length) + i * PER_CONT, no: i + 2, count: nCont + 1 })[0]);
    return out;
  },
};
