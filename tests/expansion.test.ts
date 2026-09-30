import { describe, it, expect } from "vitest";
import * as D from "../src/games/international-draughts/rules";
import * as S from "../src/games/shogi/rules";
import * as X from "../src/games/xiangqi/rules";
import * as SP from "../src/games/spider/rules";
import * as F from "../src/games/freecell/rules";
import * as B from "../src/games/blackjack/rules";
import * as BR from "../src/games/brisca/rules";
import * as M from "../src/games/mahjong/rules";
import * as Y from "../src/games/yahtzee/rules";
import * as MM from "../src/games/mastermind/rules";
import * as Q from "../src/games/quarto/rules";
import * as MU from "../src/games/mus/rules";
import { type Card } from "../src/shared/cards";
import { games } from "../src/games/registry";
const card = (rank: number, suit = 0, id = rank + suit * 13): Card => ({
  rank,
  suit,
  id,
  up: true,
});
const rng = (seed: number) => () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const draughts = (pieces: Record<number, number>, turn = 1): D.State => {
  const board = Array(100).fill(0);
  Object.entries(pieces).forEach(([i, v]) => (board[+i] = v));
  return {
    board,
    turn,
    quiet: 0,
    seen: [D.position(board, turn)],
    ending: null,
  };
};
const shogi = (pieces: Record<number, number>, turn = 1): S.State => {
  const s = S.initial();
  s.board = Array(81).fill(0);
  Object.entries(pieces).forEach(([i, v]) => (s.board[+i] = v));
  s.turn = turn;
  s.history = [{ key: S.key(s), mover: 0, check: false }];
  return s;
};
const xiangqi = (pieces: Record<number, number>, turn = 1): X.State => {
  const s = X.initial();
  s.board = Array(90).fill(0);
  Object.entries(pieces).forEach(([i, v]) => (s.board[+i] = v));
  s.turn = turn;
  s.history = [{ key: X.key(s), mover: 0, check: false }];
  return s;
};
describe("Damas internacionales", () => {
  it("distribuye veinte fichas por lado y mueve primero blancas", () => {
    const s = D.initial();
    expect(s.board.filter((v) => v === 1)).toHaveLength(20);
    expect(s.board.filter((v) => v === 2)).toHaveLength(20);
    expect(D.moves(s.board, 1)).toHaveLength(9);
  });
  it("obliga a capturar hacia atrás y escoge la cadena máxima", () => {
    const s = draughts({ 45: 1, 56: 2, 78: 2, 41: 1, 52: 2 });
    const ms = D.moves(s.board, 1);
    expect(ms.every((m) => m.captures.length === 2)).toBe(true);
    expect(ms[0].path).toEqual([45, 67, 89]);
  });
  it("las damas vuelan y las víctimas siguen bloqueando durante la captura", () => {
    const s = draughts({ 45: 3, 34: 2, 56: 2 });
    const ms = D.moves(s.board, 1);
    expect(ms.every((m) => m.captures.length === 1)).toBe(true);
    expect(ms.length).toBeGreaterThan(2);
  });
  it("no corona al pasar por la última fila durante una captura", () => {
    const s = draughts({ 21: 1, 12: 2, 14: 2 });
    const ms = D.moves(s.board, 1);
    expect(ms[0].path).toEqual([21, 3, 25]);
    expect(ms[0].board[25]).toBe(1);
  });
  it("corona al finalizar y retira todas las víctimas", () => {
    const s = draughts({ 21: 1, 12: 2 });
    const m = D.moves(s.board, 1)[0];
    const n = D.apply(s, m);
    expect(n.board[3]).toBe(3);
    expect(n.board[12]).toBe(0);
    expect(s.board[12]).toBe(2);
  });
  it("aplica repetición, veinticinco movimientos y prioridad de bloqueo", () => {
    const s = draughts({ 81: 3, 18: 4 });
    s.seen = Array(3).fill(D.position(s.board, 1));
    expect(D.result(s)).toBe("Tablas");
    s.seen = [];
    s.quiet = 50;
    expect(D.result(s)).toBe("Tablas");
    s.board[81] = 0;
    expect(D.result(s)).toBe("Ganan negras");
  });
  it("cuenta los finales limitados y mantiene el contador después de capturas", () => {
    const s = draughts({ 83: 3, 18: 4, 30: 2, 52: 2 });
    const n = D.apply(s, D.moves(s.board, 1)[0]);
    expect(n.ending).toBe(32);
    const reduced = { ...n, board: Array(100).fill(0), ending: 12 };
    reduced.board[81] = 3;
    reduced.board[34] = 2;
    reduced.board[56] = 2;
    const next = D.apply(reduced, D.moves(reduced.board, reduced.turn)[0]);
    expect(next.ending).toBe(11);
    const five = draughts({ 83: 3, 18: 4 });
    expect(D.apply(five, D.moves(five.board, 1)[0]).ending).toBe(10);
  });
  it("el motor devuelve una jugada legal", () => {
    const s = D.initial(),
      m = D.bestMove(s, 2);
    expect(D.moves(s.board, 1)).toContainEqual(m);
  });
});
describe("Shogi", () => {
  it("mantiene posición inicial y caballos que saltan", () => {
    const s = S.initial();
    expect(S.legal(s)).toHaveLength(30);
    const b = Array(81).fill(0);
    b[40] = 3;
    b[31] = 1;
    expect(S.attacks(b, 40)).toEqual([21, 23]);
  });
  it("distingue plata, oro y piezas promovidas", () => {
    const b = Array(81).fill(0);
    b[40] = 4;
    expect(S.attacks(b, 40)).toContain(48);
    expect(S.attacks(b, 40)).not.toContain(49);
    b[40] = 9;
    expect(S.attacks(b, 40)).toContain(49);
    expect(S.attacks(b, 40)).not.toContain(48);
  });
  it("promoción obligatoria y opcional al salir de la zona", () => {
    let s = shogi({ 80: 8, 8: -8, 9: 1 });
    expect(S.legal(s).filter((m) => m.from === 9 && m.to === 0)).toEqual([
      { from: 9, to: 0, promote: true },
    ]);
    s = shogi({ 80: 8, 8: -8, 18: 6 });
    expect(S.legal(s).filter((m) => m.from === 18 && m.to === 28)).toHaveLength(
      2,
    );
  });
  it("prohíbe nifu y lanzamientos a filas muertas, pero permite peón en columna de tokin", () => {
    const s = shogi({ 80: 8, 8: -8, 54: 1, 55: 9 });
    s.hands[0][1] = 1;
    s.hands[0][3] = 1;
    const ms = S.legal(s);
    expect(ms.some((m) => m.drop === 1 && m.to % 9 === 0)).toBe(false);
    expect(ms.some((m) => m.drop === 1 && m.to === 46)).toBe(true);
    expect(ms.some((m) => m.drop === 3 && m.to < 18)).toBe(false);
    expect(ms.some((m) => m.drop === 1 && m.to < 9)).toBe(false);
  });
  it("devuelve las capturas sin promoción a la reserva", () => {
    const s = shogi({ 80: 8, 8: -8, 40: 7, 31: -9 });
    const n = S.apply(s, { from: 40, to: 31 });
    expect(n.hands[0][1]).toBe(1);
    expect(s.hands[0][1]).toBe(0);
  });
  it("prohíbe mate por lanzamiento de peón", () => {
    const s = shogi({ 76: 8, 4: -8, 3: -2, 5: -2, 21: 5, 23: 5 });
    s.hands[0][1] = 1;
    expect(S.legal(s, true)).toContainEqual({ from: -1, to: 13, drop: 1 });
    expect(S.legal(s)).not.toContainEqual({ from: -1, to: 13, drop: 1 });
  });
  it("resuelve cuatro repeticiones y sanciona al que da jaque perpetuo", () => {
    const s = S.initial(),
      k = S.key(s);
    s.history = [{ key: k, mover: 0, check: false }];
    for (let i = 0; i < 3; i++)
      s.history.push(
        { key: "other", mover: 1, check: false },
        { key: k, mover: 2, check: false },
      );
    expect(S.result(s)).toContain("Sennichite");
    s.history = s.history.map((e) => ({ ...e, check: e.mover === 1 }));
    expect(S.result(s)).toContain("Pierde Sente");
  });
  it("el motor busca sin mutar y devuelve una jugada legal", () => {
    const s = S.initial(),
      copy = structuredClone(s),
      m = S.bestMove(s, 1);
    expect(S.legal(s)).toContainEqual(m);
    expect(s).toEqual(copy);
  });
});
describe("Xiangqi", () => {
  it("dispone el tablero y detecta generales enfrentados", () => {
    expect(X.initial().board.filter(Boolean)).toHaveLength(32);
    expect(X.checked(xiangqi({ 4: -7, 85: 7 }), 1)).toBe(true);
    expect(X.checked(xiangqi({ 4: -7, 85: 7, 49: 1 }), 1)).toBe(false);
  });
  it("el caballo bloqueado no atraviesa su pata y el elefante respeta río y ojo", () => {
    const b = Array(90).fill(0);
    b[40] = 4;
    b[31] = 1;
    expect(X.attacks(b, 40)).not.toContain(21);
    expect(X.attacks(b, 40)).toContain(59);
    b.fill(0);
    b[58] = 2;
    expect(X.attacks(b, 58)).not.toContain(38);
    b[68] = 1;
    expect(X.attacks(b, 58)).not.toContain(78);
  });
  it("el cañón necesita exactamente una pantalla para capturar", () => {
    const b = Array(90).fill(0);
    b[40] = 5;
    b[22] = -6;
    expect(X.attacks(b, 40)).not.toContain(22);
    b[31] = 1;
    expect(X.attacks(b, 40)).toContain(22);
    b[13] = -6;
    expect(X.attacks(b, 40)).not.toContain(13);
  });
  it("el soldado gana movimiento lateral después de cruzar", () => {
    const b = Array(90).fill(0);
    b[49] = 1;
    expect(X.attacks(b, 49)).toEqual([40]);
    b[40] = 1;
    expect(X.attacks(b, 40)).toEqual([31, 39, 41]);
  });
  it("impide descubrir a los generales y quedarse en jaque", () => {
    const s = xiangqi({ 4: -7, 85: 7, 49: 6 });
    expect(X.legal(s)).not.toContainEqual({ from: 49, to: 48 });
    expect(X.legal(s)).toContainEqual({ from: 49, to: 40 });
  });
  it("revisa repetición y aplica límite sin capturas", () => {
    const s = X.initial(),
      k = X.key(s);
    s.history = Array.from({ length: 3 }, () => ({
      key: k,
      mover: 1,
      check: false,
    }));
    expect(X.result(s)).toContain("revisión");
    s.quiet = 100;
    expect(X.result(s)).toContain("sin capturas");
  });
  it("el motor devuelve un movimiento permitido", () => {
    const s = X.initial();
    expect(X.legal(s)).toContainEqual(X.bestMove(s, 1));
  });
});
describe("Spider y Carta Blanca", () => {
  it("Spider reparte dos barajas únicas y conserva el mazo al repartir", () => {
    for (const suits of [1, 2, 4] as const) {
      const s = SP.initial(suits, rng(suits));
      expect(s.stock).toHaveLength(50);
      expect(
        new Set([...s.columns.flat(), ...s.stock].map((c) => c.id)).size,
      ).toBe(104);
      const n = SP.deal(s)!;
      expect(n.stock).toHaveLength(40);
      expect(n.columns[9]).toHaveLength(6);
      expect(s.columns[9]).toHaveLength(5);
    }
  });
  it("Spider no mueve secuencias de palos distintos pero acepta un destino de otro palo", () => {
    const s = SP.initial();
    s.columns[0] = [card(7, 0), card(6, 1)];
    s.columns[1] = [card(7, 2)];
    expect(SP.moving(s, { pile: 0, index: 0 })).toEqual([]);
    expect(SP.move(s, { pile: 0, index: 1 }, 1)).not.toBeNull();
    s.columns[2] = [];
    expect(SP.deal(s)).toBeNull();
  });
  it("retira rey a as completos y descubre la siguiente carta", () => {
    const s = SP.initial();
    s.columns[0] = [card(1)];
    s.columns[1] = [
      { ...card(4, 1), up: false },
      ...Array.from({ length: 12 }, (_, i) => card(13 - i)),
    ];
    const n = SP.move(s, { pile: 0, index: 0 }, 1)!;
    expect(n.completed).toBe(1);
    expect(n.columns[1]).toHaveLength(1);
    expect(n.columns[1][0].up).toBe(true);
  });
  it("Carta Blanca muestra toda la baraja y excluye del transporte la columna de destino vacía", () => {
    const s = F.initial(rng(1));
    expect(s.columns.map((c) => c.length)).toEqual([7, 7, 7, 7, 6, 6, 6, 6]);
    expect(s.columns.flat().every((c) => c.up)).toBe(true);
    s.cells = [card(1), card(2), card(3), null];
    s.columns[7] = [];
    expect(F.capacity(s, 7)).toBe(2);
    expect(F.capacity(s, 6)).toBe(4);
  });
  it("valida color alterno, capacidad y bases ascendentes sin mutar", () => {
    const s = F.initial();
    s.columns[0] = [card(7, 0), card(6, 1), card(5, 0)];
    s.columns[1] = [card(8, 1)];
    s.cells = [card(1, 1), card(2, 1), card(3, 1), card(4, 1)];
    expect(
      F.move(
        s,
        { kind: "column", pile: 0, index: 0 },
        { kind: "column", pile: 1 },
      ),
    ).toBeNull();
    s.cells = Array(4).fill(null);
    expect(
      F.move(
        s,
        { kind: "column", pile: 0, index: 0 },
        { kind: "column", pile: 1 },
      )?.columns[1],
    ).toHaveLength(4);
    s.columns[2] = [card(1, 0)];
    const n = F.move(
      s,
      { kind: "column", pile: 2, index: 0 },
      { kind: "foundation", pile: 0 },
    )!;
    expect(n.foundations[0]).toHaveLength(1);
    expect(s.columns[2]).toHaveLength(1);
  });
});
const blackjack = (
  ranks: number[],
  dealer: number[],
  shoe = [10, 5, 6],
): B.State => ({
  shoe: shoe.map((r) => card(r)),
  dealer: dealer.map((r) => card(r)),
  hands: [
    {
      cards: ranks.map((r) => card(r)),
      bet: 20,
      status: "playing",
      split: false,
    },
  ],
  active: 0,
  bank: 480,
  phase: "play",
  insurance: 0,
  message: "",
  soft17: false,
});
describe("Blackjack de práctica", () => {
  it("ajusta varios ases y distingue blackjack de veintiuno", () => {
    expect(B.total([card(1), card(1), card(9)])).toEqual({
      value: 21,
      soft: true,
    });
    expect(B.total([card(1), card(1), card(10)])).toEqual({
      value: 12,
      soft: false,
    });
    expect(B.natural([card(7), card(7), card(7)])).toBe(false);
  });
  it("paga tres a dos al natural y devuelve el empate", () => {
    expect(B.settle(blackjack([1, 10], [10, 8])).bank).toBe(530);
    expect(B.settle(blackjack([1, 10], [1, 10])).bank).toBe(500);
  });
  it("liquida seguro y no da acciones después de un natural del crupier", () => {
    const s = { ...blackjack([10, 9], [1, 10]), phase: "insurance" as const };
    const n = B.insurance(s, true);
    expect(n.bank).toBe(500);
    expect(n.phase).toBe("over");
    expect(B.act(n, "hit")).toBeNull();
  });
  it("configura diecisiete blando y devuelve media apuesta al rendirse", () => {
    let s = blackjack([10, 8], [1, 6], [2]);
    expect(B.settle(s).dealer).toHaveLength(2);
    s.soft17 = true;
    expect(B.settle(s).dealer).toHaveLength(3);
    expect(B.act(blackjack([10, 6], [10, 8]), "surrender")?.bank).toBe(490);
  });
  it("separar ases da una carta y veintiuno separado no paga natural", () => {
    const s = blackjack([1, 1], [10, 8], [10, 10]);
    const n = B.act(s, "split")!;
    expect(n.hands).toHaveLength(2);
    expect(n.hands.every((h) => h.split && h.status === "stand")).toBe(true);
    expect(n.bank).toBe(540);
    expect(s.hands).toHaveLength(1);
  });
  it("dobla con una sola carta y exige saldo suficiente", () => {
    const s = blackjack([5, 6], [10, 8], [10]);
    const n = B.act(s, "double")!;
    expect(n.hands[0].bet).toBe(40);
    expect(n.bank).toBe(540);
    s.bank = 0;
    expect(B.act(s, "double")).toBeNull();
  });
});
describe("Brisca", () => {
  it("puntúa correctamente y la mano completa termina con ciento veinte tantos", () => {
    let s = BR.initial(false, rng(91));
    const ids = new Set<number>();
    for (let n = 0; n < 20; n++) {
      for (let j = 0; j < 2; j++) {
        const index = BR.aiMove(s.hands[s.turn], s.trick[0]?.card, s.suit);
        ids.add(s.hands[s.turn][index].id);
        s = BR.play(s, index)!;
      }
      s = BR.collect(s);
    }
    expect(ids.size).toBe(40);
    expect(s.scores[0] + s.scores[1]).toBe(120);
    expect(s.hands.flat()).toHaveLength(0);
    expect(s.trump).toBeNull();
  });
  it("el triunfo más bajo vence al as de otro palo", () => {
    expect(BR.beats(card(2, 1), card(1, 0), 1)).toBe(true);
    expect(BR.beats(card(3, 0), card(1, 0), 1)).toBe(false);
  });
  it("el ganador roba primero y el triunfo se roba al final", () => {
    const s = BR.initial();
    s.stock = [card(7, 2)];
    s.trump = card(1, 3);
    s.suit = 3;
    s.trick = [
      { p: 0, card: card(1, 0) },
      { p: 1, card: card(2, 0) },
    ];
    const n = BR.collect(s);
    expect(n.hands[0].at(-1)?.rank).toBe(7);
    expect(n.hands[1].at(-1)?.suit).toBe(3);
    expect(n.trump).toBeNull();
  });
});
describe("Mahjong solitario", () => {
  it("genera la tortuga y sus parejas, y permite resolver repartos completos", () => {
    for (let seed = 1; seed <= 8; seed++) {
      let tiles = M.initial(rng(seed));
      expect(tiles).toHaveLength(144);
      expect(tiles.filter((t) => t.z === 4)).toHaveLength(1);
      for (let i = 0; i < 72; i++) {
        const pair = M.hint(tiles);
        expect(pair).not.toBeNull();
        tiles = M.match(tiles, pair![0], pair![1])!;
        expect(tiles).not.toBeNull();
      }
      expect(tiles.every((t) => t.removed)).toBe(true);
    }
  });
  it("bloquea por arriba y por los dos lados; flores y estaciones casan dentro de su familia", () => {
    const t = (id: number, x: number, z = 0, face = 0): M.Tile => ({
      id,
      x,
      y: 0,
      z,
      face,
      removed: false,
    });
    expect(M.free([t(0, 0), t(1, 1), t(2, 2)], t(1, 1))).toBe(false);
    expect(M.free([t(0, 0), t(1, 0, 1)], t(0, 0))).toBe(false);
    expect(M.match([t(0, 0, 0, 34), t(1, 2, 0, 37)], 0, 1)).not.toBeNull();
    expect(M.match([t(0, 0, 0, 34), t(1, 2, 0, 38)], 0, 1)).toBeNull();
  });
  it("reordenar conserva las fichas restantes y permite deshacer sin mutación", () => {
    const t = M.initial(rng(2)),
      p = M.hint(t)!,
      n = M.match(t, p[0], p[1])!;
    expect(t.some((t) => t.removed)).toBe(false);
    const r = M.arrange(n, rng(33));
    expect(
      r
        .filter((t) => !t.removed)
        .map((t) => t.face)
        .sort(),
    ).toEqual(
      n
        .filter((t) => !t.removed)
        .map((t) => t.face)
        .sort(),
    );
    expect(M.hint(r)).not.toBeNull();
  });
});
describe("Yahtzee", () => {
  it("respeta reservas y tres tiradas", () => {
    let s = Y.roll(Y.initial(), () => 0)!;
    s.held[0] = true;
    s = Y.roll(s, () => 0.99)!;
    expect(s.dice).toEqual([1, 6, 6, 6, 6]);
    s = Y.roll(s)!;
    expect(Y.roll(s)).toBeNull();
  });
  it("no confunde cinco iguales con full, y detecta escalera con duplicado", () => {
    expect(Y.value([4, 4, 4, 4, 4], 8)).toBe(0);
    expect(Y.value([1, 2, 2, 3, 4], 9)).toBe(30);
    expect(Y.value([1, 2, 2, 3, 4], 10)).toBe(0);
  });
  it("obliga a puntuar arriba con joker y concede cien extra solo con Yahtzee anotado", () => {
    const s = Y.initial();
    s.rolls = 1;
    s.dice = Array(5).fill(4);
    s.sheets[0][11] = 50;
    expect(Y.choices(s)).toEqual([3]);
    expect(Y.score(s, 8)).toBeNull();
    const n = Y.score(s, 3)!;
    expect(n.bonuses[0]).toBe(100);
    s.sheets[0][11] = 0;
    s.sheets[0][3] = 12;
    const zero = Y.score(s, 8)!;
    expect(zero.sheets[0][8]).toBe(25);
    expect(zero.bonuses[0]).toBe(0);
  });
  it("aplica bonus superior y completa una partida de IA sin atascarse", () => {
    let s = Y.initial(2);
    const random = rng(4);
    while (!Y.finished(s)) {
      for (let n = 0; n < 3; n++) {
        s = Y.roll(s, random)!;
        s = { ...s, held: Y.aiHolds(s) };
      }
      s = Y.score(s, Y.aiCategory(s))!;
      expect(s).not.toBeNull();
    }
    expect(s.sheets.flat().every((v) => v !== null)).toBe(true);
    const n = Y.initial();
    n.sheets[0] = [3, 6, 9, 12, 15, 18, 0, 0, 0, 0, 0, 0, 0];
    expect(Y.total(n, 0)).toBe(98);
  });
});
describe("Mastermind", () => {
  it("cuenta duplicados una sola vez", () => {
    expect(MM.feedback([0, 0, 1, 2], [0, 1, 0, 0])).toEqual({
      exact: 1,
      near: 2,
    });
    expect(MM.feedback([0, 0, 0, 0], [0, 1, 1, 1])).toEqual({
      exact: 1,
      near: 0,
    });
    expect(MM.codes(false)).toHaveLength(360);
  });
  it("el deductor ciego resuelve códigos con y sin repetición", () => {
    for (const code of [
      [0, 0, 0, 0],
      [5, 4, 3, 2],
      [1, 5, 1, 4],
      [4, 2, 0, 3],
    ]) {
      const repeats = new Set(code).size !== 4;
      const history: MM.Row[] = [];
      for (let i = 0; i < 10; i++) {
        const guess = MM.suggestion(history, repeats)!;
        expect(guess).not.toBeNull();
        const f = MM.feedback(code, guess);
        history.push({ guess, ...f });
        if (f.exact === 4) break;
      }
      expect(history.at(-1)?.exact).toBe(4);
    }
  });
});
describe("Quarto", () => {
  it("las piezas son únicas y la entrega da el turno al rival", () => {
    const s = Q.initial();
    expect(new Set(s.available).size).toBe(16);
    const n = Q.apply(s, { kind: "gift", value: 7 })!;
    expect(n.held).toBe(7);
    expect(n.turn).toBe(2);
    expect(Q.apply(n, { kind: "gift", value: 0 })).toBeNull();
  });
  it("reconoce atributos comunes, diagonales y canto manual robado", () => {
    expect(Q.common([0, 2, 4, 6])).toBeGreaterThan(0);
    expect(Q.common([0, 3, 12, 15])).toBe(0);
    const s = Q.initial(false);
    s.board[0] = 0;
    s.board[1] = 2;
    s.board[2] = 4;
    s.held = 6;
    s.phase = "place";
    s.available = s.available.filter((v) => ![0, 2, 4, 6].includes(v));
    let n = Q.apply(s, { kind: "place", value: 3 })!;
    expect(n.winner).toBeNull();
    n = Q.apply(n, { kind: "gift", value: 1 })!;
    expect(Q.apply(n, { kind: "claim", value: 0 })?.winner).toBe(2);
  });
  it("permite pasar el último canto y declarar tablas si ambos lo omiten", () => {
    const s = Q.initial(false);
    s.board = Array.from({ length: 16 }, (_, i) => i);
    s.available = [];
    s.pending = [0, 1, 2, 3];
    const n = Q.apply(s, { kind: "pass", value: 0 })!;
    expect(n.turn).toBe(2);
    expect(Q.apply(n, { kind: "pass", value: 0 })?.winner).toBe(0);
  });
  it("el motor aprovecha una victoria inmediata y completa una partida", () => {
    const s = Q.initial();
    s.board[0] = 0;
    s.board[1] = 2;
    s.board[2] = 4;
    s.held = 6;
    s.phase = "place";
    expect(Q.bestMove(s)).toEqual({ kind: "place", value: 3 });
    let n = Q.initial();
    for (let i = 0; i < 40 && n.winner === null; i++) {
      const a = Q.bestMove(n)!;
      expect(a).not.toBeNull();
      n = Q.apply(n, a)!;
    }
    expect(n.winner).not.toBeNull();
  });
});
describe("Mus", () => {
  it("jerarquiza pares y juego con cuatro u ocho reyes", () => {
    expect(MU.pairProfile([card(3), card(12), card(2), card(1)], true)).toEqual(
      [3, 12, 1],
    );
    expect(
      MU.pairProfile([card(3), card(12), card(2), card(1)], false),
    ).toEqual([0, 0, 0]);
    expect(
      MU.profile([card(12), card(11), card(10), card(1)], "juego", true),
    ).toEqual([8]);
    expect(
      MU.profile([card(12), card(11), card(10), card(2)], "juego", false),
    ).toEqual([7]);
  });
  it("el mano gana los empates y los bonus incluyen a ambos compañeros", () => {
    const s = MU.initial(false, 40);
    s.hands = Array.from({ length: 4 }, () => [
      card(12),
      card(12),
      card(1),
      card(1),
    ]);
    s.mano = 3;
    expect(MU.bestPlayer(s, "pares")).toBe(3);
    expect(MU.bonus(s, "pares", 1)).toBe(6);
  });
  it("mus requiere unanimidad y al menos un descarte; recicla sin perder cartas", () => {
    let s = MU.initial(true, 40, rng(5));
    for (let cycle = 0; cycle < 6; cycle++) {
      for (let i = 0; i < 4; i++) s = MU.act(s, { type: "mus" })!;
      expect(s.phase).toBe("discard");
      expect(MU.act(s, { type: "discard", indices: [] })).toBeNull();
      for (let i = 0; i < 4; i++) {
        s = MU.act(
          s,
          { type: "discard", indices: [0, 1, 2, 3] },
          rng(cycle + i + 1),
        )!;
        expect(
          new Set([...s.hands.flat(), ...s.stock, ...s.muck].map((c) => c.id))
            .size,
        ).toBe(40);
      }
      expect(s.phase).toBe("mus");
    }
  });
  it("rechazar apertura concede uno y rechazar subida concede el envite anterior", () => {
    let s = MU.act(MU.initial(), { type: "cut" })!;
    s = MU.act(s, { type: "bid", amount: 2 })!;
    expect(s.turn).toBe(1);
    const declined = MU.act(s, { type: "pass" })!;
    expect(declined.scores[0]).toBe(1);
    s = MU.act(s, { type: "bid", amount: 2 })!;
    expect(s.turn).toBe(2);
    const raised = MU.act(s, { type: "pass" })!;
    expect(raised.scores[1]).toBe(2);
  });
  it("el órdago aceptado acaba inmediatamente el juego", () => {
    let s = MU.act(MU.initial(), { type: "cut" })!;
    const winner = MU.team(MU.bestPlayer(s, "grande"));
    s = MU.act(s, { type: "bid", amount: -1 })!;
    s = MU.act(s, { type: "want" })!;
    expect(s.phase).toBe("over");
    expect(s.scores[winner]).toBe(s.target);
  });
  it("simula un juego completo con IA, descartes, envites y liquidación", () => {
    const random = rng(17);
    let s = MU.initial(true, 30, random);
    for (let step = 0; step < 2000 && s.phase !== "over"; step++) {
      if (s.phase === "showdown")
        s = MU.initial(
          s.eight,
          s.target,
          random,
          s.scores,
          (s.mano + 1) % 4,
          s.round + 1,
        );
      else {
        const a = MU.aiAction(s, random),
          n = MU.act(s, a, random);
        expect(n, JSON.stringify({ phase: s.phase, action: a })).not.toBeNull();
        s = n!;
      }
      expect(
        new Set([...s.hands.flat(), ...s.stock, ...s.muck].map((c) => c.id))
          .size,
      ).toBe(40);
    }
    expect(s.phase).toBe("over");
  });
});
describe("Registro de la ampliación", () => {
  it("activa las rutas solicitadas sin duplicar las fichas pendientes", () => {
    for (const id of [
      "damas-internacionales",
      "shogi-ajedrez-japones",
      "xiangqi-ajedrez-chino",
      "solitario-spider",
      "solitario-carta-blanca-freecell",
      "blackjack-21",
      "mus",
      "brisca",
      "mahjong-solitario",
      "yahtzee-la-generala",
      "mastermind",
      "quarto",
    ])
      expect(games.find((g) => g.id === id)?.ready).toBe(true);
    expect(new Set(games.map((g) => g.id)).size).toBe(games.length);
  });
});

