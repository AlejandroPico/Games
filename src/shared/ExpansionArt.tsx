import { useId } from "react";
export { expansionIds } from "./expansion-ids";
export default function ExpansionArt({ id }: { id: string }) {
  const uid = useId().replaceAll(":", "");
  const wood = uid + "wood",
    stone = uid + "stone",
    ivory = uid + "ivory",
    shadow = uid + "shadow";
  const words = [
    "el-ahorcado",
    "cruzapalabras",
    "adivina-la-palabra",
    "palabras-encadenadas",
    "basta-tutti-frutti",
    "el-diccionario",
  ].includes(id);
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <defs>
        <linearGradient id={wood}>
          <stop stopColor="#d4ae79" />
          <stop offset=".5" stopColor="#f0d7aa" />
          <stop offset="1" stopColor="#ad8555" />
        </linearGradient>
        <radialGradient id={stone} cx="30%" cy="25%">
          <stop stopColor="#73817e" />
          <stop offset=".5" stopColor="#253735" />
          <stop offset="1" stopColor="#101f20" />
        </radialGradient>
        <radialGradient id={ivory} cx="30%" cy="25%">
          <stop stopColor="#fffef8" />
          <stop offset=".6" stopColor="#eee5d5" />
          <stop offset="1" stopColor="#b2a087" />
        </radialGradient>
        <filter id={shadow} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="3" dy="7" stdDeviation="4" floodOpacity=".22" />
        </filter>
      </defs>
      {words ? (
        <g filter={"url(#" + shadow + ")"}>
          {id === "el-ahorcado" ? (
            <>
              <path
                d="M90 230H170M118 230V65H210V97"
                stroke="#745b45"
                strokeWidth="6"
                fill="none"
              />
              <circle cx="210" cy="121" r="23" fill={"url(#" + ivory + ")"} />
              <path
                d="M210 145v49m0-36-32 22m32-22 32 22m-32 14-24 31m24-31 24 31"
                stroke="#566c6c"
                strokeWidth="4"
              />
              <g>
                {["J", "U", "E", "G", "O"].map((c, i) => (
                  <g key={i}>
                    <rect
                      x={65 + i * 55}
                      y="244"
                      width="45"
                      height="39"
                      fill={"url(#" + wood + ")"}
                    />
                    <text
                      x={87 + i * 55}
                      y="273"
                      textAnchor="middle"
                      fontSize="27"
                      fill="#34483f"
                    >
                      {c}
                    </text>
                  </g>
                ))}
              </g>
            </>
          ) : id === "basta-tutti-frutti" ? (
            <>
              <rect x="78" y="42" width="244" height="216" fill="#f5eee0" />
              {["A", "NOMBRE", "ANIMAL", "PAÍS", "COLOR"].map((w, i) => (
                <g key={i}>
                  <text
                    x="97"
                    y={78 + i * 36}
                    fill="#53626a"
                    fontSize={i ? 15 : 27}
                    fontWeight={i ? 400 : 700}
                  >
                    {w}
                  </text>
                  <path d={"M95 " + (88 + i * 36) + "H305"} stroke="#b8c4c8" />
                </g>
              ))}
              <path d="M290 105l-20 138 7-13 18-119Z" fill="#a65d4e" />
            </>
          ) : id === "el-diccionario" ? (
            <>
              <path
                d="M64 73Q135 58 200 86Q267 58 336 73V239Q268 226 200 247Q135 226 64 239Z"
                fill="#f3e9d6"
                stroke="#ad9170"
                strokeWidth="4"
              />
              <path d="M200 86V247" stroke="#c8b28f" />
              {Array.from({ length: 8 }, (_, i) => (
                <g key={i}>
                  <path
                    d={
                      "M85 " +
                      (104 + i * 15) +
                      "H180M219 " +
                      (104 + i * 15) +
                      "H313"
                    }
                    stroke="#a7a292"
                    strokeWidth="2"
                  />
                </g>
              ))}
              <text
                x="89"
                y="98"
                fontFamily="Georgia"
                fontSize="28"
                fill="#526a5c"
              >
                Aa
              </text>
              <text x="224" y="95" fontSize="24" fill="#ba6e5b">
                ?
              </text>
            </>
          ) : (
            <g>
              {Array.from({ length: 25 }, (_, i) => {
                const text =
                  id === "palabras-encadenadas"
                    ? [
                        "G",
                        "A",
                        "T",
                        "O",
                        "",
                        "",
                        "",
                        "",
                        "M",
                        "",
                        "",
                        "",
                        "T",
                        "A",
                        "",
                        "",
                        "",
                        "E",
                        "T",
                        "",
                        "",
                        "L",
                        "A",
                        "E",
                        "",
                      ][i]
                    : id === "adivina-la-palabra"
                      ? "CLAVEPLATOPIEDRAJUEGOSOL"[i] || ""
                      : "JUGARLETRASPISTASCLAVEJUEG"[i] || "";
                return (
                  <g key={i}>
                    <rect
                      x={91 + (i % 5) * 44}
                      y={36 + Math.floor(i / 5) * 44}
                      width="39"
                      height="39"
                      fill={
                        id === "adivina-la-palabra"
                          ? Math.floor(i / 5) === 4
                            ? "#638574"
                            : i % 4 === 0
                              ? "#baa365"
                              : "#cbd0c4"
                          : "url(#" + wood + ")"
                      }
                    />
                    <text
                      x={110 + (i % 5) * 44}
                      y={63 + Math.floor(i / 5) * 44}
                      textAnchor="middle"
                      fill="#344a3e"
                      fontSize="23"
                      fontWeight="500"
                    >
                      {text}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </g>
      ) : id === "hex" ? (
        <g filter={"url(#" + shadow + ")"}>
          {Array.from({ length: 49 }, (_, i) => {
            const r = Math.floor(i / 7),
              c = i % 7,
              x = 55 + c * 32 + r * 16,
              y = 48 + r * 28;
            return (
              <polygon
                key={i}
                points={[
                  [0, -18],
                  [16, -9],
                  [16, 9],
                  [0, 18],
                  [-16, 9],
                  [-16, -9],
                ]
                  .map(([a, b]) => [x + a, y + b].join(","))
                  .join(" ")}
                fill={
                  r === 3 || i === 17
                    ? "#ba675a"
                    : c === 4
                      ? "#528c9a"
                      : "#d8d2bd"
                }
                stroke="#f2e7d0"
                strokeWidth="2"
              />
            );
          })}
        </g>
      ) : id === "colonizadores" ? (
        <g filter={"url(#" + shadow + ")"}>
          {Array.from({ length: 19 }, (_, i) => {
            const coords = [
                [-2, 0],
                [-2, 1],
                [-2, 2],
                [-1, -1],
                [-1, 0],
                [-1, 1],
                [-1, 2],
                [0, -2],
                [0, -1],
                [0, 0],
                [0, 1],
                [0, 2],
                [1, -2],
                [1, -1],
                [1, 0],
                [1, 1],
                [2, -2],
                [2, -1],
                [2, 0],
              ][i],
              x = 200 + Math.sqrt(3) * (coords[0] + coords[1] / 2) * 33,
              y = 150 + coords[1] * 49.5;
            return (
              <g key={i}>
                <polygon
                  points={Array.from({ length: 6 }, (_, k) =>
                    [
                      x + 33 * Math.cos(((30 + 60 * k) * Math.PI) / 180),
                      y + 33 * Math.sin(((30 + 60 * k) * Math.PI) / 180),
                    ].join(","),
                  ).join(" ")}
                  fill={
                    ["#739878", "#bb8a68", "#a7ad75", "#cdb375", "#899993"][
                      i % 5
                    ]
                  }
                  stroke="#f1deb7"
                  strokeWidth="2"
                />
                <circle cx={x} cy={y} r="10" fill="#f2e4c6" />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6e5140"
                >
                  {[5, 8, 3, 10, 6, 4, 9][i % 7]}
                </text>
              </g>
            );
          })}
          <path d="M145 123l-8 8v12h16v-12Z" fill="#b95149" stroke="#f0dcc0" />
          <path d="M202 203l-8 8v12h16v-12Z" fill="#46879e" stroke="#f0dcc0" />
        </g>
      ) : id === "backgammon" ? (
        <g filter={"url(#" + shadow + ")"}>
          <rect
            x="52"
            y="45"
            width="296"
            height="214"
            fill={"url(#" + wood + ")"}
            stroke="#916d44"
            strokeWidth="10"
          />
          {Array.from({ length: 24 }, (_, i) => {
            const x = 60 + (i % 12) * 23.5,
              y = i < 12 ? 52 : 252;
            return (
              <path
                key={i}
                d={"M" + x + " " + y + "h23l-11.5 " + (i < 12 ? 84 : -84) + "Z"}
                fill={i % 2 ? "#9b7651" : "#ecddbf"}
              />
            );
          })}
          {Array.from({ length: 20 }, (_, i) => (
            <circle
              key={i}
              cx={i < 10 ? 75 + (i % 5) * 23.5 : 230 + (i % 5) * 23.5}
              cy={
                i < 10
                  ? 70 + Math.floor(i / 5) * 23
                  : 232 - Math.floor((i - 10) / 5) * 23
              }
              r="10"
              fill={"url(#" + (i < 10 ? stone : ivory) + ")"}
            />
          ))}
          <rect x="166" y="137" width="28" height="28" fill="#f6eddb" />
          <rect x="205" y="145" width="28" height="28" fill="#f6eddb" />
          {[
            [172, 143],
            [187, 158],
            [211, 151],
            [226, 166],
            [218, 158],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill="#405b53" />
          ))}
        </g>
      ) : id === "sprouts-brotes" ? (
        <g filter={"url(#" + shadow + ")"}>
          <path
            d="M80 190Q40 30 195 105Q295 17 326 174Q239 278 195 105Q103 256 80 190M80 190Q132 149 149 164"
            stroke="#678a79"
            strokeWidth="4"
            fill="none"
          />
          {[
            [80, 190],
            [195, 105],
            [326, 174],
            [210, 46],
            [270, 244],
            [94, 70],
            [149, 164],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="12"
              fill={"url(#" + ivory + ")"}
              stroke="#577265"
            />
          ))}
        </g>
      ) : id === "cajas-timbiriche-dots-and-boxes" ? (
        <g>
          {Array.from({ length: 25 }, (_, i) => (
            <circle
              key={i}
              cx={96 + (i % 5) * 52}
              cy={46 + Math.floor(i / 5) * 52}
              r="4"
              fill="#516662"
            />
          ))}
          <path
            d="M96 46H304V150H148V202H252V254H96V46M148 46V150M200 98H304M96 150H148M148 202V254"
            stroke="#ae6c5f"
            strokeWidth="6"
            fill="none"
          />
          <rect x="151" y="101" width="46" height="46" fill="#d4aaa020" />
          <text
            x="174"
            y="136"
            fill="#af6d5f"
            fontSize="26"
            textAnchor="middle"
          >
            1
          </text>
        </g>
      ) : (
        <g filter={"url(#" + shadow + ")"}>
          <rect
            x="74"
            y="25"
            width="252"
            height="252"
            fill={"url(#" + wood + ")"}
            stroke="#a3845d"
          />
          {Array.from({ length: 11 }, (_, i) => (
            <path
              key={i}
              d={
                "M86 " + (37 + i * 22.8) + "H314M" + (86 + i * 22.8) + " 37V265"
              }
              stroke="#9a815f"
            />
          ))}
          {[
            [4, 4],
            [5, 5],
            [6, 6],
            [3, 3],
            [7, 7],
            [3, 4],
            [4, 5],
            [6, 5],
            [7, 6],
            [5, 3],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={86 + x * 22.8}
              cy={37 + y * 22.8}
              r="10"
              fill={"url(#" + (i < 5 ? stone : ivory) + ")"}
            />
          ))}
          {id === "conecta-5-pente" && (
            <>
              <circle cx="345" cy="237" r="10" fill={"url(#" + stone + ")"} />
              <circle cx="360" cy="253" r="10" fill={"url(#" + stone + ")"} />
            </>
          )}
        </g>
      )}
    </svg>
  );
}
