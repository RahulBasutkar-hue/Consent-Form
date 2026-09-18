const SERVICENOW_INSTANCE = process.env.SERVICENOW_INSTANCE_URL
  || process.env.REACT_APP_SERVICENOW_URL
  || 'https://dev280910.service-now.com';

const allowedMethods = new Set(['GET', 'PUT', 'POST', 'PATCH', 'DELETE']);

const getServiceNowPath = (eventPath = '') => {
  if (eventPath.startsWith('/.netlify/functions/service-now')) {
    const splat = eventPath.replace('/.netlify/functions/service-now', '') || '/';
    return `/api${splat.startsWith('/') ? splat : `/${splat}`}`;
  }

  if (eventPath.startsWith('/api/')) {
    return eventPath;
  }

  return `/api${eventPath.startsWith('/') ? eventPath : `/${eventPath}`}`;
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204 };
  }

  if (!allowedMethods.has(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: { Allow: [...allowedMethods].join(', ') },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const query = event.rawQuery
    ? `?${event.rawQuery}`
    : event.queryStringParameters
      ? `?${new URLSearchParams(event.queryStringParameters).toString()}`
      : '';
  const targetUrl = `${SERVICENOW_INSTANCE}${getServiceNowPath(event.path)}${query}`;
  const headers = {
    Accept: event.headers.accept || event.headers.Accept || 'application/json'
  };

  const authorization = event.headers.authorization || event.headers.Authorization;
  const contentType = event.headers['content-type'] || event.headers['Content-Type'];
  if (authorization) {
    headers.Authorization = authorization;
  }
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  const response = await fetch(targetUrl, {
    method: event.httpMethod,
    headers,
    body: ['GET', 'HEAD'].includes(event.httpMethod)
      ? undefined
      : event.isBase64Encoded
        ? Buffer.from(event.body || '', 'base64')
        : event.body
  });

  const responseHeaders = {};
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'www-authenticate') {
      responseHeaders[key] = value;
    }
  });

  return {
    statusCode: response.status,
    headers: responseHeaders,
    body: Buffer.from(await response.arrayBuffer()).toString('base64'),
    isBase64Encoded: true
  };
};
