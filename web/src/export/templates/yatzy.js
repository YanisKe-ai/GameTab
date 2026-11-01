// Ergebnisbild Yatzy (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/yatzy.png).
// Daten: nur Namen, Raenge und Endpunkte (gtEcModel). Wuerfel und Becher sind Spielsymbol (fuenf gleiche = "Yatzy"), keine Wurfdaten.
// 2 bis 8 Spieler: die Wuerfelflaeche weicht der Rangliste (zwei Reihen, kleiner, oder eine Reihe), mehr als 8 Eintraege -> Folgeseiten.

const BG = "#1C2838", ACC = "#9DB8D6", LINE = "#5B7A9D", INK = "#FFFFFF", DIE = "#F4EFE3", PIP = "#1B2431";
const FIRST_CAP = 7; // Eintraege unter dem Sieger auf Seite 1 (Yatzy: max 8 Spieler)
const DICE = [[90, 420, -5], [350, 410, 4], [610, 420, -3], [220, 650, 3], [490, 650, -4]]; // links, oben, Drehung (Entwurf, 190 px)

function bg(c, k) {
  c.fillStyle = BG; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  k.cssEllipse(c, 0, 0, k.TPL_W, k.TPL_H, 540, 742.5, [[0, "#2C405A"], [0.75, "#141D2A"], [1, "#141D2A"]]);
}
/* Wuerfelbecher wie im Entwurf: Trapez 260 x 370 bei (700,70), 26 Grad um die Mitte der Unterkante gedreht */
function cup(c) {
  c.save(); c.translate(830, 440); c.rotate(26 * Math.PI / 180); c.translate(-130, -370);
  c.beginPath(); c.moveTo(36.4, 0); c.lineTo(223.6, 0); c.lineTo(260, 370); c.lineTo(0, 370); c.closePath(); c.clip();
  const g = c.createLinearGradient(0, 0, 260, 0); g.addColorStop(0, "#7A4A2A"); g.addColorStop(0.45, "#A86A3A"); g.addColorStop(1, "#6B3E22");
  c.fillStyle = g; c.fillRect(0, 0, 260, 370);
  c.fillStyle = "#E8D8A8"; c.fillRect(0, 324, 260, 46);
  c.strokeStyle = "rgba(232,216,168,0.67)"; c.lineWidth = 4; c.setLineDash([12, 12]);
  [32, 228].forEach((x) => { c.beginPath(); c.moveTo(x, 60); c.lineTo(x, 280); c.stroke(); });
  c.restore();
}
function die(c, k, x, y, s, rot) {
  const h = s / 2;
  c.save(); c.translate(x + h, y + h); c.rotate(rot * Math.PI / 180);
  const r = 34 * s / 190;
  c.fillStyle = "rgba(0,0,0,0.4)"; k.rrect(c, -h + 12 * s / 190, -h + 16 * s / 190, s, s, r); c.fill();
  c.fillStyle = DIE; k.rrect(c, -h, -h, s, s, r); c.fill();
  c.fillStyle = PIP; const pr = 15.5 * s / 190;
  [[0.18, 0.18], [0.82, 0.18], [0.18, 0.5], [0.82, 0.5], [0.18, 0.82], [0.82, 0.82]].forEach(([px, py]) => { c.beginPath(); c.arc(-h + px * s, -h + py * s, pr, 0, Math.PI * 2); c.fill(); });
  c.restore();
}
/* Wuerfel im Bereich [top, bottom]: Entwurfsanordnung (2 Reihen) skaliert, bei wenig Platz eine Reihe unter dem Becher */
function dice(c, k, bottom) {
  const s2 = Math.min(1, (bottom - 410) / 440);
  if (s2 >= 0.7) { const ax = 445, ay = 410; DICE.forEach(([x, y, r]) => die(c, k, ax + (x - ax) * s2, ay + (y - ay) * s2, 190 * s2, r)); return; }
  // eine Reihe: entweder volle Breite unter dem Becher oder links neben dem Becher unter dem Titel, je nachdem was groesser wird
  const full = Math.min(172, bottom - 505 - 12), left = Math.min(112, bottom - 330 - 12);
  const useFull = full >= left, sz = Math.max(48, useFull ? full : left), gap = Math.min(24, sz * 0.14);
  const w = 5 * sz + 4 * gap, x0 = useFull ? 540 - w / 2 : 70, top = useFull ? 505 : 330;
  DICE.forEach(([, , r], i) => die(c, k, x0 + i * (sz + gap), top, sz, r));
}
function footer(c, k, d) {
  const lw = k.logo(c, d.logo, 60, 1210, 100, INK);
  const x = 60 + lw + 20;
  k.setFont(c, 800, 52, k.F_BALOO); c.fillStyle = INK; c.fillText("GameTab", x, 1252);
  const f = k.fit(c, d.date, { w: 700, fam: k.F_BALOO, max: 26, min: 18, maxW: 1020 - x });
  k.setFont(c, 700, f.size, k.F_BALOO); c.globalAlpha = 0.9; c.fillText(f.lines[0], x, 1293); c.globalAlpha = 1;
}
/* Rangliste unter dem Sieger: zwei Spalten, Name links, Punkte rechts, Linie oben */
function grid(c, k, rows, top, fs, pitch) {
  const cw = (960 - 30) / 2;
  rows.forEach((r, i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 60 + col * (cw + 30), y = top + row * pitch;
    c.fillStyle = LINE; c.fillRect(x, y, cw, 6);
    k.setFont(c, 400, fs, k.F_ANTON); const capY = y + 12 + fs * 0.12; const bl = capY + k.capH(c);
    c.textAlign = "right"; c.fillStyle = ACC; c.fillText(r.value, x + cw, bl); const vw = c.measureText(r.value).width; c.textAlign = "left";
    const f = k.fit(c, r.name, { w: 400, fam: k.F_ANTON, max: fs, min: Math.round(fs * 0.55), maxW: cw - vw - 20, lines: 1 });
    k.setFont(c, 400, f.size, k.F_ANTON); c.fillStyle = INK; c.fillText(f.lines[0], x, bl);
  });
}

