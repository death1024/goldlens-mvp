import { cookies } from 'next/headers';
import {
  createTranslator,
  getDictionary,
  getDir,
  type Locale,
  type Translator
} from '@goldlens/i18n';

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get('gl_locale')?.value;
  return value === 'en' || value === 'th' || value === 'ar' ? value : 'zh';
}

export async function getI18n(): Promise<{
  locale: Locale;
  dir: 'ltr' | 'rtl';
  dict: ReturnType<typeof getDictionary>;
  t: Translator;
}> {
  const locale = await getLocale();
  return {
    locale,
    dir: getDir(locale),
    dict: getDictionary(locale),
    t: createTranslator(locale)
  };
}
