const fs = require('fs');
const path = require('path');

// This script runs after Expo builds your app
// It will modify the generated index.html file

// Wait for the dist directory to exist
function checkDistExists() {
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    modifyIndexHtml();
  } else {
    console.log('Waiting for dist directory to be created...');
    setTimeout(checkDistExists, 1000); // Check again in 1 second
  }
}

function modifyIndexHtml() {
  try {
    // Path to the generated index.html
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    
    // Check if the file exists
    if (!fs.existsSync(indexPath)) {
      console.error('index.html not found at', indexPath);
      return;
    }
    
    // Read the content of index.html
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Add our SPA redirect script
    const redirectScript = `
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages/Vercel
      (function(l) {
        if (l.search[1] === '/' ) {
          var decoded = l.search.slice(1).split('&').map(function(s) { 
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      }(window.location))
    </script>
    <base href="/">
    `;
    
    // Insert the script before the closing </head> tag
    indexContent = indexContent.replace('</head>', redirectScript + '</head>');
    
    // Write the modified content back to index.html
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log('Successfully updated index.html for SPA routing');
  } catch (err) {
    console.error('Error modifying index.html:', err);
  }
}

// Start the process
checkDistExists();