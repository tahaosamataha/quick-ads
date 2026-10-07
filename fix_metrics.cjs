const fs = require('fs');
let code = fs.readFileSync('src/services/metricsAi.ts', 'utf8');

// The replacement replaced all instances. Let's fix analyzeAdMetrics and analyzeAdSheet
// In analyzeAdMetrics
code = code.replace(/export async function analyzeAdMetrics\([\s\S]*?const response = await getAI\(\)\.models\.generateContent\(\{[\s\S]*?model: modelStr,/m, (match) => {
  return match.replace("model: modelStr,", 'model: "gemini-3.1-pro-preview",');
});

// In analyzeAdSheet
code = code.replace(/export async function analyzeAdSheet\([\s\S]*?const response = await getAI\(\)\.models\.generateContent\(\{[\s\S]*?model: modelStr,/m, (match) => {
  return match.replace("model: modelStr,", 'model: "gemini-3.1-pro-preview",');
});

fs.writeFileSync('src/services/metricsAi.ts', code);
