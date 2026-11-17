// Ergebnisbild Molotow (neue Vorlage) und, ueber makeListTemplate, auch Stadt Land Fluss (slf.js).
// Daten: nur gtEcModel (Raenge, Gleichstand, Punkte), kein shareExtra. Das Spiel meldet Namen und Gesamtpunkte (Molotow: wenigste Punkte gewinnt, lowWins).
// Inhalt wie das allgemeine Bild: Spielname, Spruch, "Gewonnen", Siegername(n), Punkte mit Einheit, Zusatzzeile (Vorsprung oder Gleichstand), Rangliste.
// render: Nocturne, Hell, Noir (dunkle GameTab-Bildsprache mit Spielakzent). renderRyu: Ryū-Plakat (nur im Modus Ryū).
import { F_SPACE } from "./fonts-a.js";

const FIRST_CAP = 8;

/* ---------- Dunkle Fassung ---------- */
function makeBg(cfg) {
  return (c, k) => {
    c.fillStyle = cfg.bgTo; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
    k.cssEllipse(c, 0, 0, k.TPL_W, k.TPL_H, 540, 330, [[0, cfg.bgFrom], [0.75, cfg.bgTo], [1, cfg.bgTo]]);
    c.save(); c.globalAlpha = 0.07; c.fillStyle = cfg.acc;
    for (let y = 18; y < k.TPL_H; y += 36) for (let x = (y / 36) % 2 ? 18 : 0; x < k.TPL_W; x += 36) { c.beginPath(); c.arc(x, y, 2, 0, 6.2832); c.fill(); }
    c.restore();
    c.strokeStyle = cfg.acc; c.globalAlpha = 0.5; c.lineWidth = 3; k.rrect(c, 36, 36, 1008, 1278, 26); c.stroke(); c.globalAlpha = 1;
  };
}
function darkFooter(c, k, d, cfg) {
  const lw = k.logo(c, d.logo, 70, 1210, 100, cfg.acc);
  const x = 70 + lw + 22;
  k.setFont(c, 800, 52, k.F_BALOO); c.fillStyle = cfg.acc; c.fillText("GameTab", x, 1262);
  k.setFont(c, 600, 26, k.F_INTER); const mw = 1010 - (x + c.measureText("GameTab").width + 30);
  const f = k.fit(c, d.date, { w: 600, fam: k.F_INTER, max: 26, min: 16, maxW: mw, lines: 1 });
  k.setFont(c, 600, f.size, k.F_INTER); c.fillStyle = cfg.ink; c.globalAlpha = 0.8; c.textAlign = "right"; c.fillText(f.lines[0], 1010, 1262); c.textAlign = "left"; c.globalAlpha = 1;
}
function darkPage1(d, k, rows, cfg) {
  const { cv, c } = k.tplCanvas(); const m = d.model; cfg.bg(c, k);
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: k.F_ANTON, max: 120, min: 56, maxW: 900, ls: 0.04, lines: 1 });
  k.setFont(c, 400, tf.size, k.F_ANTON); c.fillStyle = cfg.acc; k.spaced(c, tf.lines[0], 540, 80 + tf.size * 0.8, tf.size * 0.04, "center");
  const sl = k.fit(c, m.slogan, { w: 600, fam: k.F_INTER, max: 30, min: 16, maxW: 880, lines: 1 });
  k.setFont(c, 600, sl.size, k.F_INTER); c.fillStyle = cfg.ink; c.globalAlpha = 0.75; c.textAlign = "center"; c.fillText(sl.lines[0], 540, 80 + tf.size * 0.8 + 52); c.textAlign = "left"; c.globalAlpha = 1;
  /* Held: Sieger */
  const lf = k.fit(c, m.heroLabel, { w: 700, fam: F_SPACE, max: 30, min: 16, maxW: 700, lines: 1 });
  k.setFont(c, 700, lf.size, F_SPACE); c.fillStyle = cfg.acc; k.spaced(c, m.heroLabel, 540, 322, 5, "center");
  const names = m.heroNames.join(" · ");
  const nf = k.heroFit(c, d.up(names), { w: 400, fam: k.F_ANTON, maxW: 900 }, [{ max: 130, min: 80, lines: 1 }, { max: 96, min: 56, lines: 2 }, { max: 70, min: 36, lines: 3 }, { max: 50, min: 26, lines: 4 }]);
  k.setFont(c, 400, nf.size, k.F_ANTON); c.fillStyle = cfg.ink; c.textAlign = "center"; const nlh = nf.size * 1.08; let by = 350 + nf.size * 0.95;
  nf.lines.forEach((ln, i) => c.fillText(ln, 540, by + i * nlh));
  by += (nf.lines.length - 1) * nlh + 40;
  const vf = k.fit(c, m.heroValue, { w: 400, fam: k.F_ANTON, max: 150, min: 70, maxW: 700, lines: 1 });
  k.setFont(c, 400, vf.size, k.F_ANTON); c.fillStyle = cfg.acc; c.fillText(m.heroValue, 540, by + vf.size * 0.9);
  by += vf.size * 0.9 + 12;
  const uf = k.fit(c, m.unitLabel, { w: 700, fam: F_SPACE, max: 28, min: 16, maxW: 700, lines: 1 });
  k.setFont(c, 700, uf.size, F_SPACE); c.fillStyle = cfg.ink; c.globalAlpha = 0.8; c.fillText(m.unitLabel, 540, by + 28); c.globalAlpha = 1;
  by += 48;
  if (m.detail) { const df = k.fit(c, m.detail, { w: 600, fam: k.F_INTER, max: 28, min: 16, maxW: 860, lines: 1 }); k.setFont(c, 600, df.size, k.F_INTER); c.fillStyle = cfg.acc; c.fillText(m.detail, 540, by + 22); by += 50; }
  c.textAlign = "left";
  /* Rangliste */
  const top = Math.max(by + 20, 640), bottom = 1180, n = rows.length, pitch = Math.min(96, (bottom - top) / Math.max(1, n));
  rows.forEach((r, i) => {
    const y = top + i * pitch, rh = pitch - 10, hot = r.winner, fs = Math.min(48, rh * 0.56), base = y + rh / 2 + fs * 0.34;
    c.fillStyle = hot ? cfg.acc : "rgba(255,255,255,0.07)"; k.rrect(c, 70, y, 940, rh, rh * 0.22); c.fill();
    if (!hot) { c.strokeStyle = "rgba(255,255,255,0.14)"; c.lineWidth = 2; k.rrect(c, 71, y + 1, 938, rh - 2, rh * 0.22); c.stroke(); }
    const ink = hot ? cfg.winInk : cfg.ink;
    k.setFont(c, 400, fs, k.F_ANTON); c.fillStyle = ink; c.fillText(String(r.rank), 96, base);
    const rw = c.measureText("00").width + 22; c.textAlign = "right"; c.fillText(r.value, 985, base); const vw = c.measureText(r.value).width; c.textAlign = "left";
    const f = k.nameFit(c, r.name, { w: 400, fam: k.F_ANTON, max: fs, maxW: 940 - 26 - rw - vw - 46, lines: 2 });
    k.setFont(c, 400, f.size, k.F_ANTON); c.fillStyle = ink; const lh = f.size * 1.08;
    f.lines.forEach((ln, j) => c.fillText(ln, 96 + rw, y + rh / 2 + f.size * 0.34 - ((f.lines.length - 1) * lh) / 2 + j * lh));
  });
  darkFooter(c, k, d, cfg);
  return cv;
}

