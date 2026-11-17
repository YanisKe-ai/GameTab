// Ergebnisbild Stadt Land Fluss (neue Vorlage, gleicher Aufbau wie Molotow, siehe molotow.js).
// Daten: nur gtEcModel (Raenge, Gleichstand, Punkte). Das Spiel meldet je Handy Name und Punkte, mehr Zusatzdaten gibt es nicht.
import { makeListTemplate } from "./molotow.js";

/* Deko Ryū: Antwortblatt (schraeg) mit leeren Kategorienspalten und grossem Fragezeichen-Zackensticker, nur Rot, Schwarz, Creme */
function slfDeco(c, R) {
  c.save(); c.translate(870, 205); c.rotate(8 * Math.PI / 180);
  const w = 300, h = 370;
  c.fillStyle = R.INK; R.rr(c, -w / 2 + 14, -h / 2 + 14, w, h, 18); c.fill();
  c.fillStyle = R.CR; R.rr(c, -w / 2, -h / 2, w, h, 18); c.fill(); c.lineWidth = 6; c.strokeStyle = R.INK; R.rr(c, -w / 2, -h / 2, w, h, 18); c.stroke();
  const cw = (w - 40) / 3;
  for (let i = 0; i < 3; i++) { c.fillStyle = i === 1 ? R.RED : R.INK; R.rr(c, -w / 2 + 20 + i * cw + 3, -h / 2 + 24, cw - 6, 34, 10); c.fill(); }
  c.strokeStyle = R.CR3; c.lineWidth = 3;
  for (let y = -h / 2 + 90; y < h / 2 - 20; y += 44) { c.beginPath(); c.moveTo(-w / 2 + 20, y); c.lineTo(w / 2 - 20, y); c.stroke(); }
  for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(-w / 2 + 20 + i * cw, -h / 2 + 70); c.lineTo(-w / 2 + 20 + i * cw, h / 2 - 20); c.stroke(); }
  c.restore();
  R.zig(c, 700, 330, 82, { fill: R.CR, n: 20, sh: 8, lw: 5 });
  R.pop(c, "?", 700, 362, 108, { align: "center", fill: R.RED, sh: 6, sw: 9 });
}

const BASE = makeListTemplate({ id: "slf", acc: "#8B6CFF", bgFrom: "#201A3A", bgTo: "#0B0914", ink: "#EFEBFF", winInk: "#150E33", seed: 7701, deco: slfDeco });

