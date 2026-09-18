const SERVICENOW_INSTANCE = process.env.SERVICENOW_INSTANCE_URL
  || process.env.REACT_APP_SERVICENOW_URL
  || 'https://dev280910.service-now.com';

const allowedMethods = new Set(['GET', 'PUT', 'POST', 'PATCH', 'DELETE']);

module.exports = async function handler(req, res) {
  if (!allowedMethods.has(req.method)) {
    res.setHeader('Allow', [...allowedMethods]);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requestUrl = new URL(req.url, 'http://localhost');
  const routeSegments = Array.isArray(req.query.path)
    ? req.query.path
    : String(req.query.path || '').split('/').filter(Boolean);
  const serviceNowPath = `/api/${routeSegments.join('/')}`;
  const targetUrl = new URL(`${serviceNowPath}${requestUrl.search}`, SERVICENOW_INSTANCE);
  const headers = {
    Accept: req.headers.accept || 'application/json'
  };

  for (const headerName of ['authorization', 'content-type']) {
    if (req.headers[headerName]) {
      headers[headerName] = req.headers[headerName];
    }
  }

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
  });

  res.status(response.status);
  res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
  response.headers.forEach((value, key) => {
    const headerName = key.toLowerCase();
    if (!['www-authenticate', 'content-encoding', 'content-length', 'transfer-encoding', 'connection', 'keep-alive'].includes(headerName)) {
      res.setHeader(key, value);
    }
  });

  const body = await response.arrayBuffer();
  return res.send(Buffer.from(body));
};