const fs = require('fs');
let code = fs.readFileSync('src/services/metricsAi.ts', 'utf8');

// The file contains `لا تضع \`\`\`json)`
code = code.replace(/لا تضع ```json\)/g, "لا تضع Markdown Code Blocks)");
fs.writeFileSync('src/services/metricsAi.ts', code);
