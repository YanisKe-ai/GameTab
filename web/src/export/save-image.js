// Bildexport: Speichern und Teilen fuer alle Ergebnisbilder.
// Teilen laeuft immer direkt aus einem Klick in der Vorschau. Safari verwirft navigator.share,
// wenn zwischen Klick und Aufruf das Bild erst gezeichnet wird.

function gtImgDevice() {
  const n = window.navigator || {};
  const ua = n.userAgent || "";
  const ios = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && n.maxTouchPoints > 1);
  let touchOnly = false;
  try { touchOnly = window.matchMedia("(hover: none) and (pointer: coarse)").matches; } catch (_) {}
  return { ios, desktop: !ios && !touchOnly };
}

function gtImgCanShare(files) {
  try { return !!(navigator.share && navigator.canShare && navigator.canShare({ files })); } catch (_) { return false; }
}

/* Welche Knoepfe die Vorschau zeigt. Reine Regel, geprueft in tests/logic/test_image_save.mjs.
   Computer: Speichern zuerst. iPhone/iPad: Teilen-Menue enthaelt Fotos und Dateien, ein zweiter Knopf waere doppelt.
   Android: Teilen zuerst, Speichern daneben. Ohne Teilen-Funktion bleibt Speichern. */
function gtImgPlan({ ios, desktop, canShare }) {
  if (!canShare) return { primary: "save", secondary: null, iosHint: false };
  if (desktop) return { primary: "save", secondary: "share", iosHint: false };
  if (ios) return { primary: "share", secondary: null, iosHint: true };
  return { primary: "share", secondary: "save", iosHint: false };
}

function gtImgBlob(canvas) {
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(Error("toBlob"))), "image/png"));
}

/* Fertige Canvas-Seiten zu Vorschau-Eintraegen {file, url}. */
async function gtImgItems(canvases, baseName) {
  const blobs = await Promise.all(canvases.map(gtImgBlob));
  return blobs.map((b, i) => {
    const file = new File([b], baseName + (blobs.length > 1 ? "-" + (i + 1) : "") + ".png", { type: "image/png" });
    return { file, url: URL.createObjectURL(file) };
  });
}

/* Spaet freigeben: ein gerade gestarteter Download liest die Adresse noch. */
function gtImgFree(items) {
  setTimeout(() => items.forEach((it) => { try { URL.revokeObjectURL(it.url); } catch (_) {} }), 60000);
}

function gtImgDownloadOne(it) {
  const a = document.createElement("a");
  a.href = it.url;
  a.download = it.file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function gtImgDownload(items) {
  items.forEach((it, i) => { if (i === 0) gtImgDownloadOne(it); else setTimeout(() => gtImgDownloadOne(it), i * 350); });
}

/* true: erledigt oder selbst abgebrochen. false: Teilen ging nicht, Speichern anbieten. */
async function gtImgShare(items, title) {
  try {
    await navigator.share({ files: items.map((it) => it.file), title: title || "GameTab" });
    return true;
  } catch (e) {
    return !!(e && e.name === "AbortError");
  }
}

export { gtImgDevice, gtImgCanShare, gtImgPlan, gtImgItems, gtImgFree, gtImgDownload, gtImgShare };
