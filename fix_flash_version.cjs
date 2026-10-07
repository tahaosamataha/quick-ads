const fs = require('fs');
let code = fs.readFileSync('src/services/ai.ts', 'utf8');

code = code.replace(/gemini-3\.6-flash-preview/g, "gemini-3.1-flash-preview");
fs.writeFileSync('src/services/ai.ts', code);
