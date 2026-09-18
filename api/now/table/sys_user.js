const SERVICENOW_INSTANCE = process.env.SERVICENOW_INSTANCE_URL
  || process.env.REACT_APP_SERVICENOW_URL
  || 'https://dev280910.service-now.com';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requestUrl = new URL(req.url, 'http://localhost');
  const targetUrl = new URL(`/api/now/table/sys_user${requestUrl.search}`, SERVICENOW_INSTANCE);
  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      Accept: req.headers.accept || 'application/json',
      ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {})
    }
  });

  res.status(response.status);
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'www-authenticate') {
      res.setHeader(key, value);
    }
  });

  return res.send(Buffer.from(await response.arrayBuffer()));
};