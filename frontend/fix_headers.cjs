const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles('src/pages/executive');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the specific header flex container
  const target = '<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>\n        <div>\n          <h1';
  const replacement = '<div className="mobile-flex-col" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>\n        <div>\n          <h1';
  
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log('Modified header in: ' + file);
    modifiedCount++;
  }
});

console.log('Total files modified: ' + modifiedCount);
