const { verifyFirebaseIdToken } = require('../../lib/firebase-token');
const { generateGemini } = require('../../lib/gemini-proxy');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const match = String(req.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: 'Sign in to use Gemini features.' });
  try { await verifyFirebaseIdToken(match[1]); }
  catch (error) {
    if (error.code === 'CERTS_UNAVAILABLE') return res.status(503).json({ error: error.message });
    return res.status(401).json({ error: 'Your sign-in expired. Sign in again and retry.' });
  }

  let input;
  try { input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ error: 'Invalid JSON request.' }); }
  try { return res.status(200).json(await generateGemini(input)); }
  catch (error) { return res.status(error.status || 500).json({ error: error.message || 'Gemini request failed.' }); }
};
