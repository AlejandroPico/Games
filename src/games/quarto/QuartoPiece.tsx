export default function QuartoPiece({ piece }: { piece: number }) {
  const dark = !!(piece & 1),
    square = !!(piece & 2),
    tall = !!(piece & 4),
    hollow = !!(piece & 8),
    y = tall ? 20 : 45,
    color = dark ? "#52746b" : "#d8be8c",
    shade = dark ? "#2e514b" : "#ae8d5b";
  return (
    <svg viewBox="0 0 80 100" aria-hidden="true">
      {square ? (
        <>
          <path d={"M17 " + y + "h46v55H17Z"} fill={shade} />
          <path d={"M17 " + y + "l10-9h46l-10 9Z"} fill={color} />
          <path
            d={"M63 " + y + "l10-9v55l-10 9Z"}
            fill={dark ? "#254740" : "#987648"}
          />
          <path d={"M17 " + y + "h46v55H17Z"} fill={color} opacity=".65" />
        </>
      ) : (
        <>
          <path d={"M17 " + y + "v45c0 16 46 16 46 0V" + y} fill={shade} />
          <ellipse cx="40" cy={y + 45} rx="23" ry="10" fill={shade} />
          <ellipse cx="40" cy={y} rx="23" ry="10" fill={color} />
          <path
            d={"M21 " + (y + 2) + "v40"}
            stroke={color}
            strokeWidth="5"
            opacity=".45"
          />
        </>
      )}
      {hollow &&
        (square ? (
          <rect x="29" y={y - 5} width="23" height="6" fill="#182e2c" />
        ) : (
          <ellipse cx="40" cy={y} rx="12" ry="5" fill="#182e2c" />
        ))}
    </svg>
  );
}
