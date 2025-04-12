const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Handle health check explicitly
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
        return;
      }
      res.end(data);
    });
  } else {
    // Handle other routes
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('NHL Predictor API');
  }
});

const PORT = process.env.PORT || 3000;
// Make sure to listen on all interfaces (0.0.0.0)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Log when requests come in (for debugging)
server.on('request', (req, res) => {
  console.log(`Received request for: ${req.url}`);
});