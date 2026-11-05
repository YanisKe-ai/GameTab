// Ergebnisbild pro Spiel: gemeinsamer Baukasten (Canvas 2D, 1080 x 1350).
// Technik: direkt Canvas 2D wie das bisherige Bild (kein DOM-zu-Bild, kein SVG-foreignObject):
// sicher auf iOS Safari/PWA (kein tainted canvas, Schriften per FontFace/document.fonts, wenig Speicher), offline (woff2 im Precache).
// Eine Vorlage = eine Datei in diesem Ordner, Registry in index.js. Anleitung: dev-notes/ERGEBNISBILD_EINBAU.md.
import { gtEcModel, gtEcFonts, gtEcNum, gtEcTr, gtEcNoEmoji, GT_EC_CJK } from "../result-card.js";
import { APP_LOGO_URI_GOLD } from "../../assets/logo-data.js";
import { breakHy, unHy } from "./util.js";

const TPL_W = 1080, TPL_H = 1350;
/* Schrift-Stapel: Fallback auf GT Clean (DejaVu, viele Schriftsysteme) und GT CJK (nur geladen, wenn CJK-Text vorkommt). Keine Emoji-Schrift. */
const F_ANTON = '"GTR Anton","Inter","GT Clean","GT CJK",sans-serif';
const F_INTER = '"Inter","GT Clean","GT CJK",sans-serif';
const F_BALOO = '"Baloo 2","Inter","GT Clean","GT CJK",sans-serif';
const F_KALAM = '"Kalam","Inter","GT Clean","GT CJK",sans-serif';
const LOGO_AR = 1920 / 804;

/* ---------- Laden: Schriften und Logo ---------- */
let tplAntonP = null, tplLogoP = null;
function tplAnton() {
  if (!tplAntonP) {
    const f = new FontFace("GTR Anton", 'url("' + new URL("fonts/Anton-Regular.woff2", document.baseURI).href + '") format("woff2")', { weight: "400", style: "normal", display: "block" });
    document.fonts.add(f);
    tplAntonP = f.load().catch((e) => { tplAntonP = null; throw e; });
  }
  return tplAntonP;
}
/* specs: CSS-Kurzschrift wie "700 40px Inter". text: alle Zeichen, die gezeichnet werden (laedt die passenden unicode-range-Teile). */
async function tplFonts(specs, text) {
  const tx = String(text || "") + "0123456789";
  // Fallback-Schriften weich laden: fehlen sie offline, zeichnet der Browser mit Systemschrift weiter.
  try { await gtEcFonts(GT_EC_CJK.test(tx)); } catch (_) { /* weich */ }
  const jobs = [];
  if (specs.some((s) => s.indexOf("GTR Anton") >= 0)) jobs.push(tplAnton());
  specs.forEach((s) => jobs.push(document.fonts.load(s, tx)));
  await Promise.all(jobs);
  await document.fonts.ready;
}
function tplImg(src) {
  return new Promise((res, rej) => { const im = new Image(); im.decoding = "async"; im.onload = () => res(im); im.onerror = () => rej(Error("Bild " + src)); im.src = src; });
}
/* Logo-Maske (weiss mit Alpha, 800 px breit, gleiche Form wie APP_LOGO_URI_GOLD). Gleicher Ursprung, darum kein tainted canvas. */
function tplClean(im) { const t = document.createElement("canvas"); t.width = t.height = 1; const x = t.getContext("2d"); x.drawImage(im, 0, 0, 1, 1); x.getImageData(0, 0, 1, 1); return im; }
function tplLogo() {
  // Pruefen, dass das Bild die Leinwand nicht sperrt (file:// oder fremder Ursprung), sonst eingebettetes Logo (data:) nehmen.
  const fileUrl = location.protocol === "file:"; // file:// sperrt die Leinwand immer: direkt das eingebettete Logo
  if (!tplLogoP) tplLogoP = (fileUrl ? Promise.reject(Error("file")) : tplImg(new URL("img/gt-logo-mask.png", document.baseURI).href).then(tplClean)).catch(() => tplImg(APP_LOGO_URI_GOLD)).catch((e) => { tplLogoP = null; throw e; });
  return tplLogoP;
}
function tplWarm(specs) { try { tplLogo().catch(() => {}); if (specs && specs.some((s) => s.indexOf("GTR Anton") >= 0)) tplAnton().catch(() => {}); } catch (_) { /* nur vorwaermen */ } }

