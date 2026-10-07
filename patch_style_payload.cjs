const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /content: "Language: Arabic\\\\nDialect: " \+ dialect \+ "\\\\nVoice Description: " \+ customScriptVoice \+ "\\\\n\\\\n" \+ customScriptText,\s*voiceOverInstructions: "",/;

const replacement = `content: "Language: Arabic\\nDialect: " + dialect + "\\nVoice Description: " + customScriptVoice + "\\n\\n" + customScriptText,
        voiceOverInstructions: customScriptStyle || "تحدث بشكل طبيعي وواضح.",`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
