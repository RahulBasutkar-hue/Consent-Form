const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

const SERVICENOW_HOST = process.env.REACT_APP_SERVICENOW_URL
  || 'https://dev280910.service-now.com';

module.exports = function (app) {
  app.use(
    '/otp-dev',
    createProxyMiddleware({
      target: 'https://api.otp.dev',
      changeOrigin: true,
      secure: true,
      pathRewrite: { '^/otp-dev': '' }
    })
  );

  app.use(
    '/api',
    createProxyMiddleware({
      target: SERVICENOW_HOST,
      changeOrigin: true,
      secure: true,
      selfHandleResponse: true,
      onProxyReq(proxyReq, req) {
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
      },
      onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        // Prevent Chrome/Edge native Basic Auth popup on 401 from ServiceNow.
        res.removeHeader('WWW-Authenticate');
        res.removeHeader('www-authenticate');
        return responseBuffer;
      })
    })
  );
};
