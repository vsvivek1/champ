var httpProxyMiddleware = require('http-proxy-middleware');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createRetryingProxyMiddleware(options) {
  var proxy = httpProxyMiddleware.createProxyMiddleware(options);

  return async function(req, res, next) {
    req.retries = req.retries || 0;

    const handleRetry = async () => {
      if (req.retries < 3) {
        req.retries += 1;
        console.log(`Retrying request... Attempt ${req.retries}`);
        await delay(1000); // Retry after 1 second
        proxy(req, res, next);
      } else {
        console.log('Max retries reached. Sending error response.');
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Something went wrong. Please try again later.');
      }
    };

    proxy(req, res, function(err) {
      if (err) {
        console.log('Proxy error:', err);
        handleRetry();
      } else {
        next();
      }
    });
  };
}

var apiProxy = createRetryingProxyMiddleware({
  target: 'http://127.0.0.1:9090',
  changeOrigin: true,
  secure: true,
  ws: true
});

module.exports = apiProxy;
