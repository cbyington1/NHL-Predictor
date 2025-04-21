const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Check different possible build directories
const buildDirs = ['web-build', 'dist', 'build', 'export'];
let buildDir = 'web-build'; // default

// Try to find the correct build directory
for (const dir of buildDirs) {
  try {
    if (require('fs').existsSync(path.join(__dirname, dir))) {
      buildDir = dir;
      break;
    }
  } catch (e) {
    // Continue to next directory
  }
}

console.log(`Using build directory: ${buildDir}`);

// Serve static files
app.use(express.static(path.join(__dirname, buildDir)));

// Handle all routes - send back the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, buildDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});