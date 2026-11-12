#!/usr/bin/env node
// GameTab: zerlegt die Wurzel-index.html in das Vite-Projekt unter web/.
//
//   node tools/split.mjs            Zerlegung nach tools/split-map.json (Etappe 2)
//   node tools/split.mjs --mono     ganzes App-Script als ein Block in web/src/legacy/app.js (Etappe 1)
//   node tools/split.mjs --check    nur analysieren, nichts schreiben
//   node tools/split.mjs --verify   web/ wieder zusammensetzen und per SHA-256 mit index.html vergleichen
//   node tools/split.mjs --source   rekonstruierten App-Code (wie im Original) auf stdout ausgeben
//   Option --src <datei>            andere Quelle als index.html (z. B. Hotfix-Stand)
//
// Grundsatz: es wird kein Code neu erzeugt. Jede Top-Level-Anweisung wird als Byte-Slice
// (Zeichenbereich vom Ende der vorigen Anweisung bis zu ihrem Ende, also inkl. Kommentaren
// und Leerraum davor) in genau ein Modul kopiert. Dazu kommen nur Import-Kopf und Export-Fuss
// zwischen festen Markern. --verify entfernt Kopf und Fuss wieder und setzt das Original zusammen.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";
import traverseMod from "@babel/traverse";

