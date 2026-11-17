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

/* ---------- Ryū-Fassung: Abstimmungs-Sticker mit Pfeilen ----------
   Roter Grund, Liebling der Runde auf grossem Creme-Sticker mit Häkchen-Zacke, jede Stimmenzahl als Pfeil-Balken
   (Sieger rot, übrige schwarz). Gleiche Seitenaufteilung wie render(). */
function ryuArrow(c, R, x, y, w, h, fill) {
  const hd = Math.min(h * 0.7, w), b = Math.max(0, w - hd);
  const path = (dx, dy) => { c.beginPath(); c.moveTo(x + dx, y + h * 0.16 + dy); c.lineTo(x + b + dx, y + h * 0.16 + dy); c.lineTo(x + b + dx, y + dy); c.lineTo(x + w + dx, y + h / 2 + dy); c.lineTo(x + b + dx, y + h + dy); c.lineTo(x + b + dx, y + h * 0.84 + dy); c.lineTo(x + dx, y + h * 0.84 + dy); c.closePath(); };
  c.lineJoin = "round"; path(4, 4); c.fillStyle = R.INK; c.fill();
  path(0, 0); c.fillStyle = fill; c.fill(); c.lineWidth = 4; c.strokeStyle = R.INK; c.stroke();
}
function ryuMlPage(d, k, R, cont) {
  const { cv, c } = k.tplCanvas(); R.bg(c, R.RED, cont ? 3613 + cont.no : 3607);
  R.dots(c, 600, 0, 480, 330, 26, 4.2, "rgba(26,23,22,0.18)");
  const rows = d.rows.map((r) => ({ name: r.name, v: r.score == null ? 0 : r.score, rank: r.rank, winner: r.winner }));
  const total = rows.reduce((a, r) => a + r.v, 0), maxV = Math.max(1, ...rows.map((r) => r.v));
  const winners = rows.filter((r) => r.winner), tie = winners.length > 1;
  const first = cont ? rows.slice(cont.from, cont.from + PER_CONT) : rows.slice(0, firstCap(rows.length));
  /* Titel */
  c.save(); c.translate(60, 165); c.rotate(-4 * Math.PI / 180);
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: R.F_BAGEL, max: 124, min: 56, maxW: 700, lines: 1 });
  R.pop(c, tf.lines[0], 0, 0, tf.size, { sh: tf.size * 0.08 });
  /* kleine Zeile: Fortsetzung / Seitenzahl bzw. Summe */
  const pgf = d.tr("ecPage", (x, y2) => x + "/" + y2);
  const small = cont ? d.up(d.tr("tplMlCont", "Fortsetzung")) + "  " + (typeof pgf === "function" ? pgf(cont.no, cont.count) : cont.no + "/" + cont.count) : d.tr("tplMlFoot", (v, p) => v + ", " + p)(total, rows.length);
  const sf = k.fit(c, small, { w: 400, fam: R.F_BAGEL, max: 38, min: 22, maxW: 640, lines: 1 });
  k.setFont(c, 400, sf.size, R.F_BAGEL); const sw = c.measureText(sf.lines[0]).width + 52, sh = sf.size + 28;
  R.sticker(c, 6, 34, sw, sh, { r: sh / 2, fill: R.INK, sh: 6, lw: 0 });
  k.setFont(c, 400, sf.size, R.F_BAGEL); c.fillStyle = R.CR; c.fillText(sf.lines[0], 32, 34 + sh / 2 + sf.size * 0.35);
  c.restore();
  let top = cont ? 330 : 330;
  if (!cont) {
    /* Liebling der Runde */
    const many = first.length > 7, hh = many ? 176 : 270, hx = 60, hw = 960, hy = top + (many ? 14 : 36);
    const nm = winners.map((r) => r.name).join(" & ");
    const lbT = d.up(d.tr(tie ? "tplMlTie" : "tplMlFav", "Liebling der Runde"));
    R.sticker(c, hx, hy, hw, hh, { r: 30, rot: -1.5, sh: 12, lw: 6 });
    R.rot(c, hx, hy, hw, hh, -1.5, () => {
      R.zig(c, 112, hh / 2 + 6, many ? 66 : 84, { fill: R.RED, n: 18, sh: 6, lw: 5 });
      c.save(); c.strokeStyle = R.CR; c.lineWidth = many ? 12 : 15; c.lineCap = "round"; c.lineJoin = "round"; const q = many ? 26 : 32;
      c.beginPath(); c.moveTo(112 - q, hh / 2 + 6); c.lineTo(112 - q * 0.25, hh / 2 + 6 + q * 0.75); c.lineTo(112 + q, hh / 2 + 6 - q * 0.8); c.stroke(); c.restore();
      const nxx = 112 + (many ? 66 : 84) + 28, tw = hw - nxx - 36;
      const lf = k.fit(c, lbT, { w: 400, fam: R.F_BAGEL, max: 34, min: 20, maxW: tw, lines: 1 });
      const wf = k.heroFit(c, d.clean(nm), { w: 400, fam: R.F_BAGEL, maxW: tw }, [{ max: many ? 90 : 120, min: 50, lines: 1 }, { max: many ? 68 : 90, min: 40, lines: 2 }, { max: 52, min: 28, lines: 3 }, { max: 36, min: 24, lines: 4 }]);
      const wlh = wf.size * 1.03, th = lf.size * 1.4 + wlh * wf.lines.length; let yy = (hh - th) / 2;
      k.setFont(c, 400, lf.size, R.F_BAGEL); c.fillStyle = R.RED2; c.fillText(lf.lines[0], nxx, yy + lf.size * 0.95); yy += lf.size * 1.4;
      k.setFont(c, 400, wf.size, R.F_BAGEL); c.fillStyle = R.INK; wf.lines.forEach((ln, i) => c.fillText(ln, nxx, yy + wf.size * 0.82 + i * wlh));
    });
    top = hy + hh + (many ? 24 : 34);
  }
  /* Pfeil-Balken */
  const bottom = 1176, n = first.length, pitch = Math.min(cont ? 100 : (n <= 4 ? 170 : n <= 6 ? 130 : 112), (bottom - top) / n), rh = pitch - 12;
  const y00 = top + (cont ? Math.max(0, ((bottom - top) - pitch * n) * 0.25) : 0);
  const nfs = Math.min(n <= 4 && !cont ? 70 : 54, rh * 0.5), vfs = Math.min(n <= 4 && !cont ? 80 : 62, rh * 0.58);
  k.setFont(c, 400, nfs, R.F_BAGEL);
  let nameW = 160; first.forEach((r) => { nameW = Math.max(nameW, Math.min(330, c.measureText(r.name).width + 10)); });
  k.setFont(c, 400, vfs, R.F_BAGEL); const vW = Math.max(...first.map((r) => c.measureText(String(r.v)).width)) + 30;
  const barX = 60 + 24 + nameW + 18, barMax = 1020 - 24 - vW - barX;
  first.forEach((r, i) => {
    const y = y00 + i * pitch;
    R.sticker(c, 60, y, 960, rh, { r: Math.min(20, rh * 0.3), rot: 0, sh: 6, lw: 3.5, fill: r.winner ? R.CR : R.CR2 });
    const nf = k.nameFit(c, r.name, { w: 400, fam: R.F_BAGEL, max: nfs, maxW: nameW, lines: 2, max2: Math.max(24, Math.min(nfs, (rh - 8) / 2.1)) });
    const nlh = nf.size * 1.04; k.setFont(c, 400, nf.size, R.F_BAGEL); c.fillStyle = R.INK;
    nf.lines.forEach((ln, q) => c.fillText(ln, 84, y + rh / 2 - ((nf.lines.length - 1) * nlh) / 2 + q * nlh + nf.size * 0.35));
    const bh = Math.max(24, rh * 0.62), by = y + (rh - bh) / 2;
    if (r.v > 0) ryuArrow(c, R, barX, by, Math.max(bh, (r.v / maxV) * barMax), bh, r.winner ? R.RED : R.INK);
    else { c.fillStyle = R.INK; R.rr(c, barX, y + rh / 2 - 4, 40, 8, 4); c.fill(); }
    k.setFont(c, 400, vfs, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = "right"; c.fillText(String(r.v), 1020 - 24, y + rh / 2 + vfs * 0.35); c.textAlign = "left";
  });
  R.footer(c, k, d);
  return cv;
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
  renderRyu(d, k, R) {
    const out = [ryuMlPage(d, k, R)];
    const rest = d.rows.length - firstCap(d.rows.length);
    const nCont = rest > 0 ? Math.ceil(rest / PER_CONT) : 0;
    for (let i = 0; i < nCont; i++) out.push(ryuMlPage(d, k, R, { from: firstCap(d.rows.length) + i * PER_CONT, no: i + 2, count: nCont + 1 }));
    return out;
  },
};
