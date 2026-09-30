export function boardFieldOfView(aspect: number, decorative = false) {
  const base = ((decorative ? 40 : 44) * Math.PI) / 180;
  return (
    (2 *
      Math.atan(Math.tan(base / 2) / Math.max(0.05, Math.min(1, aspect))) *
      180) /
    Math.PI
  );
}
