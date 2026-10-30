import { NextRequest, NextResponse } from 'next/server';
import { isInsideBangladesh } from '@/lib/bd-districts';
import { fetchMetNoWeather } from '@/lib/metno';
import type { DailyPoint, HourlyPoint, WeatherData } from '@/lib/weather';

export const runtime = 'nodejs';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// ------------------------- response cache -------------------------
// 5-minute in-memory cache per rounded coordinate. Keeps provider load low
// (met.no explicitly requires client-side caching) and smooths bursts.
const CACHE_TTL_MS = 5 * 60 * 1000;
const weatherCache = new Map<string, { data: WeatherData; ts: number }>();

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

// ------------------------- Open-Meteo -------------------------
async function fetchOpenMeteo(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index',
    hourly: 'temperature_2m,weather_code,precipitation_probability,is_day',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max',
    timezone: 'Asia/Dhaka',
    forecast_days: '7',
  });

  const res = await fetch(`${FORECAST_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(8_000),
    headers: { accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`open-meteo responded ${res.status}`);

  const j = await res.json();
  if (j?.error) throw new Error(j?.reason ?? 'open-meteo error');

  const c = j.current ?? {};
  const current = {
    time: c.time ?? new Date().toISOString(),
    temp: c.temperature_2m ?? 0,
    feelsLike: c.apparent_temperature ?? c.temperature_2m ?? 0,
    humidity: c.relative_humidity_2m ?? 0,
    code: c.weather_code ?? 0,
    isDay: c.is_day === 1,
    windSpeed: c.wind_speed_10m ?? 0,
    windDir: c.wind_direction_10m ?? 0,
    pressure: c.pressure_msl ?? 0,
    cloudCover: c.cloud_cover ?? 0,
    precipitation: c.precipitation ?? 0,
    uvIndex: c.uv_index ?? j.daily?.uv_index_max?.[0] ?? null,
  };

  // Slice the next 24 hours starting from the current hour.
  const nowKey = String(current.time).slice(0, 13); // e.g. "2025-06-05T14"
  const times: string[] = j.hourly?.time ?? [];
  let idx = times.findIndex((t) => t.slice(0, 13) >= nowKey);
  if (idx < 0) idx = 0;

  const hourly: HourlyPoint[] = times.slice(idx, idx + 24).map((t, i) => {
    const k = idx + i;
    return {
      time: t,
      temp: j.hourly.temperature_2m[k] ?? 0,
      code: j.hourly.weather_code[k] ?? 0,
      precipProb: j.hourly.precipitation_probability?.[k] ?? 0,
      isDay: j.hourly.is_day?.[k] === 1,
    };
  });

  const daily: DailyPoint[] = (j.daily?.time ?? []).map((date: string, i: number) => ({
    date,
    code: j.daily.weather_code[i] ?? 0,
    max: j.daily.temperature_2m_max[i] ?? 0,
    min: j.daily.temperature_2m_min[i] ?? 0,
    precipSum: j.daily.precipitation_sum?.[i] ?? 0,
    precipProb: j.daily.precipitation_probability_max?.[i] ?? 0,
    windMax: j.daily.wind_speed_10m_max?.[i] ?? 0,
    uvMax: j.daily.uv_index_max?.[i] ?? 0,
    sunrise: j.daily.sunrise?.[i] ?? `${date}T06:00`,
    sunset: j.daily.sunset?.[i] ?? `${date}T18:00`,
  }));

  return { current, hourly, daily, updatedAt: new Date().toISOString() };
}

// ------------------------- handler -------------------------
export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get('lat') ?? '');
  const lon = parseFloat(request.nextUrl.searchParams.get('lon') ?? '');

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: 'Valid "lat" and "lon" query params are required.' },
      { status: 400 }
    );
  }

  // This app only serves Bangladesh.
  if (!isInsideBangladesh(lat, lon)) {
    return NextResponse.json(
      {
        error: 'OUTSIDE_BANGLADESH',
        message: 'This service only provides weather for locations inside Bangladesh.',
      },
      { status: 403 }
    );
  }

  const key = cacheKey(lat, lon);
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, { headers: { 'Cache-Control': 'no-store' } });
  }

  // Provider chain: Open-Meteo first (richest data), met.no as fallback.
  let data: WeatherData | null = null;
  try {
    data = await fetchOpenMeteo(lat, lon);
  } catch {
    try {
      data = await fetchMetNoWeather(lat, lon);
    } catch {
      data = null;
    }
  }

  if (!data) {
    return NextResponse.json(
      { error: 'UPSTREAM_ERROR', message: 'Weather providers are temporarily unavailable. Please retry.' },
      { status: 502 }
    );
  }

  weatherCache.set(key, { data, ts: Date.now() });
  if (weatherCache.size > 100) {
    const oldest = weatherCache.keys().next().value;
    if (oldest) weatherCache.delete(oldest);
  }

  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
