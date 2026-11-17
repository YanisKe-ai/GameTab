// Ryū Handy: Comic-Animation «Showdown» beim Antippen von ALL-IN-ONE (Wahl Yanis 16.11.2026).
// Augen, Augen, Würfelbecher, Faust auf den Tisch («Das zählt nicht!»), KRACH! und GAMETAB, dann reisst die Seite auf.
// Vollbild-Ebene über der Startseite, nur Rot, Schwarz, Creme. Bei «Bewegung reduzieren» nur ein kurzes Aufblitzen.
/* eslint-disable no-unused-vars */
import { TRANSLATIONS } from "../i18n/translations.js";
const gtRyuComic = (() => {
const tx = (k, d) => { try { const L = TRANSLATIONS[document.documentElement.lang] || TRANSLATIONS.de; return L[k] || TRANSLATIONS.de[k] || d; } catch (e) { return d; } };
const RED = "#E4312B", INK = "#1A1716", CR = "#F3EAD3";
const NS = "http://www.w3.org/2000/svg";
let fx = null, box = null, stage = null, phone = null, PID = 0;
const T = (x, y, s, r) => `translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`;
const el=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);(p||fx).appendChild(e);return e;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const shake=(node,amp,ms)=>node.animate([{transform:"translate(0,0)"},{transform:`translate(${-amp}px,${amp*.6}px)`},{transform:`translate(${amp}px,${-amp*.5}px)`},{transform:`translate(${-amp*.6}px,${-amp*.4}px)`},{transform:"translate(0,0)"}],{duration:ms,easing:"ease-out"});
function star(n,r1,r2){let d="";for(let k=0;k<2*n;k++){const r=k%2?r2:r1,a=Math.PI*k/n;d+=(k?"L":"M")+(Math.cos(a)*r).toFixed(1)+" "+(Math.sin(a)*r).toFixed(1);}return d+"Z";}
function shards(c,n,dist,cols){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,d=dist*(.5+Math.random()),sz=6+Math.random()*12;
  const p=el("path",{d:`M0 ${-sz} L${sz*.7} ${sz*.5} L${-sz*.6} ${sz*.4}Z`,fill:cols[i%cols.length],stroke:INK,"stroke-width":2});
  p.animate([{transform:T(c.x,c.y,.4,0),opacity:1},{transform:T(c.x+Math.cos(a)*d,c.y+Math.sin(a)*d+60,1,(Math.random()-.5)*720),opacity:0}],{duration:900+Math.random()*500,easing:"cubic-bezier(.15,.8,.3,1)",fill:"forwards"});}}
function speed(par,cx,cy,n,r1,r2){for(let i=0;i<n;i++){const a=i/n*Math.PI*2+Math.random()*.1;el("path",{d:`M${cx+Math.cos(a)*r1} ${cy+Math.sin(a)*r1} L${cx+Math.cos(a+.02)*r2} ${cy+Math.sin(a+.02)*r2} L${cx+Math.cos(a-.02)*r2} ${cy+Math.sin(a-.02)*r2}Z`,fill:INK,opacity:.85},par);}}
function defs(){let d=fx.querySelector("defs");if(!d){d=el("defs",{});}
  if(!fx.querySelector("#htR")){const p=el("pattern",{id:"htR",width:8,height:8,patternUnits:"userSpaceOnUse",patternTransform:"rotate(30)"},d);el("rect",{width:8,height:8,fill:RED},p);el("circle",{cx:4,cy:4,r:1.7,fill:"#B8241F"},p);
    const q=el("pattern",{id:"htC",width:7,height:7,patternUnits:"userSpaceOnUse",patternTransform:"rotate(30)"},d);el("rect",{width:7,height:7,fill:CR},q);el("circle",{cx:3.5,cy:3.5,r:1.3,fill:"#D8CBA8"},q);
    const k=el("pattern",{id:"htK",width:7,height:7,patternUnits:"userSpaceOnUse",patternTransform:"rotate(30)"},d);el("rect",{width:7,height:7,fill:INK},k);el("circle",{cx:3.5,cy:3.5,r:1.2,fill:"#3A332F"},k);}
  return d;}
