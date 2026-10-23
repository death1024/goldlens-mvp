import { describe, expect, it } from 'vitest';
import { getArticles, messages, translate, type Locale } from '@goldlens/i18n';

function flatten(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key));
}

describe('i18n coverage', () => {
  it('has the same key tree in all four locales', () => {
    const keys = flatten(messages.zh).sort();
    for (const locale of ['en', 'th', 'ar'] as Locale[]) {
      expect(flatten(messages[locale]).sort(), locale).toEqual(keys);
    }
  });

  it('translates every key without returning the raw key', () => {
    for (const locale of ['en', 'th', 'ar'] as Locale[]) {
      for (const key of flatten(messages.zh)) {
        const value = translate(locale, key);
        expect(value, `${locale}:${key}`).not.toBe(key);
        expect(value.length, `${locale}:${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('ships six translated learn articles in each locale', () => {
    for (const locale of ['zh', 'en', 'th', 'ar'] as Locale[]) {
      const articles = getArticles(locale);
      expect(articles).toHaveLength(6);
      for (const article of articles) {
        expect(article.title.length).toBeGreaterThan(0);
        expect(article.body.length).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
