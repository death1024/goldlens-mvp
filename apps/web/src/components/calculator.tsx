'use client';

import { useEffect, useMemo, useState } from 'react';
import { Info, RotateCcw } from 'lucide-react';
import {
  calcQuote, MARKETS, UNITS, type MarketCode, type WeightUnit
} from '@goldlens/core';
import { formatMoney, formatNumber } from '@/lib/format';
import { useMarket } from './market-provider';
import { AIInput } from './ai-input';

const PURITIES = [0.965, 0.999, 0.9167, 0.75] as const;
const PURITY_LABEL: Record<string, string> = { '0.965': '96.5%', '0.999': '24K', '0.9167': '22K', '0.75': '18K' };

export function Calculator({ compact = false }: { compact?: boolean }) {
  const { snapshot } = useMarket();
  const [market, setMarket] = useState<MarketCode>('TH');
  const [purity, setPurity] = useState(0.965);
  const [weight, setWeight] = useState(1);
  const [unit, setUnit] = useState<WeightUnit>('baht');
  const [making, setMaking] = useState(0);
  const [tax, setTax] = useState(0);
  const config = MARKETS[market];

  useEffect(() => {
    setPurity(config.defaultPurity);
    setUnit(config.defaultUnit);
    setMaking(config.makingPct);
    setTax(config.taxPct);
    setWeight(1);
  }, [market, config]);

  const quote = useMemo(() => {
    try {
      return calcQuote({ market, purity, weight, unit, makingPct: making, taxPct: tax }, snapshot);
    } catch {
      return null;
    }
  }, [market, purity, weight, unit, making, tax, snapshot]);

  const applyAI = (value: { market: MarketCode; weight: number; unit: WeightUnit; purity: number }) => {
    setMarket(value.market);
    setWeight(value.weight);
    setUnit(value.unit);
    setPurity(value.purity);
  };

  const reset = () => {
    setPurity(config.defaultPurity);
    setUnit(config.defaultUnit);
    setMaking(config.makingPct);
    setTax(config.taxPct);
    setWeight(1);
  };

  const rangeStyle = (value: number, max: number) => ({ '--range-p': `${Math.min(100, (value / max) * 100)}%` } as React.CSSProperties);

  return (
    <div className="calc-page">
      <section className="card card-pad">
        {!compact ? (
          <>
            <AIInput onApply={applyAI} />
            <p className="ai-note">自然语言只负责提取参数，计算仍由 GoldLens 的确定性引擎完成；AI 不会给出买卖建议。</p>
          </>
        ) : null}

        <div className="field-block">
          <div className="field-label"><span>01 · 购买市场</span><span className="tiny">{config.name}</span></div>
          <div className="chips">
            {(Object.keys(MARKETS) as MarketCode[]).map((code) => (
              <button key={code} type="button" className={`chip ${market === code ? 'active' : ''}`} onClick={() => setMarket(code)}>
                {MARKETS[code].name}
              </button>
            ))}
          </div>
        </div>

        <div className="field-block">
          <div className="field-label"><span>02 · 纯度</span><span className="tiny">{PURITY_LABEL[String(purity)] ?? `${(purity * 100).toFixed(1)}%`}</span></div>
          <div className="chips">
            {PURITIES.map((value) => (
              <button key={value} type="button" className={`chip ${purity === value ? 'active' : ''}`} onClick={() => setPurity(value)}>
                {PURITY_LABEL[String(value)]}
              </button>
            ))}
          </div>
        </div>

        <div className="field-block">
          <div className="field-label"><span>03 · 重量</span><span className="tiny">{formatNumber(quote?.grams ?? 0, 2)} g</span></div>
          <div className="input-row">
            <input type="number" min="0.01" step="0.01" value={weight} onChange={(event) => setWeight(Math.max(0, Number(event.target.value) || 0))} aria-label="重量" />
            <select value={unit} onChange={(event) => setUnit(event.target.value as WeightUnit)} aria-label="重量单位">
              {Object.entries(UNITS).map(([code, item]) => <option key={code} value={code}>{item.label}</option>)}
            </select>
          </div>
        </div>

        <div className="field-block">
          <div className="field-label"><span>04 · 工费 / 设计溢价</span><span className="gold">{formatNumber(making, 1)}%</span></div>
          <input className="range" type="range" min="0" max="40" step="0.5" value={making} style={rangeStyle(making, 40)} onChange={(event) => setMaking(Number(event.target.value))} aria-label="工费百分比" />
          <div className="between tiny"><span>0%</span><span>20%</span><span>40%</span></div>
        </div>

        <div className="field-block">
          <div className="field-label"><span>05 · 税费</span><span className="gold">{formatNumber(tax, 1)}%</span></div>
          <input className="range" type="range" min="0" max="20" step="0.5" value={tax} style={rangeStyle(tax, 20)} onChange={(event) => setTax(Number(event.target.value))} aria-label="税费百分比" />
          <div className="between tiny"><span>0%</span><span>10%</span><span>20%</span></div>
        </div>

        <div className="row">
          <button type="button" className="btn primary" style={{ flex: 1 }} onClick={() => undefined}>账单已实时更新</button>
          <button type="button" className="icon-btn" onClick={reset} title="恢复默认"><RotateCcw size={15} /></button>
        </div>
        <p className="note" style={{ marginTop: 10 }}>本地金价与税费因门店、品类、政策而异。本工具用于建立价格锚点，不替代门店报价。</p>
      </section>

      <section className="result" aria-live="polite">
        <div className="between" style={{ alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow">ESTIMATED LANDED COST</p>
            <h2 style={{ fontSize: 22 }}>预计到手价</h2>
          </div>
          {quote ? <span className={`badge ${quote.fairness.state === 'ok' ? 'green' : quote.fairness.state === 'warn' ? 'warn' : 'red'}`}>{quote.fairness.label}</span> : null}
        </div>

        {quote ? (
          <>
            <div className="result-price">{formatMoney(quote.total, quote.currency, quote.currency === 'USD' ? 2 : 0)}</div>
            <div className="tiny">{formatNumber(weight, 2)} {UNITS[unit].label} · {PURITY_LABEL[String(purity)]} · {config.name}{quote.isThaiReference ? ' GTA 参考' : ' 折算'}</div>

            <div className="stack">
              <span style={{ width: `${(quote.metal / quote.total) * 100}%`, background: 'linear-gradient(90deg,#c9a44c,#e5c46b)' }} />
              <span style={{ width: `${(quote.making / quote.total) * 100}%`, background: '#7d8b72' }} />
              <span style={{ width: `${(quote.tax / quote.total) * 100}%`, background: '#a97f68' }} />
            </div>
            <div className="legend">
              <span><i style={{ background: '#e5c46b' }} />金料 {formatMoney(quote.metal, quote.currency)}</span>
              <span><i style={{ background: '#7d8b72' }} />工费 {formatMoney(quote.making, quote.currency)}</span>
              <span><i style={{ background: '#a97f68' }} />税费 {formatMoney(quote.tax, quote.currency)}</span>
            </div>

            <div className="result-metrics">
              <div className="result-metric"><span>对比金料价</span><strong>{quote.premiumPct > 0 ? '+' : ''}{quote.premiumPct.toFixed(1)}%</strong></div>
              <div className="result-metric"><span>即时回购</span><strong>{formatMoney(quote.buyback, quote.currency)}</strong></div>
              <div className="result-metric"><span>每克成本</span><strong>{formatMoney(quote.perGram, quote.currency)}</strong></div>
              <div className="result-metric"><span>回本需上涨</span><strong>{quote.breakEvenPct > 0 ? '+' : ''}{quote.breakEvenPct.toFixed(1)}%</strong></div>
            </div>

            <div className="loss">
              <span className="badge red">!</span>
              <div style={{ flex: 1 }}>
                <div className="tiny">一买一卖的隐形成本</div>
                <strong>{formatMoney(quote.instantLoss, quote.currency)}</strong>
              </div>
              <span className="tiny" style={{ color: 'var(--red)' }}>{quote.lossPct.toFixed(1)}%</span>
            </div>
            <p className="insight">
              {quote.isThaiReference
                ? `这 ${formatMoney(quote.total, quote.currency)} 里，金料 ${formatMoney(quote.metal, quote.currency)}，金饰溢价 ${formatMoney(quote.making, quote.currency)}。一买一卖先亏 ${formatMoney(quote.instantLoss, quote.currency)}，金价要涨 ${quote.breakEvenPct.toFixed(1)}% 才回本。`
                : `你付的价格比国际金料高 ${quote.premiumPct.toFixed(1)}%。回购按金料减 ${config.buybackSpreadPct}%，所以一买一卖先亏 ${formatMoney(quote.instantLoss, quote.currency)}。`}
            </p>
          </>
        ) : (
          <div className="empty">请输入有效重量后查看账单。</div>
        )}
        <div className="row" style={{ marginTop: 16 }}>
          <span className="badge"><Info size={11} /> 仅作参考</span>
          <span className="tiny">来源：{quote?.isThaiReference ? 'GTA' : '国际金价 + 汇率'} · 实时刷新</span>
        </div>
      </section>
    </div>
  );
}
