// Original vector artwork for the disabled collection; no game or third-party assets are loaded.
export default function RoadmapArt({
  id,
  category,
}: {
  id: string;
  category: string;
}) {
  const seed = [...id].reduce((n, c) => n + c.charCodeAt(0), 0),
    colors = ["#6e8f86", "#bc8e66", "#7f96ad", "#a286ac"];
  const color = colors[seed % 4];
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true">
      {category === "Cartas" || category === "Roles ocultos" ? (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${90 + i * 65} ${55 + i * 10})`}>
              <rect
                width="95"
                height="145"
                fill="#faf6e9"
                stroke="#a9a598"
                strokeWidth="2"
              />
              <text x="13" y="26" fontSize="20" fill={color}>
                {["A", "K", "Q"][(i + seed) % 3]}
              </text>
              <text
                x="48"
                y="88"
                textAnchor="middle"
                fontSize="46"
                fill={color}
              >
                {["♠", "♥", "♦", "♣"][(seed + i) % 4]}
              </text>
            </g>
          ))}
        </g>
      ) : category === "Dados" ? (
        <g>
          {[0, 1, 2].map((i) => (
            <g
              key={i}
              transform={`translate(${68 + i * 88} ${93 + (i % 2) * 22})`}
            >
              <path d="M0 0l20-14h64L64 0z" fill="#e5dfd0" />
              <path d="M64 0l20-14v64L64 64z" fill="#a1a69b" />
              <rect width="64" height="64" fill="#f7f1e4" stroke="#b1afa6" />
              {Array.from({ length: ((seed + i) % 6) + 1 }, (_, p) => (
                <circle
                  key={p}
                  cx={17 + (p % 2) * 30}
                  cy={14 + Math.floor(p / 2) * 18}
                  r="4"
                  fill={color}
                />
              ))}
            </g>
          ))}
        </g>
      ) : category === "Palabras" ? (
        <g>
          {Array.from({ length: 25 }, (_, i) => (
            <g key={i}>
              <rect
                x={93 + (i % 5) * 43}
                y={43 + Math.floor(i / 5) * 43}
                width="40"
                height="40"
                fill={i % 7 === seed % 7 ? color : "#e8e0cc"}
                stroke="#b9b29d"
              />
              <text
                x={113 + (i % 5) * 43}
                y={70 + Math.floor(i / 5) * 43}
                textAnchor="middle"
                fontSize="20"
                fill="#4b514b"
              >
                {"PALABRASJUEGOMESACLAVEZ"[i % 23]}
              </text>
            </g>
          ))}
        </g>
      ) : category === "Eurogames" ? (
        <g>
          {Array.from({ length: 12 }, (_, i) => {
            const x = 115 + (i % 4) * 55,
              y = 88 + Math.floor(i / 4) * 55;
            return (
              <polygon
                key={i}
                points={`${x},${y - 29} ${x + 25},${y - 14} ${x + 25},${y + 14} ${x},${y + 29} ${x - 25},${y + 14} ${x - 25},${y - 14}`}
                fill={colors[(seed + i) % 4]}
                stroke="#eee6d4"
                strokeWidth="3"
              />
            );
          })}
        </g>
      ) : category === "Deducción" ? (
        <g>
          <rect
            x="78"
            y="70"
            width="244"
            height="158"
            fill="#e1dbca"
            stroke="#a5a294"
          />
          {Array.from({ length: 24 }, (_, i) => (
            <circle
              key={i}
              cx={108 + (i % 6) * 37}
              cy={94 + Math.floor(i / 6) * 36}
              r="10"
              fill={colors[(seed + i) % 4]}
            />
          ))}
          <path d="M240 200l46 46" stroke="#646e71" strokeWidth="9" />
          <circle
            cx="219"
            cy="181"
            r="37"
            fill="#fff5"
            stroke="#646e71"
            strokeWidth="7"
          />
        </g>
      ) : (
        <g>
          <rect
            x="82"
            y="42"
            width="236"
            height="218"
            fill="#d4bd90"
            stroke="#b3a27e"
            strokeWidth="3"
          />
          {Array.from({ length: 49 }, (_, i) => (
            <rect
              key={i}
              x={90 + (i % 7) * 31}
              y={50 + Math.floor(i / 7) * 29}
              width="30"
              height="28"
              fill={(i + Math.floor(i / 7)) % 2 ? "#e9debe" : color}
              opacity={category === "Lógica" ? 0.45 : 0.8}
            />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <circle
              key={i}
              cx={105 + ((seed + i * 2) % 7) * 31}
              cy={64 + ((seed + i * 3) % 7) * 29}
              r="10"
              fill={i % 2 ? "#efe9d6" : "#3d4649"}
              stroke="#fff5"
              strokeWidth="2"
            />
          ))}
        </g>
      )}
    </svg>
  );
}
