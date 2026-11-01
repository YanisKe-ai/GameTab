// Ergebnisbild Skyjo (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/skyjo.png).
// Daten: gtEcModel (Raenge, Gleichstand, Totale) plus shareExtra {rounds:[[{score,doubled}] je Rang-Eintrag], target}.
// Die Karten im Entwurf sind die ECHTEN Rundenwerte des Siegers (eine Karte pro Runde, Skyjo-Farben). Doppelte Runde = kleines x2.
// tief gewinnt: die Rangfolge kommt unveraendert aus gtEcModel/rankedPodium (kleinster Wert zuerst).
import { F_ARCHIVO, F_BRUSH } from "./fonts-a.js";

const BG = "#0A2D33", ACC = "#2FD9A8", INK = "#FFFFFF", ON_ACC = "#06302A";

function cardColors(v) {
  if (v <= -2) return ["#1B3A8C", "#FFFFFF"];
  if (v === -1) return ["#3567C9", "#FFFFFF"];
  if (v === 0) return ["#8AD3F5", "#0B2A4A"];
  if (v <= 4) return ["#3DAA4A", "#FFFFFF"];
  if (v <= 8) return ["#F4D23C", "#3A2E00"];
  return ["#E2432F", "#FFFFFF"];
}
function bg(c, k) {
  c.fillStyle = BG; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  c.save(); c.strokeStyle = "rgba(255,255,255,0.024)"; c.lineWidth = 2;
  const step = 36 * Math.SQRT2;
  for (let o = -k.TPL_H; o < k.TPL_W + k.TPL_H; o += step) {
    c.beginPath(); c.moveTo(o, 0); c.lineTo(o + k.TPL_H, k.TPL_H); c.stroke();
    c.beginPath(); c.moveTo(o + k.TPL_H, 0); c.lineTo(o, k.TPL_H); c.stroke();
  }
  c.restore();
}
function footer(c, k, d) {
  const lw = k.logo(c, d.logo, 60, 1210, 100, ACC);
  const x = 60 + lw + 20;
  k.setFont(c, 800, 52, k.F_BALOO); c.fillStyle = ACC; c.fillText("GameTab", x, 1252);
  const f = k.fit(c, d.date, { w: 700, fam: k.F_BALOO, max: 26, min: 18, maxW: 1020 - x });
  k.setFont(c, 700, f.size, k.F_BALOO); c.globalAlpha = 0.9; c.fillText(f.lines[0], x, 1293); c.globalAlpha = 1;
}
/* Skyjo-Karte, s = Massstab zur Entwurfskarte 170 x 225 */
function card(c, k, x, y, w, h, v, dbl) {
  const s = w / 170, r = 20 * s;
  c.fillStyle = "rgba(0,0,0,0.33)"; k.rrect(c, x, y + 14 * s, w, h, r); c.fill();
  c.fillStyle = "#FFFFFF"; k.rrect(c, x, y, w, h, r); c.fill();
  const [bgc, fg] = cardColors(v);
  c.fillStyle = bgc; k.rrect(c, x + 6 * s, y + 6 * s, w - 12 * s, h - 12 * s, Math.max(2, r - 6 * s)); c.fill();
  const label = String(v).replace("-", "−");
  c.fillStyle = fg; c.textAlign = "center";
  const mf = k.fit(c, label, { w: 400, fam: F_ARCHIVO, max: 110 * s, min: 26 * s, maxW: w - 40 * s });
  k.setFont(c, 400, mf.size, F_ARCHIVO); c.fillText(label, x + w / 2, y + h / 2 + k.capH(c) / 2);
  k.setFont(c, 400, 34 * s, F_ARCHIVO);
  c.textAlign = "left"; c.fillText(label, x + 18 * s, y + 44 * s);
  c.save(); c.translate(x + w - 18 * s, y + h - 44 * s); c.rotate(Math.PI); c.fillText(label, 0, 0); c.restore();
  c.textAlign = "left";
  if (dbl) {
    const bw = 58 * s, bh = 34 * s;
    c.fillStyle = "#06302A"; k.rrect(c, x + w / 2 - bw / 2, y - bh / 2 + 2 * s, bw, bh, bh / 2); c.fill();
    c.fillStyle = ACC; k.setFont(c, 400, 22 * s, F_ARCHIVO); c.textAlign = "center"; c.fillText("×2", x + w / 2, y - bh / 2 + 2 * s + bh * 0.7); c.textAlign = "left";
  }
}
/* Karten im Bereich [x0,x0+aw] x [y0,y0+ah]: groesste Kartenbreite (hoechstens 170), die alle Runden fasst */
function cardsBlock(c, k, rounds, y0, ah) {
  const n = rounds.length; if (!n || ah < 70) return;
  const gap = 16, aw = 728, ar = 225 / 170;
  let best = null;
  for (let cols = 1; cols <= 12; cols++) {
    const rows = Math.ceil(n / cols);
    // Kartenbreite: so gross wie Breite und Hoehe es erlauben (Abstand waechst mit der Karte, Schatten 14/170 der Breite)
    let cw = Math.min(170, (aw - (cols - 1) * 6) / cols);
    for (let it = 0; it < 3; it++) {
      const g = cw < 120 ? Math.max(6, gap * cw / 170) : gap;
      cw = Math.min(170, (aw - (cols - 1) * g) / cols, (ah - (rows - 1) * g) / (rows * ar + 14 / 170));
    }
    const g = cw < 120 ? Math.max(6, gap * cw / 170) : gap;
    if (cw > 24 && (!best || cw >= best.cw - 0.01)) best = { cols, rows, cw, ch: cw * ar, g };
  }
  if (!best) { const cols = 12, rows = Math.ceil(n / cols), g = 6, cw = (aw - (cols - 1) * g) / cols, ch = cw * ar; best = { cols, rows, cw, ch: Math.min(ch, (ah - (rows - 1) * g) / rows), g }; }
  const { cols, rows, cw, ch, g } = best;
  const totalH = rows * ch + (rows - 1) * g;
  const top = y0 + Math.max(0, (ah - totalH - 14 * cw / 170) / 2);
  c.save(); c.translate(540, top + totalH / 2); c.rotate(-1.6 * Math.PI / 180); c.translate(-540, -(top + totalH / 2));
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols), col = i % cols;
    const inRow = row === rows - 1 ? n - row * cols : cols;
    const rowW = inRow * cw + (inRow - 1) * g;
    const x = 540 - rowW / 2 + col * (cw + g), y = top + row * (ch + g);
    card(c, k, x, y, cw, ch, rounds[i].score, rounds[i].doubled);
  }
  c.restore();
}
function pills(c, k, rows, cols, top, rowH, fs) {
  const gap = 16, vg = Math.min(16, rowH * 0.18), pw = (960 - gap * (cols - 1)) / cols;
  rows.forEach((r, i) => {
    const col = i % cols, row = Math.floor(i / cols), x = 60 + col * (pw + gap), y = top + row * (rowH + vg);
    c.save();
    if (r.winner) { c.fillStyle = ACC; k.rrect(c, x, y, pw, rowH, rowH * 0.23); c.fill(); }
    else { c.fillStyle = BG; k.rrect(c, x, y, pw, rowH, rowH * 0.23); c.fill(); c.strokeStyle = "rgba(47,217,168,0.33)"; c.lineWidth = 4; k.rrect(c, x + 2, y + 2, pw - 4, rowH - 4, rowH * 0.23 - 2); c.stroke(); }
    c.restore();
    const base = y + rowH / 2 + fs * 0.34;
    c.fillStyle = r.winner ? ON_ACC : INK;
    k.setFont(c, 400, fs, k.F_ANTON); c.textAlign = "right"; c.fillText(r.value, x + pw - 18, base); const vw = c.measureText(r.value).width; c.textAlign = "left";
    const rs = String(r.rank); k.setFont(c, 400, fs * 0.66, F_ARCHIVO); c.globalAlpha = 0.75; c.fillText(rs, x + 18, base); const rw = c.measureText(rs).width + 10; c.globalAlpha = 1;
    const f = k.fit(c, r.name, { w: 400, fam: k.F_ANTON, max: fs, min: Math.max(16, fs * 0.5), maxW: pw - 18 - 18 - vw - rw - 14, lines: 1 });
    k.setFont(c, 400, f.size, k.F_ANTON); c.fillText(f.lines[0], x + 18 + rw, base);
  });
}

