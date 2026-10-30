// Sunrise / sunset calculation (NOAA-based, derived from the widely used
// SunCalc algorithm). Returns times as "HH:mm" strings in Asia/Dhaka.

const rad = Math.PI / 180;
const dayMs = 86_400_000;
const J1970 = 2440588;
const J2000 = 2451545;

function toJulian(date: Date): number {
  return date.valueOf() / dayMs - 0.5 + J1970;
}

function fromJulian(j: number): Date {
  return new Date((j + 0.5 - J1970) * dayMs);
}

function toDays(date: Date): number {
  return toJulian(date) - J2000;
}

const solarMeanAnomaly = (d: number) => rad * (357.5291 + 0.98560028 * d);

function eclipticLongitude(M: number): number {
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const P = rad * 102.9372;
  return M + C + P + Math.PI;
}

function declination(l: number): number {
  const e = rad * 23.4397;
  return Math.asin(Math.sin(e) * Math.sin(l));
}

function julianCycle(d: number, lw: number): number {
  return Math.round(d - 0.0009 - lw / (2 * Math.PI));
}

function approxTransit(Ht: number, lw: number, n: number): number {
  return 0.0009 + (Ht + lw) / (2 * Math.PI) + n;
}

function solarTransitJ(ds: number, M: number, L: number): number {
  return J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
}

function hourAngle(h: number, phi: number, d: number): number {
  return Math.acos(
    Math.min(1, Math.max(-1, (Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d))))
  );
}

function getSetJ(h: number, lw: number, phi: number, dec: number, n: number, M: number, L: number): number {
  const w = hourAngle(h, phi, dec);
  const a = approxTransit(w, lw, n);
  return solarTransitJ(a, M, L);
}

function dhakaClock(date: Date): string {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = f.formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  const h = get('hour') === '24' ? '00' : get('hour');
  return `${h}:${get('minute')}`;
}

/**
 * Sunrise & sunset for a calendar day (Dhaka local), returned as "HH:mm" in
 * Asia/Dhaka time. Falls back to null values for polar edge cases (never
 * happens inside Bangladesh, but keeps types honest).
 */
export function sunTimesForDate(
  isoDate: string,
  lat: number,
  lon: number
): { sunrise: string; sunset: string } {
  const date = new Date(`${isoDate}T12:00:00Z`);
  const lw = rad * -lon;
  const phi = rad * lat;
  const d = toDays(date);

  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);
  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L);
  const Jnoon = solarTransitJ(ds, M, L);

  const h0 = -0.833 * rad; // solar disk + refraction
  const Jset = getSetJ(h0, lw, phi, dec, n, M, L);
  const Jrise = Jnoon - (Jset - Jnoon);

  return {
    sunrise: dhakaClock(fromJulian(Jrise)),
    sunset: dhakaClock(fromJulian(Jset)),
  };
}
