const fs = require('fs');
let content = fs.readFileSync('src/services/ai.ts', 'utf8');
content = content.replace(/ \*\s*Lapetus:.*?\n/g, '');
content = content.replace(/'Lapetus',\s*/g, '');
fs.writeFileSync('src/services/ai.ts', content);

let selectContent = fs.readFileSync('src/components/CustomVoiceSelect.tsx', 'utf8');
selectContent = selectContent.replace(/.*Lapetus.*\n/g, '');
fs.writeFileSync('src/components/CustomVoiceSelect.tsx', selectContent);
