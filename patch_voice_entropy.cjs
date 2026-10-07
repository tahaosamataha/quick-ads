const fs = require('fs');
let code = fs.readFileSync('src/services/ai.ts', 'utf8');

code = code.replace(
  "Instructions: ${instructions}",
  "Instructions: ${instructions}\\n(Random Seed for Variety: ${Math.random()})"
);

fs.writeFileSync('src/services/ai.ts', code);
