# Bangladesh Weather 🇧🇩 — Weather Forecast App for Bangladesh

[![GitHub](https://img.shields.io/badge/GitHub-sopu175%2Fbangladesh--weather-181717?logo=github)](https://github.com/sopu175/bangladesh-weather)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**Bangladesh Weather** (বাংলাদেশের আবহাওয়া) is a mobile-first weather prediction app built exclusively for **Bangladesh**. It covers all **64 districts**, detects the user's GPS location (rejecting anything outside Bangladesh), and renders live conditions, a 24-hour strip, and a 7-day forecast.

> ⚠️ Informational use only — do not rely on it for emergency or safety decisions.

**Repository:** [github.com/sopu175/bangladesh-weather](https://github.com/sopu175/bangladesh-weather)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Quick Start](#quick-start)
4. [Branches & Workflow](#branches--workflow)
5. [Build & Run](#build--run)
6. [Deployment](#deployment)
7. [Project Structure](#project-structure)
8. [API Reference](#api-reference)
9. [Data Providers & Fallback Logic](#data-providers--fallback-logic)
10. [Geolocation Flow](#geolocation-flow)
11. [WMO Weather Codes](#wmo-weather-codes)
12. [Configuration Knobs](#configuration-knobs)
13. [Performance & Caching](#performance--caching)
14. [How to Extend](#how-to-extend)
15. [Troubleshooting](#troubleshooting)

---

## Features

| Feature | Details |
| --- | --- |
| GPS location detection | Browser Geolocation API → nearest-district match (haversine) → distance note if > 15 km away |
| Bangladesh-only guard | Coordinates outside `20.5–26.75°N / 87.9–92.8°E` are rejected client- **and** server-side |
| 64 districts | All districts of the 8 divisions, searchable, English + বাংলা names |
| Division-grouped picker | Searchable combobox (cmdk) grouped by division; default location is Dhaka |
| Current weather | Temp, feels-like, humidity, wind + direction, pressure, UV, cloud cover, precipitation |
| Hourly (24 h) | Horizontally scrollable strip with precipitation probability |
| Daily (7 days) | Min/max with temperature range bars, rain chance, sunrise/sunset |
| °C / °F toggle | Persisted in `localStorage` |
| Persistence | Selected district + unit survive reloads (`localStorage`) |
| Auto refresh | Weather quietly refreshes every 10 minutes; manual refresh button too |
| Dynamic theming | Page gradient changes with weather condition + day/night (`getWeatherTheme`) |
| All-white typography | Every text element renders in pure white over the dynamic gradient |
| i18n-lite | Bangla (বাংলা) labels via the `Noto Sans Bengali` font (`font-bengali` utility) |
| Friendly error states | Skeletons while loading, retry button on failure, toasts for GPS/detection problems |
| Mobile-first layout | Glass-card UI (`backdrop-blur`) tuned for phones; works fine on desktop too |

## Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router, Turbopack) | One page + one API route; standalone output for production |
| UI library | **React 19** | Client component for the whole UI, server route handler for the API |
| Language | **TypeScript 5** | Strict config, path alias `@/* → ./src/*` |
| Styling | **Tailwind CSS 4** (CSS-first config) | Design tokens live in `globals.css` via `@theme`, no `tailwind.config` |
| Components | **shadcn/ui** (New York style) | 8 primitives in use: button, card, command, dialog, popover, skeleton, toast, toaster |
| Icons | **Lucide React** | Weather icons are WMO-code → Lucide mappings with motion |
| Animation | **framer-motion** | Icon transitions and small UI motion |
| Fonts | **Geist**, **Geist Mono**, **Noto Sans Bengali** | Loaded with `next/font/google`; Bengali via the `font-bengali` utility |
| Weather data | **[Open-Meteo](https://open-meteo.com)** (primary), **[MET Norway Locationforecast 2.0](https://api.met.no)** (fallback) | Both free, **no API keys required** |
| State | React hooks + `localStorage` | Keys: `bd-wx:loc`, `bd-wx:unit` — no global store, no backend session |
| Runtime | **Node.js 20+** with **npm** | API route pinned to the Node runtime |

### How it fits together

```
Browser (src/app/page.tsx, 'use client')
   │  GET /api/weather?lat=…&lon=…
   ▼
Next.js route handler (src/app/api/weather/route.ts)
   │  validate coords → Bangladesh bounds check → 5-min memory cache
   ▼
Provider chain: Open-Meteo → (fail) → met.no → (fail) → 502
   │  both normalized to the same WeatherData shape
   ▼
UI renders current / hourly / daily from one JSON payload
```

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/sopu175/bangladesh-weather.git
cd bangladesh-weather

# 2. Install dependencies (npm)
npm install

# 3. Start the dev server (auto-picks a free port, logs streamed to dev.log)
npm run dev

# 4. Lint
npm run lint
```

Open the URL printed in the terminal — usually `http://localhost:3000`, but if port 3000 is busy it automatically falls back to the next free port (e.g. `3001`). The app boots with **Dhaka** by default; tap the crosshair button to detect your location.

**Prerequisites:** Node.js 20+ with npm. No `.env` file and no API keys are needed to run.

> ℹ️ Browser geolocation only works on `https://` or `http://localhost`. If you expose the app over plain HTTP on a LAN, GPS detection will be blocked by the browser — the district picker still works.

## Branches & Workflow

| Branch | Purpose |
| --- | --- |
| `main` | Stable / production-ready code. Push here only for releases. |
| `develop` | Day-to-day development. Default branch for feature work. |
| `third-party` | Third-party / external contributor work. |

```bash
git checkout develop      # feature development
git checkout third-party  # external / third-party contributions
git checkout main         # stable releases only
```

Feature workflow: branch off `develop` (or `third-party` for external work), open a PR back into that branch, then merge `develop` → `main` for releases.

## Build & Run

| Script | Command | What it does |
| --- | --- | --- |
| `npm run dev` | `node scripts/dev.mjs` | Starts `next dev` on the first free port starting at **3000**; output tee'd to `dev.log` |
| `npm run lint` | `eslint .` | ESLint flat config (`eslint-config-next/core-web-vitals`) |
| `npm run build` | `next build` + copy step | Production build, then copies `.next/static` and `public/` into `.next/standalone/` |
| `npm run start` | `node .next/standalone/server.js` | Runs the self-contained server with `NODE_ENV=production`; logs tee'd to `server.log` |

```bash
npm run dev      # development
npm run lint     # lint
npm run build    # production build
npm run start    # serve production build
```

The app is **fully stateless** — no database, no migrations, no environment variables.

### Dev port fallback

`npm run dev` runs `scripts/dev.mjs`, which:

1. Checks if port `3000` is free (or `PORT` if set: `PORT=4000 npm run dev`)
2. If busy, scans upward for the next free port and prints which one it uses
3. Starts `next dev` on that port and tees output to `dev.log`

## Deployment

`next.config.ts` sets `output: "standalone"`, so the build produces a self-contained Node server — no `next start` CLI needed.

```bash
npm run build
npm run start
# equivalent to: NODE_ENV=production node .next/standalone/server.js
```

The build script copies `.next/static` and `public/` into `.next/standalone/`, so the folder can be shipped as-is to any host that can run Node 20+ (VM, Docker, Railway, a $5 VPS, etc.). No build tools or npm install required on the target machine.

**Checklist for production:**

- Expose the port the server listens on (Next picks up `PORT` automatically)
- Put HTTPS in front of it (geolocation requires a secure context)
- Optional: run under a process manager (`pm2`, `systemd`) and proxy with Caddy/nginx
- Watch `server.log` for errors — provider failures show up there

## Project Structure

Only the files the app actually uses are kept — no scaffold code, no demo folders, no unused components.

```
scripts/
└── dev.mjs                       # Dev launcher: free-port detection + next dev + tee dev.log
src/
├── app/
│   ├── api/
│   │   └── weather/route.ts      # GET /api/weather — forecast, provider chain, cache
│   ├── globals.css               # Tailwind theme tokens, font-bengali, scrollbars
│   ├── layout.tsx                # Fonts (Geist + Noto Sans Bengali), metadata, Toaster
│   └── page.tsx                  # The single page: header, hero, grids, footer
├── components/
│   ├── ui/                       # shadcn/ui primitives actually used:
│   │                             #   button, card, command, dialog,
│   │                             #   popover, skeleton, toast, toaster
│   └── weather/
│       ├── current-weather.tsx   # Hero card (temp, condition, chips, refresh)
│       ├── hourly-forecast.tsx   # 24 h strip
│       ├── daily-forecast.tsx    # 7-day list with range bars
│       ├── weather-details.tsx   # Conditions tile grid
│       ├── location-picker.tsx   # GPS button + searchable district combobox
│       └── weather-icon.tsx      # WMO code → animated Lucide icon
├── hooks/
│   ├── use-weather-app.ts        # App state: location, weather fetch, geolocation, unit
│   └── use-toast.ts              # shadcn toast
└── lib/
    ├── bd-districts.ts           # 64 districts, divisions, bounds, haversine, nearestDistrict
    ├── weather.ts                # Shared types, WMO labels (EN/বাংলা), gradients, formatters
    ├── metno.ts                  # met.no adapter → WeatherData (symbol→WMO, Dhaka time, …)
    ├── sun.ts                    # Sunrise/sunset computation (NOAA/SunCalc math)
    └── utils.ts                  # shadcn cn()
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

## Performance & Caching

| Layer | Strategy | Effect |
| --- | --- | --- |
| Server cache | In-memory `Map`, 5 min TTL, key = `lat,lon` rounded to 2 dp, capped at **100 entries** | Repeat coordinates answer in a few ms; satisfies met.no's "cache our data" requirement |
| Upstream timeouts | Open-Meteo **8 s**, met.no **10 s** (`AbortController`) | Bad provider degrades to the next one instead of hanging the request |
| Client refresh | Silent refetch every **10 min** + manual refresh button | Keeps the page fresh without hammering the API |
| Response headers | `Cache-Control: no-store` on `/api/weather` | Browser never caches weather JSON; freshness is owned by the server cache |
| Data payload | One request returns current + 24 h hourly + 7-day daily | No waterfall of N requests for one screen |
| Images / assets | No stock photography; icons are inline SVG/Lucide | Tiny bundle, no image optimization pipeline needed |

The API is a **Node-runtime** route (`export const runtime = 'nodejs'`), so caching works in process memory across requests — no Redis or external cache required for a single-instance deploy. If you scale to multiple instances, each keeps its own 5-minute cache (still correct, just slightly more upstream calls).

## How to Extend

**Add a district / fix coordinates** — edit `BD_DISTRICTS` in `src/lib/bd-districts.ts` (id must be unique; `nearestDistrict` picks it up automatically).

**Add another weather provider** — write `fetchXYZ(lat, lon): Promise<WeatherData>` (see `metno.ts` for the shape) and slot it into the provider chain in `src/app/api/weather/route.ts`.

**Add pages/routes** — the UI is a single route (`src/app/page.tsx`, client component). API routes live under `src/app/api/**/route.ts`.

**Add shadcn/ui components** — `components.json` is kept for the shadcn CLI (`npx shadcn@latest add <component>`); only the 8 primitives the app uses are committed.

**Styling** — the dynamic page gradient comes from `getWeatherTheme(code, isDay)` in `src/lib/weather.ts`; glass-card look is `border-white/15 bg-white/10 backdrop-blur-md`.

## Troubleshooting

| Symptom | Cause / Fix |
| --- | --- |
| Weather shows old data | Normal — server cache is 5 min. Force refresh via the refresh button (bypasses nothing; wait out the TTL or lower `CACHE_TTL_MS`). |
| Logs show `open-meteo responded 429` | Shared-IP daily quota hit; the app automatically serves met.no data. Quota resets (UTC midnight). |
| GPS button says "Permission denied" | Allow location in browser site settings; geolocation needs HTTPS or localhost. |
| Bangla text renders in a fallback font | `Noto_Sans_Bengali` is fetched from Google Fonts at build/dev time — ensure network access, or self-host the font. |
| Port 3000 busy | No action needed — `npm run dev` automatically picks the next free port. Force a specific port with `PORT=4000 npm run dev`. |
| Where are the server logs? | Dev server output is tee'd to `dev.log` in the project root; production to `server.log`. |

## Contributing

1. Fork the repo and clone it.
2. Work on `develop` (internal) or `third-party` (external contributions).
3. Create a feature branch (`git checkout -b feature/my-change develop`).
4. Commit with a clear message; run `npm run lint` before opening a PR.
5. Open a PR against `develop` (or `third-party`). Maintainers merge to `main` for releases.

---

Made for Bangladesh — covering all 64 districts, from Panchagarh to Cox's Bazar. 🇧🇩

Developed by [Saif Islam](mailto:sopu175@gmail.com)

**Repo:** [github.com/sopu175/bangladesh-weather](https://github.com/sopu175/bangladesh-weather)
