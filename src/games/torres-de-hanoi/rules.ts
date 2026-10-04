export type State = { pegs: number[][]; moves: number; won: boolean };
export const initial = (n: number): State => ({
  pegs: [Array.from({ length: n }, (_, i) => n - i), [], []],
  moves: 0,
  won: false,
});
export function move(s: State, from: number, to: number): State {
  if (s.won || from === to || !s.pegs[from]?.length || !s.pegs[to]) return s;
  const disk = s.pegs[from].at(-1)!;
  if (s.pegs[to].length && s.pegs[to].at(-1)! < disk) return s;
  const pegs = s.pegs.map((p) => [...p]);
  pegs[from].pop();
  pegs[to].push(disk);
  return { pegs, moves: s.moves + 1, won: !pegs[0].length && !pegs[1].length };
}
/** The optimal next step from any legal arrangement, rather than a fixed initial script. */
export function nextMove(s: State): [number, number] | null {
  const n = s.pegs.flat().length;
  const solve = (disk: number, target: number): [number, number] | null => {
    if (!disk) return null;
    const source = s.pegs.findIndex((p) => p.includes(disk));
    if (source === target) return solve(disk - 1, target);
    const spare = 3 - source - target;
    return solve(disk - 1, spare) || [source, target];
  };
  return s.won ? null : solve(n, 2);
}
