'use client';

import { motion } from 'framer-motion';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudRainWind,
  CloudShowersHeavy,
  CloudSun,
  Moon,
  Snowflake,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconKind =
  | 'sun'
  | 'moon'
  | 'partly-day'
  | 'partly-night'
  | 'cloud'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy-rain'
  | 'snow'
  | 'thunder'
  | 'hail';

const ICON_MAP: Record<IconKind, LucideIcon> = {
  sun: Sun,
  moon: Moon,
  'partly-day': CloudSun,
  'partly-night': CloudMoon,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  'heavy-rain': CloudRainWind,
  snow: Snowflake,
  thunder: CloudLightning,
  hail: CloudHail,
};

export function iconKindFor(code: number, isDay: boolean): IconKind {
  if (code === 0 || code === 1) return isDay ? 'sun' : 'moon';
  if (code === 2) return isDay ? 'partly-day' : 'partly-night';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || code === 66) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 80 && code <= 82) return 'heavy-rain';
  if (code === 95) return 'thunder';
  return 'hail';
}

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  className?: string;
}

export function WeatherIcon({ code, isDay = true, className }: WeatherIconProps) {
  const kind = iconKindFor(code, isDay);
  const Icon = ICON_MAP[kind];

  const colorClass =
    kind === 'sun'
      ? 'text-amber-300'
      : kind === 'moon'
        ? 'text-slate-200'
        : kind === 'thunder'
          ? 'text-amber-200'
          : 'text-white';

  const isSun = kind === 'sun';
  const isThunder = kind === 'thunder';

  return (
    <motion.span
      role="img"
      aria-label={kind.replace('-', ' ')}
      className="inline-flex"
      animate={
        isSun
          ? { rotate: [0, 10, 0, -10, 0], scale: [1, 1.04, 1] }
          : isThunder
            ? { opacity: [1, 0.5, 1, 0.75, 1] }
            : { y: [0, -3, 0] }
      }
      transition={{
        duration: isSun ? 7 : isThunder ? 2.2 : 3.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Icon className={cn('h-8 w-8 drop-shadow-md', colorClass, className)} />
    </motion.span>
  );
}
