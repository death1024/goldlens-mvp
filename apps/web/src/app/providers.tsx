'use client';

import { SessionProvider } from 'next-auth/react';
import { LocaleProvider } from '@/components/locale-provider';
import { MarketProvider } from '@/components/market-provider';
import { PwaRegister } from '@/components/pwa-register';
import type { Locale } from '@goldlens/i18n';

export function Providers({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  return (
    <SessionProvider>
      <LocaleProvider initialLocale={initialLocale}>
        <MarketProvider>
          <PwaRegister />
          {children}
        </MarketProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