const traverse = traverseMod.default || traverseMod;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB = path.join(ROOT, "web");
const SRC = path.join(WEB, "src");
const MAP_FILE = path.join(ROOT, "tools", "split-map.json");
const INDEX_FILE = path.join(SRC, "split-index.json");
const BODY_BEGIN = "/*@gt-body-begin*/";
const BODY_END = "/*@gt-body-end*/";
const MAIN_TAG = '<script type="module" src="./src/main.js"></script>';
const GEN_NOTE = "// Erzeugt von tools/split.mjs aus index.html. Inhalt zwischen den gt-body-Markern ist 1:1 Originalcode.\n";
const STATIC_FILES = new Set(["vendor/react-globals.js", "expose.js"]); // von Hand gepflegt, nie loeschen
const REACT_UMD = [
  ["react.production.min.js", "node_modules/react/umd/react.production.min.js"],
  ["react-dom.production.min.js", "node_modules/react-dom/umd/react-dom.production.min.js"],
];

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const argVal = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const sha = (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex");
const rel = (p) => path.relative(ROOT, p);

// ---------------------------------------------------------------- HTML zerlegen
function splitHtml(html) {
  const bodyEnd = html.lastIndexOf("</body>");
  const appOpen = html.lastIndexOf("<script>", bodyEnd);
  const appClose = html.indexOf("</script>", appOpen);
  if (appOpen < 0 || appClose < 0 || appClose > bodyEnd) throw new Error("App-Script vor </body> nicht gefunden");
  const code = html.slice(appOpen + 8, appClose);
  const reactParts = [];
  for (const [name, file] of REACT_UMD) {
    const marker = "<script>\n/**\n * @license React\n * " + name;
    const s = html.indexOf(marker);
    if (s < 0) throw new Error("React-Script nicht gefunden: " + name);
    const e = html.indexOf("</script>", s) + 9;
    const umd = fs.readFileSync(path.join(ROOT, file), "utf8");
    if (html.slice(s, e) !== "<script>\n" + umd + "\n</script>") throw new Error("Inline-React weicht von " + file + " ab (Version?)");
    reactParts.push({ name, file, start: s, end: e });
  }
  if (html.split(MAIN_TAG).length > 1) throw new Error("Quelle enthaelt schon den Modul-Tag");
  // Template: React-Scripts raus, App-Script durch Modul-Tag ersetzen (alles andere 1:1)
  const cuts = [...reactParts.map((r) => ({ start: r.start, end: r.end, repl: "" })), { start: appOpen, end: appClose + 9, repl: MAIN_TAG }]
    .sort((a, b) => a.start - b.start);
  let tpl = "", pos = 0;
  for (const c of cuts) { tpl += html.slice(pos, c.start) + c.repl; pos = c.end; }
  tpl += html.slice(pos);
  return { code, tpl, reactParts, cuts };
}

function joinHtml(tpl, code, meta) {
  // Umkehrung von splitHtml: React-Scripts an ihre Original-Positionen, Modul-Tag -> App-Script
  let out = "", pos = 0, shift = 0;
  const parts = meta.cuts;
  // parts sind Originalpositionen; im Template ist jeder Schnitt durch repl ersetzt
  for (const c of parts) {
    const tStart = c.start - shift;
    out += tpl.slice(pos, tStart);
    if (c.repl === MAIN_TAG) {
      if (tpl.slice(tStart, tStart + MAIN_TAG.length) !== MAIN_TAG) throw new Error("Modul-Tag im Template nicht an erwarteter Stelle");
      out += "<script>" + code + "</script>";
      pos = tStart + MAIN_TAG.length;
    } else {
      const umd = fs.readFileSync(path.join(ROOT, c.file), "utf8");
      out += "<script>\n" + umd + "\n</script>";
      pos = tStart;
    }
    shift += (c.end - c.start) - c.repl.length;
  }
  return out + tpl.slice(pos);
}

// ---------------------------------------------------------------- Analyse
const FN_TYPES = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression", "ObjectMethod", "ClassMethod", "ClassPrivateMethod"]);
// Globale ohne Zustand; alles andere (window, document, localStorage, React ...) gilt als "Welt"
const PURE_GLOBALS = new Set(["Object", "Array", "Math", "JSON", "String", "Number", "Boolean", "Symbol", "RegExp", "Set", "Map", "WeakMap", "WeakSet", "Date", "Promise", "Error", "TypeError",
  "parseInt", "parseFloat", "isNaN", "isFinite", "Infinity", "NaN", "undefined", "Intl", "encodeURIComponent", "decodeURIComponent", "BigInt", "Reflect", "Uint8Array", "Uint8ClampedArray", "Float32Array", "Int32Array", "Uint32Array", "Uint16Array", "ArrayBuffer", "DataView", "TextEncoder", "TextDecoder", "structuredClone", "atob", "btoa"]);
const PURE_CTORS = new Set(["RegExp", "Set", "Map", "WeakMap", "WeakSet", "Symbol", "Date", "Error"]);
const PURE_STATIC = new Set(["Object.freeze", "Object.keys", "Object.values", "Object.entries", "Object.fromEntries", "Array.from", "Array.isArray",
  "JSON.parse", "JSON.stringify", "String.fromCharCode", "String.fromCodePoint", "Number.isFinite", "Math.max", "Math.min", "Math.round", "Math.floor", "Math.ceil", "Math.abs", "Math.sqrt", "Math.pow"]);
const PURE_METHODS = new Set(["map", "filter", "reduce", "join", "split", "concat", "slice", "replace", "replaceAll", "trim", "toUpperCase", "toLowerCase", "flatMap", "flat",
  "some", "every", "find", "findIndex", "indexOf", "includes", "repeat", "padStart", "padEnd", "charCodeAt", "codePointAt", "toString", "toFixed", "startsWith", "endsWith", "match", "test", "normalize", "at", "keys", "values", "entries"]);

function memberName(n) {
  if (n.type === "Identifier") return n.name;
  if (n.type === "MemberExpression" && !n.computed && n.property.type === "Identifier") { const o = memberName(n.object); return o && o + "." + n.property.name; }
  return null;
}

function analyze(code) {
  const ast = parse(code, { sourceType: "module", ranges: false });
  const body = ast.program.body;
  if (ast.program.directives.length) throw new Error("Direktiven auf Top-Level werden nicht unterstuetzt");
  const stmts = body.map((s, i) => {
    const names = [];
    if (s.type === "FunctionDeclaration" || s.type === "ClassDeclaration") names.push(s.id.name);
    else if (s.type === "VariableDeclaration") {
      const walk = (p) => {
        if (!p) return;
        if (p.type === "Identifier") names.push(p.name);
        else if (p.type === "ObjectPattern") p.properties.forEach((q) => walk(q.type === "RestElement" ? q.argument : q.value));
        else if (p.type === "ArrayPattern") p.elements.forEach(walk);
        else if (p.type === "AssignmentPattern") walk(p.left);
        else if (p.type === "RestElement") walk(p.argument);
      };
      s.declarations.forEach((d) => walk(d.id));
    }
    const kind = s.type === "VariableDeclaration" ? s.kind : s.type === "FunctionDeclaration" ? "function" : s.type === "ClassDeclaration" ? "class" : "effect";
    const fnInit = s.type === "VariableDeclaration" && s.declarations.length === 1 && s.declarations[0].init && FN_TYPES.has(s.declarations[0].init.type);
    return { i, start: i ? body[i - 1].end : 0, end: s.end, node: s, names, kind, fnInit, refs: [], globals: [], impure: kind === "effect", hasSemi: code[s.end - 1] === ";" || code[s.end - 1] === "}" };
  });
  const stmtAt = (pos) => { let lo = 0, hi = stmts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (stmts[m].node.start <= pos) lo = m; else hi = m - 1; } return stmts[lo]; };

  // Ist path in eager (sofort beim Laden ausgefuehrtem) Code? Funktionen sind verzoegert,
  // ausser IIFE und Funktionsausdruecke als direkte Argumente eines Aufrufs (forEach-Callbacks u. ae.).
  function isEager(p) {
    for (let q = p; q && q.parentPath; q = q.parentPath) {
      const n = q.node;
      if (FN_TYPES.has(n.type)) {
        const par = q.parent;
        const iife = (n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression") && par && (par.type === "CallExpression" || par.type === "NewExpression") && (par.callee === n || par.arguments.includes(n));
        const callIife = par && par.type === "MemberExpression" && par.object === n && q.parentPath.parent.type === "CallExpression"; // (function(){}).call(..)
        if (!iife && !callIife) return false;
      }
    }
    return true;
  }
  function isCallish(p) {
    let q = p;
    while (q.parentPath && q.parent.type === "MemberExpression" && q.parent.object === q.node) q = q.parentPath;
    const par = q.parent;
    if (!par) return false;
    if ((par.type === "CallExpression" || par.type === "NewExpression" || par.type === "OptionalCallExpression") && par.callee === q.node) return true;
    if (par.type === "TaggedTemplateExpression" && par.tag === q.node) return true;
    if ((par.type === "CallExpression" || par.type === "NewExpression") && par.arguments.includes(q.node)) {
      const cn = memberName(par.callee) || "";
      return !/(^|\.)createElement$/.test(cn); // React.createElement(Komponente) ruft nichts auf
    }
    if (par.type === "SpreadElement" || par.type === "JSXOpeningElement") return false;
    return false;
  }

  const bindings = new Map(); // name -> {name, stmt, kind}
  const freeGlobals = new Map(); // name -> count
  const writes = []; // {name, stmt}
  const undeclaredWrites = [];
  traverse(ast, {
    Program(p) {
      for (const [name, b] of Object.entries(p.scope.bindings)) {
        const st = stmtAt(b.identifier.start);
        bindings.set(name, { name, stmt: st.i, kind: b.kind });
        for (const r of b.referencePaths) {
          const rs = stmtAt(r.node.start);
          rs.refs.push({ name, eager: isEager(r), callish: isCallish(r) });
        }
        for (const v of b.constantViolations) {
          const vs = stmtAt(v.node.start);
          if (vs.i !== st.i || v.node.start > st.node.end || true) writes.push({ name, stmt: vs.i, eager: isEager(v) });
        }
      }
      for (const [name] of Object.entries(p.scope.globals)) freeGlobals.set(name, 0);
    },
    ReferencedIdentifier(p) {
      if (p.node.type !== "Identifier" || p.scope.getBinding(p.node.name)) return;
      if (PURE_GLOBALS.has(p.node.name)) return;
      stmtAt(p.node.start).globals.push({ name: p.node.name, eager: isEager(p) });
    },
    "AssignmentExpression|UpdateExpression"(p) {
      const t = p.node.type === "AssignmentExpression" ? p.node.left : p.node.argument;
      if (t.type === "Identifier" && !p.scope.hasBinding(t.name, true)) undeclaredWrites.push({ name: t.name, stmt: stmtAt(p.node.start).i });
    },
    "CallExpression|NewExpression|OptionalCallExpression|AssignmentExpression|UpdateExpression|UnaryExpression"(p) {
      if (p.node.type === "UnaryExpression" && p.node.operator !== "delete") return;
      if (!isEager(p)) return;
      const st = stmtAt(p.node.start);
      if (st.impure) return;
      if (p.node.type === "AssignmentExpression" || p.node.type === "UpdateExpression" || p.node.type === "UnaryExpression") {
        // Zuweisung an lokale Variable innerhalb einer IIFE ist harmlos
        const t = p.node.type === "AssignmentExpression" ? p.node.left : p.node.argument;
        if (t.type === "Identifier" && p.scope.getBinding(t.name) && !p.scope.getBinding(t.name).scope.path.isProgram()) return;
        st.impure = true; st.why = "Zuweisung"; return;
      }
      const c = p.node.callee;
      const cn = memberName(c) || "";
      if ((c.type === "FunctionExpression" || c.type === "ArrowFunctionExpression") && p.node.arguments.length === 0) return; // IIFE: Rumpf wird selbst geprueft
      if (p.node.type === "NewExpression" && c.type === "Identifier" && PURE_CTORS.has(c.name)) return;
      if (c.type === "Identifier" && PURE_CTORS.has(c.name)) return;
      if (PURE_STATIC.has(cn)) return;
      if (c.type === "MemberExpression" && !c.computed && c.property.type === "Identifier" && PURE_METHODS.has(c.property.name)) {
        // Methode auf Top-Level-Binding (z. B. LIST.sort) koennte mutieren; nur reine Methoden erlaubt
        return;
      }
      if (/(^|\.)createElement$/.test(cn)) { st.impure = true; st.why = "createElement (nach Emoji-Patch)"; return; }
      st.impure = true; st.why = "Aufruf " + (cn || c.type);
    },
  });
  for (const g of freeGlobals.keys()) freeGlobals.set(g, 0);
  return { ast, stmts, bindings, freeGlobals, writes, undeclaredWrites };
}

// needs(s): Bindings, die beim Ausfuehren von s initialisiert sein muessen (transitiv ueber aufgerufene Funktionen)
function computeNeeds(A) {
  const { stmts, bindings } = A;
  const isFn = (b) => b.kind === "hoisted" || stmts[b.stmt].kind === "function";
  for (const s of stmts) {
    const need = new Set(), seen = new Set([s.i]);
    const add = (name, callish) => {
      const b = bindings.get(name); if (!b) return;
      if (b.stmt === s.i) return;
      if (!isFn(b)) need.add(name);
      if (callish || (!isFn(b) && stmts[b.stmt].fnInit && callish)) expand(b.stmt);
    };
    const world = new Set();
    const expand = (t) => { if (seen.has(t)) return; seen.add(t); stmts[t].globals.forEach((g) => world.add(g.name)); for (const r of stmts[t].refs) add(r.name, r.callish); };
    s.globals.forEach((g) => { if (g.eager) world.add(g.name); });
    for (const r of s.refs) if (r.eager) add(r.name, r.callish);
    s.world = world;
    s.need = need;
    s.touch = new Set([...need, ...s.refs.filter((r) => r.eager).map((r) => r.name)].filter((n) => bindings.get(n) && bindings.get(n).stmt !== s.i));
  }
}

// ---------------------------------------------------------------- Zuordnung
function assignFiles(A, map, mono) {
  const { stmts } = A;
  const unmatched = [];
  let prev = null;
  const rules = mono ? [] : map.rules;
  // Bereichsregeln vorab in Indizes umrechnen
  const firstIdx = new Map();
  stmts.forEach((s) => s.names.forEach((n) => { if (!firstIdx.has(n)) firstIdx.set(n, s.i); }));
  for (const r of rules) {
    if (r.from) {
      if (!firstIdx.has(r.from) || !firstIdx.has(r.to)) throw new Error(`Regel ${r.file}: from/to nicht gefunden (${r.from}..${r.to})`);
      r._a = firstIdx.get(r.from); r._b = firstIdx.get(r.to);
    }
    if (r.match) r._re = new RegExp(r.match);
    r._used = 0;
  }
  for (const s of stmts) {
    let file = null;
    if (mono) file = "legacy/app.js";
    else if (!s.names.length) file = prev; // Seiteneffekt gehoert zur vorigen Anweisung
    else {
      for (const r of rules) {
        const hit = (r.names && s.names.some((n) => r.names.includes(n))) || (r._re && r._re.test(s.names[0])) || (r.from && s.i >= r._a && s.i <= r._b);
        if (hit) { file = r.file; r._used++; break; }
      }
      if (!file) { file = map.rest || "legacy/rest.js"; unmatched.push(s.names[0]); }
    }
    if (!file) throw new Error("Anweisung " + s.i + " ohne Datei");
    s.file = file; prev = file;
  }
  const unusedRules = rules.filter((r) => !r._used).map((r) => r.file + " " + (r.names || r.match || r.from));
  return { unmatched, unusedRules };
}

function buildModules(A, code) {
  const { stmts, bindings, freeGlobals } = A;
  const files = new Map();
  for (const s of stmts) { if (!files.has(s.file)) files.set(s.file, { file: s.file, first: s.i, stmts: [] }); files.get(s.file).stmts.push(s); }
  const order = [...files.values()].sort((a, b) => a.first - b.first);
  const tail = code.slice(stmts[stmts.length - 1].end); // Leerraum nach der letzten Anweisung
  const vendorNames = ["React", "ReactDOM"].filter((n) => freeGlobals.has(n));
  for (const m of order) {
    const own = new Set(m.stmts.flatMap((s) => s.names));
    const imp = new Map(); // file -> Set(names)
    let vendor = new Set();
    for (const s of m.stmts) {
      for (const r of s.refs) { const b = bindings.get(r.name); const f = stmts[b.stmt].file; if (f !== m.file) { if (!imp.has(f)) imp.set(f, new Set()); imp.get(f).add(r.name); } }
    }
    // freie Bezeichner React/ReactDOM (frueher window.React aus den UMD-Scripts)
    const freeIn = new Set();
    for (const s of m.stmts) {
      const src = code.slice(s.start, s.end);
      for (const v of vendorNames) if (new RegExp("\\b" + v + "\\b").test(src)) freeIn.add(v);
    }
    vendor = freeIn;
    m.imports = [...imp.entries()].map(([f, set]) => ({ file: f, names: [...set].sort(), first: files.get(f).first })).sort((a, b) => a.first - b.first);
    m.vendor = [...vendor];
    m.exports = [...own];
    m.chunks = m.stmts.map((s) => code.slice(s.start, s.end));
    if (m.file === stmts[stmts.length - 1].file) m.chunks.push(tail);
  }
  return { order, tail, files };
}

function relImport(from, to) {
  let r = path.posix.relative(path.posix.dirname(from), to);
  if (!r.startsWith(".")) r = "./" + r;
  return r;
}

function renderModule(m) {
  let head = GEN_NOTE;
  if (m.vendor.length) head += `import { ${m.vendor.join(", ")} } from "${relImport(m.file, "vendor/react-globals.js")}";\n`;
  for (const i of m.imports) head += `import { ${i.names.join(", ")} } from "${relImport(m.file, i.file)}";\n`;
  const foot = m.exports.length ? `\nexport { ${m.exports.join(", ")} };\n` : "\n";
  return head + BODY_BEGIN + m.chunks.join("") + BODY_END + foot;
}

function renderMain(order) {
  let s = "// Erzeugt von tools/split.mjs. Importiert alle Module in der Original-Reihenfolge.\n";
  order.forEach((m, k) => { s += `import * as M${k} from "${relImport("main.js", m.file)}";\n`; });
  s += 'import * as V from "./vendor/react-globals.js";\nimport { gtExpose } from "./expose.js";\n';
  s += `gtExpose([V, ${order.map((_, k) => "M" + k).join(", ")}]);\n`;
  return s;
}

// ESM-Auswertungsreihenfolge simulieren (Tiefensuche, Post-Order, Zyklen werden uebersprungen)
function simulate(order) {
  const byFile = new Map(order.map((m) => [m.file, m]));
  const state = new Map(), out = [];
  const visit = (f) => {
    if (state.has(f)) return; state.set(f, 1);
    for (const i of byFile.get(f).imports) visit(i.file);
    out.push(f);
  };
  for (const m of order) visit(m.file);
  return new Map(out.map((f, k) => [f, k]));
}

function checkOrder(A, mods, map) {
  const { stmts, bindings, writes, undeclaredWrites } = A;
  // Bezeichnung einer Anweisung: erster Name, sonst "after:<voriger Name>"
  const label = (s) => { if (s.names.length) return s.names[0]; for (let k = s.i - 1; k >= 0; k--) if (stmts[k].names.length) return "after:" + stmts[k].names[0]; return "#" + s.i; };
  const allow = (map.allowReorder || []).map((r) => [r.a, r.b].sort().join("|"));
  const allowed = (a, b) => allow.includes([label(a), label(b)].sort().join("|"));
  const ev = simulate(mods.order);
  const pos = (s) => ev.get(s.file) * 1e6 + s.i;
  const errors = [], warns = [];
  // 1) TDZ / Initialisierung ueber Modulgrenzen
  for (const s of stmts) for (const n of s.need) {
    const t = stmts[bindings.get(n).stmt];
    if (t.file !== s.file && !(pos(t) < pos(s))) errors.push(`TDZ: #${s.i} ${s.names[0] || s.kind} (${s.file}) braucht ${n} aus ${t.file}, das erst spaeter ausgewertet wird`);
  }
  // 2) Seiteneffekte in Original-Reihenfolge
  const imp = stmts.filter((s) => s.impure);
  // Paarweise: gleiche Bindings beruehrt oder beide greifen auf die Welt zu (DOM, Storage, React ...)
  for (let x = 0; x < imp.length; x++) for (let y = x + 1; y < imp.length; y++) {
    const a = imp[x], b = imp[y];
    const shared = [...a.touch].filter((n) => b.touch.has(n));
    const bothWorld = a.world.size && b.world.size;
    if (allowed(a, b)) continue;
    if ((shared.length || bothWorld) && !(pos(a) < pos(b))) errors.push(`Reihenfolge: Seiteneffekt #${b.i} (${b.file}) laeuft vor #${a.i} (${a.file}) [${shared.join(",") || "Welt: " + [...a.world].slice(0, 3) + " / " + [...b.world].slice(0, 3)}]`);
  }
  // 3) Pure Anweisungen, die mit einem Seiteneffekt dasselbe Binding beruehren
  for (const w of imp) for (const s of stmts) {
    if (s.impure || s.i === w.i) continue;
    if (![...s.touch].some((n) => w.touch.has(n))) continue;
    if ((s.i < w.i) !== (pos(s) < pos(w))) errors.push(`Konflikt: #${s.i} ${s.names[0]} (${s.file}) und Seiteneffekt #${w.i} (${w.file}) beruehren ${[...s.touch].filter((n) => w.touch.has(n)).join(",")} in anderer Reihenfolge`);
  }
  // 4) Schreibzugriffe auf Top-Level-Bindings aus anderen Modulen (Importe sind schreibgeschuetzt)
  for (const w of writes) {
    const b = bindings.get(w.name);
    if (stmts[w.stmt].file !== stmts[b.stmt].file) errors.push(`let/Import: ${w.name} (${b.kind}, ${stmts[b.stmt].file}) wird in ${stmts[w.stmt].file} (#${w.stmt}) beschrieben`);
    else if (b.kind === "const" || b.kind === "hoisted") warns.push(`Zuweisung an ${b.kind} ${w.name}`);
  }
  for (const u of undeclaredWrites) errors.push(`Strict: Zuweisung an undeklariertes ${u.name} (#${u.stmt})`);
  // 5) ASI-Gefahr bei nicht benachbarten Slices
  for (const m of mods.order) for (let k = 1; k < m.stmts.length; k++) {
    const a = m.stmts[k - 1], b = m.stmts[k];
    if (b.i === a.i + 1 || a.hasSemi) continue;
    const nx = code0.slice(b.start, b.end).replace(/^(\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*\n)*/, "")[0];
    if ("([`+-/".includes(nx)) errors.push(`ASI: #${a.i} ohne Semikolon vor #${b.i} in ${m.file}`);
  }
  return { errors, warns, ev };
}

// ---------------------------------------------------------------- Schreiben / Pruefen
function listGenerated(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listGenerated(p, base, out);
    else if (e.name.endsWith(".js")) out.push(path.relative(base, p).split(path.sep).join("/"));
  }
  return out;
}

