import { vocabulary, normalizeWord } from "../../shared/words";
export const lexicon = [
  ...new Set([
    ...vocabulary.map((w) => w.word),
    ..."AS ES EN EL LA LO LE SE SI NO MI TU SU UN AL DE DO FE IR OS TE TI NI O JO YA YO DOS TRES MAS MES PIE SAL SOL MAR CAL COL FIN GAS HAZ HOY JUEZ LUZ MAL MIL MUY OJO PAZ RED REY RIO ROL SER SIN SON SUR TAN TIA TIO VAS VEN VER VOZ VEZ VIA VIDA VINO".split(
      " ",
    ),
  ]),
].filter((w) => w.length >= 2 && w.length <= 9);
const validWords = new Set(lexicon);
export const values: Record<string, number> = {
  A: 1,
  E: 1,
  I: 1,
  O: 1,
  U: 1,
  L: 1,
  N: 1,
  R: 1,
  S: 1,
  T: 1,
  D: 2,
  G: 2,
  B: 3,
  C: 3,
  M: 3,
  P: 3,
  F: 4,
  H: 4,
  V: 4,
  Y: 4,
  Q: 5,
  J: 8,
  Ñ: 8,
  X: 8,
  Z: 10,
};
export type Placement = { i: number; letter: string };
export type State = {
  board: string[];
  racks: string[][];
  bag: string[];
  turn: number;
  scores: number[];
  passes: number;
  over: boolean;
  message: string;
};
function shuffle<T>(a: T[], random: () => number) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function initial(random = Math.random): State {
  const counts: Record<string, number> = {
    A: 12,
    E: 12,
    I: 6,
    O: 9,
    U: 5,
    N: 6,
    R: 5,
    S: 6,
    T: 4,
    L: 4,
    D: 5,
    C: 4,
    B: 2,
    M: 3,
    P: 2,
    G: 2,
    F: 1,
    H: 2,
    V: 1,
    Y: 1,
    Q: 1,
    J: 1,
    Ñ: 1,
    X: 1,
    Z: 1,
  };
  const bag = shuffle(
      Object.entries(counts).flatMap(([c, n]) => Array<string>(n).fill(c)),
      random,
    ),
    racks: string[][] = [];
  for (let p = 0; p < 2; p++) {
    const candidates = lexicon.filter(
      (w) =>
        w.length >= 3 &&
        w.length <= 4 &&
        [...w].every(
          (c) =>
            bag.filter((x) => x === c).length >=
            [...w].filter((x) => x === c).length,
        ),
    );
    const seed = candidates[Math.floor(random() * candidates.length)] || "MAR",
      rack: string[] = [];
    for (const c of seed) {
      bag.splice(bag.indexOf(c), 1);
      rack.push(c);
    }
    while (rack.length < 7 && bag.length) rack.push(bag.pop()!);
    racks.push(shuffle(rack, random));
  }
  return {
    board: Array(81).fill(""),
    racks,
    bag,
    turn: 0,
    scores: [0, 0],
    passes: 0,
    over: false,
    message: "Forma una palabra que cruce el centro.",
  };
}
export function multiplier(i: number): [number, number] {
  if ([0, 8, 40, 72, 80].includes(i)) return [1, 2];
  if ([10, 16, 64, 70].includes(i)) return [3, 1];
  if ([20, 24, 56, 60].includes(i)) return [2, 1];
  return [1, 1];
}
export function validate(
  s: State,
  placements: Placement[],
): { score: number; words: string[]; rack: string[] } | null {
  if (
    s.over ||
    !placements.length ||
    placements.length > 7 ||
    new Set(placements.map((p) => p.i)).size !== placements.length
  )
    return null;
  const rack = [...s.racks[s.turn]],
    board = [...s.board];
  for (const p of placements) {
    if (
      !Number.isInteger(p.i) ||
      p.i < 0 ||
      p.i >= 81 ||
      board[p.i] ||
      p.letter.length !== 1
    )
      return null;
    const j = rack.indexOf(p.letter);
    if (j < 0) return null;
    rack.splice(j, 1);
    board[p.i] = p.letter;
  }
  const row = Math.floor(placements[0].i / 9),
    col = placements[0].i % 9,
    horizontal = placements.every((p) => Math.floor(p.i / 9) === row),
    vertical = placements.every((p) => p.i % 9 === col);
  if (!horizontal && !vertical) return null;
  const step = horizontal ? 1 : 9,
    indices = placements.map((p) => p.i).sort((a, b) => a - b);
  for (let i = indices[0]; i <= indices.at(-1)!; i += step)
    if (!board[i]) return null;
  if (!s.board.some(Boolean)) {
    if (!placements.some((p) => p.i === 40)) return null;
  } else if (
    !placements.some((p) =>
      [
        [Math.floor(p.i / 9) - 1, p.i % 9],
        [Math.floor(p.i / 9) + 1, p.i % 9],
        [Math.floor(p.i / 9), (p.i % 9) - 1],
        [Math.floor(p.i / 9), (p.i % 9) + 1],
      ].some(
        ([r, c]) => r >= 0 && r < 9 && c >= 0 && c < 9 && !!s.board[r * 9 + c],
      ),
    )
  )
    return null;
  const created = new Set(placements.map((p) => p.i)),
    seen = new Set<string>(),
    words: string[] = [];
  let score = 0;
  for (const p of placements)
    for (const d of [1, 9]) {
      let start = p.i;
      while (
        start - d >= 0 &&
        (d !== 1 || Math.floor((start - d) / 9) === Math.floor(start / 9)) &&
        board[start - d]
      )
        start -= d;
      const chain: number[] = [];
      for (
        let i = start;
        i < 81 &&
        (d !== 1 || Math.floor(i / 9) === Math.floor(start / 9)) &&
        board[i];
        i += d
      )
        chain.push(i);
      if (chain.length < 2) continue;
      const key = start + ":" + d;
      if (seen.has(key)) continue;
      seen.add(key);
      const word = chain.map((i) => board[i]).join("");
      if (!validWords.has(word)) return null;
      words.push(word);
      let sum = 0,
        multi = 1;
      for (const i of chain) {
        const [letter, w] = created.has(i) ? multiplier(i) : [1, 1];
        sum += (values[board[i]] || 1) * letter;
        multi *= w;
      }
      score += sum * multi;
    }
  if (!words.length) return null;
  if (placements.length === 7) score += 50;
  return { score, words, rack };
}
function finish(s: State, empty: number | null): State {
  const scores = s.scores.map(
    (v, p) => v - s.racks[p].reduce((n, c) => n + (values[c] || 1), 0),
  );
  if (empty !== null)
    scores[empty] += s.racks[1 - empty].reduce(
      (n, c) => n + (values[c] || 1),
      0,
    );
  return {
    ...s,
    scores,
    over: true,
    message: "Final · " + scores.join(" / ") + " puntos",
  };
}
export function play(s: State, placements: Placement[]): State | null {
  const result = validate(s, placements);
  if (!result) return null;
  const board = [...s.board],
    bag = [...s.bag],
    racks = s.racks.map((r) => [...r]),
    scores = [...s.scores];
  placements.forEach((p) => (board[p.i] = p.letter));
  racks[s.turn] = result.rack;
  while (racks[s.turn].length < 7 && bag.length) racks[s.turn].push(bag.pop()!);
  scores[s.turn] += result.score;
  const n = {
    ...s,
    board,
    bag,
    racks,
    scores,
    turn: 1 - s.turn,
    passes: 0,
    message: result.words.join(" + ") + " · +" + result.score,
  };
  return !bag.length && !racks[s.turn].length ? finish(n, s.turn) : n;
}
export function pass(s: State): State | null {
  if (s.over) return null;
  const n = {
    ...s,
    turn: 1 - s.turn,
    passes: s.passes + 1,
    message: "Turno pasado.",
  };
  return n.passes >= 4 ? finish(n, null) : n;
}
export function exchange(s: State, random = Math.random): State | null {
  if (s.over || s.bag.length < 7) return null;
  const bag = shuffle([...s.bag], random),
    old = s.racks[s.turn],
    rack = bag.splice(-old.length);
  bag.push(...old);
  const racks = s.racks.map((r, p) => (p === s.turn ? rack : r));
  return pass({
    ...s,
    bag: shuffle(bag, random),
    racks,
    message: "Atril cambiado.",
  });
}
export function bestMove(s: State): Placement[] | null {
  let best = -1,
    chosen: Placement[] | null = null;
  for (const word of lexicon)
    for (const d of [1, 9])
      for (let start = 0; start < 81; start++) {
        if (
          (d === 1 && (start % 9) + word.length > 9) ||
          (d === 9 && Math.floor(start / 9) + word.length > 9)
        )
          continue;
        const ps: Placement[] = [];
        let ok = true;
        for (let k = 0; k < word.length; k++) {
          const i = start + k * d;
          if (s.board[i]) {
            if (s.board[i] !== word[k]) {
              ok = false;
              break;
            }
          } else ps.push({ i, letter: word[k] });
        }
        if (!ok) continue;
        const v = validate(s, ps);
        if (v && v.score > best) {
          best = v.score;
          chosen = ps;
        }
      }
  return chosen;
}
export const normalized = normalizeWord;