function panel(pts,fill,delay){defs();const id="cp"+(++PID);const cp=el("clipPath",{id},fx.querySelector("defs"));el("polygon",{points:pts},cp);
  const g=el("g",{});const bg=el("polygon",{points:pts,fill:fill||"url(#htC)"},g);const inner=el("g",{"clip-path":`url(#${id})`},g);el("polygon",{points:pts,fill:"none",stroke:INK,"stroke-width":5,"stroke-linejoin":"round"},g);
  g.animate([{opacity:0,transform:"scale(.96)"},{opacity:1,transform:"scale(1)"}],{duration:180,delay:delay||0,easing:"cubic-bezier(.3,1.4,.5,1)",fill:"backwards"});g.style.transformBox="fill-box";g.style.transformOrigin="center";
  return {g,inner};}
function sfx(par,x,y,txt,size,rot,fill){const t=el("text",{x,y,"text-anchor":"middle","font-family":"'Bagel Fat One',sans-serif","font-size":size,fill:fill||CR,stroke:INK,"stroke-width":Math.round(size/6),"paint-order":"stroke fill","stroke-linejoin":"round",style:`transform-box:view-box;transform-origin:${x}px ${y}px;transform:rotate(${rot||0}deg)`},par);t.textContent=txt;
  t.animate([{transform:`rotate(${rot||0}deg) scale(2.2)`,opacity:0},{transform:`rotate(${rot||0}deg) scale(1)`,opacity:1}],{duration:200,easing:"cubic-bezier(.6,0,1,.6)"});return t;}
function bubble(par,x,y,w,h,tx,ty,txt,size){const g=el("g",{},par);el("ellipse",{cx:x,cy:y,rx:w/2,ry:h/2,fill:"#FFFDF6",stroke:INK,"stroke-width":3},g);el("path",{d:`M${x-12} ${y+h/2-6} L${tx} ${ty} L${x+10} ${y+h/2-4}Z`,fill:"#FFFDF6",stroke:INK,"stroke-width":3,"stroke-linejoin":"round"},g);el("ellipse",{cx:x,cy:y,rx:w/2-1.5,ry:h/2-1.5,fill:"#FFFDF6"},g);
  const lines=txt.split("|");lines.forEach((l,k)=>{const t=el("text",{x,y:y+(k-(lines.length-1)/2)*(size*1.15)+size*.35,"text-anchor":"middle","font-family":"'Bagel Fat One',sans-serif","font-size":size,fill:INK},g);t.textContent=l;});
  g.animate([{transform:"scale(0)"},{transform:"scale(1.1)",offset:.7},{transform:"scale(1)"}],{duration:240,easing:"cubic-bezier(.3,1.5,.5,1)"});g.style.transformOrigin=`${tx}px ${ty}px`;g.style.transformBox="view-box";return g;}
function die(par,x,y,s,r){const g=el("g",{transform:`translate(${x},${y}) rotate(${r}) scale(${s})`},par);el("rect",{x:-18,y:-18,width:36,height:36,rx:7,fill:CR,stroke:INK,"stroke-width":3},g);[[-8,-8],[8,8],[0,0],[8,-8],[-8,8]].forEach(p=>el("circle",{cx:p[0],cy:p[1],r:3.2,fill:RED},g));return g;}
function eye(par,cx,cy,w,look){const g=el("g",{},par);el("path",{d:`M${cx-w/2} ${cy} Q${cx} ${cy-w*.42} ${cx+w/2} ${cy} Q${cx} ${cy+w*.42} ${cx-w/2} ${cy}Z`,fill:CR,stroke:INK,"stroke-width":4},g);
  el("circle",{cx:cx+(look||0)*w*.15,cy,r:w*.17,fill:INK},g);el("circle",{cx:cx+(look||0)*w*.15-w*.05,cy:cy-w*.05,r:w*.05,fill:CR},g);el("path",{d:`M${cx-w*.55} ${cy-w*.32} L${cx+w*.5} ${cy-w*.22}`,stroke:INK,"stroke-width":w*.09,"stroke-linecap":"round"},g);return g;}
