const fs = require('fs');
let code = fs.readFileSync('src/services/metricsAi.ts', 'utf8');

const oldModelCall = `  const response = await getAI().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,`;

const newModelCall = `  const response = await getAI().models.generateContent({
    model: modelStr,
    contents: prompt,`;

const idx = code.lastIndexOf(oldModelCall);
if (idx !== -1) {
  code = code.substring(0, idx) + newModelCall + code.substring(idx + oldModelCall.length);
}

fs.writeFileSync('src/services/metricsAi.ts', code);
