'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { MarketCode, WeightUnit } from '@goldlens/core';
import { useI18n } from './locale-provider';

export function AIInput({ onApply }: { onApply: (value: { market: MarketCode; weight: number; unit: WeightUnit; purity: number }) => void }) {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error('parse failed');
      const data = await response.json();
      onApply(data.parsed);
      setSource(data.source === 'ai' ? t('calc.aiSourceAI') : t('calc.aiSourceRules'));
    } catch {
      setError(t('calc.aiError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ai-input" onSubmit={submit}>
      <input value={text} onChange={(event) => setText(event.target.value)} aria-label={t('calc.aiPlaceholder')} placeholder={t('calc.aiPlaceholder')} />
      <button className="btn small primary" type="submit" disabled={loading}>
        <Sparkles size={14} />{loading ? t('calc.aiParsing') : t('calc.aiParse')}
      </button>
      {source ? <span className="badge green" style={{ alignSelf: 'center' }}>{source}</span> : null}
      {error ? <span className="badge red" style={{ alignSelf: 'center' }}>{error}</span> : null}
    </form>
  );
}
