const fs = require('fs');
let content = fs.readFileSync('src/services/ai.ts', 'utf8');
content = content.replace(/ \*\s*Lapetus:.*?\n/g, '');
content = content.replace(/'Lapetus',\s*/g, '');
// Since I used sed to delete the lines, I need to restore them first or just see what's in the file.
