const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const MARKETS = {
  TH: {
    name: '泰国', currency: 'THB', locale: 'en-US', digits: 0,
    defaultPurity: 0.965, defaultUnit: 'baht', making: 0, tax: 0,
    buybackSpread: 0, hint: 'GTA 本地参考价',
    fair: [2, 5, 10], fairLabels: ['接近金条价', '正常金饰溢价', '溢价偏高', '明显偏高']
  },
  AE: {
    name: '阿联酋', currency: 'AED', locale: 'en-US', digits: 0,
    defaultPurity: 0.9167, defaultUnit: 'g', making: 12, tax: 5,
    buybackSpread: 3, hint: '按迪拜 22K 折算',
    fair: [10, 20, 30], fairLabels: ['接近金料价', '正常零售区间', '溢价偏高', '明显偏高']
  },
  IN: {
    name: '印度', currency: 'INR', locale: 'en-US', digits: 0,
    defaultPurity: 0.9167, defaultUnit: 'g', making: 12, tax: 3,
    buybackSpread: 4, hint: '按印度 22K 折算',
    fair: [10, 20, 30], fairLabels: ['接近金料价', '正常零售区间', '溢价偏高', '明显偏高']
  },
  US: {
    name: '美国', currency: 'USD', locale: 'en-US', digits: 2,
    defaultPurity: 0.999, defaultUnit: 'oz', making: 8, tax: 0,
    buybackSpread: 2, hint: '按国际金价折算',
    fair: [8, 15, 25], fairLabels: ['接近金料价', '正常零售区间', '溢价偏高', '明显偏高']
  }
};

const UNITS = {
  baht: { label: 'บาท', short: 'baht', grams: 15.244 },
  g: { label: '克', short: 'g', grams: 1 },
  tola: { label: '托拉', short: 'tola', grams: 11.6638125 },
  oz: { label: '盎司', short: 'oz', grams: 31.1034768 }
};

const PURITY_LABEL = { '0.999': '24K', '0.9167': '22K', '0.75': '18K', '0.965': '96.5%' };
const OZ_GRAMS = 31.1034768;
const BAHT_GRAMS = 15.244;
const STORAGE_HOLDINGS = 'goldlens.holdings.v1';
const STORAGE_ALERTS = 'goldlens.alerts.v1';

const state = {
  data: null,
  market: 'TH',
  purity: 0.965,
  weight: 1,
  unit: 'baht',
  making: 0,
  tax: 0,
  range: 30,
  demo: false,
  holdings: loadJson(STORAGE_HOLDINGS, []),
  alerts: loadJson(STORAGE_ALERTS, [])
};

function loadJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function numberFormat(value, digits = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(Number.isFinite(value) ? value : 0);
}

function money(value, currency = 'USD', digits) {
  if (!Number.isFinite(value)) return '—';
  const fractionDigits = digits ?? (currency === 'USD' ? 2 : 0);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(value);
  } catch {
    return `${numberFormat(value, fractionDigits)} ${currency}`;
  }
}

