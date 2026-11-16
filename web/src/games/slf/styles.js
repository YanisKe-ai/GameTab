// Stadt Land Fluss: Farben pro Theme (Nocturne, Hell, Noir) und das gesamte CSS. Alle Farben laufen ueber Variablen --s-*.
import { shellTokens } from "../../themes/tokens.js";
import { isHell, HELL } from "../../themes/hell.js";

// Eigene Akzentfarbe: Tintenviolett (kommt sonst in keinem Spiel vor).
function slfTk(theme) {
  if (theme === "light" && isHell()) {
    const sh = shellTokens(theme);
    return {
      acc: HELL.ink, accText: HELL.ink, btn1: "#3A352C", btn2: HELL.ink, onAcc: HELL.card,
      pageBg: sh.pageBg, card: HELL.card, ink: HELL.ink, muted: HELL.muted, border: "rgba(30,26,21,.3)",
      paper: HELL.card, line: "rgba(30,26,21,.18)", margin: "rgba(30,26,21,.4)", hand: HELL.ink,
      tile1: "#3A352C", tile2: HELL.ink, onTile: HELL.card, tileShadow: "#878175",
      off: HELL.muted, stop1: "#3A352C", stop2: HELL.ink, onStop: HELL.card, zero: "#6B6358", gold: HELL.ink, bg2: HELL.soft,
      binding: "#EDE5D5",
    };
  }
  const sh = shellTokens(theme);
  if (theme === "light") {
    return {
      acc: "#5B3FD6", accText: "#4A2FC0", btn1: "#7456EC", btn2: "#5B3FD6", onAcc: "#FFFFFF",
      pageBg: sh.pageBg, card: "#FFFCF6", ink: "#17130F", muted: "#4A443A", border: "rgba(60,48,30,.2)",
      paper: "#FFFDF3", line: "rgba(70,110,190,.32)", margin: "rgba(205,60,75,.55)", hand: "#2B2878",
      tile1: "#8D72FF", tile2: "#5B3FD6", onTile: "#FFFFFF", tileShadow: "#3A24A0",
      off: "#9A5B00", stop1: "#D8353A", stop2: "#B5232B", onStop: "#FFFFFF", zero: "#6B6358", gold: "#5B3FD6", bg2: "#E0D5BF",
      binding: "#EDE5D5",
    };
  }
  if (theme === "noir") {
    return {
      acc: "#C1C1C1", accText: "#EBEBEB", btn1: "#E6E6E6", btn2: "#BDBDBD", onAcc: "#111111",
      pageBg: "#000000", card: "#1A1A1A", ink: "#EBEBEB", muted: "#969696", border: "#5F5F5F",
      paper: "#111111", line: "rgba(255,255,255,.16)", margin: "rgba(255,255,255,.3)", hand: "#EBEBEB",
      tile1: "#EDEDED", tile2: "#B4B4B4", onTile: "#0A0A0A", tileShadow: "#5F5F5F",
      off: "#C8C8C8", stop1: "#EBEBEB", stop2: "#C4C4C4", onStop: "#0A0A0A", zero: "#3A3A3A", gold: "#C1C1C1", bg2: "#000000",
      binding: "#000000",
    };
  }
  return {
    acc: "#8B6CFF", accText: "#B7A2FF", btn1: "#7C5BF5", btn2: "#5F3FE0", onAcc: "#FFFFFF",
    pageBg: sh.pageBg, card: sh.card, ink: "#ECEFF9", muted: "#A9B1CC", border: "rgba(150,170,255,.2)",
    paper: "#19224A", line: "rgba(140,170,255,.2)", margin: "rgba(255,120,140,.5)", hand: "#F6F0DC",
    tile1: "#A58BFF", tile2: "#6B49F0", onTile: "#FFFFFF", tileShadow: "#3B26A8",
    off: "#F0B64A", stop1: "#F0525A", stop2: "#C7303A", onStop: "#FFFFFF", zero: "#4A5482", gold: "#8B6CFF", bg2: "#1F2540",
    binding: sh.pageBg,
  };
}

// Modus Plakat: Violett-Seite, Creme-Blatt, Schwarz, Dunkelviolett, Stopp-Rot.
function slfPkTk() {
  return {
    acc: "#1A1716", accText: "#1A1716", btn1: "#1A1716", btn2: "#1A1716", onAcc: "#F3EAD3",
    pageBg: "#E4312B", card: "#F3EAD3", ink: "#1A1716", muted: "#1A1716", border: "#1A1716",
    paper: "#F3EAD3", line: "rgba(20,20,20,.3)", margin: "rgba(232,69,60,.7)", hand: "#1A1716",
    tile1: "#1A1716", tile2: "#1A1716", onTile: "#F3EAD3", tileShadow: "#1A1716",
    off: "#E4312B", stop1: "#1A1716", stop2: "#1A1716", onStop: "#F3EAD3", zero: "#1A1716", gold: "#1A1716", bg2: "#E4312B",
    binding: "#E4312B",
  };
}

function slfVars(tk) {
  return {
    "--s-acc": tk.acc, "--s-acct": tk.accText, "--s-btn1": tk.btn1, "--s-btn2": tk.btn2, "--s-onacc": tk.onAcc,
    "--s-bg": tk.pageBg, "--s-card": tk.card, "--s-ink": tk.ink, "--s-mut": tk.muted, "--s-border": tk.border,
    "--s-paper": tk.paper, "--s-line": tk.line, "--s-margin": tk.margin, "--s-hand": tk.hand,
    "--s-tile1": tk.tile1, "--s-tile2": tk.tile2, "--s-ontile": tk.onTile, "--s-tshadow": tk.tileShadow,
    "--s-off": tk.off, "--s-stop1": tk.stop1, "--s-stop2": tk.stop2, "--s-onstop": tk.onStop, "--s-zero": tk.zero, "--s-hole": tk.binding,
  };
}

const SLF_FONTS = `@font-face{font-family:'Bowlby One';font-weight:400;font-display:swap;src:url("./fonts/BowlbyOne-Regular-lat.woff2") format('woff2');}@font-face{font-family:'Kalam';font-weight:700;font-display:swap;src:url("./fonts/Kalam-700-1.woff2") format('woff2');}`;

