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
// Pruefzeichen: zwei Zeichen, Tippfehler und Vertauschungen werden fast immer erkannt
{
  const AL = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let bad = 0, tries = 0;
  for (let it = 0; it < 4000; it++) {
    const k = 1 + Math.floor(Math.random() * 10);
    const s = new Set(); while (s.size < k) s.add(Math.floor(Math.random() * SLF_CATS.length));
    const code = slfEncode([...s].sort((a, b) => a - b));
    assert.ok(code.length >= 3 && code.length <= 15);
    const i = Math.floor(Math.random() * code.length);
    let c2; do { c2 = AL[Math.floor(Math.random() * 32)]; } while (c2 === code[i]);
    const typo = code.slice(0, i) + c2 + code.slice(i + 1);
    tries++;
    if (slfDecode(typo) !== null) bad++;
    const j = Math.floor(Math.random() * (code.length - 1));
    if (code[j] !== code[j + 1]) { const sw = code.slice(0, j) + code[j + 1] + code[j] + code.slice(j + 2); tries++; if (slfDecode(sw) !== null) bad++; }
  }
  assert.ok(bad / tries < 0.01, "zu viele angenommene Tippfehler: " + bad + "/" + tries);
}
assert.ok(slfQr(link));

assert.equal(firstLetter("Äpfel"), "A");
assert.equal(firstLetter("Öl"), "O");
assert.equal(firstLetter("Übel"), "U");
assert.equal(firstLetter("Éclair"), "E");
assert.equal(firstLetter("  \"Zürich"), "Z");
assert.equal(firstLetter("Ølberg"), "O");
assert.equal(firstLetter("Łódź"), "L");
assert.equal(firstLetter("Æble"), "A");
assert.equal(firstLetter("Œuf"), "O");
assert.equal(firstLetter("ßlume"), "S");
assert.equal(firstLetter("ølberg"), "O");
assert.equal(detectLetter(["Ølberg", "Oslo", "Ohr"], ""), "O");
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
