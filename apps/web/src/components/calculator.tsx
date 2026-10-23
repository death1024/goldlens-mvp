'use client';

import { useEffect, useMemo, useState } from 'react';
import { Info, RotateCcw } from 'lucide-react';
import {
  calcQuote, MARKETS, UNITS, type MarketCode, type WeightUnit
} from '@goldlens/core';
import { getIntlLocale } from '@goldlens/i18n';
import { formatMoney, formatNumber } from '@/lib/format';
import { useMarket } from './market-provider';
import { useI18n } from './locale-provider';
import { AIInput } from './ai-input';

const PURITIES = [0.965, 0.999, 0.9167, 0.75] as const;
const PURITY_LABEL: Record<string, string> = { '0.965': '96.5%', '0.999': '24K', '0.9167': '22K', '0.75': '18K' };
const UNIT_KEY: Record<WeightUnit, string> = { g: 'unitG', baht: 'unitBaht', tola: 'unitTola', oz: 'unitOz' };

export function Calculator({ compact = false }: { compact?: boolean }) {
  const { snapshot } = useMarket();
  const { t, locale } = useI18n();
  const intl = getIntlLocale(locale);
  const [market, setMarket] = useState<MarketCode>('TH');
  const [purity, setPurity] = useState(0.965);
  const [weight, setWeight] = useState(1);
  const [unit, setUnit] = useState<WeightUnit>('baht');
  const [making, setMaking] = useState(0);
  const [tax, setTax] = useState(0);
  const config = MARKETS[market];
  const marketName = t(`markets.${market}`);

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
  const unitLabel = t(`calc.${UNIT_KEY[unit]}`);
  const fairLabel = quote?.fairness.state === 'ok' ? t('calc.fairOk') : quote?.fairness.state === 'warn' ? t('calc.fairWarn') : t('calc.fairBad');

  return (
    <div className="calc-page">
      <section className="card card-pad">
        {!compact ? (
          <>
            <AIInput onApply={applyAI} />
            <p className="ai-note">{t('calc.aiNote')}</p>
          </>
        ) : null}

        <div className="field-block">
          <div className="field-label"><span>{t('calc.market')}</span><span className="tiny">{marketName}</span></div>
          <div className="chips">
            {(Object.keys(MARKETS) as MarketCode[]).map((code) => (
              <button key={code} type="button" className={`chip ${market === code ? 'active' : ''}`} onClick={() => setMarket(code)}>
                {t(`markets.${code}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="field-block">
          <div className="field-label"><span>{t('calc.purity')}</span><span className="tiny">{PURITY_LABEL[String(purity)] ?? `${(purity * 100).toFixed(1)}%`}</span></div>
          <div className="chips">
            {PURITIES.map((value) => (
              <button key={value} type="button" className={`chip ${purity === value ? 'active' : ''}`} onClick={() => setPurity(value)}>
                {PURITY_LABEL[String(value)]}
              </button>
            ))}
          </div>
        </div>

        <div className="field-block">
          <div className="field-label"><span>{t('calc.weight')}</span><span className="tiny">{formatNumber(quote?.grams ?? 0, 2, intl)} g</span></div>
          <div className="input-row">
            <input type="number" min="0.01" step="0.01" value={weight} onChange={(event) => setWeight(Math.max(0, Number(event.target.value) || 0))} aria-label={t('common.weight')} />
            <select value={unit} onChange={(event) => setUnit(event.target.value as WeightUnit)} aria-label={t('common.weight')}>
              {Object.keys(UNITS).map((code) => <option key={code} value={code}>{t(`calc.${UNIT_KEY[code as WeightUnit]}`)}</option>)}
            </select>
          </div>
        </div>

        <div className="field-block">
          <div className="field-label"><span>{t('calc.making')}</span><span className="gold">{formatNumber(making, 1, intl)}%</span></div>
          <input className="range" type="range" min="0" max="40" step="0.5" value={making} style={rangeStyle(making, 40)} onChange={(event) => setMaking(Number(event.target.value))} aria-label={t('calc.making')} />
          <div className="between tiny"><span>0%</span><span>20%</span><span>40%</span></div>
        </div>

        <div className="field-block">
          <div className="field-label"><span>{t('calc.tax')}</span><span className="gold">{formatNumber(tax, 1, intl)}%</span></div>
          <input className="range" type="range" min="0" max="20" step="0.5" value={tax} style={rangeStyle(tax, 20)} onChange={(event) => setTax(Number(event.target.value))} aria-label={t('calc.tax')} />
          <div className="between tiny"><span>0%</span><span>10%</span><span>20%</span></div>
        </div>

        <div className="row">
          <span className="badge green" style={{ flex: 1, minHeight: 42, display: 'flex', justifyContent: 'center' }}>{t('calc.updated')}</span>
          <button type="button" className="icon-btn" onClick={reset} title={t('calc.reset')}><RotateCcw size={15} /></button>
        </div>
        <p className="note" style={{ marginTop: 10 }}>{t('calc.localNote')}</p>
      </section>

      <section className="result" aria-live="polite">
        <div className="between" style={{ alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow">{t('calc.resultEyebrow')}</p>
            <h2 style={{ fontSize: 22 }}>{t('calc.resultTitle')}</h2>
          </div>
          {quote ? <span className={`badge ${quote.fairness.state === 'ok' ? 'green' : quote.fairness.state === 'warn' ? 'warn' : 'red'}`}>{fairLabel}</span> : null}
        </div>

        {quote ? (
          <>
            <div className="result-price" dir="ltr">{formatMoney(quote.total, quote.currency, quote.currency === 'USD' ? 2 : 0, intl)}</div>
            <div className="tiny">{t('calc.perUnit', { weight: formatNumber(weight, 2, intl), unit: unitLabel, purity: PURITY_LABEL[String(purity)] ?? '', market: marketName, ref: quote.isThaiReference ? t('calc.gtaRef') : t('calc.converted') })}</div>

            <div className="stack">
              <span style={{ width: `${(quote.metal / quote.total) * 100}%`, background: 'linear-gradient(90deg,#c9a44c,#e5c46b)' }} />
              <span style={{ width: `${(quote.making / quote.total) * 100}%`, background: '#7d8b72' }} />
              <span style={{ width: `${(quote.tax / quote.total) * 100}%`, background: '#a97f68' }} />
            </div>
            <div className="legend">
              <span><i style={{ background: '#e5c46b' }} />{t('calc.stackMetal', { value: formatMoney(quote.metal, quote.currency, undefined, intl) })}</span>
              <span><i style={{ background: '#7d8b72' }} />{t('calc.stackMaking', { value: formatMoney(quote.making, quote.currency, undefined, intl) })}</span>
              <span><i style={{ background: '#a97f68' }} />{t('calc.stackTax', { value: formatMoney(quote.tax, quote.currency, undefined, intl) })}</span>
            </div>

            <div className="result-metrics">
              <div className="result-metric"><span>{t('calc.vsMetal')}</span><strong>{quote.premiumPct > 0 ? '+' : ''}{quote.premiumPct.toFixed(1)}%</strong></div>
              <div className="result-metric"><span>{t('calc.buyback')}</span><strong>{formatMoney(quote.buyback, quote.currency, undefined, intl)}</strong></div>
              <div className="result-metric"><span>{t('calc.perGram')}</span><strong>{formatMoney(quote.perGram, quote.currency, undefined, intl)}</strong></div>
              <div className="result-metric"><span>{t('calc.breakEven')}</span><strong>{quote.breakEvenPct > 0 ? '+' : ''}{quote.breakEvenPct.toFixed(1)}%</strong></div>
            </div>

            <div className="loss">
              <span className="badge red">!</span>
              <div style={{ flex: 1 }}>
                <div className="tiny">{t('calc.lossTitle')}</div>
                <strong>{formatMoney(quote.instantLoss, quote.currency, undefined, intl)}</strong>
              </div>
              <span className="tiny" style={{ color: 'var(--red)' }}>{quote.lossPct.toFixed(1)}%</span>
            </div>
            <p className="insight">
              {quote.isThaiReference
                ? t('calc.insightThai', {
                    total: formatMoney(quote.total, quote.currency, undefined, intl),
                    metal: formatMoney(quote.metal, quote.currency, undefined, intl),
                    making: formatMoney(quote.making, quote.currency, undefined, intl),
                    loss: formatMoney(quote.instantLoss, quote.currency, undefined, intl),
                    pct: quote.breakEvenPct.toFixed(1)
                  })
                : t('calc.insightOther', {
                    premium: `${quote.premiumPct.toFixed(1)}%`,
                    spread: String(config.buybackSpreadPct),
                    loss: formatMoney(quote.instantLoss, quote.currency, undefined, intl)
                  })}
            </p>
          </>
        ) : (
          <div className="empty">{t('calc.invalid')}</div>
        )}
        <div className="row" style={{ marginTop: 16 }}>
          <span className="badge"><Info size={11} /> {t('calc.reference')}</span>
          <span className="tiny">{t('calc.source', { source: quote?.isThaiReference ? 'GTA' : t('calc.sourceSpot') })}</span>
        </div>
      </section>
    </div>
  );
}
