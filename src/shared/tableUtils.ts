/** Data helpers only: game decisions belong to the individual rules modules. */
export const copy = <T>(value: T): T => structuredClone(value);
export const shuffle = <T>(values: T[]): T[] => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
export const champion = (scores: number[]): number => {
  const best = Math.max(...scores),
    winners = scores.flatMap((s, i) => (s === best ? [i] : []));
  return winners.length === 1 ? winners[0] : -1;
};
export const pick = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];
