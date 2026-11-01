// Ergebnisbild Darts (Entwurf dev-notes/ergebnisbild-entwuerfe/pro-spiel/darts.png): Dartscheibe mit drei Darts, rotes Band mit "GAME SHOT" und Rangliste.
// Gilt fuer alle Varianten: darts (X01), cricket (Standard, Cut Throat, Masters), shanghai, hiscore, splitscore. Die Scheibe und die Darts sind Dekoration.
// Daten: Rang und Wert (gtEcModel: Legs bei X01 und Cricket, sonst Punkte). Zusatz (shareExtra aus dem Spiel):
//   {name: Variantenname, sub: [Zeilen], rows:[{name, rest}] (nur X01), checkout:{total, label} (nur X01, echter letzter Wurf)}.
// Checkout nur, wenn er im Verlauf wirklich steht. Shanghai-Sieg als Hinweis nur, wenn das Modell den Grund "shanghai" kennt.
import { pickRows, breakHy, unHy } from "./util.js";

const BGC = "#120C0B", RED = "#C8102E", CREAM = "#F4EEDD", SOFT = "#C9BFA8", EC = "#EFE3C2", GRN = "#1E6B3A", DARK = "#17120F";
const MONO = '"Space Grotesk","Inter","GT Clean","GT CJK",sans-serif';
const ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const CX = 540, CY = 545, R = { out: 255, dIn: 238.425, tOut: 165.75, tIn: 153, bull: 24.225, bullIn: 10 };
const FIRST_CAP = 10;

