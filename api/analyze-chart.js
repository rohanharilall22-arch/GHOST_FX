// GHOST_FX educational chart-image analysis endpoint.
// Keep API credentials in Vercel Environment Variables.
// Never place secrets in browser JavaScript or public GitHub files.

import { timingSafeEqual } from 'node:crypto';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_OUTPUT_TOKENS = 750;

function matchesSecret(provided, expected) {
  if (
    typeof provided !== 'string' ||
    typeof expected !== 'string' ||
    !provided ||
    !expected
  ) {
    return false;
  }

  const left = Buffer.from(provided, 'utf8');
  const right = Buffer.from(expected, 'utf8');

  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed. Use POST.');
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const expectedCode = process.env.CHART_SCANNER_ACCESS_CODE;

  if (!apiKey) {
    return sendError(
      res,
      503,
      'Scanner is not configured: OPENAI_API_KEY is missing.'
    );
  }

  if (!expectedCode) {
    return sendError(
      res,
      503,
      'Scanner is not configured: CHART_SCANNER_ACCESS_CODE is missing.'
    );
  }

  const accessCode = req.body?.accessCode;

  if (!matchesSecret(accessCode, expectedCode)) {
    return sendError(res, 401, 'The scanner access code is incorrect.');
  }

  const imageDataUrl = req.body?.imageDataUrl;

  if (typeof imageDataUrl !== 'string') {
    return sendError(res, 400, 'Choose a chart image before analyzing.');
  }

  const match = imageDataUrl.match(
    /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=\r\n]+)$/
  );

  if (!match) {
    return sendError(res, 400, 'Upload a PNG, JPG or WEBP image.');
  }

  let imageBuffer;

  try {
    imageBuffer = Buffer.from(match[2], 'base64');
  } catch {
    return sendError(res, 400, 'The image could not be decoded.');
  }

  if (!imageBuffer.length) {
    return sendError(res, 400, 'The uploaded image is empty.');
  }

  if (imageBuffer.length > MAX_IMAGE_BYTES) {
    return sendError(res, 413, 'The image is too large. Use a smaller screenshot.');
  }

  // Only allow same-origin use of this scanner endpoint.
  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      const requestHost = String(host).split(',')[0].trim();

      if (originHost !== requestHost) {
        return sendError(
          res,
          403,
          'Cross-origin request blocked. Open the scanner from its Vercel site.'
        );
      }
    } catch {
      return sendError(res, 403, 'The request origin could not be verified.');
    }
  }

  const prompt = `
You are the GHOST_FX educational chart-image reader.

Analyze only what is visible in the supplied screenshot.
Use plain language and these headings:

INSTRUMENT AND TIMEFRAME
VISIBLE STRUCTURE
POSSIBLE SUPPORT / RESISTANCE AREAS
MOMENTUM AND PATTERNS
BULLISH SCENARIO
BEARISH SCENARIO
WHAT IS UNCERTAIN

If a label, number, indicator, instrument, or timeframe is unreadable
or absent, say so explicitly instead of guessing.

Levels read from pixels are approximate. Explain what might support
either scenario and what evidence could weaken it.

Do not provide a personalized trading recommendation, direct buy/sell
command, guaranteed prediction, or exact entry, stop-loss, or take-profit
instruction. Do not claim the screenshot proves a live market condition.

Keep the answer concise. State that this is educational and uncertain
image interpretation, not financial advice.
`;

  try {
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL || 'gpt-4.1-mini',
        store: false,
        max_output_tokens: MAX_OUTPUT_TOKENS,
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: prompt },
              {
                type: 'input_image',
                image_url: imageDataUrl,
                detail: 'high'
              }
            ]
          }
        ]
      })
    });

    const payload = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      if (upstream.status === 401 || upstream.status === 403) {
        return sendError(
          res,
          502,
          'The AI provider rejected the server configuration. Check the API credentials and account access.'
        );
      }

      if (upstream.status === 429) {
        return sendError(
          res,
          429,
          'The AI usage limit was reached. Try later or check usage settings.'
        );
      }

      return sendError(
        res,
        502,
        'The AI provider could not analyze the image right now. Try again later.'
      );
    }

    const outputText =
      typeof payload.output_text === 'string'
        ? payload.output_text.trim()
        : (payload.output || [])
            .flatMap(item => Array.isArray(item.content) ? item.content : [])
            .filter(
              item =>
                item.type === 'output_text' &&
                typeof item.text === 'string'
            )
            .map(item => item.text)
            .join('\n')
            .trim();

    if (!outputText) {
      return sendError(
        res,
        502,
        'The AI response did not contain readable analysis. Try a clearer screenshot.'
      );
    }

    return res.status(200).json({
      analysis: outputText,
      educational: true
    });
  } catch {
    return sendError(
      res,
      502,
      'The chart analysis request failed. Check deployment logs and try again.'
    );
  }
}
