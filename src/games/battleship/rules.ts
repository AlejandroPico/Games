export const lengths = [5, 4, 3, 3, 2];
export type Fleet = number[];
export type Shots = number[];
export function createFleet(random = Math.random): Fleet {
  const grid = Array(100).fill(-1);
  for (let id = 0; id < lengths.length; id++) {
    let placed = false;
    for (let tries = 0; !placed && tries < 10000; tries++) {
      const r = Math.floor(random() * 10),
        c = Math.floor(random() * 10),
        vertical = random() < 0.5;
      const cells = Array.from(
        { length: lengths[id] },
        (_, i) => (r + (vertical ? i : 0)) * 10 + c + (vertical ? 0 : i),
      );
      if (
        (vertical ? r + lengths[id] > 10 : c + lengths[id] > 10) ||
        cells.some((i) => grid[i] !== -1)
      )
        continue;
      cells.forEach((i) => (grid[i] = id));
      placed = true;
    }
    if (!placed) throw new Error("No se ha podido colocar la flota.");
  }
  return grid;
}
export function fire(
  fleet: Fleet,
  shots: Shots,
  index: number,
): { shots: Shots; hit: boolean; sunk: number | null } | null {
  if (index < 0 || index >= 100 || shots[index]) return null;
  const next = [...shots],
    id = fleet[index];
  next[index] = id === -1 ? 1 : 2;
  const cells = fleet
    .map((v, i) => (v === id ? i : -1))
    .filter((i) => i !== -1);
  const sunk = id !== -1 && cells.every((i) => next[i] >= 2);
  if (sunk) cells.forEach((i) => (next[i] = 3));
  return { shots: next, hit: id !== -1, sunk: sunk ? id : null };
}
export const defeated = (fleet: Fleet, shots: Shots) =>
  fleet.every((v, i) => v === -1 || shots[i] >= 2);
// The AI only sees shots and remaining ship sizes, never the opponent's hidden fleet.
export function target(shots: Shots, remaining: number[] = lengths): number {
  const heat = Array(100).fill(0),
    hasHit = shots.includes(2);
  for (const size of remaining)
    for (let r = 0; r < 10; r++)
      for (let c = 0; c < 10; c++)
        for (const vertical of [false, true]) {
          if (vertical ? r + size > 10 : c + size > 10) continue;
          const cells = Array.from(
            { length: size },
            (_, i) => (r + (vertical ? i : 0)) * 10 + c + (vertical ? 0 : i),
          );
          if (
            cells.some((i) => shots[i] === 1 || shots[i] === 3) ||
            (hasHit && !cells.some((i) => shots[i] === 2))
          )
            continue;
          cells.forEach((i) => {
            if (!shots[i])
              heat[i] += hasHit
                ? 1 + cells.filter((j) => shots[j] === 2).length * 4
                : 1;
          });
        }
  let best = -1,
    score = -1;
  for (let i = 0; i < 100; i++)
    if (!shots[i] && heat[i] > score) {
      score = heat[i];
      best = i;
    }
  return best;
}