function seg(c, a0, a1, r0, r1, col) {
  const p = (r, a) => [CX + r * Math.sin(a), CY - r * Math.cos(a)];
  c.beginPath(); let q = p(r1, a0); c.moveTo(q[0], q[1]); c.arc(CX, CY, r1, a0 - Math.PI / 2, a1 - Math.PI / 2);
  q = p(r0, a1); c.lineTo(q[0], q[1]); c.arc(CX, CY, r0, a1 - Math.PI / 2, a0 - Math.PI / 2, true); c.closePath(); c.fillStyle = col; c.fill();
}
function board(c, k) {
  c.fillStyle = "#14100E"; c.beginPath(); c.arc(CX, CY, 300.9, 0, 7); c.fill();
  ORDER.forEach((num, i) => {
    const a0 = (i * 18 - 9) * Math.PI / 180, a1 = (i * 18 + 9) * Math.PI / 180, even = i % 2 === 0;
    const sCol = even ? DARK : EC, rCol = even ? RED : GRN;
    seg(c, a0, a1, R.bull, R.tIn, sCol); seg(c, a0, a1, R.tIn, R.tOut, rCol); seg(c, a0, a1, R.tOut, R.dIn, sCol); seg(c, a0, a1, R.dIn, R.out, rCol);
    const am = i * 18 * Math.PI / 180, rr = 278;
    k.setFont(c, 400, 40, k.F_ANTON); c.fillStyle = EC; c.textAlign = "center";
    c.fillText(String(num), CX + rr * Math.sin(am), CY - rr * Math.cos(am) + k.capH(c) / 2); c.textAlign = "left";
  });
  c.fillStyle = GRN; c.beginPath(); c.arc(CX, CY, R.bull, 0, 7); c.fill();
  c.fillStyle = RED; c.beginPath(); c.arc(CX, CY, R.bullIn, 0, 7); c.fill();
}
/* Ein Dart: Spitze bei (x, y), Koerper nach oben, rot Grad nach rechts gekippt */
function dart(c, x, y, rot) {
  c.save(); c.translate(x, y); c.rotate(rot * Math.PI / 180); c.scale(0.8, 0.8);
  c.lineCap = "round";
  c.fillStyle = "#cfd3d8"; c.beginPath(); c.moveTo(0, 0); c.lineTo(-3.5, -28); c.lineTo(3.5, -28); c.closePath(); c.fill();
  c.fillStyle = RED; c.beginPath(); c.moveTo(-8, -28); c.lineTo(8, -28); c.lineTo(7, -104); c.lineTo(-7, -104); c.closePath(); c.fill();
  c.fillStyle = "rgba(0,0,0,0.35)"; for (let q = 0; q < 5; q++) c.fillRect(-8, -38 - q * 14, 16, 4);
  c.fillStyle = "#1f1f22"; c.fillRect(-3, -138, 6, 36);
  c.fillStyle = "#f3f3f1"; c.beginPath(); c.moveTo(-3, -134); c.lineTo(-26, -196); c.lineTo(-2, -178); c.lineTo(0, -200); c.lineTo(2, -178); c.lineTo(26, -196); c.lineTo(3, -134); c.closePath(); c.fill();
  c.strokeStyle = RED; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -136); c.lineTo(0, -196); c.stroke();
  c.restore();
}
function stripes(c, y0, y1) {
  c.save(); c.beginPath(); c.rect(0, y0, 1080, y1 - y0); c.clip(); c.fillStyle = "rgba(0,0,0,0.133)";
  const s = 28 * Math.SQRT2;
  for (let i = 0; i * 2 * s < 1080 + (y1 - y0) + y1; i++) {
    const c1 = y0 + (2 * i + 1) * s, c2 = y0 + (2 * i + 2) * s;
    c.beginPath(); c.moveTo(c1 - y0, y0); c.lineTo(c2 - y0, y0); c.lineTo(c2 - y1, y1); c.lineTo(c1 - y1, y1); c.closePath(); c.fill();
  }
  c.restore();
}
function rowsBlock(c, k, d, list, info, top, bottom) {
  const n = list.length;
  const wf = n <= 3 ? 64 : n === 4 ? 58 : n === 5 ? 52 : 46, of = n <= 3 ? 48 : n === 4 ? 42 : n === 5 ? 38 : 36;
  const heights = list.map((r) => (r.winner ? wf : of) * 1.2 + 14);
  const tot = heights.reduce((a, b) => a + b, 0), k2 = Math.min(1, (bottom - top) / tot);
  let y = bottom - tot * k2;
  list.forEach((r, i) => {
    const fs = (r.winner ? wf : of) * k2, h = heights[i] * k2, mid = y + 3 + (h - 3) / 2;
    c.fillStyle = "rgba(255,255,255,0.53)"; c.fillRect(70, y, 940, 3);
    k.setFont(c, 400, fs, k.F_ANTON); const vw = c.measureText(r.value).width, cap = k.capH(c);
    const un = info.unit(r.score);
    let uw = 0;
    if (un) { const uf = k.fit(c, un, { w: 600, fam: MONO, max: Math.max(22, fs * 0.5), min: 20, maxW: 130, lines: 1 }); k.setFont(c, 600, uf.size, MONO); uw = c.measureText(uf.lines[0]).width + 12; c.fillStyle = "rgba(255,255,255,0.85)"; c.textAlign = "right"; c.fillText(uf.lines[0], 1010, mid + cap / 2); c.textAlign = "left"; k.setFont(c, 400, fs, k.F_ANTON); }
    c.fillStyle = "#fff"; c.textAlign = "right"; c.fillText(r.value, 1010 - uw, mid + cap / 2); c.textAlign = "left";
    const mt = info.mid[i];
    const ux = 1010 - uw - Math.max(vw, 60) - 24;
    let mw = 0;
    if (mt) {
      const mf = k.fit(c, mt, { w: 600, fam: MONO, max: Math.max(22, fs * 0.5), min: 20, maxW: 420, lines: 1, ls: 0.04 });
      k.setFont(c, 600, mf.size, MONO); mw = k.spacedW(c, mf.lines[0], mf.size * 0.04);
      c.fillStyle = "#fff"; k.spaced(c, mf.lines[0], ux - mw, mid + mf.size * 0.35, mf.size * 0.04, "left");
    }
    const nw = ux - (mw ? mw + 30 : 0) - 70 - 16;
    const f = k.nameFit(c, r.name, { w: 400, fam: k.F_ANTON, max: Math.max(24, fs), maxW: nw, oneMin: 0.7, max2: Math.max(24, (h - 8) / 2.2) });
    k.setFont(c, 400, f.size, k.F_ANTON); c.fillStyle = "#fff";
    const lh = f.size * 1.06, cp = k.capH(c);
    f.lines.forEach((ln, q) => c.fillText(ln, 70, mid - ((f.lines.length - 1) * lh) / 2 + q * lh + cp / 2));
    y += h;
  });
}
function page1(d, k, info, list) {
  const { cv, c } = k.tplCanvas();
  c.fillStyle = BGC; c.fillRect(0, 0, k.TPL_W, k.TPL_H);
  const nL = list.length, dense = nL >= 8, many = nL > 5;
  // Viele Spieler: Scheibe kleiner und weiter nach oben (Dartspitzen bleiben unter dem Kopf), das rote Band beginnt hoeher
  const Y0 = dense ? 600 : many ? 700 : 880, bs = dense ? 0.6 : many ? 0.745 : 1, bcy = dense ? 407 : many ? 466 : 545;
  c.fillStyle = RED; c.fillRect(0, Y0, 1080, 1350 - Y0); stripes(c, Y0, 1350);
  c.save(); if (many) { c.translate(540, bcy); c.scale(bs, bs); c.translate(-540, -545); }
  board(c, k);
  dart(c, 528, 383, 3); dart(c, 546, 294, 9); dart(c, 582, 372, 12);
  c.restore();
  // Kopf
  const lw = k.logo(c, d.logo, 70, 70, 100, CREAM);
  k.setFont(c, 800, 50, k.F_BALOO); c.fillStyle = CREAM; c.fillText("GameTab", 70 + lw + 22, 70 + 50 + 17);
  // Titel links (Variantenname gross)
  const title = d.up(info.name), tw = 300;
  let tf = k.fit(c, title, { w: 400, fam: k.F_ANTON, max: 88, min: 56, maxW: tw, lines: 1 });
  let tl = tf.lines;
  if (tf.cut) { const t2 = k.fit(c, breakHy(title), { w: 400, fam: k.F_ANTON, max: 80, min: 36, maxW: tw, lines: 2 }); tf = t2; tl = unHy(t2.lines); }
  k.setFont(c, 400, tf.size, k.F_ANTON); c.fillStyle = RED;
  const cap = k.capH(c); let ty = 215 + (tf.size * 0.9 - cap) / 2 + cap;
  tl.forEach((ln, i) => c.fillText(ln, 70, ty + i * tf.size * 0.9));
  let sy = ty + (tl.length - 1) * tf.size * 0.9 + 34;
  info.sub.forEach((s) => {
    const f = k.fit(c, d.up(s), { w: 600, fam: MONO, max: 20, min: 12, maxW: 290, lines: 2, ls: 0 });
    k.setFont(c, 600, f.size, MONO); c.fillStyle = SOFT;
    f.lines.forEach((ln) => { k.spaced(c, ln, 70, sy, f.size * 0.1, "left"); sy += f.size * 1.4; });
  });
  // Datum rechts
  const parts = d.date.indexOf(",") > 0 ? [d.date.slice(0, d.date.indexOf(",") + 1), d.date.slice(d.date.indexOf(",") + 1).trim()] : [d.date];
  const df = k.fit(c, parts.reduce((a, b) => (a.length > b.length ? a : b), ""), { w: 500, fam: MONO, max: 22, min: 14, maxW: 250, lines: 1 });
  k.setFont(c, 500, df.size, MONO); c.fillStyle = SOFT; c.textAlign = "right"; parts.forEach((ln, i) => c.fillText(ln, 1010, 270 + i * df.size * 1.4)); c.textAlign = "left";
  // Banner
  const bf = k.fit(c, info.banner, { w: 400, fam: k.F_ANTON, max: dense ? 84 : many ? 100 : 120, min: 52, maxW: 940, lines: 1 });
  k.setFont(c, 400, bf.size, k.F_ANTON); c.textAlign = "center";
  const by = Y0 + 15 + (bf.size - k.capH(c)) / 2 + k.capH(c) - bf.size * 0.12;
  c.fillStyle = BGC; c.fillText(bf.lines[0], 540, by + 6); c.fillStyle = "#fff"; c.fillText(bf.lines[0], 540, by); c.textAlign = "left";
  rowsBlock(c, k, d, list, info, dense ? Y0 + 112 : Y0 + 150 + (bf.size - 120) * 0.5, dense ? 1310 : 1300);
  return cv;
}

