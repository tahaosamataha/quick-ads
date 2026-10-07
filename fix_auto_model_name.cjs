const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

code = code.replace(/Gemini 3\.1 Flash/, "Gemini 3.6 Flash");

fs.writeFileSync('src/components/AutoSuite.tsx', code);
