const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/executive/**/*.jsx');
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
