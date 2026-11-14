// Stadt Land Fluss: vorgefertigte Kategorien in 6 Sprachen (selbst geschrieben).
// Reihenfolge: de|en|fr|it|es|pt. WICHTIG: Die Reihenfolge der Eintraege NIE aendern und nichts loeschen,
// sonst passen die Kurzcodes alter Spiele nicht mehr. Neue Kategorien nur am Ende anhaengen (max. 128 insgesamt).
// Aufbau: SLF_GROUPS[g] = { id, names:"de|en|fr|it|es|pt", items:[...] }, items sind je ein "de|en|fr|it|es|pt"-Text.
const LANGS = ["de", "en", "fr", "it", "es", "pt"];

const SLF_GROUPS = [
  { id: "classic", names: "Klassisch|Classic|Classiques|Classiche|Clásicas|Clássicas", items: [
    "Stadt|City|Ville|Città|Ciudad|Cidade",
    "Land|Country|Pays|Paese|País|País",
    "Fluss|River|Fleuve ou rivière|Fiume|Río|Rio",
    "Name|Name|Prénom|Nome|Nombre|Nome",
    "Tier|Animal|Animal|Animale|Animal|Animal",
    "Beruf|Job|Métier|Mestiere|Profesión|Profissão",
    "Pflanze|Plant|Plante|Pianta|Planta|Planta",
    "Gegenstand|Object|Objet|Oggetto|Objeto|Objeto",
    "Farbe|Color|Couleur|Colore|Color|Cor",
    "Körperteil|Body part|Partie du corps|Parte del corpo|Parte del cuerpo|Parte do corpo",
    "Kleidungsstück|Piece of clothing|Vêtement|Capo d’abbigliamento|Prenda de vestir|Peça de roupa",
    "Hobby|Hobby|Loisir|Hobby|Pasatiempo|Passatempo",
    "Berg|Mountain|Montagne|Montagna|Montaña|Montanha",
    "Musikinstrument|Musical instrument|Instrument de musique|Strumento musicale|Instrumento musical|Instrumento musical",
  ] },
  { id: "funny", names: "Lustig|Funny|Drôles|Divertenti|Divertidas|Divertidas", items: [
    "Ausrede fürs Zuspätkommen|Excuse for being late|Excuse pour un retard|Scusa per il ritardo|Excusa por llegar tarde|Desculpa para chegar atrasado",
    "Name für ein Haustier|Name for a pet|Nom pour un animal de compagnie|Nome per un animale domestico|Nombre para una mascota|Nome para um animal de estimação",
    "Schlechter Name für ein Restaurant|Bad name for a restaurant|Mauvais nom pour un restaurant|Brutto nome per un ristorante|Mal nombre para un restaurante|Mau nome para um restaurante",
    "Das findet man im Kühlschrank|Found in the fridge|Ce qu’on trouve dans le frigo|Si trova nel frigo|Se encuentra en la nevera|Encontra-se no frigorífico",
    "Superkraft|Superpower|Superpouvoir|Superpotere|Superpoder|Superpoder",
    "Das nähme ich auf eine einsame Insel mit|I’d take it to a desert island|Je l’emporterais sur une île déserte|Lo porterei su un’isola deserta|Me lo llevaría a una isla desierta|Levava para uma ilha deserta",
    "Liebevolle Beleidigung|Affectionate insult|Insulte affectueuse|Insulto affettuoso|Insulto cariñoso|Insulto carinhoso",
    "Name für einen Superhelden|Superhero name|Nom de super-héros|Nome da supereroe|Nombre de superhéroe|Nome de super-herói",
    "Das macht man im Badezimmer|Something you do in the bathroom|Ce qu’on fait dans la salle de bain|Cosa si fa in bagno|Algo que haces en el baño|Algo que se faz na casa de banho",
    "Das wirft man nie weg, obwohl man sollte|Never thrown away, though it should be|On ne le jette jamais, alors qu’il le faudrait|Non si butta mai, anche se si dovrebbe|Nunca se tira, aunque debería|Nunca se deita fora, embora devesse",
    "Peinlicher Spitzname|Embarrassing nickname|Surnom embarrassant|Soprannome imbarazzante|Apodo vergonzoso|Alcunha embaraçosa",
    "Schlechter Rat|Bad advice|Mauvais conseil|Cattivo consiglio|Mal consejo|Mau conselho",
    "Erfundene Sportart|Made-up sport|Sport inventé|Sport inventato|Deporte inventado|Desporto inventado",
    "Name für eine Band|Band name|Nom de groupe|Nome per una band|Nombre de banda|Nome de banda",
  ] },
  { id: "food", names: "Essen und Trinken|Food and drink|Boire et manger|Cibo e bevande|Comida y bebida|Comes e bebes", items: [
    "Gemüse|Vegetable|Légume|Verdura|Verdura|Legume",
    "Obst|Fruit|Fruit|Frutta|Fruta|Fruta",
    "Getränk|Drink|Boisson|Bevanda|Bebida|Bebida",
    "Süssigkeit|Sweet|Friandise|Dolce|Dulce|Doce",
    "Gericht|Dish|Plat|Piatto|Plato|Prato",
    "Käsesorte|Type of cheese|Sorte de fromage|Tipo di formaggio|Tipo de queso|Tipo de queijo",
    "Gewürz oder Kraut|Spice or herb|Épice ou herbe|Spezia o erba aromatica|Especia o hierba|Especiaria ou erva",
    "Pizzabelag|Pizza topping|Garniture de pizza|Ingrediente per la pizza|Ingrediente de pizza|Ingrediente de pizza",
    "Eissorte|Ice cream flavour|Parfum de glace|Gusto di gelato|Sabor de helado|Sabor de gelado",
    "Backware|Baked good|Pâtisserie ou pain|Prodotto da forno|Producto de panadería|Produto de padaria",
    "Suppe|Soup|Soupe|Zuppa|Sopa|Sopa",
    "Frühstück|Breakfast food|Petit-déjeuner|Colazione|Desayuno|Pequeno-almoço",
    "Nuss oder Kern|Nut or seed|Noix ou graine|Frutto secco o seme|Fruto seco o semilla|Fruto seco ou semente",
    "Etwas Scharfes|Something spicy|Quelque chose de piquant|Qualcosa di piccante|Algo picante|Algo picante",
  ] },
  { id: "swiss", names: "Schweiz|Switzerland|Suisse|Svizzera|Suiza|Suíça", items: [
    "Kanton|Canton|Canton|Cantone|Cantón|Cantão",
    "Schweizer Stadt|Swiss city|Ville suisse|Città svizzera|Ciudad suiza|Cidade suíça",
    "Schweizer Berg|Swiss mountain|Montagne suisse|Montagna svizzera|Montaña suiza|Montanha suíça",
    "See in der Schweiz|Lake in Switzerland|Lac en Suisse|Lago in Svizzera|Lago en Suiza|Lago na Suíça",
    "Schweizer Fluss|Swiss river|Rivière suisse|Fiume svizzero|Río suizo|Rio suíço",
    "Schweizer Käse|Swiss cheese|Fromage suisse|Formaggio svizzero|Queso suizo|Queijo suíço",
    "Schweizer Marke|Swiss brand|Marque suisse|Marchio svizzero|Marca suiza|Marca suíça",
    "Bekannte Schweizer Person|Famous Swiss person|Personnalité suisse|Persona svizzera famosa|Persona suiza famosa|Pessoa suíça famosa",
    "Mundartwort|Dialect word|Mot de dialecte|Parola dialettale|Palabra dialectal|Palavra dialetal",
    "Schweizer Spezialität|Swiss speciality|Spécialité suisse|Specialità svizzera|Especialidad suiza|Especialidade suíça",
    "Bahnhof oder Haltestelle|Train station or stop|Gare ou arrêt|Stazione o fermata|Estación o parada|Estação ou paragem",
    "Schweizer Fest oder Brauch|Swiss festival or custom|Fête ou coutume suisse|Festa o usanza svizzera|Fiesta o costumbre suiza|Festa ou costume suíço",
    "Ort zum Wandern|Place to hike|Lieu de randonnée|Luogo per un’escursione|Lugar para hacer senderismo|Lugar para caminhadas",
    "Schweizer Sportler oder Sportlerin|Swiss athlete|Sportif suisse|Sportivo svizzero|Deportista suizo|Desportista suíço",
  ] },
  { id: "media", names: "Film, Musik, Serien|Film, music, series|Cinéma, musique, séries|Film, musica, serie|Cine, música, series|Cinema, música, séries", items: [
    "Filmtitel|Film title|Titre de film|Titolo di film|Título de película|Título de filme",
    "Serie|TV series|Série|Serie TV|Serie|Série",
    "Schauspieler oder Schauspielerin|Actor or actress|Acteur ou actrice|Attore o attrice|Actor o actriz|Ator ou atriz",
    "Band oder Sänger|Band or singer|Groupe ou chanteur|Gruppo o cantante|Grupo o cantante|Banda ou cantor",
    "Liedtitel|Song title|Titre de chanson|Titolo di canzone|Título de canción|Título de canção",
    "Zeichentrickfigur|Cartoon character|Personnage de dessin animé|Personaggio dei cartoni|Personaje de dibujos animados|Personagem de desenhos animados",
    "Bösewicht im Film|Movie villain|Méchant de film|Cattivo del cinema|Villano de película|Vilão de filme",
    "Figur aus einem Kinderfilm|Character from a kids’ film|Personnage d’un film pour enfants|Personaggio di un film per bambini|Personaje de una película infantil|Personagem de um filme infantil",
    "Videospiel|Video game|Jeu vidéo|Videogioco|Videojuego|Videojogo",
    "Musikgenre|Music genre|Genre musical|Genere musicale|Género musical|Género musical",
    "Held oder Heldin aus Film oder Buch|Hero from a film or book|Héros de film ou de livre|Eroe di un film o libro|Héroe de película o libro|Herói de filme ou livro",
    "Buchtitel|Book title|Titre de livre|Titolo di libro|Título de libro|Título de livro",
    "Fernsehshow|TV show|Émission de télévision|Programma televisivo|Programa de televisión|Programa de televisão",
    "Podcast oder YouTube-Kanal|Podcast or YouTube channel|Podcast ou chaîne YouTube|Podcast o canale YouTube|Pódcast o canal de YouTube|Podcast ou canal do YouTube",
  ] },
  { id: "nature", names: "Natur und Tiere|Nature and animals|Nature et animaux|Natura e animali|Naturaleza y animales|Natureza e animais", items: [
    "Wildtier|Wild animal|Animal sauvage|Animale selvatico|Animal salvaje|Animal selvagem",
    "Haustier|Pet|Animal de compagnie|Animale domestico|Mascota|Animal de estimação",
    "Vogel|Bird|Oiseau|Uccello|Ave|Ave",
    "Insekt|Insect|Insecte|Insetto|Insecto|Inseto",
    "Fisch oder Meerestier|Fish or sea creature|Poisson ou animal marin|Pesce o animale marino|Pez o animal marino|Peixe ou animal marinho",
    "Baum|Tree|Arbre|Albero|Árbol|Árvore",
    "Blume|Flower|Fleur|Fiore|Flor|Flor",
    "Pilz oder Beere|Mushroom or berry|Champignon ou baie|Fungo o bacca|Hongo o baya|Cogumelo ou baga",
    "Insel|Island|Île|Isola|Isla|Ilha",
    "Meer oder See|Sea or lake|Mer ou lac|Mare o lago|Mar o lago|Mar ou lago",
    "Wetterphänomen|Weather phenomenon|Phénomène météo|Fenomeno meteorologico|Fenómeno meteorológico|Fenómeno meteorológico",
    "Planet oder Stern|Planet or star|Planète ou étoile|Pianeta o stella|Planeta o estrella|Planeta ou estrela",
    "Gefährliches Tier|Dangerous animal|Animal dangereux|Animale pericoloso|Animal peligroso|Animal perigoso",
    "Edelstein oder Metall|Gem or metal|Pierre précieuse ou métal|Pietra preziosa o metallo|Piedra preciosa o metal|Pedra preciosa ou metal",
  ] },
  { id: "sport", names: "Sport und Freizeit|Sport and leisure|Sport et loisirs|Sport e tempo libero|Deporte y ocio|Desporto e lazer", items: [
    "Sportart|Sport|Sport|Sport|Deporte|Desporto",
    "Sportler oder Sportlerin|Athlete|Sportif ou sportive|Sportivo o sportiva|Deportista|Desportista",
    "Fussballclub|Football club|Club de football|Squadra di calcio|Club de fútbol|Clube de futebol",
    "Brettspiel|Board game|Jeu de société|Gioco da tavolo|Juego de mesa|Jogo de tabuleiro",
    "Kartenspiel|Card game|Jeu de cartes|Gioco di carte|Juego de cartas|Jogo de cartas",
    "Ferienziel|Holiday destination|Destination de vacances|Meta di vacanza|Destino de vacaciones|Destino de férias",
    "Das macht man im Sommer|Something you do in summer|Ce qu’on fait en été|Cosa si fa d’estate|Algo que se hace en verano|Algo que se faz no verão",
    "Das macht man im Winter|Something you do in winter|Ce qu’on fait en hiver|Cosa si fa d’inverno|Algo que se hace en invierno|Algo que se faz no inverno",
    "Ausrüstung fürs Camping|Camping gear|Matériel de camping|Attrezzatura da campeggio|Equipo de camping|Equipamento de campismo",
    "Olympische Disziplin|Olympic event|Discipline olympique|Disciplina olimpica|Disciplina olímpica|Modalidade olímpica",
    "Fortbewegungsmittel|Means of transport|Moyen de transport|Mezzo di trasporto|Medio de transporte|Meio de transporte",
    "Ort in der Stadt|Place in the city|Lieu en ville|Luogo in città|Lugar en la ciudad|Lugar na cidade",
    "Ausflugsziel|Day trip destination|Lieu d’excursion|Meta per una gita|Destino de excursión|Destino de passeio",
    "Etwas aus dem Fitnessstudio|Something from the gym|Quelque chose de la salle de sport|Qualcosa della palestra|Algo del gimnasio|Algo do ginásio",
  ] },
  { id: "family", names: "Familie und Kinder|Family and kids|Famille et enfants|Famiglia e bambini|Familia y niños|Família e crianças", items: [
    "Spielzeug|Toy|Jouet|Giocattolo|Juguete|Brinquedo",
    "Kinderlied|Children’s song|Chanson pour enfants|Canzone per bambini|Canción infantil|Canção infantil",
    "Märchenfigur|Fairy-tale character|Personnage de conte|Personaggio delle fiabe|Personaje de cuento|Personagem de conto de fadas",
    "Schulfach|School subject|Matière scolaire|Materia scolastica|Asignatura|Disciplina escolar",
    "Kinderbuch|Children’s book|Livre pour enfants|Libro per bambini|Libro infantil|Livro infantil",
    "Das ist im Schulrucksack|In the school bag|Dans le cartable|Nello zaino|En la mochila del colegio|Na mochila da escola",
    "Verwandte oder Verwandter|Relative|Membre de la famille|Parente|Pariente|Familiar",
    "Spiel für draussen|Outdoor game|Jeu d’extérieur|Gioco all’aperto|Juego al aire libre|Jogo ao ar livre",
    "Dinosaurier oder Fabelwesen|Dinosaur or mythical creature|Dinosaure ou créature fantastique|Dinosauro o creatura fantastica|Dinosaurio o criatura fantástica|Dinossauro ou criatura fantástica",
    "Das ist im Kinderzimmer|Found in a kid’s room|Ce qu’il y a dans une chambre d’enfant|Si trova nella cameretta|Se encuentra en el cuarto infantil|Encontra-se no quarto das crianças",
    "Geburtstagsgeschenk|Birthday present|Cadeau d’anniversaire|Regalo di compleanno|Regalo de cumpleaños|Presente de aniversário",
    "Das sagen Eltern oft|Something parents often say|Ce que disent souvent les parents|Cosa dicono spesso i genitori|Algo que dicen mucho los padres|Algo que os pais dizem muitas vezes",
    "Lieblingsessen von Kindern|Kids’ favourite food|Plat préféré des enfants|Cibo preferito dai bambini|Comida favorita de los niños|Comida preferida das crianças",
    "Name für ein Baby|Baby name|Prénom de bébé|Nome per un neonato|Nombre de bebé|Nome de bebé",
  ] },
  { id: "adult", names: "Erwachsene|Grown-ups|Adultes|Adulti|Adultos|Adultos", items: [
    "Cocktail|Cocktail|Cocktail|Cocktail|Cóctel|Cocktail",
    "Biersorte|Type of beer|Sorte de bière|Tipo di birra|Tipo de cerveza|Tipo de cerveja",
    "Weinsorte|Type of wine|Cépage ou vin|Tipo di vino|Tipo de vino|Tipo de vinho",
    "Ausrede im Büro|Office excuse|Excuse au bureau|Scusa in ufficio|Excusa en la oficina|Desculpa no escritório",
    "Das gibt es im Büro|Found in the office|Ce qu’on trouve au bureau|Si trova in ufficio|Se encuentra en la oficina|Encontra-se no escritório",
    "Mittel gegen Kater|Hangover cure|Remède contre la gueule de bois|Rimedio per i postumi della sbronza|Remedio para la resaca|Remédio para a ressaca",
    "Partyhit|Party hit|Tube de soirée|Hit da festa|Éxito de fiesta|Hit de festa",
    "Ort für das erste Date|First date spot|Lieu pour un premier rendez-vous|Posto per un primo appuntamento|Lugar para una primera cita|Lugar para um primeiro encontro",
    "Hobby von Erwachsenen|Grown-up hobby|Passe-temps d’adulte|Hobby da adulti|Pasatiempo de adultos|Passatempo de adultos",
    "Rechnung oder Versicherung|Bill or insurance|Facture ou assurance|Bolletta o assicurazione|Factura o seguro|Fatura ou seguro",
    "Automarke|Car brand|Marque de voiture|Marca di auto|Marca de coche|Marca de carro",
    "Bar oder Club|Bar or club|Bar ou boîte de nuit|Bar o locale|Bar o discoteca|Bar ou discoteca",
    "Bekannter Politiker oder Politikerin|Famous politician|Personnalité politique|Politico famoso|Político famoso|Político famoso",
    "Peinlicher Moment|Embarrassing moment|Moment gênant|Momento imbarazzante|Momento vergonzoso|Momento embaraçoso",
  ] },
];

// Flache Liste: Index = stabile ID (fuer den Kurzcode).
const SLF_CATS = [];
SLF_GROUPS.forEach((g, gi) => g.items.forEach((s) => SLF_CATS.push({ g: gi, s })));

function pick(str, lang) {
  const a = str.split("|");
  const i = LANGS.indexOf(lang);
  return a[i < 0 ? 0 : i] || a[0];
}
function slfCatName(id, lang) {
  const c = SLF_CATS[id];
  return c ? pick(c.s, lang) : "";
}
function slfGroupName(gi, lang) {
  const g = SLF_GROUPS[gi];
  return g ? pick(g.names, lang) : "";
}
export { SLF_GROUPS, SLF_CATS, slfCatName, slfGroupName };
