import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function getJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  assert(response.ok, `${url} returned ${response.status}`);
  return response.json();
}

const child = spawn(process.execPath, ['server.mjs'], {
  cwd: path.join(ROOT, 'mvp'),
  env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' },
  stdio: 'ignore',
  windowsHide: true
});

let exited = false;
child.on('exit', () => { exited = true; });

try {
  let health = null;
  for (let i = 0; i < 30; i += 1) {
    if (exited) throw new Error('server exited before becoming healthy');
    try {
      health = await getJson(`${BASE}/health`);
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  assert(health?.ok === true, 'health endpoint did not return ok');

  const market = await getJson(`${BASE}/api/market`);
  assert(Number.isFinite(market?.spot?.usdOz), 'market.spot.usdOz missing');
  assert(Number.isFinite(market?.fx?.rates?.THB), 'market.fx.rates.THB missing');
  assert(Number.isFinite(market?.thai?.barSell), 'market.thai.barSell missing');
  assert(Array.isArray(market?.futures?.history), 'market.futures.history missing');

  const home = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(15_000) });
  assert(home.ok, 'home page not served');
  const html = await home.text();
  assert(html.includes('GoldLens'), 'home page does not include brand');

  const manifest = JSON.parse(await readFile(path.join(ROOT, 'mvp/public/manifest.webmanifest'), 'utf8'));
  assert(manifest.name && manifest.icons?.length >= 3, 'manifest is incomplete');

  const snapshot = JSON.parse(await readFile(path.join(ROOT, 'mvp/public/data/market.json'), 'utf8'));
  assert(Number.isFinite(snapshot?.spot?.usdOz), 'static snapshot is invalid');
  assert(snapshot?.futures?.history?.length > 100, 'static snapshot history is too short');

  console.log(JSON.stringify({
    ok: true,
    spot: market.spot.usdOz,
    thaiBarSell: market.thai.barSell,
    history: market.futures.history.length,
    degraded: market.degraded,
    pwaIcons: manifest.icons.length,
    staticHistory: snapshot.futures.history.length
  }, null, 2));
} finally {
  if (!exited) child.kill();
}
