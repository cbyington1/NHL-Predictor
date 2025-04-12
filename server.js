const http = require('http');
const fs = require('fs');
const path = require('path');

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Handle all paths - explicit for health checks
  if (req.url === '/' || req.url === '/health' || req.url === '/healthz') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<html><body><h1>NHL Predictor</h1><p>Server is healthy and running!</p></body></html>');
  } else {
    // Default response for any other path
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('NHL Predictor API');
  }
});

// Get port from environment variable
const PORT = process.env.PORT || 3000;

// Start server listening on all interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (http://0.0.0.0:${PORT})`);
});