import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Calculator, Download, AlertCircle, Loader2, Target, DownloadCloud, TrendingUp, Star, Filter, Tag, FileBarChart, Sparkles } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { generateCPAScenarios } from '../services/metricsAi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const CPAReductionPlanner: React.FC = () => {
  const { t, language } = useLanguage();
  
  const [inputs, setInputs] = useState({
    currentOrders: '',
    currentCpa: '',
    targetCpa: '',
    minDailyCpa: '',
    maxDailyCpa: '',
    remainingDays: '',
    dailySpend: ''
  });

  const [aiModel, setAiModel] = useState<'flash' | 'pro'>('flash');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (
      !inputs.currentOrders || 
      !inputs.currentCpa || 
      !inputs.targetCpa || 
      !inputs.minDailyCpa || 
      !inputs.maxDailyCpa || 
      !inputs.remainingDays
    ) {
      setError(t('يرجى إدخال جميع الحقول الإلزامية'));
      return;
    }

    const currOrders = Number(inputs.currentOrders);
    const currCpa = Number(inputs.currentCpa);
    const targetCpa = Number(inputs.targetCpa);
    const minCpa = Number(inputs.minDailyCpa);
    const maxCpa = Number(inputs.maxDailyCpa);
    const days = Number(inputs.remainingDays);

    if (currCpa > targetCpa && maxCpa >= targetCpa) {
      setError(t(`تنبيه رياضي: لتخفيض التكلفة التراكمية من $${currCpa} إلى $${targetCpa}، يجب أن يكون أقصى CPA يومي أقل من التكلفة المستهدفة (أقل من $${targetCpa}) لتعويض التكلفة المرتفعة السابقة.`));
      return;
    }

    if (minCpa > maxCpa) {
      setError(t('الحد الأدنى لـ CPA اليومي لا يمكن أن يكون أكبر من الحد الأقصى'));
      return;
    }

    setError(null);
    setResult(null);
    setIsGenerating(true);

    try {
      const report = await generateCPAScenarios(
        currOrders,
        currCpa,
        targetCpa,
        minCpa,
        maxCpa,
        days,
        Number(inputs.dailySpend || 0),
        language,
        aiModel
      );
      setResult(report);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('حدث خطأ أثناء التوليد'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('CPA_Reduction_Plan.pdf');
    } catch (err) {
      console.error("PDF generation failed", err);
      alert(t("حدث خطأ أثناء تصدير PDF"));
    }
  };

  const handleDownloadExcel = () => {
    if (!result) return;
    try {
      const jsonStr = result.replace(/^\s*```json/m, '').replace(/\s*```$/m, '').trim();
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data)) {
        let csv = '\uFEFFالاستراتيجية,الإجراء المطلوب,عدد الطلبات الإضافية المطلوبة,أقصى تكلفة مسموحة للطلب (Max CPA),الأداء المتوقع,الطلبات اليومية,التكلفة اليومية CPA,الإنفاق اليومي المقترح\n';
        data.forEach(row => {
          csv += `"${row.scenario || ''}","${(row.action || '').replace(/"/g, '""')}","${row.additionalOrders || ''}","${row.maxCpa || ''}","${(row.expectedPerformance || '').replace(/"/g, '""')}","${row.dailyOrders || ''}","${row.dailyCpa || ''}","${row.dailySpend || ''}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "CPA_Reduction_Plan.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
    } catch (e) {
      // Fallback
    }
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(result);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "CPA_Reduction_Plan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('مخطط تقليل تكلفة الاستحواذ (CPA Optimizer)')}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">{t('احسب كيفية الوصول للـ Target CPA الخاص بك عبر 5 سيناريوهات احترافية')}</p>
          </div>
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("إجمالي الطلبات الحالية")}</label>
            <input 
              type="number" 
              value={inputs.currentOrders} 
              onChange={(e) => setInputs({...inputs, currentOrders: e.target.value})} 
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-white" 
              placeholder="e.g. 100" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("التكلفة الحالية للطلب (Current CPA)")}</label>
            <input 
              type="number" 
              value={inputs.currentCpa} 
              onChange={(e) => setInputs({...inputs, currentCpa: e.target.value})} 
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-white" 
              placeholder="e.g. 25" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("التكلفة المستهدفة الإجمالية (Target CPA)")}</label>
            <input 
              type="number" 
              value={inputs.targetCpa} 
              onChange={(e) => setInputs({...inputs, targetCpa: e.target.value})} 
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-white" 
              placeholder="e.g. 15" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("أقل CPA يومي مسموح (Min Daily)")}</label>
            <input 
              type="number" 
              value={inputs.minDailyCpa} 
              onChange={(e) => setInputs({...inputs, minDailyCpa: e.target.value})} 
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-white" 
              placeholder="e.g. 10" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("أقصى CPA يومي مسموح (Max Daily)")}</label>
              {inputs.targetCpa && (
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                  {t('أقل من')} ${inputs.targetCpa}
                </span>
              )}
            </div>
            <input 
              type="number" 
              value={inputs.maxDailyCpa} 
              onChange={(e) => setInputs({...inputs, maxDailyCpa: e.target.value})} 
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-white" 
              placeholder="e.g. 14" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("الأيام المتبقية في الشهر")}</label>
            <input 
              type="number" 
              value={inputs.remainingDays} 
              onChange={(e) => setInputs({...inputs, remainingDays: e.target.value})} 
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-white" 
              placeholder="e.g. 10" 
            />
          </div>

          <div className="space-y-2 md:col-span-3">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("الإنفاق اليومي الحالي (اختياري)")}</label>
            <input 
              type="number" 
              value={inputs.dailySpend} 
              onChange={(e) => setInputs({...inputs, dailySpend: e.target.value})} 
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-white" 
              placeholder="e.g. 200" 
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* AI Model Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{t("نموذج الذكاء الاصطناعي")}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAiModel('flash')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                aiModel === 'flash'
                  ? 'bg-blue-500/10 border-blue-500 text-blue-500'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Gemini Flash 3.6 (أسرع)
            </button>
            <button
              type="button"
              onClick={() => setAiModel('pro')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                aiModel === 'pro'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              Gemini Pro (أدق وأعمق)
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
        >
          {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Calculator className="w-6 h-6" />}
          {isGenerating ? t('جاري الحساب والتخطيط...') : t('احسب وخطط 5 سيناريوهات')}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex gap-4">
            <button onClick={handleDownloadPDF} className="flex-1 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              {t("تحميل كـ PDF")}
            </button>
            <button onClick={handleDownloadExcel} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm">
              <DownloadCloud className="w-4 h-4" />
              {t("تحميل كـ Excel (CSV)")}
            </button>
          </div>
          
          <div ref={resultRef} className="bg-[#1C1C28] text-white rounded-3xl border border-[#2D2D44] shadow-2xl overflow-hidden p-6" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-[#2D2D44] mb-6">
              <div className="flex items-center gap-3">
                <div className="text-purple-400 font-black text-xl italic tracking-wider flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6 text-fuchsia-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  QUICK ADS
                </div>
              </div>
              <div className="bg-[#5939A7] text-white font-bold text-2xl px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
                <FileBarChart className="w-6 h-6" />
                {t('تقرير خطة تقليل الـ CPA')}
              </div>
            </div>

            {/* Main Strategies Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#2D2D44] mb-8">
              <table className="w-full text-center border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-[#4E3197]">
                    <th className="py-5 px-4 font-bold border border-[#2D2D44] w-[25%]">{t('الاستراتيجية')}</th>
                    <th className="py-5 px-4 font-bold border border-[#2D2D44] w-[30%]">{t('الإجراء المطلوب')}</th>
                    <th className="py-5 px-4 font-bold border border-[#2D2D44]">{t('عدد الطلبات الإضافية المطلوبة')}</th>
                    <th className="py-5 px-4 font-bold border border-[#2D2D44]">{t('أقصى تكلفة مسموحة للطلب (Max CPA)')}</th>
                    <th className="py-5 px-4 font-bold border border-[#2D2D44]">{t('الأداء المتوقع خلال ')} {inputs.remainingDays} {t('يوماً')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2D44] bg-[#1C1C28]">
                  {(() => {
                    try {
                      const jsonStr = result.replace(/^\s*```json/m, '').replace(/\s*```$/m, '').trim();
                      const data = JSON.parse(jsonStr);
                      const icons = [TrendingUp, Target, Star, Filter, Tag];
                      
                      return Array.isArray(data) ? data.map((row, idx) => {
                        const Icon = icons[idx % icons.length];
                        return (
                          <tr key={idx} className="hover:bg-white/5 transition-colors group">
                            <td className="py-6 px-4 border border-[#2D2D44] font-bold text-right flex items-center gap-4 justify-end">
                              <span className="text-zinc-200 text-sm">{row.scenario}</span>
                              <div className="w-10 h-10 rounded-xl bg-[#2D2D44] group-hover:bg-[#4E3197] text-[#9373EE] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                                <Icon className="w-5 h-5" />
                              </div>
                            </td>
                            <td className="py-6 px-4 border border-[#2D2D44] text-sm leading-relaxed text-zinc-300 text-right">
                              {row.action}
                            </td>
                            <td className="py-6 px-4 border border-[#2D2D44] font-black text-xl text-[#A78BFA]">
                              {typeof row.additionalOrders === 'number' ? Math.round(row.additionalOrders) : row.additionalOrders}
                            </td>
                            <td className="py-6 px-4 border border-[#2D2D44] font-black text-xl text-[#A78BFA]">
                              {row.maxCpa}
                            </td>
                            <td className="py-6 px-4 border border-[#2D2D44]">
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-sm font-medium text-zinc-300">{row.expectedPerformance}</span>
                                <TrendingUp className="w-5 h-5 text-green-400 shrink-0" />
                              </div>
                            </td>
                          </tr>
                        );
                      }) : null;
                    } catch(e) {
                      return (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-red-400">
                            Failed to parse JSON response. Ensure AI returns raw JSON format. <br/>
                            <pre className="text-xs text-left overflow-auto mt-4 max-h-40 p-4 bg-black rounded-lg">{result}</pre>
                          </td>
                        </tr>
                      );
                    }
                  })()}
                </tbody>
              </table>
            </div>

            {/* Second Table for Daily Targets */}
            <div className="bg-[#4E3197]/20 border border-[#4E3197]/40 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#4E3197] text-white flex items-center justify-center shadow-lg">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-white">{t('الأهداف اليومية المطلوبة (بناءً على')} {inputs.remainingDays} {t('يوماً متبقياً)')}</h4>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-[#2D2D44]">
                <table className="w-full text-center border-collapse min-w-[650px] bg-[#1C1C28]">
                  <thead>
                    <tr className="bg-[#2D2D44]">
                      <th className="py-4 px-4 font-bold border-b border-[#3D3D54]">{t('الاستراتيجية')}</th>
                      <th className="py-4 px-4 font-bold border-b border-[#3D3D54] text-emerald-400">{t('الطلبات اليومية (أعداد صحيحة)')}</th>
                      <th className="py-4 px-4 font-bold border-b border-[#3D3D54] text-red-400">{t('التكلفة اليومية المسموحة (CPA)')}</th>
                      <th className="py-4 px-4 font-bold border-b border-[#3D3D54] text-blue-400">{t('الإنفاق اليومي المقترح (Spend)')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D2D44]">
                    {(() => {
                      try {
                        const jsonStr = result.replace(/^\s*```json/m, '').replace(/\s*```$/m, '').trim();
                        const data = JSON.parse(jsonStr);
                        
                        return Array.isArray(data) ? data.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 border-r border-[#2D2D44] font-bold text-zinc-300 text-right">
                              {row.scenario}
                            </td>
                            <td className="py-4 px-4 border-r border-[#2D2D44] font-black text-lg text-emerald-400 bg-emerald-400/5">
                              {typeof row.dailyOrders === 'number' ? Math.round(row.dailyOrders) : row.dailyOrders || '--'}
                            </td>
                            <td className="py-4 px-4 border-r border-[#2D2D44] font-black text-lg text-red-400 bg-red-400/5">
                              {row.dailyCpa || '--'}
                            </td>
                            <td className="py-4 px-4 font-black text-lg text-blue-400 bg-blue-400/5">
                              {row.dailySpend || '--'}
                            </td>
                          </tr>
                        )) : null;
                      } catch(e) {
                        return null;
                      }
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
};
