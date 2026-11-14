// Stadt Land Fluss: Kurzcode, Link und Buchstabenerkennung. Aufruf: node tests/logic/test_slf.mjs
import assert from "node:assert/strict";
import { slfEncode, slfDecode, slfBuildLink, slfParseInput, slfFormatCode } from "../../web/src/games/slf/code.js";
import { detectLetter, firstLetter, isOff, slfNormalize } from "../../web/src/games/slf/logic.js";
import { SLF_CATS } from "../../web/src/content/slf-categories.js";
import { slfQr } from "../../web/src/games/slf/qr-gen.js";

assert.ok(SLF_CATS.length >= 120 && SLF_CATS.length <= 128);
for (let it = 0; it < 3000; it++) {
  const k = Math.floor(Math.random() * 11);
  const s = new Set(); while (s.size < k) s.add(Math.floor(Math.random() * SLF_CATS.length));
  const ids = [...s].sort((a, b) => a - b);
  const code = slfEncode(ids);
  assert.deepEqual(slfDecode(code), ids);
  assert.deepEqual(slfDecode(slfFormatCode(code).toLowerCase()), ids);
}
const link = slfBuildLink([1, 2, 3, 4, 5], ["Käse", "Ausrede"]);
assert.deepEqual(slfParseInput(link), { ids: [1, 2, 3, 4, 5], custom: ["Käse", "Ausrede"] });
assert.equal(slfParseInput("hallo"), null);
assert.ok(slfQr(link));

assert.equal(firstLetter("Äpfel"), "A");
assert.equal(firstLetter("Öl"), "O");
assert.equal(firstLetter("Übel"), "U");
assert.equal(firstLetter("Éclair"), "E");
assert.equal(firstLetter("  \"Zürich"), "Z");
assert.equal(detectLetter(["Apfel", "Ärger", "Birne", ""], ""), "A");
assert.equal(detectLetter(["Birne", "Apfel"], "B"), "B");
assert.equal(detectLetter(["", ""], ""), "");
assert.equal(isOff("Birne", "A"), true);
assert.equal(isOff("", "A"), false);
const n = slfNormalize({ phase: "play", cats: [1, 1, 2, 999, -1, 3, 4, 5], custom: ["x"], rounds: [{ letter: "M", ans: ["a"], pts: [20, 7] }] });
assert.equal(n.cats.length, 5);
assert.equal(n.rounds[0].pts.length, n.cats.length + n.custom.length);
assert.equal(n.rounds[0].pts[1], 0);
console.log("test_slf: ok");
