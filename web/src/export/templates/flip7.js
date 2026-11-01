// Ergebnisbild Flip 7 (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/flip7.png).
// Daten: gtEcModel (Raenge, Gleichstand, Totale) plus shareExtra {players:[{name, rounds:[Rundenpunkte], flip7:Anzahl Runden mit Flip-7-Bonus]}]} (Rang-Reihenfolge).
// Der Kartenfaecher im Entwurf zeigt die ECHTEN besten Rundenpunkte des Siegers (hoechstens 7, absteigend, nur Werte ueber 0), nicht Kartenwerte.
// Der Stern "Flip 7 Bonus +15" erscheint nur, wenn der Sieger mindestens eine Runde mit Flip-7-Bonus hatte (Bonus +15 ist die Regel der App).
import { F_ARCHIVO } from "./fonts-a.js";

const BG = "#150A07", CREAM = "#FFF1DC", ORG = "#FF7A3D", RED = "#D9431F";
const FIRST_CAP = 8;
const NUM_COL = ["#FF7A3D", "#E8552B", "#FF7A3D", "#D9431F", "#FF7A3D", "#E8552B", "#FF7A3D"];
const BURST = [[50, 0], [60, 14], [77, 7], [79, 25], [97, 28], [88, 44], [100, 58], [83, 66], [86, 85], [67, 83], [58, 100], [47, 86], [30, 96], [26, 78], [7, 75], [15, 59], [0, 46], [17, 37], [13, 18], [32, 21]];

