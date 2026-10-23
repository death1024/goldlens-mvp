import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { Providers } from './providers';
import { AppShell } from '@/components/app-shell';
import { getDir, type Locale } from '@goldlens/i18n';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'GoldLens 金价透视 · 买金之前，先看清真实成本',
  description: '国际金价、本地柜台价、工费、税费、回购折价，放进同一张账单。',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'GoldLens' },
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  openGraph: {
    title: 'GoldLens 金价透视',
    description: '买金之前，先看清真实成本。',
    type: 'website',
    locale: 'zh_CN',
    images: ['/icon-512.png']
  }
};

export const viewport: Viewport = { themeColor: '#0a0c0b' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('gl_locale')?.value as Locale) || 'zh';
  return (
    <html lang={locale} dir={getDir(locale)}>
      <body>
        <Providers initialLocale={locale}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
