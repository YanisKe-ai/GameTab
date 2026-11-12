#!/usr/bin/env node
// cejsx: React.createElement(...) -> JSX (Babel 7), klassische Runtime, SPLICE-MODUS.
// Nur die Quelltextbereiche der aeussersten umgewandelten Aufrufe werden ersetzt (einzeilig),
// der Rest jeder Datei bleibt byte-gleich (Marker wie /*GT_ST_BEGIN*/, /*@gt-body-begin*/ bleiben).
// Erkennt React.createElement, lokale Aliase (const h=React.createElement) und globale/importierte
// Aliase per --alias (Standard S8E). Was nicht sicher geht, bleibt createElement (gezaehlt, gemeldet).
// Selbstpruefung pro Datei: kanonische Form vorher/nachher muss gleich sein, sonst bleibt die Datei unveraendert.
// Aufruf:
//   node tools/cejsx.mjs [--write] [--alias=S8E,X] [--quiet] <datei.js|ordner> ...   (ohne --write: nur Bericht)
//   node tools/cejsx.mjs in.js out.js                                              (eine Datei)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as t from "@babel/types";
const traverse = _traverse.default || _traverse;
const generate = _generate.default || _generate;
const require = createRequire(import.meta.url);
const { toCall, GEN } = require("./jsx2ce.cjs");

