import { vocabulary, normalizeWord } from "../../shared/words";
export type State = {
  words: string[];
  turn: number;
  winner: number | null;
  players: number;
};
export const initial = (players = 2): State => ({
  words: [],
  turn: 0,
  winner: null,
  players,
});
export function required(s: State) {
  return (
    vocabulary.find((w) => w.word === s.words.at(-1))?.syllables.at(-1) || ""
  );
}
export function legal(s: State) {
  const syllable = required(s);
  return vocabulary.filter(
    (w) =>
      !s.words.includes(w.word) &&
      (!syllable || normalizeWord(w.syllables[0]) === syllable),
  );
}
export function play(s: State, text: string): State | null {
  const w = normalizeWord(text);
  if (s.winner !== null || !legal(s).some((x) => x.word === w)) return null;
  const n = { ...s, words: [...s.words, w], turn: (s.turn + 1) % s.players };
  if (!legal(n).length) n.winner = s.turn;
  return n;
}
export function concede(s: State): State {
  return { ...s, winner: (s.turn + s.players - 1) % s.players };
}
export function choose(s: State): string | null {
  return (
    legal(s)
      .map((w) => {
        const n = play(s, w.word)!;
        return {
          word: w.word,
          score: n.winner !== null ? -1 : legal(n).length,
        };
      })
      .sort((a, b) => a.score - b.score)[0]?.word || null
  );
}
