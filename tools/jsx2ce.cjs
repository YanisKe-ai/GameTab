// jsx2ce: JSX -> React.createElement (Babel 7), Gegenstueck zu tools/cejsx.mjs.
// Zwei Verwendungen:
//  1. tests/lib/source.js: JSX im zusammengesetzten Quelltext fuer die Logiktests zurueckwandeln
//     (Splice: nur die JSX-Bereiche werden ersetzt, einzeilig, Rest byte-gleich, Zeilen bleiben erhalten).
//  2. tools/cejsx.mjs: kanonische Form fuer die Selbstpruefung (vorher/nachher muessen gleich sein).
"use strict";
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

const GEN = { comments: false, concise: true, jsescOption: { minimal: true, quotes: "double" } };

// JSX-Whitespace wie Babel (cleanJSXElementLiteralChild)
function cleanText(value) {
  const lines = value.split(/\r\n|\n|\r/);
  let last = 0;
  for (let i = 0; i < lines.length; i++) if (/[^ \t]/.test(lines[i])) last = i;
  let str = "";
  for (let i = 0; i < lines.length; i++) {
    const first = i === 0, isLast = i === lines.length - 1, lastNonEmpty = i === last;
    let line = lines[i].replace(/\t/g, " ");
    if (!first) line = line.replace(/^[ ]+/, "");
    if (!isLast) line = line.replace(/[ ]+$/, "");
    if (line) { if (!lastNonEmpty) line += " "; str += line; }
  }
  return str;
}

const reactCE = () => t.memberExpression(t.identifier("React"), t.identifier("createElement"));

function nameToExpr(n) {
  if (t.isJSXIdentifier(n)) {
    if (n.name === "this") return t.thisExpression();
    return /^[a-z]/.test(n.name) || n.name.includes("-") ? t.stringLiteral(n.name) : t.identifier(n.name);
  }
  if (t.isJSXMemberExpression(n)) {
    const o = t.isJSXIdentifier(n.object) ? (n.object.name === "this" ? t.thisExpression() : t.identifier(n.object.name)) : nameToExpr(n.object);
    return t.memberExpression(o, t.identifier(n.property.name));
  }
  if (t.isJSXNamespacedName(n)) return t.stringLiteral(n.namespace.name + ":" + n.name.name);
  throw new Error("unbekannter JSX-Name " + n.type);
}

// JSXElement/JSXFragment -> CallExpression (rekursiv, auch JSX in Props/Kind-Ausdruecken)
function toCall(node) {
  let type, attrs = [];
  if (t.isJSXFragment(node)) type = t.memberExpression(t.identifier("React"), t.identifier("Fragment"));
  else { type = nameToExpr(node.openingElement.name); attrs = node.openingElement.attributes; }
  const props = [];
  for (const a of attrs) {
    if (t.isJSXSpreadAttribute(a)) { props.push(t.spreadElement(conv(a.argument))); continue; }
    const k = t.isJSXNamespacedName(a.name) ? a.name.namespace.name + ":" + a.name.name.name : a.name.name;
    const key = t.isValidIdentifier(k) ? t.identifier(k) : t.stringLiteral(k);
    let v;
    if (a.value == null) v = t.booleanLiteral(true);
    else if (t.isStringLiteral(a.value)) v = t.stringLiteral(a.value.value);
    else if (t.isJSXExpressionContainer(a.value)) v = conv(a.value.expression);
    else v = conv(a.value);
    props.push(t.objectProperty(key, v));
  }
  const args = [type, props.length ? t.objectExpression(props) : t.nullLiteral()];
  for (const c of node.children) {
    if (t.isJSXText(c)) { const s = cleanText(c.value); if (s) args.push(t.stringLiteral(s)); }
    else if (t.isJSXExpressionContainer(c)) { if (!t.isJSXEmptyExpression(c.expression)) args.push(conv(c.expression)); }
    else if (t.isJSXSpreadChild(c)) args.push(t.spreadElement(conv(c.expression)));
    else args.push(toCall(c));
  }
  return t.callExpression(reactCE(), args);
}

// Ausdruck mit evtl. verschachteltem JSX (z.B. Pfeilfunktion in Prop) -> ohne JSX
function conv(expr) {
  if (t.isJSXElement(expr) || t.isJSXFragment(expr)) return toCall(expr);
  const file = t.file(t.program([t.expressionStatement(expr)]));
  let hit = false;
  traverse(file, { "JSXElement|JSXFragment"(p) { hit = true; p.replaceWith(toCall(p.node)); } }, undefined, undefined);
  return hit ? file.program.body[0].expression : expr;
}

const PARSE = (code) => parse(code, { sourceType: "module", plugins: ["jsx"], errorRecovery: false });

// Splice: aeusserste JSX-Bereiche durch einzeiliges React.createElement ersetzen. Rest bleibt byte-gleich.
function jsxToCeSplice(code) {
  if (!/<\/|\/>|<>/.test(code)) return code;
  let ast;
  try { ast = PARSE(code); } catch { return code; }
  const edits = [];
  traverse(ast, {
    "JSXElement|JSXFragment"(p) {
      const { start, end } = p.node;
      let out = generate(toCall(t.cloneNode(p.node, true, true)), GEN).code;
      if (code[start - 1] === "<") out = "(" + out + ")";
      edits.push([start, end, out]);
      p.skip();
    },
  });
  if (!edits.length) return code;
  edits.sort((a, b) => b[0] - a[0]);
  let s = code;
  for (const [a, b, r] of edits) s = s.slice(0, a) + r + s.slice(b);
  return s;
}

module.exports = { jsxToCeSplice, toCall, conv, cleanText, GEN, reactCE };