/* ---------- Leinwand und Grundformen ---------- */
function tplCanvas() { const cv = document.createElement("canvas"); cv.width = TPL_W; cv.height = TPL_H; const c = cv.getContext("2d"); c.textBaseline = "alphabetic"; c.textAlign = "left"; return { cv, c }; }
function rrect(c, x, y, w, h, r, keep) {
  const q = Math.max(0, Math.min(r, w / 2, h / 2));
  if (!keep) c.beginPath();
  c.moveTo(x + q, y); c.lineTo(x + w - q, y); c.arcTo(x + w, y, x + w, y + q, q); c.lineTo(x + w, y + h - q); c.arcTo(x + w, y + h, x + w - q, y + h, q);
  c.lineTo(x + q, y + h); c.arcTo(x, y + h, x, y + h - q, q); c.lineTo(x, y + q); c.arcTo(x, y, x + q, y, q); c.closePath();
}
/* CSS radial-gradient(ellipse at px py, ...) mit farthest-corner, stops: [[0,"#..."],[0.75,"#..."]] */
function cssEllipse(c, x, y, w, h, px, py, stops) {
  const dx = Math.max(px - x, x + w - px), dy = Math.max(py - y, y + h - py);
  const rx = Math.SQRT2 * dx, ry = Math.SQRT2 * dy;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.translate(px, py); c.scale(1, ry / rx);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rx); stops.forEach((s) => g.addColorStop(s[0], s[1]));
  c.fillStyle = g; c.fillRect(-rx * 2, -rx * 2, rx * 4, rx * 4); c.restore();
}
/* Innenschatten (CSS inset box-shadow 0 0 blur color) fuer eine abgerundete Flaeche */
function insetShadow(c, x, y, w, h, r, blur, color) {
  c.save(); rrect(c, x, y, w, h, r); c.clip();
  c.shadowColor = color; c.shadowBlur = blur; c.shadowOffsetX = 0; c.shadowOffsetY = 0;
  c.beginPath(); c.rect(x - blur * 3, y - blur * 3, w + blur * 6, h + blur * 6); rrect(c, x, y, w, h, r, true);
  c.fillStyle = "#000"; c.fill("evenodd"); c.restore();
}

/* ---------- Text ---------- */
function setFont(c, w, s, fam) { c.font = w + " " + Math.round(s * 10) / 10 + "px " + fam; }
function seg(s) {
  const t = String(s);
  try { if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(t), (v) => v.segment); } catch (_) { /* alt */ }
  return Array.from(t);
}
/* Zeilenumbruch nach Woertern, zu lange Woerter nach Graphemen. Schrift muss gesetzt sein. */
function wrap(c, text, maxW) {
  const out = []; let cur = "";
  for (const word of String(text).split(/\s+/u)) {
    if (!word) continue;
    const test = cur ? cur + " " + word : word;
    if (c.measureText(test).width <= maxW) { cur = test; continue; }
    if (cur) out.push(cur);
    cur = "";
    if (c.measureText(word).width <= maxW) { cur = word; continue; }
    for (const g of seg(word)) { if (cur && c.measureText(cur + g).width > maxW) { out.push(cur); cur = g; } else cur += g; }
  }
  if (cur || !out.length) out.push(cur);
  return out;
}
function ellipsize(c, s, maxW) {
  if (c.measureText(s).width <= maxW) return s;
  const g = seg(s); while (g.length > 1 && c.measureText(g.join("") + "…").width > maxW) g.pop();
  return g.join("").trimEnd() + "…";
}
/* Groesste Schrift zwischen max und min, bei der text in hoechstens o.lines Zeilen der Breite o.maxW passt.
   o: {w, fam, max, min, maxW, lines=1, ls=0 (Zeichenabstand in em)}. Rueckgabe {size, lines, cut}. Kuerzen (…) erst unter min. */
