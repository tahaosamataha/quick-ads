const fs = require('fs');
let code = fs.readFileSync('src/services/ai.ts', 'utf8');

const regex = /5\. Format: Output ONLY the final copy\. Divide it into clear, impactful sections using headers \(e\.g\., \[Section Name\]\)\./;

const replacement = `5. Format: Output ONLY the final copy. Divide it into clear, impactful sections using clear text headers without any brackets or markdown.`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/services/ai.ts', code);
