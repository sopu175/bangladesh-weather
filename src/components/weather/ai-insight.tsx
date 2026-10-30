'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AiInsightProps {
  insight: string | null;
  loading: boolean;
  source: 'ai' | 'local' | null;
  locationName: string;
}

export function AiInsight({ insight, loading, source, locationName }: AiInsightProps) {
  return (
    <Card className="border-white/15 bg-white/10 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold text-white">
          <Sparkles className="h-4 w-4 text-amber-300" aria-hidden />
          AI Forecast Briefing
          {source === 'ai' && !loading ? (
            <Badge className="border-0 bg-amber-300/20 text-amber-200 hover:bg-amber-300/20">
              Z.ai
            </Badge>
          ) : null}
          {source === 'local' && !loading ? (
            <Badge
              variant="outline"
              className="border-white/25 bg-transparent text-white/70"
            >
              Quick take
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading || !insight ? (
          <div className="space-y-2" aria-live="polite" aria-busy="true">
            <div className="h-3.5 w-11/12 animate-pulse rounded-full bg-white/20" />
            <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-white/20" />
            <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-white/20" />
            <span className="sr-only">Generating weather briefing for {locationName}</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.p
              key={insight.slice(0, 24)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-sm leading-relaxed text-white/90"
            >
              {insight}
            </motion.p>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