/* ---------- Ryū Runde 2: Antwortblatt mit riesigem STOPP!, Sieger mit Marker-Kreis, Verlierer durchgestrichen ---------- */
function wob(c, x1, y, x2, wd, col, alpha, seed) {
  /* Marker-Strich mit leichtem Wackeln */
  let sd = seed || 5; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  c.save(); c.globalAlpha = alpha; c.strokeStyle = col; c.lineWidth = wd; c.lineCap = "round"; c.lineJoin = "round";
  c.beginPath(); c.moveTo(x1, y + (rnd() - 0.5) * 4);
  const n = Math.max(2, Math.round((x2 - x1) / 40));
  for (let i = 1; i <= n; i++) c.lineTo(x1 + ((x2 - x1) * i) / n, y + (rnd() - 0.5) * 6 - (i / n) * 3);
  c.stroke(); c.restore();
}
function markerRing(c, cx, cy, rx, ry, col, wd) {
  c.save(); c.strokeStyle = col; c.lineWidth = wd; c.lineCap = "round"; c.lineJoin = "round"; c.globalAlpha = 0.93;
  c.beginPath(); const T = Math.PI * 2 * 1.13, st = 0.5, N = 90;
  for (let i = 0; i <= N; i++) {
    const t = st + (T * i) / N, u = i / N, f = 1 + 0.025 * Math.sin(3 * t) + u * 0.07;
    const px = cx + Math.cos(t - 1.9) * rx * f, py = cy + Math.sin(t - 1.9) * ry * f - u * 10;
    if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.stroke(); c.restore();
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
function ryuSlf(d, k, R, rows) {
  const { cv, c } = k.tplCanvas(); const m = d.model; R.bg(c, R.RED, 7701);
  R.dots(c, 600, 0, 480, 200, 24, 4, "rgba(26,23,22,0.18)");
  /* Titel auf Rot und Spruch als Stempel */
  c.save(); c.translate(60, 112); c.rotate(-3 * Math.PI / 180);
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: R.F_BAGEL, max: 96, min: 36, maxW: 500, lines: 1 });
  R.pop(c, tf.lines[0], 0, 0, tf.size, { sh: tf.size * 0.08 }); c.restore();
  R.stamp(c, k, m.slogan, 825, 78, 30, 3, R.INK, 360);
  const win = d.winners.filter((w) => rows.indexOf(w) >= 0), rest = rows.filter((r) => win.indexOf(r) < 0), hasLosers = d.winners.length < d.rows.length;
  /* Blatt */
  const SX = 40, SY = 160, SW = 1000, SH = 1010;
  c.save(); c.translate(540, SY + SH / 2); c.rotate(-1 * Math.PI / 180); c.translate(-540, -(SY + SH / 2));
  c.fillStyle = R.INK; R.rr(c, SX + 14, SY + 14, SW, SH, 16); c.fill();
  c.fillStyle = R.CR; R.rr(c, SX, SY, SW, SH, 16); c.fill();
  R.grain(c, SX, SY, SW, SH, 91, 0.4);
  c.lineWidth = 6; c.strokeStyle = R.INK; R.rr(c, SX, SY, SW, SH, 16); c.stroke();
  c.save(); R.rr(c, SX, SY, SW, SH, 16); c.clip();
  c.strokeStyle = R.CR3; c.lineWidth = 2.5;
  for (let y = SY + 56; y < SY + SH; y += 52) { c.beginPath(); c.moveTo(SX, y); c.lineTo(SX + SW, y); c.stroke(); }
  c.strokeStyle = R.RED; c.globalAlpha = 0.55; c.lineWidth = 3; c.beginPath(); c.moveTo(SX + 84, SY); c.lineTo(SX + 84, SY + SH); c.stroke(); c.globalAlpha = 1;
  c.restore();
  R.tape(c, SX + 90, SY + 6, 150, 40, -6); R.tape(c, SX + SW - 90, SY + 6, 150, 40, 5);
  /* Sieger */
  const names = d.up(m.heroNames.join(" · "));
  const nf = heroFitW(c, k, names, { w: 400, fam: R.F_BAGEL, maxW: 700 }, [{ max: 180, min: 80, lines: 1 }, { max: 120, min: 60, lines: 2 }, { max: 76, min: 40, lines: 3 }, { max: 54, min: 26, lines: 4 }]);
  const lh = nf.size * 1.04, nameH = nf.lines.length * lh;
  k.setFont(c, 400, nf.size, R.F_BAGEL); let nw = 0; nf.lines.forEach((ln) => { nw = Math.max(nw, c.measureText(ln).width); });
  const rx = Math.min(470, nw / 2 * 1.2 + 34), ry = nameH / 2 * 1.2 + 30;
  const detH = m.detail ? 66 : 0, pillH = 78;
  const rowsN = rest.length, cols = rowsN > 4 ? 2 : 1, nRow = Math.ceil(rowsN / Math.max(1, cols));
  const rowMin = cols === 2 ? 62 : 70, hdrH = hasLosers ? 76 : 0;
  const fixed = 66 + ry * 2 + pillH * 0.6 + detH + hdrH + nRow * rowMin + 60;
  const avail = SY + SH - 24 - (SY + 24);
  const stopS = Math.max(96, Math.min(240, avail - fixed - 40));
  const stopTxt = d.tr("ryuTStop", "STOPP!");
  let y = SY + 30;
  /* STOPP! */
  {
    const sf = k.fit(c, stopTxt, { w: 400, fam: R.F_BAGEL, max: stopS, min: 70, maxW: 820, lines: 1 });
    const cy = y + sf.size * 0.78;
    c.save(); c.translate(560, cy); c.rotate(-7 * Math.PI / 180);
    /* Spritzer */
    c.fillStyle = R.RED2; [[-420, -50, 16], [-380, 30, 9], [410, -70, 12], [440, 20, 18], [-330, -110, 7], [350, 70, 8], [-445, 70, 11]].forEach((q) => { c.beginPath(); c.arc(q[0], q[1], q[2], 0, 6.2832); c.fill(); });
    R.pop(c, sf.lines[0], 0, 0, sf.size, { align: "center", fill: R.RED, sh: sf.size * 0.06, sw: sf.size * 0.1 });
    c.restore(); y += sf.size * 0.95 + 20;
  }
  /* Label und Name mit Marker-Kreis */
  k.setFont(c, 400, 36, R.F_BAGEL); c.fillStyle = R.RED2; c.textAlign = "center"; c.fillText(d.up(m.heroLabel), 560, y + 24); c.textAlign = "left"; y += 62;
  const ncy = y + ry, ncx = 560;
  k.setFont(c, 400, nf.size, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = "center";
  nf.lines.forEach((ln, j) => c.fillText(ln, ncx, ncy - nameH / 2 + nf.size * 0.8 + j * lh));
  c.textAlign = "left";
  markerRing(c, ncx, ncy, rx, ry, R.RED, 13);
  y = ncy + ry + 8;
  /* Wert */
  {
    const vt = m.heroValue + "  " + m.unitLabel, vf = k.fit(c, vt, { w: 400, fam: R.F_BAGEL, max: 58, min: 26, maxW: 700, lines: 1 });
    k.setFont(c, 400, vf.size, R.F_BAGEL); const vw = c.measureText(vf.lines[0]).width + 56, vh = vf.size + 26;
    R.sticker(c, ncx - vw / 2, y, vw, vh, { r: vh / 2, fill: R.INK, rot: 2, sh: 6, lw: 0 });
    R.rot(c, ncx - vw / 2, y, vw, vh, 2, () => { k.setFont(c, 400, vf.size, R.F_BAGEL); c.fillStyle = R.CR; c.fillText(vf.lines[0], 28, vh / 2 + vf.size * 0.36); });
    y += vh + 16;
  }
  if (m.detail) {
    const df = k.fit(c, m.detail, { w: 400, fam: R.F_BAGEL, max: 32, min: 18, maxW: 760, lines: 1 });
    k.setFont(c, 400, df.size, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = "center"; c.fillText(df.lines[0], 560, y + df.size * 0.8); c.textAlign = "left"; y += df.size + 26;
  } else y += 6;
  /* Verlierer */
  if (hasLosers && rowsN) {
    const t = d.tr("ryuTNext", "Nächstes Mal vielleicht.");
    R.stamp(c, k, t, 560, y + 30, 38, 2, R.RED2, 800); y += 76;
  }
  const bottom = SY + SH - 22, pitch = Math.min(112, (bottom - y) / Math.max(1, nRow)), cw = cols === 2 ? 405 : 840, x0 = cols === 2 ? SX + 90 : SX + 110;
  rest.forEach((r, i) => {
    const col = cols === 1 ? 0 : i % 2, ri = cols === 1 ? i : Math.floor(i / 2), rxp = x0 + col * (cw + 20), ry0 = y + ri * pitch, fs = Math.min(cols === 2 ? 38 : 58, pitch * 0.58);
    k.setFont(c, 400, fs * 0.8, R.F_BAGEL); c.fillStyle = R.INK; c.fillText(String(r.rank), rxp, ry0 + pitch * 0.62 + fs * 0.2);
    k.setFont(c, 400, fs, R.F_BAGEL); c.textAlign = "right";
    const vf = k.fit(c, String(r.value), { w: 400, fam: R.F_BAGEL, max: fs, min: fs * 0.55, maxW: 150, lines: 1 }); k.setFont(c, 400, vf.size, R.F_BAGEL);
    const vw = c.measureText(vf.lines[0]).width; c.fillStyle = R.INK; c.fillText(vf.lines[0], rxp + cw, ry0 + pitch * 0.62 + fs * 0.2); c.textAlign = "left";
    const nx = rxp + fs * 1.1, nf2 = k.nameFit(c, r.name, { w: 400, fam: R.F_BAGEL, max: fs, maxW: cw - fs * 1.1 - vw - 30, lines: 1 });
    k.setFont(c, 400, nf2.size, R.F_BAGEL); c.fillStyle = R.INK; const base = ry0 + pitch * 0.62 + fs * 0.2; c.fillText(nf2.lines[0], nx, base);
    const w2 = c.measureText(nf2.lines[0]).width;
    wob(c, nx - 10, base - nf2.size * 0.3, nx + w2 + 12, Math.max(7, nf2.size * 0.15), R.RED, 0.78, 11 + i * 7);
  });
  c.restore();
  R.footer(c, k, d);
  return cv;
}

export default Object.assign({}, BASE, {
  texts: (d) => BASE.texts(d).concat([d.tr("ryuTStop", "STOPP!"), d.tr("ryuTNext", "Nächstes Mal vielleicht.")]),
  renderRyu(d, k, R) {
    const parts = k.chunks(d.rows, 8, 12);
    const out = [ryuSlf(d, k, R, parts[0])];
    parts.slice(1).forEach((p, i) => out.push(R.contPage(d, k, p, i + 2, parts.length)));
    return out;
  },
});