describe("Finales y recuentos especiales", () => {
  it("impasse requiere ambos reyes en campo rival y calcula veinticuatro puntos", () => {
    expect(S.impasse(S.initial())).toBeNull();
    const s = shogi({ 4: 8, 76: -8 });
    s.hands[0][6] = 2;
    s.hands[0][1] = 14;
    s.hands[1][7] = 2;
    for (const t of [1, 2, 3, 4, 5]) s.hands[1][t] = 4;
    expect(S.impasse(s)).toBe("Impasse · tablas");
    s.hands[0][1] = 13;
    expect(S.impasse(s)).toBe("Impasse · gana Gote");
  });
  it("el ahogado en Xiangqi pierde aunque el general no esté en jaque", () => {
    const s = xiangqi({ 4: -7, 22: -2, 75: -6, 77: -6, 85: 7 });
    expect(X.checked(s)).toBe(false);
    expect(X.legal(s)).toHaveLength(0);
    expect(X.result(s)).toBe("Ganan negras");
  });
  it("Mus deja de sumar lances en cuanto una pareja alcanza el objetivo", () => {
    let s = MU.initial(false, 30, rng(31), [29, 29]);
    s.hands = [12, 1, 6, 5].map((rank) =>
      Array.from({ length: 4 }, (_, suit) => card(rank, suit)),
    );
    s = MU.act(s, { type: "cut" })!;
    for (let n = 0; n < 16 && s.phase === "bet"; n++)
      s = MU.act(s, { type: "pass" })!;
    expect(s.phase).toBe("over");
    expect(s.scores).toEqual([30, 29]);
  });
});
