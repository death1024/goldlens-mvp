'use client';

import { useId } from 'react';
import { useI18n } from './locale-provider';

export function Sparkline({ points, height = 74 }: { points: { date: string; close: number }[]; height?: number }) {
  const id = useId().replace(/:/g, '');
  const { t } = useI18n();
  if (points.length < 2) return <div className="tiny" style={{ height }}>{t('common.noTrend')}</div>;
  const values = points.map((point) => point.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const width = 420;
  const pad = 4;
  const coords = points.map((point, index) => ({
    x: pad + (index / (points.length - 1)) * (width - pad * 2),
    y: pad + ((max - point.close) / span) * (height - pad * 2)
  }));
  const first = coords[0]!;
  let path = `M ${first.x} ${first.y}`;
  for (let i = 1; i < coords.length; i += 1) {
    const prev = coords[i - 1]!;
    const current = coords[i]!;
    const mid = (prev.x + current.x) / 2;
    path += ` C ${mid} ${prev.y}, ${mid} ${current.y}, ${current.x} ${current.y}`;
  }
  const last = coords[coords.length - 1]!;
  const area = `${path} L ${width - pad} ${height} L ${pad} ${height} Z`;
  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={t('common.priceTrend')}>
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e5c46b" stopOpacity=".32" />
          <stop offset="100%" stopColor="#e5c46b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#fill-${id})`} />
      <path d={path} fill="none" stroke="#e5c46b" strokeWidth="1.6" />
      <circle cx={last.x} cy={last.y} r="2.6" fill="#e5c46b" />
    </svg>
  );
}
