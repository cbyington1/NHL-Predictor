/**
 * Script to find and list all files with hardcoded localhost URLs
 * Run with: node update-hardcoded-urls.js
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

// Directories to exclude from search
const excludeDirs = [
  'node_modules',
  '.git',
  '.expo',
  'dist',
  'build',
  'web-build'
];

// Extensions to check
const checkExtensions = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx'
];

// Patterns to search for
const patterns = [
  'http://localhost:3000',
  'localhost:3000'
];

// Main function to scan directory
async function scanDirectory(directory) {
  const filesWithHardcodedUrls = [];
  
  // Function to recursively scan directories
  async function scan(dir) {
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      // Skip excluded directories
      if (excludeDirs.includes(entry)) continue;
      
      const fullPath = path.join(dir, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        await scan(fullPath);
      } else if (stats.isFile()) {
        // Check if file has an extension we want to check
        const ext = path.extname(fullPath);
        if (checkExtensions.includes(ext)) {
          const content = await readFile(fullPath, 'utf8');
          
          // Check for hardcoded URLs
          let found = false;
          for (const pattern of patterns) {
            if (content.includes(pattern)) {
              found = true;
              break;
            }
          }
          
          if (found) {
            filesWithHardcodedUrls.push({
              path: fullPath,
              lines: findLinesWithHardcodedUrls(content, patterns)
            });
          }
        }
      }
    }
  }
  
  // Start scanning from the provided directory
  await scan(directory);
  
  return filesWithHardcodedUrls;
}

// Function to find lines containing hardcoded URLs
function findLinesWithHardcodedUrls(content, patterns) {
  const lines = content.split('\n');
  const results = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of patterns) {
      if (line.includes(pattern)) {
        results.push({
          lineNumber: i + 1,
          line: line.trim(),
          pattern
        });
      }
    }
  }
  
  return results;
}

// Main execution
async function main() {
  console.log('Scanning project for hardcoded localhost URLs...');
  
  // Start scanning from the current directory
  const results = await scanDirectory('.');
  
  console.log(`\nFound ${results.length} files with hardcoded localhost URLs:\n`);
  
  for (const file of results) {
    console.log(`File: ${file.path}`);
    console.log('Lines:');
    
    for (const line of file.lines) {
      console.log(`  Line ${line.lineNumber}: ${line.line}`);
    }
    
    console.log('');
  }
  
  console.log('\nTo update these files:');
  console.log('1. Create a services/config.ts file with your API URL');
  console.log('2. Import the config in each file: import config from \'@/services/config\';');
  console.log('3. Replace hardcoded URLs with config.apiUrl');
}

main().catch(error => {
  console.error('Error:', error);
});