// Ergebnisbild Jass Differenzler (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/differenzler.png, Look: gruener Jassteppich mit Goldrahmen).
// Regel der App: pro Kategorie zaehlt Punkte x Faktor; die Differenz ist der eigene Wert minus der Schnitt der anderen, die Gesamtdifferenz ist die Summe.
// HOECHSTE Gesamtdifferenz gewinnt (nicht "kleinste Differenz"). Sieger und Reihenfolge kommen aus gtEcModel, nichts davon wird hier berechnet.
// Zusatz (shareExtra aus JassGame): {title, players:[{name, diff, points}]} (points = Summe der Kategorie-Punkte x Faktor).
import { card } from "./cards.js";
import { pickRows, breakHy, unHy, signed } from "./util.js";

const GOLD = "#E8C46A", CREAM = "#FBF8EE", SOFT = "#CDE5BE";
const F_FRAU = '"Fraunces","Inter","GT Clean","GT CJK",serif';
const MONO = '"Space Grotesk","Inter","GT Clean","GT CJK",sans-serif';
/* Faecher: [Pivot x, Pivot y, Drehung, Wert, Farbe] (Karte 168 breit, Drehpunkt unten Mitte) */
const FAN = [[408, 521, -18, "6", "spade"], [528, 497, -6, "7", "heart"], [648, 497, 6, "8", "diamond"], [768, 521, 18, "9", "club"]];
let dotPat = null;

