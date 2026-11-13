const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const WEB_ROOT = path.join(ROOT, 'www');
const PORT = Number(process.env.PORT || 8000);
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const MAX_BODY = 8 * 1024 * 1024;

function loadEnvFile() {
  const filename = path.join(ROOT, '.env');
  if (!fs.existsSync(filename)) return;
  for (const raw of fs.readFileSync(filename, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || Object.hasOwn(process.env, match[1])) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '').trim();
    }
    process.env[match[1]] = value;
  }
}

loadEnvFile();

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('Request is too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(Object.assign(new Error('Invalid JSON request'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
};

async function handleGenerate(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return sendJson(res, 503, { error: 'Gemini key is not configured. Add GEMINI_API_KEY to .env and restart npm run dev.' });

  let input;
  try { input = await readJson(req); }
  catch (err) { return sendJson(res, err.status || 400, { error: err.message || 'Could not read request' }); }
  if (!Array.isArray(input.parts) || !input.parts.length) return sendJson(res, 400, { error: 'Gemini request is missing content.' });
  const model = typeof input.model === 'string' && /^gemini-[A-Za-z0-9.-]{1,80}$/.test(input.model)
    ? input.model : (process.env.GEMINI_MODEL || DEFAULT_MODEL);
  const generationConfig = { temperature: 0 };
  if (input.schema && typeof input.schema === 'object') {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = input.schema;
  }

  let upstream;
  try {
    upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ role: 'user', parts: input.parts }], generationConfig }),
      signal: AbortSignal.timeout(120000),
    });
  } catch {
    return sendJson(res, 502, { error: 'Could not reach Gemini. Check your internet connection and try again.' });
  }

  let payload;
  try { payload = await upstream.json(); }
  catch { return sendJson(res, 502, { error: 'Gemini returned an unreadable response.' }); }
  if (!upstream.ok) {
    const error = payload && payload.error;
    const message = typeof error?.message === 'string' ? error.message.slice(0, 240) : `Gemini request failed (${upstream.status}).`;
    return sendJson(res, upstream.status, { error: message });
  }
  const parts = payload.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts) ? parts.map(part => part.text || '').join('') : '';
  if (!text) return sendJson(res, 502, { error: 'Gemini returned no text. Try the request again.' });
  return sendJson(res, 200, { text });
}

const server = http.createServer(async (req, res) => {
  const host = (req.headers.host || '').split(':')[0].toLowerCase();
  if (!['localhost', '127.0.0.1', '::1'].includes(host)) return sendJson(res, 403, { error: 'This development server only accepts local requests.' });

  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/gemini/status' && req.method === 'GET') {
    return sendJson(res, 200, { configured: Boolean(process.env.GEMINI_API_KEY), model: process.env.GEMINI_MODEL || DEFAULT_MODEL });
  }
  if (url.pathname === '/api/gemini/generate' && req.method === 'POST') return handleGenerate(req, res);
  if (url.pathname.startsWith('/api/')) return sendJson(res, 404, { error: 'API route not found.' });

  let requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filename = path.resolve(WEB_ROOT, `.${requested}`);
  if (!filename.startsWith(`${WEB_ROOT}${path.sep}`) && filename !== path.join(WEB_ROOT, 'index.html')) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.stat(filename, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filename).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    fs.createReadStream(filename).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Classmark running at http://localhost:${PORT}`);
  console.log(`Gemini key: ${process.env.GEMINI_API_KEY ? 'configured' : 'not configured (add it to .env)'}`);
});
