// Ergebnisbild Schieber (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/schieber.png, Look der App-Tafel).
// Daten (shareExtra aus SchieberGame): teams[{name, entries}], target. Striche mit der echten Strich-Logik der App.
// Oben Team 2, unten Team 1 wie in der App. Das Schieber-TURNIER hat eigene Exporte (schieber-sheet.js) und nutzt diese Vorlage nicht.
import { schieberTallyPlan, schieberCumulativeCount, schieberTwentiesAndPending, seededJitter } from "../../games/schieber/game.js";

const CH = "#F4F1E8", GOLD = "#E9C46A", GOLD2 = "#D9A94C", MUTE = "#8A93A8";
const S = 3; // SVG-Einheiten der App-Striche -> px
const BX = 60, BY = 520, BW = 960, BH = 770, HALF = 385;

/* ---------- Striche (gleiche Formen und Zitter-Werte wie KiloMark, VMark, TallyGroup, FiftyMark der App) ---------- */
function stroke(c, w, a) { c.strokeStyle = CH; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.globalAlpha = a; c.stroke(); c.globalAlpha = 1; }
function rotAbout(c, deg, x, y) { c.translate(x, y); c.rotate(deg * Math.PI / 180); c.translate(-x, -y); }
function line(c, x1, y1, x2, y2, w, a, deg, ox, oy) { c.save(); if (deg) rotAbout(c, deg, ox, oy); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); stroke(c, w, a); c.restore(); }
const MARK = {
  K: { w: 38, h: 34, draw(c, seed) { const j = seededJitter(seed * 3 + 11) * 2; c.save(); rotAbout(c, j, 19, 17); c.beginPath(); c.moveTo(6, 4); c.lineTo(32, 30); stroke(c, 2.9, 0.95); c.beginPath(); c.moveTo(32, 4); c.lineTo(6, 30); stroke(c, 2.9, 0.95); c.restore(); } },
  V: { w: 30, h: 30, draw(c, seed) { c.save(); rotAbout(c, seededJitter(seed) * 2, 15, 15); c.beginPath(); c.moveTo(4, 4); c.lineTo(15, 26); c.lineTo(26, 4); stroke(c, 2.6, 0.92); c.restore(); } },
};
function groupW(n) { return 6 + n * 7; }
function drawGroup(c, n, seed) {
  const w = groupW(n), vc = n === 5 ? 4 : n;
  for (let i = 0; i < vc; i++) { const x = 5 + i * 7; line(c, x, 4, x, 26, 2.4, 0.92, seededJitter(seed * 5 + i) * 3, x, 15); }
  if (n === 5) line(c, 2, 3, w - 2, 27, 2.6, 0.92);
}
function drawFifty(c, pair, seed) {
  line(c, 4, 20, 20, 4, 2.4, 0.92, seededJitter(seed) * 3, 12, 12);
  if (pair === 2) line(c, 4, 4, 20, 20, 2.4, 0.92, seededJitter(seed + 50) * 4, 12, 12);
}
/* Plan der App -> Elemente mit Breite/Hoehe in px (wie renderTallyPlan: K, V, Gruppen nach groupSeed) */
function clusters(plan) {
  const out = []; let i = 0;
  while (i < plan.length) {
    const it = plan[i];
    if (it.kind === "K" || it.kind === "V") { const m = MARK[it.kind]; const ci = out.length; out.push({ w: m.w * S, h: m.h * S, draw: (c) => m.draw(c, ci) }); i++; continue; }
    const sd = it.groupSeed; let n = 0; while (i < plan.length && plan[i].kind === "stroke" && plan[i].groupSeed === sd) { n++; i++; }
    const ci = out.length; out.push({ w: groupW(n) * S, h: 30 * S, draw: (c) => drawGroup(c, n, ci) });
  }
  return out;
}
function marks(entries) {
  const fif = []; let left = schieberCumulativeCount(entries, "fifties"), k = 0;
  while (left > 0) { const sz = Math.min(2, left); const gi = k++; fif.push({ w: 24 * S, h: 24 * S, draw: (c) => drawFifty(c, sz, gi) }); left -= sz; }
  const tw = schieberTwentiesAndPending(entries);
  return { rows: [clusters(schieberTallyPlan(entries, "hundreds")), fif, clusters(tw.plan)], pending: tw.pending.map((p) => p.value) };
}
/* Zeilen umbrechen (wie flex-wrap der App), Massstab so waehlen, dass alles in maxW x maxH passt */
const GAP = 14, RGAP = 10, RMIN = 104, PGAP = 22;
function layoutMarks(c, k, m) {
  k.setFont(c, 400, 56, k.F_KALAM);
  const pw = m.pending.length ? Math.max(50, ...m.pending.map((v) => c.measureText(String(v)).width + 16)) : 0;
  const ph = m.pending.length ? m.pending.length * 60 + (m.pending.length - 1) * 12 : 0;
  for (let s = 1; s >= 0.3; s -= 0.05) {
    const rowsW = 452 / s - (pw ? pw + PGAP : 0);
    const lines = m.rows.map((r) => { const ls = [[]]; let w = 0; r.forEach((cl) => { const add = (ls[ls.length - 1].length ? GAP : 0) + cl.w; if (w + add > rowsW && ls[ls.length - 1].length) { ls.push([cl]); w = cl.w; } else { ls[ls.length - 1].push(cl); w += add; } }); return ls; });
    const rowsH = lines.reduce((a, ls) => a + ls.length * RMIN + (ls.length - 1) * 6, 0) + RGAP * 2;
    const lw = (l) => l.reduce((a, cl, i) => a + cl.w + (i ? GAP : 0), 0);
    const contentW = Math.max(0, ...lines.flat().map(lw));
    if (rowsH * s <= 340 && Math.max(rowsH, ph) * s <= 340 + 1) return { s, lines, pw, ph, rowsH, contentW, w: contentW + (pw ? pw + PGAP : 0), h: Math.max(rowsH, ph) };
    if (s <= 0.3 + 1e-6) return { s, lines, pw, ph, rowsH, contentW, w: contentW + (pw ? pw + PGAP : 0), h: Math.max(rowsH, ph), clip: true };
  }
}
/* Strichblock zeichnen. right=true: wie .marks.rt (Zahlen links, Striche rechtsbuendig, Anker oben rechts) */
function drawMarks(c, k, m, ax, ay, right) {
  const L = layoutMarks(c, k, m);
  c.save();
  if (L.clip) { c.beginPath(); c.rect(BX, ay - 10, BW, HALF - 20); c.clip(); }
  c.translate(ax, ay); c.scale(L.s, L.s);
  const totalW = Math.min(L.w, 452 / L.s);
  const x0 = right ? -totalW : 0;
  const rowsX = right ? x0 + (L.pw ? L.pw + PGAP : 0) : 0;
  const rowsRight = rowsX + L.contentW;
  let y = 0;
  L.lines.forEach((ls) => {
    ls.forEach((l) => {
      const lw = l.reduce((a, cl, i) => a + cl.w + (i ? GAP : 0), 0);
      let x = right ? rowsRight - lw : rowsX;
      l.forEach((cl) => { c.save(); c.translate(x, y + (RMIN - cl.h) / 2); c.scale(S, S); cl.draw(c); c.restore(); x += cl.w + GAP; });
      y += RMIN + 6;
    });
    y += RGAP - 6;
  });
  if (L.pw) {
    const px = right ? x0 + L.pw / 2 : L.contentW + PGAP + L.pw / 2;
    let py = (L.h - L.ph) / 2;
    k.setFont(c, 400, 56, k.F_KALAM); c.fillStyle = CH; c.textAlign = "center";
    m.pending.forEach((v) => {
      const s = String(v).replace("-", "−"); c.fillText(s, px, py + 46);
      if (v < 0) { const w = c.measureText(s).width + 16; c.fillRect(px - w / 2, py + 60, w, 3.5); }
      py += 72;
    });
    c.textAlign = "left";
  }
  c.restore();
}

