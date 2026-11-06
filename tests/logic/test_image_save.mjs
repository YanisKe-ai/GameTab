// Bildexport: welche Knoepfe die Vorschau je Geraet zeigt.
import assert from "node:assert/strict";
import { gtImgPlan, gtImgShareRun } from "../../web/src/export/save-image.js";

const p = (ios, desktop, canShare) => gtImgPlan({ ios, desktop, canShare });
assert.deepEqual(p(false, true, true), { primary: "save", secondary: "share", iosHint: false }, "Mac Safari: Speichern zuerst");
assert.deepEqual(p(false, true, false), { primary: "save", secondary: null, iosHint: false }, "Computer ohne Teilen");
assert.deepEqual(p(true, false, true), { primary: "share", secondary: null, iosHint: true }, "iPhone: ein Knopf mit Hinweis");
assert.deepEqual(p(true, false, false), { primary: "save", secondary: null, iosHint: false }, "iPhone ohne Teilen");
assert.deepEqual(p(false, false, true), { primary: "share", secondary: "save", iosHint: false }, "Android");
assert.deepEqual(p(false, false, false), { primary: "save", secondary: null, iosHint: false }, "Android ohne Teilen");

// Teilen-Aufruf: Erfolg, Abbruch (leise), Fehler, haengt (Zeitlimit), wirft sofort.
const err = (name) => Object.assign(new Error(name), { name });
assert.equal(await gtImgShareRun(async () => {}, 200), "ok");
assert.equal(await gtImgShareRun(() => Promise.reject(err("AbortError")), 200), "abort");
assert.equal(await gtImgShareRun(() => Promise.reject(err("NotAllowedError")), 200), "fail");
assert.equal(await gtImgShareRun(() => { throw err("TypeError"); }, 200), "fail");
const t0 = Date.now();
assert.equal(await gtImgShareRun(() => new Promise(() => {}), 80), "timeout", "haengender Aufruf muss freigegeben werden");
assert(Date.now() - t0 < 1000);
assert.equal(await gtImgShareRun(() => new Promise((r) => setTimeout(r, 150)), 60), "timeout", "spaetes Ergebnis wird ignoriert");
console.log("test_image_save: ok");