function extractBody(text, file) {
  const a = text.indexOf(BODY_BEGIN), b = text.lastIndexOf(BODY_END);
  if (a < 0 || b < 0 || text.split(BODY_BEGIN).length !== 2) throw new Error("Marker fehlen in " + file);
  return text.slice(a + BODY_BEGIN.length, b);
}

function verify(strict = true) {
  const idx = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
  const srcFile = path.join(ROOT, idx.source);
  const tpl = fs.readFileSync(path.join(WEB, "index.html"), "utf8");
  const bodies = new Map();
  for (const f of new Set(idx.chunks.map((c) => c[0]))) bodies.set(f, { text: extractBody(fs.readFileSync(path.join(SRC, f), "utf8"), f), pos: 0 });
  let code = "";
  for (const [f, len] of idx.chunks) { const b = bodies.get(f); code += b.text.slice(b.pos, b.pos + len); b.pos += len; }
  for (const [f, b] of bodies) if (b.pos !== b.text.length) throw new Error(`${f}: ${b.text.length - b.pos} Zeichen uebrig (Modul von Hand geaendert?)`);
  const html = joinHtml(tpl, code, idx.html);
  const got = sha(html), codeHash = sha(code);
  const orig = fs.existsSync(srcFile) ? fs.readFileSync(srcFile, "utf8") : null;
  const want = orig ? sha(orig) : idx.sha256;
  console.log(`App-Code   ${codeHash}  (${idx.codeSha256 === codeHash ? "gleich wie bei der Zerlegung" : "ABWEICHUNG zur Zerlegung"})`);
  console.log(`Rekonstr.  ${got}`);
  console.log(`${idx.source.padEnd(10)} ${want}`);
  if (strict && got !== want) { console.error("VERIFY FEHLER: Rekonstruktion ungleich " + idx.source); process.exit(1); }
  console.log(`VERIFY OK: ${idx.chunks.length} Slices aus ${bodies.size} Modulen ergeben ${idx.source} byte-genau.`);
  return code;
}

