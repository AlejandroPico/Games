import { alphabet, normalizeWord, vocabulary } from "../../shared/words";
export type State = {
  word: string;
  category: string;
  guessed: string[];
  limit: number;
};
export function initial(limit = 6, random = Math.random): State {
  const w = vocabulary[Math.floor(random() * vocabulary.length)];
  return { word: w.word, category: w.category, guessed: [], limit };
}
export const misses = (s: State) =>
  s.guessed.filter((c) => !s.word.includes(c)).length;
export const won = (s: State) =>
  [...s.word].every((c) => s.guessed.includes(c));
export const finished = (s: State) => won(s) || misses(s) >= s.limit;
export function guess(s: State, letter: string): State | null {
  const c = normalizeWord(letter);
  return alphabet.includes(c) && !s.guessed.includes(c) && !finished(s)
    ? { ...s, guessed: [...s.guessed, c] }
    : null;
}
/** Only the visible mask and public category are passed to the player. */
export function choose(
  mask: string[],
  used: string[],
  category: string,
): string | null {
  const candidates = vocabulary.filter(
    (w) =>
      w.category === category &&
      w.word.length === mask.length &&
      mask.every((c, i) =>
        c === "" ? !used.includes(w.word[i]) : w.word[i] === c,
      ),
  );
  const ranked = alphabet
    .filter((c) => !used.includes(c))
    .map(
      (c) => [c, candidates.filter((w) => w.word.includes(c)).length] as const,
    )
    .sort((a, b) => b[1] - a[1]);
  return ranked[0]?.[0] ?? null;
}