/* ---------- Ryū-Fassung ---------- */
function ryuPage1(d, k, R, rows, cfg) {
  const { cv, c } = k.tplCanvas(); const m = d.model; R.bg(c, R.RED, cfg.seed);
  R.dots(c, 560, 0, 520, 420, 26, 4.2, "rgba(26,23,22,0.18)");
  cfg.deco(c, R, k);
  c.save(); c.translate(64, 215); c.rotate(-5 * Math.PI / 180);
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: R.F_BAGEL, max: 150, min: 34, maxW: 560, lines: 1 });
  R.pop(c, tf.lines[0], 0, 0, tf.size, { sh: tf.size * 0.08 }); c.restore();
  /* Spruch als Stempel */
  R.stamp(c, k, m.slogan, 340, 305, 44, -4, R.INK, 600);
  const win = d.winners.filter((w) => rows.indexOf(w) >= 0), rest = rows.filter((r) => win.indexOf(r) < 0);
  const names = d.up(m.heroNames.join(" · ")), inner = 960 - 250 - 40;
  const nf = k.heroFit(c, names, { w: 400, fam: R.F_BAGEL, maxW: inner }, [{ max: 100, min: 60, lines: 1 }, { max: 80, min: 46, lines: 2 }, { max: 58, min: 32, lines: 3 }, { max: 42, min: 24, lines: 4 }]);
  const lh = nf.size * 1.05, nameH = nf.lines.length * lh, labH = 46, hh = Math.max(270, nameH + labH + 190);
  const cols = rest.length > 5 ? 2 : 1, nRow = Math.ceil(rest.length / cols), pitch = rest.length <= 3 ? 112 : nRow <= 4 ? 104 : 92;
  const detH = m.detail ? 78 : 0, blockH = hh + 40 + detH + nRow * pitch, top0 = 410, avail = 1176 - top0;
  let y = top0 + Math.max(0, (avail - blockH) * 0.35);
  R.sticker(c, 60, y, 960, hh, { r: 34, rot: -2.5, sh: 14, lw: 6 });
  R.rot(c, 60, y, 960, hh, -2.5, () => {
    R.zig(c, 130, hh / 2, 92, { fill: R.RED, n: 20, sh: 7, lw: 5 });
    R.pop(c, "1", 130, hh / 2 + 34, 104, { align: "center", sh: 5, sw: 9 });
    const lf = k.fit(c, m.heroLabel, { w: 400, fam: R.F_BAGEL, max: 36, min: 20, maxW: inner, lines: 1 });
    k.setFont(c, 400, lf.size, R.F_BAGEL); c.fillStyle = R.RED2; const ty0 = (hh - nameH - labH - 120) / 2 + 30; c.fillText(lf.lines[0], 250, ty0 + lf.size * 0.7);
    k.setFont(c, 400, nf.size, R.F_BAGEL); c.fillStyle = R.INK; const n0 = ty0 + labH + nf.size * 0.8;
    nf.lines.forEach((ln, j) => c.fillText(ln, 250, n0 + j * lh));
    const vt = m.heroValue + "  " + m.unitLabel, vf = k.fit(c, vt, { w: 400, fam: R.F_BAGEL, max: 56, min: 26, maxW: inner - 40, lines: 1 });
    k.setFont(c, 400, vf.size, R.F_BAGEL); const vw = c.measureText(vf.lines[0]).width, vy = n0 + (nf.lines.length - 1) * lh + 22;
    c.fillStyle = R.INK; R.rr(c, 250, vy, vw + 40, vf.size + 22, (vf.size + 22) / 2); c.fill();
    c.fillStyle = R.CR; c.fillText(vf.lines[0], 270, vy + (vf.size + 22) / 2 + vf.size * 0.36);
  });
  y += hh + 24;
  if (m.detail) {
    const df = k.fit(c, m.detail, { w: 400, fam: R.F_BAGEL, max: 34, min: 20, maxW: 860, lines: 1 });
    k.setFont(c, 400, df.size, R.F_BAGEL); const dw = c.measureText(df.lines[0]).width + 50, dh = df.size + 28;
    R.sticker(c, 540 - dw / 2, y, dw, dh, { r: dh / 2, fill: R.INK, rot: 1.5, sh: 7, lw: 0 });
    R.rot(c, 540 - dw / 2, y, dw, dh, 1.5, () => { k.setFont(c, 400, df.size, R.F_BAGEL); c.fillStyle = R.CR; c.fillText(df.lines[0], 25, dh / 2 + df.size * 0.34); });
    y += dh + 26;
  } else y += 16;
  R.list(c, k, rest, { x: cols === 1 ? 110 : 60, w: cols === 1 ? 860 : 950, top: y, bottom: 1176, cols, maxPitch: Math.min(pitch, (1176 - y) / Math.max(1, nRow)), fs: rest.length <= 3 ? 54 : 48 });
  R.footer(c, k, d);
  return cv;
}