function fit(c, text, o) {
  const L = o.lines || 1, ls = o.ls || 0;
  const tw = (s, sz) => c.measureText(s).width + ls * sz * Math.max(0, seg(s).length - 1);
  let size = o.max;
  const step = Math.max(0.5, o.max * 0.02);
  for (; size >= o.min; size -= step) {
    setFont(c, o.w, size, o.fam);
    const lines = ls ? [String(text)] : wrap(c, text, o.maxW);
    // Kein Bruch mitten im Wort, solange noch verkleinert werden kann: lieber kleinere Schrift
    const wordsFit = ls || String(text).split(/\s+/u).every((w) => !w || c.measureText(w).width <= o.maxW);
    if (wordsFit && lines.length <= L && lines.every((l) => tw(l, size) <= o.maxW)) return { size, lines, cut: false };
  }
  size = o.min; setFont(c, o.w, size, o.fam);
  let lines = wrap(c, text, o.maxW);
  const cut = lines.length > L;
  if (cut) { lines = lines.slice(0, L); lines[L - 1] = ellipsize(c, lines[L - 1] + "…", o.maxW); }
  return { size, lines, cut };
}
/* Text mit Zeichenabstand (px). align: left|right|center. Gibt die Breite zurueck. */
function spaced(c, text, x, y, sp, align) {
  const g = seg(text); const ws = g.map((q) => c.measureText(q).width);
  const tot = ws.reduce((a, b) => a + b, 0) + sp * Math.max(0, g.length - 1);
  let cx = align === "right" ? x - tot : align === "center" ? x - tot / 2 : x;
  const al = c.textAlign; c.textAlign = "left";
  g.forEach((q, i) => { c.fillText(q, cx, y); cx += ws[i] + sp; });
  c.textAlign = al; return tot;
}
function spacedW(c, text, sp) { const g = seg(text); return g.reduce((a, q) => a + c.measureText(q).width, 0) + sp * Math.max(0, g.length - 1); }
/* Grundlinie wie CSS: Zeilenkasten ab top mit Hoehe lh (px), Schrift muss gesetzt sein */
function cssBase(c, top, lh) {
  const m = c.measureText("Hg");
  const a = m.fontBoundingBoxAscent, d = m.fontBoundingBoxDescent;
  if (a == null || d == null || !isFinite(a)) return top + lh * 0.8;
  return top + (lh - (a + d)) / 2 + a;
}
/* Hoehe der Grossbuchstaben (fuer Ausrichtung nach Glyphen statt Zeilenkasten) */
function capH(c) { const m = c.measureText("H"); return m.actualBoundingBoxAscent || parseFloat(c.font) * 0.72; }

/* ---------- Logo ---------- */
/* Logo als scharfe Maske in Farbe color. h = Hoehe in px, Breite = h * 2.39. Gibt die Breite zurueck. */
function logo(c, img, x, y, h, color) {
  const w = h * LOGO_AR; const s = 2;
  const o = document.createElement("canvas"); o.width = Math.ceil(w * s); o.height = Math.ceil(h * s);
  const oc = o.getContext("2d"); oc.imageSmoothingEnabled = true; oc.imageSmoothingQuality = "high";
  oc.drawImage(img, 0, 0, o.width, o.height); oc.globalCompositeOperation = "source-in"; oc.fillStyle = color; oc.fillRect(0, 0, o.width, o.height);
  c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high"; c.drawImage(o, x, y, w, h); c.restore();
  o.width = o.height = 0; return w;
}

/* ---------- Daten ---------- */
function tplDate(loc) {
  try { return new Intl.DateTimeFormat(loc, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()); } catch (_) { return new Date().toLocaleDateString(); }
}
/* Gemeinsamer Datenvertrag fuer alle Vorlagen. Rangfolge, Gleichstand und Sieger kommen aus gtEcModel (keine zweite Gewinnerberechnung). */
function tplData(gameId, gameLabel, ranked, t, extra) {
  const m = gtEcModel(gameId, gameLabel, ranked, t);
  const lang = (document.documentElement.lang || "de").slice(0, 2);
  const sc = ranked.map((e) => { const v = e && e.score; if (v == null || v === "") return null; const n = Number(v); return isFinite(n) ? n : null; });
  const rows = m.rows.map((r, i) => Object.assign({}, r, { score: sc[i] }));
  const winners = rows.filter((r) => r.winner);
  const up = (s) => { try { return String(s).toLocaleUpperCase(lang); } catch (_) { return String(s).toUpperCase(); } };
  return {
    gameId, lang, locale: m.locale, gameLabel: gtEcNoEmoji(m.gameLabel), model: m, rows, winners, others: rows.filter((r) => !r.winner),
    tie: winners.length > 1, date: tplDate(m.locale), extra: extra || null, logo: null,
    tr: (k, fb) => gtEcTr(t, k, fb), num: (n) => gtEcNum(n, m.locale), up, clean: gtEcNoEmoji,
  };
}
/* Seitenaufteilung: erste Seite first Eintraege, danach je next */
function chunks(list, first, next) { const out = [list.slice(0, first)]; for (let i = first; i < list.length; i += next) out.push(list.slice(i, i + next)); return out; }
/* Sieger- oder Titelname: stufenweise 1, 2, 3 Zeilen, dann noch kleiner, gekuerzt (...) nur im aeussersten Notfall.
   tiers: [{max, min, lines}], o: {w, fam, maxW}. Rueckgabe wie fit(): {size, lines, cut}. */
