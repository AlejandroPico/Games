import type {
  DeductionPosition,
  DeductionCard,
} from "../../shared/DeductionTable";
export const events = [
  {
    name: "Vuelo del Wright Flyer",
    year: 1903,
    source:
      "https://airandspace.si.edu/collection-objects/1903-wright-flyer/nasm_A19610048000",
  },
  { name: "Lanzamiento de Sputnik 1", year: 1957 },
  { name: "Lanzamiento de Explorer 1", year: 1958 },
  { name: "Lanzamiento de Luna 1", year: 1959 },
  {
    name: "Primer vuelo espacial de Yuri Gagarin",
    year: 1961,
    source:
      "https://science.nasa.gov/resource/yuri-gagarin-first-human-in-space/",
  },
  { name: "Lanzamiento de Mariner 2", year: 1962 },
  { name: "Lanzamiento de Luna 4", year: 1963 },
  { name: "Lanzamiento de Venera 2", year: 1965 },
  { name: "Lanzamiento de Luna 9", year: 1966 },
  { name: "Lanzamiento de Venera 4", year: 1967 },
  { name: "Lanzamiento de Apollo 8", year: 1968 },
  { name: "Lanzamiento de Apollo 11", year: 1969 },
  { name: "Lanzamiento de Venera 7", year: 1970 },
  { name: "Lanzamiento de Mariner 9", year: 1971 },
  { name: "Lanzamiento de Pioneer 10", year: 1972 },
  { name: "Lanzamiento de Skylab", year: 1973 },
  { name: "Lanzamiento de Viking 1", year: 1975 },
  { name: "Lanzamiento de Voyager 1", year: 1977 },
  { name: "Lanzamiento de Venera 13", year: 1981 },
  { name: "Lanzamiento de Vega 1", year: 1984 },
  {
    name: "Propuesta de la World Wide Web",
    year: 1989,
    source: "https://home.cern/science/computing/the-birth-of-the-web/",
  },
  { name: "Hubble en órbita", year: 1990 },
  { name: "Lanzamiento de Cassini", year: 1997 },
  { name: "Lanzamiento de Spirit", year: 2003 },
  { name: "Lanzamiento de Rosetta", year: 2004 },
  { name: "Lanzamiento de New Horizons", year: 2006 },
];
export const missionSource =
  "https://nssdc.gsfc.nasa.gov/planetary/chronology.html";
export interface State extends DeductionPosition {
  deck: number[];
  hands: number[][];
  line: number[];
  log: string[];
}
export function initial(n = 2): State {
  const deck = events.map((_, i) => i);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const line = [deck.pop()!],
    hands = Array.from({ length: n }, () => deck.splice(0, 3));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Ordena una carta entre los acontecimientos visibles",
    deck,
    hands,
    line,
    log: [],
  };
}
export function valid(s: State, card: number, slot: number) {
  const year = events[card].year;
  return (
    slot >= 0 &&
    slot <= s.line.length &&
    (slot === 0 || events[s.line[slot - 1]].year <= year) &&
    (slot === s.line.length || year <= events[s.line[slot]].year)
  );
}
export function actions(s: State, _text = "") {
  if (s.winner !== null) return [];
  return s.hands[s.turn].flatMap((card) =>
    Array.from({ length: s.line.length + 1 }, (_, slot) => ({
      key: card + ":" + slot,
      label:
        events[card].name +
        " → " +
        (slot === 0
          ? "antes del primero"
          : slot === s.line.length
            ? "después del último"
            : "entre " +
              events[s.line[slot - 1]].year +
              " y " +
              events[s.line[slot]].year),
    })),
  );
}
export function apply(s: State, key: string) {
  if (!actions(s).some((a) => a.key === key)) return s;
  const x = structuredClone(s),
    [card, slot] = key.split(":").map(Number);
  x.step++;
  x.hands[x.turn] = x.hands[x.turn].filter((i) => i !== card);
  const correct = valid(x, card, slot);
  if (correct) {
    x.line.splice(slot, 0, card);
    x.scores[x.turn]++;
  } else if (x.deck.length) x.hands[x.turn].push(x.deck.pop()!);
  x.message =
    events[card].name +
    " · " +
    events[card].year +
    " · " +
    (correct
      ? "posición correcta"
      : "posición incorrecta; roba otra si queda mazo");
  x.log.push(x.message);
  if (!x.hands[x.turn].length) x.winner = x.turn;
  else x.turn = (x.turn + 1) % x.scores.length;
  return x;
}
export function automatic(s: State) {
  const card = s.hands[s.turn][0],
    slot = Array.from({ length: s.line.length + 1 }, (_, i) => i).find((i) =>
      valid(s, card, i),
    );
  return card !== undefined && slot !== undefined
    ? apply(s, card + ":" + slot)
    : s;
}
export const view = (s: State) => ({
  cards: s.hands[s.turn].map(
    (i): DeductionCard => ({ key: "" + i, label: events[i].name, icon: "⌛" }),
  ),
  notes: [
    ...s.line.map((i) => events[i].year + " · " + events[i].name),
    "Última comprobación: " + (s.log.at(-1) || "ninguna"),
  ],
  private:
    "Tu mano: coloca una carta en la línea temporal. Las fechas de tu mano se revelan después de confirmar.",
});