function cup(par,x,y,s){const g=el("g",{transform:`translate(${x},${y}) scale(${s})`},par);el("path",{d:"M-34 0 L34 0 L26 -70 L-26 -70Z",fill:INK,stroke:INK,"stroke-width":3},g);el("rect",{x:-38,y:-6,width:76,height:10,rx:3,fill:RED,stroke:INK,"stroke-width":3},g);el("path",{d:"M-18 -60 L-14 -12",stroke:CR,"stroke-width":4,opacity:.5},g);return g;}
function table(par,y,h){el("rect",{x:10,y:y+h-30,width:350,height:30,fill:"#3A332F"},par);el("line",{x1:10,y1:y+h-30,x2:360,y2:y+h-30,stroke:INK,"stroke-width":3},par);}
function figure(par,x,y,s,flip,mood){const root=el("g",{transform:`translate(${x},${y}) scale(${flip?-s:s},${s})`},par);
  // Oberkörper
  el("path",{d:"M-30 70 C-34 20,-26 -18,-6 -30 L18 -30 C34 -20,40 20,36 70Z",fill:INK},root);
  el("path",{d:"M-4 -30 L4 -44 L14 -44 L16 -30Z",fill:CR,stroke:INK,"stroke-width":3},root);
  // Kopf mit Nase, Kinn, Haar
  const head=el("g",{},root);
  el("path",{d:"M-14 -88 C-14 -110,26 -112,30 -90 L34 -80 L40 -74 L33 -70 L34 -62 C30 -50,10 -46,0 -50 C-12 -54,-16 -70,-14 -88Z",fill:CR,stroke:INK,"stroke-width":3.5,"stroke-linejoin":"round"},head);
  el("path",{d:"M-16 -84 C-20 -110,10 -122,34 -100 C24 -104,10 -102,4 -96 C0 -90,-6 -84,-16 -78Z",fill:INK},head);
  el("path",{d:"M14 -84 L30 -80",stroke:INK,"stroke-width":4.5,"stroke-linecap":"round",transform:mood==="angry"?"rotate(12 22 -82)":"rotate(-6 22 -82)"},head);
  el("path",{d:"M18 -76 Q24 -79 28 -75",fill:"none",stroke:INK,"stroke-width":3},head);el("circle",{cx:24,cy:-75,r:2.2,fill:INK},head);
  el("path",{d:mood==="shock"?"M22 -58 q5 4 10 0":"M20 -58 L32 -60",fill:"none",stroke:INK,"stroke-width":3,"stroke-linecap":"round"},head);
  if(mood==="shock"){el("path",{d:"M-18 -96 q-8 10 0 15 q6 -6 0 -15z",fill:CR,stroke:INK,"stroke-width":2},head);}
  // Arm: Schulter -> Ellbogen -> Faust
  const sh=el("g",{transform:"translate(12,-20)"},root);const upper=el("g",{},sh);
  el("path",{d:"M-10 0 L10 0 L8 46 L-8 46Z",fill:INK,stroke:CR,"stroke-width":2.5},upper);
  const el2=el("g",{transform:"translate(0,46)"},upper);const fore=el("g",{},el2);
  el("path",{d:"M-7 0 L7 0 L6 40 L-6 40Z",fill:CR,stroke:INK,"stroke-width":3},fore);
  const f=el("g",{transform:"translate(0,48)"},fore);el("rect",{x:-11,y:-10,width:22,height:20,rx:6,fill:CR,stroke:INK,"stroke-width":3},f);el("path",{d:"M-11 -2 h8 M-11 4 h8",stroke:INK,"stroke-width":2},f);
  return {root,upper,fore,head};}
