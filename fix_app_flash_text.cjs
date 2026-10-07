const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{t\("النموذج المجاني \(سريع\)"\)\}/, '{t("Gemini 3.6 Flash الجديد")}');
fs.writeFileSync('src/App.tsx', code);
