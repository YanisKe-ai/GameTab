// Erzeugt von tools/split.mjs aus index.html. Inhalt zwischen den gt-body-Markern ist 1:1 Originalcode.
/*@gt-body-begin*//* Ergebnisbild "Night League" ohne Koernung: Renderer (Canvas 2D) mit Adapter. Schriften als Dateien in fonts/ (Anton OFL, DejaVu Sans, Noto Sans CJK SC nur bei CJK-Text). */
const GT_EC=(function(){'use strict';
/* Night League Ergebnisbild. Farben und Texte aus dem Designpaket (themes.json). Schriften: GT Anton (Name, 01), GT InterBI (gewinnt., Score), GT Inter (Tabelle), Baloo 2 (Logo).
   Layout: jedes Element wird als Menge transformierter Glyphen-Vierecke gemessen (Neigung, Scherung, Skalierung). Die Abstaende entstehen aus diesen Konturen, nicht aus festen Koordinaten. */
const acc={skyjo:"#C5FF25",flip7:"#FFAE57","jass-differenzler":"#EFD58A",schieber:"#EFD58A",yatzy:"#FF8FA3",tutto:"#FF6654",darts:"#54E0D0",cricket:"#51DFC1",hiscore:"#72D9FF",splitscore:"#FFCC62",shanghai:"#FF836D",wizard:"#C4A1FF",minigolf:"#AAE36B",freeplay:"#92B5FF",phase10:"#7CC0FF",romme:"#FF8FBE",tabu:"#FFAD70",headsup:"#A9AAFF"};
const themes={};Object.keys(acc).forEach(k=>{themes[k]=["#0B0B0C",acc[k]];});
const fallback=["#0B0B0C","#92B5FF"];
const FG="#F7F3E3",ON="#0A0A0A";
const EMO='sans-serif';
const DISP='"GT Anton","GT Inter","GT Clean","GT CJK",'+EMO;
const BLK='"GT InterBI","GT Inter","GT Clean","GT CJK",'+EMO;
const SANS='"GT Inter","GT Clean","GT CJK",'+EMO;
const LOGO='"Baloo 2","GT Inter","GT Clean",sans-serif';
/* Gemeinsame Designparameter, kalibriert an der Skyjo-Mastervorlage (1080 x 1440) */
const P={W:1080,NX:70,NAW:730,CAP1:550,BLOCK:600,SY:1.9,HX:0.95,HXMIN:0.46,HXMIN2:0.58,SK:0.11,RISE:0.14,
K:0.27,LW:6,GAP:{name:18,line:12,score:20,deco:18,digit:34,star:14,table:24},
WIN:{x:60,fs:165,maxW:540,hx:0.9,sy:1.25,rise:0.19},
SC:{fs:315,right:1030,hx:1.12,hxMin:0.56,sy:1,rise:0.06,fMin:0.5,minGap:40},
DECO:{cap:380,hx:1.25,sy:1.9,minF:0.55,vis:0.5},FOOT:149};
const PAD=320,PW=P.W+2*PAD;
function rng(seed){let a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
/* Koernung: deckende Hintergrundkachel (Grundton plus feines symmetrisches Rauschen), hellt nicht auf */
const TILES={};
function tile(sig,seed){const key=sig+'_'+seed;if(TILES[key])return TILES[key];const N=512;const t=document.createElement('canvas');t.width=t.height=N;const x=t.getContext('2d');const d=x.createImageData(N,N);const r=rng(seed);for(let i=0;i<N*N;i++){const n=(r()+r()+r()-1.5)*2*sig;const v=Math.max(0,Math.min(255,Math.round(12+n)));d.data[i*4]=v;d.data[i*4+1]=v;d.data[i*4+2]=Math.min(255,v+1);d.data[i*4+3]=255;}x.putImageData(d,0,0);TILES[key]=t;return t;}
function split(tokens,joiner,L,mw){const n=tokens.length;if(L>n)L=n;const w=(a,b)=>{let s=0;for(let i=a;i<b;i++)s+=mw(tokens[i])+(i>a?mw(joiner):0);return s;};const INF=1e12;const dp=[],bk=[];for(let l=0;l<=L;l++){dp.push(new Array(n+1).fill(INF));bk.push(new Array(n+1).fill(0));}dp[0][0]=0;for(let l=1;l<=L;l++)for(let j=l;j<=n;j++)for(let i=l-1;i<j;i++){const v=Math.max(dp[l-1][i],w(i,j));if(v<dp[l][j]){dp[l][j]=v;bk[l][j]=i;}}const out=[];let j=n;for(let l=L;l>=1;l--){const i=bk[l][j];out.unshift(tokens.slice(i,j).join(joiner));j=i;}return out;}
/* ---- Geometrie: Vierecke, Spaltenprofile ---- */
const T=(x,y,rise,skew,hx,sy)=>(u,v)=>{const X=hx*u-skew*sy*v;return[x+X,y+sy*v-rise*X];};
const quad=(f,l,r,tp,bt)=>{const a=f(l,tp),b=f(r,tp),c=f(r,bt),d=f(l,bt);return[a[0],a[1],b[0],b[1],c[0],c[1],d[0],d[1]];};
const rectQ=(x,y,w,h)=>[x,y,x+w,y,x+w,y+h,x,y+h];
const mvQ=(qs,dx,dy)=>qs.map(q=>q.map((v,i)=>v+(i%2?dy:dx)));
function prof(qs){const t=new Float32Array(PW).fill(1e9),b=new Float32Array(PW).fill(-1e9);qs.forEach(q=>{let mn=1e9,mx=-1e9;for(let i=0;i<8;i+=2){mn=Math.min(mn,q[i]);mx=Math.max(mx,q[i]);}const a=Math.max(0,Math.floor(mn)+PAD),e=Math.min(PW-1,Math.ceil(mx)+PAD);for(let xi=a;xi<=e;xi++){const x=Math.min(mx,Math.max(mn,xi-PAD));let lo=1e9,hi=-1e9;for(let k=0;k<4;k++){const x1=q[k*2],y1=q[k*2+1],x2=q[(k*2+2)%8],y2=q[(k*2+3)%8];const l=Math.min(x1,x2),r=Math.max(x1,x2);if(x<l-1e-6||x>r+1e-6)continue;if(r-l<1e-6){lo=Math.min(lo,y1,y2);hi=Math.max(hi,y1,y2);continue;}const y=y1+(y2-y1)*(x-x1)/(x2-x1);lo=Math.min(lo,y);hi=Math.max(hi,y);}if(lo<=hi){if(lo<t[xi])t[xi]=lo;if(hi>b[xi])b[xi]=hi;}}});return{t,b};}
function dil(p,h){if(!h)return p;const t=new Float32Array(PW).fill(1e9),b=new Float32Array(PW).fill(-1e9);for(let i=0;i<PW;i++){if(p.b[i]<-1e8)continue;const a=Math.max(0,i-h),e=Math.min(PW-1,i+h);for(let j=a;j<=e;j++){if(p.t[i]<t[j])t[j]=p.t[i];if(p.b[i]>b[j])b[j]=p.b[i];}}return{t,b};}
/* kleinste Verschiebung nach unten, damit 'low' mit Abstand unter 'up' liegt */
function needDown(up,low,gap,h){const u=dil(up,h);let d=-1e9;for(let i=0;i<PW;i++)if(low.b[i]>-1e8&&u.b[i]>-1e8)d=Math.max(d,u.b[i]+gap-low.t[i]);return d;}
/* groesste Verschiebung, damit 'obj' mit Abstand ueber 'low' bleibt */
function roomAbove(low,obj,gap,h){const l=dil(low,h);let d=1e9;for(let i=0;i<PW;i++)if(obj.b[i]>-1e8&&l.b[i]>-1e8)d=Math.min(d,l.t[i]-gap-obj.b[i]);return d;}
function hitD(a,c,gap){for(let i=0;i<PW;i++)if(a.b[i]>-1e8&&c.b[i]>-1e8&&a.t[i]<c.b[i]+gap&&a.b[i]>c.t[i]-gap)return true;return false;}
function hit(a,b,gap,h){const c=dil(b,h);for(let i=0;i<PW;i++)if(a.b[i]>-1e8&&c.b[i]>-1e8&&a.t[i]<c.b[i]+gap&&a.b[i]>c.t[i]-gap)return true;return false;}
function ext(qs){let l=1e9,r=-1e9,t=1e9,b=-1e9;qs.forEach(q=>{for(let i=0;i<8;i+=2){l=Math.min(l,q[i]);r=Math.max(r,q[i]);t=Math.min(t,q[i+1]);b=Math.max(b,q[i+1]);}});return{l,r,t,b};}
const lineQ=(x0,x1,cc)=>{const h=P.LW/2;return[x0,cc-P.K*x0-h,x1,cc-P.K*x1-h,x1,cc-P.K*x1+h,x0,cc-P.K*x0+h];};
/* Linie y=c-Kx im Bereich [x0,x1] mit Abstand unter allen Profilen */
function lineBelow(ps,x0,x1,gap,h){let cc=-1e9;ps.forEach(p0=>{const p=dil(p0,h);for(let x=Math.ceil(x0);x<=x1;x++){const i=x+PAD;if(i<0||i>=PW||p.b[i]<-1e8)continue;cc=Math.max(cc,p.b[i]+gap+P.LW/2+P.K*x);}});return cc;}
function render(model,factory){
if(!model||!Array.isArray(model.rows))throw Error('A ranked rows array is required.');
const m=model,rows=m.rows,W=P.W;
const a=(themes[m.gameId]||fallback)[1];
const cv=factory?factory(W,1440):document.createElement('canvas');cv.width=W;cv.height=1440;
let c=cv.getContext('2d');
const str=v=>String(v==null?'':v);
const seg=s=>typeof Intl!=='undefined'&&typeof Intl.Segmenter==='function'?Array.from(new Intl.Segmenter(m.locale||'de-CH',{granularity:'grapheme'}).segment(s),v=>v.segment):Array.from(s);
const fnt=(w,s,fam)=>c.font=w+' '+s+'px '+fam;
const mwid=(s,w,sz,fam)=>{fnt(w,sz,fam);return c.measureText(s).width;};
const wrap=(value,max,w,sz,fam)=>{const text=str(value);if(text.length>4000)throw Error('Text exceeds supported export length.');fnt(w,sz,fam);const out=[];let cur='';for(const word of text.split(/\s+/u)){if(!word)continue;const test=cur?cur+' '+word:word;if(c.measureText(test).width<=max){cur=test;continue;}if(cur)out.push(cur);cur='';for(const g of seg(word)){if(c.measureText(cur+g).width>max&&cur){out.push(cur);cur=g;}else cur+=g;}}if(cur||!out.length)out.push(cur);return out;};
const placed=(x,y,rise,skew,hx,sy,fn)=>{c.save();c.translate(x,y);c.transform(1,-rise,0,1,0,0);c.transform(1,0,-skew,1,0,0);c.scale(hx,sy);fn();c.restore();};
/* Glyphenkonturen einer Zeile (Schrift muss gesetzt sein), transformiert */
const glyphQ=(text,f)=>{const out=[];let pre='';seg(text).forEach(q=>{const pen=c.measureText(pre).width;const mt=c.measureText(q);if(q.trim()){const l=pen-(mt.actualBoundingBoxLeft||0),r=pen+(mt.actualBoundingBoxRight||mt.width);if(r>l)out.push(quad(f,l,r,-(mt.actualBoundingBoxAscent||0),mt.actualBoundingBoxDescent||0));}pre+=q;});return out;};
const boxes=[];const keep=(id,qs,extra)=>{boxes.push(Object.assign({id:id,q:qs.map(q=>q.map(v=>Math.round(v*10)/10))},extra||{}));};
/* ---- Kopf ---- */
fnt(800,66,LOGO);const gwL=c.measureText('Game').width,twL=c.measureText('Tab').width;const logoM=c.measureText('GameTab');
const logoQ=[rectQ(62,96-(logoM.actualBoundingBoxAscent||50),gwL+twL,(logoM.actualBoundingBoxAscent||50)+(logoM.actualBoundingBoxDescent||4))];
const L0=str(m.gameLabel||'GameTab').toUpperCase();let lsz=38,lsp=14;fnt(400,lsz,SANS);const lprobe=()=>seg(L0).reduce((p,q)=>p+c.measureText(q).width,0)+lsp*(seg(L0).length-1);while(lprobe()>440&&lsp>2)lsp--;while(lprobe()>440&&lsz>18){lsz-=2;fnt(400,lsz,SANS);}const ltw=lprobe();
const labelQ=[rectQ(1018-ltw-4,82-lsz*0.75,ltw+4,lsz*0.75+14)];
const headP=prof(logoQ.concat(labelQ,[rectQ(0,40,W,40)]));
/* ---- Siegername planen: zuerst Breite (hx), dann Groesse, dann Umbruch ---- */
const names=m.heroNames||[];
const heroText=(names.length?names.join(' & '):(rows.length?'Ergebnis':'Noch kein Ergebnis')).toUpperCase().replace(/\s+/gu,' ').trim();
fnt(400,100,DISP);const capR=(c.measureText('H').actualBoundingBoxAscent/100)||0.73;
const mw100=s=>mwid(s,400,100,DISP);
const words=heroText.split(' ').filter(Boolean);const toks=[];words.forEach((w,wi)=>{const parts=w.split(/(?<=[-‐‑–])/u).filter(Boolean);parts.forEach((q,k)=>toks.push(q+(k===parts.length-1&&wi<words.length-1?' ':'')));});const gr=seg(heroText);
const CT=L=>L===1?P.CAP1:Math.round(P.BLOCK/(L+0.12*(L-1)));
function plan(L){let lines;if(L===1)lines=[heroText];else{let cand=null;if(toks.length>=L)cand=split(toks,'',L,s=>mw100(s.trim()));const cg=split(gr,'',L,mw100);const mx=q=>Math.max(...q.map(s=>mw100(s.trim())));if(!cand||mx(cg)<mx(cand)*0.62)cand=cg;lines=cand.map(s=>s.trim()||s);}
const wI=Math.max(...lines.map(mw100))/100;let cap=CT(L),s=cap/(capR*P.SY),hx=(P.NAW-P.SK*cap)/(wI*s);
const hm=L===1?P.HXMIN:P.HXMIN2;if(hx>P.HX)hx=P.HX;if(hx<hm){hx=hm;s=P.NAW/(wI*hm+P.SK*capR*P.SY);cap=capR*s*P.SY;}
return{L,lines,s,hx,cap};}
let pl=plan(1);
if(pl.cap<CT(1)*0.8){const Lmax=Math.max(2,Math.min(14,gr.length));let best=pl;for(let L=2;L<=Lmax;L++){const q=plan(L);if(q.cap>=CT(L)*0.9){best=q;break;}if(q.cap*Math.sqrt(q.L)>best.cap*Math.sqrt(best.L))best=q;}pl=best;}
const lstep=pl.cap*1.12;
/* Zeilen nach echten Konturen stapeln (Akzente, Umlaute, Unterlaengen) */
const nameQ0=[],lineY=[];{let prevP=null,y=0;pl.lines.forEach((ln,i)=>{fnt(400,pl.s,DISP);let q=glyphQ(ln,T(P.NX,0,P.RISE,P.SK,pl.hx,P.SY));if(i){y=Math.max(y+lstep,needDown(prevP,prof(q),pl.cap*0.07,6));}q=mvQ(q,0,y);lineY.push(y);prevP=prof(q);nameQ0.push(...q);});}
const nDy=Math.max(needDown(headP,prof(nameQ0),P.GAP.name,14),-1e8);
const nameY=nDy;const nameQ=mvQ(nameQ0,0,nameY);const nameP=prof(nameQ);
/* ---- Siegerwort ---- */
const gww=str(m.winWord||(names.length>1?'gewinnen.':'gewinnt.'));let gfs=P.WIN.fs;{const w0=mwid(gww,900,gfs,BLK)*P.WIN.hx;if(w0>P.WIN.maxW)gfs=Math.floor(gfs*P.WIN.maxW/w0);}
fnt(900,gfs,BLK);const winQ0=glyphQ(gww,T(P.WIN.x,0,P.WIN.rise,0,P.WIN.hx,P.WIN.sy));
const winY=needDown(nameP,prof(winQ0),P.GAP.name,10);const winQ=mvQ(winQ0,0,winY);const winP=prof(winQ);const winE=ext(winQ);
/* ---- Punktzahl: zuerst Breite, dann Groesse, sonst eigene Zeile ---- */
const valueRaw=str(m.heroValue==null?'—':m.heroValue);
fnt(900,P.SC.fs,BLK);const scQ1=glyphQ(valueRaw,T(0,0,P.SC.rise,0,1,P.SC.sy));const scE1=ext(scQ1);const scW1=scE1.r-scE1.l;
const mkSc=(f,shx)=>{fnt(900,P.SC.fs*f,BLK);let q=glyphQ(valueRaw,T(0,0,P.SC.rise,0,shx,P.SC.sy));const e=ext(q);return mvQ(q,P.SC.right-e.r,0);};
/* Zahl rechts neben dem Siegerwort: Abstaende aus den Profilen, nicht aus Begrenzungsrechtecken */
const besideTry=(f,shx)=>{let q=mkSc(f,shx);const e=ext(q);const x2=Math.round(Math.max(e.l,winE.r+16));const c2=Math.max(lineBelow([nameP],-10,W+10,P.GAP.line,6),lineBelow([winP],x2,W+10,P.GAP.line,6));const s2=prof([lineQ(x2,W+10,c2)]);const dy=Math.max(needDown(s2,prof(q),P.GAP.line,6),needDown(winP,prof(q),P.GAP.score,P.GAP.score));q=mvQ(q,0,dy);const e2=ext(q);return{q,dy,x2,c2,ok:e2.b<=winE.b+40};};
let f=1,shx=P.SC.hx,stack=false,bt=null;
{const avail=P.SC.right-(winE.r-40);if(scW1*shx>avail)shx=Math.max(P.SC.hxMin,avail/scW1);
for(let k=0;k<40;k++){bt=besideTry(f,shx);if(bt.ok)break;if(shx>P.SC.hxMin+1e-6)shx=Math.max(P.SC.hxMin,shx*0.95);else if(f>P.SC.fMin)f=Math.max(P.SC.fMin,f*0.95);else{stack=true;break;}}}
if(stack){shx=Math.max(P.SC.hxMin,Math.min(P.SC.hx,(P.SC.right-P.WIN.x)/scW1));f=Math.min(1,(P.SC.right-P.WIN.x)/(scW1*shx));}
const scFs=P.SC.fs*f;let scQ=mkSc(f,shx);let scE=ext(scQ);
/* ---- Diagonale(n): Linie 1 unter dem Siegerwort, Linie 2 ueber der Zahl, gleiche Steigung ---- */
let segs,scY;
if(!stack){scQ=bt.q;scY=bt.dy;scE=ext(scQ);const sp=prof(scQ);let x1=Math.round(winE.r-20);const c1=lineBelow([winP,nameP],-10,x1,P.GAP.line,6);while(x1>winE.l+40&&hit(prof([lineQ(-10,x1,c1)]),sp,P.GAP.line,P.GAP.line))x1-=4;segs=[{x0:-10,x1:x1,c:c1},{x0:bt.x2,x1:W+10,c:bt.c2}];}
else{const c1=lineBelow([winP,nameP],-10,W+10,P.GAP.line,6);segs=[{x0:-10,x1:W+10,c:c1}];}
const segQ=segs.map(s=>lineQ(s.x0,s.x1,s.c));const segP=prof(segQ);
if(stack){scY=Math.max(needDown(segP,prof(scQ),P.GAP.line,6),needDown(winP,prof(scQ),P.GAP.score,24));scQ=mvQ(scQ,0,scY);}
scE=ext(scQ);const scP=prof(scQ);
const scBase=scY;/* Grundlinie bei x=0 der Zahltransformation */
/* ---- Einheit ---- */
const u=str(m.unitLabel||'').toLocaleUpperCase?str(m.unitLabel||'').toUpperCase():'';
let unitQ=[],unitY=0,unitTot=0;if(u){fnt(800,34,SANS);const g=seg(u);const ws=g.map(q=>c.measureText(q).width);unitTot=ws.reduce((p,q)=>p+q,0)+11*(g.length-1);const mt=c.measureText(u);const f0=T(1012,0,0.03,0.2,1,1);unitQ=[quad(f0,-unitTot,0,-(mt.actualBoundingBoxAscent||25),mt.actualBoundingBoxDescent||2)];unitY=needDown(scP,prof(unitQ),12,8);unitQ=mvQ(unitQ,0,unitY);}
const unitP=prof(unitQ);
/* ---- 01-Kontur: eigener Bereich rechts vom Namen, ueber Linie 2, darf rechts angeschnitten sein ---- */
let deco=null;
if(!m.interim&&names.length){const digitEnd=pl.lines.some(l=>/\p{N}$/u.test(l.trim()));const dgap=P.GAP.deco+(digitEnd?P.GAP.digit:0);const dcap=P.DECO.cap*(digitEnd?0.85:1);
for(let fd=1;fd>=P.DECO.minF-1e-6&&!deco;fd-=0.075){const cap=Math.min(dcap,pl.cap*pl.L*0.85+60)*fd;const s=cap/(capR*P.DECO.sy);fnt(400,s,DISP);const q0=glyphQ('01',T(0,0,P.RISE,P.SK,P.DECO.hx,P.DECO.sy));const e0=ext(q0);
for(let x=560;x<=W;x+=6){let q=mvQ(q0,x-e0.l,0);const p0=prof(q);const dy=roomAbove(segP,p0,10,4);if(dy>1e8)continue;q=mvQ(q,0,dy);const e=ext(q);if(e.t<104)continue;const vis=Math.min(1,(W-e.l)/(e.r-e.l));if(vis<P.DECO.vis)break;const p=prof(q);if(hit(p,nameP,dgap,dgap)||hit(p,headP,12,8)||hit(p,winP,dgap,dgap))continue;deco={q,x:x-e0.l,y:dy,s,cap};break;}}}
const decoP=deco?prof(deco.q):null;
/* ---- Vierzack ---- */
let star=null;{const r=32;const cand=[[872,195],[900,190],[930,190],[845,180],[960,200],[990,215],[1000,260]];for(const [sx,sy] of cand){const q=[[sx,sy-r,sx+r,sy,sx,sy+r,sx-r,sy]];const p=prof(q);if(hit(p,nameP,P.GAP.star,P.GAP.star)||hit(p,headP,P.GAP.star,8))continue;if(decoP&&hit(p,decoP,10,10))continue;star={x:sx,y:sy,r,q};break;}}
const starP=star?prof(star.q):null;

/* ---- Schachbrett: links neben der Zahl, tritt bei Platzmangel zurueck ---- */
const CW=34,CH=36;let chk=null;const objTop=ps=>{let mx=-1e9;ps.forEach(p=>{for(let x=60;x<=1020;x++){const i=x+PAD;if(p.b[i]>mx)mx=p.b[i];}});return Math.ceil(mx+P.GAP.table);};const baseTop=objTop([winP,segP,scP,unitP]);
const cellQ=(ax,ay,cols,z)=>{const f0=T(ax,ay,0.3,0.2,z,z);const out=[];for(let ry=0;ry<3;ry++)for(let cx=0;cx<cols;cx++){if((ry+cx)%2)continue;out.push(quad(f0,cx*CW,cx*CW+CW-2,-(ry+1)*CH,-(ry+1)*CH+CH-2));}return out;};
{const gaps=[18,20,12,8,18];const all=[winP,scP,unitP,segP,nameP].map((o,k)=>dil(o,gaps[k]));
for(const z of [1,0.86,0.74])for(let cols=6;cols>=3&&!chk;cols--){const q0=cellQ(0,0,cols,z);const e0=ext(q0);
const ay0=scE.b-60-e0.b;for(let dyy=0;dyy<=140&&!chk;dyy+=6){const q1=mvQ(q0,0,ay0+dyy);/* rechte Kante an Zahl ausrichten (horizontal suchen) */
for(let x=Math.round(scE.l+60-e0.r);x>=P.WIN.x;x-=6){const q=mvQ(q1,x,0);if(ext(q).b>baseTop-14)continue;const p=prof(q);if(all.some((o,k)=>hitD(p,o,gaps[k])))continue;chk={q,ax:x,ay:ay0+dyy,cols,z};break;}}}}
const chkP=chk?prof(chk.q):null;
/* ---- Tabelle planen ---- */
const NX=271,RX=980,LX=128;
const tableTop=Math.max(baseTop,chk?Math.ceil(ext(chk.q).b+14):0);
const vals=rows.map(r=>str(r.value==null?'—':r.value));
let vsz=44;let vmax=Math.max(1,...vals.map(v=>mwid(v,800,vsz,SANS)));const valCol=Math.min(vmax,Math.round((RX-NX)*0.5));
const nameAvail=RX-valCol-34-NX;
const prepared=rows.map((r,i)=>{if(!Number.isInteger(r.rank)||r.rank<1)throw Error('Explicit positive rank required.');
let vs=vsz;fnt(800,vs,SANS);while(c.measureText(vals[i]).width>valCol&&vs>20){vs-=2;fnt(800,vs,SANS);}
let nsz=44;const nm=str(r.name||m.emptyNameLabel||'—');let lines=wrap(nm,nameAvail,800,nsz,SANS);if(lines.length>1){nsz=36;lines=wrap(nm,nameAvail,800,nsz,SANS);}
const rk=str(r.rank).padStart(2,'0');
const h=Math.max(76,lines.length>1?Math.round(lines.length*nsz*1.22+30):0);
return{r,v:vals[i],vs,lines,nsz,rk,h};});
const tableH=prepared.reduce((p,q)=>p+q.h,0);const tableEnd=tableTop+tableH;
const detail=str(m.detail||'');
const foot=str(m.slogan||m.footerLabel||'');
const H=Math.ceil(tableEnd+P.FOOT);
if(H>12000)throw Error('EXPORT_PAGINATION_REQUIRED: split ranked rows into pages; do not truncate.');
cv.height=H;c=cv.getContext('2d');c.textBaseline='alphabetic';c.textAlign='left';
/* ---- Zeichnen ---- */
/* Koernung: erste Ebene, deckend, fester Seed; am Rand etwas kraeftiger wie in der Vorlage */
c.fillStyle=c.createPattern(tile(4.2,20241),'repeat');c.fillRect(0,0,W,H);
{const pt=c.createPattern(tile(9,977),'repeat');c.fillStyle=pt;const B=[1,0.8,0.6,0.42,0.26,0.12];const bw=14;B.forEach((al,i)=>{const d=i*bw;c.globalAlpha=al;c.fillRect(d,d,W-2*d,bw);c.fillRect(d,H-d-bw,W-2*d,bw);c.fillRect(d,d+bw,bw,H-2*d-2*bw);c.fillRect(W-d-bw,d+bw,bw,H-2*d-2*bw);});c.globalAlpha=1;}
/* 01 */
if(deco){c.save();c.beginPath();c.rect(0,0,W,H);c.clip();fnt(400,deco.s,DISP);c.lineJoin='round';c.lineWidth=3;c.strokeStyle=a;c.globalAlpha=.85;placed(deco.x,deco.y,P.RISE,P.SK,P.DECO.hx,P.DECO.sy,()=>c.strokeText('01',0,0));c.globalAlpha=1;c.restore();keep('deco',deco.q,{deco:true});}
/* Name */
c.fillStyle=FG;pl.lines.forEach((ln,i)=>{fnt(400,pl.s,DISP);placed(P.NX,nameY+lineY[i],P.RISE,P.SK,pl.hx,P.SY,()=>c.fillText(ln,0,0));});keep('name',nameQ);
/* Vierzack */
if(star){const {x:cx,y:cy,r}=star;c.fillStyle=a;c.beginPath();c.moveTo(cx,cy-r);c.quadraticCurveTo(cx,cy,cx+r,cy);c.quadraticCurveTo(cx,cy,cx,cy+r);c.quadraticCurveTo(cx,cy,cx-r,cy);c.quadraticCurveTo(cx,cy,cx,cy-r);c.closePath();c.fill();keep('star',star.q);}
/* Kopf */
fnt(800,66,LOGO);c.fillStyle=FG;c.fillText('Game',62,96);c.fillStyle=a;c.fillText('Tab',62+gwL,96);keep('logo',logoQ);
{fnt(400,lsz,SANS);c.fillStyle=FG;const g=seg(L0);const ws=g.map(q=>c.measureText(q).width);let cx=1018-ltw;g.forEach((q,i)=>{c.fillText(q,cx,82);cx+=ws[i]+lsp;});c.fillRect(1018-ltw-4,94,ltw+4,2);keep('label',labelQ);}
/* Diagonale */
c.strokeStyle=a;c.lineWidth=P.LW;c.lineCap='butt';segs.forEach(s=>{c.beginPath();c.moveTo(s.x0,s.c-P.K*s.x0);c.lineTo(s.x1,s.c-P.K*s.x1);c.stroke();});keep('line',segQ);
/* Schachbrett */
if(chk){c.save();const r=rng(11);c.translate(chk.ax,chk.ay);c.transform(1,-0.3,0,1,0,0);c.transform(1,0,-0.2,1,0,0);c.scale(chk.z,chk.z);const cols=chk.cols;for(let ry=0;ry<3;ry++)for(let cx=0;cx<cols;cx++){if((ry+cx)%2)continue;const fade=(cx+1)/cols;const hot=ry===1&&cx===cols-2;c.globalAlpha=hot?0.95:0.12+0.38*fade*r();c.fillStyle=hot?a:FG;c.fillRect(cx*CW,-(ry+1)*CH,CW-2,CH-2);}c.restore();c.globalAlpha=1;keep('checker',chk.q);}
/* Siegerwort */
c.fillStyle=FG;fnt(900,gfs,BLK);placed(P.WIN.x,winY,P.WIN.rise,0,P.WIN.hx,P.WIN.sy,()=>{fnt(900,gfs,BLK);c.fillText(gww,0,0);});keep('win',winQ);
/* Punktzahl */
{c.fillStyle=a;fnt(900,scFs,BLK);const x0=P.SC.right-ext(glyphQ(valueRaw,T(0,0,P.SC.rise,0,shx,P.SC.sy))).r;placed(x0,scBase,P.SC.rise,0,shx,P.SC.sy,()=>{fnt(900,scFs,BLK);c.fillText(valueRaw,0,0);});keep('score',scQ);
if(u){c.fillStyle=FG;fnt(800,34,SANS);placed(1012,unitY,0.03,0.2,1,1,()=>{c.textAlign='left';const g=seg(u);const ws=g.map(q=>c.measureText(q).width);let cx=-unitTot;g.forEach((q,i)=>{c.fillText(q,cx,0);cx+=ws[i]+11;});});keep('unit',unitQ);}}
/* Tabelle */
{let y=tableTop;prepared.forEach((o,k)=>{const r=o.r,win=!!r.winner,h=o.h;if(win){c.fillStyle=a;c.fillRect(60,y,960,h-4);}
const cy=y+(h-4)/2;c.textAlign='left';fnt(800,42,SANS);c.fillStyle=win?ON:'#8C8C86';c.fillText(o.rk,LX,cy+13);
c.fillStyle=win?ON:FG;const lh=o.nsz*1.22;fnt(800,o.nsz,SANS);const tq=[rectQ(LX,cy-17,mwid(o.rk,800,42,SANS),31)];fnt(800,o.nsz,SANS);o.lines.forEach((ln,j)=>{const by=cy+o.nsz*0.36-(o.lines.length-1)*lh/2+j*lh;c.fillText(ln,NX,by);tq.push(rectQ(NX,by-o.nsz*0.73,c.measureText(ln).width,o.nsz*0.95));});
fnt(800,o.vs,SANS);c.textAlign='right';c.fillText(o.v,RX,cy+o.vs*0.36);const vw=c.measureText(o.v).width;tq.push(rectQ(RX-vw,cy+o.vs*0.36-o.vs*0.73,vw,o.vs*0.75));c.textAlign='left';
if(!win){c.fillStyle='#55554F';c.fillRect(66,y+h-2,954,2);}keep('row'+k,tq,{table:true});
y+=h;});}
/* Fuss */
{const fy=tableEnd+71;let fs=30;const dm=detail?detail.match(/^[−-]?[\d’'.,  ]+/):null;const dn=dm?dm[0]:'',dr=detail.slice(dn.length);
const meas=()=>{fnt(600,fs,SANS);const lw=c.measureText(foot).width;fnt(800,fs+5,SANS);const nw=dn?c.measureText(dn).width:0;fnt(600,fs,SANS);const rw=nw+c.measureText(dr).width;return{lw,nw,rw};};let q=meas();while(q.lw+q.rw+80>954&&fs>15){fs--;q=meas();}
c.textAlign='left';c.fillStyle=FG;fnt(600,fs,SANS);c.fillText(foot,66,fy);keep('footL',[rectQ(66,fy-fs*0.75,q.lw,fs*0.95)]);
if(detail){const rx=1020-q.rw;if(dn){c.fillStyle=a;fnt(800,fs+5,SANS);c.fillText(dn,rx,fy);}c.fillStyle=FG;fnt(600,fs,SANS);c.fillText(dr,rx+q.nw,fy);keep('footR',[rectQ(rx,fy-fs*0.8,q.rw,fs)]);const l0=66+q.lw+28,l1=rx-28;if(l1-l0>30){c.fillStyle=a;c.fillRect(l0,fy-fs*0.32,l1-l0,2);}}}
cv.cleanLayout={width:W,height:H,tableY:tableTop,tableEnd:tableEnd,rows:prepared.map(p=>({name:p.r.name,height:p.h})),heroLines:pl.lines,heroCap:Math.round(pl.cap),heroHx:Math.round(pl.hx*100)/100,scoreF:Math.round(f*100)/100,scoreHx:Math.round(shx*100)/100,stack:stack,deco:!!deco,star:!!star,checker:chk?chk.cols:0,boxes:boxes};
return cv;}
return{render,themes,fallback};})();
const gtEcExt=/[̀-ͯ᪰-᫿᷀-᷿‍⃐-⃿︀-️︠-︯\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}]/u;
function gtEcSeg(s){const cps=Array.from(String(s));const out=[];let ri=0;for(let i=0;i<cps.length;i++){const c=cps[i],cp=c.codePointAt(0);const isRI=cp>=0x1F1E6&&cp<=0x1F1FF;const prev=i?cps[i-1]:"";const join=out.length&&(gtEcExt.test(c)||prev==="‍"||(isRI&&ri%2===1));if(isRI)ri++;else ri=0;if(join)out[out.length-1]+=c;else out.push(c);}return out;}

const GT_EC_TEAM={schieber:1,tabu:1,headsup:1};
const GT_EC_UNIT={darts:"legs",cricket:"legs",minigolf:"strokes",phase10:"phases"};
const GT_EC_LOWSLOG={skyjo:1,minigolf:1};
const GT_EC_LOC={de:"de-CH",en:"en-GB",fr:"fr-CH",it:"it-CH",es:"es-ES",pt:"pt-PT"};
const GT_EC_CJK=/[⺀-ヿ㄀-鿿가-힯豈-﫿＀-￯]|[\u{20000}-\u{3FFFF}]/u;
let gtEcFontP=null,gtEcCjkP=null,gtEcSeq=0;
function gtEcFace(fam,file,weight){const f=new FontFace(fam,'url("'+new URL("fonts/"+file,document.baseURI).href+'")',{weight:weight,style:"normal",display:"block"});document.fonts.add(f);return f.load();}
function gtEcFonts(needCjk){
if(!gtEcFontP)gtEcFontP=Promise.all([gtEcFace("GT Clean","DejaVuSans.ttf","400"),gtEcFace("GT Clean","DejaVuSans-Bold.ttf","700"),gtEcFace("GT Anton","Anton-Regular.ttf","400"),gtEcFace("GT Inter","Inter-SemiBold.ttf","600"),gtEcFace("GT Inter","Inter-ExtraBold.ttf","800"),gtEcFace("GT InterBI","Inter-BlackItalic.ttf","900"),Promise.resolve().then(()=>document.fonts.load("800 50px 'Baloo 2'","GameTab")).catch(()=>{})]).catch(e=>{gtEcFontP=null;throw e;});
let p=gtEcFontP;
if(needCjk){if(!gtEcCjkP)gtEcCjkP=gtEcFace("GT CJK","NotoSansCJKsc-Regular.otf","100 900").catch(e=>{gtEcCjkP=null;throw e;});p=Promise.all([p,gtEcCjkP]);}
return p.then(()=>document.fonts.ready);}
function gtEcWarm(){try{gtEcFonts(false).catch(()=>{});}catch(_){}}
function gtEcNum(n,loc){if(n==null||!isFinite(n))return"—";let s;try{s=new Intl.NumberFormat(loc,{maximumFractionDigits:2}).format(Math.abs(n));}catch(_){s=String(Math.abs(n));}return(n<0?"−":"")+s.replace(/ /g," ");}
function gtEcTr(t,key,fb){try{const v=t&&t(key);if(v!=null&&v!==key)return v;}catch(_){}return fb;}
function gtEcNoEmoji(s){return String(s).replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u200D\uFE0F\u20E3]|[\u{1F3FB}-\u{1F3FF}]|[\u{E0020}-\u{E007F}]/gu,"").replace(/\s+/g," ").trim();}
function gtEcModel(gameId,gameLabel,ranked,t,opts){const interim=!!(opts&&opts.interim);
const lang=(document.documentElement.lang||"de").slice(0,2);const loc=GT_EC_LOC[lang]||"de-CH";const up=s=>{try{return String(s).toLocaleUpperCase(lang);}catch(_){return String(s).toUpperCase();}};
const tr=(k,fb)=>gtEcTr(t,k,fb);const team=!!GT_EC_TEAM[gameId];
const sc=ranked.map(e=>{const v=e&&e.score;if(v==null||v==="")return null;const n=Number(v);return isFinite(n)?n:null;});
const rows=[];ranked.forEach((e,i)=>{const nm=gtEcNoEmoji(e&&e.name!=null?e.name:"");const rank=(i>0&&sc[i]!=null&&sc[i]===sc[i-1]&&(ranked[i]&&ranked[i].rk)==(ranked[i-1]&&ranked[i-1].rk))?rows[i-1].rank:i+1;rows.push({id:"r"+i,name:nm||tr(team?"ecTeam":"ecPlayer","Spieler")+" "+(i+1),rank:rank,value:gtEcNum(sc[i],loc),winner:rank===1});});
const win=rows.filter(r=>r.winner);const multi=win.length>1;const uk=GT_EC_UNIT[gameId]||"points";
const uw=tr("nlU"+uk.charAt(0).toUpperCase()+uk.slice(1),["Punkt","Punkte"]);const unit=n=>(lang==="fr"||lang==="pt"?Math.abs(n)<2:Math.abs(n)===1)?uw[0]:uw[1];
const gtO=opts||{};const gtRsn=gtO.reason||ranked.reason||(ranked[0]&&ranked[0].why)||null;const gtDt=typeof gtO.detail==="string"?gtO.detail:(typeof ranked.detail==="string"?ranked.detail:null);let detail="";if(gtDt)detail=gtDt;else if(gtRsn==="shanghai")detail=tr("ecWinShanghai","Sieg durch Shanghai");else if(multi)detail=tr("ecTied","Gemeinsamer erster Platz");else if((!gtRsn||gtRsn==="points")&&rows.length>1&&sc[0]!=null&&sc[1]!=null&&rows[1].rank!==rows[0].rank){const d=Math.abs(sc[1]-sc[0]);if(d>0){const lead=tr("nlLead",(k,u)=>k+" "+u+" Vorsprung");detail=lead(gtEcNum(d,loc),unit(d));}}
const gtLw=typeof gtO.lowWins==="boolean"?gtO.lowWins:(typeof ranked.lowWins==="boolean"?ranked.lowWins:null);const lowWin=gtLw!==null?gtLw:(ranked.length>1&&sc[0]!=null&&sc[sc.length-1]!=null&&sc[0]<sc[sc.length-1]);const slogs=tr("ecSlog",{});const slogId=(GT_EC_LOWSLOG[gameId]&&!lowWin)?"fallback":(slogs[gameId]?gameId:"fallback");const slogan=slogs[slogId]||tr("ecFooter","GameTab");
return{gameId:gameId,slogan:slogan,gameLabel:gameLabel||"GameTab",locale:loc,statusLabel:interim?tr("ecInterim","Zwischenstand"):tr("podiumTitle","Endstand"),heroLabel:up(multi?tr("ecWonMany","Gemeinsam gewonnen"):tr("ecWon","Gewonnen")),heroNames:win.map(r=>r.name),interim:interim,winWord:interim?(multi?tr("ecLeadsMany","führen."):tr("ecLeadsOne","führt.")):(multi?tr("ecWinMany","gewinnen."):tr("ecWinOne","gewinnt.")),heroValue:win.length?win[0].value:"—",unitLabel:win.length&&sc[0]!=null?unit(sc[0]):unit(2),detail:detail,rows:rows,rankLabel:up(tr("ecRank","Platz")),playerLabel:up(tr(team?"ecTeam":"ecPlayer","Spieler")),resultLabel:up(tr("ecResult","Ergebnis")),footerLabel:tr("ecFooter","GameTab · Zusammen spielen. Erinnerungen teilen."),emptyNameLabel:tr("ecPlayer","Spieler")};}
function gtEcIsPag(e){return!!(e&&String(e.message).indexOf("EXPORT_PAGINATION_REQUIRED")===0);}
function gtEcPages(m,t){
try{return[GT_EC.render(m)];}catch(e){if(!gtEcIsPag(e))throw e;}
const fits=(a,n)=>{try{GT_EC.render(Object.assign({},m,{rows:m.rows.slice(a,a+n)}));return true;}catch(e){if(gtEcIsPag(e))return false;throw e;}};
const chunks=[];let a=0;while(a<m.rows.length){let lo=1,hi=m.rows.length-a;if(!fits(a,1)){chunks.push([a,1]);a+=1;continue;}while(lo<hi){const mid=(lo+hi+1)>>1;if(fits(a,mid))lo=mid;else hi=mid-1;}chunks.push([a,lo]);a+=lo;}
const pg=gtEcTr(t,"ecPage",(x,y)=>"Seite "+x+"/"+y);
return chunks.map((c,i)=>GT_EC.render(Object.assign({},m,{statusLabel:m.statusLabel+" · "+pg(i+1,chunks.length),rows:m.rows.slice(c[0],c[0]+c[1])})));}
async function renderResultCanvas(gameId,gameLabel,ranked,appSubtitle,t,appTheme,opts){
if(!Array.isArray(ranked)||!ranked.length)throw Error("no result");
const m=gtEcModel(gameId,gameLabel,ranked,t,opts);
const all=[m.slogan,m.winWord,m.gameLabel,m.statusLabel,m.heroLabel,m.heroNames.join(" "),m.detail,m.unitLabel,m.rankLabel,m.playerLabel,m.resultLabel,m.footerLabel].concat(m.rows.map(r=>r.name)).join("");
await gtEcFonts(GT_EC_CJK.test(all));
return gtEcPages(m,t);}
async function shareResultImage(gameId,gameLabel,ranked,setSharing,setPreviewUrl,t,appTheme){
const seq=++gtEcSeq;setSharing(true);
try{
const cvs=await renderResultCanvas(gameId,gameLabel,ranked,null,t,appTheme);
const blobs=await Promise.all(cvs.map(c=>new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(Error("toBlob")),"image/png"))));
if(seq!==gtEcSeq)return;
const files=blobs.map((b,i)=>new File([b],"gametab-ergebnis"+(blobs.length>1?"-"+(i+1):"")+".png",{type:"image/png"}));
let handled=false;
if(navigator.share&&navigator.canShare){try{if(navigator.canShare({files:files})){await navigator.share({files:files,title:"GameTab"});handled=true;}}catch(err){if(err&&err.name==="AbortError")handled=true;}}
if(seq!==gtEcSeq)return;
setSharing(false);
if(!handled){const urls=cvs.map(c=>c.toDataURL("image/png"));setPreviewUrl(urls.length===1?urls[0]:urls);}
}catch(e){try{console.warn("GameTab Bildexport:",e);}catch(_){}if(seq===gtEcSeq){setSharing(false);try{alert(gtEcTr(t,"ecError","Das Bild konnte nicht erstellt werden."));}catch(_){}}}}/*@gt-body-end*/
export { GT_EC, gtEcExt, gtEcSeg, GT_EC_TEAM, GT_EC_UNIT, GT_EC_LOWSLOG, GT_EC_LOC, GT_EC_CJK, gtEcFontP, gtEcCjkP, gtEcSeq, gtEcFace, gtEcFonts, gtEcWarm, gtEcNum, gtEcTr, gtEcNoEmoji, gtEcModel, gtEcIsPag, gtEcPages, renderResultCanvas, shareResultImage };
