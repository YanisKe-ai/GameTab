// Stile der Laptop-Seitenleiste «Spielerbank» (web/src/app/rail.js). Gilt nur im Laptop-Modus.
// Farben als Variablen pro Modus: Nocturne (Standard), Hell, Noir, Ryū (html[data-gt-skin="plakat"]).
const RED = "#E4312B", INK = "#1A1716", CREAM = "#F3EAD3", PAPER = "#FFFDF7";
const FONT = "'Bagel Fat One','Bowlby One',sans-serif";
const R = "html[data-gt-skin=\"plakat\"]";

const GT_RAIL_CSS = `
.gtL-sidebar{--rl-w:92px;--rl-bg:#14161F;--rl-edge:rgba(255,255,255,.07);--rl-btn:#1D2130;--rl-btn-edge:rgba(255,255,255,.09);--rl-ink:#C6C9DA;--rl-hover:#262B3E;--rl-well:rgba(255,255,255,.04);--rl-on-bg:rgba(150,100,255,.17);--rl-on-edge:#D4B8FF;--rl-on-ink:#E9DDFF;--rl-glow:0 0 0 3px rgba(150,100,255,.18),0 0 18px rgba(150,100,255,.5);--rl-tip-bg:#262B3E;--rl-tip-ink:#F1ECFF;--rl-tip-edge:rgba(212,184,255,.35);--rl-focus:#F2D48F;
  width:var(--rl-w);flex:0 0 var(--rl-w);box-sizing:border-box;height:100%;display:flex;flex-direction:column;align-items:center;gap:10px;padding:12px 0 14px;background:var(--rl-bg);border-right:1px solid var(--rl-edge);position:relative;z-index:3;overflow:visible}
html[data-gt-theme="light"] .gtL-sidebar{--rl-bg:#F6F1E7;--rl-edge:#D9CCB2;--rl-btn:#FFFCF6;--rl-btn-edge:#DACDB3;--rl-ink:#4A443A;--rl-hover:#FFFFFF;--rl-well:rgba(23,19,15,.05);--rl-on-bg:#FFFCF6;--rl-on-edge:#82580E;--rl-on-ink:#82580E;--rl-glow:0 0 0 3px rgba(130,88,14,.16),0 2px 8px rgba(130,88,14,.18);--rl-tip-bg:#17130F;--rl-tip-ink:#FFFCF6;--rl-tip-edge:transparent;--rl-focus:#1B4FA0}
html[data-gt-theme="noir"] .gtL-sidebar{--rl-bg:#000;--rl-edge:#5F5F5F;--rl-btn:#000;--rl-btn-edge:#5F5F5F;--rl-ink:#EBEBEB;--rl-hover:#1A1A1A;--rl-well:#111;--rl-on-bg:#FFFFFF;--rl-on-edge:#FFFFFF;--rl-on-ink:#000;--rl-glow:none;--rl-tip-bg:#EBEBEB;--rl-tip-ink:#000;--rl-tip-edge:transparent;--rl-focus:#FFFFFF}
.gtL-side-brand{width:62px;height:62px;margin:10px 0 6px;overflow:hidden}
.gtL-side-brand .gt-hm-solo{flex:0 0 auto;background:var(--rl-ink)!important;transition:transform .2s ease}
html[data-gt-theme="noir"] .gtL-side-brand .gt-hm-solo{background:#FFFFFF!important}
@media (hover:hover) and (pointer:fine){.gtL-side-brand:hover .gt-hm-solo{transform:scale(1.08)}}
.gtL-rail-main{display:flex;flex-direction:column;align-items:center;gap:12px}
.gtL-rb{position:relative;box-sizing:border-box;flex:0 0 auto;width:56px;height:56px;padding:0;margin:0;border-radius:50%;border:1.5px solid var(--rl-btn-edge);background:var(--rl-btn);color:var(--rl-ink);display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .16s ease,box-shadow .18s ease,background-color .16s ease,border-color .16s ease,color .16s ease}
@media (hover:hover) and (pointer:fine){.gtL-rb:hover{background:var(--rl-hover);transform:translateY(-1px)}}
.gtL-rb:active{transform:scale(.94)}
.gtL-rb[aria-current="page"]{border-width:2px;border-color:var(--rl-on-edge);background:var(--rl-on-bg);color:var(--rl-on-ink);box-shadow:var(--rl-glow)}
.gtL-shell .gtL-sidebar :is(.gtL-rb,.gtL-side-brand):focus-visible{outline:2.5px solid var(--rl-focus)!important;outline-offset:3px!important}
.gtL-rail-run{flex:0 1 auto;min-height:0;width:68px;display:flex;flex-direction:column;border-radius:34px;background:var(--rl-well);margin-top:4px}
.gtL-rail-runlist{min-height:0;display:flex;flex-direction:column;align-items:center;gap:12px;padding:10px 0;overflow-y:auto;overflow-x:hidden;scrollbar-width:none}
.gtL-rail-runlist::-webkit-scrollbar{display:none}
.gtL-rail-runlist{-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 12px,#000 calc(100% - 12px),transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,#000 12px,#000 calc(100% - 12px),transparent 100%)}
.gtL-rail-gap{flex:1 1 0;min-height:4px}
.gtL-rb-run{width:50px;height:50px}
.gtL-rb-logo{display:flex;align-items:center;justify-content:center;width:50px;height:50px;transform:scale(1.15);pointer-events:none}
.gtL-rb-dot{position:absolute;top:-1px;right:-1px;width:13px;height:13px;border-radius:50%;background:var(--dot,#2FD9A8);box-shadow:0 0 0 2.5px var(--rl-bg);pointer-events:none}
.gtL-tip{position:fixed;top:0;left:0;z-index:80;transform:translate(-6px,-50%);opacity:0;pointer-events:none;white-space:nowrap;padding:8px 13px;border-radius:11px;font:600 14px/1.15 'Inter',sans-serif;background:var(--rl-tip-bg);color:var(--rl-tip-ink);border:1px solid var(--rl-tip-edge);box-shadow:0 6px 18px rgba(0,0,0,.28);transition:opacity .12s ease,transform .12s ease}
.gtL-tip[data-on]{opacity:1;transform:translate(0,-50%)}
.spieleblock-laptop-frame .gt-weis-ov{left:92px!important}
@media (prefers-reduced-motion:reduce){.gtL-rb,.gtL-tip,.gtL-side-brand .gt-hm-solo{transition:none}}
@media (pointer:coarse){.gtL-rb-run{width:50px;height:50px}}
@media (max-height:620px){.gtL-sidebar{gap:6px;padding-top:6px}.gtL-rail-main{gap:8px}.gtL-rb{width:50px;height:50px}.gtL-rb-run{width:46px;height:46px}.gtL-rb-logo{width:46px;height:46px}}

/* Noir: weisse Linien, aktiver Knopf weiss gefüllt */
html[data-gt-theme="noir"] .gtL-rb-dot{background:#FFFFFF}

/* Ryū: schwarze Leiste, Creme-Sticker, aktiver Knopf rot und leicht schräg. Nur Rot, Schwarz, Creme. */
${R} .gtL-sidebar{--rl-bg:${INK};--rl-edge:#000;--rl-btn:${CREAM};--rl-btn-edge:${INK};--rl-ink:${INK};--rl-hover:${PAPER};--rl-well:rgba(243,234,211,.09);--rl-on-bg:${RED};--rl-on-edge:${CREAM};--rl-on-ink:${CREAM};--rl-glow:0 4px 0 #000;--rl-tip-bg:${CREAM};--rl-tip-ink:${INK};--rl-tip-edge:${INK};--rl-focus:${CREAM};background:${INK}!important;border-right:2.5px solid #000!important;box-shadow:none!important}
${R} .gtL-rb{border:2.5px solid ${INK};box-shadow:0 4px 0 ${RED};transform:rotate(var(--rl-rot,0deg))}
${R} .gtL-side-brand{--rl-rot:-3deg}
${R} .gtL-rail-main .gtL-rb:nth-child(odd){--rl-rot:-2deg}
${R} .gtL-rail-main .gtL-rb:nth-child(even){--rl-rot:2deg}
${R} .gtL-rb:active{transform:translateY(3px) rotate(var(--rl-rot,0deg));box-shadow:0 1px 0 ${RED}}
@media (hover:hover) and (pointer:fine){${R} .gtL-rb:hover{transform:translateY(-2px) rotate(var(--rl-rot,0deg))}}
${R} .gtL-rb[aria-current="page"]{border:2.5px solid ${CREAM};box-shadow:0 4px 0 #000,0 0 0 2.5px ${RED};--rl-rot:-6deg}
${R} .gtL-rb-dot{background:${RED};box-shadow:0 0 0 2.5px ${CREAM}}
${R} .gtL-rb-run .gtL-rb-logo{background:transparent}
${R} .gtL-rb-run[aria-current="page"] .gtL-rb-dot{background:${CREAM};box-shadow:0 0 0 2.5px ${RED}}
${R} .gtL-tip{font-family:${FONT};font-weight:400;font-size:15px;border:2.5px solid ${INK};box-shadow:0 4px 0 #000}
`;

export { GT_RAIL_CSS };
