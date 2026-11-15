// Yatzy-Effekte (2026-11-15, Wahl Yanis): Y2 «Stempel mit Strahlen» bei Yatzy, B2 «Bonus fällt» wenn der Bonus oben verpasst wird.
// In allen Modi (Nocturne, Hell, Noir, Ryū) mit eigener Farbpalette. Dauer ca. 2,2 s, danach entfernt.
import { React } from "../../vendor/react-globals.js";
import { isPlakat } from "../../themes/plakat.js";

function yzFxPal(theme) {
  if (isPlakat()) return { acc: "#E4312B", ink: "#1A1716", card: "#F3EAD3", pip: "#F3EAD3", shade: "rgba(26,23,22,.72)", font: "'Bagel Fat One','Bowlby One',sans-serif" };
  if (theme === "noir") return { acc: "#E6E6E6", ink: "#0A0A0A", card: "#F2F2F2", pip: "#0A0A0A", shade: "rgba(0,0,0,.78)", font: "'Bowlby One',sans-serif", accInk: "#0A0A0A" };
  if (theme === "light") return { acc: "#3D5E8C", ink: "#17130F", card: "#FFFCF6", pip: "#FFFCF6", shade: "rgba(23,19,15,.55)", font: "'Bowlby One',sans-serif" };
  return { acc: "#6F8FC4", ink: "#0E1220", card: "#F4F1EA", pip: "#F4F1EA", shade: "rgba(9,11,19,.74)", font: "'Bowlby One',sans-serif" };
}

