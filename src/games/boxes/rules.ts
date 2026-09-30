export type State = {
  size: number;
  edges: number[];
  boxes: number[];
  turn: number;
  scores: number[];
  players: number;
};
export const initial = (size = 4, players = 2): State => ({
  size,
  edges: Array(2 * size * (size + 1)).fill(0),
  boxes: Array(size * size).fill(0),
  turn: 1,
  scores: Array(players).fill(0),
  players,
});
export function sides(box: number, n: number) {
  const r = Math.floor(box / n),
    c = box % n,
    h = n * (n + 1);
  return [
    r * n + c,
    (r + 1) * n + c,
    h + r * (n + 1) + c,
    h + r * (n + 1) + c + 1,
  ];
}
export const finished = (s: State) => s.boxes.every(Boolean);
export function play(s: State, i: number): State | null {
  if (
    !Number.isInteger(i) ||
    i < 0 ||
    i >= s.edges.length ||
    s.edges[i] ||
    finished(s)
  )
    return null;
  const edges = [...s.edges],
    boxes = [...s.boxes],
    scores = [...s.scores];
  edges[i] = s.turn;
  let gain = 0;
  boxes.forEach((b, j) => {
    if (!b && sides(j, s.size).every((e) => edges[e])) {
      boxes[j] = s.turn;
      scores[s.turn - 1]++;
      gain++;
    }
  });
  return {
    ...s,
    edges,
    boxes,
    scores,
    turn: gain ? s.turn : (s.turn % s.players) + 1,
  };
}
export function bestMove(s: State): number {
  let best = -Infinity,
    choice = -1;
  for (let i = 0; i < s.edges.length; i++)
    if (!s.edges[i]) {
      const n = play(s, i)!,
        gain = n.scores[s.turn - 1] - s.scores[s.turn - 1],
        danger = n.boxes.reduce(
          (v, b, j) =>
            v +
            (!b && sides(j, s.size).filter((e) => n.edges[e]).length === 3
              ? 1
              : 0),
          0,
        ),
        score = gain * 100 - danger * 30;
      if (score > best) {
        best = score;
        choice = i;
      }
    }
  return choice;
}
