const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const results = [];
  lines.forEach((line, idx) => {
    // Check for hardcoded fallbacks like: || "string", || 'string'
    const match = line.match(/\|\|\s*["']([^"']+)["']/);
    if (match && match[1].trim() !== '' && !match[1].startsWith('/') && match[1] !== '0' && match[1] !== 'Unknown' && !line.includes('process.env')) {
      results.push({ lineNum: idx + 1, text: line.trim() });
    }
  });
  return results;
}

const file = path.join(__dirname, 'src/modules/quality/quality.service.ts');
const res = checkFile(file);
console.log(`Found ${res.length} matches in ${file}:`);
res.forEach(r => console.log(`${r.lineNum}: ${r.text}`));
