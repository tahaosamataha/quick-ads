const fs = require('fs');

// 1. Update ai.ts
let aiCode = fs.readFileSync('src/services/ai.ts', 'utf8');
aiCode = aiCode.replace(/'free' \| 'pro'/g, "'flash' | 'pro'");
aiCode = aiCode.replace(/= 'free'/g, "= 'flash'");
aiCode = aiCode.replace(/gemini-3-flash-preview/g, "gemini-3.6-flash-preview"); // They said 3.6 flash new
fs.writeFileSync('src/services/ai.ts', aiCode);

// 2. Update App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/const \[aiModel, setAiModel\] = useState\<'free' \| 'pro'\>\('free'\);/, "const [aiModel, setAiModel] = useState<'flash' | 'pro'>('flash');");
appCode = appCode.replace(/aiModel === 'free'/g, "aiModel === 'flash'");
fs.writeFileSync('src/App.tsx', appCode);

// 3. Update AutoSuite.tsx - this was already done but wait, it failed in typescript check. I had changed useState<'pro' | 'flash'>('pro'). That's fine now since ai.ts accepts 'flash'.
