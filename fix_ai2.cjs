const fs = require('fs');
let code = fs.readFileSync('src/services/ai.ts', 'utf8');

code = code.replace(
  "(مثلاً `rgba(0,0,0,.06)`).",
  "(مثلاً \\`rgba(0,0,0,.06)\\`)."
);

fs.writeFileSync('src/services/ai.ts', code);
