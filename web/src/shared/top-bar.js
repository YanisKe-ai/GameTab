// Erzeugt von tools/split.mjs aus index.html. Inhalt zwischen den gt-body-Markern ist 1:1 Originalcode.
import { React } from "../vendor/react-globals.js";
import { BORDER, CARD, GOLD, INK, MUTED, NEARBLACK, PAGE_BG, PAGE_BG_2 } from "../themes/palette.js";
import { shellTokens } from "../themes/tokens.js";
import { GameHeader } from "./game-header.js";
/*@gt-body-begin*/function TopBar({title,subtitle,onBack,tokens,backLabel,...gtRest}){const tk=tokens||{card:CARD,border:BORDER,ink:INK,muted:MUTED,gold:GOLD};return <GameHeader title={title} subtitle={subtitle} onBack={onBack} backLabel={backLabel||"Hauptmenü"} tk={tk} accent={tk.ink} {...gtRest}/>;}function pageShellStyle(theme){if(theme==="vitrum")return{minHeight:"100vh",background:shellTokens("vitrum").pageBg,padding:"20px 12px 32px"};if(theme==="light"){const tk=shellTokens("light");return{minHeight:"100vh",background:`radial-gradient(ellipse at 50% -10%, #FFFFFF 0%, ${tk.pageBg} 55%, ${tk.pageBg2} 100%)`,padding:"20px 12px 32px"};}if(theme==="noir"){return{minHeight:"100vh",background:"#0A0A0A",padding:"20px 12px 32px"};}return{minHeight:"100vh",background:`radial-gradient(ellipse at 50% -10%, ${PAGE_BG_2} 0%, ${PAGE_BG} 55%, ${NEARBLACK} 100%)`,padding:"20px 12px 32px"};}/*@gt-body-end*/
export { TopBar, pageShellStyle };