function heroFit(c, text, o, tiers) {
  let f = null;
  for (const t of tiers) { f = fit(c, text, Object.assign({}, o, t)); if (!f.cut) return f; }
  return f;
}
/* Namen in Ranglisten: erst eine Zeile (bis max*oneMin, nie unter 24 px), dann Umbruch auf bis zu o.lines (Standard 2) Zeilen
   (an Bindestrichen und Woertern, nie unter 24 px), erst danach Kuerzen mit Auslassung. o: {w, fam, max, maxW, min=24, lines=2, ls=0 (nur einzeilig), oneMin=0.62, max2}.
   Rueckgabe wie fit() plus sp (true = Zeichenabstand ls wurde fuer die einzeilige Fassung genutzt). */
const NAME_MIN = 24;
function nameFit(c, text, o) {
  const min = Math.max(NAME_MIN, o.min || NAME_MIN), max = Math.max(o.max, min), L = o.lines || 2;
  const base = { w: o.w, fam: o.fam, maxW: o.maxW };
  let f = fit(c, text, Object.assign({}, base, { max, min: Math.max(min, max * (o.oneMin || 0.62)), lines: 1, ls: o.ls || 0 }));
  if (!f.cut) { f.sp = !!o.ls; return f; }
  f = fit(c, breakHy(text), Object.assign({}, base, { max: Math.max(min, Math.min(max, o.max2 || max)), min, lines: L }));
  f.lines = unHy(f.lines); f.sp = false;
  return f;
}
/* Alle Eintraege, die auf EIN Bild passen (bis 10 Spieler). Ab dem 11. Eintrag kommt eine Folgeseite. */
const ONE_PAGE = 10;
/* Folgeseite ab dem 11. Spieler, gemeinsam fuer alle Vorlagen.
   Im Look des Spiels: sty.bg(c) zeichnet den Hintergrund des Spiels, Kopf mit Logo, Spielname gross in der Spielschrift, Hinweis "Fortsetzung",
   Rangliste einspaltig (bis 12 Zeilen), unten Datum.
   sty: {bg(c), ink, sub, acc, line, logo (Farbe), fam (Schrift fuer Namen und Werte), titleFam, titleW, titleCase (true = Grossbuchstaben),
         subFam, rowFill (Farbe der Zeilenflaeche, optional), rowFillWin (fuer Sieger), rowEdge (Randfarbe, optional), winInk (Textfarbe auf rowFillWin), brand (Schrift/Farbe der Marke, optional), deco(c, y) (optional)}
   rows: die Zeilen dieser Seite, no: Seitennummer (ab 2), count: Seitenzahl insgesamt. */
