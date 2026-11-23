module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  const configured = Array.from({ length: 5 }, (_, index) => process.env[`GEMINI_API_KEY_${index + 1}`]).some(Boolean) || Boolean(process.env.GEMINI_API_KEY);
  return res.status(200).json({ configured });
};