const SLF_CSS = `
.slf-root{color:var(--s-ink);font-family:'Inter',sans-serif;-webkit-tap-highlight-color:transparent}
:where(.slf-root) button{font-family:'Inter',sans-serif}
.slf-root button{touch-action:manipulation;-webkit-user-select:none;user-select:none}
.slf-root .gt-u-dock{bottom:calc(12px + env(safe-area-inset-bottom,0px) + var(--slf-kb,0px))}
.slf-root .gt-wm{font-size:clamp(24px,7.6vw,40px)!important}
.slf-body{display:flex;flex-direction:column;gap:14px}
.slf-card{background:var(--s-card);border:1px solid var(--s-border);border-radius:20px;padding:14px;box-sizing:border-box}
.slf-h{font:700 13px/1.2 'Inter',sans-serif;color:var(--s-mut);margin:0 2px 10px;letter-spacing:.02em}
.slf-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* Knoepfe */
.slf-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:56px;padding:12px 18px;border:none;border-radius:20px;background:linear-gradient(135deg,var(--s-btn1),var(--s-btn2));color:var(--s-onacc);font:800 17px/1.2 'Inter',sans-serif;cursor:pointer;box-shadow:0 8px 20px -12px var(--s-btn2);transition:transform .16s cubic-bezier(.23,1,.32,1),filter .2s}
.slf-btn:active{transform:scale(.97)}
.slf-btn[disabled]{opacity:.45;cursor:default;box-shadow:none}
.slf-ghost{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:8px 16px;border-radius:16px;border:1px solid var(--s-border);background:transparent;color:var(--s-ink);font:700 14px/1.2 'Inter',sans-serif;cursor:pointer;transition:transform .16s cubic-bezier(.23,1,.32,1)}
.slf-ghost:active{transform:scale(.97)}
.slf-ghost.is-block{display:flex;width:100%}
.slf-ghost[disabled]{opacity:.45}
.slf-root button:focus-visible,.slf-root input:focus-visible{outline:2px solid var(--s-acc);outline-offset:2px}
@media (hover:hover) and (pointer:fine){.slf-btn:hover:not([disabled]){filter:brightness(1.08)}.slf-ghost:hover:not([disabled]){border-color:var(--s-acc)}.slf-chip:hover{border-color:var(--s-acc)}}

/* Chips */
.slf-chips{display:flex;flex-wrap:wrap;gap:8px}
.slf-chip{display:inline-flex;align-items:center;gap:6px;min-height:44px;max-width:100%;padding:8px 14px;border-radius:999px;border:1px solid var(--s-border);background:var(--s-card);color:var(--s-ink);font:600 14px/1.2 'Inter',sans-serif;cursor:pointer;text-align:left;transition:background-color .18s,transform .16s cubic-bezier(.23,1,.32,1)}
.slf-chip:active{transform:scale(.97)}
.slf-chip[aria-pressed="true"]{background:var(--s-acc);border-color:transparent;color:var(--s-onacc)}
.slf-chip[aria-disabled="true"]{opacity:.45}
.slf-chip .ck{flex-shrink:0}
.slf-groups{display:flex;gap:8px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;padding:2px 2px 6px;margin:0 -2px;scrollbar-width:none}
.slf-groups::-webkit-scrollbar{display:none}
.slf-groups .slf-chip{flex:0 0 auto;scroll-snap-align:start;white-space:nowrap}
.slf-groups .slf-chip .n{font:800 12px 'Space Grotesk',sans-serif;min-width:20px;height:20px;border-radius:10px;background:rgba(127,127,127,.25);display:inline-flex;align-items:center;justify-content:center;padding:0 5px}
.slf-groups .slf-chip[aria-pressed="true"] .n{background:rgba(255,255,255,.28)}

/* Mini-Blatt in der Einrichtung */
.slf-paper{position:relative;background:var(--s-paper);border:1px solid var(--s-border);border-radius:18px;box-shadow:0 14px 30px -22px rgba(0,0,0,.6);overflow:hidden}
.slf-paper::before{content:"";display:block;height:20px;background:radial-gradient(circle at 14px 10px,var(--s-hole) 0 4.5px,transparent 5.2px) 0 0/28px 20px repeat-x;border-bottom:1px dashed var(--s-line)}
.slf-mini-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:10px 16px 4px 30px}
.slf-mini-head b{font:400 20px/1.1 'Bowlby One',sans-serif;color:var(--s-acct)}
.slf-mini-head span{font:700 13px 'Space Grotesk',sans-serif;color:var(--s-mut)}
.slf-mini-list{list-style:none;margin:0;padding:0 8px 0 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));position:relative}
.slf-mini-list li{display:flex;align-items:center;min-height:44px;border-bottom:1px solid var(--s-line);padding-left:30px;gap:2px;min-width:0}
.slf-mini-list li.wide{grid-column:1/-1}
.slf-mini-list .nm{flex:1;min-width:0;font:700 17px/1.15 'Kalam','Inter',cursive;color:var(--s-hand);overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-clamp:2;overflow-wrap:anywhere}
.slf-mini-list .x{flex-shrink:0;width:44px;height:44px;border:none;background:transparent;color:var(--s-mut);display:inline-flex;align-items:center;justify-content:center;border-radius:50%;cursor:pointer}
.slf-mini-wrap{position:relative}
.slf-mini-wrap::after,.slf-sheet::after{content:"";position:absolute;top:0;bottom:0;left:20px;width:2px;background:var(--s-margin);pointer-events:none}
.slf-empty{margin:0;padding:12px 16px 14px 30px;font:500 14px/1.4 'Inter',sans-serif;color:var(--s-mut)}
.slf-mini-actions{display:flex;gap:8px;padding:10px 12px 12px 30px;flex-wrap:wrap}

.slf-own{display:flex;gap:8px;align-items:stretch}
@media (max-width:380px){.slf-own.is-stack{flex-direction:column}.slf-own.is-stack>.slf-ghost{width:100%}}
[data-phone-landscape] .slf-own.is-stack{flex-direction:column}[data-phone-landscape] .slf-own.is-stack>.slf-ghost{width:100%}
.slf-input{flex:1;min-width:0;min-height:48px;box-sizing:border-box;padding:8px 14px;border-radius:16px;border:1px solid var(--s-border);background:var(--s-card);color:var(--s-ink);font:500 16px/1.2 'Inter',sans-serif;outline:none}
.slf-input:focus{border-color:var(--s-acc)}
.slf-input::placeholder{color:var(--s-mut);opacity:.8}
.slf-status{margin:8px 2px 0;font:600 13px/1.35 'Inter',sans-serif;color:var(--s-mut)}
.slf-status.ok{color:var(--s-acct)}
.slf-status.bad{color:var(--s-off)}

/* Hauptseite: Buchstabe und Blatt */
.slf-top{display:flex;align-items:center;gap:16px;padding:6px 2px 2px}
.slf-letter{position:relative;flex:0 0 auto;width:128px;height:128px;border:none;border-radius:32px;cursor:pointer;background:linear-gradient(150deg,var(--s-tile1),var(--s-tile2));color:var(--s-ontile);font:400 92px/1 'Bowlby One',sans-serif;display:flex;align-items:center;justify-content:center;padding:0;transform:rotate(-3deg);box-shadow:0 9px 0 -3px var(--s-tshadow),0 22px 30px -16px rgba(0,0,0,.55);transition:transform .2s cubic-bezier(.23,1,.32,1)}
.slf-letter:active{transform:rotate(-3deg) scale(.96)}
.slf-letter.is-unknown{font-size:62px;opacity:.92}
.slf-letter .ch{display:block;animation:slfPop .3s cubic-bezier(.23,1,.32,1)}
.slf-letter .pen{position:absolute;right:9px;bottom:9px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.28);color:#fff;display:flex;align-items:center;justify-content:center}
@keyframes slfPop{0%{transform:scale(.7);opacity:.3}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
.slf-side{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.slf-round{font:400 24px/1.1 'Bowlby One',sans-serif;color:var(--s-ink)}
.slf-hint{margin:0;font:500 13.5px/1.4 'Inter',sans-serif;color:var(--s-mut)}
.slf-ring{display:flex;align-items:center;gap:10px}
.slf-ring .sec{font:800 30px/1 'Space Grotesk',sans-serif;font-variant-numeric:tabular-nums}

.slf-strip{display:grid;grid-template-columns:repeat(13,minmax(0,1fr));gap:2px;padding:6px;border-radius:16px;background:var(--s-card);border:1px solid var(--s-border)}
.slf-strip span{font:800 13px/26px 'Space Grotesk','Inter',sans-serif;text-align:center;color:var(--s-ink);border-radius:8px}
.slf-strip span.is-used{color:var(--s-mut);opacity:.6;text-decoration:line-through;text-decoration-thickness:2px}
.slf-strip span.is-cur{background:var(--s-acc);color:var(--s-onacc);opacity:1;text-decoration:none}

.slf-sheet{list-style:none;margin:0;padding:0 0 8px;position:relative}
.slf-sheet .paperhead{display:block}
.slf-row{position:relative;padding:10px 14px 2px 34px;scroll-margin-bottom:120px;scroll-margin-top:90px}
.slf-lab{display:block;font:600 12.5px/1.25 'Inter',sans-serif;color:var(--s-mut);padding-right:4px}
.slf-in{display:block;width:100%;box-sizing:border-box;min-height:50px;margin:0;padding:6px 62px 2px 0;border:none;border-bottom:2px solid var(--s-line);border-radius:0;background:transparent;color:var(--s-hand);font:700 23px/1.25 'Kalam','Inter',cursive;outline:none;-webkit-appearance:none;appearance:none;text-overflow:ellipsis}
.slf-in:focus{border-bottom-color:var(--s-acc)}
.slf-root .slf-in:focus-visible{outline:none;border-bottom-width:4px;margin-bottom:-2px}
.slf-in::placeholder{color:transparent}
.slf-row.is-off .slf-in{border-bottom:2px dashed var(--s-off)}
.slf-off{position:absolute;right:14px;bottom:12px;font:800 12px/1 'Space Grotesk',sans-serif;color:var(--s-off);padding:4px 6px;border:1px solid currentColor;border-radius:8px;pointer-events:none}
.slf-row.is-locked .slf-in{caret-color:transparent}
.slf-stampbar{display:flex;justify-content:flex-end;padding:10px 20px 8px 34px}
.slf-stamp{display:inline-block;transform:rotate(7deg);border:3px solid var(--s-stop1);color:var(--s-stop1);background:var(--s-paper);font:400 24px/1 'Bowlby One',sans-serif;padding:4px 14px 3px;border-radius:12px;pointer-events:none;animation:slfStamp .34s cubic-bezier(.23,1,.32,1)}
@keyframes slfStamp{0%{transform:rotate(7deg) scale(1.9);opacity:0}70%{transform:rotate(7deg) scale(.94);opacity:1}100%{transform:rotate(7deg) scale(1)}}

.slf-stop{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;min-height:68px;border:none;border-radius:24px;background:linear-gradient(135deg,var(--s-stop1),var(--s-stop2));color:var(--s-onstop);font:400 28px/1 'Bowlby One',sans-serif;cursor:pointer;box-shadow:0 7px 0 -2px rgba(0,0,0,.35),0 18px 26px -14px var(--s-stop2);transition:transform .14s cubic-bezier(.23,1,.32,1),box-shadow .14s}
.slf-stop:active{transform:translateY(4px);box-shadow:0 3px 0 -2px rgba(0,0,0,.35),0 8px 14px -10px var(--s-stop2)}
.slf-banner{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:16px;border:1px solid var(--s-border);background:var(--s-card);font:700 14px/1.35 'Inter',sans-serif}

/* Punkte vergeben */
.slf-legend{display:flex;flex-wrap:wrap;gap:6px 14px;margin:0 2px;font:600 12.5px/1.3 'Inter',sans-serif;color:var(--s-mut)}
.slf-legend b{font:800 14px 'Space Grotesk',sans-serif;color:var(--s-ink);margin-right:4px}
.slf-srow{position:relative;padding:12px 14px 12px 34px;border-bottom:1px solid var(--s-line)}
.slf-ans{min-height:32px;font:700 23px/1.25 'Kalam','Inter',cursive;color:var(--s-hand);overflow-wrap:anywhere;padding:2px 0}
.slf-ans.is-empty{font:600 14px/2.2 'Inter',sans-serif;color:var(--s-mut);font-style:italic}
.slf-pts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:6px}
.slf-pt{min-height:48px;border-radius:14px;border:1px solid var(--s-border);background:var(--s-card);color:var(--s-ink);font:800 19px/1 'Space Grotesk',sans-serif;cursor:pointer;transition:transform .14s cubic-bezier(.23,1,.32,1),background-color .18s}
.slf-pt:active{transform:scale(.95)}
.slf-pt[aria-checked="true"]{background:var(--s-acc);border-color:transparent;color:var(--s-onacc)}
.slf-pt.z[aria-checked="true"]{background:var(--s-zero);color:#fff}
.slf-sum{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:12px 16px 6px 34px}
.slf-sum b{font:800 28px/1 'Space Grotesk',sans-serif;font-variant-numeric:tabular-nums}
.slf-sum span{font:700 13px 'Inter',sans-serif;color:var(--s-mut)}

/* Tabelle aller Runden */
.slf-tw{overflow-x:auto;overscroll-behavior-x:contain;border-radius:14px;-webkit-overflow-scrolling:touch}
.slf-table{border-collapse:separate;border-spacing:0;width:100%;font:700 15px/1.2 'Space Grotesk','Inter',sans-serif;font-variant-numeric:tabular-nums}
.slf-table th,.slf-table td{padding:7px 4px;text-align:center;border-bottom:1px solid var(--s-line);white-space:nowrap}
.slf-table .th{writing-mode:vertical-rl;transform:rotate(180deg);height:96px;max-height:96px;overflow:hidden;text-overflow:ellipsis;font:600 12px 'Inter',sans-serif;color:var(--s-mut);padding:6px 2px;margin:0 auto}
.slf-table th.l,.slf-table td.l{position:sticky;left:0;background:var(--s-card);text-align:left;font-weight:800;color:var(--s-acct);z-index:1}
.slf-table th.s,.slf-table td.s{position:sticky;right:0;background:var(--s-card);font-weight:800;color:var(--s-ink);box-shadow:-8px 0 8px -8px rgba(0,0,0,.4)}
.slf-table tfoot td{border-bottom:none;font-weight:800;border-top:2px solid var(--s-line)}
.slf-table td.z{color:var(--s-mut);font-weight:600}

/* Sheets */
.slf-ov{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;animation:slfFade .18s ease-out}
.slf-box{width:100%;max-width:460px;box-sizing:border-box;max-height:min(88vh,100dvh - 12px);overflow-y:auto;overscroll-behavior:contain;background:var(--s-card);color:var(--s-ink);border-radius:26px 26px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 34px rgba(0,0,0,.35);animation:slfRise .26s cubic-bezier(.23,1,.32,1)}
@keyframes slfFade{from{opacity:0}to{opacity:1}}
@keyframes slfRise{from{transform:translateY(24px);opacity:.4}to{transform:none;opacity:1}}
.slf-boxh{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.slf-boxh h2{margin:0;font:400 22px/1.15 'Bowlby One',sans-serif;color:var(--s-ink);min-width:0;overflow-wrap:break-word}
.slf-x{flex-shrink:0;width:44px;height:44px;margin:-6px -8px -6px 0;border:none;background:transparent;color:var(--s-mut);display:inline-flex;align-items:center;justify-content:center;border-radius:50%;cursor:pointer}
.slf-lgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:6px}
.slf-lb{min-height:48px;border-radius:14px;border:1px solid var(--s-border);background:var(--s-paper);color:var(--s-ink);font:800 20px/1 'Space Grotesk',sans-serif;cursor:pointer;transition:transform .14s cubic-bezier(.23,1,.32,1)}
.slf-lb:active{transform:scale(.94)}
.slf-lb.is-used{color:var(--s-mut);text-decoration:line-through;text-decoration-thickness:2px;opacity:.7}
.slf-lb[aria-pressed="true"]{background:var(--s-acc);border-color:transparent;color:var(--s-onacc);opacity:1}
.slf-code{display:block;text-align:center;margin:6px 0 2px;font:800 clamp(26px,9vw,36px)/1.15 'Space Grotesk',sans-serif;letter-spacing:.06em;color:var(--s-ink);-webkit-user-select:all;user-select:all;overflow-wrap:anywhere}
.slf-qr{display:block;width:min(220px,62vw);height:auto;margin:14px auto 6px;border-radius:14px;background:#fff;padding:0}
.slf-rowin{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.slf-rowin .nm{flex:1 1 55%}
.slf-rowin .pt{flex:0 0 92px;text-align:center}
.slf-rowin .x{flex:0 0 44px;width:44px;height:44px;border:none;background:transparent;color:var(--s-mut);display:inline-flex;align-items:center;justify-content:center;border-radius:50%;cursor:pointer}
.slf-btns{display:flex;flex-direction:column;gap:8px;margin-top:14px}

.slf-big{display:flex;align-items:baseline;gap:10px;padding:16px;flex-wrap:wrap}
.slf-big .v{font:400 54px/1 'Bowlby One',sans-serif;color:var(--s-acct)}
.slf-big .l{font:700 15px 'Inter',sans-serif;color:var(--s-mut)}
.slf-facts{display:flex;gap:10px;flex-wrap:wrap;padding:0 16px 16px}
.slf-fact{flex:1 1 120px;border-radius:14px;border:1px solid var(--s-line);padding:10px 12px;min-width:0}
.slf-fact b{display:block;font:800 20px 'Space Grotesk',sans-serif}
.slf-fact span{font:600 12.5px 'Inter',sans-serif;color:var(--s-mut)}


/* Karteikarten (Spielseite, alle Modi) */
.slf-toprow{padding:0 2px;margin-top:4px}
.slf-toprow .slf-round{font-size:22px;flex:none;white-space:nowrap}
.slf-toprow .slf-hint{flex:1;min-width:0}
.slf-toprow:has(.slf-hint) .slf-round{font-size:19px}
.slf-pkrow{display:flex;align-items:center;gap:12px}
.slf-alpha{display:flex;gap:8px;align-items:stretch;margin-top:14px}
.slf-alpha .slf-strip{flex:1;min-width:0}
.slf-lettbtn{flex:0 0 52px;min-height:52px;border:none;border-radius:14px;background:linear-gradient(150deg,var(--s-tile1),var(--s-tile2));color:var(--s-ontile);font:400 22px/1 'Bowlby One',sans-serif;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:2px;box-shadow:0 4px 0 -1px var(--s-tshadow);transition:transform .14s cubic-bezier(.23,1,.32,1)}
.slf-lettbtn:active{transform:translateY(2px)}
.slf-lettbtn svg{display:block}
.slf-lettbtn.is-unknown{font-size:18px}
.slf-cards{list-style:none;margin:20px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;position:relative}
.slf-card2{position:relative;min-width:0;min-height:76px;box-sizing:border-box;padding:10px 12px 6px;border-radius:16px;background:var(--s-paper);border:1px solid var(--s-border);box-shadow:0 8px 18px -14px rgba(0,0,0,.6);scroll-margin-bottom:120px;scroll-margin-top:90px}
.slf-card2 .slf-lab{display:block;padding-right:22px;font:800 11px/1.25 'Inter',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--s-mut);overflow-wrap:anywhere}
.slf-chk{position:absolute;top:8px;right:10px;font:800 14px/1 'Inter',sans-serif;color:var(--s-acct)}
.slf-card2 .slf-in{min-height:44px;padding:4px 0 2px;font-size:20px;border-bottom:2px dashed var(--s-line)}
.slf-card2.is-off .slf-in{border-bottom:2px dashed var(--s-off);padding-right:50px}
.slf-card2 .slf-off{right:8px;bottom:8px}
.slf-card2.is-locked .slf-in{caret-color:transparent}
.slf-card2 .slf-in:focus{border-bottom-style:solid}
.slf-stampbar{display:flex;justify-content:flex-end;padding:0;margin:4px 4px -6px;position:relative;z-index:2}
.gtL-content .slf-cards{grid-template-columns:repeat(3,minmax(0,1fr))}
@media (max-width:359px){.slf-card2 .slf-lab{font-size:10.5px;letter-spacing:.06em}.slf-card2 .slf-in{font-size:18px}.slf-cards{gap:10px}}

/* kurze Bildschirme (Tastatur offen): Kopf und Buchstabe kompakter */
@media (max-height:520px){.slf-letter{width:84px;height:84px;border-radius:22px;font-size:60px}.slf-letter.is-unknown{font-size:40px}.slf-letter .pen{width:24px;height:24px;right:5px;bottom:5px}.slf-round{font-size:19px}.slf-hint{display:none}.slf-stop{min-height:56px;font-size:24px}}
@media (min-width:560px){.slf-strip{grid-template-columns:repeat(26,minmax(0,1fr))}}

/* Laptop: zwei Spalten, Blatt links, Tabelle rechts */
.gtL-content .slf-wrap{max-width:none!important}
.gtL-content .slf-letter{width:112px;height:112px;font-size:80px}
.gtL-content .slf-root .gt-u-dock{position:sticky;bottom:12px;margin-top:16px}
/* Laptop: grössere Schrift, Gruppen-Chips umbrechen statt abgeschnitten (Handy unverändert) */
.gtL-content .slf-root .slf-groups{flex-wrap:wrap;overflow:visible;scroll-snap-type:none;margin:0;padding:2px 0 6px}
.gtL-content .slf-root .slf-chip{min-height:48px;font-size:16px;padding:8px 18px}
.gtL-content .slf-root .slf-groups .slf-chip .n{font-size:14px;min-width:24px;height:24px}
.gtL-content .slf-root .slf-h{font-size:16px}
.gtL-content .slf-root .slf-hint{font-size:15.5px}
.gtL-content .slf-root .slf-status{font-size:15px}
.gtL-content .slf-root .slf-ghost{font-size:16px;min-height:48px}
.gtL-content .slf-root .slf-btn{font-size:20px;min-height:62px}
.gtL-content .slf-root .slf-card{padding:18px}
.gtL-content .slf-root .slf-lab{font-size:14px}
.gtL-content .slf-root .slf-in{font-size:27px;min-height:56px}
.gtL-content .slf-root .slf-card2{min-height:92px;padding:12px 16px 8px}
.gtL-content .slf-root .slf-card2 .slf-lab{font-size:13px}
.gtL-content .slf-root .slf-card2 .slf-in{font-size:26px;min-height:52px}
.gtL-content .slf-root .slf-mini-head b{font-size:26px}
.gtL-content .slf-root .slf-mini-head span{font-size:16px}
.gtL-content .slf-root .slf-mini-list{grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.gtL-content .slf-root .slf-mini-list li{min-height:52px}
.gtL-content .slf-root .slf-mini-list .nm{font-size:22px}
.gtL-content .slf-root .slf-round{font-size:30px}
.gtL-content .slf-root .slf-table{font-size:17px}
.gtL-content .slf-root .slf-table .th{font-size:14px}
.gtL-content .slf-root .slf-big .v{font-size:64px}
.gtL-content .slf-root .slf-big .l{font-size:17px}
.gtL-content .slf-root .slf-fact b{font-size:24px}
.gtL-content .slf-root .slf-fact span{font-size:15px}
.gtL-content .slf-root .slf-code{font-size:42px}
.gtL-content .slf-root .slf-qr{width:260px}
.gtL-content .slf-root .slm-body{gap:16px}
.gtL-content .slf-root .slm-hero{padding:16px 20px;gap:18px;border-radius:28px}
.gtL-content .slf-root .slm-ring,.slm-ringbox{width:76px;height:76px}
.gtL-content .slf-root .slm-ringbox svg{width:76px;height:76px}
.gtL-content .slf-root .slm-let{font-size:32px}
.gtL-content .slf-root .slm-tx .slf-round{font-size:26px}
.gtL-content .slf-root .slm-tx span{font-size:15px}
.gtL-content .slf-root .slm-cnt b{font-size:28px}
.gtL-content .slf-root .slm-cnt span{font-size:15px}
.gtL-content .slf-root .slm-az{display:grid;grid-template-columns:repeat(26,minmax(0,1fr));gap:3px;overflow:visible}
.gtL-content .slf-root .slm-az span{flex:none;width:auto;height:40px;font-size:16px;border-radius:10px}
.gtL-content .slf-root .slm-row{min-height:62px;padding:0 20px;gap:14px}
.gtL-content .slf-root .slm-lab{width:110px;font-size:13px}
.gtL-content .slf-root .slm-row .slf-in{min-height:60px;height:60px;font-size:27px}
.gtL-content .slf-root .slm-ok{width:28px;height:28px;font-size:15px}
.gtL-content .slf-root .slm-off{font-size:14px;padding:4px 7px}
.gtL-content .slf-root .slm-legend{font-size:15px}
.gtL-content .slf-root .slm-legend b{font-size:16px}
.gtL-content .slf-root .slm-row.is-score{min-height:76px;padding:10px 18px}
.gtL-content .slf-root .slm-ans{font-size:24px}
.gtL-content .slf-root .slm-ans.is-empty{font-size:16px}
.gtL-content .slf-root .slm-chips{gap:6px}
.gtL-content .slf-root .slm-chips .slf-pt{min-height:52px;width:52px;font-size:19px}
.gtL-content .slf-root .slm-sum{padding:16px 24px}
.gtL-content .slf-root .slm-sum span{font-size:15px}
.gtL-content .slf-root .slm-sum b{font-size:34px}
.gtL-content .slf-root .slf-stop{min-height:76px;font-size:32px}
.gtL-content .slf-root .slf-stamp{font-size:30px}
.gtL-content .slf-root .slm-stampbar .slf-stamp{font-size:22px}
.gtL-content .slf-root .slf-strip span{font-size:15px}
@media (prefers-reduced-motion:reduce){.slf-letter .ch,.slf-stamp,.slf-ov,.slf-box{animation:none}.slf-btn,.slf-ghost,.slf-chip,.slf-pt,.slf-stop,.slf-lb,.slf-letter{transition:none}}
[data-phone-landscape] .slf-top{gap:12px}
[data-phone-landscape] .slf-letter{width:84px;height:84px;border-radius:22px;font-size:58px}
[data-phone-landscape] .slf-letter.is-unknown{font-size:38px}
[data-phone-landscape] .slf-box{max-height:calc(var(--pl-vh) - 8px)}

/* ===== Entwurf M2 Liste (Spielphase) ===== */
.slf-root{--m-hero:#EEEAFF;--m-ht:#14172A;--m-hm:#5B5F80;--m-ring:#6A4BE0;--m-track:#D6CEFF;--m-stopc:#E5484D;--m-azc:#EEEAFF;--m-azt:#14172A;--m-chip:#EEEAFF;--m-chipt:#4A2FC0;--m-ok:#3FD49A;--m-sum:#EEEAFF;--m-sumt:#14172A;--m-summ:#5B5F80;--m-list:var(--s-card);--m-line:var(--s-border);--m-focus:rgba(139,108,255,.16);--m-focusb:#8B6CFF;--m-ring-w:0}
.slf-th-light{--m-hero:#1E1A15;--m-ht:#F6F1E7;--m-hm:#D6CDBB;--m-ring:#B9A6FF;--m-track:rgba(255,255,255,.22);--m-stopc:#FF6B6B;--m-azc:#5B3FD6;--m-azt:#FFFFFF;--m-chip:#5B3FD6;--m-chipt:#FFFFFF;--m-ok:#1F8A5B;--m-sum:#1E1A15;--m-sumt:#F6F1E7;--m-summ:#D6CDBB;--m-list:#FFFCF6;--m-line:rgba(60,48,30,.2);--m-focus:rgba(91,63,214,.09);--m-focusb:#5B3FD6}
.slf-th-noir{--m-hero:#EBEBEB;--m-ht:#000;--m-hm:#3A3A3A;--m-ring:#000;--m-track:#B5B5B5;--m-stopc:#000;--m-azc:#EBEBEB;--m-azt:#000;--m-chip:#EBEBEB;--m-chipt:#000;--m-ok:#EBEBEB;--m-sum:#EBEBEB;--m-sumt:#000;--m-summ:#3A3A3A;--m-list:#1A1A1A;--m-line:#5F5F5F;--m-focus:#2A2A2A;--m-focusb:#EBEBEB}
.slm-body{gap:12px}
.slm-hero{position:relative;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:24px;background:var(--m-hero);color:var(--m-ht);border:1px solid var(--s-border)}
.slm-ring{flex:none;width:56px;height:56px;padding:0;border:0;background:none;color:inherit;cursor:pointer;border-radius:50%;display:grid;place-items:center}
.slm-ring .gt-tring-track{stroke:var(--m-track)!important}
.slm-ringbox{position:relative;width:56px;height:56px;display:grid;place-items:center}
.slm-ringbox svg{position:absolute;inset:0;width:56px;height:56px;transform:rotate(-90deg)}
.slm-ringbox circle{stroke:var(--m-ring)}
.slm-hero.is-stop .slm-ringbox circle{stroke:var(--m-stopc)}
.slm-hero.is-stop .gt-tring-bar{stroke:var(--m-stopc)!important}
.slm-let{font:800 24px/1 'Space Grotesk',sans-serif;color:var(--m-ht)}
.slm-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.slm-tx .slf-round{font:400 17px/1.15 'Bowlby One',sans-serif;color:var(--m-ht);white-space:nowrap}
.slm-tx span{font:600 12px/1.3 'Inter',sans-serif;color:var(--m-hm);overflow-wrap:anywhere}
.slm-hero.is-stop .slm-tx span{color:var(--m-ht);font-weight:700}
.slm-cnt{flex:none;text-align:right;min-width:40px}
.slm-cnt b{display:block;font:800 21px/1 'Space Grotesk',sans-serif;font-variant-numeric:tabular-nums;color:var(--m-ht)}
.slm-cnt span{font:700 12px/1.4 'Inter',sans-serif;color:var(--m-hm)}
.slm-stampbar{position:absolute;top:-13px;right:16px;z-index:2;pointer-events:none}
.slm-stampbar .slf-stamp{font-size:17px;padding:3px 10px 2px;border-width:2.5px;border-radius:9px;background:var(--s-card)}
.slm-az{display:flex;gap:4px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-ms-overflow-style:none;padding:2px 0;-webkit-overflow-scrolling:touch}
.slm-az::-webkit-scrollbar{display:none}
.slm-az span{flex:none;width:26px;height:30px;border-radius:9px;display:grid;place-items:center;font:700 13px 'Space Grotesk',sans-serif;color:var(--s-ink);background:var(--s-card)}
.slm-az span.is-used{color:var(--s-mut);opacity:.55;text-decoration:line-through;text-decoration-thickness:2px;background:transparent}
.slm-az span.is-cur{background:var(--m-azc);color:var(--m-azt);opacity:1;text-decoration:none}
.slm-list{list-style:none;margin:0;padding:0;border-radius:22px;background:var(--m-list);border:1px solid var(--m-line);overflow:hidden}
.slm-row{display:flex;align-items:center;gap:10px;padding:0 14px;min-height:52px;border-top:1px solid var(--m-line);position:relative;scroll-margin-bottom:120px}
.slm-row:first-child{border-top:0}
.slm-row:focus-within{background:var(--m-focus);box-shadow:inset 3px 0 0 var(--m-focusb)}
.slm-lab{flex:none;width:68px;font:700 10.5px/1.25 'Inter',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--s-mut);overflow-wrap:anywhere}
.slm-row .slf-in{flex:1;min-width:0;width:auto;min-height:48px;height:48px;padding:0 2px;border:0;font:700 20px/1.2 'Kalam','Inter',cursive}
.slm-row .slf-in:focus,.slm-row .slf-in:focus-visible{border:0;margin:0;outline:none}
.slm-row.is-off .slf-in{text-decoration:underline dashed var(--s-off);text-underline-offset:4px}
.slm-off{position:static;flex:none;pointer-events:none;font-size:11px;padding:3px 5px}
.slm-ok{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:800 12px/1 'Inter',sans-serif;color:var(--m-ok);background:color-mix(in srgb,var(--m-ok) 18%,transparent)}
.slm-sh{margin:0 2px}
.slm-legend{display:flex;flex-wrap:wrap;gap:4px 12px;margin:0 2px;font:600 11.5px/1.3 'Inter',sans-serif;color:var(--s-mut)}
.slm-legend b{font:800 13px 'Space Grotesk',sans-serif;color:var(--s-ink);margin-right:4px}
.slm-row.is-score{padding:8px 12px 8px 14px;gap:8px;min-height:60px}
.slm-w{flex:1;min-width:0}
.slm-w .slm-lab{display:block;width:auto}
.slm-ans{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:1px;font:700 18px/1.25 'Kalam','Inter',cursive;color:var(--s-hand);overflow-wrap:anywhere}
.slm-ans.is-empty{font:600 13px/1.4 'Inter',sans-serif;color:var(--s-mut);font-style:italic}
.slm-chips{flex:none;display:flex;gap:4px}
.slm-chips .slf-pt{min-height:44px;width:36px;padding:0;border-radius:11px;font-size:15px}
.slm-chips .slf-pt[aria-checked="true"]{background:var(--m-chip);color:var(--m-chipt)}
.slm-chips .slf-pt.z[aria-checked="true"]{background:var(--s-zero);color:#fff}
.slf-th-light .slm-chips .slf-pt.z[aria-checked="true"]{background:#6B6358}
.slf-th-noir .slm-chips .slf-pt.z[aria-checked="true"]{background:#5F5F5F}
.slm-sum{display:flex;justify-content:space-between;align-items:center;gap:12px;border-radius:20px;padding:12px 18px;background:var(--m-sum);color:var(--m-sumt)}
.slm-sum div{display:flex;flex-direction:column;gap:2px}
.slm-sum .r{text-align:right}
.slm-sum span{font:700 12px 'Inter',sans-serif;color:var(--m-summ)}
.slm-sum b{font:800 26px/1 'Space Grotesk',sans-serif;font-variant-numeric:tabular-nums}
@media (max-width:359px){.slm-hero{padding:10px;gap:9px}.slm-lab{width:58px;font-size:10px}.slm-row{padding:0 10px;gap:8px}.slm-row .slf-in{font-size:18px}.slm-chips .slf-pt{width:32px;font-size:14px}.slm-chips{gap:3px}.slm-row.is-score{padding:8px 8px 8px 10px}}
@media (prefers-reduced-motion:reduce){.slm-row{transition:none}}
/* Hell «Schwarz auf Creme» (16.11.2026) */
html[data-gt-theme="light"]:not([data-gt-skin]) .slf-th-light{--m-ring:#F6F1E7;--m-track:rgba(255,255,255,.22);--m-stopc:#F6F1E7;--m-azc:#1E1A15;--m-azt:#F6F1E7;--m-chip:#1E1A15;--m-chipt:#F6F1E7;--m-ok:#1E1A15;--m-focus:rgba(30,26,21,.08);--m-focusb:#1E1A15}
`;

