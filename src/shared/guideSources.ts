import { collectionSources } from "./collectionGuides";
import { traditionalSources } from "./traditionalGuides";
export const guideSources: Record<string, { title: string; url: string }[]> = {
  ...collectionSources,
  ...traditionalSources,
  quoridor: [
    {
      title: "Gigamic: juego y reglamento oficial; mesa de dos participantes",
      url: "https://en.gigamic.com/modern-classics/107-quoridor.html",
    },
  ],
  onitama: [
    {
      title:
        "Arcane Wonders: manual base; comparar salida y reglas de tablas de esta mesa",
      url: "https://www.arcanewonders.com/wp-content/uploads/2021/05/Onitama-Rulebook.pdf",
    },
  ],
  dvonn: [
    {
      title: "Project GIPF: reglas de DVONN",
      url: "https://gipf.com/dvonn/rules/rules.html",
    },
  ],
  yinsh: [
    {
      title: "Project GIPF: reglas de YINSH",
      url: "https://www.gipf.com/yinsh/rules/rules.html",
    },
  ],
  "la-colmena": [
    {
      title: "Gen42: manual base de Hive; esta mesa no incluye expansiones",
      url: "https://www.gen42.com/wp-content/uploads/Hive-rules.pdf",
    },
  ],
  "dados-mentirosos-perudo": [
    {
      title:
        "Zygomatic / Asmodee: reglamento español de Perudo; calza no se aplica aquí",
      url: "https://cdn.svc.asmodee.net/production-asmodeees/uploads/2023/12/perudoclassic_es_rules_compressed.pdf",
    },
  ],
  "dados-zombie": [
    {
      title: "Steve Jackson Games: reglas básicas",
      url: "https://www.sjgames.com/dice/zombiedice/img/ZDRules_English.pdf",
    },
  ],
  "farkle-diez-mil": [
    {
      title:
        "PlayMonster: comparar tabla de puntuación con la variante de Games",
      url: "https://www.playmonster.com/wp-content/uploads/2018/06/Farkle-Rules.pdf",
    },
  ],
  bunco: [
    {
      title: "World Bunco Association: formato social original de varias mesas",
      url: "https://worldbunco.com/rules1.html",
    },
  ],
  "linea-de-tiempo": [
    {
      title: "NASA: cronología de lanzamientos y exploración planetaria",
      url: "https://nssdc.gsfc.nasa.gov/planetary/chronology.html",
    },
    {
      title: "Smithsonian: Wright Flyer de 1903",
      url: "https://airandspace.si.edu/collection-objects/1903-wright-flyer/nasm_A19610048000",
    },
    {
      title: "CERN: nacimiento de la Web",
      url: "https://home.cern/science/computing/the-birth-of-the-web/",
    },
  ],
  "construccion-de-colchas": [
    {
      title:
        "Lookout: Patchwork, referencia de género; retales y reglas de Games son una adaptación propia",
      url: "https://www.lookout-spiele.de/de/games/patchwork.html",
    },
  ],
  "ventanas-de-catedral": [
    {
      title:
        "Floodgate Games: Sagrada, referencia de género; esta ficha tiene patrones y objetivos propios",
      url: "https://floodgate.games/products/sagrada",
    },
  ],
  santorini: [
    {
      title:
        "Roxley: reglas base y manuales oficiales; esta mesa no incluye poderes",
      url: "https://roxley.com/collections/santorini/products/santorini",
    },
  ],
  "damas-chinas": [
    {
      title:
        "Hasbro: instrucciones de Chinese Checkers; comparar variantes de bloqueo",
      url: "https://www.hasbro.com/common/instruct/ChineseCheckers(1938).PDF",
    },
  ],
  escoba: [
    {
      title: "Fournier: Escoba, reglas del fabricante de cartas",
      url: "https://www.nhfournier.es/como-jugar/escoba/",
    },
  ],
  belote: [
    {
      title: "Pagat: reglas recopiladas de jugadores de Belote y sus variantes",
      url: "https://www.pagat.com/jass/belote.html",
    },
  ],
  cinquillo: [
    {
      title: "Ludoteka: otra modalidad de Cinquillo, con puntuación distinta",
      url: "https://www.ludoteka.com/juegos/cinquillo/reglas",
    },
  ],
  sudoku: [
    {
      title: "Reglas y ejemplos del editor Nikoli",
      url: "https://www.nikoli.co.jp/en/puzzles/sudoku/",
    },
  ],
  reversi: [
    {
      title: "Reglas de Othello, World Othello Federation",
      url: "https://www.worldothello.org/about/about-othello/othello-rules",
    },
  ],
  go: [
    {
      title:
        "Introducción de la American Go Association; sus reglas de puntuación difieren de esta mesa",
      url: "https://www.usgo-archive.org/files/handouts/RulesetDouble2up.pdf",
    },
  ],
  chess: [
    {
      title: "Reglas FIDE y arbitraje",
      url: "https://handbook.fide.com/chapter/e012023",
    },
  ],
  "damas-internacionales": [
    { title: "Reglamento FMJD", url: "https://www.fmjd.org/docs/Annex_1.pdf" },
  ],
  "shogi-ajedrez-japones": [
    {
      title: "Reglas de la asociación japonesa de Shogi",
      url: "https://www.shogi.or.jp/match/taikyoku_rules/",
    },
  ],
  "xiangqi-ajedrez-chino": [
    { title: "World Xiangqi Federation", url: "https://www.wxf-xiangqi.org/" },
  ],
  "solitario-spider": [
    {
      title: "Ayuda del editor MobilityWare: Spider",
      url: "https://mobilityware.helpshift.com/hc/en/8-spider/",
    },
  ],
  "solitario-carta-blanca-freecell": [
    {
      title: "Ayuda del editor MobilityWare: FreeCell",
      url: "https://mobilityware.helpshift.com/hc/en/12-freecell/faq/580-how-do-i-play-freecell-1629417414/",
    },
  ],
  "blackjack-21": [
    {
      title: "Reglas del fabricante de cartas Bicycle",
      url: "https://bicyclecards.com/how-to-play/blackjack/",
    },
  ],
  brisca: [
    {
      title: "Reglas de esta familia en Ludoteka",
      url: "https://www.ludoteka.com/juegos/brisca/reglas",
    },
  ],
  mus: [
    {
      title: "Reglas de esta familia en Ludoteka",
      url: "https://www.ludoteka.com/juegos/mus/reglas",
    },
  ],
  "mahjong-solitario": [
    {
      title: "Página del editor Microsoft Mahjong",
      url: "https://www.microsoftcasualgames.com/mahjong",
    },
  ],
  "yahtzee-la-generala": [
    {
      title: "Reglas de Hasbro: Yahtzee",
      url: "https://www.hasbro.com/common/instruct/yahtzee.pdf",
    },
  ],
  mastermind: [
    {
      title: "Instrucciones del editor Hasbro: Mastermind",
      url: "https://instructions.hasbro.com/en-gb/instruction/mastermind",
    },
  ],
  quarto: [
    {
      title: "Reglamento del editor Gigamic: Quarto",
      url: "https://export.gigamic.com/wp-content/uploads/2021/01/INS-RULE_QUARTO-CLASSIC_11-2016.pdf",
    },
  ],
  backgammon: [
    {
      title: "Federación estadounidense: aprender Backgammon",
      url: "https://usbgf.org/backgammon-basics-how-to-play/",
    },
  ],
  colonizadores: [
    {
      title: "Reglamento oficial de CATAN, para comparar con nuestra variante",
      url: "https://www.catan.com/sites/default/files/2021-07/catan-25th-rules_eng-200313.pdf",
    },
  ],
  cruzapalabras: [
    {
      title:
        "Scrabble en español: referencia del editor Hasbro, un juego distinto",
      url: "https://instructions.hasbro.com/en-us/instruction/scrabble-brand-crossword-game-edicion-en-espanol",
    },
  ],
};
