const NEON_AUTH_URL =
  'https://ep-jolly-glade-akvjb297.neonauth.c-3.us-west-2.aws.neon.tech/neondb/auth';

module.exports = async (req, res) => {
  // Parse query string to get the sub-path
  const url = new URL(req.url, 'http://localhost');
  const subPath = url.searchParams.get('path') || '';
  const targetUrl = `${NEON_AUTH_URL}/${subPath}`;

  // Read the raw request body
  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => (data += chunk));
      req.on('end', () => resolve(data));
    });
  }

  // Forward to Neon Auth with its own origin so Better Auth trusts the request
  const NEON_ORIGIN = 'https://ep-jolly-glade-akvjb297.neonauth.c-3.us-west-2.aws.neon.tech';
  const upstream = await fetch(targetUrl, {
    method: req.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Origin': NEON_ORIGIN,
    },
    body,
  });

  const data = await upstream.text();

  // Build response headers
  const responseHeaders = {};
  const ct = upstream.headers.get('content-type');
  if (ct) responseHeaders['Content-Type'] = ct;

  // Forward set-cookie if any
  const cookies = upstream.headers.getSetCookie?.();
  if (cookies && cookies.length) {
    responseHeaders['Set-Cookie'] = cookies;
  }

  res.writeHead(upstream.status, responseHeaders);
  res.end(data);
};
