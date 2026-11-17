// Ryū-Hilfen der Gruppe B (Skyjo, Flip 7, Phase 10, Rommé, Wizard, Minigolf, Darts).
// Ergaenzt ryu-kit.js (R), ohne es zu aendern: Sieger-Sticker, Zeilen mit Unterzeilen, Liste, Seitentitel.
// Alle Funktionen bekommen k (kit.js) und R (ryu-kit.js) und zeichnen nur Rot, Schwarz, Creme.

const TIERS = [{ max: 110, min: 64, lines: 1 }, { max: 84, min: 50, lines: 2 }, { max: 62, min: 34, lines: 3 }, { max: 44, min: 24, lines: 4 }];

/* Sieger-Sticker: Zackenkreis mit Platz, Name(n), Wert als schwarze Pille. Rueckgabe: Hoehe (measure) oder zeichnet bei draw. */
function heroMeasure(c, k, R, d, win, w, o) {
  o = o || {};
  const names = d.up(win.map((r) => r.name).join(" & ")), inner = w - 250 - 40;
  const nf = k.heroFit(c, names, { w: 400, fam: R.F_BAGEL, maxW: inner }, o.tiers || TIERS);
  const lh = nf.size * 1.05, nameH = nf.lines.length * lh;
  const h = Math.max(o.minH || 240, nameH + (o.valH == null ? 150 : o.valH));
  return { nf, lh, nameH, h, inner, names };
}
function heroDraw(c, k, R, d, win, m, x, y, w, o) {
  o = o || {}; const rot = o.rot == null ? -2.5 : o.rot, hh = m.h, nf = m.nf;
  R.sticker(c, x, y, w, hh, { r: 34, rot, sh: 14, lw: 6 });
  R.rot(c, x, y, w, hh, rot, () => {
    R.zig(c, 130, hh / 2, Math.min(92, hh * 0.38), { fill: R.RED, n: 20, sh: 7, lw: 5 });
    R.pop(c, String(win[0].rank == null ? 1 : win[0].rank), 130, hh / 2 + 34, 104, { align: "center", sh: 5, sw: 9 });
    k.setFont(c, 400, nf.size, R.F_BAGEL); c.fillStyle = R.INK;
    const n0 = (hh - m.nameH - 74) / 2 + nf.size * 0.86;
    nf.lines.forEach((ln, j) => c.fillText(ln, 250, n0 + j * m.lh));
    if (o.value !== false) {
      const vf = k.fit(c, win[0].value, { w: 400, fam: R.F_BAGEL, max: 64, min: 30, maxW: m.inner, lines: 1 });
      k.setFont(c, 400, vf.size, R.F_BAGEL); const vw = c.measureText(vf.lines[0]).width;
      const vy = n0 + (nf.lines.length - 1) * m.lh + 22;
      c.fillStyle = R.INK; R.rr(c, 250, vy, vw + 40, vf.size + 22, (vf.size + 22) / 2); c.fill();
      c.fillStyle = R.CR; c.fillText(vf.lines[0], 270, vy + (vf.size + 22) / 2 + vf.size * 0.36);
    }
  });
  if (d.tie) {
    const t = d.tr("ecTied", "Gemeinsamer erster Platz");
    const f = k.fit(c, t, { w: 400, fam: R.F_BAGEL, max: 34, min: 22, maxW: 560, lines: 1 });
    k.setFont(c, 400, f.size, R.F_BAGEL); const pw = c.measureText(f.lines[0]).width + 48;
    pill(c, k, R, f.lines[0], x + w - pw - 24, y - 62, 34, 3, { maxW: 560 });
  }
}

