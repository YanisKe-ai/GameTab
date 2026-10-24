// Erzeugt von tools/split.mjs aus index.html. Inhalt zwischen den gt-body-Markern ist 1:1 Originalcode.
import { React } from "./vendor/react-globals.js";
/*@gt-body-begin*/
const{useState,useEffect,useMemo,useRef,Fragment}=React;const gtEmoRe=/\p{Extended_Pictographic}|\p{Regional_Indicator}|[‍️⃣]|[\u{1F3FB}-\u{1F3FF}]|[\u{E0020}-\u{E007F}]/u;const gtEmoReG=new RegExp(gtEmoRe.source,"gu");
function gtNoEmo(s){return typeof s==="string"&&gtEmoRe.test(s)?s.replace(gtEmoReG,""):s;}
(function(){try{const ce=React.createElement;React.createElement=function(type,props){const n=arguments.length;const a=new Array(n);for(let i=0;i<n;i++){const v=arguments[i];a[i]=i>=2&&typeof v==="string"?gtNoEmo(v):v;}if(props&&(type==="input"||type==="textarea")&&typeof props.value==="string"&&gtEmoRe.test(props.value))a[1]=Object.assign({},props,{value:gtNoEmo(props.value)});return ce.apply(React,a);};
const clean=e=>{const el=e.target;if(!el||!el.tagName||e.isComposing)return;const tg=el.tagName;if(tg!=="INPUT"&&tg!=="TEXTAREA")return;if(tg==="INPUT"&&el.type!=="text"&&el.type!=="search")return;const v=el.value;if(typeof v!=="string"||!gtEmoRe.test(v))return;let pos=null;try{pos=el.selectionStart;}catch(_){}const c=gtNoEmo(v);const keep=pos==null?null:gtNoEmo(v.slice(0,pos)).length;Object.getOwnPropertyDescriptor(tg==="INPUT"?HTMLInputElement.prototype:HTMLTextAreaElement.prototype,"value").set.call(el,c);try{if(keep!=null)el.setSelectionRange(keep,keep);}catch(_){}};
document.addEventListener("input",clean,true);
}catch(e){}})();/*@gt-body-end*/
export { useState, useEffect, useMemo, useRef, Fragment, gtEmoRe, gtEmoReG, gtNoEmo };
