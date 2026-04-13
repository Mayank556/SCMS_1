const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'demo-frontend');
const outDir = path.join(__dirname, 'dist');
const files = ['index.html', 'style.css', 'app.js'];

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const file of files) {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(outDir, file);
  if (!fs.existsSync(srcFile)) {
    throw new Error(`Source file not found: ${srcFile}`);
  }
  fs.copyFileSync(srcFile, destFile);
}

console.log('Built demo frontend to dist');