const rot=(g,a)=>g.setAttribute("transform",`rotate(${a})`);
function anim(g,frames,ms,ease){const a0=frames[0],a1=frames[frames.length-1];const fast=ease&&ease.indexOf("1,.5")>=0;const f=t=>fast?t*t*t:(t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2);
  let res;const p=new Promise(r=>res=r);const t0=performance.now();const step=now=>{const t=Math.min(1,(now-t0)/ms);rot(g,a0+(a1-a0)*f(t));if(t<1)requestAnimationFrame(step);else res();};requestAnimationFrame(step);return {finished:p};}
function tableTop(par,y){el("rect",{x:10,y,width:350,height:40,fill:"#3A332F"},par);el("path",{d:`M10 ${y} H360`,stroke:INK,"stroke-width":4},par);el("path",{d:`M10 ${y+6} H360`,stroke:"#5A524B","stroke-width":2},par);}
function dust(par,x,y,n){for(let k=0;k<n;k++){const a=-Math.PI*(Math.random()*.9+.05),d=20+Math.random()*40;const c=el("circle",{cx:x,cy:y,r:3+Math.random()*5,fill:CR,stroke:INK,"stroke-width":1.5},par);c.animate([{transform:"translate(0,0)",opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px)`,opacity:0}],{duration:600,fill:"forwards",easing:"ease-out"});}}
function jump(node,x,y,dy,r,ms,sc){sc=sc||1;return node.animate([{transform:`translate(${x}px,${y}px) rotate(0) scale(${sc})`},{transform:`translate(${x}px,${y-dy}px) rotate(${r}deg) scale(${sc})`,offset:.45},{transform:`translate(${x}px,${y}px) rotate(${r*1.6}deg) scale(${sc})`}],{duration:ms||520,easing:"cubic-bezier(.3,.7,.5,1)",fill:"forwards"});}
async function slamProfile(par,y,h,trail){const ty=y+h-30;tableTop(par,ty);const cupG=cup(par,240,ty,.5);const d=die(par,200,ty-9,.45,10);
  const A=figure(par,74,y+h-22,.85,false,"angry"),B=figure(par,305,y+h-22,.85,true,"smug");rot(B.upper,-30);rot(B.fore,-70);rot(A.upper,-20);rot(A.fore,-60);
  await wait(250);anim(A.upper,[-20,-160],520,"cubic-bezier(.3,0,.3,1)");await anim(A.fore,[-60,-20],520).finished;await wait(220);
  if(trail){for(let k=0;k<6;k++){const a=(-150+k*30)*Math.PI/180;el("path",{d:`M${70+12*.7} ${y+h+8-20*.7} m${Math.sin(-a)*60} ${-Math.cos(-a)*60} a60 60 0 0 1 10 10`,stroke:INK,"stroke-width":3,fill:"none",opacity:.5},par);}
    el("path",{d:`M${78} ${y+h-60} A62 62 0 0 1 ${142} ${ty-6}`,fill:"none",stroke:CR,"stroke-width":10,opacity:.8,"stroke-linecap":"round"},par);el("path",{d:`M${74} ${y+h-56} A68 68 0 0 1 ${144} ${ty-2}`,fill:"none",stroke:INK,"stroke-width":2,"stroke-dasharray":"6 6"},par);}
  anim(A.upper,[-160,-75],160,"cubic-bezier(.7,0,1,.5)");await anim(A.fore,[-20,-15],160,"cubic-bezier(.7,0,1,.5)").finished;
  shake(stage,8,280);dust(par,150,ty,10);jump(d,200,ty-9,30,90,520,.45);jump(cupG,240,ty,14,-12,520,.5);const wm=sfx(par,215,y+34,tx("comicSlam","WUMMS!"),26,6,RED);
  anim(B.head,[0,-6],200);await wait(650);wm.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards"});bubble(par,150,y+26,150,32,92,y+46,tx("comicNoCount","DAS ZÄHLT NICHT!"),11);}
function gutterBG(){const g=el("rect",{x:0,y:0,width:370,height:680,fill:"#FFFDF6"});return g;}
function realLogo(par,cx,cy,w,rot){const src=document.querySelector(".gt-hero-logo svg");const h=w*179/404;
  const g=el("g",{},par);const sv=document.createElementNS(NS,"svg");sv.setAttribute("viewBox",src.getAttribute("viewBox"));sv.setAttribute("x",cx-w/2);sv.setAttribute("y",cy-h/2);sv.setAttribute("width",w);sv.setAttribute("height",h);sv.setAttribute("overflow","visible");
  [...src.children].forEach(n=>{if(n.tagName!=="defs")sv.appendChild(n.cloneNode(true));});g.appendChild(sv);
  g.style.transformOrigin=`${cx}px ${cy}px`;g.style.transformBox="view-box";g.style.transform=`rotate(${rot||0}deg)`;return g;}
function bigSfx(par,x,y,txt,size,rot,fill,stroke2){const g=el("g",{},par);const mk=(dx,dy,f,sw)=>{const t=el("text",{x:x+dx,y:y+dy,"text-anchor":"middle","font-family":"'Bagel Fat One',sans-serif","font-size":size,fill:f,stroke:INK,"stroke-width":sw,"paint-order":"stroke fill","stroke-linejoin":"round","letter-spacing":"-1"},g);t.textContent=txt;return t;};
  mk(size*.06,size*.08,INK,size*.2);mk(0,0,stroke2||CR,size*.2);mk(0,0,fill||RED,size*.07);
  g.style.transformOrigin=`${x}px ${y-size*.3}px`;g.style.transformBox="view-box";g.style.transform=`rotate(${rot||0}deg)`;
  g.animate([{transform:`rotate(${rot||0}deg) scale(3)`,opacity:0},{transform:`rotate(${rot||0}deg) scale(.9)`,opacity:1,offset:.6},{transform:`rotate(${rot||0}deg) scale(1)`,opacity:1}],{duration:260,easing:"steps(4,end)"});return g;}
function impact(n){return (async()=>{for(let k=0;k<(n||2);k++){box.style.filter="invert(1) grayscale(1) contrast(3)";await wait(60);box.style.filter="";await wait(50);}})();}
async function logoBurst(par,cx,cy,w,word){speed(par,cx,cy,52,150,480);const st=el("path",{d:star(20,w*.66,w*.46),fill:CR,stroke:INK,"stroke-width":7,transform:`translate(${cx},${cy})`},par);
  const g=realLogo(par,cx,cy+4,w,-5);g.animate([{transform:"rotate(-5deg) scale(2.6)",opacity:0},{transform:"rotate(-5deg) scale(.94)",opacity:1,offset:.7},{transform:"rotate(-5deg) scale(1)",opacity:1}],{duration:300,easing:"steps(5,end)",fill:"forwards"});
  await wait(260);impact(1);shake(phone,12,420);shards({x:cx,y:cy},18,240,[CR,INK,RED]);if(word)bigSfx(par,cx,cy-w*.62,word,44,-8);}
const B = (y, h) => "10," + y + " 360," + y + " 360," + (y + h) + " 10," + (y + h);
async function tearOut() {
  const pts = []; for (let y = 0; y <= 680; y += 30) pts.push([185 + ((y / 30) % 2 ? 13 : -13), y]);
  const zig = pts.map((p) => p.join(",")).join(" ");
  box.style.background = "transparent";
  const nodes = [...fx.children].filter((n) => n.tagName !== "defs");
  const mk = (side) => { const id = "gtcTear" + side; const cp = el("clipPath", { id }, fx.querySelector("defs")); el("polygon", { points: side === "L" ? `-400,-400 ${zig} -400,1100` : `800,-400 ${zig} 800,1100` }, cp);
    const g = el("g", { "clip-path": `url(#${id})` }); const bg = el("rect", { x: -400, y: -400, width: 1200, height: 1500, fill: "#FFFDF6" }, g); nodes.forEach((n) => g.appendChild(n.cloneNode(true))); return g; };
  const L = mk("L"), R = mk("R"); nodes.forEach((n) => n.remove()); shake(phone, 6, 240);
  await Promise.all([
    L.animate([{ transform: "none" }, { transform: "translate(-40px,0) rotate(-3deg)", offset: 0.2 }, { transform: "translate(-560px,120px) rotate(-22deg)" }], { duration: 700, easing: "cubic-bezier(.5,0,.8,.5)", fill: "forwards" }).finished,
    R.animate([{ transform: "none" }, { transform: "translate(40px,0) rotate(3deg)", offset: 0.2 }, { transform: "translate(560px,120px) rotate(22deg)" }], { duration: 700, easing: "cubic-bezier(.5,0,.8,.5)", fill: "forwards" }).finished,
  ]);
}
async function story() {
  fx.appendChild(gutterBG()); defs();
  let p = panel(B(10, 66), "url(#htC)"); eye(p.inner, 120, 43, 70, 1); eye(p.inner, 250, 43, 70, 1); await wait(1000);
  p = panel(B(84, 66), "url(#htK)"); eye(p.inner, 120, 117, 70, -1); eye(p.inner, 250, 117, 70, -1); await wait(1000);
  p = panel(B(158, 100), "url(#htC)"); const y = 158, h = 100; table(p.inner, y, h); die(p.inner, 185, y + h - 46, 0.75, 12); const c = cup(p.inner, 185, y + h - 26, 0.95);
  const q = el("text", { x: 300, y: y + 46, "text-anchor": "middle", "font-family": "'Bagel Fat One',sans-serif", "font-size": 30, fill: INK }, p.inner); q.textContent = "?";
  c.animate([{ transform: `translate(185px,${y + h - 26}px) scale(.95) rotate(0)` }, { transform: `translate(185px,${y + h - 26}px) scale(.95) rotate(-3deg)` }, { transform: `translate(185px,${y + h - 26}px) scale(.95) rotate(3deg)` }, { transform: `translate(185px,${y + h - 26}px) scale(.95) rotate(0)` }], { duration: 300, iterations: 3 });
  await wait(1000); await c.animate([{ transform: `translate(185px,${y + h - 26}px) scale(.95)` }, { transform: `translate(185px,${y + h - 60}px) scale(.95) rotate(-6deg)` }], { duration: 1200, easing: "ease-in-out", fill: "forwards" }).finished;
  await wait(500);
  p = panel(B(266, 150), "url(#htC)"); await slamProfile(p.inner, 266, 150); await wait(1100);
  await impact(2);
  p = panel("10,424 360,424 360,670 10,670", "url(#htR)"); speed(p.inner, 185, 548, 60, 40, 420);
  const w = bigSfx(p.inner, 185, 566, tx("comicCrash","KRACH!"), 56, -6, CR, INK); shake(phone, 10, 380); await wait(600);
  await w.animate([{ opacity: 1, transform: "rotate(-6deg) scale(1)" }, { opacity: 0, transform: "rotate(-6deg) scale(1.6)" }], { duration: 220, fill: "forwards" }).finished; w.remove();
  await logoBurst(p.inner, 185, 548, 175);
  await wait(1150);
}
let busy = false;
async function playRyuComic() {
  if (busy) return; busy = true;
  try {
    box = document.createElement("div");
    box.setAttribute("aria-hidden", "true");
    box.style.cssText = "position:fixed;inset:0;z-index:300;background:#FFFDF6;display:flex;align-items:center;justify-content:center;overflow:hidden;";
    fx = document.createElementNS(NS, "svg"); fx.setAttribute("viewBox", "0 0 370 680"); fx.setAttribute("preserveAspectRatio", "xMidYMid meet");
    fx.style.cssText = "width:100%;height:100%;overflow:visible;display:block";
    box.appendChild(fx); document.body.appendChild(box); stage = box; phone = box; PID = 0;
    const rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rm) { box.style.background = CR; await box.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 500 }).finished; }
    else { await box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, fill: "forwards" }).finished; await story(); await tearOut(); }
  } catch (e) { /* nur Optik */ }
  try { box && box.remove(); } catch (e) {}
  box = fx = stage = phone = null; busy = false;
}

return playRyuComic;
})();
export { gtRyuComic as playRyuComic };
