// Bounded alpha-beta shared only as an algorithm; each game supplies its own rules.
export function searchMove<S, M>(
  state: S,
  options: {
    legal: (s: S) => M[];
    next: (s: S, m: M) => S;
    turn: (s: S) => number;
    value: (s: S) => number;
    terminal?: (s: S) => number | null;
    depth: number;
    limit?: number;
  },
): M | null {
  let nodes = 0;
  const root = options.turn(state),
    sign = root === 2 ? 1 : -1;
  function visit(s: S, d: number, a: number, b: number): number {
    const terminal = options.terminal?.(s);
    if (terminal !== undefined && terminal !== null) return sign * terminal;
    if (++nodes > (options.limit || 18000)) return sign * options.value(s);
    const ms = options.legal(s),
      maximizing = options.turn(s) === root;
    if (!ms.length) return maximizing ? -100000 - d : 100000 + d;
    if (!d) return sign * options.value(s);
    let v = maximizing ? -Infinity : Infinity;
    for (const m of ms) {
      const n = visit(options.next(s, m), d - 1, a, b);
      v = maximizing ? Math.max(v, n) : Math.min(v, n);
      if (maximizing) a = Math.max(a, v);
      else b = Math.min(b, v);
      if (a >= b || nodes > (options.limit || 18000)) break;
    }
    return v;
  }
  let chosen: M | null = null,
    best = -Infinity;
  for (const m of options.legal(state)) {
    const score = visit(
      options.next(state, m),
      options.depth - 1,
      best,
      Infinity,
    );
    if (score > best) {
      best = score;
      chosen = m;
    }
    if (nodes > (options.limit || 18000)) break;
  }
  return chosen;
}