/* Zeile mit Unterzeilen. o: {x,y,w,h,rot,hot,fs, rank, name, nameSub, right, rightSub} */
function row2(c, k, R, o) {
  const hot = !!o.hot, w = o.w, h = o.h, fs = o.fs || Math.min(46, h * 0.46), rt = o.rot || 0;
  R.sticker(c, o.x, o.y, w, h, { r: Math.min(22, h * 0.3), rot: rt, sh: 7, lw: 4, fill: hot ? R.INK : R.CR });
  R.rot(c, o.x, o.y, w, h, rt, () => {
    const ink = hot ? R.CR : R.INK, subC = hot ? R.CR2 : R.INK;
    k.setFont(c, 400, fs * 0.92, R.F_BAGEL); c.fillStyle = hot ? R.RED : R.INK; c.textAlign = "center";
    c.fillText(String(o.rank), h * 0.56, h / 2 + fs * 0.33); c.textAlign = "left";
    const nx = h * 1.06, hasRS = !!o.rightSub, hasNS = !!o.nameSub, ss = Math.max(20, Math.min(28, h * 0.27));
    let rw = 0;
    if (o.right != null && o.right !== "") {
      const vf = k.fit(c, String(o.right), { w: 400, fam: R.F_BAGEL, max: fs, min: fs * 0.55, maxW: Math.min(300, w * 0.36), lines: 1 });
      k.setFont(c, 400, vf.size, R.F_BAGEL); rw = c.measureText(vf.lines[0]).width;
      c.fillStyle = ink; c.textAlign = "right"; c.fillText(vf.lines[0], w - 24, (hasRS ? h * 0.37 : h / 2) + vf.size * 0.36); c.textAlign = "left";
    }
    if (hasRS) {
      const sf = k.fit(c, String(o.rightSub), { w: 700, fam: R.F_TXT, max: ss, min: 17, maxW: Math.min(w * 0.34, 260), lines: 1 });
      k.setFont(c, 700, sf.size, R.F_TXT); c.fillStyle = subC; c.textAlign = "right"; c.fillText(sf.lines[0], w - 24, h * 0.86); rw = Math.max(rw, c.measureText(sf.lines[0]).width); c.textAlign = "left";
    }
    const maxW = w - nx - rw - 52;
    const nf = k.nameFit(c, o.name, { w: 400, fam: R.F_BAGEL, max: fs, maxW, lines: 2, max2: hasNS ? Math.max(24, h * 0.27) : fs * 0.8 });
    k.setFont(c, 400, nf.size, R.F_BAGEL); c.fillStyle = ink; const lh = nf.size * 1.05, two = nf.lines.length > 1;
    const cy = hasNS ? (two ? h * 0.33 : h * 0.4) : h / 2;
    nf.lines.forEach((ln, j) => c.fillText(ln, nx, cy + nf.size * 0.36 - ((nf.lines.length - 1) * lh) / 2 + j * lh));
    if (hasNS) {
      const sf = k.fit(c, String(o.nameSub), { w: 700, fam: R.F_TXT, max: ss, min: 17, maxW, lines: 1 });
      k.setFont(c, 700, sf.size, R.F_TXT); c.fillStyle = subC; c.fillText(sf.lines[0], nx, two ? h * 0.88 : h * 0.82);
    }
  });
}
/* Liste: rows = [{hot, rank, name, nameSub, right, rightSub}], o: {x,w,top,bottom,cols,maxPitch,fs} */
function list2(c, k, R, rows, o) {
  if (!rows.length) return;
  const cols = o.cols || 1, gap = 16, n = Math.ceil(rows.length / cols), avail = o.bottom - o.top;
  const pitch = Math.min(o.maxPitch || 104, avail / n), h = pitch - gap * 0.9, cw = (o.w - (cols - 1) * 24) / cols;
  rows.forEach((r, i) => {
    const col = cols === 1 ? 0 : i % cols, ri = cols === 1 ? i : Math.floor(i / cols);
    row2(c, k, R, Object.assign({}, r, { x: o.x + col * (cw + 24), y: o.top + ri * pitch, w: cw, h, rot: i % 2 ? 0.8 : -0.8, fs: Math.min(o.fs || 46, h * 0.5) }));
  });
}
/* Spieltitel schraeg oben links. Rueckgabe: Schriftgroesse */
function titleTilt(c, k, R, d, x, y, deg, maxW, max, text) {
  c.save(); c.translate(x, y); c.rotate(deg * Math.PI / 180);
  const tf = k.fit(c, text || d.up(d.gameLabel), { w: 400, fam: R.F_BAGEL, max: max || 150, min: 56, maxW, lines: 1 });
  R.pop(c, tf.lines[0], 0, 0, tf.size, { sh: tf.size * 0.08 }); c.restore();
  return tf;
}
/* Kleiner schwarzer Textsticker (Pille). Rueckgabe Breite */
function pill(c, k, R, text, x, y, size, deg, o) {
  o = o || {};
  const f = k.fit(c, text, { w: 400, fam: o.fam || R.F_BAGEL, max: size, min: Math.max(20, size * 0.55), maxW: o.maxW || 620, lines: 1 });
  k.setFont(c, o.wt || 400, f.size, o.fam || R.F_BAGEL); const tw = c.measureText(f.lines[0]).width, w = tw + 48, h = f.size + 30;
  R.sticker(c, x, y, w, h, { r: h / 2, fill: o.fill || R.INK, rot: deg, sh: 6, lw: o.fill === R.CR ? 4 : 0 });
  R.rot(c, x, y, w, h, deg, () => { k.setFont(c, o.wt || 400, f.size, o.fam || R.F_BAGEL); c.fillStyle = o.ink || R.CR; c.fillText(f.lines[0], 24, h / 2 + f.size * 0.36); });
  return { w, h };
}

export { heroMeasure, heroDraw, row2, list2, titleTilt, pill, TIERS };
