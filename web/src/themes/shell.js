// Erzeugt von tools/split.mjs aus index.html. Inhalt zwischen den gt-body-Markern ist 1:1 Originalcode.
import { React } from "../vendor/react-globals.js";
import { DartsLogo } from "../assets/logos.js";
import { GameHeader } from "../shared/game-header.js";
/*@gt-body-begin*/function dartsAccent(theme){return theme==="light"?"#B8331F":theme==="noir"?"#C1C1C1":"#E4402E";}function dartsHead(title,onBack,onHome,onEndGame,onRules,tk,t,theme,subtitle,rulesText,moreItems,onMenuOpen){const ac=dartsAccent(theme);return <GameHeader title={title} subtitle={subtitle} onBack={onBack} backLabel={t("back")} tk={tk} accent={ac} titleFont="'Space Grotesk', sans-serif" icon={<DartsLogo color={ac}/>} onHome={onHome} onEndGame={onEndGame} onRules={onRules} moreItems={moreItems} onMenuOpen={onMenuOpen} rulesText={rulesText} rulesTitle={rulesText?title:undefined}/>;}function noirAccent(gameId){return"#E8E8E8";}/*@gt-body-end*/
export { dartsAccent, dartsHead, noirAccent };
