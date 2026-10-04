import type { StrategyEngine } from "../../shared/StrategyTable";
import type { DeductionPosition } from "../../shared/DeductionTable";
import { copy, shuffle, pick, champion } from "../../shared/tableUtils";

export interface State extends DeductionPosition {
  hands: number[][];
  fields: { kind: number; count: number }[][];
  deck: number[];
  offer: number[];
  phase: "plant" | "market" | "respond";
  round: number;
  offerer: number;
  proposal: { i: number; target: number; field: number } | null;
  refused: string[];
}
const names = ["Azul", "Roja", "Verde", "Café", "Blanca"],
  threshold = [3, 3, 4, 2, 4];
export function initial(n: number): State {
  const deck = shuffle(Array.from({ length: 80 }, (_, i) => i % 5));
  return {
    turn: 0,
    winner: null,
    scores: Array(n).fill(0),
    step: 0,
    message: "Planta la primera alubia de tu mano",
    hands: Array.from({ length: n }, () => deck.splice(0, 5)),
    fields: Array.from({ length: n }, () => [
      { kind: -1, count: 0 },
      { kind: -1, count: 0 },
    ]),
    deck,
    offer: [],
    phase: "plant",
    round: 1,
    offerer: 0,
    proposal: null,
    refused: [],
  };
}
function plant(t: State, p: number, k: number, f: number) {
  const field = t.fields[p][f];
  if (field.kind !== k && field.count) {
    t.scores[p] += Math.floor(field.count / threshold[field.kind]);
    field.count = 0;
  }
  field.kind = k;
  field.count++;
}
export function actions(s: State) {
  if (s.winner !== null) return [];
  if (s.phase === "respond")
    return [
      { key: "accept", label: "Aceptar compra por 1 moneda" },
      { key: "reject", label: "Rechazar compra" },
    ];
  if (s.phase === "plant")
    return [0, 1].map((f) => ({
      key: "plant:" + f,
      label:
        "Plantar primera carta en campo " +
        (f + 1) +
        (s.fields[s.turn][f].count ? " (cosecha si cambia especie)" : ""),
    }));
  const a: { key: string; label: string }[] = [];
  s.offer.forEach((k, i) => {
    for (let f = 0; f < 2; f++)
      a.push({
        key: "own:" + i + "," + f,
        label: "Plantar " + names[k] + " del mercado en campo " + (f + 1),
      });
    for (let p = 0; p < s.hands.length; p++)
      if (p !== s.turn)
        for (let f = 0; f < 2; f++)
          if (
            (s.fields[p][f].kind === k || s.fields[p][f].count === 0) &&
            !s.refused.includes(i + ":" + p)
          )
            a.push({
              key: "trade:" + i + "," + p + "," + f,
              label: "Vender " + names[k] + " a J" + (p + 1) + " por 1 moneda",
            });
  });
  return a;
}
export function apply(s: State, key: string): State {
  if (!actions(s).some((a) => a.key === key)) return s;
  const t = copy(s),
    p = t.turn,
    [a, raw] = key.split(":"),
    [i, target, f] = (raw || "").split(",").map(Number);
  t.step++;
  if (t.phase === "respond") {
    const proposal = t.proposal!,
      seller = t.offerer;
    if (key === "accept") {
      const kind = t.offer.splice(proposal.i, 1)[0];
      plant(t, p, kind, proposal.field);
      t.scores[seller]++;
      t.scores[p]--;
      t.refused = [];
    } else t.refused.push(proposal.i + ":" + p);
    t.turn = seller;
    t.proposal = null;
    t.phase = "market";
    t.message = "Planta o vende las cartas del mercado";
  } else if (a === "plant") {
    const k = t.hands[p].shift();
    if (k !== undefined) plant(t, p, k, i);
    t.offer = t.deck.splice(0, 2);
    t.offerer = p;
    t.refused = [];
    t.phase = "market";
    t.message = "Planta o vende las cartas del mercado";
  } else if (a === "trade") {
    t.proposal = { i, target, field: f };
    t.offerer = p;
    t.turn = target;
    t.phase = "respond";
    t.message = "Recibe oferta: decide si aceptas pagar una moneda";
    return t;
  } else {
    const k = t.offer.splice(i, 1)[0];
    plant(t, p, k, target);
    t.refused = [];
  }
  if (t.phase === "market" && !t.offer.length) {
    const owner = t.turn;
    if (t.deck.length) t.hands[owner].push(...t.deck.splice(0, 3));
    t.turn = (owner + 1) % t.hands.length;
    if (t.turn === 0) t.round++;
    t.phase = "plant";
    t.message = "Planta la primera alubia de tu mano";
    if (!t.deck.length || t.round > 12) {
      for (let p = 0; p < t.hands.length; p++)
        for (const field of t.fields[p])
          if (field.count)
            t.scores[p] += Math.floor(field.count / threshold[field.kind]);
      t.winner = champion(t.scores);
    }
  }
  return t;
}
export function automatic(s: State): State {
  const a = actions(s),
    p = s.turn;
  if (s.phase === "respond") {
    const offer = s.proposal!,
      field = s.fields[p][offer.field],
      kind = s.offer[offer.i];
    return apply(
      s,
      field.kind === kind && (field.count + 1) % threshold[kind] === 0
        ? "accept"
        : "reject",
    );
  }
  if (s.phase === "plant") {
    const k = s.hands[p][0],
      f = s.fields[p].findIndex((f) => f.kind === k || !f.count);
    return apply(
      s,
      "plant:" +
        (f >= 0 ? f : s.fields[p][0].count < s.fields[p][1].count ? 0 : 1),
    );
  }
  const own = a.filter((a) => a.key.startsWith("own:")),
    value = (key: string) => {
      const [i, f] = key.split(":")[1].split(",").map(Number),
        field = s.fields[p][f];
      return field.kind === s.offer[i]
        ? 3
        : field.count === 0
          ? 2
          : -field.count;
    };
  return apply(s, own.sort((a, b) => value(b.key) - value(a.key))[0].key);
}
export function view(s: State) {
  return {
    cards: s.hands[s.turn]
      .map((k, i) => ({
        key: "h" + i,
        label: (i === 0 ? "Primera: " : "") + names[k],
        icon: "◒",
      }))
      .concat(
        s.offer.map((k, i) => ({
          key: "m" + i,
          label: "Mercado: " + names[k],
          icon: "❧",
        })),
      ),
    notes: [
      "Mazo " + s.deck.length + " · ronda " + s.round + "/12",
      "La mano mantiene su orden. Plantar otra especie cosecha el campo y lo reinicia. Umbral de monedas: Azul3, Roja3, Verde4, Café2, Blanca4.",
      "Venta por precio fijo: la persona destinataria decide aceptar o rechazar en su propio turno. Puede pagar a crédito. No hay negociación libre ni se reproduce una baraja comercial.",
    ],
  };
}
export function scene(s: State) {
  return {
    columns: 2,
    cells: s.fields.flatMap((fields, p) =>
      fields.map((f, i) => ({
        key: p + ":" + i,
        label: "J" + (p + 1) + " campo " + (i + 1),
        symbol: "❧",
        owner: p,
        detail: f.count ? f.count + " " + names[f.kind] : "Vacío",
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