function bg(c, k) {
  c.fillStyle = BG; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  c.fillStyle = "rgba(255,122,61,0.11)";
  const cx = 540, cy = 702, R = 2200;
  for (let a = 0; a < 360; a += 15) {
    const a0 = (a - 90) * Math.PI / 180, a1 = (a + 5 - 90) * Math.PI / 180;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + R * Math.cos(a0), cy + R * Math.sin(a0)); c.lineTo(cx + R * Math.cos(a1), cy + R * Math.sin(a1)); c.closePath(); c.fill();
  }
}
/* Punkte entlang des Umfangs eines Rundrechtecks (wie der Entwurf) */
function perim(x0, y0, w, h, r, step) {
  const out = [], sx = w - 2 * r, sy = h - 2 * r, L = 2 * sx + 2 * sy + 2 * Math.PI * r, n = Math.floor(L / step);
  for (let i = 0; i < n; i++) {
    let d = i * L / n;
    if (d < sx) { out.push([x0 + r + d, y0]); continue; } d -= sx;
    if (d < Math.PI * r / 2) { const a = -Math.PI / 2 + d / r; out.push([x0 + w - r + r * Math.cos(a), y0 + r + r * Math.sin(a)]); continue; } d -= Math.PI * r / 2;
    if (d < sy) { out.push([x0 + w, y0 + r + d]); continue; } d -= sy;
    if (d < Math.PI * r / 2) { const a = d / r; out.push([x0 + w - r + r * Math.cos(a), y0 + h - r + r * Math.sin(a)]); continue; } d -= Math.PI * r / 2;
    if (d < sx) { out.push([x0 + w - r - d, y0 + h]); continue; } d -= sx;
    if (d < Math.PI * r / 2) { const a = Math.PI / 2 + d / r; out.push([x0 + r + r * Math.cos(a), y0 + h - r + r * Math.sin(a)]); continue; } d -= Math.PI * r / 2;
    if (d < sy) { out.push([x0, y0 + h - r - d]); continue; } d -= sy;
    const a = Math.PI + d / r; out.push([x0 + r + r * Math.cos(a), y0 + r + r * Math.sin(a)]);
  }
  return out;
}
function sign(c, k, d) {
  perim(90, 50, 900, 330, 70, 50).forEach(([x, y], i) => {
    if (i % 2 === 0) { c.fillStyle = "rgba(255,122,61,0.33)"; c.beginPath(); c.arc(x, y, 18, 0, Math.PI * 2); c.fill(); c.fillStyle = "#FFE08A"; }
    else c.fillStyle = "#5A2A12";
    c.beginPath(); c.arc(x, y, 13, 0, Math.PI * 2); c.fill();
  });
  c.fillStyle = "rgba(0,0,0,0.4)"; k.rrect(c, 90, 62, 900, 330, 70); c.fill();
  c.fillStyle = CREAM; k.rrect(c, 90, 50, 900, 330, 70); c.fill();
  c.fillStyle = ORG; k.rrect(c, 100, 60, 880, 310, 60); c.fill();
  /* Titel: letztes Wort mit Ziffer (z. B. "7") in Creme mit Schatten, Rest dunkel */
  const label = d.up(d.gameLabel);
  const m = /^(.*?)\s*(\d+)$/.exec(label);
  const head = m ? m[1] : label, tail = m ? m[2] : "";
  const maxW = 780;
  let fs = 200;
  const tw = (sz) => { k.setFont(c, 400, sz, F_ARCHIVO); const a = c.measureText(head).width + (head.length - 1) * sz * 0.01; return a + (tail ? 30 * sz / 200 + c.measureText(tail).width : 0); };
  while (fs > 60 && tw(fs) > maxW) fs -= 2;
  k.setFont(c, 400, fs, F_ARCHIVO);
  const total = tw(fs); let x = 540 - total / 2; const base = 215 + (fs * 0.35);
  c.fillStyle = BG; x += k.spaced(c, head, x, base, fs * 0.01, "left");
  if (tail) {
    x += 30 * fs / 200;
    c.fillStyle = BG; c.fillText(tail, x + 7 * fs / 200, base + 7 * fs / 200);
    c.fillStyle = CREAM; c.fillText(tail, x, base);
  }
}
function fcard(c, k, v, i) {
  c.save();
  c.fillStyle = "rgba(0,0,0,0.4)"; k.rrect(c, 425 - 6, 480 + 8, 230, 335, 22); c.fill();
  c.fillStyle = CREAM; k.rrect(c, 425, 480, 230, 335, 22); c.fill();
  c.strokeStyle = ORG; c.lineWidth = 6; k.rrect(c, 425 + 17, 480 + 17, 230 - 34, 335 - 34, 10); c.stroke();
  const lab = String(v);
  k.rrect(c, 425, 480, 230, 335, 22); c.clip();
  const nf = k.fit(c, lab, { w: 400, fam: F_ARCHIVO, max: 170, min: 90, maxW: 230 - 41 - 22 });
  c.fillStyle = NUM_COL[i % NUM_COL.length]; k.setFont(c, 400, nf.size, F_ARCHIVO); c.fillText(lab, 425 + 41, 480 + 335 / 2 + k.capH(c) / 2);
  c.fillStyle = BG; k.setFont(c, 400, 34, F_ARCHIVO); c.fillText(lab, 425 + 27, 480 + 14 + 7 + 30);
  c.save(); c.translate(425 + 230 - 27, 480 + 335 - 14 - 7 - 30); c.rotate(Math.PI); c.fillText(lab, 0, 0); c.restore();
  c.restore();
}
function fan(c, k, vals, sc, dy) {
  const n = vals.length; if (!n) return;
  const step = n > 5 ? 10 : n > 3 ? 11 : 13, peak = Math.ceil((n - 1) / 2);
  const order = vals.map((v, i) => ({ v, i, a: (i - (n - 1) / 2) * step, z: i <= peak ? i : n - i })).sort((p, q) => p.z - q.z || p.i - q.i);
  c.save(); c.translate(0, dy); c.translate(540, 420); c.scale(sc, sc); c.translate(-540, -420);
  order.forEach((o) => { c.save(); c.translate(540, 1280); c.rotate(o.a * Math.PI / 180); c.translate(-540, -1280); fcard(c, k, o.v, o.i); c.restore(); });
  c.restore();
}
function burst(c, k, d, count, sc, dy) {
  c.save(); c.translate(0, dy); c.translate(540, 420); c.scale(sc, sc); c.translate(-540, -420);
  c.translate(900, 520); c.rotate(12 * Math.PI / 180);
  c.beginPath(); BURST.forEach(([px, py], i) => { const x = (px - 50) * 2.8, y = (py - 50) * 2.8; if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.closePath();
  c.fillStyle = "#FFD23F"; c.fill();
  c.fillStyle = BG; c.textAlign = "center";
  const bt = d.tr("tplFlip7Bonus", "Flip 7 Bonus"), bm = /^(.*?)\s*Flip 7\s*(.*)$/.exec(bt);
  let f;
  if (bm) {
    const ls = bm[1] ? [bm[1], "Flip 7"] : ["Flip 7", bm[2] || ""];
    let sz = 36; k.setFont(c, 400, sz, F_ARCHIVO);
    while (sz > 18 && Math.max(...ls.map((l) => c.measureText(l).width)) > 190) { sz -= 1; k.setFont(c, 400, sz, F_ARCHIVO); }
    f = { size: sz, lines: ls.filter(Boolean) };
  } else f = k.fit(c, bt, { w: 400, fam: F_ARCHIVO, max: 36, min: 20, maxW: 190, lines: 2 });
  k.setFont(c, 400, f.size, F_ARCHIVO);
  const lh = f.size * 1.08, y0 = -52 - (f.lines.length - 1) * lh / 2 + 4;
  f.lines.forEach((l, i) => c.fillText(l, 0, y0 + i * lh + k.capH(c) / 2));
  c.fillStyle = RED; k.setFont(c, 400, count > 1 ? 84 : 100, k.F_ANTON); c.fillText("+15", 0, 52 + k.capH(c) / 2 - (count > 1 ? 4 : 0));
  if (count > 1) { c.fillStyle = BG; k.setFont(c, 400, 34, F_ARCHIVO); c.fillText("×" + count, 0, 100); }
  c.textAlign = "left"; c.restore();
}
function footer(c, k, d) {
  const lw = k.logo(c, d.logo, 60, 1210, 100, ORG);
  const x = 60 + lw + 20;
  k.setFont(c, 800, 52, k.F_BALOO); c.fillStyle = ORG; c.fillText("GameTab", x, 1252);
  const f = k.fit(c, d.date, { w: 700, fam: k.F_BALOO, max: 26, min: 18, maxW: 1020 - x });
  k.setFont(c, 700, f.size, k.F_BALOO); c.globalAlpha = 0.9; c.fillText(f.lines[0], x, 1293); c.globalAlpha = 1;
}
function grid(c, k, rows, top, fs, pitch) {
  const cw = (960 - 30) / 2;
  rows.forEach((r, i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 60 + col * (cw + 30), y = top + row * pitch;
    c.fillStyle = ORG; c.fillRect(x, y, cw, 6);
    k.setFont(c, 400, fs, k.F_ANTON); const bl = y + 8 + 6 + k.capH(c) * 1.0 + fs * 0.06;
    c.textAlign = "right"; c.fillStyle = ORG; c.fillText(r.value, x + cw, bl); const vw = c.measureText(r.value).width; c.textAlign = "left";
    const f = k.fit(c, r.name, { w: 400, fam: k.F_ANTON, max: fs, min: Math.round(fs * 0.55), maxW: cw - vw - 20, lines: 1 });
    k.setFont(c, 400, f.size, k.F_ANTON); c.fillStyle = CREAM; c.fillText(f.lines[0], x, bl);
  });
}

function page1(d, k, others) {
  const { cv, c } = k.tplCanvas();
  bg(c, k);
  const n = others.length, R = Math.ceil(n / 2);
  const fs = R <= 2 ? 44 : 40, pitch = R <= 2 ? 72 : 64;
  const gridTop = n ? Math.min(1090, 1196 - R * pitch) : 1196;
  const heroBase = gridTop - 35;
  const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
  const name = d.up(win.map((r) => r.name).join(" & "));
  const val = win[0].value;
  let hs = 190;
  const hv = k.fit(c, val, { w: 400, fam: k.F_ANTON, max: hs, min: 110, maxW: 400, lines: 1 });
  k.setFont(c, 400, hv.size, k.F_ANTON); const vw = c.measureText(val).width;
  const fo = { w: 400, fam: k.F_ANTON, maxW: 960 - vw - 40 };
  let nf = k.fit(c, name, Object.assign({}, fo, { max: hs, min: 118, lines: 1 }));
  if (nf.cut) nf = k.fit(c, name, Object.assign({}, fo, { max: 104, min: 60, lines: 2 }));
  if (nf.cut) nf = k.fit(c, name, Object.assign({}, fo, { max: 66, min: 44, lines: 3 }));
  k.setFont(c, 400, nf.size, k.F_ANTON); const cap = k.capH(c);
  const asc = nf.lines.map((l) => Math.max(cap, c.measureText(l).actualBoundingBoxAscent || cap));
  const dsc = nf.lines.map((l) => Math.max(0, c.measureText(l).actualBoundingBoxDescent || 0));
  const bl = new Array(nf.lines.length); bl[nf.lines.length - 1] = heroBase;
  for (let i = nf.lines.length - 2; i >= 0; i--) bl[i] = bl[i + 1] - (asc[i + 1] + dsc[i] + nf.size * 0.1);
  const heroTop = bl[0] - asc[0];
  /* Fachermassstab: bei vielen Spielern oder hohem Namen weniger Platz */
  const dy = d.tie ? 34 : 0;
  const sc = Math.max(0.42, Math.min(1, (heroTop + (nf.lines.length === 1 ? 22 : -8) - 420 - dy) / 485));
  sign(c, k, d);
  const f7 = d.flip7;
  fan(c, k, d.fanVals, sc, dy);
  if (f7 > 0) burst(c, k, d, f7, sc, dy);
  /* Beschriftung links unter dem Schild: Gleichstand und/oder "Beste Runden von ..." */
  let ly = 440;
  if (d.tie) { const tl = d.tr("ecTied", "Gemeinsamer erster Platz"); const tf = k.fit(c, tl, { w: 700, fam: k.F_BALOO, max: 38, min: 24, maxW: 600, lines: 1 }); k.setFont(c, 700, tf.size, k.F_BALOO); c.fillStyle = ORG; c.fillText(tf.lines[0], 70, ly + 14); ly += 44; }
  if (d.fanVals.length && sc > 0.6) { const f = d.tr("tplFlip7Best"); if (typeof f === "function") { const txt = f(win[0].name); const bf = k.fit(c, txt, { w: 600, fam: k.F_BALOO, max: 32, min: 22, maxW: 560, lines: 1 }); k.setFont(c, 600, bf.size, k.F_BALOO); c.fillStyle = "rgba(255,241,220,0.85)"; c.fillText(bf.lines[0], 70, ly + 14); } }
  c.fillStyle = CREAM; k.setFont(c, 400, nf.size, k.F_ANTON); nf.lines.forEach((ln, i) => c.fillText(ln, 60, bl[i]));
  k.setFont(c, 400, hv.size, k.F_ANTON); c.fillStyle = ORG; c.textAlign = "right"; c.fillText(val, 1020, heroBase); c.textAlign = "left";
  grid(c, k, others, gridTop, fs, pitch);
  footer(c, k, d);
  return cv;
}

function prepare(d) {
  const ex = d.extra, idx = Math.max(0, d.rows.findIndex((r) => r.winner));
  const p = ex && Array.isArray(ex.players) ? ex.players[idx] : null;
  d.fanVals = []; d.flip7 = 0;
  if (!p) return;
  if (Array.isArray(p.rounds)) d.fanVals = p.rounds.map(Number).filter((v) => isFinite(v) && v > 0).sort((a, b) => b - a).slice(0, 7).map((v) => Math.round(v));
  const f = Number(p.flip7); d.flip7 = isFinite(f) && f > 0 ? Math.round(f) : 0;
}

export default {
  games: ["flip7"],
  fonts: ["400 100px \"GTR Archivo\"", "400 100px \"GTR Anton\"", "800 52px \"Baloo 2\"", "700 26px \"Baloo 2\"", "600 30px \"Baloo 2\""],
  texts: (d) => [d.up(d.gameLabel), d.tr("tplFlip7Bonus", ""), d.tr("ecTied", ""), "+15×0123456789", d.winners.map((r) => r.name).join(" ")],
  render(d, k) {
    prepare(d);
    const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
    const rest = d.rows.filter((r) => win.indexOf(r) < 0);
    const parts = k.chunks(rest, FIRST_CAP, 12);
    const out = [page1(d, k, parts[0])];
    const sty = { bg: (c) => bg(c, k), ink: CREAM, sub: "rgba(255,241,220,0.7)", acc: ORG, line: "rgba(255,122,61,0.35)", fam: k.F_ANTON, logo: ORG };
    parts.slice(1).forEach((p, i) => out.push(k.listPage(d, p, i + 2, parts.length, sty)));
    return out;
  },
};
