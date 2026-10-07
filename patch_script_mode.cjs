const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Change boolean to string enum
code = code.replace(
  "const [autoScriptAngles, setAutoScriptAngles] = useState(false);",
  "const [scriptGenMode, setScriptGenMode] = useState<'auto' | 'manual' | 'custom'>('manual');\n  const [customScriptText, setCustomScriptText] = useState('');\n  const [customScriptVoice, setCustomScriptVoice] = useState('auto');"
);

code = code.replace(
  "const scripts = await generateVideoScript(finalDescription, dialect, scriptDuration, mappedScriptTypes, aiModel, voiceGender, 3, 3000, autoScriptAngles);",
  "const scripts = await generateVideoScript(finalDescription, dialect, scriptDuration, mappedScriptTypes, aiModel, voiceGender, 3, 3000, scriptGenMode === 'auto');"
);

fs.writeFileSync('src/App.tsx', code);
