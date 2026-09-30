import { shuffled } from "../../shared/cards";
export type Tile = {
  id: number;
  x: number;
  y: number;
  z: number;
  face: number;
  removed: boolean;
  pair?: number;
};
export const group = (face: number) => (face < 34 ? face : face < 38 ? 34 : 35);
export function geometry(): Tile[] {
  const tiles: Tile[] = [];
  const add = (x: number, y: number, z: number) =>
    tiles.push({ id: tiles.length, x, y, z, face: 0, removed: false });
  [12, 8, 10, 12, 12, 10, 8, 12].forEach((n, y) => {
    for (let x = (12 - n) / 2; x < (12 + n) / 2; x++) add(x, y, 0);
  });
  add(-1, 3.5, 0);
  add(12, 3.5, 0);
  add(13, 3.5, 0);
  for (let y = 1; y <= 6; y++) for (let x = 3; x <= 8; x++) add(x, y, 1);
  for (let y = 2; y <= 5; y++) for (let x = 4; x <= 7; x++) add(x, y, 2);
  for (let y = 3; y <= 4; y++) for (let x = 5; x <= 6; x++) add(x, y, 3);
  add(5.5, 3.5, 4);
  return tiles;
}
export function free(tiles: Tile[], tile: Tile): boolean {
  if (tile.removed) return false;
  const active = tiles.filter((t) => !t.removed && t.id !== tile.id);
  if (
    active.some(
      (t) =>
        t.z > tile.z &&
        Math.abs(t.x - tile.x) < 0.99 &&
        Math.abs(t.y - tile.y) < 0.99,
    )
  )
    return false;
  const left = active.some(
      (t) =>
        t.z === tile.z &&
        Math.abs(t.x - (tile.x - 1)) < 0.01 &&
        Math.abs(t.y - tile.y) < 0.99,
    ),
    right = active.some(
      (t) =>
        t.z === tile.z &&
        Math.abs(t.x - (tile.x + 1)) < 0.01 &&
        Math.abs(t.y - tile.y) < 0.99,
    );
  return !left || !right;
}
export function match(tiles: Tile[], a: number, b: number): Tile[] | null {
  const t = tiles.find((t) => t.id === a),
    u = tiles.find((t) => t.id === b);
  if (
    a === b ||
    !t ||
    !u ||
    group(t.face) !== group(u.face) ||
    !free(tiles, t) ||
    !free(tiles, u)
  )
    return null;
  return tiles.map((t) =>
    t.id === a || t.id === b ? { ...t, removed: true } : t,
  );
}
export function hint(tiles: Tile[]): number[] | null {
  const available = tiles.filter((t) => free(tiles, t));
  const arranged = available
    .filter((t) => t.pair !== undefined)
    .sort((a, b) => a.pair! - b.pair!);
  for (let i = 0; i < arranged.length; i++)
    for (let j = i + 1; j < arranged.length; j++)
      if (
        arranged[i].pair === arranged[j].pair &&
        group(arranged[i].face) === group(arranged[j].face)
      )
        return [arranged[i].id, arranged[j].id];
  for (let i = 0; i < available.length; i++)
    for (let j = i + 1; j < available.length; j++)
      if (group(available[i].face) === group(available[j].face))
        return [available[i].id, available[j].id];
  return null;
}
export function arrange(shape: Tile[], random = Math.random): Tile[] {
  const faces = shape.filter((t) => !t.removed).map((t) => t.face),
    pairs: number[][] = [];
  const buckets = new Map<number, number[]>();
  for (const f of faces) {
    const g = group(f);
    buckets.set(g, [...(buckets.get(g) || []), f]);
  }
  for (const fs of buckets.values()) {
    if (fs.length % 2) throw new Error("Unpaired tiles");
    for (let i = 0; i < fs.length; i += 2) pairs.push(fs.slice(i, i + 2));
  }
  for (let attempt = 0; attempt < 150; attempt++) {
    const board = shape.map((t) => ({ ...t })),
      order: number[][] = [];
    while (board.some((t) => !t.removed)) {
      const options = shuffled(
        board.filter((t) => free(board, t)),
        random,
      ).sort((a, b) => b.z - a.z);
      if (options.length < 2) break;
      const a = options[0],
        b = options[1];
      order.push([a.id, b.id]);
      a.removed = b.removed = true;
    }
    if (order.length === pairs.length) {
      const assignments = shuffled(pairs, random),
        n = shape.map((t) => ({ ...t }));
      order.forEach((ids, i) =>
        ids.forEach((id, j) => {
          const tile = n.find((t) => t.id === id)!;
          tile.face = assignments[i][j];
          tile.pair = i;
        }),
      );
      return n;
    }
  }
  throw new Error("No se puede reordenar esta forma: deshaz una pareja.");
}
export function initial(random = Math.random): Tile[] {
  const tiles = geometry(),
    faces = Array.from({ length: 34 }, (_, f) => Array(4).fill(f))
      .flat()
      .concat([34, 35, 36, 37, 38, 39, 40, 41]);
  tiles.forEach((t, i) => (t.face = faces[i]));
  return arrange(tiles, random);
}
