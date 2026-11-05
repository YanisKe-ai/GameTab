// Bildexport: welche Knoepfe die Vorschau je Geraet zeigt.
import assert from "node:assert/strict";
import { gtImgPlan } from "../../web/src/export/save-image.js";

const p = (ios, desktop, canShare) => gtImgPlan({ ios, desktop, canShare });
assert.deepEqual(p(false, true, true), { primary: "save", secondary: "share", iosHint: false }, "Mac Safari: Speichern zuerst");
assert.deepEqual(p(false, true, false), { primary: "save", secondary: null, iosHint: false }, "Computer ohne Teilen");
assert.deepEqual(p(true, false, true), { primary: "share", secondary: null, iosHint: true }, "iPhone: ein Knopf mit Hinweis");
assert.deepEqual(p(true, false, false), { primary: "save", secondary: null, iosHint: false }, "iPhone ohne Teilen");
assert.deepEqual(p(false, false, true), { primary: "share", secondary: "save", iosHint: false }, "Android");
assert.deepEqual(p(false, false, false), { primary: "save", secondary: null, iosHint: false }, "Android ohne Teilen");
console.log("test_image_save: ok");
