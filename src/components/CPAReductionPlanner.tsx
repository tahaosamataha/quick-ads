import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Download, AlertCircle, Loader2, Target, DownloadCloud, TrendingUp, Star, Filter, Tag, FileBarChart } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { generateCPAScenarios } from '../services/metricsAi';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const CPAReductionPlanner: React.FC = () => {
  const { t, language } = useLanguage();
  
  const [inputs, setInputs] = useState({
    currentOrders: '',
    currentCpa: '',
    targetCpa: '',
    minCpa: '',
    maxCpa: '',
    remainingDays: '',
    dailySpend: ''
  });
  const [aiModel, setAiModel] = useState<'pro' | 'flash'>('pro');

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!inputs.currentOrders || !inputs.currentCpa || (!inputs.minCpa || !inputs.maxCpa) || !inputs.remainingDays) {
      setError(t('يرجى إدخال جميع الحقول الإلزامية'));
      return;
    }

    setError(null);
    setResult(null);
    setIsGenerating(true);

    try {
      const report = await generateCPAScenarios(
        Number(inputs.currentOrders),
        Number(inputs.currentCpa),
        Number(inputs.targetCpa),
        Number(inputs.minCpa),
        Number(inputs.maxCpa),
        Number(inputs.remainingDays),
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
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(result);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "CPA_Reduction_Plan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/30 text-[#F0B21B] dark:text-[#F0B21B] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('مخطط تقليل تكلفة الاستحواذ (CPA Optimizer)')}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">{t('احسب كيفية الوصول للـ Target CPA الخاص بك عبر 3 سيناريوهات احترافية')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 mb-6">
          <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">نموذج الذكاء الاصطناعي</label>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setAiModel('pro')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${aiModel === 'pro' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Gemini Pro (أدق وأعمق)
            </button>
            <button
              onClick={() => setAiModel('flash')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${aiModel === 'flash' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Gemini Flash 3.6 (أسرع)
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
          {isGenerating ? t('جاري الحساب والتخطيط...') : t('احسب وخطط 3 سيناريوهات')}
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
          
          <div ref={resultRef} className="bg-[#1C1C28] text-white rounded-3xl border border-[#2D2D44] shadow-2xl overflow-hidden" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2D2D44]">
              <div className="flex items-center gap-3">
                <div className="text-purple-400 font-black text-xl italic tracking-wider flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6 text-[#F0B21B]">
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#4E3197]">
                    <th className="py-5 px-4 font-bold border border-[#2D2D44] border-t-0 w-[25%]">{t('الاستراتيجية')}</th>
                    <th className="py-5 px-4 font-bold border border-[#2D2D44] border-t-0 w-[30%]">{t('الإجراء المطلوب')}</th>
                    <th className="py-5 px-4 font-bold border border-[#2D2D44] border-t-0">{t('عدد الطلبات الإضافية المطلوبة')}</th>
                    <th className="py-5 px-4 font-bold border border-[#2D2D44] border-t-0">{t('أقصى تكلفة مسموحة للطلب (Max CPA)')}</th>
                    <th className="py-5 px-4 font-bold border border-[#2D2D44] border-t-0 border-l-0">{t('الأداء المتوقع خلال ')} {inputs.remainingDays} {t('يوماً')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2D44]">
                  {(() => {
                    try {
                      // Attempt to parse JSON from result. Strip out markdown blocks if AI added them
                      const jsonStr = result.replace(/^\s*```json/m, '').replace(/\s*```$/m, '').trim();
                      const data = JSON.parse(jsonStr);
                      const icons = [TrendingUp, Target, Star, Filter, Tag];
                      
                      return Array.isArray(data) ? data.map((row, idx) => {
                        const Icon = icons[idx % icons.length];
                        return (
                          <tr key={idx} className="hover:bg-white/5 transition-colors group">
                            <td className="py-6 px-4 border border-[#2D2D44] border-l-0 font-bold text-right flex items-center gap-4 justify-end">
                              <span className="text-zinc-200 text-sm">{row.scenario}</span>
                              <div className="w-10 h-10 rounded-xl bg-[#2D2D44] group-hover:bg-[#4E3197] text-[#9373EE] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                                <Icon className="w-5 h-5" />
                              </div>
                            </td>
                            <td className="py-6 px-4 border border-[#2D2D44] text-sm leading-relaxed text-zinc-300">
                              {row.action}
                            </td>
                            <td className="py-6 px-4 border border-[#2D2D44] font-black text-xl text-[#A78BFA]">
                              {row.additionalOrders}
                            </td>
                            <td className="py-6 px-4 border border-[#2D2D44] font-black text-xl text-[#A78BFA]">
                              {row.maxCpa}
                            </td>
                            <td className="py-6 px-4 border border-[#2D2D44] border-r-0">
                              <div className="flex items-center justify-center gap-3">
                                <span className="text-sm font-medium text-zinc-300">{row.expectedPerformance}</span>
                                <TrendingUp className="w-5 h-5 text-green-400" />
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
            <div className="mt-12 mb-4 p-6">
              <div className="bg-[#4E3197]/20 border border-[#4E3197]/40 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#4E3197] text-white flex items-center justify-center shadow-lg">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="text-xl font-bold text-white">{t('الأهداف اليومية المطلوبة (بناءً على')} {inputs.remainingDays} {t('يوماً متبقياً)')}</h4>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-[#2D2D44]">
                  <table className="w-full text-center border-collapse min-w-[600px] bg-[#1C1C28]">
                    <thead>
                      <tr className="bg-[#2D2D44]">
                        <th className="py-4 px-4 font-bold border-b border-[#3D3D54]">{t('الاستراتيجية')}</th>
                        <th className="py-4 px-4 font-bold border-b border-[#3D3D54] text-emerald-400">{t('الطلبات اليومية')}</th>
                        <th className="py-4 px-4 font-bold border-b border-[#3D3D54] text-red-400">{t('التكلفة اليومية (CPA)')}</th>
                        <th className="py-4 px-4 font-bold border-b border-[#3D3D54] text-blue-400">{t('الإنفاق اليومي (Spend)')}</th>
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
                                {row.dailyOrders || '--'}
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
            
          </div>
        </motion.div>
      )}
    </div>
  );
};
