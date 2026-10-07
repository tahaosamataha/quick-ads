const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

const newStates = `
  const [autoModel, setAutoModel] = useState<'pro' | 'flash'>('pro');
`;
code = code.replace(/const \[isGenerating, setIsGenerating\] = useState\(false\);/, newStates + '$&');

// replace 'pro' with autoModel in the generation calls
code = code.replace(/generateVideoScript\(fullDesc, dialect, scriptDuration, scriptTypes, 'pro',/g, "generateVideoScript(fullDesc, dialect, scriptDuration, scriptTypes, autoModel,");
code = code.replace(/generateFbAdCopies\(fullDesc, dialect, 'pro'\)/g, "generateFbAdCopies(fullDesc, dialect, autoModel, Array(fbAdCount).fill('إعلان مبيعات مباشر'), 3, 3000, undefined, true, fbAdGoal)"); // Wait, fbAdCopies is already changed? I will use regex carefully.
fs.writeFileSync('src/components/AutoSuite.tsx', code);
