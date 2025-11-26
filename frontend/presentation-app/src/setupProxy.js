const { createProxyMiddleware } = require('http-proxy-middleware');

const target = process.env.BACKEND_PROXY_TARGET || 'http://backend:5168';

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      logLevel: 'warn'
    })
  );
};
