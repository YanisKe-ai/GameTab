// Ergebnisbild Impostor (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/impostor.png).
// Daten (shareExtra): {outcome:"crew"|"escape"|"guess"|"tie", players:[{name,role:"civilian"|"impostor"|"mrwhite"}], eliminated:Index|-1, word}
// Rollen stehen erst im Bild (nach Spielende). Figuren sind Aufstellung der Spielenden (Nummer = Reihenfolge), Hoehen nur Dekoration.
import { F_MONO, hash, listJoin, footer, fitWords, FONTS_BASE } from "./party-kit.js";

const PUR = "#C042E0", GRN = "#2FD9A8", RED = "#ff3b4e", DIM = "#8f8a9c";

function tr(d, key, fb) { return d.tr(key, fb); }
function build(d) {
  const ex = d.extra, P = ex.players;
  const imp = (r) => r !== "civilian";
  const crewWin = ex.outcome === "crew", impWin = ex.outcome === "escape" || ex.outcome === "guess", tie = ex.outcome === "tie";
  const impIdx = P.map((p, i) => (imp(p.role) ? i : -1)).filter((i) => i >= 0);
  const roleLabel = (r) => (r === "civilian" ? tr(d, "tplImpCrew", "Crew") : r === "impostor" ? tr(d, "gameImpostor", "Impostor") : tr(d, "mrWhiteRoleLabel", "MISTER WHITE"));
  const rows = P.map((p, i) => {
    const win = crewWin ? !imp(p.role) : impWin ? imp(p.role) : false;
    let st = "", col = DIM;
    if (!tie) {
      if (win) { st = tr(d, "tplImpWins", "gewinnt"); col = GRN; }
      else if (imp(p.role) && crewWin) { st = tr(d, "tplImpUnmasked", "enttarnt"); col = PUR; }
      else { st = tr(d, "tplImpLoses", "verliert"); col = imp(p.role) ? PUR : DIM; }
    } else col = imp(p.role) ? PUR : "#cfc8da";
    return { n: i + 1, name: d.clean(p.name) || String(i + 1), role: roleLabel(p.role), st, col, imp: imp(p.role), win };
  });
  const head2 = crewWin ? tr(d, "tplImpHCaught", "Entlarvt") : ex.outcome === "guess" ? tr(d, "tplImpHGuess", "Wort erraten") : impWin ? tr(d, "tplImpHEscape", "Entkommt") : tr(d, "tplImpHTie", "Unentschieden");
  const win1 = crewWin ? tr(d, "tplImpWinCrew", "Die Crew gewinnt.") : tie ? tr(d, "tplImpWinNone", "Niemand gewinnt.") : impIdx.length > 1 ? tr(d, "tplImpWinN", "Die Impostoren gewinnen.") : tr(d, "tplImpWin1", "Der Impostor gewinnt.");
  const who = tr(d, "tplImpWho", (a, b) => a + ": " + b)(listJoin(impIdx.map((i) => String(i + 1)), d.locale), listJoin(impIdx.map((i) => rows[i].name), d.locale), impIdx.length);
  const lines = [win1, who];
  if (ex.word) lines.push(tr(d, "tplImpWord", (w) => w)(ex.word));
  const stamp = ex.eliminated >= 0 ? (imp(P[ex.eliminated].role) ? tr(d, "tplImpStCaught", "Erwischt") : tr(d, "tplImpStInno", "Unschuldig")) : "";
  return { rows, head2, lines, stamp, tie, crewWin };
}

