// met.no Locationforecast 2.0 (compact) provider adapter.
// Builds the same WeatherData shape as the Open-Meteo pipeline, so the
// weather route can fall back seamlessly when Open-Meteo is unavailable.

import type { DailyPoint, HourlyPoint, WeatherData } from '@/lib/weather';
import { sunTimesForDate } from '@/lib/sun';

const METNO_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const USER_AGENT = 'BDMausam/1.0 (weather app for Bangladesh)';

interface MetNoTimeSeriesEntry {
  time: string;
  data: {
    instant: {
      details: {
        air_pressure_at_sea_level?: number;
        air_temperature?: number;
        cloud_area_fraction?: number;
        relative_humidity?: number;
        wind_from_direction?: number;
        wind_speed?: number;
      };
    };
    next_1_hours?: MetNoWindow;
    next_6_hours?: MetNoWindow;
    next_12_hours?: MetNoWindow;
  };
}

interface MetNoWindow {
  summary?: { symbol_code?: string };
  details?: { precipitation_amount?: number };
}

/** Convert a UTC ISO timestamp to an Asia/Dhaka local "YYYY-MM-DDTHH:mm" string. */
function dhakaLocalIso(utcIso: string): string {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = f.formatToParts(new Date(utcIso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`;
}

/** Rough is-day determination from the Dhaka hour (approximation is fine). */
function isDayFromHour(iso: string): boolean {
  const h = parseInt(iso.slice(11, 13), 10);
  return h >= 6 && h < 18;
}

/** met.no symbol code -> WMO weather code used across the app. */
export function symbolToWmo(symbol: string | undefined): number {
  if (!symbol) return 3;
  let s = symbol.replace(/_(day|night|polartwilight)$/, '');
  const heavy = s.startsWith('heavy');
  const light = s.startsWith('light');
  s = s.replace(/^(light|heavy)_/, '');

  switch (s) {
    case 'clearsky':
      return 0;
    case 'fair':
      return 1;
    case 'partlycloudy':
      return 2;
    case 'cloudy':
      return 3;
    case 'fog':
      return 45;
    case 'sleet':
      return 66;
    case 'sleetshowers':
      return 80;
    case 'snow':
      return heavy ? 75 : light ? 71 : 73;
    case 'snowshowers':
      return heavy ? 86 : 85;
    case 'rain':
      return heavy ? 65 : light ? 61 : 63;
    case 'rainshowers':
      return heavy ? 82 : light ? 80 : 81;
    case 'rainandthunder':
    case 'rainshowersandthunder':
      return heavy ? 99 : 95;
    case 'snowandthunder':
    case 'snowshowersandthunder':
    case 'sleetandthunder':
    case 'sleetshowersandthunder':
      return 96;
    default:
      return 3;
  }
}

/** Estimated precipitation probability from a WMO code (met.no compact has none). */
function estimatePrecipProb(wmo: number): number {
  if (wmo === 0 || wmo === 1) return 5;
  if (wmo === 2) return 15;
  if (wmo === 3) return 10;
  if (wmo === 45 || wmo === 48) return 5;
  if (wmo >= 51 && wmo <= 57) return 30;
  if (wmo === 61 || wmo === 80) return 60;
  if (wmo === 63 || wmo === 81) return 70;
  if (wmo === 65 || wmo === 82) return 85;
  if (wmo >= 95) return 85;
  if (wmo >= 71 && wmo <= 86) return 50;
  return 20;
}

/** Simplified apparent temperature (heat index for warm/humid, wind chill for cold). */
function apparentTemp(tC: number, rh: number, windMs: number): number {
  if (tC >= 26) {
    const tF = (tC * 9) / 5 + 32;
    let hiF =
      -42.379 +
      2.04901523 * tF +
      10.14333127 * rh -
      0.22475541 * tF * rh -
      0.00683783 * tF * tF -
      0.05481717 * rh * rh +
      0.00122874 * tF * tF * rh +
      0.00085282 * tF * rh * rh -
      0.00000199 * tF * tF * rh * rh;
    if (rh < 13 && tF >= 80 && tF <= 112) {
      hiF -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tF - 95)) / 17);
    } else if (rh > 85 && tF >= 80 && tF <= 87) {
      hiF += ((rh - 85) / 10) * ((87 - tF) / 5);
    }
    return Math.round(((hiF - 32) * 5) / 9 * 10) / 10;
  }
  if (tC <= 10 && windMs > 1.34) {
    const v = Math.pow(windMs * 3.6, 1.5);
    return Math.round((13.12 + 0.6215 * tC - 11.37 * v + 0.3965 * tC * v) * 10) / 10;
  }
  return tC;
}

export async function fetchMetNoWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const res = await fetch(`${METNO_URL}?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`, {
    headers: { 'User-Agent': USER_AGENT, accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`met.no responded ${res.status}`);

  const j = await res.json();
  const series: MetNoTimeSeriesEntry[] = j?.properties?.timeseries ?? [];
  if (series.length === 0) throw new Error('met.no returned an empty series');

  const nowIso = dhakaLocalIso(new Date().toISOString());
  const nowKey = nowIso.slice(0, 13);

  // Entries in Dhaka-local time, ordered, starting from "now".
  const entries = series
    .map((e) => ({ local: dhakaLocalIso(e.time), raw: e }))
    .filter((e) => e.local >= nowIso);

  const usable = entries.length > 0 ? entries : series.map((e) => ({ local: dhakaLocalIso(e.time), raw: e }));

  const wmoOf = (e: (typeof usable)[number]) =>
    symbolToWmo(e.raw.data.next_1_hours?.summary?.symbol_code ??
      e.raw.data.next_6_hours?.summary?.symbol_code ??
      e.raw.data.next_12_hours?.summary?.symbol_code);

  // ---------- current ----------
  const cur = usable[0];
  const curD = cur.raw.data.instant.details;
  const curWmo = wmoOf(cur);
  const curSymbol =
    cur.raw.data.next_1_hours?.summary?.symbol_code ??
    cur.raw.data.next_6_hours?.summary?.symbol_code ??
    '';
  const curIsDay = curSymbol.endsWith('_day')
    ? true
    : curSymbol.endsWith('_night')
      ? false
      : isDayFromHour(cur.local);

  const current = {
    time: cur.local,
    temp: curD.air_temperature ?? 0,
    feelsLike: apparentTemp(
      curD.air_temperature ?? 0,
      curD.relative_humidity ?? 70,
      curD.wind_speed ?? 0
    ),
    humidity: curD.relative_humidity ?? 0,
    code: curWmo,
    isDay: curIsDay,
    windSpeed: (curD.wind_speed ?? 0) * 3.6,
    windDir: curD.wind_from_direction ?? 0,
    pressure: curD.air_pressure_at_sea_level ?? 0,
    cloudCover: curD.cloud_area_fraction ?? 0,
    precipitation:
      cur.raw.data.next_1_hours?.details?.precipitation_amount ?? 0,
    uvIndex: null,
  };

  // ---------- hourly (next 24 steps) ----------
  const hourly: HourlyPoint[] = usable.slice(0, 24).map((e) => {
    const wmo = wmoOf(e);
    const sym =
      e.raw.data.next_1_hours?.summary?.symbol_code ??
      e.raw.data.next_6_hours?.summary?.symbol_code ??
      '';
    const day = sym.endsWith('_day')
      ? true
      : sym.endsWith('_night')
        ? false
        : isDayFromHour(e.local);
    return {
      time: e.local,
      temp: e.raw.data.instant.details.air_temperature ?? 0,
      code: wmo,
      precipProb: estimatePrecipProb(wmo),
      isDay: day,
    };
  });

  // ---------- daily (aggregate by Dhaka-local date) ----------
  const byDate = new Map<string, (typeof usable)>();
  for (const e of usable) {
    const date = e.local.slice(0, 10);
    const arr = byDate.get(date) ?? [];
    arr.push(e);
    byDate.set(date, arr);
  }

  const daily: DailyPoint[] = [...byDate.entries()].slice(0, 7).map(([date, list]) => {
    const temps = list
      .map((e) => e.raw.data.instant.details.air_temperature ?? NaN)
      .filter((t) => Number.isFinite(t));
    const winds = list
      .map((e) => (e.raw.data.instant.details.wind_speed ?? 0) * 3.6);

    // Prefer 1h precipitation windows; fall back to 6h windows (no overlap).
    let precipSum = 0;
    for (const e of list) {
      const p1 = e.raw.data.next_1_hours?.details?.precipitation_amount;
      const p6 = e.raw.data.next_6_hours?.details?.precipitation_amount;
      precipSum += p1 ?? p6 ?? 0;
    }

    const wmos = list.map(wmoOf);
    const worst = wmos.reduce((a, b) => {
      const rank = (c: number) =>
        c === 0 ? 0 : c <= 2 ? 1 : c === 3 ? 2 : c === 45 || c === 48 ? 2 : c >= 95 ? 6 : c >= 61 ? 4 : c >= 51 ? 3 : 1;
      return rank(b) > rank(a) ? b : a;
    }, 0);

    const sun = sunTimesForDate(date, lat, lon);

    return {
      date,
      code: worst,
      max: temps.length ? Math.max(...temps) : 0,
      min: temps.length ? Math.min(...temps) : 0,
      precipSum: Math.round(precipSum * 10) / 10,
      precipProb: Math.max(...wmos.map(estimatePrecipProb)),
      windMax: winds.length ? Math.max(...winds) : 0,
      uvMax: 0,
      sunrise: sun.sunrise,
      sunset: sun.sunset,
    };
  });

  return {
    current,
    hourly,
    daily,
    updatedAt: new Date().toISOString(),
  };
}
