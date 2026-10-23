'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { MarketCode, WeightUnit } from '@goldlens/core';

export function AIInput({ onApply }: { onApply: (value: { market: MarketCode; weight: number; unit: WeightUnit; purity: number }) => void }) {
  const [text, setText] = useState('1 baht 96.5 今天曼谷买金');
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
      setSource(data.source === 'ai' ? 'AI 解析' : '规则解析');
    } catch {
      setError('暂时无法解析，请用下面的表单');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ai-input" onSubmit={submit}>
      <input value={text} onChange={(event) => setText(event.target.value)} aria-label="自然语言算账" placeholder="例如：1 baht 96.5 今天曼谷" />
      <button className="btn small primary" type="submit" disabled={loading}>
        <Sparkles size={14} />{loading ? '解析中' : '解析'}
      </button>
      {source ? <span className="badge green" style={{ alignSelf: 'center' }}>{source}</span> : null}
      {error ? <span className="badge red" style={{ alignSelf: 'center' }}>{error}</span> : null}
    </form>
  );
}
