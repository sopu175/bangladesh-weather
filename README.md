# Bangladesh Weather 🇧🇩 — Weather Forecast App for Bangladesh

**Bangladesh Weather** (বাংলাদেশের আবহাওয়া) is a mobile-first weather prediction app built exclusively for **Bangladesh**. It covers all **64 districts**, detects the user's GPS location (rejecting anything outside Bangladesh), and renders live conditions, a 24-hour strip, and a 7-day forecast.

> ⚠️ Informational use only — do not rely on it for emergency or safety decisions.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Quick Start](#quick-start)
4. [Build & Run](#build--run)
5. [Project Structure](#project-structure)
6. [API Reference](#api-reference)
7. [Data Providers & Fallback Logic](#data-providers--fallback-logic)
8. [Geolocation Flow](#geolocation-flow)
9. [WMO Weather Codes](#wmo-weather-codes)
10. [Configuration Knobs](#configuration-knobs)
11. [How to Extend](#how-to-extend)
12. [Troubleshooting](#troubleshooting)

---

## Features

| Feature | Details |
| --- | --- |
| GPS location detection | Browser Geolocation API → nearest-district match (haversine) → distance note if > 15 km away |
| Bangladesh-only guard | Coordinates outside `20.5–26.75°N / 87.9–92.8°E` are rejected client- **and** server-side |
| 64 districts | All districts of the 8 divisions, searchable, English + বাংলা names |
| Current weather | Temp, feels-like, humidity, wind + direction, pressure, UV, cloud cover, precipitation |
| Hourly (24 h) | Horizontally scrollable strip with precipitation probability |
| Daily (7 days) | Min/max with temperature range bars, rain chance, sunrise/sunset |
| °C / °F toggle | Persisted in `localStorage` |
| Persistence | Selected district + unit survive reloads (`localStorage`) |
| Auto refresh | Weather quietly refreshes every 10 minutes; manual refresh button too |
| Dynamic theming | Page gradient changes with weather condition + day/night |
| All-white typography | Every text element renders in pure white over the dynamic gradient |
| i18n-lite | Bangla (বাংলা) labels via the `Noto Sans Bengali` font (`font-bengali` utility) |

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Runtime/package manager:** Node.js 20+ with **npm**
- **Styling:** Tailwind CSS 4, shadcn/ui (New York), Lucide icons, framer-motion
- **Weather data:** [Open-Meteo](https://open-meteo.com) (primary), [MET Norway yr.no Locationforecast 2.0](https://api.met.no) (fallback) — both free, **no API keys required**
- **State:** React hooks + `localStorage` (no global store needed)

## Quick Start

```bash
# 1. Install dependencies (npm)
npm install

# 2. Start the dev server (port 3000, logs streamed to dev.log)
npm run dev

# 3. Lint
npm run lint
```

Open `http://localhost:3000`. The app boots with **Dhaka** by default; tap the crosshair button to detect your location.

**Prerequisites:** Node.js 20+ with npm. No `.env` file and no API keys are needed to run.

> ℹ️ Browser geolocation only works on `https://` or `http://localhost`. If you expose the app over plain HTTP on a LAN, GPS detection will be blocked by the browser — the district picker still works.

## Build & Run

```bash
npm run dev     # Development server on :3000 (tee'd into dev.log)
npm run lint    # ESLint (next/core-web-vitals + react-hooks rules)
npm run build   # Production build → .next/standalone (+ copies static/public)
npm run start   # Run the standalone production server (NODE_ENV=production)
```

Database commands (`db:push`, `db:generate`, …) exist in `package.json` but this app is **stateless** — Prisma/SQLite is unused and no schema is required.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── weather/route.ts        # GET  /api/weather — forecast, provider chain, cache
│   │   └── route.ts                # scaffold health route (unused by the UI)
│   ├── globals.css                 # Tailwind theme tokens, font-bengali, scrollbars
│   ├── layout.tsx                  # Fonts (Geist + Noto Sans Bengali), metadata, Toaster
│   └── page.tsx                    # The single page: header, hero, grids, footer
├── components/
│   ├── ui/                         # shadcn/ui primitives (button, card, command, …)
│   └── weather/
│       ├── current-weather.tsx     # Hero card (temp, condition, chips, refresh)
│       ├── hourly-forecast.tsx     # 24 h strip
│       ├── daily-forecast.tsx      # 7-day list with range bars
│       ├── weather-details.tsx     # Conditions tile grid
│       ├── location-picker.tsx     # GPS button + searchable district combobox
│       └── weather-icon.tsx        # WMO code → animated Lucide icon
├── hooks/
│   ├── use-weather-app.ts          # App state: location, weather fetch, geolocation, unit
│   └── use-toast.ts                # shadcn toast
└── lib/
    ├── bd-districts.ts             # 64 districts, divisions, bounds, haversine, nearestDistrict
    ├── weather.ts                  # Shared types, WMO labels (EN/বাংলা), gradients, formatters
    ├── metno.ts                    # met.no adapter → WeatherData (symbol→WMO, Dhaka time, …)
    ├── sun.ts                      # Sunrise/sunset computation (NOAA/SunCalc math)
    └── utils.ts                    # shadcn cn()
```

## API Reference

The frontend only talks to this endpoint (relative path, same origin). It is a Node-runtime route handler.

### `GET /api/weather`

Live weather + forecast for a coordinate **inside Bangladesh**.

**Query params**

| Param | Type | Required | Notes |
| --- | --- | --- | --- |
| `lat` | number | ✔ | Latitude |
| `lon` | number | ✔ | Longitude |

**Example**

```bash
curl "http://localhost:3000/api/weather?lat=23.8103&lon=90.4125"
```

**200 response** (`application/json`, `Cache-Control: no-store`):

```jsonc
{
  "current": {
    "time": "2026-10-31T03:00",   // Asia/Dhaka local, "YYYY-MM-DDTHH:mm"
    "temp": 25.6,                  // °C
    "feelsLike": 25.6,             // °C (met.no path computes heat-index/wind-chill)
    "humidity": 92.4,              // %
    "code": 3,                     // WMO weather code (see table below)
    "isDay": false,
    "windSpeed": 3.6,              // km/h
    "windDir": 23.7,               // degrees (direction wind comes FROM)
    "pressure": 1015,              // hPa
    "cloudCover": 88.3,            // %
    "precipitation": 0,            // mm (last hour)
    "uvIndex": null                // number | null (met.no path has no UV)
  },
  "hourly": [                      // next 24 hourly steps starting at the current hour
    { "time": "2026-10-31T03:00", "temp": 25.6, "code": 3, "precipProb": 10, "isDay": false }
  ],
  "daily": [                       // 7 days, Dhaka-local dates
    {
      "date": "2026-10-31",
      "code": 3, "max": 32.2, "min": 25.2,
      "precipSum": 0.4, "precipProb": 70,
      "windMax": 14.8, "uvMax": 7,
      "sunrise": "06:04", "sunset": "17:21"   // "HH:mm" Dhaka time
    }
  ],
  "updatedAt": "2026-10-30T21:02:11.123Z"      // server fetch time (UTC ISO)
}
```

**Errors**

| Status | `error` | When |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | Missing/non-numeric `lat` or `lon` |
| 403 | `OUTSIDE_BANGLADESH` | Coordinate outside Bangladesh bounds — the app only serves BD |
| 502 | `UPSTREAM_ERROR` | Both weather providers failed/timed out |

**Caching:** responses are cached **in memory for 5 minutes** per coordinate rounded to 2 decimals (`src/app/api/weather/route.ts`). Repeat hits answer in a few milliseconds. This also satisfies met.no's caching requirement.

## Data Providers & Fallback Logic

`GET /api/weather` tries providers in order and uses the first success:

```
request → [Open-Meteo] --ok--> shape → 5-min cache → response
              │ 429/5xx/timeout
              ▼
          [met.no compact] --ok--> adapt → 5-min cache → response
              │ error
              ▼
           502 UPSTREAM_ERROR
```

| | Open-Meteo (primary) | met.no (fallback) |
| --- | --- | --- |
| Auth | none (fair-use, IP rate-limited) | none, but requires an identifying `User-Agent` (`BangladeshWeather/1.0 …`) |
| Horizon | 7 days, true hourly | ~10 days: hourly first ~64 h, then 6-hourly |
| Precip probability | exact | **estimated** from symbol code (`estimatePrecipProb`) |
| UV index | yes | not available (`uvIndex: null`, `uvMax: 0`) |
| Sunrise/sunset | from provider | computed locally in `src/lib/sun.ts` |
| Timezone | requested as `Asia/Dhaka` | UTC timestamps converted to Dhaka via `Intl.DateTimeFormat` |

Provider adapters live in `src/app/api/weather/route.ts` (`fetchOpenMeteo`) and `src/lib/metno.ts` (`fetchMetNoWeather`); both return the identical `WeatherData` shape, so the UI is provider-agnostic.

## Geolocation Flow

Implemented in `src/hooks/use-weather-app.ts`:

1. **Boot:** read `localStorage['bd-wx:loc']` → if found, restore that district; else if the Permissions API reports `geolocation: granted`, auto-detect silently; else default to **Dhaka**. (No surprise permission prompt on first visit.)
2. **Detect (button):** `navigator.geolocation.getCurrentPosition` →
   - **Inside BD bounds** → `nearestDistrict(lat, lon)` (haversine over all 64 districts) → set location, save to `localStorage`, toast *"Location detected — {district}"*, add distance note when > 15 km (`~42 km from Khulna`).
   - **Outside bounds** → destructive toast *"Outside Bangladesh"*, keep existing selection (or fall back to Dhaka).
   - **Denied / unavailable / timeout** → destructive toast with a fix-it hint.
3. **Persist:** the plain district object is stored under `bd-wx:loc`; unit under `bd-wx:unit`.

## WMO Weather Codes

`code` fields use [WMO weather interpretation codes](https://open-meteo.com/en/docs). Mapping + labels live in `src/lib/weather.ts` (`getCondition`) and icon mapping in `src/components/weather/weather-icon.tsx`.

| Code | Condition (EN) | বাংলা |
| --- | --- | --- |
| 0 | Clear Sky | পরিষ্কার আকাশ |
| 1 | Mainly Clear | প্রায় পরিষ্কার |
| 2 | Partly Cloudy | আংশিক মেঘলা |
| 3 | Overcast | মেঘলা |
| 45, 48 | Fog / Rime Fog | কুয়াশা |
| 51 / 53 / 55 | Drizzle (light → dense) | গুঁড়ি বৃষ্টি |
| 56, 57 | Freezing Drizzle | হিমশীতল গুঁড়ি বৃষ্টি |
| 61 / 63 / 65 | Rain (light / moderate / heavy) | বৃষ্টি |
| 66, 67 | Freezing Rain | হিমশীতল বৃষ্টি |
| 71 / 73 / 75 / 77 | Snowfall / grains | তুষারপাত |
| 80 / 81 / 82 | Rain showers (light → violent) | বৃষ্টিঝর |
| 85, 86 | Snow showers | তুষার ঝাপটা |
| 95 | Thunderstorm | বজ্রঝড় |
| 96, 99 | Thunderstorm with hail | শিলাবৃষ্টিসহ বজ্রঝড় |

met.no symbol codes are converted to this table by `symbolToWmo()` in `src/lib/metno.ts`.

## Configuration Knobs

All tunables are plain constants — no env vars needed:

| What | Where | Default |
| --- | --- | --- |
| Weather cache TTL | `src/app/api/weather/route.ts` → `CACHE_TTL_MS` | 5 min |
| Auto-refresh interval | `src/hooks/use-weather-app.ts` → `REFRESH_MS` | 10 min |
| GPS timeout / max age | `use-weather-app.ts` → `getCurrentPosition` options | 12 s / 5 min |
| "Far from district" threshold | `use-weather-app.ts` (`distanceKm > 15`) | 15 km |
| Bangladesh bounds | `src/lib/bd-districts.ts` → `BD_BOUNDS` | 20.5–26.75°N, 87.9–92.8°E |

## How to Extend

**Add a district / fix coordinates** — edit `BD_DISTRICTS` in `src/lib/bd-districts.ts` (id must be unique; `nearestDistrict` picks it up automatically).

**Add another weather provider** — write `fetchXYZ(lat, lon): Promise<WeatherData>` (see `metno.ts` for the shape) and slot it into the provider chain in `src/app/api/weather/route.ts`.

**Persist forecast history** — the app is stateless by design; Prisma + SQLite are preconfigured if you want to store search history or forecast archives (`prisma/schema.prisma`, `npm run db:push`, then `import { db } from '@/lib/db'`).

**Add pages/routes** — the UI is a single route (`src/app/page.tsx`, client component). API routes live under `src/app/api/**/route.ts`.

**Styling** — the dynamic page gradient comes from `getWeatherTheme(code, isDay)` in `src/lib/weather.ts`; glass-card look is `border-white/15 bg-white/10 backdrop-blur-md`.

## Troubleshooting

| Symptom | Cause / Fix |
| --- | --- |
| Weather shows old data | Normal — server cache is 5 min. Force refresh via the refresh button (bypasses nothing; wait out the TTL or lower `CACHE_TTL_MS`). |
| Logs show `open-meteo responded 429` | Shared-IP daily quota hit; the app automatically serves met.no data. Quota resets (UTC midnight). |
| GPS button says "Permission denied" | Allow location in browser site settings; geolocation needs HTTPS or localhost. |
| Bangla text renders in a fallback font | `Noto_Sans_Bengali` is fetched from Google Fonts at build/dev time — ensure network access, or self-host the font. |
| Port 3000 busy | Change the port in the `dev` script in `package.json`. |
| Where are the server logs? | Dev server output is tee'd to `dev.log` in the project root. |

---

Made for Bangladesh — covering all 64 districts, from Panchagarh to Cox's Bazar. 🇧🇩

Developed by [Saif Islam](mailto:sopu175@gmail.com)
