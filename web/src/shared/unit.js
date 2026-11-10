// Gemeinsames Geruest aller Spielansichten (Design-Einheit, ab 06.11.2026).
// GtCol: Seite als Spalte, fuellt den Bildschirm, zeigt oben den Schein der Akzentfarbe.
// GtDock: Hauptknopf unten, voll breit, im Daumenbereich. Im Laptop und im Handy-Querformat steht er normal im Fluss.
// Kein position:fixed: auf dem iPhone wird das in der Home-Bildschirm-App abgeschnitten (siehe CLAUDE.md).
import { React } from "../vendor/react-globals.js";
const GT_UNIT_CSS = `
.gt-u-glow{display:none!important}

.gt-u-col{position:relative;display:flex;flex-direction:column;min-height:calc(100dvh - 60px)}
@media (display-mode: standalone){.gt-u-col{min-height:calc(100vh - 60px)}}
.gt-u-col>*{position:relative;z-index:1}
.gt-u-col>.gt-gamehead,.gt-u-col>:has(>.gt-gamehead){z-index:20}
.gt-u-col>.gt-u-glow{position:absolute;z-index:0;top:calc(-20px - env(safe-area-inset-top,0px));left:calc(50% - 50vw);right:calc(50% - 50vw);height:calc(320px + env(safe-area-inset-top,0px));pointer-events:none;background:radial-gradient(120% 100% at 50% 0,color-mix(in oklab,var(--gt-u-acc) 30%,transparent),transparent 72%)}
html[data-gt-theme="light"] .gt-u-col>.gt-u-glow{background:radial-gradient(120% 100% at 50% 0,color-mix(in oklab,var(--gt-u-acc) 16%,transparent),transparent 72%)}
html[data-gt-theme="noir"] .gt-u-col>.gt-u-glow{display:none}
.gt-u-col>.gt-u-dock,.gt-u-col>.gt-su-cta{margin-top:auto}
.gt-u-col .gt-su-cta::before{left:calc(50% - 50vw);right:calc(50% - 50vw);bottom:-40px}
.gtL-content .gt-u-col .gt-su-cta::before{left:0;right:0;bottom:0}
.gt-u-dock{position:sticky;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:6;display:flex;flex-direction:column;gap:8px;padding-top:12px}
.gt-u-dock>button{width:100%;min-height:56px}
.gtL-content .gt-u-col{min-height:0}
.gtL-content .gt-u-col>.gt-u-glow{display:none}
.gtL-content .gt-u-dock{position:static;margin-top:16px}
[data-phone-landscape] .gt-u-col{min-height:0}
[data-phone-landscape] .gt-u-col>.gt-u-glow{height:160px}
[data-phone-landscape] .gt-u-dock{position:static;margin-top:10px;padding-top:0}
[data-phone-landscape] .gt-u-dock>button{min-height:44px}
`;
function GtCol({ accent, className, style, children }) {
  return <div className={"gt-u-col" + (className ? " " + className : "")} style={{ "--gt-u-acc": accent || "transparent", ...style }}>
    <style>{GT_UNIT_CSS}</style>
    <div className="gt-u-glow" aria-hidden="true" />
    {children}
  </div>;
}
function GtDock({ className, children }) {
  return <div className={"gt-u-dock" + (className ? " " + className : "")}>{children}</div>;
}
export { GtCol, GtDock, GT_UNIT_CSS };
