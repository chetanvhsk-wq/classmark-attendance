const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const MAX_REQUEST_BYTES = 4 * 1024 * 1024;

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function generateGemini(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw fail(503, 'Gemini is not configured for this deployment.');
  if (!input || typeof input !== 'object' || !Array.isArray(input.parts) || !input.parts.length) {
    throw fail(400, 'Gemini request is missing content.');
  }
  if (Buffer.byteLength(JSON.stringify(input)) > MAX_REQUEST_BYTES) throw fail(413, 'The uploaded content is too large. Use a smaller screenshot.');
  if (input.parts.length > 12 || input.parts.some(part => !part || typeof part !== 'object')) throw fail(400, 'Invalid Gemini request.');

  const requestedModel = typeof input.model === 'string' && /^gemini-[A-Za-z0-9.-]{1,80}$/.test(input.model)
    ? input.model : (process.env.GEMINI_MODEL || DEFAULT_MODEL);
  const generationConfig = { temperature: 0 };
  if (input.schema && typeof input.schema === 'object') {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = input.schema;
  }

  let response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(requestedModel)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ role: 'user', parts: input.parts }], generationConfig }),
      signal: AbortSignal.timeout(120000),
    });
  } catch { throw fail(502, 'Could not reach Gemini. Check the connection and try again.'); }

  let data;
  try { data = await response.json(); }
  catch { throw fail(502, 'Gemini returned an unreadable response.'); }
  if (!response.ok) {
    const message = typeof data?.error?.message === 'string' ? data.error.message.slice(0, 240) : `Gemini request failed (${response.status}).`;
    throw fail(response.status, message);
  }
  const output = data.candidates?.[0]?.content?.parts;
  const text = Array.isArray(output) ? output.map(part => part.text || '').join('') : '';
  if (!text) throw fail(502, 'Gemini returned no text. Try again.');
  return { text };
}

module.exports = { generateGemini };
