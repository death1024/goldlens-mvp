import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { AppShell } from '@/components/app-shell';
import { getI18n } from '@/lib/i18n-server';

export const viewport: Viewport = { themeColor: '#0a0c0b' };

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  const title = t('meta.title');
  const description = t('meta.description');
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title,
    description,
    manifest: '/manifest.webmanifest',
    appleWebApp: { capable: true, title: 'GoldLens' },
    icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
    openGraph: { title, description, type: 'website', locale: locale === 'zh' ? 'zh_CN' : locale === 'th' ? 'th_TH' : locale === 'ar' ? 'ar_AE' : 'en_US', images: ['/icon-512.png'] }
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dir } = await getI18n();
  return (
    <html lang={locale} dir={dir}>
      <body>
        <Providers initialLocale={locale}>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