const SLF_PK_CSS = `
/* ===== Modus Plakat (nur unter .slf-pk) ===== */
.slf-pk{--pkf:'Bagel Fat One','Bowlby One',sans-serif;--pki:#1A1716;--pkc:#F3EAD3;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E\") 0 0/180px 180px,#E4312B!important;background-blend-mode:multiply}
.slf-pk .slf-root,.slf-pk{--pk-bg:#E4312B;color:#1A1716}
.slf-pk .gt-wm{font-size:clamp(20px,6.2vw,32px)!important;white-space:nowrap!important;color:#F3EAD3!important}
.slf-pk h1:not(.gt-wm){font-family:var(--pkf)!important;font-weight:400!important;font-size:clamp(21px,6.6vw,30px)!important;line-height:1.05!important;letter-spacing:0!important;color:#F3EAD3!important;-webkit-text-stroke:.07em #1A1716;paint-order:stroke fill;text-shadow:.05em .065em 0 #1A1716;white-space:nowrap;overflow-wrap:normal!important}
.slf-pk .slf-h{font:400 15px/1.2 var(--pkf);color:#1A1716;letter-spacing:.04em}
.slf-pk .slf-round{font-family:'Bagel Fat One',sans-serif;color:#1A1716}
.slf-pk .slf-hint,.slf-pk .slf-status{color:#1A1716;font-weight:600}
.slf-pk .slf-status.ok{color:#1A1716}
.slf-pk .slf-status.bad{color:#1A1716;background:#F3EAD3;outline:2px solid #1A1716;outline-offset:-2px;border-radius:10px;padding:4px 8px}
.slf-pk .slf-card,.slf-pk .slf-banner{outline:2.5px solid #1A1716;outline-offset:-2.5px;box-shadow:0 4px 0 #1A1716;background:#F3EAD3}
.slf-pk .slf-paper{outline:2.5px solid #1A1716;outline-offset:-2.5px;box-shadow:0 5px 0 #1A1716;background:#F3EAD3;border-radius:20px;overflow:visible}
.slf-pk .slf-paper::before{display:none}
.slf-pk .slf-stampwrap{filter:drop-shadow(2.5px 0 0 #1A1716) drop-shadow(-2.5px 0 0 #1A1716) drop-shadow(0 -2.5px 0 #1A1716) drop-shadow(0 6px 0 #1A1716)}
.slf-pk .slf-stampwrap .slf-paper{border:none;box-shadow:none;border-radius:6px;padding:8px 0}
.slf-pk .slf-mini-wrap::after,.slf-pk .slf-sheet::after{display:none}
.slf-pk .slf-mini-head{padding:12px 16px 4px}
.slf-pk .slf-mini-head b{font:400 22px/1.1 var(--pkf);color:#1A1716}
.slf-pk .slf-mini-head span{color:#1A1716}
.slf-pk .slf-mini-list li{padding-left:14px;border-bottom:1.5px solid rgba(20,20,20,.3)}
.slf-pk .slf-mini-list .nm{font:400 16px/1.2 var(--pkf);color:#1A1716}
.slf-pk .slf-mini-list .x{color:#1A1716}
.slf-pk .slf-empty{padding-left:16px;color:#1A1716}
.slf-pk .slf-mini-actions{padding-left:14px}
.slf-pk .slf-ghost{outline:2.5px solid #1A1716;outline-offset:-2.5px;background:#F3EAD3;color:#1A1716;box-shadow:0 3px 0 #1A1716;font:400 15px/1.2 var(--pkf);letter-spacing:.02em}
.slf-pk .slf-ghost:active{transform:translateY(2px);box-shadow:0 1px 0 #1A1716}
.slf-pk .slf-ghost[disabled]{opacity:.5;box-shadow:0 3px 0 #1A1716}
.slf-pk .slf-btn{position:relative;overflow:hidden;outline:2.5px solid #1A1716;outline-offset:-2.5px;background:#1A1716;color:#F3EAD3;box-shadow:0 6px 0 #1A1716;font:400 20px/1.2 var(--pkf);letter-spacing:.02em;border-radius:20px}
.slf-pk .slf-btn:active{transform:translateY(3px);box-shadow:0 3px 0 #1A1716}
.slf-pk .slf-btn[disabled]{opacity:.55;box-shadow:0 6px 0 #1A1716}
.slf-pk .slf-chip{outline:2.5px solid #1A1716;outline-offset:-2.5px;background:#F3EAD3;color:#1A1716;font:400 15px/1.2 var(--pkf);box-shadow:0 2px 0 #1A1716}
.slf-pk .slf-chip[aria-pressed="true"]{background:#1A1716;color:#F3EAD3;border-color:#1A1716}
.slf-pk .slf-groups .slf-chip .n{background:#1A1716;color:#F3EAD3;font-family:var(--pkf);font-weight:400}
.slf-pk .slf-groups .slf-chip[aria-pressed="true"] .n{background:#F3EAD3;color:#1A1716}
.slf-pk .slf-input{outline:2.5px solid #1A1716;outline-offset:-2.5px;background:#F3EAD3;border-radius:14px;color:#1A1716}
.slf-pk .slf-input:focus{border-color:#1A1716;box-shadow:0 3px 0 #1A1716}
.slf-pk .slf-groups{padding-bottom:8px}
.slf-pk .slf-chips{gap:10px 8px}
/* Spielseite */
.slf-pk .slf-pkrow{display:flex;align-items:center;gap:12px;padding:0 2px;margin-top:10px}
.slf-pk .slf-alpha{display:flex;gap:8px;align-items:stretch}
.slf-pk .slf-strip{flex:1;min-width:0;background:#1A1716;outline:2.5px solid #1A1716;outline-offset:-2.5px;box-shadow:0 4px 0 #1A1716;border-radius:14px;padding:6px 4px}
.slf-pk .slf-strip span{font:400 14px/26px var(--pkf);color:#F3EAD3}
.slf-pk .slf-strip span.is-used{color:#F3EAD3;opacity:.38;text-decoration-thickness:2px}
.slf-pk .slf-strip span.is-cur{background:#1A1716;color:#F3EAD3;box-shadow:0 0 0 1.5px #F3EAD3}
.slf-pk .slf-lettbtn{flex:0 0 52px;min-height:52px;outline:2.5px solid #1A1716;outline-offset:-2.5px;border-radius:14px;background:#1A1716;color:#F3EAD3;box-shadow:0 4px 0 #1A1716;font:400 24px/1 var(--pkf);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:2px;transition:transform .14s cubic-bezier(.23,1,.32,1),box-shadow .14s}
.slf-pk .slf-lettbtn:active{transform:translateY(2px);box-shadow:0 2px 0 #1A1716}
.slf-pk .slf-lettbtn svg{display:block}
.slf-pk .slf-lettbtn.is-unknown{font-size:18px}
.slf-pk .slf-row{padding:12px 14px 4px 16px}
.slf-pk .slf-lab{font:400 17px/1.2 var(--pkf);color:#1A1716;letter-spacing:.01em}
.slf-pk .slf-in{min-height:58px;padding-top:10px;border-bottom:2.5px solid #1A1716;font-size:25px;color:#1A1716}
.slf-pk .slf-in:focus{border-bottom-color:#1A1716}
.slf-pk .slf-row.is-off .slf-in{border-bottom:2.5px dashed #E4312B}
.slf-pk .slf-off{color:#E4312B;border:2px solid #E4312B;background:#F3EAD3;font-family:var(--pkf);font-weight:400}
.slf-pk .slf-stamp{border:3px solid #1A1716;color:#1A1716;background:#F3EAD3;font-family:var(--pkf)}
.slf-pk .slf-stop{position:relative;overflow:hidden;outline:2.5px solid #1A1716;outline-offset:-2.5px;background:#1A1716;color:#F3EAD3;box-shadow:0 6px 0 #1A1716;font:400 28px/1 var(--pkf);letter-spacing:.03em;border-radius:22px}
.slf-pk .slf-stop:active{transform:translateY(3px);box-shadow:0 3px 0 #1A1716}
.slf-pk .slf-stop svg path:first-child{fill:rgba(20,20,20,.25)}
.slf-pk .slf-btn::after,.slf-pk .slf-stop::after{content:"";position:absolute;top:0;bottom:0;left:0;width:35%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);animation:pk-shine 3.2s ease-in-out infinite;pointer-events:none}
/* Karteikarten Ryu */
.slf-pk .slf-alpha{margin-top:18px}
.slf-pk .slf-cards{margin-top:26px;gap:26px 20px;padding:6px 6px 10px}
.slf-pk .slf-card2{background:#F3EAD3;border:none;border-radius:16px;box-shadow:0 0 0 4px #1A1716,6px 7px 0 4px #1A1716;transform:rotate(-1.5deg)}
.slf-pk .slf-card2:nth-child(6n+2){transform:rotate(1deg)}
.slf-pk .slf-card2:nth-child(6n+3){transform:rotate(-.6deg)}
.slf-pk .slf-card2:nth-child(6n+4){transform:rotate(1.4deg)}
.slf-pk .slf-card2:nth-child(6n+5){transform:rotate(-1deg)}
.slf-pk .slf-card2:nth-child(6n+6){transform:rotate(.8deg)}
.slf-pk .slf-card2 .slf-lab{font:400 12px/1.25 var(--pkf);color:#1A1716;letter-spacing:.08em}
.slf-pk .slf-chk{color:#E4312B;font-family:var(--pkf);font-weight:400;font-size:17px}
.slf-pk .slf-card2 .slf-in{font:400 22px/1.25 var(--pkf);color:#1A1716;border-bottom:2.5px dashed #1A1716}
.slf-pk .slf-card2 .slf-in:focus{border-bottom-color:#E4312B}
.slf-pk .slf-card2.is-off .slf-in{border-bottom:2.5px dashed #E4312B}
.slf-pk .slf-card2 .slf-off{color:#E4312B;border-color:#E4312B;background:#F3EAD3}
.slf-pk .slf-stamp{border-color:#E4312B;color:#E4312B;background:#F3EAD3}
@media (max-width:359px){.slf-pk .slf-cards{gap:24px 16px}.slf-pk .slf-card2 .slf-in{font-size:19px}}
/* Punkte */
.slf-pk .slf-legend{color:#1A1716;font-weight:600}
.slf-pk .slf-legend b{font:400 15px var(--pkf);color:#1A1716}
.slf-pk .slf-srow{padding:12px 14px 12px 16px;border-bottom:1.5px solid rgba(20,20,20,.3)}
.slf-pk .slf-ans{color:#1A1716}
.slf-pk .slf-ans.is-empty{color:#1A1716;opacity:.7}
.slf-pk .slf-pt{outline:2.5px solid #1A1716;outline-offset:-2.5px;background:#F3EAD3;color:#1A1716;font:400 20px/1 var(--pkf);box-shadow:0 3px 0 #1A1716}
.slf-pk .slf-pt:active{transform:translateY(2px);box-shadow:0 1px 0 #1A1716}
.slf-pk .slf-pt[aria-checked="true"]{background:#1A1716;color:#F3EAD3;border-color:#1A1716}
.slf-pk .slf-pt.z[aria-checked="true"]{background:#1A1716;color:#F3EAD3}
.slf-pk .slf-sum{padding-left:16px}
.slf-pk .slf-sum b{font:400 30px/1 var(--pkf);color:#1A1716}
.slf-pk .slf-sum span{color:#1A1716}
/* Tabelle, Ende */
.slf-pk .slf-table{font-family:var(--pkf);font-weight:400}
.slf-pk .slf-table .th{color:#1A1716;font-family:'Inter',sans-serif}
.slf-pk .slf-table th,.slf-pk .slf-table td{border-bottom:1.5px solid rgba(20,20,20,.3)}
.slf-pk .slf-table th.l,.slf-pk .slf-table td.l{background:#F3EAD3}
.slf-pk .slf-table th.s,.slf-pk .slf-table td.s{background:#F3EAD3}
.slf-pk .slf-big .v{font-family:var(--pkf);color:#1A1716;font-size:60px}
.slf-pk .slf-big .l,.slf-pk .slf-fact span{color:#1A1716}
.slf-pk .slf-fact{outline:2px solid #1A1716;outline-offset:-2px;background:#F3EAD3}
.slf-pk .slf-fact b{font:400 20px var(--pkf)}
/* Sheets */
.slf-pk .slf-box {background:#F3EAD3;outline:2.5px solid #1A1716;outline-offset:-2.5px;border-bottom:none;box-shadow:0 -5px 0 #1A1716}
.slf-pk .slf-box .slf-boxh h2{font-family:var(--pkf)}
.slf-pk .slf-box .slf-lb{outline:2.5px solid #1A1716;outline-offset:-2.5px;background:#F3EAD3;font-family:var(--pkf);font-weight:400;box-shadow:0 3px 0 #1A1716}
.slf-pk .slf-box .slf-lb[aria-pressed="true"]{background:#1A1716;color:#F3EAD3}
.slf-pk .slf-box .slf-ghost{outline:2.5px solid #1A1716;outline-offset:-2.5px;background:#F3EAD3;color:#1A1716;box-shadow:0 3px 0 #1A1716;font:400 15px/1.2 var(--pkf)}
.slf-pk .slf-box .slf-btn{outline:2.5px solid #1A1716;outline-offset:-2.5px;background:#1A1716;color:#F3EAD3;box-shadow:0 5px 0 #1A1716;font:400 18px/1.2 var(--pkf)}
.slf-pk .slf-box .slf-input{outline:2.5px solid #1A1716;outline-offset:-2.5px}
.slf-pk .slf-box{--s-ink:#1A1716;--s-mut:#1A1716;--s-border:#1A1716;--s-card:#F3EAD3;--s-paper:#F3EAD3;--s-acc:#1A1716;--s-onacc:#F3EAD3}
/* ===== M2 Liste in Ryu ===== */
.slf-root.slf-pk{--m-hero:#1A1716;--m-ht:#F3EAD3;--m-hm:#F3EAD3;--m-ring:#F3EAD3;--m-track:rgba(243,234,211,.28);--m-stopc:#E4312B;--m-azc:#F3EAD3;--m-azt:#1A1716;--m-chip:#1A1716;--m-chipt:#F3EAD3;--m-ok:#1A1716;--m-sum:#1A1716;--m-sumt:#F3EAD3;--m-summ:#F3EAD3;--m-list:#F3EAD3;--m-line:#1A1716;--m-focus:transparent;--m-focusb:#E4312B}
.slf-pk .slm-hero{border:none;outline:2.5px solid #1A1716;outline-offset:-2.5px;box-shadow:0 4px 0 #1A1716}
.slf-pk .slm-let,.slf-pk .slm-cnt b,.slf-pk .slm-sum b{font-family:var(--pkf);font-weight:400;color:inherit}
.slf-pk .slm-tx .slf-round{font-family:var(--pkf);font-size:19px;color:#F3EAD3}
.slf-pk .slm-tx span,.slf-pk .slm-cnt span{color:#F3EAD3;font-weight:600}
.slf-pk .slm-stampbar .slf-stamp{border-color:#E4312B;color:#E4312B;background:#F3EAD3}
.slf-pk .slm-az{padding:6px 6px 8px}
.slf-pk .slm-az span{font:400 14px var(--pkf);color:#F3EAD3;background:#1A1716}
.slf-pk .slm-az span.is-used{color:#F3EAD3;opacity:.4;background:#1A1716;text-decoration:line-through}
.slf-pk .slm-az span.is-cur{background:#F3EAD3;color:#1A1716;opacity:1;text-decoration:none;box-shadow:0 0 0 2px #1A1716}
.slf-pk .slm-az{background:#1A1716;border-radius:14px;padding:6px;box-shadow:0 4px 0 #1A1716}
.slf-pk .slm-list{border:2.5px solid #1A1716;box-shadow:0 4px 0 #1A1716;background:#F3EAD3}
.slf-pk .slm-row{border-top:1.5px solid #1A1716}
.slf-pk .slm-row:first-child{border-top:0}
.slf-pk .slm-row:focus-within{box-shadow:inset 5px 0 0 #E4312B;background:transparent}
.slf-pk .slm-lab{font:400 12px/1.2 var(--pkf);color:#1A1716;letter-spacing:.05em}
.slf-pk .slm-row .slf-in{font:400 21px/1.2 var(--pkf);color:#1A1716}
.slf-pk .slm-row .slf-in,.slf-pk .slm-row .slf-in:focus{min-height:48px;height:48px;padding:0 2px;border:0}
.slf-pk .slm-ok{background:#1A1716;color:#F3EAD3;font-family:var(--pkf);font-weight:400}
.slf-pk .slm-off{color:#E4312B;border:2px solid #E4312B;background:#F3EAD3;font-family:var(--pkf);font-weight:400}
.slf-pk .slm-row.is-off .slf-in{text-decoration-color:#E4312B}
.slf-pk .slm-ans{font:400 19px/1.2 var(--pkf);color:#1A1716}
.slf-pk .slm-ans.is-empty{font:600 13px 'Inter',sans-serif;color:#1A1716;opacity:.7}
.slf-pk .slm-legend{color:#1A1716;font-weight:600}
.slf-pk .slm-legend b{font:400 15px var(--pkf);color:#1A1716}
.slf-pk .slm-chips .slf-pt{box-shadow:0 3px 0 #1A1716;font:400 17px/1 var(--pkf)}
.slf-pk .slm-chips .slf-pt[aria-checked="true"],.slf-pk .slm-chips .slf-pt.z[aria-checked="true"]{background:#1A1716;color:#F3EAD3}
.slf-pk .slm-sum{border:none;outline:2.5px solid #1A1716;outline-offset:-2.5px;box-shadow:0 4px 0 #1A1716}

@media (prefers-reduced-motion:reduce){.slf-pk .slf-btn::after,.slf-pk .slf-stop::after{animation:none;display:none}}
`;
export { slfTk, slfPkTk, slfVars, SLF_CSS, SLF_PK_CSS, SLF_FONTS };
