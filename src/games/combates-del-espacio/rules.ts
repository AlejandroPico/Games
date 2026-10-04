import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  ships: { health: number; shield: number }[][];
  hands: number[][];
  deck: number[];
  round: number;
}
const names = ["Láser", "Torpedo", "Escudo", "Reparación", "Despliegue"];
export function initial(n: number): State {
  const deck = shuffle(Array.from({ length: 90 }, (_, i) => i % 5));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(12),
    step: 0,
    message: "Activa una carta de tu flota",
    ships: Array.from({ length: n }, () =>
      Array.from({ length: 3 }, () => ({ health: 4, shield: 0 })),
    ),
    hands: Array.from({ length: n }, () => deck.splice(0, 5)),
    deck,
    round: 1,
  };
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  const a = [{ key: "draw", label: "Robar dos cartas (máximo ocho)" }];
  s.hands[s.turn].forEach((c, k) => {
    if (c <= 1)
      for (let p = 0; p < s.ships.length; p++)
        if (p !== s.turn)
          for (let lane = 0; lane < 3; lane++)
            if (s.ships[p][lane].health > 0)
              a.push({
                key: "hit:" + k + "," + p + "," + lane,
                label: names[c] + " a J" + (p + 1) + " nave " + (lane + 1),
              });
    if (c >= 2)
      for (let lane = 0; lane < 3; lane++)
        if (
          c === 4
            ? s.ships[s.turn][lane].health <= 0
            : s.ships[s.turn][lane].health > 0
        )
          a.push({
            key: "support:" + k + "," + lane,
            label: names[c] + " nave " + (lane + 1),
          });
  });
  return a;
}
function draw(t: State, p: number, n: number) {
  for (let i = 0; i < n && t.hands[p].length < 8; i++) {
    if (!t.deck.length)
      t.deck = shuffle(Array.from({ length: 50 }, (_, i) => i % 5));
    t.hands[p].push(t.deck.pop()!);
  }
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn;
  if (key === "draw") draw(t, p, 2);
  else {
    const [a, raw] = key.split(":"),
      [k, x, lane] = raw.split(",").map(Number),
      c = t.hands[p].splice(k, 1)[0];
    if (a === "hit") {
      const ship = t.ships[x][lane],
        damage = c === 0 ? 2 : 3,
        blocked = c === 1 ? 0 : Math.min(damage, ship.shield);
      ship.shield = Math.max(0, ship.shield - blocked);
      ship.health = Math.max(0, ship.health - damage + blocked);
    } else {
      const ship = t.ships[p][x];
      if (c === 2) ship.shield = Math.min(4, ship.shield + 2);
      if (c === 3) ship.health = Math.min(4, ship.health + 2);
      if (c === 4) {
        ship.health = 2;
        ship.shield = 0;
      }
    }
    draw(t, p, 1);
  }
  t.step++;
  t.scores = t.ships.map((ships) => ships.reduce((v, s) => v + s.health, 0));
  const live = t.scores.flatMap((v, i) => (v > 0 ? [i] : []));
  if (live.length === 1) t.winner = live[0];
  else {
    for (let k = 1; k <= t.ships.length; k++) {
      const next = (p + k) % t.ships.length;
      if (t.scores[next] > 0) {
        if (next <= p) t.round++;
        t.turn = next;
        break;
      }
    }
    if (t.round > 25) t.winner = champion(t.scores);
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    attacks = a.filter((a) => a.key.startsWith("hit:"));
  if (attacks.length) {
    const value = (key: string) => {
      const [k, p, l] = key.split(":")[1].split(",").map(Number),
        c = s.hands[s.turn][k],
        target = s.ships[p][l];
      return (c === 1 ? 3 : 2) - target.shield + (target.health <= 3 ? 3 : 0);
    };
    return apply(s, attacks.sort((a, b) => value(b.key) - value(a.key))[0].key);
  }
  return apply(s, a.find((a) => a.key.startsWith("support:"))?.key || "draw");
}
export function view(s: State) {
  return {
    cards: s.hands[s.turn].map((c, i) => ({
      key: String(i),
      label: names[c],
      icon: ["⚡", "➤", "◇", "✚", "▲"][c],
    })),
    notes: [
      "Ronda " +
        s.round +
        "/25. Tres naves de cuatro cascos por flota. Láser 2 daño, Torpedo 3 e ignora escudos.",
      "Escudo +2 (máx.4), Reparación +2 cascos (máx.4), Despliegue revive nave con dos cascos. Una flota sin naves se elimina.",
      "Gana la última flota o quien conserve más cascos al límite. Las cartas propias son privadas; naves y escudos son públicos.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 3,
    cells: s.ships.flatMap((ships, p) =>
      ships.map((ship, i) => ({
        key: p + ":" + i,
        label: "J" + (p + 1) + " · nave " + (i + 1),
        symbol: ship.health ? "▲" : "×",
        owner: p,
        detail: ship.health + " casco / " + ship.shield + " escudo",
      })),
    ),
  };
}

export const engine: StrategyEngine<State> = {
  initial,
  actions,
  apply,
  automatic,
  view,
  scene,
};
