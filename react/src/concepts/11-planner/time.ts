/**
 * Small clock helpers for the night planner. Times are minutes since midnight
 * so arithmetic ("start minus 30") stays trivial.
 */

/** "9:05 PM" -> 1265. Returns 0 (never NaN) for anything unparseable. */
export function parseClock(text: string): number {
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i.exec(text.trim());
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2] ?? 0);
}

/** 1265 -> "9:05 PM". */
export function formatClock(minutes: number): string {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(total / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(total % 60).padStart(2, "0");
  return `${h12}:${mm} ${h24 >= 12 ? "PM" : "AM"}`;
}

/** Round to the nearest `step` minutes (used for the "sunset-ish" note). */
export const roundTo = (minutes: number, step: number) => Math.round(minutes / step) * step;

const RAD = Math.PI / 180;

/**
 * Approximate local sunset (minutes since midnight) for a YYYY-MM-DD date using
 * the standard sunrise equation. Defaults are the Crow River valley west of
 * Minneapolis in Central Daylight Time. Accurate to a few minutes, which is all
 * an "it will be dark by" hint needs.
 */
export function approxSunset(dateIso: string, lat = 45.09, lon = -93.69, utcOffsetHours = -5): number {
  const fallback = 18 * 60 + 30;
  const [y, mo, d] = dateIso.split("-").map(Number);
  if (!y || !mo || !d) return fallback;
  const jd = Date.UTC(y, mo - 1, d) / 86400000 + 2440587.5;
  const n = Math.ceil(jd - 2451545 + 0.0008);
  const jStar = n - lon / 360;
  const meanAnom = (((357.5291 + 0.98560028 * jStar) % 360) + 360) % 360;
  const center =
    1.9148 * Math.sin(meanAnom * RAD) + 0.02 * Math.sin(2 * meanAnom * RAD) + 0.0003 * Math.sin(3 * meanAnom * RAD);
  const eclLong = (((meanAnom + center + 180 + 102.9372) % 360) + 360) % 360;
  const jTransit = 2451545 + jStar + 0.0053 * Math.sin(meanAnom * RAD) - 0.0069 * Math.sin(2 * eclLong * RAD);
  const decl = Math.asin(Math.sin(eclLong * RAD) * Math.sin(23.4397 * RAD));
  const cosHour =
    (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * Math.sin(decl)) / (Math.cos(lat * RAD) * Math.cos(decl));
  const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHour))) / RAD;
  const jSet = jTransit + hourAngle / 360;
  const utcMinutes = (((jSet % 1) + 0.5) % 1) * 1440;
  const local = (utcMinutes + utcOffsetHours * 60 + 1440) % 1440;
  return Number.isFinite(local) ? local : fallback;
}
