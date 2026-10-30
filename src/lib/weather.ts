// Shared weather types, WMO weather-code helpers and theme utilities.

export interface CurrentWeather {
  time: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  code: number;
  isDay: boolean;
  windSpeed: number;
  windDir: number;
  pressure: number;
  cloudCover: number;
  precipitation: number;
  uvIndex: number | null;
}

export interface HourlyPoint {
  time: string;
  temp: number;
  code: number;
  precipProb: number;
  isDay: boolean;
}

export interface DailyPoint {
  date: string;
  code: number;
  max: number;
  min: number;
  precipSum: number;
  precipProb: number;
  windMax: number;
  uvMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  updatedAt: string;
}

export interface ConditionInfo {
  label: string;
  bn: string;
}

const CONDITIONS: Record<number, ConditionInfo> = {
  0: { label: 'Clear Sky', bn: 'পরিষ্কার আকাশ' },
  1: { label: 'Mainly Clear', bn: 'প্রায় পরিষ্কার' },
  2: { label: 'Partly Cloudy', bn: 'আংশিক মেঘলা' },
  3: { label: 'Overcast', bn: 'মেঘলা' },
  45: { label: 'Foggy', bn: 'কুয়াশা' },
  48: { label: 'Rime Fog', bn: 'জমা কুয়াশা' },
  51: { label: 'Light Drizzle', bn: 'হালকা গুঁড়ি বৃষ্টি' },
  53: { label: 'Drizzle', bn: 'গুঁড়ি বৃষ্টি' },
  55: { label: 'Dense Drizzle', bn: 'ঘন গুঁড়ি বৃষ্টি' },
  56: { label: 'Freezing Drizzle', bn: 'হিমশীতল গুঁড়ি বৃষ্টি' },
  57: { label: 'Freezing Drizzle', bn: 'হিমশীতল গুঁড়ি বৃষ্টি' },
  61: { label: 'Light Rain', bn: 'হালকা বৃষ্টি' },
  63: { label: 'Rain', bn: 'মাঝারি বৃষ্টি' },
  65: { label: 'Heavy Rain', bn: 'ভারী বৃষ্টি' },
  66: { label: 'Freezing Rain', bn: 'হিমশীতল বৃষ্টি' },
  67: { label: 'Freezing Rain', bn: 'হিমশীতল বৃষ্টি' },
  71: { label: 'Light Snow', bn: 'হালকা তুষারপাত' },
  73: { label: 'Snowfall', bn: 'তুষারপাত' },
  75: { label: 'Heavy Snow', bn: 'ভারী তুষারপাত' },
  77: { label: 'Snow Grains', bn: 'তুষারকণা' },
  80: { label: 'Light Showers', bn: 'হালকা বৃষ্টিঝর' },
  81: { label: 'Showers', bn: 'বৃষ্টিঝর' },
  82: { label: 'Heavy Showers', bn: 'প্রবল বৃষ্টিঝর' },
  85: { label: 'Snow Showers', bn: 'তুষার ঝাপটা' },
  86: { label: 'Snow Showers', bn: 'তুষার ঝাপটা' },
  95: { label: 'Thunderstorm', bn: 'বজ্রঝড়' },
  96: { label: 'Thunderstorm with Hail', bn: 'শিলাবৃষ্টিসহ বজ্রঝড়' },
  99: { label: 'Severe Thunderstorm', bn: 'প্রবল বজ্রঝড় ও শিলাবৃষ্টি' },
};

export function getCondition(code: number): ConditionInfo {
  return CONDITIONS[code] ?? { label: 'Unknown', bn: 'অজানা' };
}

/** Dynamic page background based on condition + day/night. */
export function getWeatherTheme(code: number, isDay: boolean): string {
  if (code === 0 || code === 1) {
    return isDay
      ? 'from-sky-500 via-cyan-500 to-emerald-400'
      : 'from-slate-950 via-emerald-950 to-teal-950';
  }
  if (code === 2) {
    return isDay
      ? 'from-teal-500 via-cyan-500 to-emerald-300'
      : 'from-slate-900 via-slate-800 to-teal-950';
  }
  if (code === 3) {
    return isDay
      ? 'from-slate-500 via-slate-600 to-teal-700'
      : 'from-slate-900 via-slate-800 to-slate-950';
  }
  if (code === 45 || code === 48) {
    return isDay
      ? 'from-stone-500 via-stone-600 to-slate-600'
      : 'from-stone-900 via-slate-900 to-stone-800';
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return isDay
      ? 'from-slate-500 via-slate-400 to-cyan-200'
      : 'from-slate-800 via-slate-700 to-slate-600';
  }
  if (code >= 95) {
    return isDay
      ? 'from-slate-800 via-slate-700 to-amber-800'
      : 'from-slate-950 via-slate-900 to-amber-950';
  }
  // rain / drizzle / showers
  return isDay
    ? 'from-slate-600 via-slate-700 to-emerald-900'
    : 'from-slate-900 via-slate-800 to-emerald-950';
}

export function formatTemp(celsius: number, unit: 'C' | 'F'): number {
  return unit === 'C'
    ? Math.round(celsius)
    : Math.round((celsius * 9) / 5 + 32);
}

const WIND_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function windDirLabel(deg: number): string {
  return WIND_DIRS[Math.round(deg / 45) % 8];
}

export function uvLabel(uv: number): string {
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very High';
  return 'Extreme';
}

export function formatHourLabel(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    .replace(' AM', ' AM')
    .replace(' PM', ' PM');
}

/** Format "HH:mm" (bare clock time) or a full ISO datetime into "h:mm AM/PM". */
export function formatClock(iso: string): string {
  // Bare "HH:mm" — returned by the sunrise/sunset computation.
  const bare = /^(\d{1,2}):(\d{2})$/.exec(iso);
  if (bare) {
    const h = parseInt(bare[1], 10);
    const m = bare[2];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m} ${ampm}`;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDayLabel(isoDate: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const d = new Date(`${isoDate}T00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}
