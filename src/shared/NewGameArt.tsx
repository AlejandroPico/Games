import QuartoPiece from "../games/quarto/QuartoPiece";
import Die from "./Die";
import MahjongFace from "../games/mahjong/MahjongFace";
import { SpanishSuit } from "./CardFace";
export const newGameIds = [
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
];
export default function NewGameArt({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      {id === "damas-internacionales" ? (
        <g>
          {Array.from({ length: 100 }, (_, i) => (
            <g key={i}>
              <rect
                x={85 + (i % 10) * 23}
                y={35 + Math.floor(i / 10) * 23}
                width="23"
                height="23"
                fill={
                  (Math.floor(i / 10) + (i % 10)) % 2 ? "#6d8574" : "#e7e4cf"
                }
              />
              {(Math.floor(i / 10) + (i % 10)) % 2 && (i < 30 || i >= 70) && (
                <>
                  <circle
                    cx={96.5 + (i % 10) * 23}
                    cy={46.5 + Math.floor(i / 10) * 23}
                    r="8"
                    fill={i < 30 ? "#334e49" : "#f6ebd6"}
                    stroke={i < 30 ? "#203c36" : "#baa681"}
                  />
                  <circle
                    cx={96.5 + (i % 10) * 23}
                    cy={46.5 + Math.floor(i / 10) * 23}
                    r="5"
                    fill="none"
                    stroke={i < 30 ? "#658078" : "#d6c9ad"}
                  />
                </>
              )}
            </g>
          ))}
        </g>
      ) : id.startsWith("shogi") || id.startsWith("xiangqi") ? (
        <g>
          <rect
            x="93"
            y="28"
            width="214"
            height="244"
            fill="#d9b67f"
            stroke="#a28555"
          />
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <path
                d={
                  "M" +
                  (105 + i * 24) +
                  " 40v220M105 " +
                  (40 + i * 27.5) +
                  "h190"
                }
                stroke="#84663d"
                strokeWidth="1"
              />
            </g>
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 54, 56, 58, 60, 62].map((v, i) => {
            const x = 105 + (v % 9) * 24,
              y = 52 + Math.floor(v / 9) * 27;
            return (
              <g key={v}>
                {id.startsWith("shogi") ? (
                  <path
                    d={"M" + (x - 9) + " " + (y + 10) + "v-17l9-5 9 5v17Z"}
                    fill="#f3d69e"
                    stroke="#987441"
                  />
                ) : (
                  <circle
                    cx={x}
                    cy={y}
                    r="11"
                    fill="#f1d7a4"
                    stroke="#aa7c47"
                  />
                )}
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fill={i < 9 ? "#304e43" : "#a4503f"}
                  fontSize="13"
                >
                  {id.startsWith("shogi")
                    ? [
                        "香",
                        "桂",
                        "銀",
                        "金",
                        "玉",
                        "金",
                        "銀",
                        "桂",
                        "香",
                        "歩",
                      ][i % 10]
                    : [
                        "車",
                        "馬",
                        "象",
                        "士",
                        "將",
                        "士",
                        "象",
                        "馬",
                        "車",
                        "兵",
                      ][i % 10]}
                </text>
              </g>
            );
          })}
        </g>
      ) : id === "mahjong-solitario" ? (
        <g>
          {Array.from({ length: 16 }, (_, i) => (
            <g
              key={i}
              transform={
                "translate(" +
                (86 + (i % 4) * 57) +
                " " +
                (42 + Math.floor(i / 4) * 54) +
                ")"
              }
            >
              <rect x="3" y="4" width="50" height="60" fill="#799a87" />
              <rect width="50" height="60" fill="#f3efda" stroke="#c0b693" />
              <svg width="50" height="60">
                <MahjongFace face={[0, 4, 9, 14, 18, 22, 27, 31][i % 8]} />
              </svg>
            </g>
          ))}
        </g>
      ) : id === "yahtzee-la-generala" ? (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <svg
              key={i}
              x={78 + (i % 3) * 85}
              y={65 + Math.floor(i / 3) * 93}
              width="78"
              height="78"
            >
              <Die value={[5, 3, 6, 2, 4][i]} />
            </svg>
          ))}
        </g>
      ) : id === "mastermind" ? (
        <g>
          <rect
            x="115"
            y="35"
            width="170"
            height="230"
            fill="#d9c8ac"
            stroke="#a9977a"
          />
          {Array.from({ length: 20 }, (_, i) => (
            <circle
              key={i}
              cx={138 + (i % 4) * 28}
              cy={63 + Math.floor(i / 4) * 42}
              r="10"
              fill={
                [
                  "#ac655b",
                  "#6385a2",
                  "#6c8b79",
                  "#c39b55",
                  "#9880ab",
                  "#e8ddc7",
                ][i % 6]
              }
            />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i}>
              <circle cx="256" cy={60 + i * 42} r="3" fill="#40554b" />
              <circle cx="265" cy={69 + i * 42} r="3" fill="#eee6d4" />
            </g>
          ))}
        </g>
      ) : id === "quarto" ? (
        <g>
          <rect
            x="81"
            y="41"
            width="238"
            height="224"
            fill="#ceb184"
            stroke="#a1855c"
          />
          {[0, 4, 5, 7, 8, 10, 13, 14].map((v, i) => (
            <svg
              key={v}
              x={91 + (v % 4) * 55}
              y={38 + Math.floor(v / 4) * 53}
              width="46"
              height="61"
            >
              <QuartoPiece piece={[0, 2, 4, 7, 8, 10, 13, 15][i]} />
            </svg>
          ))}
        </g>
      ) : (
        <g>
          {(id === "solitario-spider"
            ? Array.from({ length: 8 }, (_, i) => i)
            : id === "solitario-carta-blanca-freecell"
              ? Array.from({ length: 8 }, (_, i) => i)
              : [0, 1, 2, 3]
          ).map((v, i) => {
            const spider = id === "solitario-spider",
              free = id === "solitario-carta-blanca-freecell",
              spanish = id === "mus" || id === "brisca",
              x = spider || free ? 78 + (i % 4) * 62 : 76 + i * 61,
              y = spider || free ? 48 + Math.floor(i / 4) * 102 : 74;
            return (
              <g key={v} transform={"translate(" + x + " " + y + ")"}>
                <rect
                  x="2"
                  y="3"
                  width="58"
                  height="88"
                  fill="#849889"
                  opacity=".3"
                />
                <rect width="58" height="88" fill="#f7f0dc" stroke="#c6baa0" />
                <text x="8" y="18" fontSize="14" fill="#3f6153">
                  {spider
                    ? ["K", "Q", "J", "10"][i % 4]
                    : free
                      ? ["A", "2", "3", "4"][i % 4]
                      : id === "blackjack-21"
                        ? ["A", "K", "7", "4"][i]
                        : ["R", "3", "A", "C"][i]}
                </text>
                {spanish ? (
                  <svg x="10" y="22" width="39" height="57">
                    <SpanishSuit suit={i % 4} />
                  </svg>
                ) : (
                  <text
                    x="29"
                    y="60"
                    textAnchor="middle"
                    fontSize="28"
                    fill={i % 2 && !spider ? "#b06353" : "#3f6153"}
                  >
                    {spider ? "♠" : ["♠", "♥", "♦", "♣"][i % 4]}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
