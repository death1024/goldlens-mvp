'use client';

import Link from 'next/link';
import {
  ArrowRight, Bell, Calculator as CalcIcon, ChartNoAxesCombined,
  Globe2, ShieldCheck, Sparkles, WalletCards
} from 'lucide-react';
import { calcQuote, MARKETS, type MarketCode } from '@goldlens/core';
import { useMarket } from '@/components/market-provider';
import { Calculator } from '@/components/calculator';
import { Sparkline } from '@/components/sparkline';
import { formatMoney, formatNumber, formatPct } from '@/lib/format';

export default function HomePage() {
  const { data, demo, snapshot } = useMarket();
  const change = data.futures.changePct ?? 0;
  const thai = calcQuote({ market: 'TH', purity: 0.965, weight: 1, unit: 'baht' }, snapshot);
  const marketRows = (Object.keys(MARKETS) as MarketCode[]).map((code) => {
    const config = MARKETS[code];
    const quote = calcQuote({ market: code, purity: config.defaultPurity, weight: 1, unit: 'g' }, snapshot);
    return { code, config, quote };
  });
  const spread = (data.thai?.ornamentSell ?? 0) - (data.thai?.ornamentBuy ?? 0);
  const spreadPct = data.thai?.ornamentSell ? (spread / data.thai.ornamentSell) * 100 : 0;

  return (
    <>
      <section className="hero">
        <div className="hero-main">
          <div className="between" style={{ alignItems: 'flex-start' }}>
            <div className="eyebrow"><span className="eyebrow-line" />XAU / USD · 国际现货黄金</div>
            <span className={`badge ${demo ? 'warn' : 'green'}`}>{demo ? 'DEMO SNAPSHOT' : 'LIVE'}</span>
          </div>
          <div className="hero-price">
            ${formatNumber(data.spot.usdOz, 2)}<small>/ oz</small>
          </div>
          <div className="hero-delta">
            <span className={change >= 0 ? 'positive' : 'negative'}>{change >= 0 ? '↑' : '↓'} {formatPct(change, 2)}</span>
            <span className="tiny">日内参考 · COMEX 主力</span>
          </div>
          <h1>买金之前，<br /><em>先看清真实成本。</em></h1>
          <p>把国际金价、本地柜台价、工费、税费和回购折价，放进同一张账单。你付的，远不止金价。</p>
          <div className="hero-actions">
            <Link href="/calculate" className="btn primary">算一笔真实成本 <ArrowRight size={16} /></Link>
            <Link href="/compare" className="btn ghost">对比四个市场</Link>
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <span className="tiny">更新于 {new Date(data.updatedAt).toLocaleString('zh-CN')}</span>
            <span className="tiny">·</span>
            <span className="tiny">{4 - data.degraded.length} 个数据源</span>
          </div>
        </div>

        <div className="hero-side">
          <div className="price-panel">
            <div className="between">
              <div>
                <p className="eyebrow">BANGKOK · TODAY</p>
                <h2>泰国金价</h2>
              </div>
              <span className="badge gold">GTA 官方参考</span>
            </div>
            <div className="price-grid">
              <div className="price-cell"><span>金条 96.5% · 卖出</span><strong>{formatMoney(data.thai?.barSell ?? 0, 'THB')}</strong><small>/ บาท</small></div>
              <div className="price-cell"><span>金饰 96.5% · 卖出</span><strong>{formatMoney(data.thai?.ornamentSell ?? 0, 'THB')}</strong><small>/ บาท</small></div>
              <div className="price-cell"><span>金条 · 回购</span><strong>{formatMoney(data.thai?.barBuy ?? 0, 'THB')}</strong><small>/ บาท</small></div>
              <div className="price-cell"><span>金饰 · 回购</span><strong>{formatMoney(data.thai?.ornamentBuy ?? 0, 'THB')}</strong><small>/ บาท</small></div>
            </div>
            <div className="spread"><span className="gold">↕</span><span>金饰一买一卖，价差 <b>{formatMoney(spread, 'THB')}</b>，约 <b>{spreadPct.toFixed(1)}%</b></span></div>
            <div className="divider" />
            <div className="spark-head"><span>国际金价 · 近 30 天</span><span>{formatPct(((data.futures.history.at(-1)?.close ?? 0) / (data.futures.history.at(-30)?.close ?? 1) - 1) * 100, 1)}</span></div>
            <Sparkline points={data.futures.history.slice(-30)} />
          </div>
          <div className="card card-pad" style={{ padding: 16 }}>
            <div className="between">
              <span className="panel-title">Quick read</span>
              <span className="badge">96.5% / baht</span>
            </div>
            <div className="row" style={{ marginTop: 10, alignItems: 'baseline' }}>
              <strong style={{ fontFamily: 'var(--serif)', fontSize: 30, fontWeight: 400 }}>{formatMoney(thai.total, 'THB')}</strong>
              <span className="tiny">1 baht 金饰预估</span>
            </div>
            <div className="tiny" style={{ marginTop: 4 }}>回购约 {formatMoney(thai.buyback, 'THB')} · 回本需 {thai.breakEvenPct.toFixed(1)}%</div>
          </div>
        </div>
      </section>

      <div className="kpi-row">
        <div className="kpi"><span>泰国金饰隐形成本</span><strong>{formatMoney(thai.instantLoss, 'THB')}</strong></div>
        <div className="kpi"><span>金饰溢价</span><strong>{formatMoney(thai.making, 'THB')}</strong></div>
        <div className="kpi"><span>美元 / 泰铢</span><strong>{formatNumber(data.fx.rates.THB ?? 0, 3)}</strong></div>
        <div className="kpi"><span>数据降级</span><strong>{data.degraded.length === 0 ? '正常' : data.degraded.join(' · ')}</strong></div>
      </div>

      <section className="card card-pad quick-calc">
        <div className="between" style={{ marginBottom: 16 }}>
          <div>
            <p className="eyebrow">TRUE COST · LIVE</p>
            <h2 className="section-title">一块金，到底值多少？</h2>
          </div>
          <Link href="/calculate" className="btn small ghost">完整计算器</Link>
        </div>
        <Calculator compact />
      </section>

      <section style={{ marginTop: 26 }}>
        <div className="between" style={{ marginBottom: 12 }}>
          <div>
            <p className="eyebrow">MARKET PULSE</p>
            <h2 className="section-title">四个市场，同口径</h2>
          </div>
          <span className="tiny">1g · 当地默认纯度 · 含默认工费/税</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>市场</th><th>纯度</th><th>到手价 / g</th><th>回购 / g</th><th>回本需上涨</th><th>数据</th></tr></thead>
            <tbody>
              {marketRows.map(({ code, config, quote }) => (
                <tr key={code}>
                  <td><strong>{config.name}</strong><span className="tiny" style={{ display: 'block' }}>{config.currency}</span></td>
                  <td>{config.defaultPurity === 0.965 ? '96.5%' : config.defaultPurity === 0.9167 ? '22K' : config.defaultPurity === 0.999 ? '24K' : '18K'}</td>
                  <td><strong>{formatMoney(quote.total, config.currency)}</strong></td>
                  <td>{formatMoney(quote.buyback, config.currency)}</td>
                  <td className={quote.breakEvenPct > 5 ? 'negative' : 'positive'}>{formatPct(quote.breakEvenPct, 1)}</td>
                  <td><span className={`badge ${demo ? 'warn' : 'green'}`}>{demo ? 'snapshot' : 'live'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <div className="between" style={{ marginBottom: 12 }}>
          <div>
            <p className="eyebrow">WHAT YOU CAN DO</p>
            <h2 className="section-title">从“看一眼”到“做决定”</h2>
          </div>
        </div>
        <div className="feature-grid">
          <Link href="/calculate" className="feature"><CalcIcon /><h3>真实成本计算</h3><p>金料、工费、税、回购、回本点，一张账单。</p></Link>
          <Link href="/compare" className="feature"><Globe2 /><h3>跨市场对比</h3><p>泰国、阿联酋、印度、美国，统一单位与口径。</p></Link>
          <Link href="/portfolio" className="feature"><WalletCards /><h3>持仓与回购</h3><p>本地优先，按今日回购价估值。</p></Link>
          <Link href="/alerts" className="feature"><Bell /><h3>价格提醒</h3><p>设一个目标价，不用一直刷。</p></Link>
          <Link href="/quotes" className="feature"><ShieldCheck /><h3>Dealer 询价</h3><p>把结构化需求发给已验证门店，拿到可比较报价。</p></Link>
          <Link href="/calculate" className="feature"><Sparkles /><h3>AI 录入</h3><p>一句话或一张收据，转成结构化参数，计算仍由引擎完成。</p></Link>
        </div>
      </section>

      <section style={{ marginTop: 28 }} className="card card-pad">
        <div className="between">
          <div>
            <p className="eyebrow">HOW IT WORKS</p>
            <h2 className="section-title">这只是开始</h2>
            <p className="section-sub" style={{ marginTop: 6 }}>当前是 v2.1 的可运行切片：真实价格、真实计算、真实 Dealer 数据。下一步是账户、同步、Inngest 工作流与 AI 抽取的全面上线。</p>
          </div>
          <ChartNoAxesCombined size={42} className="gold" />
        </div>
      </section>
    </>
  );
}
