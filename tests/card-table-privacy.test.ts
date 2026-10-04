import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CardTable, { type CardEngine } from "../src/shared/CardTable";
import type { DeductionPosition } from "../src/shared/DeductionTable";

const session = vi.hoisted(() => ({ watching: false, ai: true }));
vi.mock("../src/shared/Observation", () => ({
  useObservation: () => ({ watching: session.watching }),
}));
vi.mock("../src/shared/GameLayout", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("../src/shared/useMatch", () => ({
  useMatch: () => ({
    state: { turn: 1, winner: null, scores: [0, 0], step: 1, message: "Turno" },
    started: true,
    mode: "ai",
    players: 2,
    room: { online: false },
    start: vi.fn(),
    reset: vi.fn(),
    setMode: vi.fn(),
    setPlayers: vi.fn(),
    setState: vi.fn(),
  }),
  useMatchAI: () => session.ai,
  PlayerSelect: () => null,
  ScoreStrip: () => null,
}));
const position: DeductionPosition = {
  turn: 1,
  winner: null,
  scores: [0, 0],
  step: 1,
  message: "Turno",
};
const engine: CardEngine<typeof position> = {
  initial: () => position,
  actions: () => [{ key: "play", label: "Jugar el rey privado" }],
  apply: (s) => s,
  automatic: (s) => s,
  view: () => ({
    hand: [{ key: "secret", rank: "K", suit: "♥", label: "Rey privado" }],
    table: [{ key: "public", rank: "A", suit: "♣", label: "As público" }],
    summary: "Mesa pública",
    notes: ["Detalle privado"],
  }),
};
const render = () =>
  renderToStaticMarkup(
    createElement(CardTable, {
      id: "durak",
      engine,
      choices: [2],
      workerFactory: () => {
        throw new Error("No worker during SSR");
      },
    }),
  );
beforeEach(() => {
  session.watching = false;
  session.ai = true;
});
describe("Card table private information", () => {
  it("hides AI faces and action labels from a human, while retaining public cards", () => {
    const html = render();
    expect(html).not.toContain("Rey privado");
    expect(html).not.toContain("Jugar el rey privado");
    expect(html).toContain("Carta oculta de la IA");
    expect(html).toContain("As público");
  });
  it("reveals the active hand for explicit Solo IA observation", () => {
    session.watching = true;
    expect(render()).toContain("Rey privado");
  });
  it("shows a human their own playable hand", () => {
    session.ai = false;
    const html = render();
    expect(html).toContain("Rey privado");
    expect(html).toContain("Jugar el rey privado");
  });
});
