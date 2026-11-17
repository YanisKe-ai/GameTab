// Ergebnisbild Minigolf (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/minigolf.png, Anzeigetafel auf Rasengruen).
// Daten: Rang und Gesamtschlaege (gtEcModel, weniger ist besser). Zusatz (shareExtra aus MinigolfPlay): {players:[{name, total, strokes:[18 Schlaege]}]}.
// Kein PAR (gibt es im Spiel nicht): Abstand zum Sieger "+n". Hole in one nur, wo ein Schlag 1 wirklich eingetragen ist.
import { pickRows } from "./util.js";
import { titleTilt, pill } from "./ryu-b.js";

const LIME = "#D6F23A", SOFT = "#B9D9A8", INK = "#F2F4E0", TILE = "#F7F5E6", TILE_INK = "#0F3A1C", GOLD = "#FFD84A";
const FIRST_CAP = 10;
const MONO = '"Space Grotesk","Inter","GT Clean","GT CJK",sans-serif';

function bg(c, k) {
  c.fillStyle = "#0B1F10"; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  // Holzrahmen: inset 34, Rand 14, Radius 10
  c.fillStyle = "#5A3A1E"; k.rrect(c, 34, 34, 1012, 1282, 10); c.fill();
  c.fillStyle = "#0F3A1C"; k.rrect(c, 48, 48, 984, 1254, 4); c.fill();
  k.insetShadow(c, 48, 48, 984, 1254, 4, 120, "#04140A");
  c.save(); k.rrect(c, 48, 48, 984, 1254, 4); c.clip(); c.strokeStyle = "#7A5230"; c.lineWidth = 8; k.rrect(c, 48, 48, 984, 1254, 4); c.stroke(); c.restore();
  c.fillStyle = "rgba(255,255,255,0.024)"; for (let x = 48; x < 1032; x += 26) c.fillRect(x, 48, 2, 1254);
}
function tile(c, k, x, y, w, h, ch) {
  c.fillStyle = "#B9B79E"; k.rrect(c, x, y + 5, w, h, 8); c.fill();
  c.save(); c.shadowColor = "rgba(0,0,0,0.53)"; c.shadowBlur = 14; c.shadowOffsetY = 10; c.fillStyle = TILE; k.rrect(c, x, y, w, h, 8); c.fill(); c.restore();
  c.fillStyle = TILE; k.rrect(c, x, y, w, h, 8); c.fill();
  c.fillStyle = "#8C8A74"; const r = Math.max(2.5, h * 0.033); [x + 8 + r, x + w - 8 - r].forEach((px) => { c.beginPath(); c.arc(px, y + 8 + r, r, 0, 7); c.fill(); });
  const fs = h * 0.78; k.setFont(c, 400, fs, k.F_ANTON); c.fillStyle = TILE_INK; c.textAlign = "center";
  c.fillText(ch, x + w / 2, y + h / 2 + k.capH(c) / 2 + h * 0.02); c.textAlign = "left";
}
function logoHead(c, k, d) {
  const lw = k.logo(c, d.logo, 100, 96, 100, LIME);
  k.setFont(c, 800, 50, k.F_BALOO); c.fillStyle = LIME; c.fillText("GameTab", 100 + lw + 22, 96 + 50 + 18);
}
function footer(c, k, d, line) {
  c.fillStyle = SOFT; c.textAlign = "center";
  if (line) { const f = k.fit(c, line, { w: 600, fam: MONO, max: 28, min: 16, maxW: 900, lines: 1 }); k.setFont(c, 600, f.size, MONO); c.fillText(f.lines[0], 540, 1250); }
  k.setFont(c, 500, 22, MONO); c.globalAlpha = 0.85; c.fillText(d.date, 540, 1282); c.globalAlpha = 1; c.textAlign = "left";
}
function stamp(c, k, lines, rightX, top) {
  c.save(); k.setFont(c, 400, 30, k.F_ANTON);
  const fs = lines.map((l, i) => k.fit(c, l, { w: 400, fam: k.F_ANTON, max: 30, min: 18, maxW: 400, lines: 1 }));
  const w = Math.max(...fs.map((f, i) => { k.setFont(c, 400, f.size, k.F_ANTON); return k.spacedW(c, f.lines[0], f.size * 0.06); })) + 36 + 10;
  const h = fs.reduce((a, f) => a + f.size * 1.1, 0) + 12 + 10;
  c.translate(rightX - w / 2, top + h / 2); c.rotate(-6 * Math.PI / 180);
  c.fillStyle = "#0F3A1C"; k.rrect(c, -w / 2, -h / 2, w, h, 14); c.fill();
  c.strokeStyle = GOLD; c.lineWidth = 5; k.rrect(c, -w / 2 + 2.5, -h / 2 + 2.5, w - 5, h - 5, 12); c.stroke();
  c.fillStyle = GOLD; c.textAlign = "center"; let y = -h / 2 + 5 + 6;
  fs.forEach((f) => { k.setFont(c, 400, f.size, k.F_ANTON); y += f.size * 0.92; k.spaced(c, f.lines[0], 0, y, f.size * 0.06, "center"); y += f.size * 0.18; });
  c.restore();
}
/* Zeilen: Rang, Name, Kacheln mit den Schlaegen, Abstand */
function rows(c, k, d, list, gap, top, n, limit) {
  const sz0 = (r) => r.winner ? (n <= 2 ? { th: 190, nm: 120 } : n <= 3 ? { th: 138, nm: 96 } : n === 4 ? { th: 110, nm: 78 } : n <= 6 ? { th: 84, nm: 60 } : { th: 66, nm: 50 }) : (n <= 2 ? { th: 140, nm: 84 } : n <= 3 ? { th: 100, nm: 64 } : n === 4 ? { th: 64, nm: 50 } : n === 5 ? { th: 52, nm: 44 } : n <= 7 ? { th: 42, nm: 36 } : n === 8 ? { th: 38, nm: 34 } : { th: 32, nm: 30 });
  const ov = n <= 5 ? 29 : 17;
  // Viele Spieler: Zeilenhoehe aus dem freien Platz ableiten (Kacheln und Namen so gross wie moeglich)
  const dense = n >= 8 && limit;
  const pitchD = dense ? (limit - top - 14) / n : 0;
  const sz = (r) => { if (!dense) return sz0(r); const th = Math.min(72, pitchD - ov) + (r.winner ? 14 : 0); return { th, nm: Math.min(th * 0.8, r.winner ? 60 : 52) }; };
  let y = top;
  list.forEach((r) => {
    const s = sz(r), digits = Array.from(String(r.value).replace(/[^0-9]/g, "")), nd = digits.length || 1;
    const tw = Math.round(s.th * (nd >= 3 ? 0.58 : 0.72)), tg = 8;
    const prW = r.winner ? 140 : 120, rowH = s.th + ov;
    c.fillStyle = "rgba(214,242,58,0.33)"; c.fillRect(100, y, 880, 3);
    const ty = y + 3 + (n <= 5 ? 14 : 7);
    // Kacheln
    const tilesW = nd * tw + (nd - 1) * tg, tx = 980 - prW - 30 - tilesW;
    digits.forEach((ch, i) => tile(c, k, tx + i * (tw + tg), ty, tw, s.th, ch));
    const bl = ty + s.th / 2;
    k.setFont(c, 400, s.nm * 0.94, k.F_ANTON); c.fillStyle = LIME; const cap = k.capH(c);
    c.fillText(String(r.rank), 100, bl + cap / 2);
    const nx = 170, nw = tx - 30 - nx;
    const f = k.nameFit(c, r.name, { w: 400, fam: k.F_ANTON, max: s.nm, maxW: nw, ls: 0.04, oneMin: 0.78, max2: Math.max(24, (s.th + ov - 8) / 2.2) });
    const sp = f.sp;
    k.setFont(c, 400, f.size, k.F_ANTON); c.fillStyle = r.winner ? "#FFFFFF" : INK;
    const lh = f.size * 1.08, capN = k.capH(c);
    f.lines.forEach((ln, i) => { const yy = bl - ((f.lines.length - 1) * lh) / 2 + i * lh + capN / 2; if (sp) k.spaced(c, ln, nx, yy, f.size * 0.04, "left"); else c.fillText(ln, nx, yy); });
    if (gap[r.rank] != null && !r.winner) {
      k.setFont(c, 600, 44, MONO); c.fillStyle = LIME; c.textAlign = "right"; c.fillText("+" + d.num(gap[r.rank]), 980, bl + 16); c.textAlign = "left";
    }
    y += rowH;
  });
  return y;
}
function page1(d, k, extras, rowsList, pageNo, pageCount) {
  const { cv, c } = k.tplCanvas();
  bg(c, k); logoHead(c, k, d);
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: k.F_ANTON, max: 104, min: 50, maxW: 860, lines: 1, ls: 0.06 });
  k.setFont(c, 400, tf.size, k.F_ANTON); c.fillStyle = LIME; k.spaced(c, tf.lines[0], 540, k.cssBase(c, 240, tf.size), tf.size * 0.06, "center");
  const holes = extras.holes;
  const sub = d.up(d.tr("tplMgSub", (n) => n + " holes")(holes));
  const sf = k.fit(c, sub, { w: 600, fam: MONO, max: 28, min: 16, maxW: 880, lines: 1, ls: 0.12 });
  k.setFont(c, 600, sf.size, MONO); c.fillStyle = SOFT; k.spaced(c, sub, 540, 365 + sf.size * 0.9, sf.size * 0.12, "center");
  const best = d.winners.length ? d.winners[0].score : null;
  const gap = {}; d.rows.forEach((r) => { if (best != null && r.score != null) gap[r.rank] = r.score - best; });
  const nShown = rowsList.length;
  const compact = nShown >= 8;
  const endY = rows(c, k, d, rowsList, gap, 440, nShown, compact ? (extras.aces.length ? 1135 : 1180) : 0);
  // Schlaege des Siegers pro Bahn
  const w0 = d.winners[0] || d.rows[0], st = extras.byRow[d.rows.indexOf(w0)];
  const strokes = st && Array.isArray(st.strokes) ? st.strokes : null;
  const gt = 1010;
  if (strokes && strokes.length === holes && !compact) {
    const lab = d.up(d.tr("tplMgPer", (nm) => nm)(w0.name));
    const lf = k.fit(c, lab, { w: 600, fam: MONO, max: 22, min: 14, maxW: 440, lines: 1, ls: 0.14 });
    k.setFont(c, 500, lf.size, MONO); c.fillStyle = SOFT; k.spaced(c, lf.lines[0], 100, gt - 12 - 6, lf.size * 0.14, "left");
    const cols = 9, gw = (880 - 8 * (cols - 1)) / cols, ch = 76, rowsN = Math.ceil(holes / cols);
    strokes.forEach((v, i) => {
      const x = 100 + (i % cols) * (gw + 8), y = gt + Math.floor(i / cols) * (ch + 8);
      c.fillStyle = "#0A2A14"; k.rrect(c, x, y, gw, ch, 6); c.fill();
      c.strokeStyle = "rgba(214,242,58,0.33)"; c.lineWidth = 2; k.rrect(c, x + 1, y + 1, gw - 2, ch - 2, 5); c.stroke();
      k.setFont(c, 500, 16, MONO); c.fillStyle = "#8FB583"; c.textAlign = "center"; c.fillText(String(i + 1), x + gw / 2, y + 22);
      const t = v == null ? "–" : String(v); k.setFont(c, 400, 34, k.F_ANTON); c.fillStyle = v === 1 ? LIME : "#FFFFFF"; c.fillText(t, x + gw / 2, y + 22 + 8 + 34 * 0.86 - 2); c.textAlign = "left";
    });
    void rowsN;
  }
  // Hole in one
  const aces = extras.aces;
  if (aces.length && pageNo === 1) {
    const a0 = aces[0];
    const l2 = a0.name + ", " + d.tr("tplMgHole", (l) => l)(a0.holes.join(", ")) + (aces.length > 1 ? " +" + (aces.length - 1) : "");
    // Stempel nur, wenn er samt Drehung ueber der Beschriftung "Schlaege pro Bahn" Platz hat (Hoehe ca. 100), sonst kleine Marke rechts auf der Beschriftungszeile
    if (endY + 22 + 100 + 24 > gt - 50 || compact) {
      // viele Spieler: kleine Marke neben der Beschriftung statt gedrehtem Stempel
      const txt = d.up(d.tr("tplMgAce", "Hole in one")) + ": " + l2;
      const bf = k.fit(c, txt, { w: 400, fam: k.F_ANTON, max: 24, min: 14, maxW: 340, lines: 1 });
      const ay = compact ? 1155 : gt - 52;
      k.setFont(c, 400, bf.size, k.F_ANTON); const bw = c.measureText(bf.lines[0]).width + 28;
      c.strokeStyle = GOLD; c.lineWidth = 3; k.rrect(c, 980 - bw, ay, bw, 38, 10); c.stroke();
      c.fillStyle = GOLD; c.textAlign = "center"; c.fillText(bf.lines[0], 980 - bw / 2, ay + 19 + k.capH(c) / 2); c.textAlign = "left";
    } else stamp(c, k, [d.up(d.tr("tplMgAce", "Hole in one")), l2], 810, endY + 22);
  }
  // Fusszeile
  const win = d.winners, val = win.length ? d.num(win[0].score) : "";
  const line = d.tie ? d.tr("tplMgTie", (n) => n + "")(val) : "";
  footer(c, k, d, line);
  void pageCount;
  return cv;
}

