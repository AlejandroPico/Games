import { describe, it, expect } from "vitest";
import * as P from "../src/games/pente/rules";
import * as G from "../src/games/gomoku/rules";
import * as H from "../src/games/hex/rules";
import * as B from "../src/games/boxes/rules";
import * as S from "../src/games/sprouts/rules";
import * as BG from "../src/games/backgammon/rules";
import * as C from "../src/games/colonizers/rules";
import * as W from "../src/games/word-guess/rules";
import * as A from "../src/games/hangman/rules";
import * as E from "../src/games/word-chain/rules";
import * as BT from "../src/games/basta/rules";
import * as D from "../src/games/dictionary/rules";
import * as CW from "../src/games/crosswords/rules";
import {
  normalizeWord,
  fiveLetterWords,
  vocabulary,
} from "../src/shared/words";
import { games } from "../src/games/registry";
import { guides } from "../src/shared/guides";
import { solve } from "../src/games/sudoku/solver";
import { generate, complete } from "../src/games/sudoku/rules";
import * as T from "../src/games/tic-tac-toe/rules";
import * as R from "../src/games/reversi/rules";
import * as F from "../src/games/connect-four/rules";
import * as CH from "../src/games/checkers/rules";
const rng = (seed: number) => () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
describe("Cinco en línea y capturas", () => {
  it("gana por cinco y por seis en Gomoku libre, para ambos lados", () => {
    for (const turn of [1, 2])
      for (const count of [4, 5]) {
        const s = G.initial();
        s.turn = turn;
        for (let c = 0; c < count; c++) s.board[7 * 15 + c] = turn;
        expect(G.play(s, 7 * 15 + count)?.winner).toBe(turn);
      }
  });
  it("captura varias parejas con una piedra y gana al llegar a cinco pares", () => {
    const s = P.initial();
    s.captures = [3, 0];
    s.board[10 * 19 + 11] = 2;
    s.board[10 * 19 + 12] = 2;
    s.board[10 * 19 + 13] = 1;
    s.board[11 * 19 + 10] = 2;
    s.board[12 * 19 + 10] = 2;
    s.board[13 * 19 + 10] = 1;
    const n = P.play(s, 10 * 19 + 10)!;
    expect(n.captures[0]).toBe(5);
    expect(n.winner).toBe(1);
    expect(n.board[10 * 19 + 11]).toBe(0);
    expect(n.board[11 * 19 + 10]).toBe(0);
  });
  it("no captura tres piedras ni el par que entra en una captura antigua", () => {
    const s = P.initial();
    s.board[0] = 1;
    s.board[1] = 2;
    s.board[3] = 1;
    s.turn = 2;
    const n = P.play(s, 2)!;
    expect(n.board.slice(0, 4)).toEqual([1, 2, 2, 1]);
    expect(n.captures).toEqual([0, 0]);
  });
  it("las IA completan y bloquean victorias desde ambos colores", () => {
    for (const turn of [1, 2]) {
      const s = G.initial();
      s.turn = turn;
      for (let i = 0; i < 4; i++) s.board[90 + i] = turn;
      expect(G.play(s, G.bestMove(s))?.winner).toBe(turn);
      const other = G.initial();
      other.turn = turn;
      for (let i = 0; i < 4; i++) other.board[i] = 3 - turn;
      expect(G.bestMove(other)).toBe(4);
    }
  });
  it("termina una partida completa de Pente con jugadas legales", () => {
    let s = P.initial();
    let n = 0;
    while (!s.winner && n++ < 400) {
      const next = P.play(s, P.bestMove(s));
      expect(next).not.toBeNull();
      s = next!;
    }
    expect(s.winner).toBeGreaterThan(0);
  });
});
describe("Hex, Cajas y Brotes", () => {
  it("usa seis vecinos y conexiones ortogonales de hexágonos", () => {
    expect(H.neighbors(12, 5)).toHaveLength(6);
    const s = H.initial(5);
    [0, 5, 10, 15].forEach((i) => (s.board[i] = 1));
    expect(H.play(s, 20)?.winner).toBe(1);
    const n = H.initial(5);
    [10, 11, 12, 13].forEach((i) => (n.board[i] = 2));
    n.turn = 2;
    expect(H.play(n, 14)?.winner).toBe(2);
  });
  it("intercambia la propiedad sin mover la piedra, una única vez", () => {
    const s = H.play(H.initial(5), 12)!;
    const n = H.swap(s)!;
    expect(n.board).toEqual(s.board);
    expect(n.colors).toEqual([2, 1]);
    expect(n.turn).toBe(1);
    expect(H.swap(n)).toBeNull();
  });
  it("un tablero lleno de Hex siempre conecta alguno de los bordes", () => {
    const random = rng(42);
    for (let t = 0; t < 100; t++) {
      const board = Array.from({ length: 25 }, () => (random() < 0.5 ? 1 : 2));
      expect(H.connected(board, 5, 1) || H.connected(board, 5, 2)).toBe(true);
    }
  });
  it("permite cerrar dos cajas y conserva el turno", () => {
    const s = B.initial(2);
    const common = B.sides(0, 2).find((i) => B.sides(1, 2).includes(i))!;
    for (const i of new Set([...B.sides(0, 2), ...B.sides(1, 2)]))
      if (i !== common) s.edges[i] = 2;
    const n = B.play(s, common)!;
    expect(n.scores).toEqual([2, 0]);
    expect(n.turn).toBe(1);
  });
  it("una partida de cajas reparte todos los puntos", () => {
    let s = B.initial(4);
    while (!B.finished(s)) s = B.play(s, B.bestMove(s))!;
    expect(s.scores.reduce((n, v) => n + v, 0)).toBe(16);
  });
  it("añade un punto y no excede grados ni cruza celdas ocupadas", () => {
    let s = S.initial(3);
    const old = new Set<number>();
    let steps = 0;
    while (!s.winner && steps++ < 20) {
      const m = S.bestMove(s)!;
      expect(m).not.toBeNull();
      const path = S.route(s, ...m)!;
      expect(path.slice(1, -1).some((i) => old.has(i))).toBe(false);
      const n = S.play(s, ...m)!;
      expect(n.nodes.length).toBe(s.nodes.length + 1);
      expect(n.nodes.every((p) => p.degree <= 3)).toBe(true);
      path.forEach((i) => old.add(i));
      s = n;
    }
    expect(s.winner).toBeGreaterThan(0);
    expect(S.legalPairs(s)).toHaveLength(0);
  });
  it("un lazo consume dos grados y se prohíbe con dos ya usados", () => {
    const s = S.initial(2);
    expect(S.play(s, 0, 0)?.nodes[0].degree).toBe(2);
    s.nodes[0].degree = 2;
    expect(S.route(s, 0, 0)).toBeNull();
  });
});
describe("Backgammon", () => {
  const position = (pieces: Record<number, number>, turn = 1): BG.State => {
    const s = BG.initial();
    s.points = Array(24).fill(0);
    Object.entries(pieces).forEach(([i, v]) => (s.points[+i] = v));
    s.turn = turn;
    s.phase = "move";
    return s;
  };
  it("entra desde la barra antes de mover, y respeta bloqueos", () => {
    const s = position({ 23: -2, 22: -1, 8: 1 });
    s.bar = [1, 0];
    s.dice = [1, 2];
    expect(BG.legalMoves(s)).toEqual([{ from: -1, to: 22, die: 2 }]);
    const n = BG.play(s, BG.legalMoves(s)[0])!;
    expect(n.bar).toEqual([0, 1]);
  });
  it("elige el mayor si no se pueden jugar ambos", () => {
    const s = position({ 0: 1 });
    s.off = [14, 0];
    s.dice = [1, 2];
    expect(BG.legalMoves(s)).toEqual([{ from: 0, to: 24, die: 2 }]);
  });
  it("rechaza retirada con fichas fuera de casa y exceso desde una ficha no más alejada", () => {
    const s = position({ 0: 1, 5: 1, 9: 1 });
    s.dice = [6];
    expect(BG.singleMoves(s, 6).some((m) => m.to === 24)).toBe(false);
    s.points[9] = 0;
    expect(BG.singleMoves(s, 6)).toEqual([{ from: 5, to: 24, die: 6 }]);
  });
  it("no permite elegir un movimiento que desaprovecha el segundo dado", () => {
    const s = position({ 5: 1, 0: -2 });
    s.dice = [1, 2];
    const paths = BG.turns(s);
    expect(paths.every((p) => p.length === 2)).toBe(true);
  });
  it("un doble ofrece cuatro movimientos y conserva quince fichas por lado", () => {
    let s = BG.initial();
    s.phase = "roll";
    const n = BG.roll(s, () => 0.2)!;
    expect(n.dice).toEqual([2, 2, 2, 2]);
    expect(BG.turns(n).every((p) => p.length === 4)).toBe(true);
  });
  it("gammon y backgammon multiplican el cubo correctamente", () => {
    for (const bar of [0, 1]) {
      const s = position({ 0: 1, 18: -15 + bar });
      s.bar = [0, bar];
      s.off = [14, 0];
      s.dice = [1];
      s.cube = 2;
      const n = BG.play(s, { from: 0, to: 24, die: 1 })!;
      expect(n.award).toBe(bar ? 6 : 4);
    }
  });
  it("aceptar entrega el cubo al rival y rechazar pierde el valor anterior", () => {
    const s = BG.initial();
    s.phase = "roll";
    const offered = BG.offerDouble(s)!;
    expect(BG.acceptDouble(offered, true)?.owner).toBe(2);
    expect(BG.acceptDouble(offered, true)?.cube).toBe(2);
    expect(BG.acceptDouble(offered, false)?.award).toBe(1);
  });
  it("dos motores juegan una carrera completa sin perder fichas", () => {
    const random = rng(31);
    let s = BG.initial(),
      steps = 0;
    while (s.phase !== "over" && steps++ < 1000) {
      if (s.phase === "roll" || s.phase === "opening") s = BG.roll(s, random)!;
      else {
        const m = BG.bestMove(s);
        expect(m).not.toBeNull();
        s = BG.play(s, m!)!;
      }
      expect(
        s.points.reduce((n, v) => n + Math.max(0, v), 0) + s.bar[0] + s.off[0],
      ).toBe(15);
      expect(
        s.points.reduce((n, v) => n + Math.max(0, -v), 0) + s.bar[1] + s.off[1],
      ).toBe(15);
    }
    expect(s.phase).toBe("over");
  }, 20000);
});
describe("Palabras y definiciones", () => {
  it("conserva Ñ y normaliza tildes, sin palabras duplicadas", () => {
    expect(normalizeWord("niño y árbol")).toBe("NIÑO Y ARBOL");
    expect(new Set(vocabulary.map((w) => w.word)).size).toBe(vocabulary.length);
    expect(fiveLetterWords.length).toBeGreaterThan(20);
  });
  it("usa sílabas completas y distingue diptongos e hiatos", () => {
    const cases: Record<string, string[]> = {
      MIEDO: ["MIE", "DO"],
      RUEDA: ["RUE", "DA"],
      LEER: ["LE", "ER"],
      CANOA: ["CA", "NO", "A"],
      ABRIGO: ["A", "BRI", "GO"],
      COLLAR: ["CO", "LLAR"],
      POEMA: ["PO", "E", "MA"],
      PEZ: ["PEZ"],
      FLOR: ["FLOR"],
      RIO: ["RI", "O"],
    };
    for (const [word, syllables] of Object.entries(cases))
      expect(vocabulary.find((w) => w.word === word)?.syllables, word).toEqual(
        syllables,
      );
  });
  it("distribuye correctamente pistas cuando se repiten letras", () => {
    expect(W.feedback("GATOS", "CASAS")).toEqual([
      "absent",
      "correct",
      "absent",
      "absent",
      "correct",
    ]);
    expect(W.feedback("CARTA", "TACAR")).toEqual([
      "present",
      "correct",
      "present",
      "present",
      "present",
    ]);
  });
  it("el deductor de palabras resuelve un secreto sin recibirlo como entrada", () => {
    for (const secret of fiveLetterWords.slice(0, 12)) {
      const history: W.Row[] = [];
      for (let i = 0; i < 6; i++) {
        const word = W.choose(history)!;
        expect(word).not.toBeNull();
        history.push({ word, feedback: W.feedback(secret, word) });
        if (word === secret) break;
      }
      expect(history.at(-1)?.word).toBe(secret);
    }
  });
  it("ahorcado revela todas las copias y no consume letras repetidas", () => {
    const s: A.State = {
      word: "CASA",
      category: "Objetos",
      guessed: [],
      limit: 6,
    };
    const n = A.guess(s, "A")!;
    expect(A.misses(n)).toBe(0);
    expect(A.guess(n, "A")).toBeNull();
    expect(A.choose(["", "A", "", "A"], ["A"], "Objetos")).not.toBeNull();
  });
  it("encadena sílabas, rechaza repeticiones y la variante de última letra", () => {
    let s = E.initial();
    for (const w of ["GATO", "TOMATE", "TELA", "LANA"]) s = E.play(s, w)!;
    expect(s.words).toHaveLength(4);
    expect(E.required(s)).toBe("NA");
    expect(E.play(s, "ARBOL")).toBeNull();
    expect(E.play(s, "GATO")).toBeNull();
  });
  it("Basta puntúa respuestas únicas y repetidas y termina cinco rondas", () => {
    let s = BT.initial(2, () => 0);
    for (let round = 1; round <= 5; round++) {
      const values = BT.categories.map((c) => BT.choose(c, s.letter, () => 0));
      expect(
        values.every((w, i) => BT.valid(w, BT.categories[i], s.letter)),
      ).toBe(true);
      s = BT.submit(s, values)!;
      s = BT.submit(s, values)!;
      if (round < 5) s = BT.nextRound(s, () => 0)!;
    }
    expect(s.phase).toBe("over");
    expect(s.scores).toEqual([100, 100]);
  });
  it("Diccionario oculta autores al mezclar y acredita un engaño elegido", () => {
    let s = D.initial(2, () => 0);
    s = D.bluff(s, "Una definición inventada por el primero.", () => 0)!;
    s = D.bluff(s, "Una definición inventada por el segundo.", () => 0)!;
    const p0 = s.choices.findIndex((c) => c.owners.includes(0)),
      truth = s.choices.findIndex((c) => c.true);
    expect(D.vote(s, p0)).toBeNull();
    s = D.vote(s, truth)!;
    s = D.vote(s, p0)!;
    expect(s.scores).toEqual([3, 0]);
    expect(s.phase).toBe("result");
  });
});
describe("CruzaPalabras", () => {
  const initial = () => {
    const s = CW.initial(rng(10));
    s.racks = ["CARTASO".split(""), "MARTESO".split("")];
    return s;
  };
  it("obliga a cruzar el centro, a una línea y a palabras admitidas", () => {
    const s = initial();
    expect(
      CW.play(s, [
        { i: 0, letter: "C" },
        { i: 1, letter: "A" },
        { i: 2, letter: "R" },
        { i: 3, letter: "T" },
        { i: 4, letter: "A" },
      ]),
    ).toBeNull();
    expect(
      CW.play(s, [
        { i: 40, letter: "C" },
        { i: 41, letter: "A" },
        { i: 49, letter: "R" },
      ]),
    ).toBeNull();
    expect(
      CW.play(s, [
        { i: 38, letter: "C" },
        { i: 39, letter: "A" },
        { i: 40, letter: "R" },
        { i: 41, letter: "T" },
        { i: 42, letter: "A" },
      ]),
    ).not.toBeNull();
  });
  it("no multiplica de nuevo letras antiguas y rechaza cruces fuera del léxico", () => {
    const s = initial();
    s.board[40] = "A";
    expect(CW.validate(s, [{ i: 39, letter: "L" }])).toBeNull();
    s.racks[0] = ["L"];
    expect(CW.validate(s, [{ i: 39, letter: "L" }])?.score).toBe(2);
  });
  it("la IA propone una palabra legal y cuatro pases terminan", () => {
    let s = initial();
    const ps = CW.bestMove(s);
    expect(ps).not.toBeNull();
    expect(CW.play(s, ps!)).not.toBeNull();
    for (let i = 0; i < 4; i++) s = CW.pass(s)!;
    expect(s.over).toBe(true);
  });
});
describe("Colonizadores", () => {
  it("construye una isla coherente con 54 vértices y 72 aristas", () => {
    const s = C.initial(3, rng(3));
    expect(s.map.hexes).toHaveLength(19);
    expect(s.map.vertices).toHaveLength(54);
    expect(s.map.edges).toHaveLength(72);
    expect(s.map.hexes.filter((h) => h.resource === -1)).toHaveLength(1);
  });
  it("prepara poblados en serpiente y respeta la distancia", () => {
    let s = C.initial(3, rng(8));
    const seen: number[] = [];
    while (s.phase === "settlement" || s.phase === "road") {
      if (s.phase === "settlement") {
        seen.push(s.turn);
        const v = C.settlements(s)[0];
        s = C.build(s, "settlement", v)!;
        expect(
          C.settlements({ ...s, phase: "settlement" }).every(
            (i) =>
              !s.map.vertices[v].edges.some((e) => s.map.edges[e].includes(i)),
          ),
        ).toBe(true);
      } else s = C.build(s, "road", C.roads(s)[0])!;
    }
    expect(seen).toEqual([0, 1, 2, 2, 1, 0]);
    expect(s.phase).toBe("roll");
    expect(s.turn).toBe(0);
  });
  it("comerciar no crea recursos y no admite intercambiar el mismo tipo", () => {
    const s = C.initial();
    s.phase = "build";
    s.hands[0] = [4, 0, 0, 0, 0];
    s.bank[0] -= 4;
    const n = C.trade(s, 0, 3)!;
    expect(n.hands[0]).toEqual([0, 0, 0, 1, 0]);
    expect(C.trade(s, 0, 0)).toBeNull();
    for (let r = 0; r < 5; r++)
      expect(n.bank[r] + n.hands.reduce((v, h) => v + h[r], 0)).toBe(19);
  });
  it("rechaza un descarte incompleto y produce exactamente el total exigido", () => {
    const s = C.initial();
    s.phase = "discard";
    s.discarders = [0];
    s.hands[0] = [8, 1, 1, 0, 0];
    expect(C.discard(s, [1, 0, 0, 0, 0])).toBeNull();
    const n = C.discard(s, [5, 0, 0, 0, 0])!;
    expect(n.phase).toBe("robber");
    expect(n.hands[0].reduce((n, v) => n + v, 0)).toBe(5);
  });
  it("la ruta más larga no suma ramas ni atraviesa poblados rivales", () => {
    const s = C.initial();
    s.map = {
      hexes: [],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [2, 5],
      ],
      vertices: Array.from({ length: 6 }, (_, i) => ({
        x: i,
        y: 0,
        hexes: [],
        edges: [],
      })),
    };
    s.map.edges.forEach((ends, e) =>
      ends.forEach((v) => s.map.vertices[v].edges.push(e)),
    );
    s.roads = [0, 0, 0, 0, 0];
    s.owners = Array(6).fill(-1);
    expect(C.longestRoad(s, 0)).toBe(4);
    s.owners[2] = 1;
    expect(C.longestRoad(s, 0)).toBe(2);
    s.owners[2] = 0;
    expect(C.longestRoad(s, 0)).toBe(4);
  });
  it("una partida automática progresa a victoria y conserva todos los recursos", () => {
    const random = rng(37);
    let s = C.initial(3, random);
    let steps = 0;
    while (s.phase !== "over" && steps++ < 5000) {
      const before = JSON.stringify(s);
      s = C.aiAction(s, random);
      expect(JSON.stringify(s)).not.toBe(before);
      for (let r = 0; r < 5; r++) {
        expect(s.bank[r] + s.hands.reduce((n, h) => n + h[r], 0)).toBe(19);
        expect(s.bank[r]).toBeGreaterThanOrEqual(0);
      }
      expect(s.hands.flat().every((n) => n >= 0)).toBe(true);
    }
    expect(s.phase).toBe("over");
    expect(C.points(s, s.winner)).toBeGreaterThanOrEqual(s.target);
  }, 30000);
});
describe("Motores de observación y ayudas", () => {
  it("las IA antiguas eligen para el jugador que realmente mueve", () => {
    const x: T.Board = ["X", "X", null, "O", "O", null, null, null, null];
    expect(T.bestMove(x, "X")).toBe(2);
    expect(T.bestMove(x, "O")).toBe(5);
    for (const p of [1, 2] as const) {
      const b = F.emptyGrid();
      b[5] = [p, p, p, 0, 0, 0, 0];
      expect(F.bestMove(b, 2, p)).toBe(3);
      const r = R.initial();
      const move = R.bestMove(r, 2, p)!;
      expect(R.moves(r, p)).toContainEqual(move);
      const c = CH.initial();
      expect(CH.moves(c, p)).toContainEqual(CH.bestMove(c, 2, p));
    }
  });
  it("el solucionador calcula Sudoku a partir de pistas sin solución almacenada", () => {
    const puzzle = generate(40),
      result = solve(puzzle.givens)!;
    expect(complete(result)).toBe(true);
    expect(result).toEqual(puzzle.solution);
  });
  it("todos los juegos disponibles tienen explicación específica estructurada", () => {
    for (const game of games.filter((g) => g.ready)) {
      expect(guides[game.id], game.id).toBeDefined();
      expect(guides[game.id].length).toBeGreaterThanOrEqual(4);
      expect(
        guides[game.id]
          .map(([, text]) => text)
          .join(" ")
          .split(/\s+/).length,
        game.id,
      ).toBeGreaterThan(100);
    }
  });
});
