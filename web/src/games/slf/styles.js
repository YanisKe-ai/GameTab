// Stadt Land Fluss: Farben pro Theme (Nocturne, Hell, Noir) und das gesamte CSS. Alle Farben laufen ueber Variablen --s-*.
import { shellTokens } from "../../themes/tokens.js";

// Eigene Akzentfarbe: Tintenviolett (kommt sonst in keinem Spiel vor).
function slfTk(theme) {
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
@media (prefers-reduced-motion:reduce){.slf-letter .ch,.slf-stamp,.slf-ov,.slf-box{animation:none}.slf-btn,.slf-ghost,.slf-chip,.slf-pt,.slf-stop,.slf-lb,.slf-letter{transition:none}}
[data-phone-landscape] .slf-top{gap:12px}
[data-phone-landscape] .slf-letter{width:84px;height:84px;border-radius:22px;font-size:58px}
[data-phone-landscape] .slf-letter.is-unknown{font-size:38px}
[data-phone-landscape] .slf-box{max-height:calc(var(--pl-vh) - 8px)}
`;

const SLF_PK_CSS = `
/* ===== Modus Plakat (nur unter .slf-pk) ===== */
.slf-pk{--pkf:'Bagel Fat One','Bowlby One',sans-serif;--pki:#1A1716;--pkc:#F3EAD3;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E\") 0 0/180px 180px,#E4312B!important;background-blend-mode:multiply}
.slf-pk .slf-root,.slf-pk{--pk-bg:#E4312B;color:#1A1716}
.slf-pk .gt-wm{font-size:clamp(20px,6.2vw,32px)!important;white-space:nowrap!important;color:#F3EAD3!important}
.slf-pk h1:not(.gt-wm){font-family:var(--pkf)!important;font-weight:400!important;font-size:clamp(21px,6.6vw,30px)!important;line-height:1.05!important;letter-spacing:0!important;color:#F3EAD3!important;-webkit-text-stroke:.07em #1A1716;paint-order:stroke fill;text-shadow:.05em .065em 0 #1A1716;white-space:nowrap;overflow-wrap:normal!important}
.slf-pk .slf-h{font:400 15px/1.2 var(--pkf);color:#1A1716;letter-spacing:.04em}
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
@media (prefers-reduced-motion:reduce){.slf-pk .slf-btn::after,.slf-pk .slf-stop::after{animation:none;display:none}}
`;
export { slfTk, slfPkTk, slfVars, SLF_CSS, SLF_PK_CSS, SLF_FONTS };
