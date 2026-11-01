// Ergebnisbild Minigolf (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/minigolf.png, Anzeigetafel auf Rasengruen).
// Daten: Rang und Gesamtschlaege (gtEcModel, weniger ist besser). Zusatz (shareExtra aus MinigolfPlay): {players:[{name, total, strokes:[18 Schlaege]}]}.
// Kein PAR (gibt es im Spiel nicht): Abstand zum Sieger "+n". Hole in one nur, wo ein Schlag 1 wirklich eingetragen ist.
import { pickRows } from "./util.js";

const LIME = "#D6F23A", SOFT = "#B9D9A8", INK = "#F2F4E0", TILE = "#F7F5E6", TILE_INK = "#0F3A1C", GOLD = "#FFD84A";
const FIRST_CAP = 5;
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
  const f = k.fit(c, line, { w: 600, fam: MONO, max: 28, min: 16, maxW: 900, lines: 1 });
  k.setFont(c, 600, f.size, MONO); c.fillStyle = SOFT; c.textAlign = "center"; c.fillText(f.lines[0], 540, 1250);
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
function rows(c, k, d, list, gap, top, n) {
  const sz = (r) => r.winner ? { th: n <= 3 ? 138 : n === 4 ? 110 : 96, nm: n <= 3 ? 96 : n === 4 ? 78 : 66 } : { th: n <= 3 ? 100 : n === 4 ? 64 : 52, nm: n <= 3 ? 64 : n === 4 ? 50 : 44 };
  let y = top;
  list.forEach((r) => {
    const s = sz(r), digits = Array.from(String(r.value).replace(/[^0-9]/g, "")), nd = digits.length || 1;
    const tw = Math.round(s.th * (nd >= 3 ? 0.58 : 0.72)), tg = 8;
    const prW = r.winner ? 140 : 120, rowH = s.th + 14 + 12 + 3;
    c.fillStyle = "rgba(214,242,58,0.33)"; c.fillRect(100, y, 880, 3);
    const ty = y + 3 + 14;
    // Kacheln
    const tilesW = nd * tw + (nd - 1) * tg, tx = 980 - prW - 30 - tilesW;
    digits.forEach((ch, i) => tile(c, k, tx + i * (tw + tg), ty, tw, s.th, ch));
    const bl = ty + s.th / 2;
    k.setFont(c, 400, s.nm * 0.94, k.F_ANTON); c.fillStyle = LIME; const cap = k.capH(c);
    c.fillText(String(r.rank), 100, bl + cap / 2);
    const nx = 170, nw = tx - 30 - nx;
    let f = k.fit(c, r.name, { w: 400, fam: k.F_ANTON, max: s.nm, min: s.nm * 0.5, maxW: nw, lines: 1, ls: 0.04 });
    let sp = !f.cut;
    if (f.cut) f = k.fit(c, r.name, { w: 400, fam: k.F_ANTON, max: s.nm * 0.62, min: 30, maxW: nw, lines: 2 });
    if (f.cut) f = k.fit(c, r.name, { w: 400, fam: k.F_ANTON, max: s.nm * 0.45, min: 18, maxW: nw, lines: 3 });
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
  const endY = rows(c, k, d, rowsList, gap, 440, nShown);
  // Schlaege des Siegers pro Bahn
  const w0 = d.winners[0] || d.rows[0], st = extras.byRow[d.rows.indexOf(w0)];
  const strokes = st && Array.isArray(st.strokes) ? st.strokes : null;
  const gt = 1010;
  if (strokes && strokes.length === holes) {
    const lab = d.up(d.tr("tplMgPer", (nm) => nm)(w0.name));
    const lf = k.fit(c, lab, { w: 600, fam: MONO, max: 22, min: 14, maxW: 500, lines: 1, ls: 0.14 });
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
    stamp(c, k, [d.up(d.tr("tplMgAce", "Hole in one")), l2], 810, Math.min(Math.max(endY + 6, 870), 985 - 100));
  }
  // Fusszeile
  const win = d.winners, val = win.length ? d.num(win[0].score) : "";
  const line = d.tie ? d.tr("tplMgTie", (n) => n + "")(val) : d.tr("tplMgWin1", (nm, n) => nm + " " + n)(win[0] ? win[0].name : "", val);
  footer(c, k, d, line);
  void pageCount;
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
};
