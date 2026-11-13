// Duell-Bilanz unter dem Siegesschild: node tests/logic/test_neon_duel.js
const assert = require("assert/strict");
const src = require("./../lib/source.js").getSource(process.argv[2]);
const blk = (a, b) => { const i = src.indexOf(a), j = src.indexOf(b); assert(i >= 0 && j > i, "Marker fehlen: " + a); return src.slice(i, j); };
const F = new Function(blk("/*GT_STATS_BEGIN*/", "/*GT_STATS_END*/") + ";" + blk("/*GT_DUEL_BEGIN*/", "/*GT_DUEL_END*/") + ";return{GT_STATS,gtDuelCount,gtDuelPick};")();
let id = 0, ts = 1e12;
const M = (game, names, win) => ({ id: "d" + (++id), ts: (ts += 864e5), game, winners: [win], participants: names.map((n) => ({ name: n })) });
const log = [M("tutto", ["Yanis", "Tony"], "Tony"), M("tutto", ["Yanis", "Tony", "Mia"], "Yanis"), M("tutto", ["Yanis", "Tony"], "Tony"), M("skyjo", ["Yanis", "Tony"], "Yanis"), M("tutto", ["Mia", "Tony"], "Mia")];
const ms = F.GT_STATS.filter(log, { game: "tutto" });
const c = F.gtDuelCount(ms, new Set(["yanis"]), "tony");
assert.equal(c.together, 3); assert.equal(c.mine, 1); assert.equal(c.theirs, 2);
const isMe = (n) => n === "Yanis";
assert.deepEqual(F.gtDuelPick([{ name: "Tony" }, { name: "Yanis" }, { name: "Mia" }], [1, 2, 3], isMe), { meIdx: 1, oppIdx: 0 });
assert.deepEqual(F.gtDuelPick([{ name: "Yanis" }, { name: "Mia" }, { name: "Tony" }], [1, 2, 3], isMe), { meIdx: 0, oppIdx: 1 });
assert.equal(F.gtDuelPick([{ name: "Tony" }, { name: "Mia" }], [1, 2], isMe), null);
console.log("GRUEN 6 Pruefungen (Duell-Bilanz)");
