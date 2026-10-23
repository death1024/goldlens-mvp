'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import fallback from '@/data/market-fallback.json';
import type { MarketData } from '@/lib/market';
import { getSnapshot } from '@/lib/market';

const initial = fallback as MarketData;
const MarketContext = createContext<{ data: MarketData; demo: boolean; refresh: () => void } | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<MarketData>(initial);
  const [demo, setDemo] = useState(true);

  const refresh = () => {
    fetch('/api/market', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('market unavailable');
        return response.json();
      })
      .then((next) => {
        setData(next);
        setDemo(Boolean(next.demo));
      })
      .catch(() => setDemo(true));
  };

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 60_000);
    return () => clearInterval(timer);
  }, []);

  const value = useMemo(() => ({ data, demo, refresh }), [data, demo]);
  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used inside MarketProvider');
  return { ...context, snapshot: getSnapshot(context.data) };
}
