const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/modules/dashboards/dashboards.service.ts');
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);

// Look for lines with hardcoded sample names or fallback arrays
const suspiciousWords = [
  'Organic Orange Juice', 'BAT-2026', 'Arthur Sterling', 'Dr. Rachel', 
  'Marcus Vance', 'Elena Rostova', 'Bottling Line', 'Aseptic', 'Sparkling'
];

lines.forEach((l, idx) => {
  for (const word of suspiciousWords) {
    if (l.includes(word)) {
      console.log(`L${idx + 1} [${word}]: ${l.trim().substring(0, 100)}`);
      break;
    }
  }
});
