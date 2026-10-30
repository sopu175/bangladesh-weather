'use client';

import { CalendarDays, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherIcon } from './weather-icon';
import {
  formatDayLabel,
  formatTemp,
  getCondition,
  type DailyPoint,
} from '@/lib/weather';

interface DailyForecastProps {
  days: DailyPoint[];
  unit: 'C' | 'F';
  className?: string;
}

export function DailyForecast({ days, unit, className }: DailyForecastProps) {
  const weekMin = Math.min(...days.map((d) => d.min));
  const weekMax = Math.max(...days.map((d) => d.max));
  const range = Math.max(weekMax - weekMin, 1);

  return (
    <Card className="border-white/15 bg-white/10 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
          <CalendarDays className="h-4 w-4 opacity-80" aria-hidden />
          7-Day Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-white/10">
          {days.map((d, i) => {
            const left = ((d.min - weekMin) / range) * 100;
            const width = Math.max(((d.max - d.min) / range) * 100, 6);
            const condition = getCondition(d.code);
            return (
              <li
                key={d.date}
                className="flex items-center gap-2 py-2.5 sm:gap-3"
              >
                <span className="w-16 shrink-0 text-sm font-medium text-white/90">
                  {formatDayLabel(d.date, i)}
                </span>

                <span className="flex w-24 shrink-0 items-center gap-2 sm:w-36">
                  <WeatherIcon code={d.code} isDay className="h-6 w-6 shrink-0" />
                  <span className="hidden truncate text-xs text-white/70 sm:block">
                    {condition.label}
                  </span>
                </span>

                <span
                  className="flex w-11 shrink-0 items-center justify-end gap-0.5 text-xs text-cyan-200"
                  aria-label={`${d.precipProb}% chance of rain`}
                >
                  <Droplets className="h-3 w-3" aria-hidden />
                  {d.precipProb}%
                </span>

                <span className="w-8 shrink-0 text-right text-sm text-white/60">
                  {formatTemp(d.min, unit)}°
                </span>

                <span
                  className="relative h-1.5 flex-1 rounded-full bg-white/15"
                  aria-hidden
                >
                  <span
                    className="absolute h-1.5 rounded-full bg-gradient-to-r from-teal-300 via-amber-300 to-orange-400"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </span>

                <span className="w-8 shrink-0 text-sm font-bold">
                  {formatTemp(d.max, unit)}°
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