function render(d, k) {
  const { cv, c } = k.tplCanvas();
  const m = build(d), N = m.rows.length, P = d.extra.players;
  const cols = N <= 4 ? 1 : 2, perCol = Math.ceil(N / cols);
  const pitch = cols === 1 ? 66 : Math.min(54, 330 / perCol);
  const tableTop = cols === 1 ? 920 : 1190 - perCol * pitch, floorY = Math.min(900, tableTop - 20);
  // Hintergrund
  c.fillStyle = "#26232e"; c.fillRect(0, 0, 1080, floorY);
  c.fillStyle = "#2b2834"; c.fillRect(0, 0, 1080, floorY);
  c.fillStyle = "#292631"; for (let x = 120; x < 1080; x += 122) c.fillRect(x, 0, 2, floorY);
  c.fillStyle = "#14121a"; c.fillRect(0, floorY, 1080, 1350 - floorY);
  // Titel
  const t1 = d.up(d.gameLabel), t2 = d.up(m.head2);
  const fo = { w: 400, fam: k.F_ANTON, max: 120, min: 48, maxW: 940 };
  const f1 = k.fit(c, t1, fo), f2 = k.fit(c, t2, fo), sz = Math.min(f1.size, f2.size);
  k.setFont(c, 400, sz, k.F_ANTON);
  const lh = sz * 0.95;
  // Untertitel
  let ssz = 30; const subW = 620;
  const wrapAll = (s) => { k.setFont(c, 600, s, F_MONO); return m.lines.flatMap((l) => k.wrap(c, l, subW)); };
  let sl = wrapAll(ssz); while (sl.length > 5 && ssz > 22) { ssz -= 2; sl = wrapAll(ssz); }
  const slh = ssz * 1.35, subTop = 60 + lh * 2 + 24, subBot = subTop + sl.length * slh;
  // Hoehenlinien
  [480, 300, 120].forEach((o, i) => {
    const y = floorY - o; if (y - 40 < subBot) return;
    c.fillStyle = "rgba(255,255,255,0.2)"; c.fillRect(0, y, 1080, 3);
    k.setFont(c, 600, 22, F_MONO); c.fillStyle = "rgba(255,255,255,0.53)"; c.fillText(String(200 - i * 10) + " cm", 20, y - 12);
  });
  // Figuren
  const slot = Math.min(320, 960 / N), fw = Math.min(230, slot * 0.9), s = fw / 230;
  const hsc = 0.5 + 0.5 * Math.min(1, s * 1.2);
  const figs = P.map((p, i) => {
    const cx = 540 + (i - (N - 1) / 2) * slot;
    const base = (330 + hash(p.name + i) * 250) * hsc, minTop = 60;
    let h = base;
    const subRight = 70 + subW;
    if (cx - fw / 2 < subRight + 10 && floorY - h < subBot + 22) h = Math.max(150 * hsc, floorY - (subBot + 22));
    return { cx, h, imp: p.role !== "civilian", i, minTop };
  });
  // Scheinwerfer auf die ausgewaehlte Figur (oder Mitte)
  const ef = ex(d) >= 0 ? figs[ex(d)] : null, sx = ef ? ef.cx : 540;
  const g = c.createLinearGradient(0, 0, 0, floorY); g.addColorStop(0, "rgba(192,66,224,0.333)"); g.addColorStop(0.85, "rgba(192,66,224,0.05)"); g.addColorStop(1, "rgba(192,66,224,0.05)");
  c.fillStyle = g; c.beginPath(); c.moveTo(sx - 95, 0); c.lineTo(sx + 95, 0); c.lineTo(sx + 190, floorY); c.lineTo(sx - 190, floorY); c.closePath(); c.fill();
  figs.forEach((f) => {
    const col = f.imp ? PUR : "#0c0b10", x = f.cx - fw / 2, top = floorY - f.h;
    c.fillStyle = col;
    k.rrect(c, x + 70 * s, top, 90 * s, 105 * s, 45 * s); c.fill();
    c.beginPath(); const r = 70 * s, bx = x + 20 * s, bw = fw - 40 * s, by = top + 112 * s;
    c.moveTo(bx, floorY); c.lineTo(bx, by + r); c.arcTo(bx, by, bx + r, by, r); c.lineTo(bx + bw - r, by); c.arcTo(bx + bw, by, bx + bw, by + r, r); c.lineTo(bx + bw, floorY); c.closePath(); c.fill();
  });
  figs.forEach((f) => {
    const pw = Math.max(52, Math.min(120 * s, slot * 0.92)), ph = pw * 0.667, x = f.cx - pw / 2, y = floorY - f.h + 230 * s * (f.h / 430 > 0.6 ? 1 : 0.8) + 0;
    const yy = Math.min(y, floorY - ph - 20);
    c.fillStyle = "#111"; c.fillRect(x - 4 * s, yy - 4 * s, pw + 8 * s, ph + 8 * s);
    c.fillStyle = "#EDE9F2"; c.fillRect(x, yy, pw, ph);
    const fs = ph * 0.75; k.setFont(c, 400, fs, k.F_ANTON); c.fillStyle = "#111"; c.textAlign = "center";
    c.fillText(String(f.i + 1), f.cx, k.cssBase(c, yy, ph)); c.textAlign = "left";
    f.py = yy;
  });
  // Stempel
  if (m.stamp && ef) {
    const fsz = 64; k.setFont(c, 400, fsz, k.F_ANTON);
    const tx = d.up(m.stamp), sp = 0.04 * fsz, tw = k.spacedW(c, tx, sp) + 36 + 16, th = fsz + 16;
    const px = Math.min(Math.max(ef.cx - tw * 0.1, 20 + tw / 2), 1060 - tw / 2), py = floorY - 62;
    c.save(); c.translate(px, py); c.rotate(-8 * Math.PI / 180);
    c.fillStyle = "rgba(20,18,26,0.8)"; c.fillRect(-tw / 2, -th / 2, tw, th);
    c.strokeStyle = RED; c.lineWidth = 8; c.strokeRect(-tw / 2 + 4, -th / 2 + 4, tw - 8, th - 8);
    c.fillStyle = RED; k.spaced(c, tx, -tw / 2 + 8 + 18, k.cssBase(c, -th / 2 + 8, th - 16) , sp, "left");
    c.restore();
  }
  k.setFont(c, 400, sz, k.F_ANTON);
  c.fillStyle = "#fff"; c.fillText(f1.lines[0], 70, k.cssBase(c, 60, lh));
  c.fillStyle = PUR; c.fillText(f2.lines[0], 70, k.cssBase(c, 60 + lh, lh));
  // Titelblock Untertitel (ueber Figuren)
  k.setFont(c, 600, ssz, F_MONO); c.fillStyle = "#cfc8da";
  sl.forEach((l, i) => c.fillText(l, 70, k.cssBase(c, subTop + i * slh, slh)));
  // Tabelle
  const colW = cols === 1 ? 940 : 455, fsz = cols === 1 ? 34 : Math.min(26, pitch * 0.52);
  m.rows.forEach((r, i) => {
    const col = Math.floor(i / perCol), row = i % perCol;
    const x0 = 70 + col * (colW + 30), y0 = tableTop + row * pitch;
    const base = k.cssBase(c, y0, pitch - 2);
    c.fillStyle = "rgba(255,255,255,0.13)"; c.fillRect(x0, y0 + pitch - 2, colW, 2);
    const color = r.col === GRN ? "#fff" : r.imp ? PUR : r.col === DIM ? "#9a95a8" : "#fff";
    let stW = 0;
    if (cols === 1 && r.st) { k.setFont(c, 600, fsz, F_MONO); stW = c.measureText(r.st).width; c.textAlign = "right"; c.fillStyle = r.col; c.fillText(r.st, x0 + colW, base); c.textAlign = "left"; }
    k.setFont(c, 600, fsz, F_MONO);
    const nW = c.measureText(String(N)).width + 14;
    c.fillStyle = "rgba(255,255,255,0.45)"; c.fillText(String(r.n), x0, base);
    let rw;
    if (cols === 1) { rw = c.measureText(r.role).width; } else { rw = c.measureText(r.role).width; }
    const nameMax = colW - nW - rw - stW - (cols === 1 ? 70 : 24);
    const L2 = cols === 2;
    const f = fitWords(c, k, r.name, { w: 600, fam: F_MONO, max: fsz, min: L2 ? 22 : Math.max(14, fsz * 0.55), floor: 16, maxW: Math.max(60, nameMax), lines: L2 ? 2 : 1 });
    k.setFont(c, 600, f.size, F_MONO); c.fillStyle = color;
    if (f.lines.length > 1) { const l2 = f.size * 1.05; f.lines.forEach((ln, q) => c.fillText(ln, x0 + nW, k.cssBase(c, y0 + (pitch - 2 - l2 * f.lines.length) / 2 + q * l2, l2))); }
    else c.fillText(f.lines[0], x0 + nW, base);
    const nameW = Math.max(...f.lines.map((s) => c.measureText(s).width));
    k.setFont(c, 600, fsz, F_MONO);
    if (cols === 1) { c.fillStyle = color; c.fillText(r.role, x0 + nW + nameW + 26, base); }
    else { c.textAlign = "right"; c.fillStyle = r.col === GRN ? GRN : r.imp ? PUR : "#9a95a8"; c.fillText(r.role, x0 + colW, base); c.textAlign = "left"; }
  });
  footer(c, k, d, "#D77BF0", 34);
  return [cv];
}
/* ---------- Ryū-Fassung: geheime Akte mit Maske ----------
   Roter Grund, Maske im Zackensticker, Titel und Ergebnis als Sticker, grosse Creme-Akte mit Stempel (Erwischt / Unschuldig),
   Rollen als Sticker-Zeilen (Impostor schwarz). Inhalt wie render(). */