function makeListTemplate(g) {
  const cfg = Object.assign({}, g, { bg: makeBg(g) });
  return {
    games: [g.id],
    fonts: ["400 100px \"GTR Anton\"", "800 52px \"Baloo 2\"", "700 30px \"Space Grotesk\"", "600 30px Inter"],
    texts: (d) => [d.up(d.gameLabel), d.up(d.model.heroLabel), d.up(d.model.heroNames.join(" · ")), d.model.slogan, d.model.detail, d.model.unitLabel, "0123456789"],
    render(d, k) {
      const parts = k.chunks(d.rows, FIRST_CAP, 12);
      const out = [darkPage1(d, k, parts[0], cfg)];
      const sty = { bg: (c) => cfg.bg(c, k), ink: cfg.ink, sub: cfg.ink, acc: cfg.acc, line: "rgba(255,255,255,0.18)", fam: k.F_ANTON, logo: cfg.acc, titleFam: k.F_ANTON, titleCase: true, subFam: k.F_INTER,
        rowFill: "rgba(255,255,255,0.07)", rowEdge: "rgba(255,255,255,0.14)", rowFillWin: cfg.acc, winInk: cfg.winInk };
      parts.slice(1).forEach((p, i) => out.push(k.continuationPage(d, p, i + 2, parts.length, sty)));
      return out;
    },
    renderRyu(d, k, R) {
      const parts = k.chunks(d.rows, FIRST_CAP, 12);
      const out = [ryuPage1(d, k, R, parts[0], cfg)];
      parts.slice(1).forEach((p, i) => out.push(R.contPage(d, k, p, i + 2, parts.length)));
      return out;
    },
  };
}

