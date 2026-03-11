import type { VercelRequest, VercelResponse } from '@vercel/node';

const NEON_AUTH_URL =
  'https://ep-jolly-glade-akvjb297.neonauth.c-3.us-west-2.aws.neon.tech/neondb/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = Array.isArray(req.query.path)
    ? req.query.path.join('/')
    : req.query.path || '';

  const targetUrl = `${NEON_AUTH_URL}/${path}`;

  // Build clean headers for the upstream request.
  // We intentionally omit Origin and Host so Neon Auth treats this as a
  // trusted server-to-server call (same as curl).
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(targetUrl, {
    method: req.method || 'GET',
    headers,
    body:
      req.method !== 'GET' && req.method !== 'HEAD'
        ? JSON.stringify(req.body)
        : undefined,
  });

  const data = await response.text();

  // Forward status + content-type
  res.status(response.status);
  const ct = response.headers.get('content-type');
  if (ct) res.setHeader('Content-Type', ct);

  // Forward set-cookie headers if any (sessions)
  const setCookie = response.headers.getSetCookie?.();
  if (setCookie && setCookie.length) {
    res.setHeader('Set-Cookie', setCookie);
  }

  res.send(data);
}