function page1(d, k, others) {
  const { cv, c } = k.tplCanvas();
  bg(c, k);
  const n = others.length, R = Math.ceil(n / 2);
  const fs = R <= 2 ? 46 : R === 3 ? 42 : 38, pitch = R <= 2 ? 78 : R === 3 ? 70 : 64;
  const gridTop = n ? Math.min(1060, 1196 - R * pitch) : 1196;
  /* Sieger: Name(n) links (Anton, 1 bis 2 Zeilen), Punkte rechts, gemeinsame Grundlinie */
  const heroBase = gridTop - 35;
  const hs = R <= 2 ? 190 : R === 3 ? 165 : 150;
  const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
  const name = d.up(win.map((r) => r.name).join(" & "));
  const val = win[0].value;
  k.setFont(c, 400, hs, k.F_ANTON); const vw = c.measureText(val).width;
  // 1 Zeile gross, sonst 2 Zeilen (max 150), sonst 3 Zeilen (max 112); gekuerzt wird erst darunter
  const fo = { w: 400, fam: k.F_ANTON, maxW: 960 - vw - 40 };
  let nf = k.fit(c, name, Object.assign({}, fo, { max: hs, min: Math.round(hs * 0.62), lines: 1 }));
  if (nf.cut) nf = k.fit(c, name, Object.assign({}, fo, { max: Math.min(hs, 150), min: 72, lines: 2 }));
  if (nf.cut) nf = k.fit(c, name, Object.assign({}, fo, { max: 112, min: 56, lines: 3 }));
  /* Zeilen nach echten Glyphen stapeln: Akzente/Umlaute der unteren und Unterlaengen der oberen Zeile bekommen Platz */
  k.setFont(c, 400, nf.size, k.F_ANTON); const cap = k.capH(c);
  const asc = nf.lines.map((l) => Math.max(cap, c.measureText(l).actualBoundingBoxAscent || cap));
  const dsc = nf.lines.map((l) => Math.max(0, c.measureText(l).actualBoundingBoxDescent || 0));
  const bl = new Array(nf.lines.length); bl[nf.lines.length - 1] = heroBase;
  for (let i = nf.lines.length - 2; i >= 0; i--) bl[i] = bl[i + 1] - (asc[i + 1] + dsc[i] + nf.size * 0.08);
  const nameTop = bl[0] - asc[0];
  let heroTop = Math.min(nameTop, (() => { k.setFont(c, 400, hs, k.F_ANTON); return heroBase - k.capH(c); })());
  /* Gleichstand: kleiner Hinweis ueber dem Namen */
  let tieY = 0;
  if (d.tie) { tieY = heroTop - 26; heroTop = tieY - 40; }
  /* Titel und Becher, dann Wuerfel im verbleibenden Raum */
  const title = d.up(d.gameLabel) + "!";
  const tf = k.fit(c, title, { w: 400, fam: k.F_ANTON, max: 270, min: 120, maxW: 640, lines: 1 });
  k.setFont(c, 400, tf.size, k.F_ANTON); c.fillStyle = ACC; c.fillText(tf.lines[0], 50, 55 + k.capH(c));
  cup(c);
  dice(c, k, heroTop - 18);
  if (d.tie) {
    k.setFont(c, 700, 34, k.F_INTER); c.fillStyle = ACC;
    const tl = d.up(d.tr("ecTied", "Gemeinsamer erster Platz")); k.spaced(c, tl, 62, tieY, 3, "left");
  }
  k.setFont(c, 400, nf.size, k.F_ANTON); c.fillStyle = INK;
  nf.lines.forEach((ln, i) => c.fillText(ln, 60, bl[i]));
  k.setFont(c, 400, hs, k.F_ANTON); c.fillStyle = ACC; c.textAlign = "right"; c.fillText(val, 1020, heroBase); c.textAlign = "left";
  grid(c, k, others, gridTop, fs, pitch);
  footer(c, k, d);
  return cv;
}

export default {
  games: ["yatzy"],
  fonts: ["400 100px \"GTR Anton\"", "800 52px \"Baloo 2\"", "700 26px \"Baloo 2\"", "700 34px Inter"],
  texts: (d) => [d.up(d.tr("ecTied", "")), "!&"],
  render(d, k) {
    const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
    const rest = d.rows.filter((r) => win.indexOf(r) < 0);
    const parts = k.chunks(rest, FIRST_CAP, 12);
    const out = [page1(d, k, parts[0])];
    const sty = { bg: (c) => bg(c, k), ink: INK, sub: ACC, acc: ACC, line: "rgba(157,184,214,0.35)", fam: k.F_ANTON, logo: INK };
    parts.slice(1).forEach((p, i) => out.push(k.listPage(d, p, i + 2, parts.length, sty)));
    return out;
  },
};
