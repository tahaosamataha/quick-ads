const fs = require('fs');
let code = fs.readFileSync('src/components/CPAReductionPlanner.tsx', 'utf8');

const stateRegex = /const \[inputs, setInputs\] = useState\(\{[\s\S]*?\}\);/;
const newState = `const [inputs, setInputs] = useState({
    currentOrders: '',
    currentCpa: '',
    targetCpa: '',
    minCpa: '',
    maxCpa: '',
    remainingDays: '',
    dailySpend: ''
  });`;
code = code.replace(stateRegex, newState);

const inputsRegex = /<div className="space-y-2">[\s\S]*?أقل تكلفة مستهدفة \(Min CPA\)[\s\S]*?<\/div>\s*<div className="space-y-2">[\s\S]*?أقصى تكلفة مستهدفة \(Max CPA\)[\s\S]*?<\/div>/;
const newInputs = `<div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("التكلفة المستهدفة الإجمالية (Target CPA)")}</label>
            <input type="number" value={inputs.targetCpa} onChange={(e) => setInputs({...inputs, targetCpa: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 15" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("أقل CPA يومي مسموح (Min Daily)")}</label>
            <input type="number" value={inputs.minCpa} onChange={(e) => setInputs({...inputs, minCpa: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 10" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("أقصى CPA يومي مسموح (Max Daily)")}</label>
            <input type="number" value={inputs.maxCpa} onChange={(e) => setInputs({...inputs, maxCpa: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 20" />
          </div>`;
code = code.replace(inputsRegex, newInputs);

const gridRegex = /<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">/;
code = code.replace(gridRegex, `<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">`);

const ifRegex = /if \(\(!inputs\.minCpa \|\| !inputs\.maxCpa\)/;
code = code.replace(ifRegex, `if (!inputs.targetCpa || !inputs.minCpa || !inputs.maxCpa`);

const reportRegex = /const report = await generateCPAScenarios\([\s\S]*?Number\(inputs\.currentOrders\),[\s\S]*?Number\(inputs\.currentCpa\),[\s\S]*?\/\/ targetCpa was here, now replaced by min\/max[\s\S]*?Number\(inputs\.minCpa\),[\s\S]*?Number\(inputs\.maxCpa\),[\s\S]*?Number\(inputs\.remainingDays\),[\s\S]*?Number\(inputs\.dailySpend \|\| 0\),[\s\S]*?language,[\s\S]*?aiModel[\s\S]*?\);/;

const newReportCall = `const report = await generateCPAScenarios(
        Number(inputs.currentOrders),
        Number(inputs.currentCpa),
        Number(inputs.targetCpa),
        Number(inputs.minCpa),
        Number(inputs.maxCpa),
        Number(inputs.remainingDays),
        Number(inputs.dailySpend || 0),
        language,
        aiModel
      );`;

code = code.replace(reportRegex, newReportCall);

fs.writeFileSync('src/components/CPAReductionPlanner.tsx', code);
