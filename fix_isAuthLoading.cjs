const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/if \(isAuthLoading\) \{\s*if \(loading\) \{/, "if (isAuthLoading) {");
fs.writeFileSync('src/App.tsx', code);