function continuationPage(d, rows, no, count, sty) {
  const { cv, c } = tplCanvas(); sty.bg(c);
  const fam = sty.fam || F_INTER, nwt = fam.indexOf("Anton") >= 0 ? 400 : 700, tfam = sty.titleFam || fam, tw = sty.titleW || 400, sfam = sty.subFam || F_BALOO;
  /* Kopf: Logo, Marke, Seitenzahl */
  const lh = 64, lw = logo(c, d.logo, 60, 50, lh, sty.logo || sty.ink);
  setFont(c, 800, 36, F_BALOO); c.fillStyle = sty.logo || sty.ink; c.fillText("GameTab", 60 + lw + 16, 50 + lh * 0.66);
  const pg = d.tr("ecPage", (x, y) => x + "/" + y);
  setFont(c, 700, 30, F_BALOO); c.fillStyle = sty.sub; c.textAlign = "right"; c.fillText(typeof pg === "function" ? pg(no, count) : no + "/" + count, 1020, 50 + lh * 0.66); c.textAlign = "left";
  /* Titel */
  const title = sty.titleCase ? d.up(d.gameLabel) : d.gameLabel;
  const tf = fit(c, title, { w: tw, fam: tfam, max: 112, min: 52, maxW: 960, lines: 1 });
  setFont(c, tw, tf.size, tfam); const cap = capH(c);
  const tBase = 150 + cap + 10;
  c.fillStyle = sty.acc; c.fillText(tf.lines[0], 60, tBase);
  const cont = d.tr("ecContinued", "Fortsetzung");
  const cf = fit(c, cont, { w: 700, fam: sfam, max: 46, min: 26, maxW: 600, lines: 1 });
  setFont(c, 700, cf.size, sfam); c.fillStyle = sty.ink; c.globalAlpha = 0.9; c.fillText(cf.lines[0], 62, tBase + 24 + cf.size * 0.8); c.globalAlpha = 1;
  const sepY = tBase + 24 + cf.size * 0.8 + 26;
  c.fillStyle = sty.line; c.fillRect(60, sepY, 960, 3);
  if (sty.deco) sty.deco(c, sepY);
  /* Rangliste: Block mittig im freien Bereich, Zeilenhoehe waechst bei wenigen Zeilen */
  const top = sepY + 22, bottom = 1170, avail = bottom - top, n = Math.max(rows.length, 1);
  const pitch = Math.min(n === 1 ? 250 : n === 2 ? 210 : n <= 4 ? 150 : 104, avail / n), blockH = pitch * n;
  const y0 = top + (n >= 8 ? 0 : (avail - blockH) * (n <= 4 ? 0.5 : 0.3));
  const fs = Math.max(28, Math.min(n === 1 ? 84 : n === 2 ? 76 : n <= 4 ? 64 : 52, pitch * 0.5)), gapR = Math.min(12, pitch * 0.14), rh = pitch - gapR;
  rows.forEach((r, i) => {
    const y = y0 + i * pitch, base = y + rh / 2 + fs * 0.36, hot = r.winner;
    if (sty.rowFill) {
      c.fillStyle = hot && sty.rowFillWin ? sty.rowFillWin : sty.rowFill; rrect(c, 60, y, 960, rh, rh * 0.22); c.fill();
      if (sty.rowEdge && !hot) { c.strokeStyle = sty.rowEdge; c.lineWidth = 3; rrect(c, 61.5, y + 1.5, 957, rh - 3, rh * 0.22); c.stroke(); }
    } else { c.fillStyle = sty.line; c.fillRect(60, y + pitch - 3, 960, 2); }
    const inkR = hot && sty.winInk ? sty.winInk : sty.ink, accR = hot && sty.winInk ? sty.winInk : sty.acc;
    const px = sty.rowFill ? 24 : 0;
    setFont(c, 800, fs * 0.9, F_INTER); c.fillStyle = hot ? accR : sty.sub; c.fillText(String(r.rank), 60 + px, base);
    const rankW = Math.max(c.measureText("00").width, c.measureText(String(r.rank)).width) + 22;
    setFont(c, nwt, fs, fam); c.fillStyle = hot ? accR : inkR; c.textAlign = "right";
    const vf = fit(c, r.value, { w: nwt, fam, max: fs, min: fs * 0.6, maxW: 330, lines: 1 }); setFont(c, nwt, vf.size, fam);
    const vw = c.measureText(r.value).width; c.fillText(r.value, 1020 - px, base); c.textAlign = "left";
    const f = nameFit(c, r.name, { w: nwt, fam, max: fs, maxW: 960 - px * 2 - rankW - vw - 36, lines: 2 });
    setFont(c, nwt, f.size, fam); c.fillStyle = inkR;
    const nlh = f.size * 1.1, nb = base - fs * 0.36 + f.size * 0.36 - ((f.lines.length - 1) * nlh) / 2;
    f.lines.forEach((ln, j) => c.fillText(ln, 60 + px + rankW, nb + j * nlh));
  });
  /* Fuss: Datum */
  setFont(c, 600, 26, F_BALOO); c.fillStyle = sty.sub; c.fillText(d.date, 60, 1275);
  return cv;
}
/* Alter Name, bleibt fuer bestehende Aufrufe (yatzy) gueltig */
const listPage = continuationPage;

export { tplImg };
export { TPL_W, TPL_H, F_ANTON, F_INTER, F_BALOO, F_KALAM, LOGO_AR, tplFonts, tplLogo, tplWarm, tplCanvas, rrect, cssEllipse, insetShadow, setFont, seg, wrap, ellipsize, fit, nameFit, NAME_MIN, spaced, spacedW, cssBase, capH, logo, tplDate, tplData, chunks, listPage, continuationPage, heroFit, ONE_PAGE };
