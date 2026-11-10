// Schwebende Symbole im Hintergrund jedes Spiels (wie bei Tutto), pro Spiel eigene Symbole und Farbe.
// Wird als CSS-Hintergrund (::before der Seitenhuelle) eingesetzt: liegt hinter dem Inhalt, faengt keine Klicks.
const SYM = {
  dice: c => `<rect x="3" y="3" width="18" height="18" rx="4" stroke="${c}" stroke-width="1.6" fill="none"/><circle cx="8.3" cy="8.3" r="1.3" fill="${c}"/><circle cx="15.7" cy="8.3" r="1.3" fill="${c}"/><circle cx="12" cy="12" r="1.3" fill="${c}"/><circle cx="8.3" cy="15.7" r="1.3" fill="${c}"/><circle cx="15.7" cy="15.7" r="1.3" fill="${c}"/>`,
  card: c => `<rect x="5" y="2.5" width="14" height="19" rx="2.5" stroke="${c}" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="3" fill="none" stroke="${c}" stroke-width="1.3"/>`,
  star: c => `<path d="M12 2l2.6 6.6L21.5 9l-5.3 4.6L17.8 21 12 17.2 6.2 21l1.6-7.4L2.5 9l6.9-0.4Z" fill="${c}"/>`,
  heart: c => `<path d="M12 20C4 14.5 4 7.5 8.2 7.5c2 0 3.8 2 3.8 2s1.8-2 3.8-2C20 7.5 20 14.5 12 20Z" fill="${c}"/>`,
  diamond: c => `<path d="M12 3l6.5 9-6.5 9-6.5-9Z" fill="${c}"/>`,
  spade: c => `<path d="M12 3C5 9.5 5.5 15 9.3 15c1.2 0 2.2-.8 2.7-1.6L10.8 21h2.4L12 13.4c.5.8 1.5 1.6 2.7 1.6 3.8 0 4.3-5.5-2.7-12Z" fill="${c}"/>`,
  club: c => `<circle cx="12" cy="7.5" r="3.4" fill="${c}"/><circle cx="7.6" cy="13" r="3.4" fill="${c}"/><circle cx="16.4" cy="13" r="3.4" fill="${c}"/><path d="M12 12l-1.6 9h3.2Z" fill="${c}"/>`,
  moon: c => `<path d="M15 3a9 9 0 1 0 6 15.5A7 7 0 0 1 15 3Z" fill="${c}"/>`,
  flag: c => `<path d="M7 21V3" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/><path d="M7.6 3.5c3-1.6 5.4 1.6 8.6 0v6c-3.2 1.6-5.6-1.6-8.6 0Z" fill="${c}"/>`,
  ball: c => `<circle cx="12" cy="12" r="7" stroke="${c}" stroke-width="1.6" fill="none"/><circle cx="10" cy="10" r=".9" fill="${c}"/><circle cx="13.5" cy="11" r=".9" fill="${c}"/><circle cx="11" cy="14" r=".9" fill="${c}"/>`,
  target: c => `<circle cx="12" cy="12" r="9" stroke="${c}" stroke-width="1.6" fill="none"/><circle cx="12" cy="12" r="5" stroke="${c}" stroke-width="1.6" fill="none"/><circle cx="12" cy="12" r="1.6" fill="${c}"/>`,
  dart: c => `<path d="M4 20 15 9" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/><path d="M14 10l3-6 1.5 1.5L21 4l-1.5 2.5L21 8l-6 3Z" fill="${c}"/>`,
  hat: c => `<path d="M12 2 6 17h12Z" fill="${c}"/><ellipse cx="12" cy="18" rx="9" ry="2.4" fill="${c}"/>`,
  question: c => `<path d="M8.5 8.5a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.2-1.5 2.3" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="12" cy="18" r="1.3" fill="${c}"/>`,
  bubble: c => `<path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="${c}" stroke-width="1.5" fill="none"/>`,
  hourglass: c => `<path d="M6 3h12M6 21h12M7 3c0 6 5 7 5 9s-5 3-5 9M17 3c0 6-5 7-5 9s5 3 5 9" stroke="${c}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  mask: c => `<path d="M2 9c3-3 7-3 10-1 3-2 7-2 10 1 0 5-3 7-6 7-2 0-3-1.5-4-2.5-1 1-2 2.5-4 2.5-3 0-6-2-6-7Z" fill="${c}"/>`,
  pencil: c => `<path d="M4 20l3.5-1 11-11-2.5-2.5-11 11Z" stroke="${c}" stroke-width="1.5" fill="none" stroke-linejoin="round"/>`,
  arrow: c => `<path d="M12 3v14M6.5 11.5 12 17l5.5-5.5" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  eye: c => `<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" stroke="${c}" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="2.6" fill="${c}"/>`,
  cloud: c => `<path d="M6 18a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.5 1.5A3.3 3.3 0 0 1 17.5 18Z" fill="${c}"/>`,
};
const GAMES = {
  yatzy: ["#7E8BFF", ["dice", "star", "dice", "card"]],
  skyjo: ["#2FD9A8", ["card", "cloud", "star", "card"]],
  flip7: ["#FF7A3D", ["card", "star", "card", "clover"]],
  phase10: ["#2E9BF0", ["card", "star", "card", "diamond"]],
  romme: ["#F25C9A", ["heart", "spade", "diamond", "club"]],
  jass: ["#D52B1E", ["heart", "spade", "diamond", "club"]],
  schieber: ["#5FB58C", ["club", "heart", "spade", "diamond"]],
  wizard: ["#E0BA72", ["star", "moon", "hat", "star"]],
  minigolf: ["#3F8F42", ["flag", "ball", "star", "ball"]],
  darts: ["#C8102E", ["target", "dart", "star", "dart"]],
  cricket: ["#1B8A5A", ["target", "dart", "star", "dart"]],
  shanghai: ["#2E86C1", ["target", "dart", "star", "dart"]],
  hiscore: ["#22D3EE", ["target", "dart", "star", "dart"]],
  splitscore: ["#B478F0", ["target", "dart", "star", "dart"]],
  freeplay: ["#9A7BA8", ["pencil", "star", "card", "pencil"]],
  impostor: ["#C042E0", ["mask", "question", "eye", "star"]],
  werewolf: ["#D9384A", ["moon", "star", "eye", "star"]],
  mafia: ["#C9A15C", ["hat", "card", "spade", "star"]],
  mostlikely: ["#2DD4BF", ["arrow", "star", "question", "heart"]],
  traitor: ["#7FBF5A", ["eye", "mask", "star", "moon"]],
  tabu: ["#FFC93C", ["bubble", "star", "hourglass", "bubble"]],
  headsup: ["#6C7FE8", ["question", "star", "card", "question"]],
  fivesec: ["#FF9640", ["hourglass", "star", "bubble", "hourglass"]],
};
SYM.clover = SYM.club;
GAMES["schieber-turnier"] = GAMES.schieber;
const POS = [["8%","3%",-12,24],["46%","1%",14,14],["84%","2%",10,15],["4%","14%",-8,17],["64%","10%",-10,13],["92%","18%",18,19],["22%","20%",-14,15],["6%","30%",-15,14],["88%","34%",12,16],["40%","36%",8,18],["70%","46%",16,15],["12%","48%",-9,13],["92%","54%",-16,17],["30%","58%",10,16],["6%","64%",-12,15],["80%","68%",14,14],["18%","78%",11,18],["60%","80%",-10,16],["92%","84%",-8,15],["40%","88%",9,14],["78%","94%",-14,19],["4%","92%",12,13]];
function tile(color, syms) {
  const W = 400, H = 860;
  const parts = POS.map((p, i) => {
    const x = parseFloat(p[0]) / 100 * W, y = parseFloat(p[1]) / 100 * H, s = p[3] / 24;
    const f = SYM[syms[i % syms.length]] || SYM.star;
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${p[2]}) scale(${s.toFixed(2)})">${f(color)}</g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts}</svg>`;
}
const CACHE = {};
export function gtBgDecorCss(view, theme) {
  const g = GAMES[view];
  if (!g) return "";
  const key = view + "|" + theme;
  if (CACHE[key]) return CACHE[key];
  const col = theme === "noir" ? "#FFFFFF" : g[0];
  const op = theme === "noir" ? 0.06 : theme === "light" ? 0.2 : 0.1;
  const uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(tile(col, g[1]));
  const css = `.gtL-shellpage{isolation:isolate}.gtL-shellpage::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:url("${uri}");background-size:400px auto;background-repeat:repeat;opacity:${op}}`;
  CACHE[key] = css;
  return css;
}
