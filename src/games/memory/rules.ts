export const icons = [
  "♜",
  "♞",
  "♛",
  "♟",
  "♦",
  "♣",
  "♥",
  "♠",
  "✦",
  "☀",
  "☾",
  "⚓",
];
export function deck(pairs = 8, random = Math.random): string[] {
  const d = [...icons.slice(0, pairs), ...icons.slice(0, pairs)];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}
export function choice(
  known: Record<number, string>,
  available: number[],
  first?: number,
): number {
  if (first !== undefined) {
    const matching = available.find(
      (i) => i !== first && known[i] === known[first],
    );
    if (matching !== undefined) return matching;
  } else {
    for (const i of available) {
      if (known[i] && available.some((j) => j !== i && known[j] === known[i]))
        return i;
    }
  }
  const unknown = available.filter((i) => i !== first && !known[i]);
  const options = unknown.length
    ? unknown
    : available.filter((i) => i !== first);
  return options[Math.floor(Math.random() * options.length)] ?? -1;
}
