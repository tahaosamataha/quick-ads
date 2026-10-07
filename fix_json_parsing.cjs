const fs = require('fs');
let code = fs.readFileSync('src/services/ai.ts', 'utf8');

// Fix analyzeProductForSpy
const regexSpy = /config: \{\s*temperature: 0\.2,\s*responseMimeType: "application\/json",\s*tools: \[\{ googleSearch: \{\} \}\]\s*\}/;
const newSpyConfig = `config: { 
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }`;
code = code.replace(regexSpy, newSpyConfig);

const parseSpyRegex = /const text = response\.text \|\| "\{\}";\s*return JSON\.parse\(text\);/;
const newParseSpy = `let text = response.text || "{}";
    text = text.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
    // Remove inline citations often added by Google Search tool
    text = text.replace(/\\[\\d+(?:,\\s*\\d+)*\\]/g, '');
    
    // Attempt to parse, if it fails, try to extract the last valid closing bracket
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.warn("JSON parsing failed, attempting repair", parseError);
      // Sometimes it gets cut off. Just throw to retry if we can't repair it
      throw parseError;
    }`;

code = code.replace(parseSpyRegex, newParseSpy);

fs.writeFileSync('src/services/ai.ts', code);