function bg(c, k) {
  c.fillStyle = "#0F5A34"; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  k.cssEllipse(c, 0, 0, k.TPL_W, k.TPL_H, 540, 472.5, [[0, "#16794A"], [0.55, "#0F5A34"], [1, "#093D23"]]);
  if (!dotPat) { const t = document.createElement("canvas"); t.width = t.height = 5; const x = t.getContext("2d"); x.fillStyle = "#000"; x.beginPath(); x.arc(2.5, 2.5, 0.8, 0, 7); x.fill(); dotPat = c.createPattern(t, "repeat"); }
  c.save(); c.globalAlpha = 0.18; c.globalCompositeOperation = "multiply"; c.fillStyle = dotPat; c.fillRect(0, 0, k.TPL_W, k.TPL_H); c.restore();
  c.strokeStyle = GOLD; c.lineWidth = 4; k.rrect(c, 38, 38, 1004, 1274, 24); c.stroke();
  c.strokeStyle = "rgba(232,196,106,0.53)"; c.lineWidth = 1.5; k.rrect(c, 50.75, 50.75, 978.5, 1248.5, 17); c.stroke();
}
function fan(c, k) {
  FAN.forEach(([px, py, rot, rank, s]) => {
    c.save(); c.translate(px, py); c.rotate(rot * Math.PI / 180);
    c.save(); c.shadowColor = "rgba(0,0,0,0.47)"; c.shadowBlur = 22; c.shadowOffsetY = 10; c.fillStyle = "#FBF8EE"; k.rrect(c, -84, -235, 168, 235, 13); c.fill(); c.restore();
    card(c, k, -84, -235, 168, { rank, suit: s, rot: 0, fam: F_FRAU, shadow: false });
    c.restore();
  });
}
function head(c, k, d, title) {
  const lw = k.logo(c, d.logo, 100, 92, 100, GOLD);
  k.setFont(c, 800, 50, k.F_BALOO); c.fillStyle = GOLD; c.fillText("GameTab", 100 + lw + 22, 92 + 50 + 17);
  // Spielname gross, rechts
  const x1 = 980, room = x1 - (100 + lw + 22 + 230);
  const a = k.fit(c, d.gameLabel, { w: 700, fam: F_FRAU, max: 40, min: 20, maxW: room, lines: 1 });
  k.setFont(c, 700, a.size, F_FRAU); c.fillStyle = GOLD; c.textAlign = "right"; c.fillText(a.lines[0], x1, 138);
  if (title) { const b = k.fit(c, title, { w: 700, fam: F_FRAU, max: 64, min: 24, maxW: room, lines: 1 }); k.setFont(c, 700, b.size, F_FRAU); c.fillStyle = CREAM; c.fillText(b.lines[0], x1, 138 + 8 + b.size * 0.86); }
  c.textAlign = "left";
}
function layoutRows(c, k, d, pts, hasPts, nameW, availH) {
  const n = d.rows.length;
  const base = n <= 2 ? { w: [112, 84], v: [96, 72], df: [124, 92] } : n <= 3 ? { w: [92, 60], v: [80, 54], df: [104, 68] } : { w: [70, 48], v: [60, 42], df: [80, 54] };
  for (let s = 1; s >= 0.55; s -= 0.05) {
    const L = d.rows.map((r, i) => {
      const w = r.winner ? 0 : 1, nsz = base.w[w] * s, vs = base.v[w] * s, ds = base.df[w] * s;
      const f = k.nameFit(c, r.name, { w: 700, fam: F_FRAU, max: nsz, maxW: nameW, max2: nsz * 0.7, lines: r.winner ? 3 : 2 });
      const h = Math.max(ds * 1.12, f.lines.length * f.size * 1.08) + 24;
      return { r, f, nsz, vs, ds, h, pts: pts[i] };
    });
    const tot = L.reduce((a, l) => a + l.h, 0);
    if (tot <= availH || s <= 0.56) return L;
  }
  return [];
}
function page1(d, k, extras, title) {
  const { cv, c } = k.tplCanvas();
  bg(c, k); head(c, k, d, title); fan(c, k);
  const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
  // Schlagzeile
  const names = win.map((r) => r.name).join(" & ");
  const line = d.tie ? d.tr("tplDfWinN", (nm) => nm + "")(names) : d.tr("tplDfWin1", (nm) => nm + "")(names);
  let hf = k.fit(c, line, { w: 700, fam: F_FRAU, max: 104, min: 54, maxW: 940, lines: 1 });
  let hl = hf.lines, hs = hf.size;
  if (hf.cut) { const h2 = k.fit(c, breakHy(line), { w: 700, fam: F_FRAU, max: 62, min: 34, maxW: 940, lines: 2 }); hl = unHy(h2.lines); hs = h2.size; }
  k.setFont(c, 700, hs, F_FRAU); c.fillStyle = CREAM; c.textAlign = "center";
  hl.forEach((ln, i) => c.fillText(ln, 540, k.cssBase(c, 600 + i * hs * 1.05 + (hl.length > 1 ? -6 : 0), hs)));
  const rule = d.up(d.tr("tplDfRule", "Höchste Gesamtdifferenz gewinnt"));
  const rf = k.fit(c, rule, { w: 700, fam: MONO, max: 28, min: 14, maxW: 900, lines: 1, ls: 0.04 });
  k.setFont(c, 700, rf.size, MONO); c.fillStyle = GOLD; k.spaced(c, rule, 540, 735 + rf.size * 0.95, rf.size * 0.04, "center"); c.textAlign = "left";
  // Tabelle
  const hasPts = extras.some((e) => e && e.points != null);
  const big = d.rows.length <= 3;
  const huge = d.rows.length <= 2;
  k.setFont(c, 700, huge ? 124 : big ? 104 : 80, F_FRAU); const dw = Math.max(...d.rows.map((r) => c.measureText(signed(d, r.score != null ? r.score : 0)).width));
  k.setFont(c, 700, huge ? 96 : big ? 80 : 60, F_FRAU); const pw = hasPts ? Math.max(...extras.map((e) => (e && e.points != null ? c.measureText(d.num(e.points)).width : 0))) : 0;
  const colD = Math.min(400, Math.max(170, dw + 30)), colP = hasPts ? Math.min(330, Math.max(150, pw + 30)) : 0, nameW = 880 - colD - colP - 20;
  const top = 800;
  const L = layoutRows(c, k, d, extras.map((e) => (e && e.points != null ? e.points : null)), hasPts, nameW, 1205 - top - 44);
  const hfs = 22;
  k.setFont(c, 500, hfs, MONO); c.fillStyle = SOFT;
  if (hasPts) k.spaced(c, d.up(d.tr("tplDfPts", "Punkte")), 980 - colD, top + hfs, 2, "right");
  k.spaced(c, d.up(d.tr("tplDfDiff", "Differenz")), 980, top + hfs, 2, "right");
  let y = top + 44;
  L.forEach((l) => {
    const r = l.r;
    c.fillStyle = "rgba(232,196,106,0.33)"; c.fillRect(100, y, 880, 2);
    const mid = y + 2 + (l.h - 2) / 2;
    k.setFont(c, 700, l.ds, F_FRAU); const cap = k.capH(c);
    c.fillStyle = GOLD; if (r.winner) c.fillStyle = "#fff"; c.textAlign = "right"; c.fillText(r.score != null ? signed(d, r.score) : r.value, 980, mid + cap / 2);
    if (hasPts && l.pts != null) { k.setFont(c, 700, l.vs, F_FRAU); c.fillStyle = r.winner ? "#fff" : CREAM; c.fillText(d.num(l.pts), 980 - colD, mid + k.capH(c) / 2); }
    c.textAlign = "left"; k.setFont(c, 700, l.f.size, F_FRAU); c.fillStyle = r.winner ? "#fff" : CREAM;
    const lh = l.f.size * 1.08, cp = k.capH(c);
    l.f.lines.forEach((ln, i) => c.fillText(ln, 100, mid - ((l.f.lines.length - 1) * lh) / 2 + i * lh + cp / 2));
    y += l.h;
  });
  k.setFont(c, 500, 24, MONO); c.fillStyle = SOFT; c.textAlign = "center"; c.fillText(d.date, 540, 1262); c.textAlign = "left";
  return cv;
}

