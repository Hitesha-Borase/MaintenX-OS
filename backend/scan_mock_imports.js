const fs = require('fs');
const path = require('path');

function searchDirectory(dir, filterExts, checkFn) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let results = [];
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '.gemini'].includes(file.name)) {
        results = results.concat(searchDirectory(fullPath, filterExts, checkFn));
      }
    } else if (filterExts.some(ext => file.name.endsWith(ext))) {
      const hits = checkFn(fullPath);
      if (hits.length > 0) {
        results.push({ file: fullPath, hits });
      }
    }
  }
  return results;
}

// 1. Check frontend imports of mock
console.log('=== FRONTEND MOCK DATA IMPORTS ===');
const frontendDir = path.resolve(__dirname, '../frontend/src');
const mockImports = searchDirectory(frontendDir, ['.js', '.jsx'], (file) => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const hits = [];
  lines.forEach((l, idx) => {
    if (/from\s+['"].*mock.*['"]/.test(l) || /require\(['"].*mock.*['"]\)/.test(l)) {
      hits.push({ line: idx + 1, text: l.trim() });
    }
  });
  return hits;
});

mockImports.forEach(m => {
  console.log(`File: ${path.relative(frontendDir, m.file)}`);
  m.hits.forEach(h => console.log(`  L${h.line}: ${h.text}`));
});