const isCE = (n) => t.isMemberExpression(n) && !n.computed && t.isIdentifier(n.object, { name: "React" }) && t.isIdentifier(n.property, { name: "createElement" });
const ATTR = /^[A-Za-z_$][\w$]*(-[\w$]+)*$/;
const SAFE_ATTR_STR = /^[^"&\\<>{}\u0000-\u001f\u007f-\u00a0\u2028\u2029\ufeff]*$/;
const SAFE_TEXT = /^[^{}<>&\\\u0000-\u001f\u007f-\u00a0\u2028\u2029\ufeff]+$/;
const TAG = /^[a-z][A-Za-z0-9]*(-[A-Za-z0-9]+)*$/;
const PARSE_OPTS = { sourceType: "module", plugins: ["jsx"], errorRecovery: false };
// Quelltext des Stringliterals ohne Escapes (sonst koennte JSX ihn anders lesen)
const plainRaw = (n) => n.extra && typeof n.extra.raw === "string" && n.extra.raw.slice(1, -1) === n.value;

export function transform(code, { aliases = ["S8E"], filename = "x.js" } = {}) {
  const ast = parse(code, { ...PARSE_OPTS, sourceFilename: filename });
  const stats = { converted: 0, skipped: 0, skippedWhy: {}, aliasRemoved: 0, needReact: false };
  const aliasSet = new Set(aliases);
  const ceNames = new Set();
  const comments = ast.comments || [];

  const isCreate = (path) => {
    const c = path.node.callee;
    if (isCE(c)) return true;
    if (!t.isIdentifier(c)) return false;
    const b = path.scope.getBinding(c.name);
    if (aliasSet.has(c.name) && (!b || b.kind === "module")) return true;
    return !!(b && b.constant && t.isVariableDeclarator(b.path.node) && isCE(b.path.node.init));
  };
  const skip = (why) => { stats.skipped++; stats.skippedWhy[why] = (stats.skippedWhy[why] || 0) + 1; };

  function tagName(type) {
    if (t.isStringLiteral(type)) return TAG.test(type.value) ? type.value : null;
    if (t.isIdentifier(type)) return /^[A-Z]/.test(type.name) ? type.name : null;
    if (t.isMemberExpression(type)) return memberName(type);
    return null;
  }
  function memberName(n) {
    if (t.isIdentifier(n)) return n.name;
    if (t.isMemberExpression(n) && !n.computed && t.isIdentifier(n.property)) { const o = memberName(n.object); return o && o + "." + n.property.name; }
    return null;
  }
  // Props -> Attributliste. Werte bleiben Knoten (Ausgabe spaeter aus dem Originaltext).
  function attrs(props) {
    if (!props || t.isNullLiteral(props)) return [];
    if (!t.isObjectExpression(props)) return [{ kind: "spread", node: props, keep: [props] }];
    const out = []; let loose = null;
    const flush = () => { if (loose) { out.push(loose); loose = null; } };
    for (const p of props.properties) {
      if (t.isSpreadElement(p)) { flush(); out.push({ kind: "spread", node: p.argument, at: p, keep: [p.argument] }); continue; }
      const key = !t.isObjectProperty(p) || p.computed ? null : t.isIdentifier(p.key) ? p.key.name : t.isStringLiteral(p.key) ? p.key.value : null;
      if (key === null || !ATTR.test(key) || key.includes("--")) {
        if (!loose) loose = { kind: "loose", props: [], at: p, keep: [] };
        loose.props.push(p); loose.keep.push(p); continue;
      }
      flush();
      const v = p.value;
      if (t.isStringLiteral(v) && SAFE_ATTR_STR.test(v.value) && plainRaw(v)) out.push({ kind: "str", key, value: v.value, at: p, keep: [] });
      else if (t.isBooleanLiteral(v, { value: true })) out.push({ kind: "bool", key, at: p, keep: [] });
      else out.push({ kind: "expr", key, node: v, at: p, keep: [v] });
    }
    flush();
    return out;
  }
  function kids(args) {
    const out = []; let prevText = false;
    for (const a of args) {
      if (t.isSpreadElement(a)) return null;
      if (a._jsx) { out.push({ kind: "el", node: a }); prevText = false; }
      else if (t.isStringLiteral(a) && SAFE_TEXT.test(a.value) && plainRaw(a) && !prevText && !/^\s|\s$/.test(a.value)) { out.push({ kind: "text", node: a, value: a.value }); prevText = true; }
      else { out.push({ kind: "expr", node: a }); prevText = false; }
    }
    return out;
  }
  // Anfang/Ende eines Knotens inkl. eigener Klammern im Original
  const outerStart = (n) => (n.extra && n.extra.parenthesized ? n.extra.parenStart : n.start);
  const outerEnd = (n) => {
    if (!(n.extra && n.extra.parenthesized)) return n.end;
    const pre = code.slice(n.extra.parenStart, n.start);
    if (!/^[\s(]*$/.test(pre)) throw new Error("Klammern mit Kommentar bei " + n.start);
    let layers = (pre.match(/\(/g) || []).length, i = n.end;
    while (layers > 0 && i < code.length) { if (code[i] === ")") layers--; else if (!/\s/.test(code[i])) throw new Error("Klammerende nicht gefunden bei " + n.end); i++; }
    return i;
  };

  traverse(ast, {
    CallExpression: { exit(path) {
      if (!isCreate(path)) return;
      const { node } = path;
      const [type, props, ...rest] = node.arguments;
      if (!type) return void skip("ohne-typ");
      if (t.isSpreadElement(type) || t.isSpreadElement(props)) return void skip("spread-arg");
      const rb = path.scope.getBinding("React");
      if (rb && rb.scope !== path.scope.getProgramParent()) return void skip("React-verdeckt");
      const name = tagName(type);
      if (!name) return void skip("typ:" + (t.isIdentifier(type) ? type.name : type.type));
      const ch = kids(rest);
      if (!ch) return void skip("kinder-spread");
      const at = attrs(props);
      // Kommentare duerfen nur in uebernommenen Ausdruecken liegen (dort bleiben sie erhalten)
      const keep = [...at.flatMap((a) => a.keep), ...ch.filter((k) => k.kind !== "text").map((k) => k.node)];
      const inKeep = (c) => keep.some((k) => c.start >= outerStart(k) && c.end <= outerEnd(k));
      if (comments.some((c) => c.start >= node.start && c.end <= node.end && !inKeep(c))) return void skip("kommentar");
      if (t.isIdentifier(node.callee)) ceNames.add(node.callee.name);
      node._jsx = { name, attrs: at, kids: ch, props };
      if (!rb) stats.needReact = true;
      stats.converted++;
    } },
  });

  const nl = (a, b) => (a < b && code.slice(a, b).includes("\n") ? "\n" : "");
  // aeusserste umgewandelte Aufrufe unterhalb von root (ohne root selbst), mit Elternknoten
  function outermost(root) {
    const found = [];
    (function walk(n, parent, key) {
      if (!n || typeof n.type !== "string") return;
      if (n !== root && n._jsx) { found.push({ n, parent, key }); return; }
      for (const k of t.VISITOR_KEYS[n.type] || []) {
        const v = n[k];
        if (Array.isArray(v)) v.forEach((x) => walk(x, n, k)); else walk(v, n, k);
      }
    })(root, null, null);
    return found;
  }
  function needsParens({ n, parent, key }) {
    if (n.extra && n.extra.parenthesized) return false;
    if (code[n.start - 1] === "<" || /^[<>]/.test(code.slice(n.end, n.end + 1))) return true;
    if (!parent) return false;
    if ((t.isMemberExpression(parent) || t.isOptionalMemberExpression(parent)) && key === "object") return true;
    if ((t.isCallExpression(parent) || t.isOptionalCallExpression(parent) || t.isNewExpression(parent)) && key === "callee") return true;
    return t.isTaggedTemplateExpression(parent);
  }
  // Originaltext eines Ausdrucks, darin enthaltene umgewandelte Aufrufe ersetzt
  function exprText(n) {
    const a = outerStart(n), b = outerEnd(n);
    let s = code.slice(a, b);
    const inner = n._jsx ? [{ n, parent: null, key: null }] : outermost(n);
    inner.sort((x, y) => y.n.start - x.n.start);
    for (const it of inner) {
      let r = printEl(it.n);
      if (it.n !== n && needsParens(it)) r = "(" + r + ")";
      s = s.slice(0, it.n.start - a) + r + s.slice(it.n.end - a);
    }
    return s;
  }
  function printEl(node) {
    const { name, attrs: at, kids: ch, props } = node._jsx;
    let s = "<" + name, prevEnd = props ? outerStart(props) : node.end;
    for (const x of at) {
      const pre = x.at ? nl(prevEnd, x.at.start) || " " : " ";
      if (x.kind === "str") s += pre + x.key + '="' + x.value + '"';
      else if (x.kind === "bool") s += pre + x.key;
      else if (x.kind === "expr") s += pre + x.key + "={" + exprText(x.node) + "}";
      else if (x.kind === "spread") s += pre + "{..." + exprText(x.node) + "}";
      else s += pre + "{...{" + x.props.map(exprText).join(",") + "}}";
      if (x.at) prevEnd = x.kind === "loose" ? x.props[x.props.length - 1].end : x.at.end;
    }
    if (!ch.length) return s + "/>";
    s += ">";
    let prev = props ? outerEnd(props) : outerEnd(node.arguments[0]);
    for (const k of ch) {
      s += nl(prev, outerStart(k.node));
      if (k.kind === "text") s += k.value;
      else if (k.kind === "el") s += printEl(k.node);
      else s += "{" + exprText(k.node) + "}";
      prev = outerEnd(k.node);
    }
    return s + nl(prev, node.end) + "</" + name + ">";
  }

  const edits = outermost(ast.program).map((it) => {
    let r = printEl(it.n);
    if (needsParens(it)) r = "(" + r + ")";
    return [it.n.start, it.n.end, r];
  });

  // Nicht mehr benutzte lokale Aliase entfernen (nur Einzel-Deklaration in Funktionen, ohne Kommentar)
  if (edits.length) {
    traverse(ast, {
      VariableDeclarator(path) {
        if (!t.isIdentifier(path.node.id) || !isCE(path.node.init)) return;
        const decl = path.parentPath;
        if (!decl.isVariableDeclaration() || decl.node.declarations.length !== 1) return;
        if (decl.scope.getProgramParent() === decl.scope || !decl.parentPath.isBlockStatement()) return;
        const b = path.scope.getBinding(path.node.id.name);
        if (!b || b.constantViolations.length || !b.referencePaths.every((r) => r.parent._jsx && r.parent.callee === r.node)) return;
        const { start, end } = decl.node;
        if (comments.some((c) => c.start >= start && c.end <= end) || edits.some(([a, z]) => a < end && z > start)) return;
        edits.push([start, end, ""]);
        stats.aliasRemoved++;
      },
    });
  }

  edits.sort((x, y) => y[0] - x[0]);
  let out = code;
  for (const [a, b, r] of edits) out = out.slice(0, a) + r + out.slice(b);
  stats.ceNames = [...ceNames];
  return { code: out, stats, edits };
}

// Kanonische Form: JSX -> createElement, Aliase -> React.createElement, Props/Strings normalisiert.
export function canonical(code, ceNames) {
  const ast = parse(code, PARSE_OPTS);
  const names = new Set(ceNames);
  const isCall = (n) => t.isCallExpression(n) && (isCE(n.callee) || (t.isIdentifier(n.callee) && names.has(n.callee.name)));
  traverse(ast, {
    "JSXElement|JSXFragment"(p) { p.replaceWith(toCall(p.node)); },
    VariableDeclaration(p) {
      const d = p.node.declarations;
      if (d.length === 1 && isCE(d[0].init) && t.isIdentifier(d[0].id) && p.parentPath.isBlockStatement()) p.remove();
    },
    CallExpression: { exit(p) {
      const n = p.node;
      if (!isCall(n)) return;
      n.callee = t.memberExpression(t.identifier("React"), t.identifier("createElement"));
      let pr = n.arguments[1];
      if (n.arguments.length < 2 || t.isNullLiteral(pr)) pr = t.objectExpression([]);
      else if (!t.isObjectExpression(pr)) pr = t.objectExpression([t.spreadElement(pr)]);
      const flat = [];
      const add = (props) => { for (const q of props) { if (t.isSpreadElement(q) && t.isObjectExpression(q.argument)) add(q.argument.properties); else flat.push(q); } };
      add(pr.properties);
      for (const q of flat) if (t.isObjectProperty(q) && !q.computed) {
        q.shorthand = false;
        if (t.isIdentifier(q.key)) q.key = t.stringLiteral(q.key.name);
      }
      n.arguments = [n.arguments[0], flat.length ? t.objectExpression(flat) : t.nullLiteral(), ...n.arguments.slice(2)];
    } },
    enter(p) { if (p.node.extra) delete p.node.extra; },
  });
  return generate(ast, GEN).code;
}

function addReactImport(code, file) {
  // relativen Pfad zu web/src/vendor/react-globals.js suchen
  let dir = path.dirname(path.resolve(file)), target = null;
  for (let i = 0; i < 8 && !target; i++, dir = path.dirname(dir)) {
    const c = path.join(dir, "vendor", "react-globals.js");
    if (fs.existsSync(c)) target = c;
  }
  if (!target) return null;
  let rel = path.relative(path.dirname(path.resolve(file)), target).split(path.sep).join("/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  const line = `import { React } from "${rel}";`;
  const lines = code.split("\n");
  let last = -1;
  for (let i = 0; i < lines.length; i++) if (/^\s*import\s/.test(lines[i])) last = i;
  lines.splice(last + 1, 0, line);
  return lines.join("\n");
}

// web/src/split-index.json (tools/split.mjs --source) mitfuehren: Laengen der betroffenen Slices anpassen.
// Jede Ersetzung liegt innerhalb einer Anweisung, also innerhalb genau eines Slices.
const BODY_BEGIN = "/*@gt-body-begin*/";
const splitIdx = { path: null, data: null, dirty: false };
function splitIndexFor(file) {
  let dir = path.dirname(path.resolve(file));
  for (let i = 0; i < 8; i++, dir = path.dirname(dir)) {
    const c = path.join(dir, "split-index.json");
    if (fs.existsSync(c)) {
      if (splitIdx.path !== c) { splitIdx.path = c; splitIdx.data = JSON.parse(fs.readFileSync(c, "utf8")); splitIdx.dirty = false; }
      return { rel: path.relative(dir, path.resolve(file)).split(path.sep).join("/"), data: splitIdx.data };
    }
  }
  return null;
}
function adjustSplitIndex(file, src, edits) {
  const si = splitIndexFor(file);
  if (!si) return null;
  const mine = si.data.chunks.filter((c) => c[0] === si.rel);
  if (!mine.length) return null;
  const body0 = src.indexOf(BODY_BEGIN);
  if (body0 < 0) return "Marker " + BODY_BEGIN + " fehlt";
  const base = body0 + BODY_BEGIN.length;
  const starts = []; let acc = 0;
  for (const c of mine) { starts.push(acc); acc += c[1]; }
  const delta = mine.map(() => 0);
  for (const [a, b, r] of edits) {
    const x = a - base, y = b - base;
    let k = starts.length - 1; while (k > 0 && starts[k] > x) k--;
    if (x < 0 || y > starts[k] + mine[k][1]) return `Ersetzung ${a}-${b} liegt nicht in einem Slice`;
    delta[k] += r.length - (b - a);
  }
  mine.forEach((c, k) => { c[1] += delta[k]; });
  splitIdx.dirty = true;
  return null;
}
export function flushSplitIndex() {
  if (splitIdx.dirty) { fs.writeFileSync(splitIdx.path, JSON.stringify(splitIdx.data).replace(/\],\[/g, "],\n[")); /* Format wie split.mjs */ splitIdx.dirty = false; return splitIdx.path; }
  return null;
}

export function processFile(file, { aliases, write }) {
  const src = fs.readFileSync(file, "utf8");
  const res = { file, converted: 0, skipped: 0, skippedWhy: {}, aliasRemoved: 0, changed: false, error: null };
  if (!/createElement|\bS8E\(/.test(src)) return res;
  let r;
  try { r = transform(src, { aliases, filename: file }); } catch (e) { res.error = "parse: " + e.message; return res; }
  Object.assign(res, { converted: r.stats.converted, skipped: r.stats.skipped, skippedWhy: r.stats.skippedWhy, aliasRemoved: r.stats.aliasRemoved });
  let out = r.code;
  if (out === src) return res;
  try {
    parse(out, PARSE_OPTS);
    const a = canonical(src, r.stats.ceNames), b = canonical(out, r.stats.ceNames);
    if (a !== b) {
      let i = 0; while (i < a.length && a[i] === b[i]) i++;
      throw new Error("Selbstpruefung: Abweichung bei " + i + ": " + JSON.stringify(a.slice(Math.max(0, i - 60), i + 60)) + " / " + JSON.stringify(b.slice(Math.max(0, i - 60), i + 60)));
    }
  } catch (e) { res.error = e.message; res.converted = 0; return res; }
  if (r.stats.needReact) {
    const w = addReactImport(out, file);
    if (!w) { res.error = "React nicht im Scope und vendor/react-globals.js nicht gefunden"; res.converted = 0; return res; }
    out = w; res.reactImport = true;
  }
  if (write) {
    const err = adjustSplitIndex(file, src, r.edits);
    if (err) { res.error = "split-index: " + err; res.converted = 0; return res; }
  }
  res.changed = true;
  if (write) fs.writeFileSync(file, out);
  return res;
}

const EXCLUDE = /(^|\/)(vendor|node_modules|components\/magicui)(\/|$)|(^|\/)prelude\.js$/;
function collect(p, acc) {
  const st = fs.statSync(p);
  if (st.isDirectory()) { for (const f of fs.readdirSync(p).sort()) collect(path.join(p, f), acc); }
  else if (/\.(m?js)$/.test(p) && !EXCLUDE.test(p.split(path.sep).join("/"))) acc.push(p);
  return acc;
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const args = process.argv.slice(2);
  const flag = (n) => args.includes(n);
  const aliasArg = args.find((a) => a.startsWith("--alias="));
  const aliases = aliasArg ? aliasArg.slice(8).split(",").filter(Boolean) : ["S8E"];
  const pos = args.filter((a) => !a.startsWith("--"));
  // Einzeldatei in -> out
  if (pos.length === 2 && fs.existsSync(pos[0]) && fs.statSync(pos[0]).isFile() && !fs.existsSync(pos[1])) {
    const src = fs.readFileSync(pos[0], "utf8");
    const r = transform(src, { aliases, filename: pos[0] });
    fs.writeFileSync(pos[1], r.code);
    console.error(JSON.stringify(r.stats));
    process.exit(0);
  }
  if (!pos.length) { console.error("Aufruf: node tools/cejsx.mjs [--write] [--alias=S8E] <datei|ordner> ..."); process.exit(2); }
  const files = pos.flatMap((p) => collect(p, []));
  let conv = 0, skipped = 0, removed = 0, changed = 0, errors = 0;
  const why = {};
  for (const f of files) {
    const r = processFile(f, { aliases, write: flag("--write") });
    conv += r.converted; skipped += r.skipped; removed += r.aliasRemoved; if (r.changed) changed++;
    for (const [k, v] of Object.entries(r.skippedWhy)) why[k] = (why[k] || 0) + v;
    if (r.error) { errors++; console.log(`FEHLER ${f}: ${r.error.slice(0, 400)}`); continue; }
    if (!flag("--quiet") && (r.converted || r.skipped)) {
      console.log(`${r.changed ? "geaendert " : "unveraendert"} ${f}: ${r.converted} umgewandelt, ${r.skipped} bleiben createElement${r.skipped ? " " + JSON.stringify(r.skippedWhy) : ""}${r.aliasRemoved ? `, ${r.aliasRemoved} Alias entfernt` : ""}${r.reactImport ? ", React-Import ergaenzt" : ""}`);
    }
  }
  const si = flag("--write") ? flushSplitIndex() : null;
  if (si) console.log("split-index angepasst: " + path.relative(process.cwd(), si));
  console.log(`\nSumme: ${files.length} Dateien, ${changed} ${flag("--write") ? "geschrieben" : "wuerden geaendert"}, ${conv} umgewandelt, ${skipped} bleiben createElement ${JSON.stringify(why)}, ${removed} Aliase entfernt, ${errors} Fehler`);
  process.exit(errors ? 1 : 0);
}
