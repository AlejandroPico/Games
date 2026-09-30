const dots = [
  [],
  [4],
  [0, 8],
  [0, 4, 8],
  [0, 2, 6, 8],
  [0, 2, 4, 6, 8],
  [0, 2, 3, 5, 6, 8],
];
export default function Die({ value }: { value: number }) {
  return (
    <svg viewBox="0 0 90 90" aria-hidden="true">
      <path d="M6 6h72l6 7v71H13l-7-6Z" fill="#a99e87" />
      <rect
        x="3"
        y="3"
        width="74"
        height="74"
        fill="#f6edd7"
        stroke="#cabea3"
        strokeWidth="2"
      />
      {dots[value]?.map((p) => (
        <circle
          key={p}
          cx={19 + (p % 3) * 20}
          cy={19 + Math.floor(p / 3) * 20}
          r="5"
          fill="#465e5b"
        />
      ))}
    </svg>
  );
}