export default {
  games: ["darts", "cricket", "shanghai", "hiscore", "splitscore"],
  fonts: ["400 100px \"GTR Anton\"", "800 52px \"Baloo 2\"", "600 24px \"Space Grotesk\"", "500 22px \"Space Grotesk\""],
  texts: (d) => [d.tr("ecWinShanghai", ""), d.tr("tplDtCheckout", (a) => a)(0, ""), d.tr("tplDtRest", (a) => a)(0), d.model.heroLabel, d.up((d.extra && d.extra.name) || ""), ((d.extra && d.extra.sub) || []).map((s) => d.up(s)).join(" "), "GAME SHOT SHANGHAI!0123456789"],
  accepts: (d) => d.rows.length > 0,
  render(d, k) {
    const ex = d.extra || {};
    const gid = d.gameId;
    const picked = pickRows(d, ex.rows, null);
    const shanghai = gid === "shanghai" && d.model.detail && d.model.detail === d.tr("ecWinShanghai", "") ;
    const co = ex.checkout && ex.checkout.total != null ? ex.checkout : null;
    const mid = d.rows.map((r, i) => {
      const e = picked[i];
      if (r.winner) {
        if (gid === "darts" && co && d.winners[0] === r) return d.tr("tplDtCheckout", (a, b) => a + " " + b)(d.num(co.total), co.label || "");
        if (shanghai) return d.tr("ecWinShanghai", "");
        return "";
      }
      if (gid === "darts" && e && e.rest != null && isFinite(Number(e.rest))) return d.tr("tplDtRest", (a) => a)(d.num(Number(e.rest)));
      return "";
    });
    if (gid === "darts" && co) { const wi = d.rows.indexOf(d.winners[0]); if (wi >= 0 && !mid[wi]) mid[wi] = ""; }
    const uw = d.tr(gid === "darts" || gid === "cricket" ? "nlULegs" : "nlUPoints", null);
    const one = (n) => (d.lang === "fr" || d.lang === "pt" ? Math.abs(n) < 2 : Math.abs(n) === 1);
    const unit = (n) => (Array.isArray(uw) && n != null ? String(uw[one(n) ? 0 : 1] || "") : "");
    const banner = shanghai ? "SHANGHAI!" : (gid === "darts" || gid === "cricket") && !d.tie ? "GAME SHOT" : d.up(d.model.heroLabel);
    const info = { name: ex.name || d.gameLabel, sub: Array.isArray(ex.sub) ? ex.sub.filter(Boolean) : [], mid, unit, banner };
    const parts = k.chunks(d.rows, FIRST_CAP, 12);
    const out = [page1(d, k, Object.assign({}, info, { mid: mid.slice(0, FIRST_CAP) }), parts[0])];
    const sty = { bg: (c) => { c.fillStyle = BGC; c.fillRect(0, 0, k.TPL_W, k.TPL_H); c.fillStyle = RED; c.fillRect(0, 0, 1080, 14); }, ink: "#fff", sub: SOFT, acc: "#fff", line: "rgba(255,255,255,0.3)", fam: k.F_ANTON, logo: CREAM };
    parts.slice(1).forEach((p, i) => out.push(k.listPage(d, p, i + 2, parts.length, sty)));
    return out;
  },
};