function Die({ size, p }) {
  const pos = [[28, 25], [72, 25], [28, 50], [72, 50], [28, 75], [72, 75]];
  return <svg width={size} height={size} viewBox="-6 -6 112 112" aria-hidden="true"><rect x="0" y="0" width="100" height="100" rx="20" fill={p.acc} stroke={p.ink} strokeWidth="7" />{pos.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" fill={p.pip} />)}</svg>;
}

function yzFxCss(p) {
  return `
.yzfx{position:fixed;inset:0;z-index:140;pointer-events:none;overflow:hidden}
.yzfx-bg{position:absolute;inset:0;background:${p.shade};animation:yzfxIn .25s ease both,yzfxOut .35s ease 1.85s both}
@keyframes yzfxIn{from{opacity:0}to{opacity:1}}
@keyframes yzfxOut{to{opacity:0}}
.yzfx-ray{position:absolute;left:50%;top:50%;width:900px;height:900px;margin:-450px 0 0 -450px;border-radius:50%;background:repeating-conic-gradient(${p.acc} 0 10deg,transparent 10deg 20deg);opacity:.85;-webkit-mask:radial-gradient(circle,#000 30%,transparent 62%);mask:radial-gradient(circle,#000 30%,transparent 62%);animation:yzfxSpin 6s linear infinite,yzfxIn .4s ease .2s both,yzfxOut .35s ease 1.85s both}
@keyframes yzfxSpin{to{transform:rotate(360deg)}}
.yzfx-shake{position:absolute;inset:0;animation:yzfxShake .4s linear .62s both,yzfxOut .35s ease 1.85s both}
@keyframes yzfxShake{0%,100%{transform:none}15%{transform:translate(-9px,5px)}35%{transform:translate(8px,-6px)}55%{transform:translate(-6px,3px)}75%{transform:translate(4px,-2px)}}
.yzfx-st{position:absolute;left:50%;top:50%;width:300px;max-width:82vw;height:170px;margin:-85px 0 0 0;transform:translateX(-50%) rotate(-6deg);border-radius:26px;background:${p.card};box-shadow:0 0 0 6px ${p.ink},10px 12px 0 6px ${p.ink};display:flex;flex-direction:column;align-items:center;justify-content:center;animation:yzfxStamp .42s cubic-bezier(.5,0,.75,0) .25s both}
@keyframes yzfxStamp{0%{transform:translateX(-50%) scale(3.2) rotate(8deg);opacity:0}70%{transform:translateX(-50%) scale(.92) rotate(-6deg);opacity:1}100%{transform:translateX(-50%) scale(1) rotate(-6deg)}}
.yzfx-w{font-family:${p.font};font-size:66px;line-height:1;color:${p.acc};-webkit-text-stroke:.06em ${p.ink};paint-order:stroke fill;text-shadow:3px 4px 0 ${p.ink};white-space:nowrap}
.yzfx-n{font-family:${p.font};font-size:20px;margin-top:6px;color:${p.ink};max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.yzfx-d{position:absolute;left:50%;top:50%;margin:-24px 0 0 -24px;animation:yzfxFly .6s cubic-bezier(.2,1.4,.4,1) .7s both}
@keyframes yzfxFly{from{transform:translate(0,0) scale(0)}to{transform:translate(var(--dx),var(--dy)) scale(1) rotate(var(--r))}}
.yzfx-sign{position:absolute;left:50%;top:38%;width:220px;height:118px;margin-left:-110px;border-radius:22px;background:${p.card};box-shadow:0 0 0 5px ${p.ink},8px 9px 0 5px ${p.ink};display:flex;flex-direction:column;align-items:center;justify-content:center;transform-origin:14% 0;animation:yzfxDrop 1.8s cubic-bezier(.5,0,.6,1) both}
@keyframes yzfxDrop{0%{transform:scale(0)}14%{transform:scale(1.08)}22%{transform:scale(1)}40%{transform:rotate(0)}52%{transform:rotate(-24deg)}60%{transform:rotate(-14deg)}70%{transform:rotate(-30deg)}100%{transform:translateY(120vh) rotate(-70deg)}}
.yzfx-sign b{font-family:${p.font};font-weight:400;font-size:22px;color:${p.ink}}
.yzfx-sign i{font-style:normal;font-family:${p.font};font-size:48px;line-height:1;color:${p.acc};-webkit-text-stroke:.05em ${p.ink};paint-order:stroke fill}
.yzfx-pin{position:absolute;top:calc(38% - 8px);width:18px;height:18px;border-radius:50%;background:${p.ink}}
.yzfx-pinL{left:calc(50% - 94px)}
.yzfx-pinR{left:calc(50% + 76px);animation:yzfxPop 1s ease both}
@keyframes yzfxPop{0%,40%{transform:none}100%{transform:translate(80px,-140px) rotate(400deg) scale(.5);opacity:0}}
.yzfx-bub{position:absolute;left:50%;top:calc(38% + 160px);transform:translateX(-50%) rotate(-5deg);background:${p.ink};color:${p.card};font-family:${p.font};font-size:46px;padding:10px 26px;border-radius:22px;white-space:nowrap;animation:yzfxSay .5s cubic-bezier(.2,1.6,.4,1) 1.1s both,yzfxOut .4s ease 2.6s both}
.yzfx-bub:after{content:"";position:absolute;left:34px;top:-18px;border:12px solid transparent;border-bottom:16px solid ${p.ink}}
@keyframes yzfxSay{from{transform:translateX(-50%) rotate(-5deg) scale(0)}to{transform:translateX(-50%) rotate(-5deg) scale(1)}}
.yzfx-miss{position:absolute;left:50%;top:calc(38% + 250px);transform:translateX(-50%) rotate(3deg);background:${p.acc};color:${p.accInk || p.ink};font-family:${p.font};font-size:30px;line-height:1.05;padding:12px 22px;border-radius:16px;box-shadow:0 0 0 4px ${p.ink},6px 7px 0 4px ${p.ink};text-align:center;white-space:nowrap;animation:yzfxHit .55s cubic-bezier(.2,1.7,.4,1) 1.45s both,yzfxOut .4s ease 2.6s both}
.yzfx-miss span{display:block;font-size:52px}
@keyframes yzfxHit{0%{transform:translateX(-50%) scale(0) rotate(-10deg)}100%{transform:translateX(-50%) scale(1) rotate(3deg)}}
@media (prefers-reduced-motion: reduce){.yzfx *{animation:none!important}.yzfx-sign{display:none}}
`;
}

// kind: "yatzy" | "miss"; label: Name; missing: fehlende Punkte zum Bonus
function YzFx({ kind, label, missing, theme, t }) {
  const p = yzFxPal(theme);
  const css = React.useMemo(() => yzFxCss(p), [theme, isPlakat()]);
  if (kind === "yatzy") {
    const dice = [[-140, -170, -20], [130, -160, 18], [-150, 150, 15], [140, 160, -14], [0, -220, 6]];
    return <div className="yzfx" aria-hidden="true"><style>{css}</style><div className="yzfx-bg" /><div className="yzfx-ray" /><div className="yzfx-shake">{dice.map(([dx, dy, r], i) => <div key={i} className="yzfx-d" style={{ "--dx": dx + "px", "--dy": dy + "px", "--r": r + "deg" }}><Die size={48} p={p} /></div>)}<div className="yzfx-st"><div className="yzfx-w">YATZY!</div>{label ? <div className="yzfx-n">{label}</div> : null}</div></div></div>;
  }
  return <div className="yzfx" role="status" aria-live="polite"><style>{css}</style><div className="yzfx-bg" style={{ animation: "yzfxIn .25s ease both,yzfxOut .4s ease 2.6s both" }} /><div className="yzfx-sign"><b>BONUS</b><i>+25</i></div><div className="yzfx-pin yzfx-pinL" style={{ animation: "yzfxOut .3s ease 1.6s both" }} /><div className="yzfx-pin yzfx-pinR" /><div className="yzfx-bub">{t("yzOuch")}</div><div className="yzfx-miss">{label ? <small style={{ display: "block", fontSize: 18 }}>{label}</small> : null}<span>{missing}</span>{t("yzMissedPts")(missing)}</div></div>;
}

export { YzFx };