/* Deko Molotow: Jasskarte (schraeg) mit Molotow-Flasche und Flamme, nur Rot, Schwarz, Creme */
function moloDeco(c, R) {
  c.save(); c.translate(885, 235); c.rotate(11 * Math.PI / 180);
  const w = 250, h = 350;
  c.fillStyle = R.INK; R.rr(c, -w / 2 + 14, -h / 2 + 14, w, h, 26); c.fill();
  c.fillStyle = R.CR; R.rr(c, -w / 2, -h / 2, w, h, 26); c.fill(); c.lineWidth = 6; c.strokeStyle = R.INK; R.rr(c, -w / 2, -h / 2, w, h, 26); c.stroke();
  c.lineWidth = 3; c.strokeStyle = R.RED; R.rr(c, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 16); c.stroke();
  /* Flasche */
  c.save(); c.scale(0.9, 0.9); c.fillStyle = R.INK; R.rr(c, -52, -20, 104, 190, 30); c.fill(); R.rr(c, -22, -92, 44, 90, 10); c.fill();
  c.fillStyle = R.CR; R.rr(c, -34, 40, 68, 78, 8); c.fill(); c.fillStyle = R.RED; c.fillRect(-34, 66, 68, 10);
  c.fillStyle = R.CR; c.beginPath(); c.moveTo(-18, -92); c.lineTo(-10, -128); c.lineTo(8, -112); c.lineTo(18, -92); c.closePath(); c.fill();
  /* Flamme */
  c.fillStyle = R.RED; c.strokeStyle = R.INK; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -178); c.bezierCurveTo(36, -146, 34, -118, 8, -108); c.bezierCurveTo(-4, -118, -30, -122, -22, -150); c.bezierCurveTo(-14, -140, -6, -140, 0, -178); c.closePath(); c.fill(); c.stroke(); c.restore();
  /* Eckzeichen */
  c.fillStyle = R.RED; c.beginPath(); c.moveTo(-w / 2 + 44, -h / 2 + 40); c.lineTo(-w / 2 + 62, -h / 2 + 62); c.lineTo(-w / 2 + 44, -h / 2 + 84); c.lineTo(-w / 2 + 26, -h / 2 + 62); c.closePath(); c.fill();
  c.restore();
}

const molotow = makeListTemplate({ id: "molotow", acc: "#B8D52A", bgFrom: "#1B2415", bgTo: "#0A0D08", ink: "#EEF1E4", winInk: "#18200A", seed: 6601, deco: moloDeco });
export { makeListTemplate };
export default molotow;