let code0 = "";
function main() {
  if (has("--verify")) { verify(); return; }
  if (has("--source")) { const log = console.log; console.log = () => {}; const c = verify(false); console.log = log; process.stdout.write(c); return; }
  const srcRel = argVal("--src") || "index.html";
  const html = fs.readFileSync(path.join(ROOT, srcRel), "utf8");
  const H = splitHtml(html);
  code0 = H.code;
  const mono = has("--mono");
  const map = mono ? { rules: [] } : JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
  const A = analyze(H.code);
  computeNeeds(A);
  const { unmatched, unusedRules } = assignFiles(A, map, mono);
  const mods = buildModules(A, H.code);
  const { errors, warns, ev } = checkOrder(A, mods, map);

  console.log(`Quelle ${srcRel}: ${A.stmts.length} Top-Level-Anweisungen, ${mods.order.length} Module, ${A.stmts.filter((s) => s.impure).length} mit Seiteneffekt`);
  const lets = A.stmts.filter((s) => s.kind === "let" || s.kind === "var");
  console.log(`let/var: ${lets.length} (${lets.map((s) => s.names.join("+")).join(", ")})`);
  if (unmatched.length) console.log(`Warnliste Rest (${unmatched.length}): ${unmatched.join(", ")}`);
  if (unusedRules.length) console.log(`Unbenutzte Regeln: ${unusedRules.join("; ")}`);
  warns.forEach((w) => console.log("WARN " + w));
  if (has("--why")) A.stmts.filter((s) => s.impure).forEach((s) => console.log(`  Effekt #${s.i} ${s.names[0] || s.kind} ${s.file}: ${s.why || s.kind}; Welt: ${[...s.world].join(",")}`));
  if (errors.length) {
    errors.slice(0, 80).forEach((e) => console.error("FEHLER " + e));
    console.error(`${errors.length} Gefahrenstellen, Abbruch (nichts geschrieben).`);
    process.exit(2);
  }
  if (has("--check")) { console.log("CHECK OK"); return; }

  // Schreiben
  const rendered = mods.order.map((m) => [m.file, renderModule(m)]);
  for (const [f, text] of rendered) {
    try { parse(text, { sourceType: "module" }); } catch (e) { throw new Error(`Erzeugtes Modul ${f} ist ungueltig: ${e.message}`); }
    const n = parse(extractBody(text, f), { sourceType: "module" }).program.body.length;
    const want = mods.order.find((m) => m.file === f).stmts.length;
    if (n !== want) throw new Error(`${f}: ${n} statt ${want} Anweisungen nach dem Zusammensetzen (ASI?)`);
  }
  const newFiles = new Set(rendered.map(([f]) => f).concat(["main.js"]));
  for (const f of listGenerated(SRC)) if (!newFiles.has(f) && !STATIC_FILES.has(f)) fs.rmSync(path.join(SRC, f));
  for (const [f, text] of rendered) { fs.mkdirSync(path.dirname(path.join(SRC, f)), { recursive: true }); fs.writeFileSync(path.join(SRC, f), text); }
  for (const d of listDirs(SRC)) if (!fs.readdirSync(d).length) fs.rmdirSync(d);
  fs.writeFileSync(path.join(SRC, "main.js"), renderMain(mods.order));
  fs.writeFileSync(path.join(WEB, "index.html"), H.tpl);
  const index = {
    note: "Erzeugt von tools/split.mjs. chunks = [Modul, Laenge in UTF-16-Zeichen] in Original-Reihenfolge; Verkettung der Modul-Rumpfe ergibt den App-Code.",
    source: srcRel, sha256: sha(html), codeSha256: sha(H.code), mode: mono ? "mono" : "split",
    html: { cuts: H.cuts.map((c) => ({ start: c.start, end: c.end, repl: c.repl, file: (H.reactParts.find((r) => r.start === c.start) || {}).file })) },
    evalOrder: [...ev.entries()].sort((a, b) => a[1] - b[1]).map((e) => e[0]),
    chunks: A.stmts.map((s, k) => [s.file, (s.end - s.start) + (k === A.stmts.length - 1 ? mods.tail.length : 0)]),
    statements: A.stmts.map((s) => [s.i, s.file, s.names.join(",") || s.kind]),
  };
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 0).replace(/\],\[/g, "],\n["));
  console.log(`Geschrieben: ${rendered.length} Module + main.js, web/index.html, ${rel(INDEX_FILE)}`);
  verify();
}

function listDirs(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) if (e.isDirectory()) { const p = path.join(dir, e.name); listDirs(p, out); out.push(p); }
  return out;
}

main();
