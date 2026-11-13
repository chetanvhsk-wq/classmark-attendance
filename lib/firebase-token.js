const crypto = require('node:crypto');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'attended-9480d';
const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
let cachedCerts = null;
let certsExpireAt = 0;

async function getPublicCerts() {
  if (cachedCerts && Date.now() < certsExpireAt) return cachedCerts;
  let response;
  try { response = await fetch(CERTS_URL, { signal: AbortSignal.timeout(10000) }); }
  catch { throw Object.assign(new Error('Firebase token verification is temporarily unavailable.'), { code: 'CERTS_UNAVAILABLE' }); }
  if (!response.ok) throw Object.assign(new Error('Firebase token verification is temporarily unavailable.'), { code: 'CERTS_UNAVAILABLE' });
  const certs = await response.json();
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1] || 300);
  cachedCerts = certs;
  certsExpireAt = Date.now() + Math.max(60, maxAge - 30) * 1000;
  return cachedCerts;
}

async function verifyFirebaseIdToken(token) {
  if (typeof token !== 'string' || token.length > 10000) throw new Error('Invalid Firebase token.');
  const pieces = token.split('.');
  if (pieces.length !== 3) throw new Error('Invalid Firebase token.');

  let header, claims;
  try {
    header = JSON.parse(Buffer.from(pieces[0], 'base64url').toString('utf8'));
    claims = JSON.parse(Buffer.from(pieces[1], 'base64url').toString('utf8'));
  } catch { throw new Error('Invalid Firebase token.'); }

  const now = Math.floor(Date.now() / 1000);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error('Invalid Firebase token.');
  if (claims.aud !== PROJECT_ID || claims.iss !== `https://securetoken.google.com/${PROJECT_ID}`) throw new Error('Invalid Firebase token.');
  if (typeof claims.sub !== 'string' || !claims.sub || claims.sub.length > 128) throw new Error('Invalid Firebase token.');
  if (typeof claims.exp !== 'number' || claims.exp <= now) throw new Error('Expired Firebase token.');
  if (typeof claims.iat !== 'number' || claims.iat > now + 300) throw new Error('Invalid Firebase token.');
  if (typeof claims.auth_time !== 'number' || claims.auth_time > now + 300) throw new Error('Invalid Firebase token.');

  const certs = await getPublicCerts();
  const cert = certs[header.kid];
  if (!cert) throw new Error('Invalid Firebase token.');
  const valid = crypto.verify(
    'RSA-SHA256',
    Buffer.from(`${pieces[0]}.${pieces[1]}`),
    cert,
    Buffer.from(pieces[2], 'base64url'),
  );
  if (!valid) throw new Error('Invalid Firebase token.');
  return { uid: claims.sub };
}

module.exports = { verifyFirebaseIdToken };
