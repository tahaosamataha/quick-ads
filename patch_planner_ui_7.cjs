const fs = require('fs');
let code = fs.readFileSync('src/components/CPAReductionPlanner.tsx', 'utf8');

const targetStr = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
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
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("الأيام المتبقية في الشهر")}</label>
            <input type="number" value={inputs.remainingDays} onChange={(e) => setInputs({...inputs, remainingDays: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 10" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("الإنفاق اليومي الحالي (اختياري)")}</label>
            <input type="number" value={inputs.dailySpend} onChange={(e) => setInputs({...inputs, dailySpend: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 200" />
          </div>
        </div>`;

const newStr = `<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("إجمالي الطلبات الحالية")}</label>
            <input type="number" value={inputs.currentOrders} onChange={(e) => setInputs({...inputs, currentOrders: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 100" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("التكلفة الحالية للطلب (Current CPA)")}</label>
            <input type="number" value={inputs.currentCpa} onChange={(e) => setInputs({...inputs, currentCpa: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 20" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("التكلفة المستهدفة (Target CPA)")}</label>
            <input type="number" value={inputs.targetCpa} onChange={(e) => setInputs({...inputs, targetCpa: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 15" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("أقل CPA يومي (Min Daily)")}</label>
            <input type="number" value={inputs.minCpa} onChange={(e) => setInputs({...inputs, minCpa: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 10" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("أقصى CPA يومي (Max Daily)")}</label>
            <input type="number" value={inputs.maxCpa} onChange={(e) => setInputs({...inputs, maxCpa: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 20" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("الأيام المتبقية")}</label>
            <input type="number" value={inputs.remainingDays} onChange={(e) => setInputs({...inputs, remainingDays: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 10" />
          </div>
          <div className="space-y-2 md:col-span-3">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("الإنفاق اليومي الحالي (اختياري)")}</label>
            <input type="number" value={inputs.dailySpend} onChange={(e) => setInputs({...inputs, dailySpend: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 200" />
          </div>
        </div>`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/components/CPAReductionPlanner.tsx', code);
