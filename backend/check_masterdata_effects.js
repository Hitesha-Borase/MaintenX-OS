const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../frontend/src/pages/admin/masterdata');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('useEffect(') || l.includes('useCallback(')) {
      console.log(`${f}:${i+1} -> ${l.trim()}`);
    }
  });
});
