// Ergebnisbild Mafia (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/mafia.png).
// Daten (shareExtra): {winner:"town"|"mafia", players:[{name, role (Rollenname in App-Sprache), team:"mafia"|"town", alive:bool}]}
// Statt "verhaftet" (gibt es im Spiel nicht): lebt/tot. Rote Faeden verbinden die Mafia-Mitglieder. 6 bis 18 Spielende, Polaroids skalieren.
import { footer, hash, fitWords, FONTS_BASE } from "./party-kit.js";

const GOLD = "#C9A15C", INK = "#1d1b19", WINE = "#a3151f";

function cork(c) {
  const W = 1080, H = 1350, im = c.createImageData(W, H), a = im.data, G = 26;
  const gw = Math.ceil(W / G) + 2, gh = Math.ceil(H / G) + 2, grid = new Float32Array(gw * gh);
  for (let i = 0; i < grid.length; i++) grid[i] = hash("c" + i) - 0.5;
  for (let y = 0; y < H; y++) {
    const gy = y / G, y0 = Math.floor(gy), fy = gy - y0;
    for (let x = 0; x < W; x++) {
      const gx = x / G, x0 = Math.floor(gx), fx = gx - x0;
      const v = grid[y0 * gw + x0] * (1 - fx) * (1 - fy) + grid[y0 * gw + x0 + 1] * fx * (1 - fy) + grid[(y0 + 1) * gw + x0] * (1 - fx) * fy + grid[(y0 + 1) * gw + x0 + 1] * fx * fy;
      let h = Math.imul(x * 374761393 + y * 668265263 + 1013904223, 1274126177); h ^= h >>> 15; h = Math.imul(h, 2246822519); h ^= h >>> 13; h >>>= 0;
      const gr = ((h & 255) / 255 - 0.5) * 34, p = (y * W + x) * 4, s = v * 30 + gr;
      a[p] = 169 + s; a[p + 1] = 123 + s * 0.9; a[p + 2] = 76 + s * 0.7; a[p + 3] = 255;
    }
  }
  c.putImageData(im, 0, 0);
}
function pickLayout(N, W, H, geo) {
  let best = null;
  for (let rows = 1; rows <= 5; rows++) {
    const cols = Math.ceil(N / rows);
    let w = Math.min(290, (W / cols) * 0.94);
    while (w > 40 && geo(w).cell * rows > H) w -= 2;
    if (!best || w > best.w) best = { rows, cols, w };
  }
  return best;
}
function render(d, k) {
  const { cv, c } = k.tplCanvas();
  const ex = d.extra, P = ex.players, N = P.length;
  cork(c);
  const dense = N > 9, D = dense ? 0.52 : 1;
  // Titelschild
  const fo = { w: 400, fam: k.F_ANTON, max: 170, min: 90, maxW: 780, ls: 0.04 };
  const tf = k.fit(c, d.up(d.gameLabel), fo), ts = tf.size, sp = ts * 0.04;
  k.setFont(c, 400, ts, k.F_ANTON);
  const tw = k.spacedW(c, tf.lines[0], sp) + sp, pw = tw + 80 + 12, ph = ts + 22 + 12;
  c.save(); c.translate(60, 50); c.scale(D, D); c.translate(pw / 2, ph / 2); c.rotate(-2 * Math.PI / 180);
  c.shadowColor = "rgba(0,0,0,0.47)"; c.shadowBlur = 20; c.shadowOffsetY = 10;
  c.fillStyle = "#0b0b0b"; c.fillRect(-pw / 2 - 4, -ph / 2 - 4, pw + 8, ph + 8); c.shadowColor = "transparent";
  c.fillStyle = GOLD; c.fillRect(-pw / 2, -ph / 2, pw, ph); c.fillStyle = "#0b0b0b"; c.fillRect(-pw / 2 + 6, -ph / 2 + 6, pw - 12, ph - 12);
  c.fillStyle = GOLD; k.setFont(c, 400, ts, k.F_ANTON); k.spaced(c, tf.lines[0], -pw / 2 + 46, k.cssBase(c, -ph / 2 + 6 + 14, ts), sp, "left");
  c.restore();
  // Polaroids (ab 10 Spielenden dichter: kleinere Fotos, Namen mindestens 24 px, Titel und Stempel kleiner)
  const top = dense ? 200 : 335, bottom = dense ? 1000 : 872;
  const geo = (w2) => {
    if (!dense) return { h: w2 * 1.31, tagH: w2 * 0.3, cell: w2 * 1.31 + w2 * 0.3, pad: 20 * w2 / 290 };
    const pad = 0.07 * w2, phh = 0.5 * (w2 - 2 * pad), h2 = pad + phh + 8 + 78;
    return { h: h2, tagH: 58, cell: h2 + 58, pad, phh };
  };
  const L = pickLayout(N, 940, bottom - top, geo), w = L.w, G = geo(w), h = G.h, cellH = G.cell;
  const pos = P.map((p, i) => {
    const row = Math.floor(i / L.cols), inRow = Math.min(L.cols, N - row * L.cols), cw = 940 / L.cols;
    const cx = 540 - (inRow * cw) / 2 + (i - row * L.cols) * cw + cw / 2;
    const y0 = top + (bottom - top - L.rows * cellH) / 2 + row * cellH + (hash(p.name + "y" + i) - 0.5) * w * (dense ? 0.04 : 0.12);
    return { x: cx, y: y0, rot: (hash(p.name + i) - 0.5) * (dense ? 6 : 9) * Math.PI / 180 };
  });
  const mafia = pos.map((q, i) => (P[i].team === "mafia" ? i : -1)).filter((i) => i >= 0);
  const pin = (q) => ({ x: q.x, y: q.y + 15 * (w / 290) + 4 });
  const threads = () => {
    c.strokeStyle = "#b3202a"; c.lineWidth = Math.max(3, 5 * w / 290); c.lineCap = "round";
    for (let i = 0; i + 1 < mafia.length; i++) {
      const a = pin(pos[mafia[i]]), b = pin(pos[mafia[i + 1]]);
      c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 - Math.min(40, w * 0.22) - Math.abs(b.x - a.x) * 0.04, b.x, b.y); c.stroke();
    }
  };
  const pins = () => {
    P.forEach((p, i) => { const q = pin(pos[i]); c.fillStyle = GOLD; c.strokeStyle = "#6b4e1c"; c.lineWidth = 3; c.beginPath(); c.arc(q.x, q.y, Math.max(7, 15 * w / 290), 0, 7); c.fill(); c.stroke(); });
  };
  threads();
  const alive = d.tr("tplPartyAlive", "lebt"), dead = d.tr("tplPartyDead", "tot");
  P.forEach((p, i) => {
    const q = pos[i], s = w / 290;
    c.save(); c.translate(q.x, q.y + h / 2); c.rotate(q.rot); c.translate(-w / 2, -h / 2);
    c.shadowColor = "rgba(0,0,0,0.47)"; c.shadowBlur = 24 * s; c.shadowOffsetY = 14 * s;
    c.fillStyle = "#f3ecdc"; c.fillRect(0, 0, w, h); c.shadowColor = "transparent";
    const px = G.pad, py = G.pad, pw2 = w - 2 * G.pad, ph2 = dense ? G.phh : pw2 * 250 / 250 * (250 * s / pw2);
    const PW = dense ? pw2 : 250 * s, PH = dense ? G.phh : 250 * s;
    const g = c.createLinearGradient(0, py, 0, py + PH); g.addColorStop(0, "#cfcab9"); g.addColorStop(1, "#8f8a7c"); c.fillStyle = g; c.fillRect(px, py, PW, PH);
    c.save(); c.beginPath(); c.rect(px, py, PW, PH); c.clip(); c.translate(px, py);
    const sc2 = PW / 250; c.save(); if (dense) { const k2 = sc2 * 0.875; c.translate(PW / 2 - 125 * k2, 0.36 * PH - 98 * k2); c.scale(k2, k2); } else c.scale(sc2, sc2);
    c.fillStyle = INK; c.beginPath(); c.arc(125, 98, 52, 0, 7); c.fill();
    c.beginPath(); c.moveTo(20, 250); c.bezierCurveTo(25, 175, 70, 158, 125, 158); c.bezierCurveTo(180, 158, 225, 175, 230, 250); c.closePath(); c.fill(); c.restore();
    if (!p.alive) { c.fillStyle = "rgba(20,15,10,0.38)"; c.fillRect(0, 0, PW, PH); c.strokeStyle = "rgba(163,21,31,0.85)"; c.lineWidth = Math.max(6, 16 * sc2); c.lineCap = "round"; c.beginPath(); c.moveTo(PW * 0.16, PH * 0.16); c.lineTo(PW * 0.84, PH * 0.84); c.moveTo(PW * 0.84, PH * 0.16); c.lineTo(PW * 0.16, PH * 0.84); c.stroke(); }
    c.restore(); void ph2;
    const ny = py + PH + (dense ? 8 : 14 * s), nh = h - ny - (dense ? 2 : 4 * s);
    const nf = fitWords(c, k, d.clean(p.name), dense ? { w: 700, fam: k.F_KALAM, max: 30, min: 22, floor: 15, maxW: w - 12, lines: 2 } : { w: 700, fam: k.F_KALAM, max: 52 * s, min: Math.max(12, 20 * s), maxW: w - 24 * s, lines: 2 });
    const lh = nf.size * 1.0, blockH = lh * nf.lines.length, y0 = ny + Math.max(0, (nh - blockH) / 2) - 2 * s;
    k.setFont(c, 700, nf.size, k.F_KALAM); c.fillStyle = INK; c.textAlign = "center";
    nf.lines.forEach((ln, q2) => c.fillText(ln, w / 2, k.cssBase(c, y0 + q2 * lh, lh)));
    c.textAlign = "left"; c.restore();
  });
  pins();
  // Notizzettel mit Rolle
  P.forEach((p, i) => {
    const q = pos[i], s = w / 290, tw2 = dense ? w * 0.94 : w * 0.84, th2 = dense ? G.tagH : w * 0.3;
    const tx = q.x - tw2 / 2 + (hash(p.name + "t") - 0.5) * w * 0.05, ty = q.y + h - (dense ? 10 : 6 * s);
    const mf = p.team === "mafia";
    c.save(); c.translate(tx + tw2 / 2, ty + th2 / 2); c.rotate((hash(p.name + "r" + i) - 0.5) * (dense ? 6 : 11) * Math.PI / 180);
    c.shadowColor = "rgba(0,0,0,0.4)"; c.shadowBlur = 14 * s; c.shadowOffsetY = 8 * s;
    c.fillStyle = mf ? GOLD : "#f6efa8"; c.fillRect(-tw2 / 2, -th2 / 2, tw2, th2); c.shadowColor = "transparent";
    const txt = d.clean(p.role) + ", " + (p.alive ? alive : dead);
    const f = fitWords(c, k, txt, dense ? { w: 700, fam: k.F_KALAM, max: 25, min: 20, maxW: tw2 - 8, lines: 2 } : { w: 700, fam: k.F_KALAM, max: 38 * s, min: Math.max(11, 17 * s), maxW: tw2 - 16 * s, lines: 2 });
    const lh = f.size * 1.08, bh = lh * f.lines.length;
    k.setFont(c, 700, f.size, k.F_KALAM); c.fillStyle = INK; c.textAlign = "center";
    f.lines.forEach((ln, q2) => c.fillText(ln, 0, k.cssBase(c, -bh / 2 + q2 * lh, lh)));
    c.restore();
  });
  // Stempel
  const l1 = d.up(d.tr("tplMafCase", "Fall abgeschlossen")), l2 = d.up(d.tr(ex.winner === "mafia" ? "tplMafWinM" : "tplMafWinT", "Die Mafia gewinnt"));
  const big = k.fit(c, l2, { w: 400, fam: k.F_ANTON, max: 116, min: 50, maxW: 880, ls: 0.03 }), sm = k.fit(c, l1, { w: 400, fam: k.F_ANTON, max: Math.min(72, big.size * 0.62), min: 30, maxW: 880, ls: 0.08 });
  const sh = sm.size * 1.1, bh2 = big.size * 1.05, boxH = 10 + sh + bh2 + 4 + 24;
  const SS = dense ? 0.6 : 1, stTop = dense ? Math.min(1012, top + (bottom - top + L.rows * cellH) / 2 + 36) : 900;
  c.save(); c.translate(540, stTop + boxH * SS / 2); c.scale(SS, SS); c.rotate(-4 * Math.PI / 180); c.globalCompositeOperation = "multiply";
  c.fillStyle = "rgba(243,236,220,0.6)"; c.fillRect(-480, -boxH / 2, 960, boxH);
  c.strokeStyle = WINE; c.lineWidth = 12; c.strokeRect(-474, -boxH / 2 + 6, 948, boxH - 12);
  c.fillStyle = WINE; c.textAlign = "left";
  k.setFont(c, 400, sm.size, k.F_ANTON); k.spaced(c, sm.lines[0], 0, k.cssBase(c, -boxH / 2 + 22, sh), sm.size * 0.08, "center");
  k.setFont(c, 400, big.size, k.F_ANTON); k.spaced(c, big.lines[0], 0, k.cssBase(c, -boxH / 2 + 22 + sh, bh2), big.size * 0.03, "center");
  c.restore();
  // Band und Fusszeile
  c.fillStyle = "#0b0b0b"; c.fillRect(0, 1150, 1080, 200);
  footer(c, k, d, GOLD, 48);
  return [cv];
}

export default {
  games: ["mafia"],
  fonts: ['400 100px "GTR Anton"', '700 52px "Kalam"'].concat(FONTS_BASE),
  accepts: (d) => !!(d.extra && Array.isArray(d.extra.players) && d.extra.players.length >= 2 && d.extra.winner),
  texts: (d) => (d.extra ? [d.extra.players.map((p) => p.name + " " + p.role).join(" "), d.up(d.tr("tplMafCase", "") + d.tr("tplMafWinM", "") + d.tr("tplMafWinT", "")), d.tr("tplPartyAlive", "") + d.tr("tplPartyDead", ""), ", "] : []),
  render,
};
