const fs = require('fs');
let code = fs.readFileSync('src/services/ai.ts', 'utf8');

code = code.replace(
  "6. Temperature controls creativity and pacing. The temperature MUST be between 1.35 and 1.6 depending on the type of script. For energetic or fast-paced ads, use a higher temperature (up to 1.6). For slower or dramatic scripts, use a lower temperature (down to 1.35).",
  "6. The temperature MUST be exactly 1.3."
);

code = code.replace(
  "let temperature = 1.6;",
  "let temperature = 1.3;"
);

code = code.replace(
  "if (result.temperature) temperature = Math.max(1.35, Math.min(1.6, result.temperature));",
  "if (result.temperature) temperature = 1.3;"
);

fs.writeFileSync('src/services/ai.ts', code);