/* ---------- Bausteine ---------- */
function bg(c, k) {
  c.fillStyle = "#0B0E18"; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  k.cssEllipse(c, 0, 0, k.TPL_W, k.TPL_H, 540, 0, [[0, "#1A2030"], [0.6, "#0F1320"], [1, "#0B0E18"]]);
  const o = document.createElement("canvas"); o.width = k.TPL_W; o.height = k.TPL_H; const g = o.getContext("2d");
  g.fillStyle = "rgba(255,255,255,0.035)";
  for (let y = 0; y < k.TPL_H; y += 54) g.fillRect(0, y, k.TPL_W, 1);
  for (let x = 0; x < k.TPL_W; x += 54) g.fillRect(x, 0, 1, k.TPL_H);
  g.globalCompositeOperation = "destination-in";
  const m = g.createLinearGradient(0, 0, 0, k.TPL_H); m.addColorStop(0, "#000"); m.addColorStop(0.7, "rgba(0,0,0,0.4)"); m.addColorStop(1, "rgba(0,0,0,0.2)");
  g.fillStyle = m; g.fillRect(0, 0, k.TPL_W, k.TPL_H);
  c.drawImage(o, 0, 0); o.width = o.height = 0;
}
function star(c, x, y, s, col) {
  const p = [[10, 1], [12, 8], [19, 10], [12, 12], [10, 19], [8, 12], [1, 10], [8, 8]];
  c.save(); c.translate(x, y); c.scale(s / 20, s / 20); c.beginPath(); p.forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b))); c.closePath(); c.fillStyle = col; c.fill(); c.restore();
}
/* Punkte-Kasten: "874" gross, darunter "von 1'000". anchor: {x,y} und Ausrichtung */
function scoreBox(c, k, d, val, win, target, x, y, alignRight, alignBottom) {
  k.setFont(c, 700, 100, k.F_INTER); const vw = c.measureText(val).width;
  const sub = typeof d.tr("tplOf") === "function" ? d.tr("tplOf")(target) : "/ " + target;
  k.setFont(c, 500, 26, k.F_INTER); const sw = c.measureText(sub).width;
  const w = Math.max(vw, sw) + 48, h = 154;
  const bx = alignRight ? x - w : x, by = alignBottom ? y - h : y;
  c.save(); c.shadowColor = "rgba(0,0,0,0.4)"; c.shadowBlur = 24; c.shadowOffsetY = 8; c.fillStyle = "#0B0F0C"; k.rrect(c, bx, by, w, h, 12); c.fill(); c.restore();
  if (win) { c.strokeStyle = "rgba(217,169,76,0.33)"; c.lineWidth = 2; k.rrect(c, bx - 2, by - 2, w + 4, h + 4, 14); c.stroke(); }
  c.strokeStyle = win ? GOLD2 : "rgba(244,241,232,0.25)"; c.lineWidth = 2; k.rrect(c, bx + 1, by + 1, w - 2, h - 2, 11); c.stroke();
  k.setFont(c, 700, 100, k.F_INTER); c.fillStyle = win ? GOLD : "#7EE0A8"; c.fillText(val, bx + 24, k.cssBase(c, by + 10, 100));
  k.setFont(c, 500, 26, k.F_INTER); c.fillStyle = "#8FB09E"; c.fillText(sub, bx + 24, k.cssBase(c, by + 114, 31.5));
}
function teamName(c, k, name, x, y, right, fromBottom) {
  let f = k.fit(c, name, { w: 700, fam: k.F_INTER, max: 56, min: 34, maxW: 420, lines: 2 });
  if (f.cut) f = k.fit(c, name, { w: 700, fam: k.F_INTER, max: 42, min: 24, maxW: 420, lines: 3 });
  k.setFont(c, 700, f.size, k.F_INTER); c.fillStyle = "#FFFFFF"; c.textAlign = right ? "right" : "left";
  const lh = f.size * 1.08, top = fromBottom ? y - lh * f.lines.length : y;
  f.lines.forEach((ln, i) => c.fillText(ln, x, k.cssBase(c, top + i * lh, lh)));
  c.textAlign = "left";
}
function half(c, k, d, team, top, isTop, win, tgt) {
  const m = marks(team.entries);
  const val = d.num(team.total);
  if (isTop) {
    drawMarks(c, k, m, BX + BW - 48, top + 18, true);
    teamName(c, k, team.name, BX + 48, top + HALF - 58, false, true);
    scoreBox(c, k, d, val, win, tgt, BX + 48, top + 30, false, false);
  } else {
    drawMarks(c, k, m, BX + 48, top + 46, false);
    teamName(c, k, team.name, BX + BW - 48, top + 58, true, false);
    scoreBox(c, k, d, val, win, tgt, BX + BW - 48, top + HALF - 30, true, true);
  }
}
/* Verbform: Teamname mit Konjunktion ("Tony und Yanis") -> Mehrzahl */
const PLURAL = /\s(und|and|et|e|y|&|\+)\s|,|\//iu;

