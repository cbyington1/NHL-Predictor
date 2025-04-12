// Minimal server.js
const http = require('http');

// Create server that responds 200 OK to everything
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('OK');
});

const PORT = process.env.PORT || 3000;

// Listen on all interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);
});

// Handle any errors
server.on('error', (error) => {
  console.error('Server error:', error);
});