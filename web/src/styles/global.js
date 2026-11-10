// Erzeugt von tools/split.mjs aus index.html. Inhalt zwischen den gt-body-Markern ist 1:1 Originalcode.
/*@gt-body-begin*/const GLOBAL_STYLES=`
.gtL-gamecard-logo svg{width:40px !important;height:40px !important;}html{-webkit-tap-highlight-color:transparent;}html[data-gt-theme="noir"] .gt-wm,html[data-gt-theme="noir"] .f7-word,html[data-gt-theme="noir"] .sk-word{color:#EBEBEB !important;-webkit-text-stroke-color:#000000 !important;text-shadow:.037em .037em 0 #000000,.074em .074em 0 #777777,.093em .093em 0 #777777,.111em .111em 0 #000000 !important;}

:root { --gt-focus: #F2D48F; }
html[data-gt-theme="light"] { --gt-focus: #1B4FA0; }
html[data-gt-theme="noir"] { --gt-focus: #FFFFFF; }
:where(button, a[href], summary, [role="button"], [tabindex]:not([tabindex="-1"])):focus-visible { outline: 2px solid var(--gt-focus); outline-offset: 2px; }
:root { --gt-ease-out: cubic-bezier(.23,1,.32,1); --gt-ease-io: cubic-bezier(.77,0,.175,1); --gt-ease-spring: cubic-bezier(.34,1.3,.64,1); }
/* Motion-Tokens (eine Quelle): Dauer, Abstand, Skala. Nur transform und opacity animieren, nichts wartet auf das Ende. */
:root { --gt-dur-feedback: 90ms; --gt-dur-small: 160ms; --gt-dur-large: 240ms; --gt-dur-count: 300ms; --gt-dist-s: 4px; --gt-dist-m: 8px; --gt-dist-l: 16px; --gt-scale-press: .97; --gt-scale-enter: .95; }
@media (prefers-reduced-motion: reduce) { :root { --gt-dist-s: 0px; --gt-dist-m: 0px; --gt-dist-l: 0px; --gt-scale-press: 1; --gt-scale-enter: 1; --gt-dur-small: 120ms; --gt-dur-large: 160ms; --gt-dur-count: 1ms; } }
.gtL-col-side2, .gtL-e-c { display: contents; }
.gtL-e-only { display: none; }
.gtL-content .gtL-e-only { display: block; }
.gtL-content .gtL-page.gtL-game { max-width: 640px !important; margin-left: auto !important; margin-right: auto !important; }
.gtL-content .gtL-page.gtL-game > * { max-width: none; }
.gtL-content .gtL-page.gtL-game:has(.gtL-split) { max-width: 1440px !important; }
.gtL-content .gtL-e-block > .gtL-col-main, .gtL-content .gtL-e-block > .gtL-col-side, .gtL-content .gtL-e-block > .gtL-col-side2 { display: block; }
.gtL-content .gtL-col-side2 { display: flex; flex-direction: column; min-width: 0; grid-column: 2; grid-row: 2; }
.gtL-content .gtL-split:has(> .gtL-col-side2) { grid-template-rows: auto 1fr; }
.gtL-content .gtL-split:has(> .gtL-col-side2) > .gtL-col-main { grid-column: 1; grid-row: 1 / span 2; }
.gtL-content .gtL-split:has(> .gtL-col-side2) > .gtL-col-side { grid-column: 2; grid-row: 1; position: static; }
.gtL-content .gtL-split.gtL-e-fit { grid-template-columns: minmax(0, max-content) minmax(320px, 420px); justify-content: center; }
.gtL-content .gtL-e-board { max-width: min(460px, max(280px, calc(100dvh - 505px))) !important; }
@media (min-width: 1400px) and (min-height: 880px) {
  .gtL-content .gtL-e-board { max-width: min(460px, max(280px, calc(100dvh - 590px))) !important; }
}
@container gtl (max-width: 759px) {
  .gtL-content .gtL-split:has(> .gtL-col-side2) > * { grid-column: 1 !important; grid-row: auto !important; }
}
.gt-hit { position: relative; }
.gt-hit::before { content: ""; position: absolute; left: var(--gt-hit-x, 0px); right: var(--gt-hit-x, 0px); top: var(--gt-hit-y, -7px); bottom: var(--gt-hit-y, -7px); }
.gtL-toggle-btn { min-height: 44px; }
.gtL-only { display: none !important; }
.gtL-split, .gtL-col-main, .gtL-col-side { display: contents; }
@media (max-height: 700px) {
  .gtL-deco-bottom { display: none !important; }
}
@media (orientation: landscape) and (max-height: 500px) {
  .gtL-headsup-wrap { max-width: min(96vw, 780px) !important; }
  .gtL-headsup-play { flex-direction: row !important; align-items: stretch; gap: 10px !important; height: calc(100dvh - 74px); position: relative; margin-top: 30px; }
  .gtL-hu-land { display: flex; flex-direction: column; height: 100%; min-height: 0; }
  .gtL-hu-land .gtL-headsup-play { height: auto; flex: 1 1 auto; min-height: 0; }
  .gtL-hu-land .gtL-headsup-word { min-height: 0 !important; }
  .gtL-headsup-hud { position: absolute; top: -26px; left: 0; right: 0; z-index: 2; padding: 0 4px; }
  .gtL-headsup-word { flex: 1; min-height: unset !important; padding: 10px !important; }
  .gtL-headsup-word-text { font-size: min(16vw, 84px) !important; line-height: 1.05; }
  .gtL-headsup-actions { flex-direction: column !important; flex: none !important; width: 74px; gap: 6px !important; justify-content: center; }
  .gtL-headsup-actions button { flex: none !important; width: 100% !important; height: auto !important; padding: 7px 2px !important; font-size: 9px !important; border-radius: 12px !important; }
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes achPulse { 0% { transform: scale(0.85); opacity: 1; } 100% { transform: scale(1.35); opacity: 0; } }
.ach-pulse-ring { animation: achPulse 1.3s var(--gt-ease-out, cubic-bezier(.23,1,.32,1)) 3, gtFadeOnly 0.25s ease-out 3.9s backwards; }
@keyframes gtFadeOnly { from { opacity: 0; } }
@keyframes decoDrift { 0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); } 50% { transform: translateY(-8px) rotate(var(--r, 0deg)); } }
@keyframes gtBeamLight { 0% { opacity:0; } 3% { opacity:.9; } 6% { opacity:.18; } 9% { opacity:.85; } 12% { opacity:.3; } 16% { opacity:1; } 21% { opacity:.88; } 25% { opacity:1; } 74% { opacity:1; } 88% { opacity:.4; } 100% { opacity:0; } }
@keyframes gtBeamDim { 0% { opacity:0; animation-timing-function:cubic-bezier(.22,.8,.3,1); } 22% { opacity:1; } 72% { opacity:1; animation-timing-function:cubic-bezier(.4,0,.6,1); } 100% { opacity:0; } }
@keyframes gtBeamSoft { 0% { opacity:0; } 22% { opacity:1; } 72% { opacity:1; } 100% { opacity:0; } }
 14% { opacity:1; } 50% { transform:translate(var(--mx),var(--my)) scale(1.1); } 86% { opacity:1; } 100% { opacity:0; transform:translate(var(--ex),var(--ey)) scale(1.35); } }
@keyframes gtDust { 0% { opacity:0; transform:translate(0,0); } 30% { opacity:var(--o); } 100% { opacity:0; transform:translate(var(--dx),var(--dy)); } }
.gt-beam-a { animation:gtBeamLight 3s linear forwards; }
.gt-beam-d { animation:gtBeamDim 3s linear forwards; }
.gt-beam-bat { opacity:0; will-change:transform,opacity; }
.gt-beam-bat>* { position:absolute; display:block; will-change:transform; pointer-events:none; -webkit-user-drag:none; }
.gt-beam-dust { animation:gtDust 2.2s cubic-bezier(.3,.6,.4,1) both; }
@media (prefers-reduced-motion: reduce) { .gt-beam-a, .gt-beam-d { animation:gtBeamSoft 2.4s ease-in-out forwards; } .gt-beam-bat, .gt-beam-dust { display:none; } }


@keyframes headsupRotateHint { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(90deg); } }
.gtL-showcase-row { scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
.gtL-showcase-row::-webkit-scrollbar { display: none; height: 0; }
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] { -moz-appearance: textfield; }
* { box-sizing: border-box; }
.press-fx, .card-fx { transition: transform var(--gt-dur-large) var(--gt-ease-out, cubic-bezier(.23,1,.32,1)), box-shadow var(--gt-dur-small) ease, opacity var(--gt-dur-small) ease; -webkit-tap-highlight-color: transparent; }
.press-fx:active { transform: scale(var(--gt-scale-press)); opacity: 0.9; transition: transform var(--gt-dur-feedback) var(--gt-ease-out, cubic-bezier(.23,1,.32,1)), opacity var(--gt-dur-feedback) ease; }
.card-fx:active { transform: scale(0.98); transition: transform var(--gt-dur-feedback) var(--gt-ease-out, cubic-bezier(.23,1,.32,1)); }
.paper-grid {
  background-image:
    linear-gradient(rgba(120,120,140,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120,120,140,0.07) 1px, transparent 1px);
  background-size: 18px 18px;
}
@keyframes gtBlurFade { from { opacity: 0; transform: translateY(var(--gt-dist-m)); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
.gt-su-row { animation: gtBlurFade .4s cubic-bezier(.23,1,.32,1) both; }
@keyframes gtShimmerOnce { from { transform: translateX(-120%) skewX(-18deg); } to { transform: translateX(260%) skewX(-18deg); } }
.gt-su-btn:not(:disabled) { position: relative; overflow: hidden; }
.gt-su-btn:not(:disabled)::after { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 38%; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent); transform: translateX(-120%) skewX(-18deg); animation: gtShimmerOnce .9s cubic-bezier(.77,0,.175,1) .5s 1 both; }
@keyframes confetti-fall {
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(var(--spin)); opacity: 0.9; }
}
@keyframes firework-fly {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0.3); opacity: 0; }
}
@keyframes firework-flash {
  0% { transform: scale(0); opacity: 0.9; }
  40% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.4); opacity: 0; }
}
@keyframes chalk-draw {
  from { stroke-dashoffset: var(--len); opacity: 0; }
  to { stroke-dashoffset: 0; opacity: 0.92; }
}
@keyframes value-pop {
  0% { transform: scale(1); }
  35% { transform: scale(1.22); }
  100% { transform: scale(1); }
}
.value-pop { animation: value-pop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1); display: inline-block; }
.tile-glow { box-shadow: 0 9px 26px -9px var(--glow), 0 0 12px -6px var(--glow) !important; }
.gt-count { position: relative; font-variant-numeric: tabular-nums; }
.gt-count.gt-d-a::after, .gt-count.gt-d-b::after { content: attr(data-gt-d); content: attr(data-gt-d) / ""; position: absolute; left: 50%; bottom: 100%; margin-bottom: 2px; transform: translate(-50%, 0); padding: 2px 6px; border-radius: 999px; background: #6B7280; color: #FFFFFF; font: 700 11px/1.25 'Inter', sans-serif; letter-spacing: 0; text-transform: none; white-space: nowrap; font-variant-numeric: tabular-nums; pointer-events: none; z-index: 6; opacity: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.18); }
.gt-count.gt-dp-l::after { left: auto; right: 100%; bottom: auto; top: 50%; margin: 0 6px 0 0; transform: translateY(-50%); }
.gt-count.gt-dp-r::after { left: 100%; bottom: auto; top: 50%; margin: 0 0 0 6px; transform: translateY(-50%); }
.gt-count[data-gt-dt="g"]::after { background: #1E9E62; }
.gt-count[data-gt-dt="b"]::after { background: #D64545; }
.gt-count.gt-d-a::after { animation: gtDTa .7s var(--gt-ease-out, cubic-bezier(.23,1,.32,1)) forwards; }
.gt-count.gt-d-b::after { animation: gtDTb .7s var(--gt-ease-out, cubic-bezier(.23,1,.32,1)) forwards; }
.gt-count.gt-dp-l.gt-d-a::after, .gt-count.gt-dp-r.gt-d-a::after { animation-name: gtDSa; }
.gt-count.gt-dp-l.gt-d-b::after, .gt-count.gt-dp-r.gt-d-b::after { animation-name: gtDSb; }
.gt-count.gt-dp-d::after { left: auto; right: 0; bottom: auto; top: 100%; margin: 3px 0 0; transform: none; }
.gt-count.gt-dp-d.gt-d-a::after { animation-name: gtDDa; } .gt-count.gt-dp-d.gt-d-b::after { animation-name: gtDDb; }
.gtL-content .gtL-entrytotal .gt-count.gt-dp-r::after { left: 50%; top: auto; bottom: 100%; margin: 0 0 3px; transform: translate(-50%, 0); }
.gtL-content .gtL-entrytotal .gt-count.gt-dp-r.gt-d-a::after { animation-name: gtDUa; } .gtL-content .gtL-entrytotal .gt-count.gt-dp-r.gt-d-b::after { animation-name: gtDUb; }
@keyframes gtDDa { 0% { opacity: 0; transform: translateY(-3px); } 18% { opacity: 1; } 65% { opacity: 1; } 100% { opacity: 0; transform: translateY(4px); } }
@keyframes gtDDb { 0% { opacity: 0; transform: translateY(-3px); } 18% { opacity: 1; } 65% { opacity: 1; } 100% { opacity: 0; transform: translateY(4px); } }
@keyframes gtDUa { 0% { opacity: 0; transform: translate(-50%, 3px); } 18% { opacity: 1; } 65% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -5px); } }
@keyframes gtDUb { 0% { opacity: 0; transform: translate(-50%, 3px); } 18% { opacity: 1; } 65% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -5px); } }
@keyframes gtDTa { 0% { opacity: 0; transform: translate(-50%, 4px); } 18% { opacity: 1; } 65% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -16px); } }
@keyframes gtDTb { 0% { opacity: 0; transform: translate(-50%, 4px); } 18% { opacity: 1; } 65% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -16px); } }
@keyframes gtDSa { 0% { opacity: 0; transform: translateY(calc(-50% + 2px)); } 18% { opacity: 1; } 65% { opacity: 1; } 100% { opacity: 0; transform: translateY(calc(-50% - 7px)); } }
@keyframes gtDSb { 0% { opacity: 0; transform: translateY(calc(-50% + 2px)); } 18% { opacity: 1; } 65% { opacity: 1; } 100% { opacity: 0; transform: translateY(calc(-50% - 7px)); } }
@keyframes gtDFa { 0% { opacity: 0; } 18% { opacity: 1; } 65% { opacity: 1; } 100% { opacity: 0; } }
@keyframes gtDFb { 0% { opacity: 0; } 18% { opacity: 1; } 65% { opacity: 1; } 100% { opacity: 0; } }
[data-gt-lh] { position: relative; }
.gt-lead { position: absolute; inset: 0; border-radius: inherit; overflow: hidden; pointer-events: none; z-index: 4; padding: 2px; -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
.gt-lead > i { position: absolute; left: 50%; top: 50%; width: 160%; aspect-ratio: 1; background: conic-gradient(from 0deg, transparent 0 58%, var(--gt-lead-c, #F2C14E) 80%, #FFF6D8 86%, transparent 93%); transform: translate(-50%, -50%) rotate(0deg); opacity: 0; animation: gtLeadSpin 1.2s var(--gt-ease-io, cubic-bezier(.77,0,.175,1)) 1 forwards; }
@keyframes gtLeadSpin { 0% { opacity: 0; transform: translate(-50%, -50%) rotate(0deg); } 15% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes gtLeadFade { 0% { opacity: 0; } 25% { opacity: 1; } 75% { opacity: 1; } 100% { opacity: 0; } }
.gt-crown-in { animation: gtCrownIn .42s var(--gt-ease-spring, cubic-bezier(.34,1.3,.64,1)) both; transform-origin: 50% 70%; }
@keyframes gtCrownIn { from { opacity: 0; transform: translateY(-6px) scale(.7) rotate(-12deg); } to { opacity: 1; transform: none; } }
.gt-ring-bar { transition: stroke-dashoffset .5s var(--gt-ease-out, cubic-bezier(.23,1,.32,1)), opacity .2s linear; }
[data-gt-hold] { position: relative; overflow: hidden; -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; touch-action: manipulation; }
[data-gt-hold] > .gt-hold-fill { position: absolute; inset: 0; border-radius: inherit; background: var(--gt-hold-c, rgba(214,69,69,0.30)); clip-path: inset(0 100% 0 0); transition: clip-path .2s var(--gt-ease-out, cubic-bezier(.23,1,.32,1)); pointer-events: none; }
[data-gt-hold].is-holding > .gt-hold-fill { clip-path: inset(0 0 0 0); transition: clip-path 1.2s linear; }
[data-gt-hold].is-holding { transform: scale(.97); }
.gt-hold-lbl { position: relative; display: inline-block; }
[data-gt-armed] .gt-hold-hint { font-size: 0 !important; }
[data-gt-armed] .gt-hold-hint::after { content: attr(data-again); font-size: 10px; }
.gt-hold-hint { display: block; margin-top: 2px; font-size: 10px; font-weight: 600; letter-spacing: .02em; text-transform: none; opacity: .72; }
@media (prefers-reduced-motion: reduce) {
  .value-pop { animation: none; }
  .gt-count.gt-d-a::after { animation: gtDFa .7s linear forwards; }
  .gt-count.gt-d-b::after { animation: gtDFb .7s linear forwards; }
  .gt-count.gt-dp-l.gt-d-a::after, .gt-count.gt-dp-r.gt-d-a::after { animation-name: gtDFa; }
  .gt-count.gt-dp-l.gt-d-b::after, .gt-count.gt-dp-r.gt-d-b::after { animation-name: gtDFb; } .gt-count.gt-dp-d.gt-d-a::after, .gtL-content .gtL-entrytotal .gt-count.gt-dp-r.gt-d-a::after { animation-name: gtDFa; } .gt-count.gt-dp-d.gt-d-b::after, .gtL-content .gtL-entrytotal .gt-count.gt-dp-r.gt-d-b::after { animation-name: gtDFb; }
  .gt-lead > i { animation: gtLeadFade 1.2s ease-out 1 forwards; transform: translate(-50%, -50%); }
  .gt-crown-in { animation: none; }
  .gt-ring-bar { transition: none; }
  [data-gt-hold] > .gt-hold-fill, [data-gt-hold].is-holding > .gt-hold-fill { clip-path: none; opacity: 0; transition: opacity .2s linear; }
  [data-gt-hold].is-holding > .gt-hold-fill { opacity: 1; transition: opacity 1.2s linear; }
  [data-gt-hold].is-holding { transform: none; }
}
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(var(--gt-dist-m)); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal-1, .reveal-2, .reveal-3, .reveal-4 { transform: translateY(0); animation: reveal-up var(--gt-dur-large) var(--gt-ease-out, cubic-bezier(.23,1,.32,1)) backwards; }
.reveal-2 { animation-delay: 50ms; }
.reveal-3 { animation-delay: 100ms; }
.reveal-4 { animation-delay: 150ms; }
::view-transition-old(root) { animation: gtVtOut var(--gt-dur-feedback) cubic-bezier(0.23, 1, 0.32, 1) both; } ::view-transition-new(root) { animation: gtVtIn var(--gt-dur-large) cubic-bezier(0.23, 1, 0.32, 1) 40ms both; } @keyframes gtVtOut { to { opacity: 0; } } @keyframes gtVtIn { from { opacity: 0; transform: translateY(var(--gt-dist-m)); } } .gt-scrim-in { animation: gtScrimIn var(--gt-dur-small) ease-out both; } @keyframes gtScrimIn { from { opacity: 0; } } 
@media (prefers-reduced-motion: reduce) { ::view-transition-old(root), ::view-transition-new(root) { animation: none !important; } .gt-scrim-in { animation: none; } }
@keyframes podium-pop { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
.podium-pop { animation: podium-pop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.gtsb-modal { overflow-x: hidden; max-height: calc(100vh - 32px); max-height: calc(100dvh - 32px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)); overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; scrollbar-width: thin; }
.gtsb-stage { touch-action: pan-y; -webkit-user-select: none; user-select: none; }
.gtsb-scene { position: absolute; inset: 0; perspective: 980px; pointer-events: none; }
.gtsb-rig, .gtsb-c3, .gtsb-b3 { transform-style: preserve-3d; -webkit-transform-style: preserve-3d; }
.gtsb-rig { position: absolute; left: 50%; width: 0; height: 0; }
.gtsb-c3 { position: absolute; left: 0; bottom: 0; }
.gtsb-b3 { position: absolute; left: 0; bottom: 0; }
.gtsb-f { position: absolute; overflow: hidden; -webkit-backface-visibility: hidden; backface-visibility: hidden; }
.gtsb-gl { -webkit-backface-visibility: visible; backface-visibility: visible; }
.gtsb-lq { position: absolute; left: 0; top: 0; width: 100%; height: 135%; transform-origin: 50% 0; }
.gtsb-lq::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 1.5px; background: rgba(255,255,255,0.3); }
.gtsb-lqn { position: absolute; inset: 0; transform-origin: 50% 0; }
.gtsb-lqc { position: absolute; left: 0; right: 0; top: 0; display: flex; align-items: center; justify-content: center; }
.gtsb-tp { position: absolute; inset: 0; }
.gtsb-pl { position: absolute; opacity: 0; pointer-events: none; }
.gtsb-ed { position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 2px 0 rgba(255,255,255,0.3), inset 2px 0 0 rgba(255,255,255,0.1), inset -2px 0 0 rgba(0,0,0,0.14), inset 0 -3px 0 rgba(0,0,0,0.18); }
.gtsb-ff { display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: inset 0 2px 0 rgba(255,255,255,0.3), inset 2px 0 0 rgba(255,255,255,0.1), inset -2px 0 0 rgba(0,0,0,0.14), inset 0 -3px 0 rgba(0,0,0,0.18); }
.gtsb-sh3 { position: absolute; transform: rotateX(90deg); pointer-events: none; }
.gtsb-an { position: absolute; width: 0; height: 0; }
.gtsb-lab { position: absolute; left: 0; top: 0; width: max-content; text-align: center; padding-bottom: 7px; pointer-events: none; z-index: 2; }
.gtsb-mini { position: relative; perspective: 620px; }
.gtsb-mini-r { position: absolute; left: 50%; bottom: 16px; width: 64px; margin-left: -32px; height: 0; transform-style: preserve-3d; -webkit-transform-style: preserve-3d; transform: rotateX(-14deg) rotateY(-20deg); }
.gtsb-name { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 14px; line-height: 1.18; overflow-wrap: normal; word-break: normal; -webkit-hyphens: none; hyphens: none; }
.gtsb-score { font-family: 'Baloo 2', 'Inter', sans-serif; font-weight: 800; line-height: 1.05; margin-top: 2px; font-variant-numeric: tabular-nums; overflow-wrap: break-word; }
.gtsb-num { display: block; font-family: 'Baloo 2', 'Inter', sans-serif; font-weight: 800; line-height: 1; padding-top: 0.1em; font-variant-numeric: tabular-nums; pointer-events: none; }
.gtsb-sheen { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.gtsb-sheen > i { position: absolute; top: 0; bottom: 0; left: 0; width: 38%; background: linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.22) 50%, rgba(255,255,255,0)); opacity: 0; transform: translateX(-110%); }
.gtsb-fin .gtsb-sheen > i { animation: gtsbSh 600ms cubic-bezier(.45,0,.2,1) both; }
@keyframes gtsbSh { 0% { opacity: 0; transform: translateX(-110%); } 18% { opacity: 1; } 82% { opacity: 1; } 100% { opacity: 0; transform: translateX(240%); } }
.gtsb-list { list-style: none; margin: 18px 0 0; padding: 4px 0 0; }
.gtsb-list li { display: grid; grid-template-columns: 30px minmax(0,1fr) auto; align-items: baseline; gap: 8px; padding: 8px 4px; font-family: 'Inter', sans-serif; font-size: 13.5px; }
.gtsb-list li + li { border-top: 1px solid var(--gtsb-sep); }
.gtsb-acts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.gtsb-acts > button { flex: 1 1 128px; min-width: 0; }
.gtsb-x { position: absolute; top: 6px; right: 6px; width: 44px; height: 44px; border: none; background: transparent; padding: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 5; -webkit-tap-highlight-color: transparent; }
.gtsb-x > span { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.gtsb-x:focus-visible { outline: none; }
.gtsb-x:focus-visible > span { box-shadow: 0 0 0 2px currentColor; }
.gtsb-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (prefers-reduced-motion: reduce) { .gtsb-sheen > i { animation: none !important; } }
@media (forced-colors: active) { .gtsb-f { border: 1px solid CanvasText; } .gtsb-sheen, .gtsb-sh3, .gtsb-pl { display: none; } }
@keyframes podium-rise { from { opacity: 0; transform: translateY(24px); filter: blur(6px); } to { opacity: 1; transform: translateY(0); filter: none; } }
.podium-block-3 { opacity: 0; animation: podium-rise 0.45s var(--gt-ease-spring, cubic-bezier(.34,1.3,.64,1)) 0.10s forwards; }
.podium-block-2 { opacity: 0; animation: podium-rise 0.45s var(--gt-ease-spring, cubic-bezier(.34,1.3,.64,1)) 0.22s forwards; }
.podium-block-1 { opacity: 0; animation: podium-rise 0.5s var(--gt-ease-spring, cubic-bezier(.34,1.3,.64,1)) 0.34s forwards; }
@keyframes gtP3Fade { from { opacity: 0; } to { opacity: 1; } }
.gt-win-name { background: linear-gradient(100deg, currentColor 36%, var(--gt-aur, #FFF3CF) 50%, currentColor 64%) 100% 0 / 250% 100% no-repeat; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: gtNameShine 0.9s var(--gt-ease-io, cubic-bezier(.77,0,.175,1)) .95s 1 both; }
@keyframes gtNameShine { from { background-position: 100% 0; } to { background-position: 0% 0; } }
.gt-tring-bar { transition: stroke-dashoffset 0.25s var(--gt-ease-out, cubic-bezier(.23,1,.32,1)), stroke 0.2s ease; }
.gt-tring.is-run .gt-tring-bar { transition: stroke-dashoffset 1s linear, stroke 0.2s ease; }
.gt-tring.is-ended .gt-tring-track { stroke: var(--gt-warn); opacity: 0.35; }
.gt-timeup { position: fixed; inset: 0; z-index: 140; pointer-events: none; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse at center, rgba(229,72,77,0) 40%, rgba(229,72,77,0.34) 100%); animation: gtTimeUp 1.1s ease-out both; }
@keyframes gtTimeUp { 0% { opacity: 0; } 12% { opacity: 1; } 62% { opacity: 1; } 100% { opacity: 0; } }
.gt-timeup-ring { width: 84px; height: 84px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; background: #E5484D; box-shadow: 0 12px 34px -10px rgba(229,72,77,0.8); animation: gtTimeUpPop 0.42s var(--gt-ease-spring, cubic-bezier(.34,1.3,.64,1)) both; }
@keyframes gtTimeUpPop { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
.gt-flip { width: min(100%, 340px); perspective: 1100px; touch-action: none; -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; cursor: pointer; outline: none; -webkit-tap-highlight-color: transparent; }
.gt-flip-inner { display: grid; transform-style: preserve-3d; -webkit-transform-style: preserve-3d; transition: transform 0.16s var(--gt-ease-out, cubic-bezier(.23,1,.32,1)); }
.gt-flip.is-held .gt-flip-inner { transform: rotateY(180deg); transition-duration: 0.38s; }
.gt-flip-face { grid-area: 1 / 1; border-radius: 26px; box-sizing: border-box; min-height: 220px; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.gt-flip-front { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 20px; font-family: 'Inter', sans-serif; }
.gt-flip-back { transform: rotateY(180deg); visibility: hidden; padding: 16px 10px; overflow: hidden; pointer-events: none; }
.gt-flip.is-held .gt-flip-back { visibility: visible; }
.gt-flip-back > div { min-height: 0 !important; }
.gt-flip-back button { display: none !important; }
.gt-flip:focus-visible .gt-flip-front { outline: 2px solid currentColor; outline-offset: 3px; }
.gt-starter-chip.is-win { animation: gtStarterPop 0.42s var(--gt-ease-spring, cubic-bezier(.34,1.3,.64,1)) both; }
@keyframes gtStarterPop { 0% { transform: scale(0.94); } 60% { transform: scale(1.08); } 100% { transform: scale(1); } }
.gt-starter-res { animation: gtStarterRes 0.22s var(--gt-ease-out, cubic-bezier(.23,1,.32,1)) both; }
@keyframes gtStarterRes { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
:root.gt-vt-theme::view-transition-old(root), :root.gt-vt-theme::view-transition-new(root) { animation: none !important; mix-blend-mode: normal; }
:root.gt-vt-theme-rm::view-transition-old(root) { animation: gtThemeOut 0.2s ease both !important; }
:root.gt-vt-theme-rm::view-transition-new(root) { animation: gtP3Fade 0.2s ease both !important; mix-blend-mode: normal; }
@keyframes gtThemeOut { to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .podium-block-1, .podium-block-2, .podium-block-3 { animation: gtP3Fade 0.2s ease forwards !important; }
  [data-gt-podium].podium-pop { animation: gtP3Fade 0.2s ease both !important; }
  .gt-win-name { animation: none; background: none; -webkit-text-fill-color: currentColor; }
  .gt-su-row { animation: none; } .gt-su-btn::after { display: none; }
  .gt-timeup-ring, .gt-starter-chip.is-win { animation: none; }
  .gt-starter-res { animation: gtP3Fade 0.2s ease both; }
  .gt-flip-inner, .gt-flip.is-held .gt-flip-inner { transform: none !important; transition: none !important; }
  .gt-flip-back { transform: none; opacity: 0; }
  .gt-flip-front, .gt-flip-back { transition: opacity 0.18s ease; }
  .gt-flip.is-held .gt-flip-back { opacity: 1; }
  .gt-flip.is-held .gt-flip-front { opacity: 0; }
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2147483000;
  opacity: 0.028;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@media (prefers-reduced-motion: reduce) {
  .reveal-1, .reveal-2, .reveal-3, .reveal-4 { animation: gtFadeOnly 160ms ease-out backwards !important; }
  .ach-pulse-ring, .tutto-near, .tutto-dice-pop { animation: none !important; }
  .press-fx, .card-fx { transition: opacity 150ms ease, box-shadow 180ms ease !important; }
  .press-fx:active, .card-fx:active { transform: none !important; }
  [style*="decoDrift"], [style*="dragonBreathe"], [style*="dragonFlap"], [style*="headsupRotateHint"], [style*="dartLedPulse"] { animation: none !important; }
  [style*="chalk-draw"] { animation: none !important; stroke-dashoffset: 0 !important; }
  .schieber-sponge-anim { animation: none !important; opacity: 0 !important; }
}

/* ===== Handy-Querformat (Fundament). Alles NUR unter [data-phone-landscape]; Doku: CLAUDE.md "Querformat", web/src/shared/phone-landscape.js ===== */
[data-phone-landscape] {
  --pl-head: 48px;
  --pl-gap: 12px;
  --pl-sat: env(safe-area-inset-top, 0px);
  --pl-sab: env(safe-area-inset-bottom, 0px);
  --pl-sal: env(safe-area-inset-left, 0px);
  --pl-sar: env(safe-area-inset-right, 0px);
  --pl-gutter-l: calc(14px + var(--pl-sal));
  --pl-gutter-r: calc(14px + var(--pl-sar));
  --pl-gutter: max(var(--pl-gutter-l), var(--pl-gutter-r));
  --pl-vh: 100vh;
  --pl-avail: var(--pl-vvh, var(--pl-vh));
  --pl-body: calc(var(--pl-avail) - var(--pl-head) - var(--pl-sab));
}
@supports (height: 100dvh) { [data-phone-landscape] { --pl-vh: 100dvh; } }
@media (display-mode: standalone) { [data-phone-landscape] { --pl-vh: 100vh; } }
:where(html:not([data-phone-landscape])) :is(.pl-split, .pl-main, .pl-side) { display: contents; }
:where(html:not([data-phone-landscape])) .pl-only { display: none !important; }
[data-phone-landscape] .pl-hide { display: none !important; }
[data-phone-landscape] .pl-page { box-sizing: border-box; max-width: none !important; width: 100% !important; padding-left: var(--pl-gutter-l) !important; padding-right: var(--pl-gutter-r) !important; }
[data-phone-landscape] .pl-wide { max-width: none !important; width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; box-sizing: border-box; }
[data-phone-landscape] .pl-split { display: grid; grid-template-columns: minmax(0, var(--pl-main-fr, 1fr)) minmax(0, var(--pl-side-fr, 1fr)); gap: var(--pl-gap); align-items: start; width: 100%; box-sizing: border-box; }
[data-phone-landscape] .pl-split.pl-split-even { --pl-main-fr: 1fr; --pl-side-fr: 1fr; }
[data-phone-landscape] .pl-split.pl-split-wide { --pl-main-fr: 1.35fr; --pl-side-fr: 1fr; }
[data-phone-landscape] .pl-main, [data-phone-landscape] .pl-side { min-width: 0; box-sizing: border-box; }
[data-phone-landscape] .pl-side.pl-sticky { position: sticky; top: calc(var(--pl-sat) + 8px); }
[data-phone-landscape] .pl-scroll { overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; max-height: max(160px, var(--pl-body)); min-height: 0; }
[data-phone-landscape] .pl-scroll-x { overflow-x: auto; overscroll-behavior-x: contain; -webkit-overflow-scrolling: touch; max-width: 100%; }
[data-phone-landscape] .pl-fill { min-height: max(160px, var(--pl-body)); box-sizing: border-box; }
[data-phone-landscape] .pl-head-compact .gt-gamehead, [data-phone-landscape] .gt-gamehead.pl-head-compact { display: flex; align-items: center; gap: 10px; min-height: var(--pl-head); max-height: 52px; box-sizing: border-box; padding-top: 2px; padding-bottom: 2px; margin-bottom: 8px; }
[data-phone-landscape] :is(.pl-head-compact .gt-gamehead, .gt-gamehead.pl-head-compact) > div:first-of-type { margin-bottom: 0 !important; flex: none; order: 0; }
[data-phone-landscape] :is(.pl-head-compact .gt-gamehead, .gt-gamehead.pl-head-compact) > div:nth-of-type(n+2):not(.gt-headbtns) { flex: 1 1 auto; min-width: 0; order: 1; }
[data-phone-landscape] :is(.pl-head-compact .gt-gamehead, .gt-gamehead.pl-head-compact) > .gt-headbtns { position: static !important; order: 2; flex: none; margin-left: auto; }
[data-phone-landscape] :is(.pl-head-compact .gt-gamehead, .gt-gamehead.pl-head-compact) h1 { font-size: 20px !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; overflow-wrap: normal !important; }
[data-phone-landscape] :is(.pl-head-compact .gt-gamehead, .gt-gamehead.pl-head-compact) h1 + div { margin-top: 1px !important; }
html[data-phone-landscape] body:has(> #root > div.gtL-start) { position: static !important; overflow: visible !important; top: auto !important; width: auto !important; }
[data-phone-landscape] #root > div.gtL-start { height: auto !important; min-height: var(--pl-vh) !important; overflow: visible !important; }
@media (display-mode: standalone) { html[data-phone-landscape] body #root > div.gtL-start { height: auto !important; min-height: 100vh !important; padding-top: max(12px, env(safe-area-inset-top, 0px)) !important; } }
/* Lesbarkeit Handy: Kleintext mindestens 13 px (Grossbuchstaben-Kleinlabels 12 px). Ausnahmen: Tabellenzellen, Laptop, .gt-nofloor. */
@media (max-width: 700px) {
  :is([style*="font-size: 9.5px"],[style*="font-size: 10px"],[style*="font-size: 10.5px"],[style*="font-size: 11px"],[style*="font-size: 11.5px"],[style*="font-size: 12px"],[style*="font-size: 12.5px"]):not(td, th, .gtL-content *, .gt-nofloor, .gt-nofloor *) { font-size: 13px !important; }
  :is([style*="font-size: 9.5px"],[style*="font-size: 10px"],[style*="font-size: 10.5px"],[style*="font-size: 11px"],[style*="font-size: 11.5px"],[style*="font-size: 12px"],[style*="font-size: 12.5px"])[style*="text-transform: uppercase"]:not(td, th, .gtL-content *, .gt-nofloor, .gt-nofloor *) { font-size: 12px !important; }
}
`;/*@gt-body-end*/
export { GLOBAL_STYLES };
