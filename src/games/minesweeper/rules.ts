export type Cell = {
  mine: boolean;
  number: number;
  open: boolean;
  flag: boolean;
};
export const empty = (size: number): Cell[] =>
  Array.from({ length: size * size }, () => ({
    mine: false,
    number: 0,
    open: false,
    flag: false,
  }));
export function neighbors(index: number, size: number): number[] {
  const r = Math.floor(index / size),
    c = index % size,
    result: number[] = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const rr = r + dr,
        cc = c + dc;
      if (rr >= 0 && rr < size && cc >= 0 && cc < size)
        result.push(rr * size + cc);
    }
  return result;
}
export function generate(
  size: number,
  mines: number,
  first: number,
  random = Math.random,
): Cell[] {
  const result = empty(size),
    safe = new Set([first, ...neighbors(first, size)]),
    spots = result.map((_, i) => i).filter((i) => !safe.has(i));
  if (mines > spots.length) throw new Error("Demasiadas minas");
  for (let i = spots.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [spots[i], spots[j]] = [spots[j], spots[i]];
  }
  spots.slice(0, mines).forEach((i) => (result[i].mine = true));
  result.forEach(
    (cell, i) =>
      (cell.number = neighbors(i, size).filter((j) => result[j].mine).length),
  );
  return result;
}
export function reveal(cells: Cell[], index: number, size: number): Cell[] {
  const next = cells.map((c) => ({ ...c }));
  if (next[index].flag) return next;
  const queue = [index],
    seen = new Set<number>();
  while (queue.length) {
    const i = queue.pop()!;
    if (seen.has(i) || next[i].flag) continue;
    seen.add(i);
    next[i].open = true;
    if (!next[i].mine && next[i].number === 0)
      neighbors(i, size).forEach((j) => {
        if (!next[j].open) queue.push(j);
      });
  }
  return next;
}
export function chord(cells: Cell[], index: number, size: number): Cell[] {
  if (
    !cells[index].open ||
    cells[index].number !==
      neighbors(index, size).filter((i) => cells[i].flag).length
  )
    return cells;
  let next = cells;
  neighbors(index, size)
    .filter((i) => !cells[i].open && !cells[i].flag)
    .forEach((i) => (next = reveal(next, i, size)));
  return next;
}
export const won = (cells: Cell[]) => cells.every((c) => c.mine || c.open);
export function hint(
  cells: Cell[],
  size: number,
): { index: number; type: "safe" | "mine" } | null {
  for (let i = 0; i < cells.length; i++)
    if (cells[i].open && !cells[i].mine) {
      const ns = neighbors(i, size),
        unknown = ns.filter((j) => !cells[j].open && !cells[j].flag),
        flags = ns.filter((j) => cells[j].flag).length;
      if (!unknown.length) continue;
      if (cells[i].number === flags) return { index: unknown[0], type: "safe" };
      if (cells[i].number - flags === unknown.length)
        return { index: unknown[0], type: "mine" };
    }
  return null;
}
