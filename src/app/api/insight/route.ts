import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';

interface InsightPayload {
  location: { name: string; bnName: string; division: string };
  current: { temp: number; feelsLike: number; humidity: number; condition: string; windSpeed: number };
  next12: { hour: string; temp: number; condition: string; precipProb: number }[];
  days: { day: string; min: number; max: number; condition: string; precipProb: number; precipSum: number }[];
}

interface CacheEntry {
  insight: string;
  source: 'ai' | 'local';
  ts: number;
}

// Simple in-memory cache so we don't call the LLM for the same location+hour repeatedly.
const cache = new Map<string, CacheEntry>();
const TTL_MS = 30 * 60 * 1000;

const SYSTEM_PROMPT = `You are the briefing writer for "BD Mausam", a weather app serving all 64 districts of Bangladesh.
You receive structured Open-Meteo forecast data (metric units, Asia/Dhaka time) as JSON.
Write a natural, friendly weather briefing in EXACTLY 2-3 short sentences (max 55 words total):
1) The most notable condition in the next 24 hours (rain timing, storms, heat or humidity).
2) The trend over the coming days.
3) One practical tip for daily life in Bangladesh (umbrella, hydration, flood/heat caution, outdoor plans).
Rules: plain text only, no markdown, no emoji, no greeting, no sign-off, do not mention "JSON" or "data".
Seasonal context: monsoon is June-September, nor'wester thunderstorms are March-May, heat waves April-June, mild winter December-February.`;

function localBriefing(p: InsightPayload): string {
  const hours = p.next12;
  const rainHours = hours.filter((h) => h.precipProb >= 50);
  const peakProb = Math.max(...hours.map((h) => h.precipProb), 0);
  const d0 = p.days[0];
  const d1 = p.days[1];

  const parts: string[] = [];

  if (rainHours.length > 0 && peakProb >= 50) {
    const first = rainHours[0]?.hour ?? 'later today';
    parts.push(
      `${p.current.condition} right now with around ${peakProb}% chance of rain — showers are most likely around ${first}.`
    );
  } else {
    parts.push(
      `${p.current.condition} conditions persist with lows near ${Math.round(
        d0?.min ?? p.current.temp
      )}°C and highs near ${Math.round(d0?.max ?? p.current.temp)}°C; only a ${peakProb}% chance of rain in the next 12 hours.`
    );
  }

  if (d1) {
    const diff = d1.max - (d0?.max ?? d1.max);
    const trend =
      diff > 1 ? 'warming up' : diff < -1 ? 'cooling down slightly' : 'staying much the same';
    parts.push(
      `${d1.day} looks ${d1.condition.toLowerCase()} with temperatures ${trend}.`
    );
  }

  if (peakProb >= 70) parts.push('Carry an umbrella before heading out.');
  else if ((d0?.max ?? 0) >= 36) parts.push('Stay hydrated and avoid the midday sun.');
  else if ((d0?.precipSum ?? 0) >= 20) parts.push('Watch for waterlogging on low-lying roads.');

  return parts.slice(0, 3).join(' ');
}

export async function POST(request: NextRequest) {
  let payload: InsightPayload;
  try {
    payload = (await request.json()) as InsightPayload;
  } catch {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  if (!payload?.location?.name || !Array.isArray(payload?.next12)) {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: 'location, current, next12 and days are required.' },
      { status: 400 }
    );
  }

  const hourKey = new Date().toISOString().slice(0, 13);
  const cacheKey = `${payload.location.name}:${hourKey}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL_MS) {
    return NextResponse.json({ insight: cached.insight, source: cached.source });
  }

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(payload) },
      ],
      thinking: { type: 'disabled' },
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty AI response');

    const entry: CacheEntry = { insight: text, source: 'ai', ts: Date.now() };
    cache.set(cacheKey, entry);
    if (cache.size > 200) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }

    return NextResponse.json({ insight: text, source: 'ai' });
  } catch {
    // Graceful degradation: deterministic rule-based briefing.
    const fallback = localBriefing(payload);
    const entry: CacheEntry = { insight: fallback, source: 'local', ts: Date.now() };
    cache.set(cacheKey, entry);
    return NextResponse.json({ insight: fallback, source: 'local' });
  }
}
