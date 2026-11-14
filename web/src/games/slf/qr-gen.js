// Kleiner QR-Code-Erzeuger (Byte-Modus, Fehlerkorrektur L, Version 1 bis 10) fuer die Kategorien-Links.
// Die Datei web/src/shared/qr.js kann nur Version 3 mit 42 Bytes, das reicht fuer Links mit eigenen Kategorien nicht.
// Aufbau nach der Norm ISO/IEC 18004: Daten, Reed-Solomon, Funktionsmuster, Maske mit Strafpunkten, Format- und Versionsbits.

// Pro Version: [Datenwoerter, EC-Woerter je Block, [[Blockzahl, Datenwoerter je Block], ...]]
const VER = [
  null,
  [19, 7, [[1, 19]]], [34, 10, [[1, 34]]], [55, 15, [[1, 55]]], [80, 20, [[1, 80]]], [108, 26, [[1, 108]]],
  [136, 18, [[2, 68]]], [156, 20, [[2, 78]]], [194, 24, [[2, 97]]], [232, 30, [[2, 116]]], [274, 18, [[2, 68], [2, 69]]],
];
const ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

const EXP = new Array(512), LOG = new Array(256);
(() => { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

function rsGen(deg) {
  let g = [1];
  for (let i = 0; i < deg; i++) {
    const n = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) { n[j] ^= g[j]; n[j + 1] ^= mul(g[j], EXP[i]); }
    g = n;
  }
  return g;
}
function rsRem(data, deg) {
  const g = rsGen(deg), r = new Array(deg).fill(0);
  data.forEach((d) => {
    const f = d ^ r.shift(); r.push(0);
    for (let j = 0; j < deg; j++) r[j] ^= mul(g[j + 1], f);
  });
  return r;
}

function capacityBytes(v) { return Math.floor((VER[v][0] * 8 - 4 - (v >= 10 ? 16 : 8)) / 8); }

function buildCodewords(bytes, v) {
  const [dataCw, ecLen, groups] = VER[v];
  const bits = [];
  const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  put(4, 4); put(bytes.length, v >= 10 ? 16 : 8); bytes.forEach((b) => put(b, 8));
  put(0, Math.min(4, dataCw * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const cw = [];
  for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; cw.push(b); }
  for (let p = 0; cw.length < dataCw; p++) cw.push(p % 2 ? 0x11 : 0xec);
  const blocks = []; let at = 0;
  groups.forEach(([n, len]) => { for (let i = 0; i < n; i++) { blocks.push(cw.slice(at, at + len)); at += len; } });
  const ecs = blocks.map((b) => rsRem(b, ecLen));
  const out = [];
  const maxLen = Math.max(...blocks.map((b) => b.length));
  for (let i = 0; i < maxLen; i++) blocks.forEach((b) => { if (i < b.length) out.push(b[i]); });
  for (let i = 0; i < ecLen; i++) ecs.forEach((e) => out.push(e[i]));
  return out;
}

function maskFn(m, r, c) {
  switch (m) {
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    default: return ((((r + c) % 2) + ((r * c) % 3)) % 2) === 0;
  }
}

function penalty(M, N) {
  let p = 0;
  const line = (get) => {
    for (let a = 0; a < N; a++) {
      let run = 1;
      for (let b = 1; b < N; b++) {
        if (get(a, b) === get(a, b - 1)) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1;
      }
      // Finder-aehnliche Muster 1011101 mit 4 hellen Feldern daneben
      for (let b = 0; b + 10 < N + 0; b++) {
        const s = [];
        for (let k = 0; k < 11; k++) s.push(get(a, b + k) ? 1 : 0);
        const j = s.join("");
        if (j === "10111010000" || j === "00001011101") p += 40;
      }
    }
  };
  line((r, c) => M[r][c]);
  line((c, r) => M[r][c]);
  for (let r = 0; r < N - 1; r++) for (let c = 0; c < N - 1; c++) { const v = M[r][c]; if (v === M[r][c + 1] && v === M[r + 1][c] && v === M[r + 1][c + 1]) p += 3; }
  let dark = 0; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (M[r][c]) dark++;
  p += Math.floor(Math.abs((dark * 20) - (N * N * 10)) / (N * N)) * 10;
  return p;
}

// Gibt { size, modules } zurueck (modules[r][c] === true ist dunkel) oder null, wenn der Text nicht passt.
function slfQr(text) {
  let bytes;
  try { bytes = Array.from(new TextEncoder().encode(String(text))); } catch (e) { return null; }
  let v = 0;
  for (let i = 1; i <= 10; i++) if (bytes.length <= capacityBytes(i)) { v = i; break; }
  if (!v) return null;
  const N = 17 + 4 * v;
  const all = buildCodewords(bytes, v);
  const M = [], F = [];
  for (let r = 0; r < N; r++) { M.push(new Array(N).fill(false)); F.push(new Array(N).fill(false)); }
  const fn = (r, c, val) => { if (r < 0 || c < 0 || r >= N || c >= N) return; M[r][c] = !!val; F[r][c] = true; };
  const finder = (r0, c0) => {
    for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
      const inn = i >= 0 && i <= 6 && j >= 0 && j <= 6;
      fn(r0 + i, c0 + j, inn && (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)));
    }
  };
  finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
  for (let i = 8; i < N - 8; i++) { fn(6, i, i % 2 === 0); fn(i, 6, i % 2 === 0); }
  const al = ALIGN[v];
  al.forEach((ar) => al.forEach((ac) => {
    if ((ar === 6 && ac === 6) || (ar === 6 && ac === al[al.length - 1]) || (ar === al[al.length - 1] && ac === 6)) return;
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) fn(ar + i, ac + j, Math.max(Math.abs(i), Math.abs(j)) !== 1);
  }));
  // Platz fuer Formatbits und Versionsbits reservieren
  for (let i = 0; i < 9; i++) { F[8][i] = true; F[i][8] = true; }
  for (let i = 0; i < 8; i++) { F[8][N - 1 - i] = true; F[N - 1 - i][8] = true; }
  fn(N - 8, 8, true);
  if (v >= 7) for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { F[i][N - 11 + j] = true; F[N - 11 + j][i] = true; }
  // Daten im Zickzack einsetzen
  let k = 0;
  for (let right = N - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < N; vert++) for (let j = 0; j < 2; j++) {
      const c = right - j, up = ((right + 1) & 2) === 0, r = up ? N - 1 - vert : vert;
      if (F[r][c]) continue;
      M[r][c] = k < all.length * 8 ? ((all[k >>> 3] >>> (7 - (k & 7))) & 1) === 1 : false;
      k++;
    }
  }
  const drawFormat = (mask) => {
    const data = (1 << 3) | mask; // Stufe L = 01
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    const fb = (i) => ((bits >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) M[i][8] = fb(i);
    M[7][8] = fb(6); M[8][8] = fb(7); M[8][7] = fb(8);
    for (let i = 9; i < 15; i++) M[8][14 - i] = fb(i);
    for (let i = 0; i < 8; i++) M[8][N - 1 - i] = fb(i);
    for (let i = 8; i < 15; i++) M[N - 15 + i][8] = fb(i);
    M[N - 8][8] = true;
  };
  if (v >= 7) {
    let rem = v;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (v << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((bits >>> i) & 1) === 1, a = N - 11 + (i % 3), b = Math.floor(i / 3);
      M[b][a] = bit; M[a][b] = bit;
    }
  }
  const applyMask = (m) => { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!F[r][c] && maskFn(m, r, c)) M[r][c] = !M[r][c]; };
  let best = 0, bestP = Infinity;
  for (let m = 0; m < 8; m++) {
    applyMask(m); drawFormat(m);
    const p = penalty(M, N);
    if (p < bestP) { bestP = p; best = m; }
    applyMask(m);
  }
  applyMask(best); drawFormat(best);
  return { size: N, modules: M, version: v };
}

// SVG-Pfad (ein Quadrat je dunklem Feld) mit 4 Feldern Ruhezone.
function slfQrPath(qr, quiet) {
  const q = quiet == null ? 4 : quiet;
  let d = "";
  for (let r = 0; r < qr.size; r++) {
    let c = 0;
    while (c < qr.size) {
      if (!qr.modules[r][c]) { c++; continue; }
      let e = c; while (e < qr.size && qr.modules[r][e]) e++;
      d += "M" + (c + q) + " " + (r + q) + "h" + (e - c) + "v1h" + (c - e) + "z";
      c = e;
    }
  }
  return { d, box: qr.size + 2 * q };
}
export { slfQr, slfQrPath, capacityBytes };
