'use client';

import { Clock, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherIcon } from './weather-icon';
import { formatHourLabel, formatTemp, type HourlyPoint } from '@/lib/weather';
import { cn } from '@/lib/utils';

interface HourlyForecastProps {
  hours: HourlyPoint[];
  unit: 'C' | 'F';
  className?: string;
}

export function HourlyForecast({ hours, unit, className }: HourlyForecastProps) {
  return (
    <Card className="border-white/15 bg-white/10 backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
          <Clock className="h-4 w-4 opacity-80" aria-hidden />
          Next 24 Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="nice-scroll flex gap-1 overflow-x-auto pb-2">
          {hours.map((h, i) => (
            <div
              key={h.time}
              className={cn(
                'flex min-w-[4.4rem] flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition-colors',
                i === 0 ? 'bg-white/20' : 'hover:bg-white/10'
              )}
            >
              <span className="text-xs font-medium text-white/80">
                {i === 0 ? 'Now' : formatHourLabel(h.time)}
              </span>
              <WeatherIcon code={h.code} isDay={h.isDay} className="h-7 w-7" />
              <span className="text-sm font-bold">
                {formatTemp(h.temp, unit)}°
              </span>
              <span
                className={cn(
                  'flex items-center gap-0.5 text-[11px] font-medium',
                  h.precipProb >= 40 ? 'text-white' : 'text-white/60'
                )}
                aria-label={`${h.precipProb}% chance of precipitation`}
              >
                <Droplets className="h-3 w-3" aria-hidden />
                {h.precipProb}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