function page1(d, k, rest) {
  const { cv, c } = k.tplCanvas();
  bg(c, k);
  const accTxt = ACC;
  const noCards = !(d.rounds && d.rounds.length);
  /* Titel und Regel */
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: F_ARCHIVO, max: 112, min: 56, maxW: 520, lines: 1 });
  k.setFont(c, 400, tf.size, F_ARCHIVO); c.fillStyle = accTxt; c.fillText(tf.lines[0], 56, 30 + 0.78 * tf.size + (112 - tf.size) * 0.1); const titleW = c.measureText(tf.lines[0]).width;
  const low = d.tr("tplSkyjoLow", "tief gewinnt");
  const lf = k.fit(c, low, { w: 400, fam: F_BRUSH, max: 64, min: 30, maxW: 1020 - 56 - titleW - 30, lines: 1 });
  k.setFont(c, 400, lf.size, F_BRUSH); c.fillStyle = accTxt; c.textAlign = "right"; c.fillText(lf.lines[0], 1020, 70 + lf.size * 0.8); c.textAlign = "left";
  /* Sieger */
  const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
  const name = d.up(win.map((r) => r.name).join(" & "));
  const hs = noCards ? 230 : 190;
  const hv = k.fit(c, win[0].value, { w: 400, fam: k.F_ANTON, max: hs, min: 110, maxW: noCards ? 480 : 400, lines: 1 });
  k.setFont(c, 400, hv.size, k.F_ANTON); const vw = c.measureText(win[0].value).width;
  const fo = { w: 400, fam: k.F_ANTON, maxW: 960 - 4 - vw - 50 };
  const nf = k.heroFit(c, name, fo, [{ max: hs, min: 118, lines: 1 }, { max: 110, min: 60, lines: 2 }, { max: 70, min: 30, lines: 3 }]);
  k.setFont(c, 400, nf.size, k.F_ANTON); const cap = k.capH(c);
  const asc = nf.lines.map((l) => Math.max(cap, c.measureText(l).actualBoundingBoxAscent || cap));
  const dsc = nf.lines.map((l) => Math.max(0, c.measureText(l).actualBoundingBoxDescent || 0));
  const gapL = (i) => asc[i + 1] + dsc[i] + nf.size * 0.1;
  let heroH = asc[0]; for (let i = 0; i < nf.lines.length - 1; i++) heroH += gapL(i);
  const n = Math.min(rest.length, k.ONE_PAGE);
  /* Plaettchen: ohne Rundenwerte gross und zusammen mit dem Sieger mittig, sonst kompakt unten */
  const pillGap = 16;
  const needs = (Lx) => { const pw = (960 - pillGap * (Lx.cols - 1)) / Lx.cols; k.setFont(c, 400, Lx.fs, k.F_ANTON); return rest.slice(0, n).every((r) => { const vw2 = c.measureText(r.value).width, nw = c.measureText(r.name).width; return nw <= pw - 36 - vw2 - Lx.fs * 0.6 - 24 - 14; }); };
  let L, heroBase, pillsTop;
  if (noCards) {
    const tieH = d.tie ? 60 : 0, zoneTop = 160, zoneBot = 1190, avail = zoneBot - zoneTop, heroBlock = heroH + tieH, gapHP = 80;
    const mk = (cols) => { const prow = Math.ceil(n / cols), rowH = Math.max(60, Math.min(140, (avail - heroBlock - gapHP) / prow - 16)); const vg = Math.min(16, rowH * 0.18); return { cols, prow, rowH, fs: Math.round(Math.min(68, rowH * 0.5)), vg, h: prow * rowH + (prow - 1) * vg }; };
    const pref = n <= 4 ? 1 : n <= 8 ? 2 : 3;
    L = mk(pref);
    for (let cc = pref; cc >= 1; cc--) { L = mk(cc); if (needs(L)) break; }
    const stack = heroBlock + (n ? gapHP + L.h : 0), top = zoneTop + Math.max(0, (avail - stack) * 0.42);
    heroBase = top + heroH; pillsTop = heroBase + tieH + gapHP;
  } else {
    const lay = (cols) => { const prow = Math.ceil(n / cols), rowH = prow <= 1 ? 96 : prow === 2 ? 84 : 72, fs = rowH >= 96 ? 46 : rowH >= 84 ? 42 : 38; const vg = Math.min(16, rowH * 0.18); return { cols, prow, rowH, fs, vg, h: prow * rowH + (prow - 1) * vg }; };
    /* Spalten: moeglichst 3; sind Namen dort zu eng, weniger Spalten, solange der Block hoechstens 440 px hoch bleibt */
    L = lay(Math.max(1, Math.min(3, n)));
    if (!needs(L)) for (const cc of [2, 1]) { if (cc >= L.cols) continue; const Lx = lay(cc); if (Lx.h <= 440 || cc === 2 && Lx.h <= 470) { L = Lx; if (needs(Lx)) break; } }
    pillsTop = 1190 - L.h; heroBase = nf.lines.length === 1 ? 310 : 330;
  }
  const bl = new Array(nf.lines.length); bl[nf.lines.length - 1] = heroBase;
  for (let i = nf.lines.length - 2; i >= 0; i--) bl[i] = bl[i + 1] - gapL(i);
  c.fillStyle = INK; k.setFont(c, 400, nf.size, k.F_ANTON); nf.lines.forEach((ln, i) => c.fillText(ln, 56, bl[i]));
  k.setFont(c, 400, hv.size, k.F_ANTON); c.fillStyle = ACC; c.textAlign = "right"; c.fillText(win[0].value, 1020, heroBase); c.textAlign = "left";
  /* Unterzeile: Runden von <Sieger> (links), Gleichstand (rechts) */
  const sub = d.rounds && d.rounds.length ? d.tr("tplSkyjoRounds", (n2) => n2) : "";
  const subY = heroBase + 56;
  let tieW = 0;
  if (d.tie) { const tl = d.tr("ecTied", "Gemeinsamer erster Platz"); const tf2 = k.fit(c, tl, { w: 400, fam: F_BRUSH, max: noCards ? 48 : 38, min: 24, maxW: 460, lines: 1 }); k.setFont(c, 400, tf2.size, F_BRUSH); c.fillStyle = ACC; c.textAlign = noCards ? "left" : "right"; c.fillText(tf2.lines[0], noCards ? 60 : 1020, subY); tieW = c.measureText(tf2.lines[0]).width + 30; c.textAlign = "left"; if (noCards) tieW = 0; }
  if (sub && typeof sub === "function") {
    const txt = sub(win[0].name);
    const sf = k.fit(c, txt, { w: 400, fam: F_BRUSH, max: 38, min: 26, maxW: 960 - tieW, lines: 1 });
    k.setFont(c, 400, sf.size, F_BRUSH); c.fillStyle = "rgba(255,255,255,0.85)"; c.fillText(sf.lines[0], 60, subY);
  }
  pills(c, k, rest.slice(0, n), L.cols, pillsTop, L.rowH, L.fs);
  /* Karten dazwischen */
  const y0 = subY + 28, y1 = pillsTop - 22;
  if (!noCards) cardsBlock(c, k, d.rounds, y0, y1 - y0);
  footer(c, k, d);
  return cv;
}

