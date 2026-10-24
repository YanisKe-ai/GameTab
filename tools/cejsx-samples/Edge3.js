function Edge3({a,b,items}){const H=React.createElement;
return H("div",{className:"x",
"aria-hidden":true,
onClick:()=>{/* Klick */return a;}},
H("span",null,(a||b)),
((a&&b)),
items.length>0&&H("ul",null,items.map((x,i)=>H("li",{key:i},
x /* Eintrag */))),
H("p",{style:{margin:0}},"Ende"));}
