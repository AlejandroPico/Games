import { randomItem } from "../../shared/words";
/** Definitions and decoys written for Games, not copied from a dictionary. */
export const entries = [
  [
    "ALBOR",
    "Luz tenue que aparece antes de salir el sol.",
    "Armazón de madera para sostener una vid.",
    "Pequeño depósito de agua de lluvia.",
    "Herramienta para pulir metales.",
  ],
  [
    "ÓBICE",
    "Dificultad que impide o entorpece algo.",
    "Ave que anida en los acantilados.",
    "Tinta utilizada en grabados antiguos.",
    "Medida de longitud de los barcos.",
  ],
  [
    "ZAHORÍ",
    "Persona que busca agua subterránea mediante una vara u otro instrumento.",
    "Artesano que fabrica instrumentos de viento.",
    "Planta de hojas comestibles.",
    "Viento cálido que llega desde el mar.",
  ],
  [
    "ACÍBAR",
    "Sustancia amarga obtenida del aloe; también amargura figurada.",
    "Recipiente para conservar cereales.",
    "Azúcar que cristaliza en las frutas.",
    "Piedra empleada para afilar cuchillos.",
  ],
  [
    "BALADÍ",
    "De poca importancia o escaso valor.",
    "Dicho de un baile ejecutado en pareja.",
    "Relativo a un color azul intenso.",
    "Persona que conoce varias lenguas.",
  ],
  [
    "EFÍMERO",
    "Que dura poco tiempo.",
    "Que tiene varios significados.",
    "Que refleja la luz de forma irregular.",
    "Que resulta difícil de calcular.",
  ],
  [
    "INEFABLE",
    "Tan especial que resulta difícil expresarlo con palabras.",
    "Que no puede ser dividido en partes.",
    "Objeto que permanece a flote.",
    "Que no contiene letras repetidas.",
  ],
  [
    "LACÓNICO",
    "Que se expresa con pocas palabras.",
    "De sabor ligeramente amargo.",
    "Relacionado con los lagos de montaña.",
    "Que repite sonidos al hablar.",
  ],
  [
    "NIMIO",
    "Insignificante o de importancia muy pequeña.",
    "Animal que vive en agua dulce.",
    "Cántico breve usado en celebraciones.",
    "Terreno rico en minerales.",
  ],
  [
    "UBICUO",
    "Que parece estar en varios lugares a la vez.",
    "Que posee cuatro caras iguales.",
    "Familiar de un antepasado remoto.",
    "Que aparece después de una tormenta.",
  ],
  [
    "VERGEL",
    "Huerto o jardín con abundante vegetación.",
    "Metal verdoso usado para hacer campanas.",
    "Tela con dibujos de aves.",
    "Camino estrecho entre dos montañas.",
  ],
  [
    "ATARAXIA",
    "Estado de tranquilidad y ausencia de perturbación.",
    "Capacidad de orientarse por las estrellas.",
    "Técnica para conservar alimentos en sal.",
    "Ordenación alfabética de textos antiguos.",
  ],
  [
    "PETRICOR",
    "Olor que se percibe cuando la lluvia cae sobre tierra seca.",
    "Sonido de piedras arrastradas por un río.",
    "Pigmento extraído de una roca rojiza.",
    "Corteza fina que protege una semilla.",
  ],
  [
    "FULGOR",
    "Brillo intenso que destaca a la vista.",
    "Ruido de una hoja al romperse.",
    "Calor que queda en una habitación cerrada.",
    "Líquido usado para sellar madera.",
  ],
  [
    "RESCOLDO",
    "Brasa que permanece entre las cenizas.",
    "Parte interior de una cerradura.",
    "Pliegue que se forma en una tela mojada.",
    "Pequeña ola junto a la orilla.",
  ],
  [
    "AZOGUE",
    "Nombre tradicional del mercurio.",
    "Espejo pequeño que se lleva de viaje.",
    "Tinte oscuro para teñir lana.",
    "Instrumento para medir la humedad.",
  ],
  [
    "ADUSTO",
    "De aspecto serio o poco amable.",
    "Que procede de una región costera.",
    "Fruto recogido antes de madurar.",
    "Sonido que se repite con rapidez.",
  ],
  [
    "SERE­NDIPIA".replace("­", ""),
    "Hallazgo valioso o afortunado que ocurre de manera inesperada.",
    "Habilidad para recordar melodías largas.",
    "Acuerdo formal entre tres personas.",
    "Objeto que cambia de color con el calor.",
  ],
  [
    "HODIERNO",
    "Perteneciente al día de hoy.",
    "Que se sitúa debajo del suelo.",
    "Que dura más de un año.",
    "Relativo a la forma de una hoja.",
  ],
  [
    "CONTUMAZ",
    "Que insiste obstinadamente en su actitud.",
    "Que cambia de opinión con facilidad.",
    "Dicho de un líquido muy transparente.",
    "Que contiene una cantidad exacta.",
  ],
] as const;
export type Choice = { text: string; owners: number[]; true: boolean };
export type State = {
  word: string;
  round: number;
  players: number;
  turn: number;
  phase: "bluff" | "vote" | "result" | "over";
  bluffs: string[];
  choices: Choice[];
  votes: number[];
  scores: number[];
  used: string[];
};
export const entry = (word: string) => entries.find((e) => e[0] === word)!;
export function initial(players = 3, random = Math.random): State {
  const word = randomItem(entries, random)[0];
  return {
    word,
    round: 1,
    players,
    turn: 0,
    phase: "bluff",
    bluffs: [],
    choices: [],
    votes: [],
    scores: Array(players).fill(0),
    used: [word],
  };
}
export function bluff(
  s: State,
  text: string,
  random = Math.random,
): State | null {
  if (s.phase !== "bluff" || text.trim().length < 10 || text.length > 240)
    return null;
  const bluffs = [...s.bluffs, text.trim()];
  if (s.turn < s.players - 1) return { ...s, bluffs, turn: s.turn + 1 };
  const choices: Choice[] = [
    { text: entry(s.word)[1], owners: [], true: true },
  ];
  bluffs.forEach((text, p) => {
    const old = choices.find(
      (c) => c.text.toLowerCase() === text.toLowerCase(),
    );
    if (old) old.owners.push(p);
    else choices.push({ text, owners: [p], true: false });
  });
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return { ...s, bluffs, choices, turn: 0, phase: "vote" };
}
export function vote(s: State, index: number): State | null {
  if (
    s.phase !== "vote" ||
    !s.choices[index] ||
    (!s.choices[index].true && s.choices[index].owners.includes(s.turn))
  )
    return null;
  const votes = [...s.votes, index];
  if (s.turn < s.players - 1) return { ...s, votes, turn: s.turn + 1 };
  const scores = [...s.scores];
  votes.forEach((v, p) => {
    const c = s.choices[v];
    if (c.true) scores[p] += 2;
    else
      c.owners.forEach((o) => {
        if (o !== p) scores[o]++;
      });
  });
  return { ...s, votes, scores, phase: s.round === 5 ? "over" : "result" };
}
export function nextRound(s: State, random = Math.random): State | null {
  if (s.phase !== "result") return null;
  const word = randomItem(
    entries.filter((e) => !s.used.includes(e[0])),
    random,
  )[0];
  return {
    ...s,
    word,
    round: s.round + 1,
    turn: 0,
    phase: "bluff",
    bluffs: [],
    choices: [],
    votes: [],
    used: [...s.used, word],
  };
}
export function aiBluff(s: State) {
  return entry(s.word)[2 + (s.turn % 3)];
}
/** Own lexical knowledge; the vote receives displayed texts, never the truth flag. */
export function aiVote(
  word: string,
  texts: string[],
  excluded: number[],
): number {
  const meaning = entry(word)[1],
    known = entries.findIndex((e) => e[0] === word) < 10;
  const allowed = texts.flatMap((text, i) =>
    !excluded.includes(i) ? [{ text, i }] : [],
  );
  if (known) {
    const match = allowed.find((c) => c.text === meaning);
    if (match) return match.i;
  }
  return allowed.sort((a, b) => a.text.length - b.text.length)[0]?.i ?? -1;
}
