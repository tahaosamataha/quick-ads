const fs = require('fs');
let code = fs.readFileSync('src/components/CPAReductionPlanner.tsx', 'utf8');

// Add model state
const stateInsert = `  const [inputs, setInputs] = useState({
    currentOrders: '',
    currentCpa: '',
    targetCpa: '',
    remainingDays: '',
    dailySpend: ''
  });
  const [aiModel, setAiModel] = useState<'pro' | 'flash'>('pro');`;

code = code.replace(/  const \[inputs, setInputs\] = useState\(\{[\s\S]*?\}\);/, stateInsert);

// Pass aiModel to API
const apiCallOld = `      const report = await generateCPAScenarios(
        Number(inputs.currentOrders),
        Number(inputs.currentCpa),
        Number(inputs.targetCpa),
        Number(inputs.remainingDays),
        Number(inputs.dailySpend || 0),
        language
      );`;

const apiCallNew = `      const report = await generateCPAScenarios(
        Number(inputs.currentOrders),
        Number(inputs.currentCpa),
        Number(inputs.targetCpa),
        Number(inputs.remainingDays),
        Number(inputs.dailySpend || 0),
        language,
        aiModel
      );`;

code = code.replace(apiCallOld, apiCallNew);

// Add radio buttons
const uiOld = `        <button
          onClick={handleGenerate}`;

const uiNew = `        <div className="flex flex-col gap-3 mb-6">
          <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">نموذج الذكاء الاصطناعي</label>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setAiModel('pro')}
              className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-all \${aiModel === 'pro' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}\`}
            >
              Gemini Pro (أدق وأعمق)
            </button>
            <button
              onClick={() => setAiModel('flash')}
              className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-all \${aiModel === 'flash' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}\`}
            >
              Gemini Flash 3.6 (أسرع)
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerate}`;

code = code.replace(uiOld, uiNew);

fs.writeFileSync('src/components/CPAReductionPlanner.tsx', code);