function pct(value, digits = 2) {
  if (!Number.isFinite(value)) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`;
}

function shortDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
}

function dateLabel(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function currentFx(market = state.market) {
  return state.data?.fx?.rates?.[MARKETS[market].currency] || null;
}

function spotUsdOz() {
  return Number(state.data?.spot?.usdOz) || 0;
}

function spotPerGramLocal(market = state.market) {
  const fx = currentFx(market);
  if (!fx || !spotUsdOz()) return 0;
  return (spotUsdOz() / OZ_GRAMS) * fx;
}

function purityFactor(purity = state.purity) {
  return Number(purity) || 0;
}

function weightInGrams(weight = state.weight, unit = state.unit) {
  return Math.max(0, Number(weight) || 0) * UNITS[unit].grams;
}

function marketWeightInBaht(weight = state.weight, unit = state.unit) {
  return weightInGrams(weight, unit) / BAHT_GRAMS;
}

function calculate(overrides = {}) {
  const market = overrides.market ?? state.market;
  const purity = Number(overrides.purity ?? state.purity);
  const weight = Math.max(0, Number(overrides.weight ?? state.weight) || 0);
  const unit = overrides.unit ?? state.unit;
  const making = Math.max(0, Number(overrides.making ?? state.making) || 0);
  const tax = Math.max(0, Number(overrides.tax ?? state.tax) || 0);
  const config = MARKETS[market];
  const grams = weightInGrams(weight, unit);
  const bahtWeight = grams / BAHT_GRAMS;
  const fx = currentFx(market);
  const spotGram = spotPerGramLocal(market);
  const purityValue = purity;

  const spotMetal = spotGram * grams * purityValue;
  const thai = state.data?.thai;
  const isThaiReference = market === 'TH' && purity === 0.965 && thai;

  const metalValue = isThaiReference
    ? Number(thai.barSell) * bahtWeight
    : spotMetal;

  const baseRetail = isThaiReference
    ? Number(thai.ornamentSell) * bahtWeight
    : spotMetal;

  const makingValue = isThaiReference
    ? (baseRetail - metalValue) + baseRetail * (making / 100)
    : metalValue * (making / 100);

  const taxValue = (metalValue + makingValue) * (tax / 100);
  const total = metalValue + makingValue + taxValue;

  let buyback = 0;
  if (isThaiReference) {
    buyback = Number(thai.ornamentBuy) * bahtWeight;
  } else {
    buyback = spotMetal * (1 - config.buybackSpread / 100);
  }

  const instantLoss = total - buyback;
  const lossPct = total > 0 ? (instantLoss / total) * 100 : 0;
  const breakEvenPct = buyback > 0 ? (total / buyback - 1) * 100 : 0;
  const premiumPct = spotMetal > 0 ? (total / spotMetal - 1) * 100 : 0;
  const perGram = grams > 0 ? total / grams : 0;

  return {
    market, purity, weight, unit, making, tax, config, grams, bahtWeight, fx,
    spotMetal, metalValue, baseRetail, makingValue, taxValue, total, buyback,
    instantLoss, lossPct, breakEvenPct, premiumPct, perGram, isThaiReference,
    currency: config.currency
  };
}

function fairness(result) {
  const config = result.config;
  const premium = result.premiumPct;
  const [low, mid, high] = config.fair;
  let index = 3;
  if (premium <= low) index = 0;
  else if (premium <= mid) index = 1;
  else if (premium <= high) index = 2;
  return {
    label: config.fairLabels[index],
    state: index <= 1 ? 'ok' : index === 2 ? 'warn' : 'bad'
  };
}

/* ---------- boot ---------- */

async function boot() {
  bindEvents();
  applyMarketDefaults('TH', false);
  renderHoldings();
  renderAlerts();
  registerPwa();
  try {
    await loadMarket();
  } catch (error) {
    console.error(error);
    setStatus('error', '离线');
    showToast('市场数据暂时不可用，请稍后刷新');
  }
  setInterval(() => {
    if (state.demo) return;
    loadMarket(true).catch((error) => console.warn('[goldlens] refresh failed', error));
  }, 60_000);
  window.addEventListener('online', () => {
    if (state.demo) loadMarket(true).catch(() => {});
  });
}

function registerPwa() {
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.warn('[goldlens] service worker registration failed', error);
      });
    });
  }

  const installBtn = $('#installBtn');
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (installBtn) installBtn.hidden = false;
  });
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } finally {
        deferredPrompt = null;
        installBtn.hidden = true;
      }
    });
  }
  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.hidden = true;
    showToast('GoldLens 已安装到桌面');
  });
}

async function loadMarket(silent = false) {
  let data = null;
  try {
    const response = await fetch('./api/market', {
      headers: { accept: 'application/json' },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`market endpoint ${response.status}`);
    data = await response.json();
    if (!data?.spot?.usdOz) throw new Error('invalid market data');
    state.demo = false;
  } catch (error) {
    console.warn('[goldlens] live API unavailable, using static snapshot', error);
    const response = await fetch('./data/market.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`static snapshot ${response.status}`);
    data = await response.json();
    if (!data?.spot?.usdOz) throw new Error('invalid static market data');
    state.demo = true;
    data.degraded = [...new Set([...(data.degraded || []), 'static'])];
  }

  state.data = data;
  renderAll();
  const degraded = new Set(data.degraded || []);
  const coreDegraded = ['spot', 'fx', 'gta'].filter((key) => degraded.has(key));
  if (state.demo) setStatus('degraded', 'DEMO');
  else if (coreDegraded.length === 0) setStatus('ok', 'LIVE');
  else if (coreDegraded.length >= 2) setStatus('error', '缓存');
  else setStatus('degraded', '缓存');
  if (!silent && state.demo) showToast('当前为静态演示数据；启动 Node 服务可获取实时行情');
  else if (!silent && degraded.has('gta')) showToast('泰国 GTA 暂未更新，已使用最近快照');
  checkAlerts();
}

function setStatus(mode, text) {
  const pill = $('#livePill');
  pill.classList.remove('degraded', 'error');
  if (mode !== 'ok') pill.classList.add(mode === 'error' ? 'error' : 'degraded');
  $('#liveText').textContent = text;
}

/* ---------- render ---------- */

function renderAll() {
  renderHero();
  renderTicker();
  renderCalculator();
  renderChart();
  renderHoldings();
  renderAlerts();
  renderSources();
}

function renderHero() {
  const data = state.data;
  if (!data) return;
  const spot = Number(data.spot.usdOz);
  $('#spotPrice').textContent = numberFormat(spot, 2);
  $('#alertCurrent').textContent = money(spot, 'USD', 2);
  $('#sourceCount').textContent = state.demo ? '静态演示快照' : `${4 - new Set(data.degraded || []).size} 个数据源`;

  const change = Number(data.futures?.changePct);
  const delta = $('#spotDelta');
  delta.classList.remove('up', 'down', 'neutral');
  if (Number.isFinite(change)) {
    delta.classList.add(change > 0 ? 'up' : change < 0 ? 'down' : 'neutral');
    const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
    delta.textContent = `${arrow} ${pct(change)} · ${money(Math.abs(Number(data.futures.changeAbs) || 0), 'USD', 2)}`;
  } else {
    delta.classList.add('neutral');
    delta.textContent = '暂无日内变动';
  }

  $('#updatedAt').textContent = `更新于 ${shortDate(data.updatedAt)}`;
  $('#thaiAsOf').textContent = data.thai?.asOf
    ? `GTA 更新：${data.thai.asOf} · 当地公告`
    : 'GTA 数据暂不可用';

  const thai = data.thai;
  if (thai) {
    $('#thaiBarSell').textContent = money(thai.barSell, 'THB', 0);
    $('#thaiOrnamentSell').textContent = money(thai.ornamentSell, 'THB', 0);
    $('#thaiBarBuy').textContent = money(thai.barBuy, 'THB', 0);
    $('#thaiOrnamentBuy').textContent = money(thai.ornamentBuy, 'THB', 0);
    const spread = Number(thai.ornamentSell) - Number(thai.ornamentBuy);
    const spreadPct = Number(thai.ornamentSell) > 0 ? (spread / Number(thai.ornamentSell)) * 100 : 0;
    $('#thaiSpread').textContent = money(spread, 'THB', 0);
    $('#thaiSpreadPct').textContent = `${spreadPct.toFixed(1)}%`;
    const timeMatch = String(thai.asOf || '').match(/เวลา\s*([\d:]+)/);
    $('#thaiAsOf').textContent = timeMatch
      ? `GTA 更新 ${timeMatch[1]} · 当地公告`
      : 'GTA 今日公告';
  }

  renderMiniChart(data.futures?.history || []);
}

function renderMiniChart(history) {
  const svg = $('#miniChart');
  const points = history.slice(-30);
  if (points.length < 2) {
    svg.innerHTML = '<text x="210" y="64" text-anchor="middle" fill="#74786c" font-size="10">暂无走势数据</text>';
    $('#miniRange').textContent = '—';
    return;
  }
  const values = points.map((point) => Number(point.close));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const width = 420;
  const height = 120;
  const pad = 5;
  const coords = points.map((point, index) => ({
    x: pad + (index / (points.length - 1)) * (width - pad * 2),
    y: pad + ((max - Number(point.close)) / span) * (height - pad * 2)
  }));
  const line = smoothPath(coords);
  const area = `${line} L ${width - pad} ${height} L ${pad} ${height} Z`;
  const first = values[0];
  const last = values.at(-1);
  const change = first ? ((last - first) / first) * 100 : 0;
  $('#miniRange').textContent = `${pct(change, 1)} · 30D`;
  svg.innerHTML = `
    <defs>
      <linearGradient id="miniFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e5c46b" stop-opacity=".34"/>
        <stop offset="100%" stop-color="#e5c46b" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path class="mini-area" d="${area}"/>
    <path class="mini-line" d="${line}"/>
    <circle cx="${coords.at(-1).x}" cy="${coords.at(-1).y}" r="2.6" fill="#e5c46b"/>
  `;
}

function renderTicker() {
  const data = state.data;
  if (!data) return;
  const aed = spotPerGramLocal('AE') * 0.9167;
  const inr = spotPerGramLocal('IN') * 0.9167;
  const thb = Number(data.thai?.barSell);
  $('#tickerAe').textContent = money(aed, 'AED', 0);
  $('#tickerIn').textContent = money(inr, 'INR', 0);
  $('#tickerTh').textContent = Number.isFinite(thb) ? money(thb, 'THB', 0) : '—';
  $('#tickerSpotG').textContent = money(spotUsdOz() / OZ_GRAMS, 'USD', 2);
}

function renderCalculator() {
  const result = calculate();
  const config = result.config;

  $('#marketHint').textContent = config.hint;
  $('#makingPctLabel').textContent = numberFormat(result.making, result.making % 1 ? 1 : 0);
  $('#taxPctLabel').textContent = numberFormat(result.tax, result.tax % 1 ? 1 : 0);
  $('#making').value = result.making;
  $('#tax').value = result.tax;
  updateRangeFill($('#making'));
  updateRangeFill($('#tax'));

  $('#totalPrice').textContent = money(result.total, result.currency, config.digits);
  const unitLabel = UNITS[result.unit].label;
  $('#priceSub').textContent = `${numberFormat(result.weight, 2)} ${unitLabel} · ${PURITY_LABEL[String(result.purity)] || `${(result.purity * 100).toFixed(1)}%`} · ${config.name}${result.isThaiReference ? ' GTA 参考' : ' 折算'}`;

  $('#metalValue').textContent = money(result.metalValue, result.currency, config.digits);
  $('#makingValue').textContent = money(result.makingValue, result.currency, config.digits);
  $('#taxValue').textContent = money(result.taxValue, result.currency, config.digits);

  const bar = $('#stackBar');
  const total = result.total || 1;
  bar.children[0].style.width = `${clamp((result.metalValue / total) * 100, 0, 100)}%`;
  bar.children[1].style.width = `${clamp((result.makingValue / total) * 100, 0, 100)}%`;
  bar.children[2].style.width = `${clamp((result.taxValue / total) * 100, 0, 100)}%`;

  $('#premiumPct').textContent = pct(result.premiumPct, 1);
  $('#premiumHint').textContent = `金料 ${money(result.spotMetal, result.currency, config.digits)}`;
  $('#buyback').textContent = money(result.buyback, result.currency, config.digits);
  $('#buybackHint').textContent = result.isThaiReference
    ? 'GTA 金饰回购价'
    : `扣 ${config.buybackSpread}% 回购折价`;
  $('#perGram').textContent = money(result.perGram, result.currency, config.digits);
  $('#perGramHint').textContent = `按 ${numberFormat(result.grams, 2)} g 毛重`;
  $('#breakEven').textContent = pct(result.breakEvenPct, 1);
  $('#instantLoss').textContent = money(result.instantLoss, result.currency, config.digits);
  $('#lossPct').textContent = `${result.lossPct.toFixed(1)}%`;

  const fair = fairness(result);
  const badge = $('#fairBadge');
  badge.textContent = fair.label;
  badge.className = `fair-badge ${fair.state === 'ok' ? '' : fair.state}`;

  const metalShare = result.total > 0 ? (result.metalValue / result.total) * 100 : 0;
  const makingShare = result.total > 0 ? (result.makingValue / result.total) * 100 : 0;
  const taxShare = result.total > 0 ? (result.taxValue / result.total) * 100 : 0;

  if (result.isThaiReference) {
    const ornamentPremium = result.baseRetail - result.metalValue;
    $('#insight').textContent = `这 ${money(result.total, result.currency, 0)} 里，金料 ${money(result.metalValue, result.currency, 0)}，金饰相对金条的溢价 ${money(ornamentPremium, result.currency, 0)}，占 ${(result.premiumPct).toFixed(1)}%。一买一卖先亏 ${money(result.instantLoss, result.currency, 0)}，金价要涨 ${result.breakEvenPct.toFixed(1)}% 才回本。`;
  } else {
    $('#insight').textContent = `你付的价格比国际金料高 ${result.premiumPct.toFixed(1)}%，其中金料占 ${metalShare.toFixed(0)}%、工费/溢价占 ${makingShare.toFixed(0)}%、税费占 ${taxShare.toFixed(0)}%。回购只按金料减 ${config.buybackSpread}%，一买一卖先亏 ${money(result.instantLoss, result.currency, 0)}。`;
  }

  renderNegotiation(result);
}

function renderNegotiation(result) {
  const chips = [];
  const base = result.baseRetail || result.metalValue;
  if (result.isThaiReference) {
    chips.push(`金条价 ${money(result.metalValue, result.currency, 0)}`);
    chips.push(`金饰溢价 ${money(result.baseRetail - result.metalValue, result.currency, 0)}`);
    chips.push(`回购折价 ${money(result.total - result.buyback, result.currency, 0)}`);
    $('#negText').textContent = 'GTA 金饰价已经包含标准工费。真正的议价空间，通常在额外设计费、以旧换新折价和门店回购政策里。';
  } else {
    const perPoint = base / 100;
    chips.push(`工费每降 1% ≈ 省 ${money(perPoint, result.currency, 0)}`);
    if (result.tax > 0) chips.push(`税费 ${result.tax}% ≈ ${money(result.taxValue, result.currency, 0)}`);
    chips.push(`回购折价 ${result.config.buybackSpread}%`);
    const targetMaking = Math.max(0, result.making - 4);
    const saving = base * ((result.making - targetMaking) / 100);
    $('#negText').textContent = saving > 0
      ? `如果工费从 ${numberFormat(result.making, 0)}% 谈到 ${numberFormat(targetMaking, 0)}%，大约可以少付 ${money(saving, result.currency, 0)}。先把工费和回购价分开问，再谈总价。`
      : '先把金料、工费、税费和回购价分开问。总价看起来便宜，不一定代表你买得便宜。';
  }
  $('#negChips').innerHTML = chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('');
}

function updateRangeFill(input) {
  if (!input) return;
  const min = Number(input.min) || 0;
  const max = Number(input.max) || 100;
  const value = Number(input.value) || 0;
  const share = ((value - min) / (max - min)) * 100;
  input.style.setProperty('--range-p', `${clamp(share, 0, 100)}%`);
}

/* ---------- price chart ---------- */

function renderChart() {
  const history = state.data?.futures?.history || [];
  const points = history.slice(-state.range);
  const svg = $('#priceChart');
  if (points.length < 2) {
    svg.innerHTML = '<text x="400" y="150" text-anchor="middle" fill="#74786c" font-size="12">暂无足够的历史数据</text>';
    $('#rangeChange').textContent = '—';
    $('#rangeAvg').textContent = '—';
    $('#rangeHighLow').textContent = '—';
    $('#vsAvg').textContent = '—';
    return;
  }
  const values = points.map((point) => Number(point.close));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.15 || 10;
  const low = minValue - padding;
  const high = maxValue + padding;
  const span = high - low || 1;
  const width = 800;
  const height = 300;
  const pad = { top: 18, right: 62, bottom: 30, left: 8 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const x = (index) => pad.left + (index / (points.length - 1)) * plotW;
  const y = (value) => pad.top + ((high - value) / span) * plotH;

  const coords = points.map((point, index) => ({ x: x(index), y: y(Number(point.close)) }));
  const line = smoothPath(coords);
  const area = `${line} L ${coords.at(-1).x} ${height - pad.bottom} L ${coords[0].x} ${height - pad.bottom} Z`;

  const gridCount = 4;
  const gridLines = [];
  for (let i = 0; i <= gridCount; i += 1) {
    const value = low + (span * i) / gridCount;
    const yy = y(value);
    gridLines.push(`<line class="grid-line" x1="${pad.left}" y1="${yy}" x2="${width - pad.right}" y2="${yy}"/>`);
    gridLines.push(`<text class="axis-label" x="${width - pad.right + 8}" y="${yy + 3}">${numberFormat(value, 0)}</text>`);
  }

  const labelIndices = [0, Math.floor((points.length - 1) / 2), points.length - 1];
  const xLabels = labelIndices.map((index) => `
    <text class="axis-label" x="${x(index)}" y="${height - 8}" text-anchor="${index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}">${dateLabel(points[index].date)}</text>
  `).join('');

  const last = coords.at(-1);
  svg.innerHTML = `
    <defs>
      <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e5c46b" stop-opacity=".28"/>
        <stop offset="100%" stop-color="#e5c46b" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${gridLines.join('')}
    <path class="price-area" d="${area}"/>
    <path class="price-line" d="${line}"/>
    <circle cx="${last.x}" cy="${last.y}" r="3.2" fill="#e5c46b"/>
    <line id="hoverLine" x1="0" y1="${pad.top}" x2="0" y2="${height - pad.bottom}" stroke="rgba(229,196,107,.45)" stroke-width="1" stroke-dasharray="3 3" opacity="0"/>
    <circle id="hoverDot" cx="0" cy="0" r="3.6" fill="#0a0c0b" stroke="#e5c46b" stroke-width="1.5" opacity="0"/>
    <rect id="chartHit" x="${pad.left}" y="${pad.top}" width="${plotW}" height="${plotH}" fill="transparent" style="cursor:crosshair"/>
    ${xLabels}
  `;

  const first = values[0];
  const lastValue = values.at(-1);
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  $('#chartPrice').textContent = money(lastValue, 'USD', 2);
  $('#chartMeta').textContent = `COMEX 黄金主力 · ${state.range === 365 ? '近 1 年' : `近 ${state.range} 天`} · USD / oz`;
  $('#rangeChange').textContent = pct(((lastValue - first) / first) * 100);
  $('#rangeChange').className = lastValue >= first ? 'positive' : 'negative';
  $('#rangeAvg').textContent = money(avg, 'USD', 2);
  $('#rangeHighLow').textContent = `${money(maxValue, 'USD', 0)} / ${money(minValue, 'USD', 0)}`;
  const vsAvg = ((lastValue - avg) / avg) * 100;
  $('#vsAvg').textContent = pct(vsAvg, 1);
  $('#vsAvg').className = vsAvg >= 0 ? 'positive' : 'negative';

  const high52 = Number(state.data?.futures?.fiftyTwoWeekHigh) || Math.max(...history.map((point) => Number(point.close)));
  const low52 = Number(state.data?.futures?.fiftyTwoWeekLow) || Math.min(...history.map((point) => Number(point.close)));
  $('#high52').textContent = money(high52, 'USD', 0);
  $('#low52').textContent = money(low52, 'USD', 0);
  $('#fromHigh').textContent = pct(((lastValue - high52) / high52) * 100, 1);
  $('#fromLow').textContent = pct(((lastValue - low52) / low52) * 100, 1);

  const read = describeMarket(lastValue, avg, high52, low52);
  $('#marketReadTitle').textContent = read.title;
  $('#marketReadBody').textContent = read.body;

  bindChartHover(points, coords, pad, width);
}

function smoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    const midX = (previous.x + current.x) / 2;
    path += ` C ${midX.toFixed(2)} ${previous.y.toFixed(2)}, ${midX.toFixed(2)} ${current.y.toFixed(2)}, ${current.x.toFixed(2)} ${current.y.toFixed(2)}`;
  }
  return path;
}

function describeMarket(current, avg, high, low) {
  const diff = ((current - avg) / avg) * 100;
  const highGap = ((current - high) / high) * 100;
  if (diff > 2.5) {
    return {
      title: '仍在均值上方',
      body: `当前价高于 ${state.range} 日均值 ${diff.toFixed(1)}%，距离 52 周高点还有 ${Math.abs(highGap).toFixed(1)}%。如果现在买金，先看工费和回购价，不要用“还会涨”来说服自己。`
    };
  }
  if (diff < -2.5) {
    return {
      title: '回到均值下方',
      body: `当前价比 ${state.range} 日均值低 ${Math.abs(diff).toFixed(1)}%，处于相对温和的观察窗口。但本地溢价和汇率可能抵消这部分回落，仍要按到手价算。`
    };
  }
  return {
    title: '贴着均值走',
    body: `当前价与 ${state.range} 日均值只差 ${Math.abs(diff).toFixed(1)}%，市场在等待新的方向。这个阶段最适合做的不是猜涨跌，而是把不同门店的工费和回购条款问清楚。`
  };
}

function bindChartHover(points, coords, pad, width) {
  const stage = $('.chart-stage');
  const tooltip = $('#chartTooltip');
  const hit = $('#chartHit');
  const line = $('#hoverLine');
  const dot = $('#hoverDot');
  if (!hit || !stage || !tooltip) return;

  const move = (event) => {
    const rect = stage.getBoundingClientRect();
    const relative = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const svgX = relative * width;
    const plotLeft = pad.left;
    const plotRight = width - pad.right;
    const ratio = clamp((svgX - plotLeft) / (plotRight - plotLeft), 0, 1);
    const index = Math.round(ratio * (points.length - 1));
    const point = points[index];
    const coord = coords[index];
    if (!point || !coord) return;
    line.setAttribute('x1', coord.x);
    line.setAttribute('x2', coord.x);
    line.setAttribute('opacity', '1');
    dot.setAttribute('cx', coord.x);
    dot.setAttribute('cy', coord.y);
    dot.setAttribute('opacity', '1');
    tooltip.hidden = false;
    tooltip.style.left = `${(coord.x / width) * 100}%`;
    tooltip.style.top = `${(coord.y / 300) * 100}%`;
    tooltip.querySelector('.tt-date').textContent = dateLabel(point.date);
    tooltip.querySelector('.tt-price').textContent = money(Number(point.close), 'USD', 2);
  };

  hit.addEventListener('pointermove', move);
  hit.addEventListener('pointerleave', () => {
    tooltip.hidden = true;
    line.setAttribute('opacity', '0');
    dot.setAttribute('opacity', '0');
  });
}

/* ---------- holdings ---------- */

function holdingValue(holding) {
  const config = MARKETS[holding.market] || MARKETS.TH;
  const grams = Math.max(0, Number(holding.weight) || 0) * (UNITS[holding.unit]?.grams || 1);
  const purity = Number(holding.purity) || config.defaultPurity;
  if (holding.market === 'TH' && purity === 0.965 && state.data?.thai) {
    const reference = holding.assetType === 'jewelry' ? state.data.thai.ornamentBuy : state.data.thai.barBuy;
    return (Number(reference) * grams) / BAHT_GRAMS;
  }
  const spotGram = spotPerGramLocal(holding.market);
  return spotGram * grams * purity * (1 - config.buybackSpread / 100);
}

function holdingValueUsd(holding) {
  const value = holdingValue(holding);
  const fx = currentFx(holding.market);
  return fx ? value / fx : 0;
}

function holdingCostUsd(holding) {
  const fx = currentFx(holding.market);
  return fx ? (Number(holding.cost) || 0) / fx : 0;
}

function renderHoldings() {
  const body = $('#holdingsBody');
  const table = $('.holdings-table');
  const empty = $('#emptyState');
  if (!body) return;

  if (!state.holdings.length) {
    table.hidden = true;
    empty.hidden = false;
    $('#portfolioValue').textContent = money(0, 'USD', 2);
    $('#portfolioLocal').textContent = '还没有添加持仓';
    $('#portfolioCost').textContent = money(0, 'USD', 2);
    $('#portfolioPnl').textContent = money(0, 'USD', 2);
    $('#portfolioPnl').className = '';
    $('#portfolioPnlPct').textContent = '—';
    $('#portfolioGrams').textContent = '0 g';
    return;
  }

  table.hidden = false;
  empty.hidden = true;

  let totalUsd = 0;
  let costUsd = 0;
  let grams = 0;

  body.innerHTML = state.holdings.map((holding) => {
    const value = holdingValue(holding);
    const valueUsd = holdingValueUsd(holding);
    const cost = Number(holding.cost) || 0;
    const costInUsd = holdingCostUsd(holding);
    const pnl = value - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    totalUsd += valueUsd;
    costUsd += costInUsd;
    grams += (Number(holding.weight) || 0) * (UNITS[holding.unit]?.grams || 1);
    const currency = (MARKETS[holding.market] || MARKETS.TH).currency;
    return `
      <tr>
        <td><span class="asset-name">${escapeHtml(holding.name)}</span><span class="asset-sub">${holding.assetType === 'jewelry' ? '金饰' : '金条/金料'} · ${holding.createdAt ? shortDate(holding.createdAt) : ''}</span></td>
        <td>${(MARKETS[holding.market] || MARKETS.TH).name}<span class="asset-sub">${PURITY_LABEL[String(holding.purity)] || `${(Number(holding.purity) * 100).toFixed(1)}%`}</span></td>
        <td>${numberFormat(holding.weight, 2)} ${UNITS[holding.unit]?.label || ''}<span class="asset-sub">${numberFormat((Number(holding.weight) || 0) * (UNITS[holding.unit]?.grams || 1), 2)} g</span></td>
        <td>${money(cost, currency, (MARKETS[holding.market] || MARKETS.TH).digits)}</td>
        <td><strong>${money(value, currency, (MARKETS[holding.market] || MARKETS.TH).digits)}</strong></td>
        <td><span class="${pnl >= 0 ? 'positive' : 'negative'}">${pnl >= 0 ? '+' : ''}${money(pnl, currency, (MARKETS[holding.market] || MARKETS.TH).digits)}</span><span class="asset-sub ${pnl >= 0 ? 'positive' : 'negative'}">${pct(pnlPct, 1)}</span></td>
        <td><button class="delete-holding" data-id="${escapeHtml(holding.id)}" title="删除" aria-label="删除 ${escapeHtml(holding.name)}">×</button></td>
      </tr>
    `;
  }).join('');

  const pnl = totalUsd - costUsd;
  const pnlPct = costUsd > 0 ? (pnl / costUsd) * 100 : 0;
  $('#portfolioValue').textContent = money(totalUsd, 'USD', 2);
  $('#portfolioLocal').textContent = '按今日汇率折合美元；各币种见下表';
  $('#portfolioCost').textContent = money(costUsd, 'USD', 2);
  $('#portfolioPnl').textContent = `${pnl >= 0 ? '+' : ''}${money(pnl, 'USD', 2)}`;
  $('#portfolioPnl').className = pnl >= 0 ? 'positive' : 'negative';
  $('#portfolioPnlPct').textContent = costUsd > 0 ? pct(pnlPct, 1) : '—';
  $('#portfolioPnlPct').className = pnl >= 0 ? 'positive' : 'negative';
  $('#portfolioGrams').textContent = `${numberFormat(grams, 2)} g`;

  $$('.delete-holding', body).forEach((button) => {
    button.addEventListener('click', () => {
      state.holdings = state.holdings.filter((holding) => holding.id !== button.dataset.id);
      saveJson(STORAGE_HOLDINGS, state.holdings);
      renderHoldings();
      showToast('持仓已删除');
    });
  });
}

function openHoldingDialog(defaults = null) {
  const dialog = $('#holdingDialog');
  const holding = defaults || {
    name: '',
    market: state.market,
    purity: MARKETS[state.market].defaultPurity,
    unit: MARKETS[state.market].defaultUnit,
    weight: 1,
    cost: '',
    assetType: 'bar'
  };
  $('#holdingName').value = holding.name;
  $('#holdingMarket').value = holding.market;
  $('#holdingPurity').value = String(holding.purity);
  $('#holdingAssetType').value = holding.assetType || 'bar';
  $('#holdingUnit').value = holding.unit;
  $('#holdingWeight').value = holding.weight;
  $('#holdingCost').value = holding.cost;
  $('#holdingNote').textContent = `当前 ${MARKETS[holding.market].name} 参考：${holding.market === 'TH' ? 'GTA 金条/金饰回购价' : '国际金料价减回购折价'}。`;
  dialog.showModal();
  setTimeout(() => $('#holdingName').focus(), 50);
}

function saveHolding(event) {
  event.preventDefault();
  if (!$('#holdingForm').checkValidity()) return;
  const market = $('#holdingMarket').value;
  const holding = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: $('#holdingName').value.trim() || '未命名持仓',
    market,
    purity: Number($('#holdingPurity').value),
    unit: $('#holdingUnit').value,
    weight: Number($('#holdingWeight').value),
    cost: Number($('#holdingCost').value),
    assetType: $('#holdingAssetType').value,
    createdAt: new Date().toISOString()
  };
  if (!holding.weight || holding.weight <= 0 || !Number.isFinite(holding.cost)) {
    showToast('请填写有效的重量和买入成本');
    return;
  }
  state.holdings.push(holding);
  saveJson(STORAGE_HOLDINGS, state.holdings);
  renderHoldings();
  $('#holdingDialog').close();
  showToast('持仓已保存，估值已更新');
}

/* ---------- alerts ---------- */

function renderAlerts() {
  const list = $('#alertList');
  if (!list) return;
  $('#alertCount').textContent = state.alerts.length;
  if (!state.alerts.length) {
    list.innerHTML = '<p class="alert-empty">还没有提醒。设一个你愿意出手的价格，到了再回来看。</p>';
    return;
  }
  const current = spotUsdOz();
  list.innerHTML = state.alerts.map((alert) => {
    const distance = current > 0 ? ((Number(alert.target) - current) / current) * 100 : 0;
    const triggered = alert.triggered;
    return `
      <div class="alert-item ${triggered ? 'triggered' : ''}">
        <span class="alert-dir">${alert.direction === 'below' ? '↓' : '↑'}</span>
        <div class="alert-body">
          <strong>${alert.direction === 'below' ? '跌到或低于' : '涨到或高于'} ${money(Number(alert.target), 'USD', 2)}</strong>
          <small>${triggered ? '已触发' : `距当前 ${pct(distance, 1)}`}</small>
        </div>
        <span class="alert-state">${triggered ? '✓' : '等待'}</span>
        <button data-id="${escapeHtml(alert.id)}" title="删除提醒" aria-label="删除提醒">×</button>
      </div>
    `;
  }).join('');

  $$('#alertList button').forEach((button) => {
    button.addEventListener('click', () => {
      state.alerts = state.alerts.filter((alert) => alert.id !== button.dataset.id);
      saveJson(STORAGE_ALERTS, state.alerts);
      renderAlerts();
      showToast('提醒已删除');
    });
  });
}

function addAlert(event) {
  event.preventDefault();
  const target = Number($('#alertTarget').value);
  if (!Number.isFinite(target) || target <= 0) {
    showToast('请输入有效的目标价');
    return;
  }
  state.alerts.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    target,
    direction: $('#alertDirection').value,
    triggered: false,
    createdAt: new Date().toISOString()
  });
  saveJson(STORAGE_ALERTS, state.alerts);
  $('#alertTarget').value = '';
  renderAlerts();
  showToast('提醒已保存，价格到点会在这里提示');
}

function checkAlerts() {
  const current = spotUsdOz();
  if (!current) return;
  let changed = false;
  for (const alert of state.alerts) {
    if (alert.triggered) continue;
    const hit = alert.direction === 'below' ? current <= Number(alert.target) : current >= Number(alert.target);
    if (hit) {
      alert.triggered = true;
      changed = true;
      const message = `金价已${alert.direction === 'below' ? '跌到' : '涨到'} ${money(Number(alert.target), 'USD', 2)}（当前 ${money(current, 'USD', 2)}）`;
      showToast(message);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('GoldLens 价格提醒', { body: message, tag: alert.id });
      }
    }
  }
  if (changed) {
    saveJson(STORAGE_ALERTS, state.alerts);
    renderAlerts();
  }
}

/* ---------- sources ---------- */

function renderSources() {
  if (state.demo) {
    for (const selector of ['#sourceSpot', '#sourceGta', '#sourceFx', '#sourceHistory']) {
      const element = $(selector);
      if (!element) continue;
      element.textContent = '静态演示快照';
      element.className = 'source-status warn';
    }
    return;
  }
  const degraded = new Set(state.data?.degraded || []);
  const set = (selector, label, ok) => {
    const element = $(selector);
    if (!element) return;
    element.textContent = ok ? `${label} · 已连接` : `${label} · 快照`;
    element.className = `source-status ${ok ? 'ok' : 'warn'}`;
  };
  set('#sourceSpot', 'gold-api.com', !degraded.has('spot'));
  set('#sourceGta', 'GTA Thailand', !degraded.has('gta'));
  set('#sourceFx', 'open.er-api.com', !degraded.has('fx'));
  set('#sourceHistory', 'Yahoo Finance', !degraded.has('futures'));
}

/* ---------- events ---------- */

function bindEvents() {
  $$('#marketChips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      applyMarketDefaults(chip.dataset.market, true);
      renderCalculator();
    });
  });

  $$('#purityChips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.purity = Number(chip.dataset.purity);
      $$('#purityChips .chip').forEach((item) => item.classList.toggle('active', item === chip));
      renderCalculator();
    });
  });

  $('#weight').addEventListener('input', (event) => {
    state.weight = Math.max(0, Number(event.target.value) || 0);
    renderCalculator();
  });

  $('#unit').addEventListener('change', (event) => {
    state.unit = event.target.value;
    renderCalculator();
  });

  $('#making').addEventListener('input', (event) => {
    state.making = Number(event.target.value) || 0;
    updateRangeFill(event.target);
    renderCalculator();
  });

  $('#tax').addEventListener('input', (event) => {
    state.tax = Number(event.target.value) || 0;
    updateRangeFill(event.target);
    renderCalculator();
  });

  $('#calcBtn').addEventListener('click', () => {
    renderCalculator();
    $('#resultCard').animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }],
      { duration: 260, easing: 'ease-out' }
    );
    showToast('账单已按最新参数更新');
  });

  $('#resetBtn').addEventListener('click', () => {
    applyMarketDefaults(state.market, true);
    renderCalculator();
    showToast('已恢复该市场的默认参数');
  });

  $$('#rangeTabs .range-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.range = Number(tab.dataset.range);
      $$('#rangeTabs .range-tab').forEach((item) => item.classList.toggle('active', item === tab));
      renderChart();
    });
  });

  $('#addHoldingBtn').addEventListener('click', () => openHoldingDialog());
  $('#emptyAddBtn').addEventListener('click', () => openHoldingDialog());
  $('#sampleHoldingBtn').addEventListener('click', () => {
    const sample = {
      id: `${Date.now()}-sample`,
      name: '曼谷金条 · 示例',
      market: 'TH',
      purity: 0.965,
      unit: 'baht',
      weight: 1,
      cost: 63500,
      assetType: 'bar',
      createdAt: new Date().toISOString()
    };
    state.holdings.push(sample);
    saveJson(STORAGE_HOLDINGS, state.holdings);
    renderHoldings();
    showToast('已载入示例持仓，可随时删除');
  });

  $('#holdingForm').addEventListener('submit', (event) => {
    if (event.submitter?.value === 'cancel') return;
    event.preventDefault();
    saveHolding(event);
  });

  $('#holdingMarket').addEventListener('change', (event) => {
    const config = MARKETS[event.target.value];
    $('#holdingPurity').value = String(config.defaultPurity);
    $('#holdingUnit').value = config.defaultUnit;
    $('#holdingNote').textContent = `当前 ${config.name} 参考：${event.target.value === 'TH' ? 'GTA 金条/金饰回购价' : '国际金料价减回购折价'}。`;
  });

  $('#alertForm').addEventListener('submit', addAlert);

  $('#notifyBtn').addEventListener('click', async () => {
    if (!('Notification' in window)) {
      showToast('当前浏览器不支持系统通知');
      return;
    }
    const permission = await Notification.requestPermission();
    $('#alertNote').textContent = permission === 'granted'
      ? '已开启。价格触发时，浏览器会弹出系统通知。'
      : '未开启。提醒仍会在页面内提示。';
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && $('#holdingDialog').open) $('#holdingDialog').close();
  });
}

function applyMarketDefaults(market, updateChips = true) {
  const config = MARKETS[market];
  state.market = market;
  state.purity = config.defaultPurity;
  state.unit = config.defaultUnit;
  state.making = config.making;
  state.tax = config.tax;
  state.weight = market === 'US' ? 1 : 1;
  if (updateChips) {
    $$('#marketChips .chip').forEach((chip) => chip.classList.toggle('active', chip.dataset.market === market));
    $$('#purityChips .chip').forEach((chip) => chip.classList.toggle('active', Number(chip.dataset.purity) === config.defaultPurity));
  }
  $('#weight').value = state.weight;
  $('#unit').value = state.unit;
  $('#making').value = state.making;
  $('#tax').value = state.tax;
  $('#makingPctLabel').textContent = state.making;
  $('#taxPctLabel').textContent = state.tax;
  updateRangeFill($('#making'));
  updateRangeFill($('#tax'));
}

let toastTimer = null;
function showToast(message) {
  const toast = $('#toast');
  $('#toastText').textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
}

boot();
