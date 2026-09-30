export type ThemeMode = "day" | "afternoon" | "night" | "auto";
export type SunLocation = { latitude: number; longitude: number };
export function solarHours(
  date: Date,
  location?: SunLocation,
): [number, number] {
  const day =
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
    86400000;
  const declination =
    (23.44 * Math.sin((2 * Math.PI * (day - 80)) / 365.25) * Math.PI) / 180;
  // Without location, use a seasonal local-clock estimate; no location permission is requested automatically.
  if (!location) {
    const shift = 1.8 * Math.sin((2 * Math.PI * (day - 80)) / 365.25);
    return [6 - shift, 18 + shift];
  }
  const latitude =
    (Math.max(-89.9, Math.min(89.9, location.latitude)) * Math.PI) / 180;
  const cosine =
    (Math.sin((-0.833 * Math.PI) / 180) -
      Math.sin(latitude) * Math.sin(declination)) /
    (Math.cos(latitude) * Math.cos(declination));
  if (cosine < -1) return [0, 24];
  if (cosine > 1) return [12, 12];
  const halfDay = (Math.acos(cosine) * 12) / Math.PI;
  const b = (2 * Math.PI * (day - 81)) / 364;
  const equation =
    9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const noon =
    12 -
    location.longitude / 15 -
    date.getTimezoneOffset() / 60 -
    equation / 60;
  return [noon - halfDay, noon + halfDay];
}
export function automaticTheme(
  date: Date,
  location?: SunLocation,
): Exclude<ThemeMode, "auto"> {
  const [rise, set] = solarHours(date, location),
    hour = date.getHours() + date.getMinutes() / 60;
  if (rise === set) return "night";
  if (rise === 0 && set === 24) return "day";
  if (hour < rise - 0.5 || hour >= set + 0.75) return "night";
  if (hour < rise + 0.5 || hour >= set - 1.5) return "afternoon";
  return "day";
}