/* ---------- Ryū-Fassung (Runde 2): Draufsicht auf die Bahn ----------
   Sieger-Ball sitzt im Loch unter der Fahne (Explosion, Krone), Name riesig, Schlaege als schwarze Kacheln.
   Die anderen landen im Teich (Wellenringe) oder im Sandbunker, mit Schlaegen und Abstand «+n». Spruch «Ab in den Teich.». */
function blob(c, x, y, w, h, seed) {
  const N = 72; c.beginPath();
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a), wob = 1 + 0.022 * Math.sin(5 * a + seed) + 0.015 * Math.sin(9 * a + seed * 2);
    const px = x + w / 2 + Math.sign(cs) * Math.pow(Math.abs(cs), 0.42) * (w / 2) * wob, py = y + h / 2 + Math.sign(sn) * Math.pow(Math.abs(sn), 0.42) * (h / 2) * wob;
    if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.closePath();
}
function golfBall(c, R, x, y, r, txt, k, fs) {
  c.fillStyle = R.INK; c.beginPath(); c.arc(x + r * 0.12, y + r * 0.14, r, 0, 6.2832); c.fill();
  c.fillStyle = R.CR; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); c.lineWidth = Math.max(3, r * 0.1); c.strokeStyle = R.INK; c.stroke();
  c.fillStyle = "rgba(26,23,22,0.18)";
  for (let i = 0; i < 9; i++) { const a = i * 2.4, q = r * (0.35 + 0.5 * ((i * 37) % 10) / 10); c.beginPath(); c.arc(x + Math.cos(a) * q * 0.9, y + Math.sin(a) * q * 0.9, Math.max(1.5, r * 0.05), 0, 6.2832); c.fill(); }
  if (txt != null) { k.setFont(c, 400, fs || r * 1.0, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = "center"; c.fillText(String(txt), x, y + (fs || r) * 0.36); c.textAlign = "left"; }
}
function crown(c, R, x, y, w) {
  const h = w * 0.62; c.save(); c.translate(x, y); c.rotate(-8 * Math.PI / 180);
  c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -h * 0.7); c.lineTo(-w * 0.25, -h * 0.3); c.lineTo(0, -h); c.lineTo(w * 0.25, -h * 0.3); c.lineTo(w / 2, -h * 0.7); c.lineTo(w / 2, 0); c.closePath();
  c.fillStyle = R.INK; c.save(); c.translate(5, 5); c.fill(); c.restore(); c.fillStyle = R.RED; c.fill(); c.lineWidth = 5; c.lineJoin = "round"; c.strokeStyle = R.INK; c.stroke();
  c.fillStyle = R.CR; [[-w / 2, -h * 0.7], [0, -h], [w / 2, -h * 0.7]].forEach((q) => { c.beginPath(); c.arc(q[0], q[1], w * 0.07, 0, 6.2832); c.fill(); c.stroke(); });
  c.restore();
}
/* Wie k.heroFit, aber ueberspringt Stufen, in denen ein Wort mitten durchgetrennt wuerde */
function heroFitW(c, k, text, o, tiers) {
  let f = null; const words = text.split(/\s+/).filter(Boolean);
  for (let i = 0; i < tiers.length; i++) {
    for (let sz = tiers[i].max; sz >= tiers[i].min; sz -= 4) {
      f = k.fit(c, text, Object.assign({}, o, tiers[i], { max: sz, min: sz }));
      if (!f.cut && words.every((w) => f.lines.some((ln) => ln.indexOf(w) >= 0))) return f;
    }
  }
  return k.heroFit(c, text, o, tiers);
}
function ryuPage1(d, k, R, extras, rowsList) {
  const { cv, c } = k.tplCanvas(); R.bg(c, R.RED, 1818);
  R.dots(c, 560, 0, 520, 280, 26, 4.2, "rgba(26,23,22,0.16)");
  titleTilt(c, k, R, d, 64, 170, -4, 760, 130);
  const holes = extras.holes;
  const sub = d.up(d.tr("tplMgSub", (q) => q + " holes")(holes));
  const sp = pill(c, k, R, sub, 64, 212, 30, -2, { maxW: 520 });
  const win = rowsList.filter((r) => r.winner), rest = rowsList.filter((r) => !r.winner), allWin = d.winners, hasLosers = allWin.length < d.rows.length;
  const best = allWin.length ? allWin[0].score : null, val = allWin.length ? d.num(allWin[0].score) : "";
  if (d.tie) { const tl = d.tr("tplMgTie", (q) => q + "")(val); pill(c, k, R, tl, 64 + sp.w + 20, 212, 30, 2, { maxW: Math.max(200, 1020 - (64 + sp.w + 20)), fill: R.CR, ink: R.INK }); }
  const aces = extras.aces;
  const nRest = rest.length, zTop0 = aces.length ? 740 : 650, bottom0 = 1172, cols0 = nRest > 5, pondN0 = Math.ceil(nRest / 2), sandN0 = nRest - pondN0;
  const pitch0 = nRest ? (cols0 ? Math.min(100, (bottom0 - zTop0 - 80) / pondN0) : Math.min(190, (bottom0 - zTop0 - (sandN0 ? 160 : 90) - 18) / nRest)) : 0;
  const zonesH = nRest ? (cols0 ? pondN0 * pitch0 + 80 : pondN0 * pitch0 + 80 + (sandN0 ? sandN0 * pitch0 + 80 + 18 : 0)) : 0;
  const leftover = nRest ? Math.max(0, bottom0 - zTop0 - zonesH) : 0, shiftHero = Math.min(100, leftover * 0.35), shiftZ = Math.min(300, leftover * 0.8);
  if (aces.length) {
    const a0 = aces[0], l2 = a0.name + ", " + d.tr("tplMgHole", (l) => l)(a0.holes.join(", ")) + (aces.length > 1 ? " +" + (aces.length - 1) : "");
    R.stamp(c, k, d.up(d.tr("tplMgAce", "Hole in one")) + ": " + l2, 540, 668 + shiftHero, 34, 2, R.INK, 940);
  }
  /* ---- Sieger-Zone ---- */
  const dy = rest.length ? shiftHero : 170, hx = 212, hy = 465 + dy;
  R.burst(c, hx, hy, 205, 146, 15, { fill: R.CR, sh: 12, lw: 6, rot: 8 });
  c.fillStyle = R.INK; c.beginPath(); c.ellipse(hx, hy + 56, 118, 40, 0, 0, 6.2832); c.fill();
  c.fillStyle = R.INK; R.rr(c, hx + 100, hy - 160, 10, 215, 4); c.fill();
  c.beginPath(); c.moveTo(hx + 110, hy - 158); c.lineTo(hx + 172, hy - 128); c.lineTo(hx + 110, hy - 96); c.closePath(); c.fillStyle = R.INK; c.save(); c.translate(6, 6); c.fill(); c.restore();
  c.fillStyle = R.RED; c.fill(); c.lineWidth = 5; c.lineJoin = "round"; c.strokeStyle = R.INK; c.stroke();
  golfBall(c, R, hx - 8, hy + 18, 62, null, k);
  c.fillStyle = R.INK; c.beginPath(); c.ellipse(hx, hy + 56, 118, 40, 0, 0, Math.PI); c.fill();
  crown(c, R, hx - 8, hy - 42, 100);
  const names = d.up(win.map((r) => r.name).join(" & "));
  const nf = heroFitW(c, k, names, { w: 400, fam: R.F_BAGEL, maxW: 590 }, [{ max: 210, min: 84, lines: 1 }, { max: 120, min: 60, lines: 2 }, { max: 76, min: 40, lines: 3 }, { max: 52, min: 26, lines: 4 }]);
  const lh = nf.size * 1.02, nameH = nf.lines.length * lh, th = nf.lines.length >= 3 ? 72 : 108;
  const blockH = nameH + 22 + th, top0 = hy - 20 - blockH / 2 + 10;
  c.save(); c.translate(425, top0); c.rotate(-2.5 * Math.PI / 180);
  nf.lines.forEach((ln, j) => R.pop(c, ln, 0, nf.size * 0.82 + j * lh, nf.size, { fill: R.CR, sh: nf.size * 0.06, sw: nf.size * 0.11 }));
  const digits = Array.from(String(win.length ? win[0].value : "").replace(/[^0-9]/g, "")), nd = digits.length || 1, tw = th * (nd >= 3 ? 0.64 : 0.76), tg = 8;
  digits.forEach((ch, q) => {
    const x = q * (tw + tg) + 6, y0 = nameH + 22;
    c.fillStyle = R.INK; R.rr(c, x + 6, y0 + 6, tw, th, 10); c.fill(); c.fillStyle = R.CR; R.rr(c, x, y0, tw, th, 10); c.fill(); c.lineWidth = 4; c.strokeStyle = R.INK; R.rr(c, x, y0, tw, th, 10); c.stroke();
    k.setFont(c, 400, th * 0.76, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = "center"; c.fillText(ch, x + tw / 2, y0 + th / 2 + th * 0.76 * 0.36); c.textAlign = "left";
  });
  c.restore();
  /* ---- Teich und Sandbunker ---- */
  const n = rest.length;
  if (n) {
    const zTop = zTop0 + shiftZ, cols = cols0;
    const pondN = cols ? Math.ceil(n / 2) : Math.ceil(n / 2), sandN = n - pondN;
    const pitch = pitch0;
    const zones = [];
    if (cols) { const hh = pondN * pitch + 80; zones.push({ kind: "pond", rows: rest.filter((_, i) => i % 2 === 0), x: 40, y: zTop, w: 505, h: hh }); zones.push({ kind: "sand", rows: rest.filter((_, i) => i % 2 === 1), x: 555, y: zTop, w: 485, h: hh }); }
    else {
      const ph = pondN * pitch + 80; zones.push({ kind: "pond", rows: rest.slice(0, pondN), x: 40, y: zTop, w: 1000, h: ph });
      if (sandN) zones.push({ kind: "sand", rows: rest.slice(pondN), x: 40, y: zTop + ph + 18, w: 1000, h: sandN * pitch + 80 });
    }
    zones.forEach((z, zi) => {
      const pond = z.kind === "pond", ink = pond ? R.CR : R.INK, bgc = pond ? R.INK : R.CR2;
      c.fillStyle = R.INK; blob(c, z.x + 9, z.y + 9, z.w, z.h, 3 + zi); c.fill();
      c.fillStyle = bgc; blob(c, z.x, z.y, z.w, z.h, 3 + zi); c.fill();
      c.save(); blob(c, z.x, z.y, z.w, z.h, 3 + zi); c.clip();
      if (pond) { c.strokeStyle = R.CR; c.lineWidth = 3; c.setLineDash([30, 22]); c.globalAlpha = 0.4; [14, 30].forEach((q) => { blob(c, z.x + q, z.y + q, z.w - 2 * q, z.h - 2 * q, 3 + zi); c.stroke(); }); c.setLineDash([]); c.globalAlpha = 1; }
      else R.dots(c, z.x, z.y, z.w, z.h, 22, 3.2, "rgba(26,23,22,0.22)");
      c.restore();
      c.lineWidth = 6; c.strokeStyle = R.INK; blob(c, z.x, z.y, z.w, z.h, 3 + zi); c.stroke();
      const padX = cols ? 44 : 80, ix = z.x + padX, iw = z.w - padX * 2, br = Math.min(cols ? 34 : 46, pitch * 0.36);
      z.rows.forEach((r, i) => {
        const cy = z.y + 40 + i * pitch + pitch / 2, bx = ix + br;
        if (pond) { c.strokeStyle = R.CR; c.lineWidth = 3; c.globalAlpha = 0.5; [1.55, 2.1].forEach((q) => { c.beginPath(); c.ellipse(bx, cy + br * 0.2, br * q, br * q * 0.42, 0, 0, 6.2832); c.stroke(); }); c.globalAlpha = 1; }
        golfBall(c, R, bx, cy, br, r.rank, k, br * 1.05);
        const th2 = Math.min(pitch * 0.66, cols ? 60 : 78), digs = Array.from(String(r.value).replace(/[^0-9]/g, "")), ndg = digs.length || 1, tw2 = th2 * (ndg >= 3 ? 0.62 : 0.72), tg2 = 5, tilesW = ndg * tw2 + (ndg - 1) * tg2;
        let rx = ix + iw;
        digs.forEach((ch, q2) => {
          const x = rx - tilesW + q2 * (tw2 + tg2), y0 = cy - th2 / 2;
          c.fillStyle = pond ? R.CR : R.INK; R.rr(c, x, y0, tw2, th2, 8); c.fill();
          k.setFont(c, 400, th2 * 0.74, R.F_BAGEL); c.fillStyle = pond ? R.INK : R.CR; c.textAlign = "center"; c.fillText(ch, x + tw2 / 2, y0 + th2 / 2 + th2 * 0.74 * 0.36); c.textAlign = "left";
        });
        rx -= tilesW + 14;
        if (best != null && r.score != null) {
          const df = "+" + d.num(r.score - best), dfs = Math.min(th2 * 0.7, 40); k.setFont(c, 400, dfs, R.F_BAGEL); const dw = c.measureText(df).width;
          c.fillStyle = pond ? R.CR : R.INK; c.textAlign = "right"; c.fillText(df, rx, cy + dfs * 0.36); c.textAlign = "left";
          rx -= dw + 16;
        }
        const nx = bx + br + 18, nfm = Math.min(cols ? 46 : 62, pitch * 0.46), nf2 = k.nameFit(c, r.name, { w: 400, fam: R.F_BAGEL, max: nfm, maxW: rx - nx, lines: 2 });
        k.setFont(c, 400, nf2.size, R.F_BAGEL); c.fillStyle = ink; const l2 = nf2.size * 1.04;
        nf2.lines.forEach((ln, j) => c.fillText(ln, nx, cy + nf2.size * 0.36 - ((nf2.lines.length - 1) * l2) / 2 + j * l2));
      });
    });
    /* Spruch als Schild auf dem Teichrand */
    if (hasLosers) {
      const t = d.up(d.tr("ryuTPond", "Ab in den Teich.")), z0 = zones[0];
      const f = k.fit(c, t, { w: 400, fam: R.F_BAGEL, max: 40, min: 22, maxW: 520, lines: 1 });
      k.setFont(c, 400, f.size, R.F_BAGEL); const w2 = c.measureText(f.lines[0]).width + 52, h2 = f.size + 26, sx = cols ? z0.x + 40 : 1040 - w2 - 40, sy = z0.y - h2 / 2 - 4;
      R.sticker(c, sx, sy, w2, h2, { r: 12, rot: cols ? -3 : 3, sh: 6, lw: 4, fill: R.CR });
      R.rot(c, sx, sy, w2, h2, cols ? -3 : 3, () => { k.setFont(c, 400, f.size, R.F_BAGEL); c.fillStyle = R.RED2; c.fillText(f.lines[0], 26, h2 / 2 + f.size * 0.36); });
    }
  }
  R.footer(c, k, d);
  return cv;
}

export default {
  games: ["minigolf"],
  fonts: ["400 100px \"GTR Anton\"", "800 52px \"Baloo 2\"", "700 28px \"Space Grotesk\"", "500 22px \"Space Grotesk\""],
  texts: (d) => [d.tr("ecTied", ""), d.up(d.tr("tplMgSub", (n) => n)(18)), d.up(d.tr("tplMgPer", (n) => n)("")), d.up(d.tr("tplMgAce", "")), d.tr("tplMgHole", (n) => n)(""), "+–0123456789"],
  accepts: (d) => d.rows.length > 0 && d.rows.every((r) => r.score != null),
  render(d, k) {
    const ex = d.extra || {};
    const byRow = pickRows(d, ex.players, "total");
    const holes = (byRow.find((e) => e && Array.isArray(e.strokes)) || { strokes: [] }).strokes.length || 18;
    const aces = [];
    d.rows.forEach((r, i) => { const e = byRow[i]; if (!e || !Array.isArray(e.strokes)) return; const hs = []; e.strokes.forEach((v, j) => { if (v === 1) hs.push(j + 1); }); if (hs.length) aces.push({ name: r.name, holes: hs }); });
    const extras = { byRow, holes, aces };
    const parts = k.chunks(d.rows, FIRST_CAP, 12);
    const out = [page1(d, k, extras, parts[0], 1, parts.length)];
    const sty = { bg: (c) => { bg(c, k); }, ink: INK, sub: SOFT, acc: LIME, line: "rgba(214,242,58,0.25)", fam: k.F_ANTON, logo: LIME };
    parts.slice(1).forEach((p, i) => out.push(k.listPage(d, p, i + 2, parts.length, sty)));
    return out;
  },
  renderRyu(d, k, R) {
    const ex = d.extra || {};
    const byRow = pickRows(d, ex.players, "total");
    const holes = (byRow.find((e) => e && Array.isArray(e.strokes)) || { strokes: [] }).strokes.length || 18;
    const aces = [];
    d.rows.forEach((r, i) => { const e = byRow[i]; if (!e || !Array.isArray(e.strokes)) return; const hs = []; e.strokes.forEach((v, j) => { if (v === 1) hs.push(j + 1); }); if (hs.length) aces.push({ name: r.name, holes: hs }); });
    const extras = { byRow, holes, aces };
    const parts = k.chunks(d.rows, FIRST_CAP, 12);
    const out = [ryuPage1(d, k, R, extras, parts[0])];
    parts.slice(1).forEach((p, i) => out.push(R.contPage(d, k, p, i + 2, parts.length)));
    return out;
  },
};
