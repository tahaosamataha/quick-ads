const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /content: "Language: Arabic\\nDialect: " \+ dialect \+ "\\nVoice Description: " \+ customScriptVoice \+ "\\n\\n" \+ customScriptText,\s*customVoice: customScriptVoice/;
const replacement = 'content: "Language: Arabic\\nDialect: " + dialect + "\\nVoice Description: " + customScriptVoice + "\\n\\n" + customScriptText,\n        voiceOverInstructions: "",\n        customVoice: customScriptVoice';

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
