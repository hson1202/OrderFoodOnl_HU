const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '../Frontend/src/i18n.js');
let f = fs.readFileSync(p, 'utf8');
f = f.replace(/\bsk:\s*\{\s*\n\s*translation:\s*\{/m, 'hu: {\n    translation: {');
f = f.replace(/fallbackLng:\s*'sk'/, "fallbackLng: 'hu'");
f = f.replace(
  /\/\/ First-time users will fall back to Slovak\./,
  '// First-time users will fall back to Hungarian.'
);
f = f.replace(/export const resetToSlovak/g, 'export const resetToHungarian');
f = f.replace(/resetToSlovak/g, 'resetToHungarian');
f = f.replace(/changeLanguage\('sk'\)/g, "changeLanguage('hu')");
f = f.replace(
  /\/\/ Function to reset language to Slovak/g,
  '// Function to reset language to Hungarian'
);
fs.writeFileSync(p, f);
console.log('patched', p);
