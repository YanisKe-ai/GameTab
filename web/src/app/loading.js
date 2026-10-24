// Erzeugt von tools/split.mjs aus index.html. Inhalt zwischen den gt-body-Markern ist 1:1 Originalcode.
import { React } from "../vendor/react-globals.js";
import { MUTED } from "../themes/palette.js";
import { AppLogo } from "../shared/app-logo.js";
import { pageShellStyle } from "../shared/top-bar.js";
/*@gt-body-begin*/function LoadingScreen({theme}={}){return <div style={{...pageShellStyle(theme),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}><style/><AppLogo size={160} theme={theme} style={{opacity:0.9}}/><div style={{color:MUTED,fontFamily:"'Inter', sans-serif",fontSize:13}}>Lädt …</div></div>;}/*@gt-body-end*/
export { LoadingScreen };
