const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[generatedScripts, setGeneratedScripts\] = useState<\s*\{\s*type:\s*string,\s*content:\s*string,\s*voiceOverInstructions:\s*string,\s*gender\?:\s*string\s*\}\s*\[\]\s*\|\s*null\s*>\(null\);/,
  "const [generatedScripts, setGeneratedScripts] = useState<{type: string, content: string, voiceOverInstructions: string, gender?: string, customVoice?: string}[] | null>(null);"
);

fs.writeFileSync('src/App.tsx', code);
