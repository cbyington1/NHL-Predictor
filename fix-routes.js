const fs = require('fs');
const path = require('path');

// Path to the generated index.html file
const indexPath = path.join(__dirname, 'dist', 'index.html');

// Read the content of index.html
fs.readFile(indexPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading index.html:', err);
    return;
  }

  // Add a base tag to ensure correct relative URLs
  const updatedContent = data.replace(
    '<head>',
    '<head>\n    <base href="/">'
  );

  // Write the updated content back to index.html
  fs.writeFile(indexPath, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to index.html:', err);
      return;
    }
    console.log('Successfully updated index.html for client-side routing');
  });
});