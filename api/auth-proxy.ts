import type { VercelRequest, VercelResponse } from '@vercel/node';

const NEON_AUTH_URL =
  'https://ep-jolly-glade-akvjb297.neonauth.c-3.us-west-2.aws.neon.tech/neondb/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // The sub-path is forwarded via the "path" query parameter by vercel.json routes
  const subPath = (req.query.path as string) || '';
  const targetUrl = `${NEON_AUTH_URL}/${subPath}`;

  // Build clean headers — omit Origin/Host so Neon Auth treats it as
  // a server-to-server request (same as curl).
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

  res.status(response.status);
  const ct = response.headers.get('content-type');
  if (ct) res.setHeader('Content-Type', ct);

  // Forward set-cookie headers if any (sessions)
  const cookies = response.headers.getSetCookie?.();
  if (cookies && cookies.length) {
    res.setHeader('Set-Cookie', cookies);
  }

  res.send(data);
}
