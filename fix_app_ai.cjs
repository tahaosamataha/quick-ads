const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/setAiModel\('free'\)/, "setAiModel('flash')");
fs.writeFileSync('src/App.tsx', code);
