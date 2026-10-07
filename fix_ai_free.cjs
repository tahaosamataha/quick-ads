const fs = require('fs');
let code = fs.readFileSync('src/services/ai.ts', 'utf8');

code = code.replace(/if \(generationModelType === 'flash'\) \{/, "if (generationModelType === 'free') {");

fs.writeFileSync('src/services/ai.ts', code);
