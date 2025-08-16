// Simple server script to preview the personal website locally
const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  
  // Default to index.html for root path
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(process.cwd(), filePath);
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        console.log(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        // Server error
        console.log(`Server error: ${error.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`Personal website server running at http://${hostname}:${port}/`);
  console.log('Press Ctrl+C to stop the server');
});
