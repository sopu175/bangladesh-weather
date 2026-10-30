'use client';

import {
  Cloud,
  Droplets,
  Gauge,
  Navigation2,
  ShowerHead,
  Sun,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatClock,
  uvLabel,
  windDirLabel,
  type CurrentWeather,
  type DailyPoint,
} from '@/lib/weather';

interface WeatherDetailsProps {
  current: CurrentWeather;
  today: DailyPoint;
  className?: string;
}

function Tile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3">
      <div className="flex items-center gap-1.5 text-xs text-white/60">
        <span className="opacity-80">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-lg font-bold leading-tight">{value}</div>
      {sub ? <div className="text-xs text-white/60">{sub}</div> : null}
    </div>
  );
}

export function WeatherDetails({ current, today, className }: WeatherDetailsProps) {
  const uv = current.uvIndex ?? today.uvMax ?? 0;

  return (
    <Card className="border-white/15 bg-white/10 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-white">
          Conditions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Tile
          icon={<Droplets className="h-3.5 w-3.5" aria-hidden />}
          label="Humidity"
          value={`${Math.round(current.humidity)}%`}
          sub="Relative"
        />
        <Tile
          icon={
            <Navigation2
              className="h-3.5 w-3.5"
              aria-hidden
              style={{ transform: `rotate(${current.windDir}deg)` }}
            />
          }
          label="Wind"
          value={`${Math.round(current.windSpeed)} km/h`}
          sub={`From ${windDirLabel(current.windDir)}`}
        />
        <Tile
          icon={<Sun className="h-3.5 w-3.5" aria-hidden />}
          label="UV Index"
          value={`${Math.round(uv)}`}
          sub={uvLabel(uv)}
        />
        <Tile
          icon={<Gauge className="h-3.5 w-3.5" aria-hidden />}
          label="Pressure"
          value={`${Math.round(current.pressure)}`}
          sub="hPa"
        />
        <Tile
          icon={<Cloud className="h-3.5 w-3.5" aria-hidden />}
          label="Cloud Cover"
          value={`${Math.round(current.cloudCover)}%`}
        />
        <Tile
          icon={<ShowerHead className="h-3.5 w-3.5" aria-hidden />}
          label="Rain Today"
          value={`${Math.round(today.precipSum)} mm`}
          sub={`${today.precipProb}% chance`}
        />
        <Tile
          icon={<Sunrise className="h-3.5 w-3.5 text-white" aria-hidden />}
          label="Sunrise"
          value={formatClock(today.sunrise)}
        />
        <Tile
          icon={<Sunset className="h-3.5 w-3.5 text-white" aria-hidden />}
          label="Sunset"
          value={formatClock(today.sunset)}
        />
      </CardContent>
    </Card>
  );
}