/* Extra: rounds je Eintrag (gleiche Reihenfolge wie die Rangliste). Rundenliste des ersten Siegers, hoechstens 36 Karten. */
function winnerRounds(d) {
  const ex = d.extra;
  if (!ex || !Array.isArray(ex.rounds)) return [];
  const idx = d.rows.findIndex((r) => r.winner);
  const rr = ex.rounds[idx < 0 ? 0 : idx];
  if (!Array.isArray(rr)) return [];
  return rr.filter((q) => q && isFinite(Number(q.score))).map((q) => ({ score: Math.round(Number(q.score)), doubled: !!q.doubled })).slice(0, 36);
}

export default {
  games: ["skyjo"],
  fonts: ["400 100px \"GTR Archivo\"", "400 100px \"GTR Brush\"", "400 100px \"GTR Anton\"", "800 52px \"Baloo 2\"", "700 26px \"Baloo 2\""],
  texts: (d) => [d.tr("tplSkyjoLow", ""), d.up(d.gameLabel), d.tr("ecTied", ""), "−×0123456789", d.winners.map((r) => r.name).join(" ")],
  render(d, k) {
    d.rounds = winnerRounds(d);
    const out = [page1(d, k, d.rows.slice(0, k.ONE_PAGE))];
    const rest = d.rows.slice(k.ONE_PAGE);
    const parts = k.chunks(rest, 12, 12).filter((p) => p.length);
    const sty = { bg: (c) => bg(c, k), ink: INK, sub: "rgba(47,217,168,0.8)", acc: ACC, line: "rgba(47,217,168,0.3)", fam: k.F_ANTON, logo: ACC, titleFam: F_ARCHIVO, titleCase: true, subFam: F_BRUSH,
      rowFill: BG, rowFillWin: ACC, rowEdge: "rgba(47,217,168,0.33)", winInk: ON_ACC };
    parts.forEach((p, i) => out.push(k.continuationPage(d, p, i + 2, parts.length + 1, sty)));
    return out;
  },
};
