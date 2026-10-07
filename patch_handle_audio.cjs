const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const handleGenerateAudio = async (index: number, script: {type: string, content: string, voiceOverInstructions: string, gender?: string}) => {",
  "const handleGenerateAudio = async (index: number, script: {type: string, content: string, voiceOverInstructions: string, gender?: string, customVoice?: string}) => {"
);

code = code.replace(
  "script.gender || voiceGender,",
  "script.customVoice || script.gender || voiceGender,"
);

fs.writeFileSync('src/App.tsx', code);
