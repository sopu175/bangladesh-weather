'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getCondition,
  formatDayLabel,
  formatHourLabel,
  type WeatherData,
} from '@/lib/weather';
import type { AppLocation } from './use-weather-app';

interface InsightResponse {
  insight: string;
  source: 'ai' | 'local';
}

interface InsightPayload {
  location: { name: string; bnName: string; division: string };
  current: { temp: number; feelsLike: number; humidity: number; condition: string; windSpeed: number };
  next12: { hour: string; temp: number; condition: string; precipProb: number }[];
  days: { day: string; min: number; max: number; condition: string; precipProb: number; precipSum: number }[];
}

// Module-level caches shared across renders (and re-mounts). Keyed by
// `${districtId}:${hour}` so each location gets one briefing per hour.
const insightCache = new Map<string, InsightResponse>();
const inFlight = new Set<string>();
const MAX_CACHE = 50;

/** Deterministic fallback briefing used if the AI endpoint is unreachable. */
function localFallback(location: AppLocation, weather: WeatherData): string {
  const peak = Math.max(...weather.hourly.slice(0, 12).map((h) => h.precipProb), 0);
  const today = weather.daily[0];
  const tomorrow = weather.daily[1];
  const rainy = weather.hourly.slice(0, 12).find((h) => h.precipProb >= 50);
  const parts: string[] = [];

  if (rainy && peak >= 50) {
    parts.push(
      `${getCondition(weather.current.code).label} right now in ${location.name}, with around ${peak}% chance of rain — most likely around ${formatHourLabel(rainy.time)}.`
    );
  } else {
    parts.push(
      `${getCondition(weather.current.code).label} in ${location.name} with highs near ${Math.round(today?.max ?? weather.current.temp)}°C; only a ${peak}% chance of rain over the next 12 hours.`
    );
  }
  if (tomorrow) {
    parts.push(
      `${formatDayLabel(tomorrow.date, 1)} looks ${getCondition(tomorrow.code).label.toLowerCase()} with temperatures between ${Math.round(tomorrow.min)}° and ${Math.round(tomorrow.max)}°C.`
    );
  }
  parts.push(
    peak >= 70
      ? 'Carry an umbrella before heading out.'
      : 'Stay hydrated — Bangladesh humidity adds to the heat.'
  );
  return parts.slice(0, 3).join(' ');
}

function buildPayload(
  location: AppLocation,
  weather: WeatherData
): InsightPayload {
  return {
    location: {
      name: location.name,
      bnName: location.bnName,
      division: location.division,
    },
    current: {
      temp: Math.round(weather.current.temp),
      feelsLike: Math.round(weather.current.feelsLike),
      humidity: Math.round(weather.current.humidity),
      condition: getCondition(weather.current.code).label,
      windSpeed: Math.round(weather.current.windSpeed),
    },
    next12: weather.hourly.slice(0, 12).map((h) => ({
      hour: formatHourLabel(h.time),
      temp: Math.round(h.temp),
      condition: getCondition(h.code).label,
      precipProb: h.precipProb,
    })),
    days: weather.daily.slice(0, 3).map((d, i) => ({
      day: formatDayLabel(d.date, i),
      min: Math.round(d.min),
      max: Math.round(d.max),
      condition: getCondition(d.code).label,
      precipProb: d.precipProb,
      precipSum: Math.round(d.precipSum),
    })),
  };
}

export function useAiInsight(
  location: AppLocation | null,
  weather: WeatherData | null
) {
  // `tick` bumps whenever a background fetch finishes so derived values re-read.
  const [tick, setTick] = useState(0);

  const key = useMemo(
    () =>
      location && weather
        ? `${location.id}:${weather.current.time.slice(0, 13)}`
        : null,
    [location, weather]
  );

  useEffect(() => {
    if (!key || !location || !weather) return;
    if (insightCache.has(key) || inFlight.has(key)) return;

    inFlight.add(key);
    const payload = buildPayload(location, weather);

    fetch('/api/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('insight failed');
        const data = (await res.json()) as InsightResponse;
        insightCache.set(key, { insight: data.insight, source: data.source });
      })
      .catch(() => {
        insightCache.set(key, {
          insight: localFallback(location, weather),
          source: 'local',
        });
      })
      .finally(() => {
        inFlight.delete(key);
        if (insightCache.size > MAX_CACHE) {
          const oldest = insightCache.keys().next().value;
          if (oldest) insightCache.delete(oldest);
        }
        setTick((t) => t + 1);
      });
  }, [key, location, weather]);

  // Derived per-render read; `tick` is included to satisfy exhaustive-deps
  // semantics (the cache read becomes fresh once a fetch resolves).
  void tick;
  const entry = key ? insightCache.get(key) : undefined;

  return {
    insight: entry?.insight ?? null,
    loading: !!key && inFlight.has(key),
    source: entry?.source ?? null,
  };
}
