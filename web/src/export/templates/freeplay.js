// Ergebnisbild Freies Spiel (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/freiesspiel.png, Notizbuch).
// Daten: gtEcModel (Raenge, Gleichstand, Summen) plus shareExtra {lowWins, target}. Unterzeile "X gewinnt mit N Punkten" aus den Summen,
// Stempel = "Gewonnen"/"Gemeinsam gewonnen" (vorhandene Texte). Bei "tiefste gewinnt" steht "tief gewinnt" neben dem Datum.
import { F_FRAUNCES } from "./fonts-a.js";

const PAPER = "#F3EEE0", INK = "#26222B", PUR = "#9A7BA8", PUR2 = "#6E4F80", PUR3 = "#7F6498", MUTE = "#6A6475";
const FIRST_CAP = 8;

function bookPath(c, x, y, w, h, tl, tr, br, bl) {
  c.beginPath(); c.moveTo(x + tl, y); c.lineTo(x + w - tr, y); c.arcTo(x + w, y, x + w, y + tr, tr); c.lineTo(x + w, y + h - br); c.arcTo(x + w, y + h, x + w - br, y + h, br);
  c.lineTo(x + bl, y + h); c.arcTo(x, y + h, x, y + h - bl, bl); c.lineTo(x, y + tl); c.arcTo(x, y, x + tl, y, tl); c.closePath();
}
function bg(c, k) {
  c.fillStyle = "#17151A"; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  c.save(); c.shadowColor = "rgba(0,0,0,0.6)"; c.shadowBlur = 60; c.shadowOffsetY = 30;
  c.fillStyle = PAPER; bookPath(c, 60, 50, 960, 1250, 14, 34, 34, 14); c.fill(); c.restore();
  c.save(); bookPath(c, 60, 50, 960, 1250, 14, 34, 34, 14); c.clip();
  const g = c.createLinearGradient(60, 0, 150, 0); g.addColorStop(0, "rgba(0,0,0,0.157)"); g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(60, 50, 90, 1250);
  c.fillStyle = "rgba(142,138,124,0.55)";
  for (let y = 50 + 18; y < 1300; y += 36) for (let x = 150 + 18; x < 990; x += 36) { c.beginPath(); c.arc(x, y, 2.1, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = "rgba(14,13,16,0.88)"; c.fillRect(974, 50, 26, 1250);
  c.restore();
  c.save(); bookPath(c, 60, 50, 960, 1250, 14, 34, 34, 14); c.strokeStyle = "rgba(0,0,0,0.13)"; c.lineWidth = 1; c.stroke(); c.restore();
  /* Lesezeichen */
  c.save(); c.shadowColor = "rgba(0,0,0,0.27)"; c.shadowBlur = 10; c.shadowOffsetX = 3; c.shadowOffsetY = 6;
  const rg = c.createLinearGradient(866, 0, 910, 0); rg.addColorStop(0, "#7F6498"); rg.addColorStop(0.4, "#9A7BA8"); rg.addColorStop(0.6, "#B497C0"); rg.addColorStop(1, "#7F6498");
  c.fillStyle = rg; c.beginPath(); c.moveTo(866, 50); c.lineTo(910, 50); c.lineTo(910, 1050); c.lineTo(888, 989); c.lineTo(866, 1050); c.closePath(); c.fill(); c.restore();
}
/* Eine Zeile: Rang, Name (Kalam), Summe (Fraunces). Rueckgabe: noetige Hoehe. w=Gewinner */
function row(c, k, r, y, fsN, fsS, winner, h) {
  const x0 = 170, x1 = 820;
  const nameX = 240;
  /* Summe rechts */
  const vf = k.fit(c, r.value, { w: 700, fam: F_FRAUNCES, max: fsS, min: fsS * 0.45, maxW: 330 });
  k.setFont(c, 700, vf.size, F_FRAUNCES); const vw = c.measureText(r.value).width;
  const base = y + h * (winner ? 0.62 : 0.66);
  c.fillStyle = winner ? PUR2 : INK; c.textAlign = "right"; c.fillText(r.value, x1, base); c.textAlign = "left";
  const maxW = x1 - nameX - vw - 44;
  let f = k.fit(c, r.name, { w: 700, fam: k.F_KALAM, max: fsN, min: fsN * 0.62, maxW, lines: 1 });
  if (f.cut) f = k.fit(c, r.name, { w: 700, fam: k.F_KALAM, max: fsN * 0.62, min: Math.max(14, fsN * 0.36), maxW, lines: 2 });
  k.setFont(c, 700, f.size, k.F_KALAM); c.fillStyle = INK;
  if (f.lines.length === 1) c.fillText(f.lines[0], nameX, base);
  else { const lh = f.size * 1.12; f.lines.forEach((l, i) => c.fillText(l, nameX, base - (f.lines.length - 1 - i) * lh)); }
  /* Rang */
  k.setFont(c, 700, Math.max(22, fsN * 0.56), F_FRAUNCES); c.fillStyle = PUR; c.fillText(String(r.rank), x0, base);
  /* Linie unten */
  c.fillStyle = "rgba(38,34,43,0.2)"; c.fillRect(x0, y + h - 3, x1 - x0, 3);
}

function page1(d, k, rows) {
  const { cv, c } = k.tplCanvas();
  bg(c, k);
  /* Kopf: Logo und Marke */
  const lw = k.logo(c, d.logo, 170, 92, 100, INK);
  k.setFont(c, 800, 44, k.F_BALOO); c.fillStyle = INK; c.fillText("GameTab", 170 + lw + 22, 92 + 50 + 15);
  /* Datum (links) und Regel (rechts) */
  const df = k.fit(c, d.date, { w: 400, fam: k.F_KALAM, max: 30, min: 18, maxW: d.low ? 330 : 640 });
  k.setFont(c, 400, df.size, k.F_KALAM); c.fillStyle = MUTE; c.fillText(df.lines[0], 170, 278);
  if (d.low) { const lt = d.tr("tplSkyjoLow", "tief gewinnt"); const lf = k.fit(c, lt, { w: 700, fam: k.F_KALAM, max: 30, min: 18, maxW: 300 }); k.setFont(c, 700, lf.size, k.F_KALAM); c.fillStyle = PUR3; c.textAlign = "right"; c.fillText(lf.lines[0], 820, 278); c.textAlign = "left"; }
  /* Titel mit Unterstreichung */
  const tf = k.fit(c, d.gameLabel, { w: 700, fam: F_FRAUNCES, max: 100, min: 56, maxW: 650, lines: 1 });
  k.setFont(c, 700, tf.size, F_FRAUNCES); c.fillStyle = INK; c.fillText(tf.lines[0], 170, 285 + tf.size * 0.93 + (100 - tf.size) * 0.05);
  const tw = c.measureText(tf.lines[0]).width;
  c.fillStyle = PUR; k.rrect(c, 170, 400, Math.min(650, Math.max(300, tw + 35)), 10, 5); c.fill();
  /* Zeilen */
  const n = rows.length, budget = 590;
  const wn0 = rows.filter((r) => r.winner).length;
  const pitchMax = budget / (n + 0.45 * Math.max(1, wn0));
  const fsN = Math.max(26, Math.min(78, pitchMax / 2.05));
  const pitch = Math.min(160, fsN * 2.05);
  const wn = rows.filter((r) => r.winner).length;
  const hW = pitch * 1.45;
  void wn;
  /* Markierstift unter dem/den Sieger-Zeilen: erst Lage berechnen, dann zeichnen (liegt unter dem Text) */
  const ys = []; let y = 470, hlTop = null, hlBot = 0;
  rows.forEach((r) => { const h = r.winner ? hW : pitch; ys.push([y, h]); if (r.winner) { if (hlTop == null) hlTop = y; hlBot = y + h; } y += h; });
  if (hlTop != null) {
    const hh = hlBot - hlTop;
    c.save(); c.translate(160 + 325, hlTop + hh / 2); c.rotate(-1 * Math.PI / 180); c.translate(-(160 + 325), -(hlTop + hh / 2));
    c.fillStyle = "rgba(154,123,168,0.18)"; k.rrect(c, 160, hlTop + 4, 650, hh - 10, 6); c.fill(); c.restore();
  }
  rows.forEach((r, i) => {
    const wr = r.winner, h = ys[i][1];
    row(c, k, r, ys[i][0], wr ? Math.min(118, fsN * 1.5) : fsN, wr ? Math.min(150, fsN * 1.93) : Math.min(96, fsN * 1.23), wr, h);
  });
  const endY = y;
  /* Stempel und Satz unten */
  const noteBase = 1236;
  const win = d.winners.length ? d.winners : d.rows.slice(0, 1);
  const names = win.map((r) => r.name);
  const joinF = d.tr("stuAnd", "und");
  const joined = names.length < 2 ? names[0] : names.slice(0, -1).join(", ") + " " + joinF + " " + names[names.length - 1];
  const sc = win[0].score;
  const one = d.lang === "fr" || d.lang === "pt" ? (sc != null && Math.abs(sc) < 2) : sc === 1 || sc === -1;
  const fn = d.tr(names.length > 1 ? "tplFreeWinN" : "tplFreeWin1");
  const note = typeof fn === "function" ? fn(joined, win[0].value, one) : joined;
  const nf = k.fit(c, note, { w: 400, fam: k.F_KALAM, max: 44, min: 26, maxW: 680, lines: 2 });
  c.save(); c.translate(170 + 340, 1215); c.rotate(-2 * Math.PI / 180); c.translate(-(170 + 340), -1215);
  k.setFont(c, 400, nf.size, k.F_KALAM); c.fillStyle = "#4A4455";
  const nlh = nf.size * 1.25; nf.lines.forEach((l, i) => c.fillText(l, 170, noteBase - (nf.lines.length - 1 - i) * nlh));
  c.restore();
  const stampTxt = d.tie ? d.tr("ecWonMany", "Gemeinsam gewonnen") : d.tr("ecWon", "Gewonnen");
  const sf = k.fit(c, stampTxt, { w: 700, fam: F_FRAUNCES, max: 40, min: 22, maxW: 330 });
  k.setFont(c, 700, sf.size, F_FRAUNCES);
  const sw = c.measureText(sf.lines[0]).width + 36 + 10, sh = sf.size * 1.2 + 12 + 10;
  const stampBottom = nf.lines.length > 1 ? 1128 : endY < 1090 ? 1180 : 1190;
  c.save(); c.translate(880 - sw / 2, stampBottom - sh / 2); c.rotate(-8 * Math.PI / 180);
  c.strokeStyle = PUR; c.lineWidth = 5; k.rrect(c, -sw / 2 + 2.5, -sh / 2 + 2.5, sw - 5, sh - 5, 12); c.stroke();
  c.fillStyle = PUR3; c.textAlign = "center"; c.fillText(sf.lines[0], 0, sf.size * 0.34); c.textAlign = "left"; c.restore();
  return cv;
}

/* Folgeseite (ab dem 9. Eintrag): gleiche Zeilen im Notizbuch, nur im Schreibbereich */
function listPageBook(d, k, rows, no, count) {
  const { cv, c } = k.tplCanvas();
  bg(c, k);
  const lw = k.logo(c, d.logo, 170, 92, 100, INK);
  k.setFont(c, 800, 44, k.F_BALOO); c.fillStyle = INK; c.fillText("GameTab", 170 + lw + 22, 92 + 50 + 15);
  const pg = d.tr("ecPage", (x, y) => x + "/" + y);
  const pt = d.gameLabel + " \u00B7 " + (typeof pg === "function" ? pg(no, count) : no + "/" + count);
  const tf = k.fit(c, pt, { w: 700, fam: F_FRAUNCES, max: 56, min: 30, maxW: 650 });
  k.setFont(c, 700, tf.size, F_FRAUNCES); c.fillStyle = INK; c.fillText(tf.lines[0], 170, 290);
  c.fillStyle = PUR; k.rrect(c, 170, 318, 300, 8, 4); c.fill();
  const pitch = Math.min(80, 840 / Math.max(rows.length, 1));
  rows.forEach((r, i) => row(c, k, r, 350 + i * pitch, Math.min(44, pitch * 0.55), Math.min(54, pitch * 0.66), false, pitch));
  k.setFont(c, 400, 28, k.F_KALAM); c.fillStyle = MUTE; c.fillText(d.date, 170, 1250);
  return cv;
}

export default {
  games: ["freeplay"],
  fonts: ["700 100px Fraunces", "700 78px Kalam", "400 44px Kalam", "700 44px Kalam", "800 44px \"Baloo 2\""],
  texts: (d) => [d.gameLabel, d.date, d.tr("tplSkyjoLow", ""), d.tr("ecWon", ""), d.tr("ecWonMany", ""), d.tr("stuAnd", ""), "0123456789", d.winners.map((r) => r.name).join(" ")],
  render(d, k) {
    d.low = !!(d.extra && d.extra.lowWins);
    const first = d.rows.slice(0, FIRST_CAP);
    const out = [];
    out.push(page1(d, k, first));
    const rest = d.rows.slice(FIRST_CAP);
    const parts = k.chunks(rest, 12, 12).filter((p) => p.length);
    parts.forEach((p, i) => out.push(listPageBook(d, k, p, i + 2, parts.length + 1)));
    return out;
  },
};
