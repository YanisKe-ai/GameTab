// Markiert beim Fokus den ganzen Namen, wenn er noch der Standardname ("Spieler 1") ist,
// damit Tippen ihn ersetzt statt anzuhaengen.
export function gtSelDefault(t){
  return function(e){
    const el=e&&e.target;
    if(!el||el.tagName!=="INPUT"||typeof el.select!=="function")return;
    try{
      const m=/(\d+)$/.exec(el.value||"");
      if(m&&el.value===t("defaultPlayerName")(parseInt(m[1],10)))el.select();
    }catch{}
  };
}
