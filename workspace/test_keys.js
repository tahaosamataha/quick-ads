const fs = require('fs');

const contextContent = fs.readFileSync('src/LanguageContext.tsx', 'utf8');
let allContent = '';
const filesToScan = ['src/App.tsx', 'src/components/Dashboard.tsx', 'src/components/SettingsPage.tsx', 'src/components/PricingCalculator.tsx'];

for (const f of filesToScan) {
  try { allContent += fs.readFileSync(f, 'utf8') + ' '; } catch(e){}
}

const tRegex = /t\(\s*(["'])(.*?)\1\s*\)/g;
const keysInApp = new Set();
let match;
while ((match = tRegex.exec(allContent)) !== null) {
  keysInApp.add(match[2]);
}

const transMatch = contextContent.match(/(?:['"])(.*?)(?:['"])\s*:\s*\{/g);
const existingTranslations = new Set();
if (transMatch) {
  for (const m of transMatch) {
    const key = m.replace(/:\s*\{$/, '').replace(/^["']|["']$/g, '');
    existingTranslations.add(key);
  }
}

const missingKeys = [];
for (const key of keysInApp) {
  if (!existingTranslations.has(key)) {
    missingKeys.push(key);
  }
}
console.log(JSON.stringify(missingKeys, null, 2));
