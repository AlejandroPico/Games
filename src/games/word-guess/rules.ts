import { fiveLetterWords, normalizeWord, randomItem } from "../../shared/words";
export type Feedback = ("correct" | "present" | "absent")[];
export type Row = { word: string; feedback: Feedback };
export function feedback(secret: string, word: string): Feedback {
  const result: Feedback = Array(5).fill("absent"),
    left = secret.split("");
  for (let i = 0; i < 5; i++)
    if (word[i] === secret[i]) {
      result[i] = "correct";
      left[i] = "";
    }
  for (let i = 0; i < 5; i++)
    if (result[i] !== "correct") {
      const j = left.indexOf(word[i]);
      if (j >= 0) {
        result[i] = "present";
        left[j] = "";
      }
    }
  return result;
}
export const secretWord = (random = Math.random) =>
  randomItem(fiveLetterWords, random);
export const validGuess = (word: string) =>
  fiveLetterWords.includes(normalizeWord(word));
export function choose(history: Row[]): string | null {
  const candidates = fiveLetterWords.filter((w) =>
    history.every((h) => feedback(w, h.word).join() === h.feedback.join()),
  );
  let best: string | null = null,
    value = Infinity;
  for (const w of candidates) {
    const buckets = new Map<string, number>();
    for (const c of candidates) {
      const key = feedback(c, w).join();
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    const v = [...buckets.values()].reduce((n, x) => n + x * x, 0);
    if (v < value) {
      value = v;
      best = w;
    }
  }
  return best;
}
