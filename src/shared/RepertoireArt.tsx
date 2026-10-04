import { useId } from "react";
export const repertoireIds = [
  "damas-chinas",
  "chaturanga",
  "patolli",
  "rutas-de-vapor",
  "draft-de-maravillas",
  "reserva-de-naturaleza",
  "construccion-de-castillos",
  "escoba",
  "cinquillo",
  "belote",
  "futbol-de-mesa-con-cartas",
  "buscaminas-hexagonal",
  "torres-de-hanoi",
  "sopa-de-letras-dinamica",
  "inu",
  "mensajes-cruzados",
  "santorini",
];
export default function RepertoireArt({ id }: { id: string }) {
  const uid = useId().replaceAll(":", ""),
    wood = uid + "wood",
    ivory = uid + "ivory",
    shadow = uid + "shadow",
    marble = uid + "marble";
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      <defs>
        <linearGradient id={wood} x2=".3" y2="1">
          <stop stopColor="#d8b982" />
          <stop offset=".5" stopColor="#edcf9a" />
          <stop offset="1" stopColor="#a88253" />
        </linearGradient>
        <linearGradient id={ivory} x2=".2" y2="1">
          <stop stopColor="#fff7e4" />
          <stop offset="1" stopColor="#b5ad99" />
        </linearGradient>
        <radialGradient id={marble} cx="30%" cy="22%">
          <stop stopColor="#e8f4f1" />
          <stop offset=".3" stopColor="#81b9a9" />
          <stop offset="1" stopColor="#214f52" />
        </radialGradient>
        <filter id={shadow} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="7"
            floodColor="#17262a"
            floodOpacity=".28"
          />
        </filter>
      </defs>
      {id === "damas-chinas" ? (
        <g filter={`url(#${shadow})`}>
          <path
            d="M200 25 241 96 325 96 283 168 325 240 242 240 200 285 158 240 75 240 117 168 75 96 159 96Z"
            fill={`url(#${wood})`}
          />
          {Array.from({ length: 49 }, (_, i) => {
            const r = Math.floor(i / 7),
              c = i % 7;
            return (
              <circle
                key={i}
                cx={125 + c * 25}
                cy={86 + r * 25}
                r="8"
                fill={(r + c) % 5 === 0 ? `url(#${marble})` : "#957847"}
                stroke="#dcc497"
              />
            );
          })}
        </g>
      ) : id === "chaturanga" ? (
        <g filter={`url(#${shadow})`}>
          <rect x="75" y="52" width="250" height="210" fill={`url(#${wood})`} />
          {Array.from({ length: 64 }, (_, i) => (
            <rect
              key={i}
              x={85 + (i % 8) * 29}
              y={60 + Math.floor(i / 8) * 23}
              width="29"
              height="23"
              fill={((i % 8) + Math.floor(i / 8)) % 2 ? "#80684d" : "#dec6a0"}
            />
          ))}
          {["♜", "♞", "♝", "♛", "♚"].map((p, i) => (
            <text
              key={i}
              x={112 + i * 41}
              y={177 - (i % 2) * 24}
              fill={`url(#${ivory})`}
              fontSize="63"
              textAnchor="middle"
            >
              {p}
            </text>
          ))}
        </g>
      ) : id === "patolli" ? (
        <g filter={`url(#${shadow})`}>
          <path
            d="M167 30h66v87h87v66h-87v87h-66v-87H80v-66h87Z"
            fill={`url(#${wood})`}
            stroke="#85694a"
            strokeWidth="3"
          />
          {[0, 1, 2, 3].flatMap((a) =>
            Array.from({ length: 9 }, (_, i) => (
              <circle
                key={a + "," + i}
                cx={a < 2 ? 180 + a * 40 : 96 + i * 26}
                cy={a < 2 ? 46 + i * 26 : 132 + (a - 2) * 40}
                r="6"
                fill={i === 3 ? "#5c9ba2" : "#83663f"}
              />
            )),
          )}
          <ellipse cx="285" cy="245" rx="13" ry="8" fill="#4c3430" />
          <ellipse cx="308" cy="261" rx="13" ry="8" fill="#6c4030" />
        </g>
      ) : id === "rutas-de-vapor" ? (
        <g>
          <rect
            x="45"
            y="35"
            width="310"
            height="235"
            fill={`url(#${wood})`}
            filter={`url(#${shadow})`}
          />
          <path
            d="M80 95 167 67 290 101 316 211 174 234 90 194 80 95M167 67 174 234M80 95 316 211M290 101 90 194"
            fill="none"
            stroke="#6a7d75"
            strokeWidth="6"
            strokeDasharray="13 5"
          />
          {[
            [80, 95],
            [167, 67],
            [290, 101],
            [316, 211],
            [174, 234],
            [90, 194],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="10"
              fill="#f0e3c5"
              stroke="#8a6751"
              strokeWidth="3"
            />
          ))}
          <path d="M145 145h100v28H145Z" fill="#3f6778" />
          <circle cx="162" cy="177" r="12" fill="#3c3e3c" />
          <circle cx="225" cy="177" r="12" fill="#3c3e3c" />
          <path d="M164 145v-30h43v30m22 0v-48h13v48" fill="#53675d" />
        </g>
      ) : id === "reserva-de-naturaleza" ? (
        <g filter={`url(#${shadow})`}>
          <rect x="50" y="58" width="300" height="195" fill="#679175" />
          {Array.from({ length: 16 }, (_, i) => (
            <rect
              key={i}
              x={68 + (i % 4) * 66}
              y={72 + Math.floor(i / 4) * 41}
              width="60"
              height="36"
              fill={
                i % 3 === 0 ? "#a7bd83" : i % 3 === 1 ? "#6c927f" : "#729db4"
              }
            />
          ))}
          {[
            [100, 140],
            [210, 106],
            [266, 216],
          ].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x} ${y}l-17 28h34Z`} fill="#294c42" />
              <path d={`M${x} ${y - 17}l-14 27h28Z`} fill="#3f6853" />
            </g>
          ))}
          <text x="215" y="199" fontSize="62">
            🦌
          </text>
        </g>
      ) : id === "draft-de-maravillas" ||
        id === "construccion-de-castillos" ||
        id === "santorini" ? (
        <g filter={`url(#${shadow})`}>
          <ellipse
            cx="200"
            cy="245"
            rx="145"
            ry="23"
            fill={id === "santorini" ? "#4d9aab" : "#829177"}
          />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect
                x={72 + i * 65}
                y={131 - (i % 2) * 47}
                width="56"
                height={102 + (i % 2) * 47}
                fill={`url(#${ivory})`}
              />
              <rect
                x={81 + i * 65}
                y={108 - (i % 2) * 47}
                width="38"
                height="26"
                fill="#ebdec5"
              />
              <path
                d={`M${81 + i * 65} ${110 - (i % 2) * 47}q19-40 38 0Z`}
                fill={id === "santorini" ? "#4d79ad" : "#80685c"}
              />
              <rect
                x={92 + i * 65}
                y={171 - (i % 2) * 35}
                width="15"
                height="24"
                fill="#607278"
              />
            </g>
          ))}
        </g>
      ) : ["escoba", "cinquillo", "belote"].includes(id) ? (
        <g filter={`url(#${shadow})`}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect
                x={60 + i * 67}
                y={56 + (i % 2) * 24}
                width="78"
                height="152"
                fill={`url(#${ivory})`}
                stroke="#a99b84"
              />
              <text
                x={70 + i * 67}
                y={81 + (i % 2) * 24}
                fontSize="19"
                fill={i % 2 ? "#b2695b" : "#394e54"}
              >
                {id === "cinquillo"
                  ? i + 4
                  : id === "escoba"
                    ? [7, 5, 1, 2][i]
                    : ["J", "9", "A", "K"][i]}
              </text>
              <text
                x={100 + i * 67}
                y={153 + (i % 2) * 24}
                fontSize="52"
                textAnchor="middle"
                fill={i % 2 ? "#b2695b" : "#b99a53"}
              >
                {id === "belote"
                  ? ["♠", "♥", "♦", "♣"][i]
                  : ["◉", "♜", "⚔", "♣"][i]}
              </text>
            </g>
          ))}
        </g>
      ) : id === "futbol-de-mesa-con-cartas" ? (
        <g filter={`url(#${shadow})`}>
          <rect x="50" y="50" width="300" height="210" fill="#557a61" />
          <rect
            x="65"
            y="66"
            width="270"
            height="178"
            fill="none"
            stroke="#d5dfc2"
            strokeWidth="2"
          />
          <path
            d="M200 66v178M65 107h40v96H65m270-96h-40v96h40"
            fill="none"
            stroke="#d5dfc2"
            strokeWidth="2"
          />
          <circle
            cx="200"
            cy="155"
            r="32"
            fill="none"
            stroke="#d5dfc2"
            strokeWidth="2"
          />
          <circle cx="217" cy="183" r="23" fill={`url(#${ivory})`} />
          <path d="M217 168l13 9-5 15h-16l-5-15Z" fill="#374c4b" />
        </g>
      ) : id === "torres-de-hanoi" ? (
        <g filter={`url(#${shadow})`}>
          <rect x="47" y="231" width="306" height="15" fill={`url(#${wood})`} />
          {[98, 200, 302].map((x, i) => (
            <rect
              key={i}
              x={x - 5}
              y="61"
              width="10"
              height="170"
              fill={`url(#${wood})`}
            />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={60 + i * 7}
              y={210 - i * 23}
              width={128 - i * 14}
              height="20"
              fill={
                [
                  "#497a83",
                  "#73a18c",
                  "#aabd82",
                  "#d8b373",
                  "#bf846a",
                  "#8c80ad",
                ][i]
              }
              stroke="#456169"
            />
          ))}
        </g>
      ) : id === "buscaminas-hexagonal" ? (
        <g filter={`url(#${shadow})`}>
          {Array.from({ length: 30 }, (_, i) => {
            const r = Math.floor(i / 6),
              c = i % 6,
              x = 65 + c * 43 + (r % 2) * 21,
              y = 65 + r * 38;
            return (
              <g key={i}>
                <path
                  d={`M${x} ${y - 23}l21 12v22l-21 12-21-12v-22Z`}
                  fill={i % 4 === 0 ? "#b6c7bd" : "#698c86"}
                  stroke="#dae0cc"
                  strokeWidth="2"
                />
                {i % 4 === 0 && (
                  <text
                    x={x}
                    y={y + 10}
                    fontSize="25"
                    fill="#476765"
                    textAnchor="middle"
                  >
                    {(i % 3) + 1}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      ) : id === "sopa-de-letras-dinamica" ? (
        <g filter={`url(#${shadow})`}>
          <rect
            x="68"
            y="38"
            width="264"
            height="224"
            fill={`url(#${ivory})`}
          />
          {Array.from({ length: 42 }, (_, i) => (
            <g key={i}>
              {i >= 14 && i < 20 && (
                <rect
                  x={79 + (i % 7) * 35}
                  y={50 + Math.floor(i / 7) * 32}
                  width="34"
                  height="32"
                  fill="#7ba493"
                />
              )}
              <text
                x={96 + (i % 7) * 35}
                y={73 + Math.floor(i / 7) * 32}
                textAnchor="middle"
                fontSize="21"
                fill="#3e5b5a"
              >
                {i >= 14 && i < 20
                  ? "BOSQUE"[i - 14]
                  : "LETRASDINAMICAS"[i % 14]}
              </text>
            </g>
          ))}
        </g>
      ) : id === "inu" ? (
        <g filter={`url(#${shadow})`}>
          <rect x="78" y="46" width="244" height="220" fill={`url(#${wood})`} />
          {Array.from({ length: 25 }, (_, i) => (
            <rect
              key={i}
              x={90 + (i % 5) * 45}
              y={58 + Math.floor(i / 5) * 39}
              width="39"
              height="33"
              fill={i % 3 ? "#7a9488" : "#ddc69d"}
            />
          ))}
          <circle
            cx="202"
            cy="152"
            r="35"
            fill="none"
            stroke="#384e58"
            strokeWidth="9"
          />
          <path d="M228 178l51 49" stroke="#384e58" strokeWidth="14" />
        </g>
      ) : (
        <g filter={`url(#${shadow})`}>
          <rect
            x="57"
            y="62"
            width="286"
            height="184"
            fill={`url(#${ivory})`}
          />
          <path
            d="M57 62l143 117L343 62M57 246l97-85m189 85-97-85"
            fill="none"
            stroke="#a89e8b"
            strokeWidth="3"
          />
          <rect x="138" y="36" width="123" height="97" fill="#658f90" />
          <text
            x="200"
            y="100"
            fontSize="34"
            fill="#f2e4c7"
            textAnchor="middle"
          >
            2 · 4 · 1
          </text>
        </g>
      )}
    </svg>
  );
}
