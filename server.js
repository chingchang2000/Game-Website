import express from 'express';
import dns from 'node:dns/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const MAX_PROXY_BYTES = 2_000_000;

function parseAllowlist(raw = process.env.PROXY_ALLOWLIST || '') {
  return raw.split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
}

function isPrivateIp(ip) {
  if (!net.isIP(ip)) return true;
  if (ip === '::1' || ip === '0.0.0.0') return true;
  if (ip.startsWith('10.') || ip.startsWith('127.') || ip.startsWith('169.254.') || ip.startsWith('192.168.')) return true;
  const p = ip.split('.').map(Number);
  if (p.length === 4 && p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
  const lower = ip.toLowerCase();
  if (lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80:')) return true;
  return false;
}

export function isAllowedHostname(hostname, allowlist = parseAllowlist()) {
  const h = String(hostname || '').toLowerCase().replace(/\.$/, '');
  return allowlist.some(rule => h === rule || h.endsWith(`.${rule}`));
}

async function assertPublicHost(hostname) {
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!records.length || records.some(r => isPrivateIp(r.address))) {
    throw new Error('Private/local network destinations are blocked.');
  }
}

function rewriteHtml(html, targetUrl) {
  const base = `<base href="${targetUrl.href}">`;
  const injected = `<meta name="referrer" content="no-referrer"><meta name="robots" content="noindex,nofollow">${base}`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head([^>]*)>/i, `<head$1>${injected}`);
  return injected + html;
}

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'arcadeforge',
    games: 1200,
    uptimeSeconds: Math.floor(process.uptime()),
    proxyAllowlist: parseAllowlist()
  });
});

app.get('/api/proxy', async (req, res) => {
  const allowlist = parseAllowlist();
  if (!allowlist.length) {
    return res.status(503).send('Proxy is disabled. Set PROXY_ALLOWLIST to domains you own or are authorized to proxy.');
  }

  let target;
  try {
    target = new URL(String(req.query.url || ''));
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Only HTTP(S) URLs are allowed.');
    if (target.username || target.password) throw new Error('Credentials in URLs are not allowed.');
    if (!isAllowedHostname(target.hostname, allowlist)) throw new Error('This domain is not on the proxy allowlist.');
    await assertPublicHost(target.hostname);
  } catch (error) {
    return res.status(400).send(error.message || 'Invalid URL.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const upstream = await fetch(target, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'ArcadeForge-RestrictedProxy/1.0',
        'accept': 'text/html,application/xhtml+xml'
      }
    });
    const finalUrl = new URL(upstream.url);
    if (!isAllowedHostname(finalUrl.hostname, allowlist)) return res.status(400).send('Redirect left the allowlist.');
    await assertPublicHost(finalUrl.hostname);

    const type = upstream.headers.get('content-type') || '';
    if (!type.includes('text/html') && !type.includes('application/xhtml+xml')) {
      return res.status(415).send('Only HTML pages are supported by this restricted proxy.');
    }

    const reader = upstream.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_PROXY_BYTES) {
        await reader.cancel();
        return res.status(413).send('Page is too large for the proxy.');
      }
      chunks.push(value);
    }
    const body = Buffer.concat(chunks.map(v => Buffer.from(v))).toString('utf8');
    res.status(upstream.status);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
    res.send(rewriteHtml(body, finalUrl));
  } catch (error) {
    res.status(error.name === 'AbortError' ? 504 : 502).send(error.name === 'AbortError' ? 'Upstream timed out.' : 'Could not load the allowed page.');
  } finally {
    clearTimeout(timer);
  }
});

app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = app.listen(PORT, HOST, () => {
    console.log(`ArcadeForge running on http://${HOST}:${PORT}`);
  });

  const shutdown = signal => {
    console.log(`${signal} received, shutting down ArcadeForge...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

export default app;