function render(d, k) {
  const { cv, c } = k.tplCanvas();
  const ex = d.extra;
  const tgt = d.num(ex.target);
  const teams = ex.teams.map((tm, i) => ({ name: d.clean(tm.name || "") || d.rows[i] && d.rows[i].name || "Team " + (i + 1), entries: tm.entries.filter((v) => typeof v === "number" && isFinite(v)), total: tm.entries.reduce((a, b) => a + (Number(b) || 0), 0) }));
  /* Sieger aus gtEcModel (Name + Punkte), keine eigene Berechnung */
  const byName = teams.filter((tm) => d.winners.some((r) => r.name === tm.name && r.score === tm.total));
  const wins = byName.length ? byName : teams.filter((tm) => d.winners.some((r) => r.score === tm.total));
  const isWin = (tm) => wins.indexOf(tm) >= 0;
  bg(c, k);
  /* Kopf: Logo, Marke, Datum */
  const lw = k.logo(c, d.logo, 60, 56, 90, GOLD);
  k.setFont(c, 800, 46, k.F_BALOO); c.fillStyle = GOLD; const gx = 60 + lw + 20; c.fillText("GameTab", gx, k.cssBase(c, 101 - 23, 46));
  const gw = c.measureText("GameTab").width;
  const df = k.fit(c, d.date, { w: 500, fam: k.F_INTER, max: 28, min: 18, maxW: 1020 - gx - gw - 30 });
  k.setFont(c, 500, df.size, k.F_INTER); c.fillStyle = MUTE; c.textAlign = "right"; c.fillText(df.lines[0], 1020, k.cssBase(c, 101 - df.size * 0.6, df.size * 1.2)); c.textAlign = "left";
  /* Titel */
  const tf = k.fit(c, d.gameLabel, { w: 800, fam: k.F_BALOO, max: 176, min: 90, maxW: 960 });
  k.setFont(c, 800, tf.size, k.F_BALOO); c.fillStyle = "#FFFFFF"; c.fillText(tf.lines[0], 60, k.cssBase(c, 166 + (176 - tf.size) / 2, tf.size));
  /* Ziel-Kasten rechts */
  k.setFont(c, 500, 40, k.F_INTER); const zw = Math.max(190, c.measureText(tgt).width + 44);
  const zx = 1020 - zw;
  c.fillStyle = "#141A29"; k.rrect(c, zx, 322, zw, 64, 12); c.fill(); c.strokeStyle = "#2A3248"; c.lineWidth = 2; k.rrect(c, zx + 1, 323, zw - 2, 62, 11); c.stroke();
  c.fillStyle = "#FFFFFF"; c.fillText(tgt, zx + 22, k.cssBase(c, 330, 48));
  const zl = d.up(d.tr("targetLabel", "Ziel"));
  k.setFont(c, 600, 28, k.F_INTER); c.fillStyle = MUTE; const zlw = k.spaced(c, zl, zx - 20, k.cssBase(c, 354 - 17, 34), 3.9, "right");
  /* Untertitel links, so breit wie Platz bis zum Ziel */
  const sub = d.up(d.tr("schieberPlaySubtitle", ""));
  if (sub) {
    const maxW = zx - 20 - zlw - 40 - 66;
    let fs = 26; k.setFont(c, 600, fs, k.F_INTER);
    while (fs > 16 && k.spacedW(c, sub, fs * 0.14) > maxW) { fs -= 1; k.setFont(c, 600, fs, k.F_INTER); }
    c.fillStyle = MUTE; k.spaced(c, sub, 66, k.cssBase(c, 350, 32), fs * 0.14, "left");
  }
  /* Banner */
  c.fillStyle = "rgba(32,24,8,0.55)"; k.rrect(c, 60, 408, 960, 84, 14); c.fill();
  c.strokeStyle = GOLD2; c.lineWidth = 2.5; k.rrect(c, 61.25, 409.25, 957.5, 81.5, 13); c.stroke();
  let msg;
  if (wins.length !== 1) { const f = d.tr("tplSchTie"); msg = typeof f === "function" ? f(d.num(teams[0].total)) : d.tr("ecTied", ""); }
  else { const w = wins[0]; const f = d.tr(PLURAL.test(" " + w.name + " ") ? "tplSchWinN" : "tplSchWin1"); msg = typeof f === "function" ? f(w.name, d.num(w.total)) : w.name; }
  let bf = k.fit(c, msg, { w: 700, fam: k.F_BALOO, max: 44, min: 30, maxW: 830, lines: 1 });
  if (bf.cut) bf = k.fit(c, msg, { w: 700, fam: k.F_BALOO, max: 32, min: 20, maxW: 830, lines: 2 });
  k.setFont(c, 700, bf.size, k.F_BALOO); const bw = Math.max(...bf.lines.map((l) => c.measureText(l).width)); const bx = 540 - (bw + 34 + 16) / 2;
  star(c, bx, 450 - 17, 34, GOLD); c.fillStyle = GOLD;
  const blh = bf.size * 1.12, bt = 450 - blh * bf.lines.length / 2;
  bf.lines.forEach((l, i) => c.fillText(l, bx + 50, k.cssBase(c, bt + i * blh, blh)));
  /* Tafel */
  c.save(); c.shadowColor = "rgba(0,0,0,0.53)"; c.shadowBlur = 50; c.shadowOffsetY = 20; c.fillStyle = "#16291F"; k.rrect(c, BX, BY, BW, BH, 22); c.fill(); c.restore();
  c.save(); k.rrect(c, BX, BY, BW, BH, 22); c.clip();
  k.cssEllipse(c, BX, BY, BW, BH, BX + BW / 2, BY + BH / 2, [[0, "#1E3A2F"], [1, "#16291F"]]);
  c.restore();
  k.insetShadow(c, BX, BY, BW, BH, 22, 70, "rgba(0,0,0,0.6)");
  c.save(); k.rrect(c, BX, BY, BW, BH, 22); c.clip();
  half(c, k, d, teams[1], BY, true, isWin(teams[1]), tgt);
  half(c, k, d, teams[0], BY + HALF, false, isWin(teams[0]), tgt);
  c.fillStyle = "rgba(244,241,232,0.25)"; c.fillRect(BX, BY + HALF - 1, BW, 2);
  c.restore();
  /* Ziel-Pille in der Mitte */
  const pill = d.tr("targetLabel", "Ziel") + " " + tgt;
  k.setFont(c, 700, 40, k.F_KALAM); const pw = c.measureText(pill).width + 68; const ph = 66, py = BY + HALF - ph / 2;
  c.save(); c.shadowColor = "rgba(0,0,0,0.53)"; c.shadowBlur = 14; c.shadowOffsetY = 4; c.fillStyle = "#16291F"; k.rrect(c, 540 - pw / 2, py, pw, ph, 33); c.fill(); c.restore();
  c.strokeStyle = "rgba(244,241,232,0.4)"; c.lineWidth = 2.5; k.rrect(c, 540 - pw / 2 + 1.25, py + 1.25, pw - 2.5, ph - 2.5, 32); c.stroke();
  c.fillStyle = CH; c.textAlign = "center"; c.fillText(pill, 540, k.cssBase(c, py + 6, 52)); c.textAlign = "left";
  return [cv];
}

export default {
  games: ["schieber"],
  fonts: ["800 46px \"Baloo 2\"", "700 44px \"Baloo 2\"", "500 28px Inter", "600 28px Inter", "700 56px Inter", "700 40px Kalam", "400 56px Kalam"],
  accepts: (d) => !!(d.extra && Array.isArray(d.extra.teams) && d.extra.teams.length === 2 && d.extra.teams.every((tm) => tm && Array.isArray(tm.entries)) && isFinite(Number(d.extra.target))),
  texts: (d) => [d.tr("schieberPlaySubtitle", ""), d.up(d.tr("schieberPlaySubtitle", "") + d.tr("targetLabel", "")), "−'’!¡ " + (d.extra ? d.extra.teams.map((t) => t.name).join(" ") : "")],
  render,
};
