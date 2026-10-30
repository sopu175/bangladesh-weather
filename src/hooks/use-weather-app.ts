'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  DHAKA,
  isInsideBangladesh,
  nearestDistrict,
  type BDDistrict,
} from '@/lib/bd-districts';
import type { WeatherData } from '@/lib/weather';

export interface AppLocation extends BDDistrict {
  /** True when chosen via device GPS rather than manual selection. */
  detected: boolean;
  /** Optional note, e.g. "~4 km from Cumilla". */
  note?: string;
}

const LOC_KEY = 'bd-wx:loc';
const UNIT_KEY = 'bd-wx:unit';
const REFRESH_MS = 10 * 60 * 1000;

function stripLocation(d: BDDistrict): BDDistrict {
  return {
    id: d.id,
    name: d.name,
    bnName: d.bnName,
    division: d.division,
    lat: d.lat,
    lon: d.lon,
  };
}

export function useWeatherApp() {
  const [location, setLocation] = useState<AppLocation | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [detecting, setDetecting] = useState(false);

  const locationRef = useRef<AppLocation | null>(null);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const fetchWeather = useCallback(
    async (loc: AppLocation, opts?: { quiet?: boolean }) => {
      if (opts?.quiet) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/weather?lat=${loc.lat}&lon=${loc.lon}`);
        const data = (await res.json()) as WeatherData & { message?: string };
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load weather data.');
        }
        setWeather(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const detectLocation = useCallback(
    (opts?: { silent?: boolean }) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        if (!opts?.silent) {
          toast({
            title: 'Location unavailable',
            description: 'Your browser does not support geolocation.',
            variant: 'destructive',
          });
        }
        return;
      }

      setDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (!isInsideBangladesh(latitude, longitude)) {
            setDetecting(false);
            toast({
              title: 'Outside Bangladesh',
              description: locationRef.current
                ? 'Bangladesh Weather only covers Bangladesh — keeping your selected district.'
                : 'Bangladesh Weather only covers Bangladesh. Showing Dhaka instead.',
              variant: 'destructive',
            });
            if (!locationRef.current) {
              const fallback: AppLocation = { ...DHAKA, detected: false };
              setLocation(fallback);
            }
            return;
          }
          const { district, distanceKm } = nearestDistrict(latitude, longitude);
          const note =
            distanceKm > 15
              ? `~${Math.round(distanceKm)} km from ${district.name}`
              : undefined;
          const loc: AppLocation = { ...district, detected: true, note };
          localStorage.setItem(LOC_KEY, JSON.stringify(stripLocation(district)));
          setLocation(loc);
          setDetecting(false);
          if (!opts?.silent) {
            toast({
              title: 'Location detected',
              description: note
                ? `${district.name} — ${note}`
                : `${district.name}, ${district.division} Division`,
            });
          }
        },
        (err) => {
          setDetecting(false);
          if (!locationRef.current) {
            setLocation({ ...DHAKA, detected: false });
          }
          if (!opts?.silent) {
            const messages: Record<number, string> = {
              1: 'Permission denied. Allow location access in your browser settings and try again.',
              2: 'Position unavailable. Please try again shortly.',
              3: 'Timed out while finding your position.',
            };
            toast({
              title: 'Could not detect location',
              description: messages[err.code] ?? err.message,
              variant: 'destructive',
            });
          }
        },
        { enableHighAccuracy: false, timeout: 12_000, maximumAge: 5 * 60 * 1000 }
      );
    },
    []
  );

  // Initial load: restore saved prefs, then auto-detect only if permission was
  // already granted (avoids a surprise permission prompt on first visit).
  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const savedUnit = localStorage.getItem(UNIT_KEY);
        if (savedUnit === 'F' && !cancelled) setUnit('F');
      } catch {
        /* ignore */
      }

      try {
        const savedLoc = localStorage.getItem(LOC_KEY);
        if (savedLoc && !cancelled) {
          const d = JSON.parse(savedLoc) as BDDistrict;
          if (d?.id && d?.lat && d?.lon) {
            setLocation({ ...d, detected: false });
            return;
          }
        }
      } catch {
        /* ignore */
      }

      try {
        const perm = await navigator.permissions?.query?.({
          name: 'geolocation' as PermissionName,
        });
        if (perm?.state === 'granted' && !cancelled) {
          detectLocation({ silent: true });
          return;
        }
      } catch {
        /* Permissions API unsupported — fall through to default. */
      }

      if (!cancelled) {
        setLocation({ ...DHAKA, detected: false });
      }
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [detectLocation]);

  // Fetch weather whenever the location changes.
  useEffect(() => {
    if (location) fetchWeather(location);
  }, [location, fetchWeather]);

  // Quiet auto-refresh every 10 minutes.
  useEffect(() => {
    const t = setInterval(() => {
      if (locationRef.current) fetchWeather(locationRef.current, { quiet: true });
    }, REFRESH_MS);
    return () => clearInterval(t);
  }, [fetchWeather]);

  const selectDistrict = useCallback((d: BDDistrict) => {
    localStorage.setItem(LOC_KEY, JSON.stringify(stripLocation(d)));
    setLocation({ ...d, detected: false, note: undefined });
  }, []);

  const changeUnit = useCallback((u: 'C' | 'F') => {
    setUnit(u);
    try {
      localStorage.setItem(UNIT_KEY, u);
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(() => {
    if (locationRef.current) fetchWeather(locationRef.current, { quiet: true });
  }, [fetchWeather]);

  return {
    location,
    weather,
    loading,
    refreshing,
    error,
    unit,
    detecting,
    detectLocation,
    selectDistrict,
    changeUnit,
    refresh,
    retry: refresh,
  };
}
