// Test fuer tools/cejsx.mjs: renderToStaticMarkup vorher/nachher (Auto-Stubs fuer externe Namen),
// dazu Idempotenz, kanonische Selbstpruefung und Rueckweg tools/jsx2ce.cjs (fuer tests/lib/source.js).
// Aufruf: node tools/cejsx-test.mjs
import fs from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transformWithOxc } from "vite";
import { transform, canonical } from "./cejsx.mjs";
const { jsxToCeSplice } = createRequire(import.meta.url)("./jsx2ce.cjs");

const deep = (name) => new Proxy(function () {}, {
  get: (_, k) => (k === Symbol.toPrimitive ? () => "x" : k === "length" ? 2 : k === Symbol.iterator ? function* () {} : k === "map" || k === "filter" ? () => [] : deep(name + "." + String(k))),
  apply: () => deep(name + "()"),
});
function makeEnv(extra) {
  const base = { React, ...extra };
  return new Proxy(base, {
    has: (o, k) => (typeof k === "string" && !(k in globalThis && k !== "name")) || k in o,
    get: (o, k) => {
      if (k === Symbol.unscopables) return undefined;
      if (k in o) return o[k];
      if (/^[A-Z][a-z]/.test(k) && !/^[A-Z0-9_]+$/.test(k)) return () => React.createElement("i", { "data-stub": k });
      return deep(k);
    },
  });
}
async function load(code, env) {
  const r = await transformWithOxc(code, "x.jsx", { jsx: { runtime: "classic", pragma: "React.createElement", pragmaFrag: "React.Fragment" }, lang: "jsx" });
  return new Function("__env", `with(__env){ return (${r.code.replace(/;\s*$/, "")}); }`)(env);
}
const dir = new URL("./cejsx-samples/", import.meta.url);
const cases = JSON.parse(fs.readFileSync(new URL("cases.json", dir), "utf8"));
let fail = 0;
const check = (ok, msg) => { if (!ok) { fail++; console.log("FAIL", msg); } };
for (const c of cases) {
  const src = fs.readFileSync(new URL(c.file, dir), "utf8");
  const { code, stats } = transform(src, { aliases: ["S8E"] });
  check(transform(code, { aliases: ["S8E"] }).code === code, c.file + ": nicht idempotent");
  check(canonical(src, stats.ceNames) === canonical(code, stats.ceNames), c.file + ": kanonische Form weicht ab");
  check(!/\n/.test(code.trim()) || /\n/.test(src.trim()), c.file + ": neue Zeilenumbrueche");
  const back = jsxToCeSplice(code);
  const env = makeEnv(c.env ? Object.fromEntries(Object.entries(c.env).map(([k, v]) => [k, eval(v)])) : {});
  for (const th of c.themes || [null]) {
    const props = eval("(" + c.props.replace(/%THEME%/g, JSON.stringify(th)) + ")");
    const A = await load(src, env), B = await load(code, env), C = await load(back, env);
    const ha = renderToStaticMarkup(React.createElement(A, props)), hb = renderToStaticMarkup(React.createElement(B, props)), hc = renderToStaticMarkup(React.createElement(C, props));
    const ok = ha === hb && ha === hc && ha.length > 20;
    if (!ok) fail++;
    console.log(ok ? "OK  " : "FAIL", c.file, th ?? "", "html", ha.length, "createElement vorher/nachher", (src.match(/createElement|\bh\(|\bS8E\(/g) || []).length, "/", (code.match(/createElement|\bh\(|\bS8E\(/g) || []).length, JSON.stringify({ converted: stats.converted, skipped: stats.skippedWhy, aliasRemoved: stats.aliasRemoved }));
    if (!ok) { console.log(" vorher ", ha.slice(0, 400)); console.log(" nachher", hb.slice(0, 400)); console.log(" zurueck", hc.slice(0, 400)); }
  }
}
console.log(fail ? `${fail} Fehler` : "Alle OK");
process.exit(fail ? 1 : 0);