/* ---------- Ryū-Fassung: Heatmap-Raster ----------
   Roter Grund, Spielname als kleines Etikett, Titel als Pop-Schrift, Schlagzeile auf Creme-Sticker, Regel als schwarzes Band.
   Zeilen als Sticker: Name, Punkte, Differenz als Heat-Zelle (Stufen Creme, Sand, Rot, Schwarz nach Höhe der Differenz). Gleiche Daten wie render(). */
function ryuHeat(R, t) { return t >= 0.99 ? { f: R.INK, t: R.CR } : t >= 0.55 ? { f: R.RED, t: R.CR } : t >= 0.2 ? { f: R.CR3, t: R.INK } : { f: R.CR, t: R.INK }; }
function ryuPage(d, k, R, extras, title) {
  const { cv, c } = k.tplCanvas(); R.bg(c, R.RED, 5101);
  R.dots(c, 640, 0, 440, 360, 26, 4.2, "rgba(26,23,22,0.18)");
  /* Spielname als Etikett, Titel als Pop-Schrift */
  const tag = d.up(d.gameLabel), tt = title ? d.up(title) : null;
  let y = 66;
  if (tt) {
    const gf = k.fit(c, tag, { w: 400, fam: R.F_BAGEL, max: 34, min: 20, maxW: 400, lines: 1 });
    k.setFont(c, 400, gf.size, R.F_BAGEL); const gw = c.measureText(gf.lines[0]).width + 44, gh = gf.size + 26;
    R.sticker(c, 66, y, gw, gh, { r: gh / 2, fill: R.INK, rot: -3, sh: 5, lw: 0 });
    R.rot(c, 66, y, gw, gh, -3, () => { k.setFont(c, 400, gf.size, R.F_BAGEL); c.fillStyle = R.CR; c.fillText(gf.lines[0], 22, gh / 2 + gf.size * 0.34); });
    y += gh + 14;
  }
  c.save(); c.translate(64, y + 100); c.rotate(-3 * Math.PI / 180);
  const f0 = k.fit(c, tt || tag, { w: 400, fam: R.F_BAGEL, max: 130, min: 52, maxW: 880, lines: 1 });
  R.pop(c, f0.lines[0], 0, 0, f0.size, { sh: f0.size * 0.08 }); c.restore();
  y += 138;
  /* Schlagzeile */
  const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
  const names = win.map((r) => r.name).join(" & ");
  const line = d.tie ? d.tr("tplDfWinN", (nm) => nm + "")(names) : d.tr("tplDfWin1", (nm) => nm + "")(names);
  const hf = k.heroFit(c, line, { w: 400, fam: R.F_BAGEL, maxW: 840 }, [{ max: 84, min: 50, lines: 1 }, { max: 62, min: 34, lines: 2 }, { max: 44, min: 24, lines: 3 }]);
  const hh = hf.lines.length * hf.size * 1.08 + 58;
  R.sticker(c, 60, y, 960, hh, { r: 30, rot: -1.2, sh: 12, lw: 6 });
  R.rot(c, 60, y, 960, hh, -1.2, () => {
    k.setFont(c, 400, hf.size, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = "center";
    hf.lines.forEach((ln, i) => c.fillText(ln, 480, 29 + hf.size * 0.85 + i * hf.size * 1.08)); c.textAlign = "left";
  });
  R.tape(c, 130, y + 2, 130, 40, -10);
  y += hh + 34;
  /* Regel als schwarzes Band */
  const rule = d.tr("tplDfRule", "Höchste Gesamtdifferenz gewinnt");
  const rf = k.fit(c, rule, { w: 400, fam: R.F_BAGEL, max: 38, min: 20, maxW: 860, lines: 1 });
  k.setFont(c, 400, rf.size, R.F_BAGEL); const rw = Math.min(940, c.measureText(rf.lines[0]).width + 70), rh = rf.size + 34;
  R.sticker(c, 540 - rw / 2, y, rw, rh, { r: 14, fill: R.INK, rot: 1.2, sh: 8, lw: 0 });
  R.rot(c, 540 - rw / 2, y, rw, rh, 1.2, () => { k.setFont(c, 400, rf.size, R.F_BAGEL); c.fillStyle = R.CR; c.textAlign = "center"; c.fillText(rf.lines[0], rw / 2, rh / 2 + rf.size * 0.34); c.textAlign = "left"; });
  y += rh + 28;
  /* Raster */
  const hasPts = extras.some((e) => e && e.points != null), n = d.rows.length;
  const bottom = 1186, avail = bottom - y - 52, pitch = Math.min(n <= 2 ? 270 : n === 3 ? 215 : 170, avail / n);
  const sc = d.rows.map((r) => (r.score != null ? r.score : 0)), mx = Math.max(...sc), mn = Math.min(...sc);
  const cellW = n <= 2 ? 340 : 270, ptsW = hasPts ? 190 : 0;
  const lab = (t, x, al) => { k.setFont(c, 400, 26, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = al; c.fillText(d.up(t), x, y + 28); c.textAlign = "left"; };
  if (hasPts) lab(d.tr("tplDfPts", "Punkte"), 1020 - 20 - cellW - 14 - ptsW / 2, "center");
  lab(d.tr("tplDfDiff", "Differenz"), 1020 - 20 - cellW / 2, "center");
  let yy = y + 48;
  d.rows.forEach((r, i) => {
    const h = pitch - 16, hot = r.winner, e = extras[i], t = mx > mn ? (sc[i] - mn) / (mx - mn) : 1, hc = hot ? { f: R.INK, t: R.CR } : ryuHeat(R, Math.min(t, 0.98));
    const rot = i % 2 ? 0.7 : -0.7;
    R.sticker(c, 60, yy, 960, h, { r: 22, rot, sh: 8, lw: 5, fill: R.CR });
    R.rot(c, 60, yy, 960, h, rot, () => {
      const fs = Math.min(92, h * 0.46), cy = h / 2;
      const cx0 = 960 - 20 - cellW; c.fillStyle = hc.f; R.rr(c, cx0, 14, cellW, h - 28, 16); c.fill(); c.lineWidth = 4; c.strokeStyle = R.INK; R.rr(c, cx0, 14, cellW, h - 28, 16); c.stroke();
      const ds = r.score != null ? signed(d, r.score) : r.value, df = k.fit(c, ds, { w: 400, fam: R.F_BAGEL, max: fs * 1.1, min: 24, maxW: cellW - 30, lines: 1 });
      k.setFont(c, 400, df.size, R.F_BAGEL); c.fillStyle = hc.t; c.textAlign = "center"; c.fillText(df.lines[0], cx0 + cellW / 2, cy + df.size * 0.34);
      let nr = cx0 - 22;
      if (hasPts && e && e.points != null) {
        const pf = k.fit(c, d.num(e.points), { w: 400, fam: R.F_BAGEL, max: fs * 0.85, min: 22, maxW: ptsW - 10, lines: 1 });
        k.setFont(c, 400, pf.size, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = "center"; c.fillText(d.num(e.points), cx0 - 14 - ptsW / 2, cy + pf.size * 0.34); nr = cx0 - 14 - ptsW - 12;
      }
      c.textAlign = "left";
      const nf = k.nameFit(c, r.name, { w: 400, fam: R.F_BAGEL, max: hot ? fs * 1.1 : fs, maxW: nr - 40, lines: 2, max2: Math.min(fs, (h - 14) / 2.15) });
      k.setFont(c, 400, nf.size, R.F_BAGEL); c.fillStyle = R.INK; const lh = nf.size * 1.05;
      nf.lines.forEach((ln, j) => c.fillText(ln, 34, cy + nf.size * 0.34 - ((nf.lines.length - 1) * lh) / 2 + j * lh));
    });
    yy += pitch;
  });
  R.footer(c, k, d);
  return cv;
}

export default {
  games: ["jass-differenzler"],
  fonts: ["700 104px Fraunces", "800 52px \"Baloo 2\"", "700 28px \"Space Grotesk\"", "500 22px \"Space Grotesk\""],
  texts: (d) => [d.tr("tplDfWin1", (n) => n)(""), d.tr("tplDfWinN", (n) => n)(""), d.up(d.tr("tplDfRule", "")), d.up(d.tr("tplDfPts", "")), d.up(d.tr("tplDfDiff", "")), d.up(d.model.playerLabel), (d.extra && d.extra.title) || "", "+-0123456789"],
  accepts: (d) => d.rows.length >= 2 && d.rows.length <= 4 && d.rows.every((r) => r.score != null),
  render(d, k) {
    const ex = d.extra || {};
    const picked = pickRows(d, ex.players, "diff");
    const extras = picked.map((e) => (e && e.points != null && isFinite(Number(e.points)) ? { points: Number(e.points) } : null));
    const title = typeof ex.title === "string" && ex.title ? ex.title : null;
    return [page1(d, k, extras, title)];
  },
  renderRyu(d, k, R) {
    const ex = d.extra || {};
    const picked = pickRows(d, ex.players, "diff");
    const extras = picked.map((e) => (e && e.points != null && isFinite(Number(e.points)) ? { points: Number(e.points) } : null));
    const title = typeof ex.title === "string" && ex.title ? ex.title : null;
    return [ryuPage(d, k, R, extras, title)];
  },
};
