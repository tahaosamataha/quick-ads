const fs = require('fs');
let code = fs.readFileSync('src/components/CPAReductionPlanner.tsx', 'utf8');

const oldState = `  const [inputs, setInputs] = useState({
    currentOrders: '',
    currentCpa: '',
    targetCpa: '',
    remainingDays: '',
    dailySpend: ''
  });`;
const newState = `  const [inputs, setInputs] = useState({
    currentOrders: '',
    currentCpa: '',
    minCpa: '',
    maxCpa: '',
    remainingDays: '',
    dailySpend: ''
  });`;
code = code.replace(oldState, newState);

const oldInputs = `          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("التكلفة المستهدفة (Target CPA)")}</label>
            <input type="number" value={inputs.targetCpa} onChange={(e) => setInputs({...inputs, targetCpa: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 16" />
          </div>`;
const newInputs = `          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("أقل تكلفة مستهدفة (Min CPA)")}</label>
            <input type="number" value={inputs.minCpa} onChange={(e) => setInputs({...inputs, minCpa: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 10" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("أقصى تكلفة مستهدفة (Max CPA)")}</label>
            <input type="number" value={inputs.maxCpa} onChange={(e) => setInputs({...inputs, maxCpa: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 15" />
          </div>`;
code = code.replace(oldInputs, newInputs);

const oldApiCall = `      const report = await generateCPAScenarios(
        Number(inputs.currentOrders),
        Number(inputs.currentCpa),
        Number(inputs.targetCpa),
        Number(inputs.remainingDays),
        Number(inputs.dailySpend || 0),
        language,
        aiModel
      );`;
const newApiCall = `      const report = await generateCPAScenarios(
        Number(inputs.currentOrders),
        Number(inputs.currentCpa),
        Number(inputs.minCpa),
        Number(inputs.maxCpa),
        Number(inputs.remainingDays),
        Number(inputs.dailySpend || 0),
        language,
        aiModel
      );`;
code = code.replace(oldApiCall, newApiCall);

fs.writeFileSync('src/components/CPAReductionPlanner.tsx', code);
