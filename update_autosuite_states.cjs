const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

const regex = /const \[fbAdGoal, setFbAdGoal\] = useState\('conversion'\);\n  const \[fbAdCount, setFbAdCount\] = useState<number>\(3\);/;

const replacement = `const [scriptCount, setScriptCount] = useState<number>(3);
  const [autoScriptAngles, setAutoScriptAngles] = useState(false);
  const [selectedScriptTypes, setSelectedScriptTypes] = useState<string[]>([
    'مشكلة وحل (Problem-Solution)',
    'قبل وبعد (Before-After)',
    'توصية صانع محتوى (UGC)'
  ]);
  const [selectedScriptGenders, setSelectedScriptGenders] = useState<string[]>(Array(5).fill('auto'));

  const [autoFbAngles, setAutoFbAngles] = useState(false);
  const [fbCampaignObjective, setFbCampaignObjective] = useState<string>('زيادة المبيعات (Sales)');
  const [selectedFbAdTypes, setSelectedFbAdTypes] = useState<string[]>([
    'إعلان مبيعات مباشر',
    'إعلان مميزات وفوائد',
    'إعلان بناء وعي (Awareness)'
  ]);
  
  const [fbAdGoal, setFbAdGoal] = useState('conversion');
  const [fbAdCount, setFbAdCount] = useState<number>(3);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/AutoSuite.tsx', code);