function ryuMask(c, R, cx, cy, s) {
  c.save(); c.translate(cx, cy); c.lineJoin = "round";
  const face = () => { c.beginPath(); c.moveTo(-0.78 * s, -0.7 * s); c.bezierCurveTo(-0.5 * s, -1.05 * s, 0.5 * s, -1.05 * s, 0.78 * s, -0.7 * s); c.bezierCurveTo(0.9 * s, -0.1 * s, 0.7 * s, 0.55 * s, 0.28 * s, 0.98 * s); c.lineTo(-0.28 * s, 0.98 * s); c.bezierCurveTo(-0.7 * s, 0.55 * s, -0.9 * s, -0.1 * s, -0.78 * s, -0.7 * s); c.closePath(); };
  c.save(); c.translate(s * 0.07, s * 0.07); face(); c.fillStyle = R.INK; c.fill(); c.restore();
  face(); c.fillStyle = R.CR; c.fill(); c.lineWidth = Math.max(4, s * 0.06); c.strokeStyle = R.INK; c.stroke();
  [-1, 1].forEach((sg) => { c.save(); c.translate(sg * 0.34 * s, -0.22 * s); c.rotate(sg * -0.35); c.beginPath(); c.ellipse(0, 0, 0.22 * s, 0.1 * s, 0, 0, 6.2832); c.fillStyle = R.INK; c.fill(); c.restore();
    c.beginPath(); c.arc(sg * 0.5 * s, 0.22 * s, 0.14 * s, 0, 6.2832); c.fillStyle = R.RED; c.fill(); });
  c.lineCap = "round"; c.lineWidth = Math.max(4, s * 0.07); c.strokeStyle = R.INK;
  c.beginPath(); c.moveTo(-0.5 * s, 0.38 * s); c.bezierCurveTo(-0.25 * s, 0.28 * s, 0.25 * s, 0.28 * s, 0.5 * s, 0.38 * s); c.stroke();
  c.beginPath(); c.moveTo(-0.3 * s, 0.52 * s); c.quadraticCurveTo(0, 0.78 * s, 0.3 * s, 0.52 * s); c.stroke();
  c.beginPath(); c.moveTo(0, 0.78 * s); c.lineTo(0, 0.92 * s); c.stroke();
  c.restore();
}
function ryuImpRow(c, k, R, r, x, y, w, h, rot) {
  const hot = r.imp, ink = hot ? R.CR : R.INK;
  R.sticker(c, x, y, w, h, { r: Math.min(20, h * 0.28), rot, sh: 6, lw: 3.5, fill: hot ? R.INK : (r.win ? R.CR : R.CR2) });
  R.rot(c, x, y, w, h, rot, () => {
    const rad = Math.min(h * 0.36, 40), nx = Math.min(h, 104) * 1.0, cx = nx * 0.5 - 2, wide = w > 700;
    R.zig(c, cx, h / 2, rad, { fill: hot ? R.RED : R.CR3, n: 14, sh: 0, lw: 3 });
    k.setFont(c, 400, rad * 1.1, R.F_BAGEL); c.fillStyle = R.INK; c.textAlign = "center"; c.fillText(String(r.n), cx, h / 2 + rad * 0.38); c.textAlign = "left";
    let rightW = 0;
    if (wide) {
      /* breite Zeile: Rolle als Pille rechts, Status darunter */
      const rf = k.fit(c, r.role, { w: 400, fam: R.F_BAGEL, max: Math.min(40, h * 0.3), min: 22, maxW: 300, lines: 1 });
      k.setFont(c, 400, rf.size, R.F_BAGEL); const pw = c.measureText(rf.lines[0]).width + 40, ph = rf.size + 22;
      const sf2 = r.st ? k.fit(c, r.st, { w: 700, fam: R.F_TXT, max: 28, min: 20, maxW: 300, lines: 1 }) : null;
      const tot = ph + (sf2 ? sf2.size * 1.3 : 0), y0 = (h - tot) / 2, px = w - 24 - pw;
      c.fillStyle = hot ? R.RED : R.INK; R.rr(c, px, y0, pw, ph, ph / 2); c.fill();
      k.setFont(c, 400, rf.size, R.F_BAGEL); c.fillStyle = hot ? R.INK : R.CR; c.fillText(rf.lines[0], px + 20, y0 + ph / 2 + rf.size * 0.35);
      if (sf2) { k.setFont(c, 700, sf2.size, R.F_TXT); c.fillStyle = ink; c.textAlign = "right"; c.fillText(sf2.lines[0], w - 24, y0 + ph + sf2.size * 1.05); c.textAlign = "left"; rightW = Math.max(pw, c.measureText(sf2.lines[0]).width); }
      else rightW = pw;
      const tw = w - nx - 40 - rightW, fs = Math.min(64, h * 0.42);
      const nf = k.nameFit(c, r.name, { w: 400, fam: R.F_BAGEL, max: fs, maxW: tw, lines: 2 });
      const nlh = nf.size * 1.04; k.setFont(c, 400, nf.size, R.F_BAGEL); c.fillStyle = ink;
      nf.lines.forEach((ln, i) => c.fillText(ln, nx, h / 2 - ((nf.lines.length - 1) * nlh) / 2 + i * nlh + nf.size * 0.35));
      return;
    }
    const tw = w - nx - 20, fs = Math.min(58, h * 0.4), sfs = Math.max(22, Math.min(30, h * 0.26));
    const sub = r.role + (r.st ? "  ·  " + r.st : "");
    const sf = k.fit(c, sub, { w: 700, fam: R.F_TXT, max: sfs, min: 20, maxW: tw, lines: 1 });
    const nf = k.nameFit(c, r.name, { w: 400, fam: R.F_BAGEL, max: fs, maxW: tw, lines: 2, max2: Math.max(24, Math.min(fs, (h - sf.size - 18) / 2.1)) });
    const nlh = nf.size * 1.04, tot = nlh * nf.lines.length + sf.size * 1.25;
    let yy = (h - tot) / 2;
    k.setFont(c, 400, nf.size, R.F_BAGEL); c.fillStyle = ink;
    nf.lines.forEach((ln, i) => c.fillText(ln, nx, yy + nf.size * 0.82 + i * nlh)); yy += nlh * nf.lines.length;
    k.setFont(c, 700, sf.size, R.F_TXT); c.fillStyle = hot ? R.CR : R.INK; c.fillText(sf.lines[0], nx, yy + sf.size * 1.0);
  });
}
function ryuRender(d, k, R) {
  const { cv, c } = k.tplCanvas(); R.bg(c, R.RED, 3101);
  R.dots(c, 600, 0, 480, 360, 26, 4.2, "rgba(26,23,22,0.18)");
  const m = build(d), N = m.rows.length;
  /* Maske im Zackensticker oben rechts */
  R.zig(c, 880, 175, 138, { fill: R.INK, n: 20, sh: 10, lw: 5 });
  ryuMask(c, R, 880, 182, 100);
  /* Titel und Ergebnis */
  c.save(); c.translate(60, 175); c.rotate(-4 * Math.PI / 180);
  const tf = k.fit(c, d.up(d.gameLabel), { w: 400, fam: R.F_BAGEL, max: 128, min: 60, maxW: 640, lines: 1 });
  R.pop(c, tf.lines[0], 0, 0, tf.size, { sh: tf.size * 0.08 });
  const hf = k.fit(c, d.up(m.head2), { w: 400, fam: R.F_BAGEL, max: 56, min: 28, maxW: 600, lines: 1 });
  k.setFont(c, 400, hf.size, R.F_BAGEL); const hw = c.measureText(hf.lines[0]).width + 56, hh = hf.size + 32;
  R.sticker(c, 6, 36, hw, hh, { r: hh / 2, fill: R.INK, sh: 7, lw: 0 });
  k.setFont(c, 400, hf.size, R.F_BAGEL); c.fillStyle = R.CR; c.fillText(hf.lines[0], 34, 36 + hh / 2 + hf.size * 0.35);
  c.restore();
  /* Akte */
  const ax = 50, ay = 330, aw = 980, ah = 1160 - ay - 8, rotA = -1;
  R.sticker(c, ax, ay, aw, ah, { r: 30, rot: rotA, sh: 12, lw: 6 });
  R.tape(c, ax + 150, ay + 6, 150, 44, -5 + rotA); R.tape(c, ax + aw - 150, ay + 6, 150, 44, 4 + rotA);
  R.rot(c, ax, ay, aw, ah, rotA, () => {
    const pad = 40; let y = 44;
    const tw = m.stamp ? 520 : aw - pad * 2;
    const wf = k.fit(c, m.lines[0], { w: 400, fam: R.F_BAGEL, max: 46, min: 28, maxW: tw, lines: 2 });
    k.setFont(c, 400, wf.size, R.F_BAGEL); c.fillStyle = R.INK;
    wf.lines.forEach((ln, i) => c.fillText(ln, pad, y + wf.size * 0.85 + i * wf.size * 1.06)); y += wf.lines.length * wf.size * 1.06 + 8;
    k.setFont(c, 700, 30, R.F_TXT); c.fillStyle = R.INK;
    m.lines.slice(1).forEach((l) => { k.wrap(c, l, tw).forEach((ln) => { c.fillText(ln, pad, y + 28); y += 38; }); });
    y += 12;
    const cols = N <= 4 ? 1 : 2, nr = Math.ceil(N / cols), gap = 14, avail = ah - y - 36;
    const pitch = Math.min(cols === 1 ? 176 : 150, avail / nr), h = pitch - gap, cw = (aw - pad * 2 - (cols - 1) * 20) / cols;
    m.rows.forEach((r, i) => {
      const col = Math.floor(i / nr), ri = i % nr;
      ryuImpRow(c, k, R, r, pad + col * (cw + 20), y + ri * pitch, cw, h, (i % 2 ? 0.6 : -0.6) * 0);
    });
  });
  if (m.stamp) {
    c.save(); c.globalAlpha = 0.96;
    R.stamp(c, k, d.up(m.stamp), 800, ay + 105, 62, -8, m.crewWin ? R.RED2 : R.INK, 380);
    c.restore();
  }
  R.footer(c, k, d);
  return [cv];
}

function ex(d) { return d.extra.eliminated; }

export default {
  games: ["impostor"],
  fonts: ['400 100px "GTR Anton"'].concat(FONTS_BASE),
  accepts: (d) => !!(d.extra && Array.isArray(d.extra.players) && d.extra.players.length >= 2 && d.extra.outcome),
  texts: (d) => (d.extra ? [d.extra.word || "", d.extra.players.map((p) => p.name).join(" "), "0123456789 cm", d.up(d.tr("tplImpHCaught", "") + d.tr("tplImpHEscape", "") + d.tr("tplImpHGuess", "") + d.tr("tplImpHTie", "") + d.tr("tplImpStCaught", "") + d.tr("tplImpStInno", ""))] : []),
  render,
  renderRyu: ryuRender,
};
