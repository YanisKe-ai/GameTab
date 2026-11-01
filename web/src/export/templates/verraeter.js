// Ergebnisbild Verraeter (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/verraeter.png).
// Daten (shareExtra): {winner:"faithful"|"traitor", players:[{name, traitor:bool, alive:bool}]}
// Rollen stehen erst im Bild (nach Spielende). Bis 8 Spielende im Kreis um die Kerzen, darueber in Reihen im Tisch.
import { F_FRAUNCES, listJoin, footer, fitWords, FONTS_BASE } from "./party-kit.js";

const CREAM = "#f1e3c3", GOLD = "#E2B04A", RED2 = "#ff6b6b";
const FIT = (c, k, text, o) => k.fit(c, text, Object.assign({ w: 700, fam: F_FRAUNCES }, o));

function shield(c, x, y, s, traitor) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineWidth = 6; c.strokeStyle = GOLD; c.lineJoin = "miter";
  if (!traitor) {
    c.beginPath(); c.moveTo(0, 0); c.lineTo(120, 0); c.lineTo(120, 80); c.bezierCurveTo(120, 130, 70, 160, 60, 172); c.bezierCurveTo(50, 160, 0, 130, 0, 80); c.closePath();
    c.fillStyle = "#2a3a63"; c.fill(); c.stroke();
    c.fillStyle = "rgba(226,176,74,0.9)"; c.beginPath();
    [[60, 28], [72, 58], [104, 58], [78, 76], [88, 108], [60, 88], [32, 108], [42, 76], [16, 58], [48, 58]].forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b))); c.closePath(); c.fill();
  } else {
    c.save(); c.translate(-10, 0); c.rotate(-6 * Math.PI / 180);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(60, 0); c.lineTo(50, 40); c.lineTo(68, 75); c.lineTo(52, 110); c.lineTo(62, 172); c.lineTo(60, 172); c.bezierCurveTo(50, 160, 0, 130, 0, 80); c.closePath();
    c.fillStyle = "#8f1d27"; c.fill(); c.stroke(); c.restore();
    c.save(); c.translate(10, 4); c.rotate(7 * Math.PI / 180);
    c.beginPath(); c.moveTo(60, 0); c.lineTo(120, 0); c.lineTo(120, 80); c.bezierCurveTo(120, 130, 70, 160, 62, 172); c.lineTo(52, 110); c.lineTo(68, 75); c.lineTo(50, 40); c.closePath();
    c.fillStyle = "#8f1d27"; c.fill(); c.stroke(); c.restore();
  }
  c.restore();
}
function render(d, k) {
  const { cv, c } = k.tplCanvas();
  const ex = d.extra, P = ex.players, N = P.length, fw = ex.winner === "faithful";
  // Plan: Platz jedes Spielenden (Wappen, Name, Status). Runder Tisch nur, wenn sich nichts beruehrt, sonst Raster.
  const alive = d.tr("tplPartyAlive", "lebt"), dead = d.tr("tplPartyDead", "tot");
  const faith = d.tr("tplTrtFaithful", "treu"), trait = d.tr("tplTrtTraitor", "Verraeter");
  const makePlan = (mode, dr) => {
    const isRing = mode === "ring", place = [];
    if (isRing) {
      const s = N <= 4 ? 1 : N <= 6 ? 0.82 : 0.68, R = (N <= 4 ? 240 : N <= 6 ? 250 : 262) - (dr || 0);
      P.forEach((_, i) => { const a = (i / N) * Math.PI * 2 - Math.PI / 2; place.push({ cx: 540 + Math.cos(a) * R, cy: 705 + Math.sin(a) * R * 0.98, s, bw: 250 * s + 60 }); });
      if (N === 3) { place.length = 0; [-90, 30, 150].forEach((deg) => { const a = deg * Math.PI / 180; place.push({ cx: 540 + Math.cos(a) * (268 - (dr || 0)), cy: 705 + Math.sin(a) * (268 - (dr || 0)), s, bw: 270 }); }); }
    } else {
      const cols = N <= 9 ? 3 : 4, rows = Math.ceil(N / cols), cw = 800 / cols, ch = Math.min(250, 720 / rows), s = N <= 9 ? 0.66 : N <= 12 ? 0.6 : 0.5;
      P.forEach((_, i) => { const r = Math.floor(i / cols), inRow = Math.min(cols, N - r * cols), c0 = i - r * cols; place.push({ cx: 540 + (c0 - (inRow - 1) / 2) * cw, cy: 685 + (r - (rows - 1) / 2) * ch, s, bw: cw - 12 }); });
    }
    const items = P.map((p, i) => {
      const q = place[i], sh = 172 * q.s, sw = 120 * q.s;
      const nameSize = isRing ? 40 * Math.max(0.75, q.s) : N <= 9 ? 36 : N <= 12 ? 32 : 28, roleSize = isRing ? 30 * Math.max(0.75, q.s) : N <= 9 ? 26 : N <= 12 ? 22 : 20;
      const nf = fitWords(c, k, d.clean(p.name), { w: 700, fam: F_FRAUNCES, max: nameSize, min: 24, floor: 16, maxW: q.bw - 6, lines: 2 });
      const role = (p.traitor ? trait : faith) + ", " + (p.alive ? alive : dead);
      const rf = k.fit(c, role, { w: 500, fam: F_FRAUNCES, max: roleSize, min: 16, maxW: q.bw, lines: 2 });
      const nlh = nf.size * 1.06, rlh = rf.size * 1.12;
      const tot = sh + 16 + nlh * nf.lines.length + rlh * rf.lines.length, y0 = q.cy - tot / 2;
      k.setFont(c, 700, nf.size, F_FRAUNCES); let nw = 0, rw = 0;
      nf.lines.forEach((ln) => { nw = Math.max(nw, c.measureText(ln).width); });
      c.font = "italic 500 " + Math.round(rf.size * 10) / 10 + "px " + F_FRAUNCES;
      rf.lines.forEach((ln) => { rw = Math.max(rw, c.measureText(ln).width); });
      const ny = y0 + sh + 16, ry = ny + nlh * nf.lines.length;
      // Teile: Wappen, Name, Status (je eigenes Rechteck, genau so breit wie der Text)
      const parts = [{ x: q.cx - sw / 2, y: y0, w: sw, h: sh }, { x: q.cx - nw / 2, y: ny, w: nw, h: nlh * nf.lines.length }, { x: q.cx - rw / 2, y: ry, w: rw, h: rlh * rf.lines.length }];
      return { p, q, sh, sw, nf, rf, nlh, rlh, tot, y0, parts };
    });
    // Kollisionspruefung: kein Teil beruehrt ein Teil eines anderen Spielenden, und alle Teile liegen im Tisch
    let clash = false;
    for (let i = 0; i < items.length && !clash; i++) {
      items[i].parts.forEach((a, pi) => {
        if (isRing) [[a.x, a.y], [a.x + a.w, a.y], [a.x, a.y + a.h], [a.x + a.w, a.y + a.h]].forEach(([px, py]) => { if (Math.hypot(px - 540, py - 705) > (pi === 0 ? 412 : 402)) clash = true; });
        if (a.x < 60 || a.x + a.w > 1020) clash = true;
      });
      for (let j = i + 1; j < items.length && !clash; j++) {
        items[i].parts.forEach((a) => items[j].parts.forEach((b2) => { if (a.x < b2.x + b2.w + 10 && a.x + a.w + 10 > b2.x && a.y < b2.y + b2.h + 6 && a.y + a.h + 6 > b2.y) clash = true; }));
      }
    }
    return { items, clash };
  };
  let plan = null;
  if (N <= 8) for (const dr of [0, 14, 28, 42]) { plan = makePlan("ring", dr); if (!plan.clash) break; }
  const ring = !!plan && !plan.clash;
  if (!ring) plan = makePlan("grid");
  // Hintergrund und Tisch
  c.fillStyle = "#0d0705"; c.fillRect(0, 0, 1080, 1350);
  c.save(); c.translate(540, 702); c.scale(648, 810);
  const bg = c.createRadialGradient(0, 0, 0, 0, 0, 1); bg.addColorStop(0, "#7a3d12"); bg.addColorStop(0.45, "#2d1509"); bg.addColorStop(1, "#0d0705");
  c.fillStyle = bg; c.fillRect(-3, -3, 6, 6); c.restore();
  c.fillStyle = "#2b150c";
  if (ring) for (let i = 0; i < Math.max(6, Math.min(N, 12)); i++) {
    const n = Math.max(6, Math.min(N, 12)), a = (i / n) * Math.PI * 2 - Math.PI / 2;
    c.save(); c.translate(540 + Math.cos(a) * 410, 705 + Math.sin(a) * 410); c.rotate(a + Math.PI / 2); k.rrect(c, -60, -40, 120, 80, 30); c.fill(); c.restore();
  }
  if (ring) {
    [[400, "#4a2615"], [378, "#7a4626"], [356, "#64371d"]].forEach(([r, col]) => { c.fillStyle = col; c.beginPath(); c.arc(540, 705, r, 0, 7); c.fill(); });
    c.strokeStyle = "rgba(226,176,74,0.6)"; c.lineWidth = 3; c.beginPath(); c.arc(540, 705, 356, 0, 7); c.stroke();
  } else { // viele Spielende: rechteckiger Tisch, damit Namen Platz haben
    [[0, "#4a2615"], [22, "#7a4626"], [44, "#64371d"]].forEach(([m, col]) => { c.fillStyle = col; k.rrect(c, 70 + m, 270 + m, 940 - 2 * m, 820 - 2 * m, 110 - m); c.fill(); });
    c.strokeStyle = "rgba(226,176,74,0.6)"; c.lineWidth = 3; k.rrect(c, 114, 314, 852, 732, 66); c.stroke();
  }
  const cg = c.createRadialGradient(540, 705, 0, 540, 705, 190); cg.addColorStop(0, "rgba(255,210,122,0.95)"); cg.addColorStop(1, "rgba(255,179,71,0)");
  c.fillStyle = cg; c.beginPath(); c.arc(540, 705, 190, 0, 7); c.fill();
  if (ring) { // Kerzen
    [[540, 682, 668], [499, 722, 708], [563, 722, 708]].forEach(([x, y, fy]) => {
      c.fillStyle = CREAM; c.fillRect(x - 0, y, 18, 46);
      c.fillStyle = "#ffd27a"; c.beginPath(); c.ellipse(x + 9, fy, 9, 16, 0, 0, 7); c.fill();
      c.fillStyle = "#fff6dd"; c.beginPath(); c.ellipse(x + 9, fy + 2, 4, 9, 0, 0, 7); c.fill();
    });
  }
  // Titel
  const t1 = FIT(c, k, d.gameLabel, { max: 112, min: 56, maxW: 940 });
  const t2 = FIT(c, k, d.tr(fw ? "tplTrtHeadF" : "tplTrtHeadT", fw ? "enttarnt" : "siegen"), { max: 92, min: 44, maxW: 940 });
  c.textAlign = "center";
  k.setFont(c, 700, t1.size, F_FRAUNCES); c.fillStyle = CREAM; k.spaced(c, t1.lines[0], 540, k.cssBase(c, 36, 112), 0.01 * t1.size, "center");
  k.setFont(c, 700, t2.size, F_FRAUNCES); c.fillStyle = RED2; c.fillText(t2.lines[0], 540, k.cssBase(c, 148, 92));
  // Spielende
  plan.items.forEach((it) => {
    const { p, q, sh, sw, nf, rf, nlh, rlh, y0 } = it, col = p.traitor ? "#ff7a7a" : CREAM;
    c.globalAlpha = p.alive ? 1 : 0.78;
    shield(c, q.cx - sw / 2, y0, q.s, p.traitor);
    c.textAlign = "center";
    let y = y0 + sh + 16;
    k.setFont(c, 700, nf.size, F_FRAUNCES); c.fillStyle = col;
    nf.lines.forEach((ln) => { c.fillText(ln, q.cx, k.cssBase(c, y, nlh)); y += nlh; });
    c.save(); c.globalAlpha *= 0.88; k.setFont(c, 500, rf.size, F_FRAUNCES);
    rf.lines.forEach((ln) => { c.font = "italic " + c.font; c.fillText(ln, q.cx, k.cssBase(c, y, rlh)); y += rlh; c.font = c.font.replace("italic ", ""); });
    c.restore(); c.globalAlpha = 1;
  });
  // Schlusssatz
  const tn = P.filter((p) => p.traitor).map((p) => d.clean(p.name)), many = tn.length > 1;
  const sfn = d.tr(fw ? (many ? "tplTrtSubFN" : "tplTrtSubF1") : (many ? "tplTrtSubTN" : "tplTrtSubT1"), (n) => n);
  const sub = sfn(listJoin(tn, d.locale));
  const sf = FIT(c, k, sub, { w: 500, max: 42, min: 22, maxW: 960, lines: 2 });
  const slh = sf.size * 1.12, sTop = 1196 - slh * sf.lines.length;
  k.setFont(c, 500, sf.size, F_FRAUNCES); c.fillStyle = GOLD; c.textAlign = "center";
  const base = c.font;
  sf.lines.forEach((ln, i) => { c.font = "italic " + base; c.fillText(ln, 540, k.cssBase(c, sTop + i * slh, slh)); });
  c.textAlign = "left"; c.font = base;
  footer(c, k, d, GOLD, 40);
  return [cv];
}

export default {
  games: ["traitor"],
  fonts: ['700 100px "Fraunces"', '500 42px "Fraunces"', 'italic 500 42px "Fraunces"'].concat(FONTS_BASE),
  accepts: (d) => !!(d.extra && Array.isArray(d.extra.players) && d.extra.players.length >= 2 && d.extra.winner),
  texts: (d) => (d.extra ? [d.extra.players.map((p) => p.name).join(" "), ["tplTrtHeadF", "tplTrtHeadT", "tplTrtFaithful", "tplTrtTraitor", "tplPartyAlive", "tplPartyDead"].map((q) => d.tr(q, "")).join(" "), ["tplTrtSubF1", "tplTrtSubFN", "tplTrtSubT1", "tplTrtSubTN"].map((q) => { const f = d.tr(q, null); return typeof f === "function" ? f("x") : ""; }).join(" ")] : []),
  render,
};
