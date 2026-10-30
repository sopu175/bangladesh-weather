'use client';

import { Loader2, MapPin, RefreshCw, Sunrise, Sunset, Thermometer, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeatherIcon } from './weather-icon';
import {
  formatClock,
  formatTemp,
  getCondition,
  type CurrentWeather as CurrentWeatherData,
  type DailyPoint,
} from '@/lib/weather';
import type { AppLocation } from '@/hooks/use-weather-app';

interface CurrentWeatherProps {
  location: AppLocation;
  current: CurrentWeatherData;
  today: DailyPoint;
  unit: 'C' | 'F';
  refreshing: boolean;
  onRefresh: () => void;
}

export function CurrentWeather({
  location,
  current,
  today,
  unit,
  refreshing,
  onRefresh,
}: CurrentWeatherProps) {
  const condition = getCondition(current.code);
  const rainPeak = today.precipProb;

  return (
    <section
      aria-label={`Current weather for ${location.name}`}
      className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="flex items-center gap-1.5 text-xl font-bold sm:text-2xl">
              <MapPin className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
              {location.name}
            </h2>
            <span className="font-bengali text-lg text-white">
              {location.bnName}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-white">
            {location.division} Division, Bangladesh
            {location.note ? ` • ${location.note}` : ''}
            {location.detected ? ' • GPS detected' : ''}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          aria-label="Refresh weather"
          className="border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/25 hover:text-white"
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-1.5 hidden sm:inline">
            {current.time ? `Updated ${formatClock(current.time)}` : 'Update'}
          </span>
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-start">
            <span className="text-6xl font-extrabold leading-none tracking-tighter sm:text-7xl">
              {formatTemp(current.temp, unit)}
            </span>
            <span className="mt-2 text-2xl font-semibold text-white">°{unit}</span>
          </div>
          <p className="mt-2 text-lg font-semibold">{condition.label}</p>
          <p className="font-bengali text-sm text-white">{condition.bn}</p>
        </div>

        <WeatherIcon
          code={current.code}
          isDay={current.isDay}
          className="h-20 w-20 shrink-0 sm:h-24 sm:w-24"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
          <Thermometer className="h-3.5 w-3.5 opacity-75" aria-hidden />
          Feels like {formatTemp(current.feelsLike, unit)}°
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
          <span aria-hidden className="text-white">▲</span>
          H {formatTemp(today.max, unit)}°
          <span className="text-white">|</span>
          <span aria-hidden className="text-white">▼</span>
          L {formatTemp(today.min, unit)}°
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
          <Wind className="h-3.5 w-3.5 opacity-75" aria-hidden />
          Rain chance {rainPeak}%
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
          <Sunrise className="h-3.5 w-3.5 text-white" aria-hidden />
          {formatClock(today.sunrise)}
          <span className="text-white">•</span>
          <Sunset className="h-3.5 w-3.5 text-white" aria-hidden />
          {formatClock(today.sunset)}
        </span>
      </div>

      {!location.detected ? (
        <p className="mt-4 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white">
          Tip: tap the location icon above to get weather for your exact position in
          Bangladesh.
        </p>
      ) : null}
    </section>
  );
}
