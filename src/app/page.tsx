'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeatherApp } from '@/hooks/use-weather-app';
import { useAiInsight } from '@/hooks/use-ai-insight';
import { LocationPicker } from '@/components/weather/location-picker';
import { CurrentWeather } from '@/components/weather/current-weather';
import { AiInsight } from '@/components/weather/ai-insight';
import { HourlyForecast } from '@/components/weather/hourly-forecast';
import { DailyForecast } from '@/components/weather/daily-forecast';
import { WeatherDetails } from '@/components/weather/weather-details';
import { getWeatherTheme } from '@/lib/weather';
import { cn } from '@/lib/utils';

function BdFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="24" height="16" rx="2.5" fill="#006A4E" />
      <circle cx="10.4" cy="8" r="4.4" fill="#F42A41" />
    </svg>
  );
}

function LoadingView() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <Skeleton className="h-64 w-full rounded-3xl bg-white/10" />
      <Skeleton className="h-24 w-full rounded-2xl bg-white/10" />
      <Skeleton className="h-40 w-full rounded-2xl bg-white/10" />
      <span className="sr-only">Loading weather data</span>
    </div>
  );
}

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 text-center backdrop-blur-md">
      <AlertTriangle className="mx-auto h-10 w-10 text-amber-200" aria-hidden />
      <h2 className="mt-3 text-lg font-bold">Could not load weather</h2>
      <p className="mt-1 text-sm text-white/70">{message}</p>
      <Button
        onClick={onRetry}
        className="mt-4 bg-white/20 text-white backdrop-blur hover:bg-white/30"
      >
        Try again
      </Button>
    </div>
  );
}

export default function Home() {
  const app = useWeatherApp();
  const insight = useAiInsight(app.location, app.weather);

  const theme = app.weather
    ? getWeatherTheme(app.weather.current.code, app.weather.current.isDay)
    : 'from-emerald-600 via-teal-600 to-emerald-500';

  const showLoading = !app.weather && app.loading;
  const showError = !!app.error && !app.weather;

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col bg-gradient-to-br text-white transition-[background] duration-700',
        theme
      )}
    >
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/10 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <BdFlag className="h-6 w-9 shrink-0 rounded shadow-sm" />
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold leading-tight tracking-tight">
                BD Mausam
              </h1>
              <p className="font-bengali text-[11px] leading-tight text-white/70">
                বাংলাদেশের আবহাওয়া পূর্বাভাস
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex overflow-hidden rounded-full border border-white/25 bg-white/10 backdrop-blur"
              role="group"
              aria-label="Temperature unit"
            >
              {(['C', 'F'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => app.changeUnit(u)}
                  aria-pressed={app.unit === u}
                  className={cn(
                    'min-w-[36px] px-2 py-1.5 text-xs font-bold transition-colors',
                    app.unit === u
                      ? 'bg-white text-slate-900'
                      : 'text-white/80 hover:text-white'
                  )}
                >
                  °{u}
                </button>
              ))}
            </div>

            <LocationPicker
              currentName={app.location?.name}
              detecting={app.detecting}
              onSelect={app.selectDistrict}
              onDetect={() => app.detectLocation()}
            />
          </div>
        </div>
      </header>

      {/* ---------- Main ---------- */}
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-5 px-4 py-5 sm:py-7">
        {showLoading ? (
          <LoadingView />
        ) : showError ? (
          <ErrorView message={app.error!} onRetry={app.retry} />
        ) : app.weather && app.location ? (
          <>
            <CurrentWeather
              location={app.location}
              current={app.weather.current}
              today={app.weather.daily[0]}
              unit={app.unit}
              refreshing={app.refreshing}
              onRefresh={app.refresh}
            />

            <AiInsight
              insight={insight.insight}
              loading={insight.loading}
              source={insight.source}
              locationName={app.location.name}
            />

            <HourlyForecast hours={app.weather.hourly} unit={app.unit} />

            <div className="grid gap-5 lg:grid-cols-2">
              <DailyForecast days={app.weather.daily} unit={app.unit} />
              <WeatherDetails
                current={app.weather.current}
                today={app.weather.daily[0]}
              />
            </div>
          </>
        ) : (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/70" aria-hidden />
          </div>
        )}
      </main>

      {/* ---------- Sticky footer ---------- */}
      <footer className="mt-auto border-t border-white/10 bg-black/10 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 text-center text-xs leading-relaxed text-white/60">
          <p>
            Weather data by Open-Meteo • AI briefings by Z.ai • Times in Asia/Dhaka
          </p>
          <p className="mt-1">
            Forecasts for all 64 districts of Bangladesh — informational use only.
          </p>
        </div>
      </footer>
    </div>
  );
}
