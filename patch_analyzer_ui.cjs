const fs = require('fs');
let code = fs.readFileSync('src/components/AdsMetricsAnalyzer.tsx', 'utf8');

// Add model state
const stateInsert = `  // Sheet upload
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>('');
  
  const [aiModel, setAiModel] = useState<'pro' | 'flash'>('pro');`;

code = code.replace(/  \/\/ Sheet upload\s*const \[sheetFile, setSheetFile\] = useState<File \| null>\(null\);\s*const \[csvData, setCsvData\] = useState<string>\(''\);/, stateInsert);

// Pass model to API calls
const manualCallOld = `        analysis = await analyzeAdMetrics(metrics, language);`;
const manualCallNew = `        analysis = await analyzeAdMetrics(metrics, language, aiModel);`;
code = code.replace(manualCallOld, manualCallNew);

const sheetCallOld = `        analysis = await analyzeAdSheet(csvData, language);`;
const sheetCallNew = `        analysis = await analyzeAdSheet(csvData, language, aiModel);`;
code = code.replace(sheetCallOld, sheetCallNew);

// Add radio buttons
const uiOld = `        <button
          onClick={handleAnalyze}`;

const uiNew = `        <div className="flex flex-col gap-3 mb-6">
          <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{t("نموذج الذكاء الاصطناعي")}</label>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setAiModel('pro')}
              className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-all \${aiModel === 'pro' ? 'bg-white dark:bg-zinc-700 shadow-sm text-fuchsia-600 dark:text-fuchsia-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}\`}
            >
              Gemini Pro (أدق وأعمق)
            </button>
            <button
              onClick={() => setAiModel('flash')}
              className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-all \${aiModel === 'flash' ? 'bg-white dark:bg-zinc-700 shadow-sm text-fuchsia-600 dark:text-fuchsia-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}\`}
            >
              Gemini Flash 3.6 (أسرع)
            </button>
          </div>
        </div>

        <button
          onClick={handleAnalyze}`;

code = code.replace(uiOld, uiNew);

// Update descriptions to reflect ad level capabilities
code = code.replace(
  `{t('اكتشف هل الإعلان ناجح أم فاشل بناءً على الـ Metrics (Kill, Punish, Scale)')}`,
  `{t('اكتشف هل الإعلان ناجح أم فاشل، وحلل مستويات الحملات والكرييتف بالتفصيل (Kill, Punish, Scale)')}`
);
code = code.replace(
  `{t("رفع شيت الحملات (CSV)")}`,
  `{t("رفع شيت الحملات/الإعلانات (CSV)")}`
);
code = code.replace(
  `{sheetFile ? sheetFile.name : t('اضغط لرفع شيت الحملات (CSV)')}`,
  `{sheetFile ? sheetFile.name : t('اضغط لرفع شيت إحصائيات الإعلانات (Breakdown - CSV)')}`
);

fs.writeFileSync('src/components/AdsMetricsAnalyzer.tsx', code);
