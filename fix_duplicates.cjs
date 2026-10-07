const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

// Find and remove the OLD dynamic fields for FB Ads
const oldFbAdsRegex = /\{\/\* Dynamic Fields for FB Ads \*\/\}\s+\{selectedSections\.fbAds && \(\s+<motion\.div[\s\S]*?(?=\{\/\* Dynamic Fields for Video Scripts \*\/)/;
code = code.replace(oldFbAdsRegex, '');

// Find and remove the OLD dynamic fields for Video Scripts
const oldScriptsRegex = /\{\/\* Dynamic Fields for Video Scripts \*\/\}\s+\{selectedSections\.scriptAndVoice && \(\s+<motion\.div[\s\S]*?(?=\{\/\* Dynamic Fields for Funnel Copy \*\/)/;
code = code.replace(oldScriptsRegex, '');

fs.writeFileSync('src/components/AutoSuite.tsx', code);
