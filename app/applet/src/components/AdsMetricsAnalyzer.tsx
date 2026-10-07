import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Upload, Target, TrendingUp, AlertCircle, Loader2, FileSpreadsheet, Activity } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { analyzeAdMetrics, analyzeAdSheet } from '../services/metricsAi';
import ReactMarkdown from 'react-markdown';
import Papa from 'papaparse';

export const AdsMetricsAnalyzer: React.FC = () => {
  const { t, language } = useLanguage();
  
  // Tab state
  const [mode, setMode] = useState<'manual' | 'sheet'>('manual');
  
  // Manual inputs
  const [metrics, setMetrics] = useState({
    hookRate: '',
    holdRate: '',
    ctr: '',
    cpm: '',
    cvr: '',
    cpa: '',
    roas: ''
  });

  // Sheet upload
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string>('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSheetFile(file);
      Papa.parse(file, {
        complete: (results) => {
          // Take first 100 rows to avoid token limits, convert back to CSV string
          const sliced = results.data.slice(0, 100);
          const slicedCsv = Papa.unparse(sliced);
          setCsvData(slicedCsv);
        },
        error: (err) => {
          setError(t('فشل قراءة الملف: ') + err.message);
        }
      });
    }
  };

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);
    setIsAnalyzing(true);

    try {
      let analysis = '';
      if (mode === 'manual') {
        analysis = await analyzeAdMetrics(metrics, language);
      } else {
        if (!csvData) {
          throw new Error(t("يرجى رفع ملف صحيح (CSV) أولاً"));
        }
        analysis = await analyzeAdSheet(csvData, language);
      }
      setResult(analysis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('حدث خطأ أثناء التحليل'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('مُحلل أداء الحملات الإعلانية')}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">{t('اكتشف هل الإعلان ناجح أم فاشل بناءً على الـ Metrics (Kill, Punish, Scale)')}</p>
          </div>
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mb-6">
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'manual' ? 'bg-white dark:bg-zinc-700 shadow-sm text-fuchsia-600 dark:text-fuchsia-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            {t("إدخال الأرقام يدوياً")}
          </button>
          <button
            onClick={() => setMode('sheet')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'sheet' ? 'bg-white dark:bg-zinc-700 shadow-sm text-fuchsia-600 dark:text-fuchsia-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            {t("رفع شيت الحملات (CSV)")}
          </button>
        </div>

        {mode === 'manual' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Hook Rate (%)</label>
              <input type="number" value={metrics.hookRate} onChange={(e) => setMetrics({...metrics, hookRate: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 25" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Hold Rate (%)</label>
              <input type="number" value={metrics.holdRate} onChange={(e) => setMetrics({...metrics, holdRate: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 10" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">CTR (%)</label>
              <input type="number" value={metrics.ctr} onChange={(e) => setMetrics({...metrics, ctr: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 2.5" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">CPM</label>
              <input type="number" value={metrics.cpm} onChange={(e) => setMetrics({...metrics, cpm: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 4.50" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">CVR (%)</label>
              <input type="number" value={metrics.cvr} onChange={(e) => setMetrics({...metrics, cvr: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 3" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">CPA</label>
              <input type="number" value={metrics.cpa} onChange={(e) => setMetrics({...metrics, cpa: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 15" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">ROAS</label>
              <input type="number" value={metrics.roas} onChange={(e) => setMetrics({...metrics, roas: e.target.value})} className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" placeholder="e.g. 3.5" />
            </div>
          </div>
        )}

        {mode === 'sheet' && (
          <div className="mb-6">
            <label className="cursor-pointer flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{sheetFile ? sheetFile.name : t('اضغط لرفع شيت الحملات (CSV)')}</span>
              </div>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || (mode === 'sheet' && !csvData)}
          className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
          {isAnalyzing ? t('جاري التحليل...') : t('حلل البيانات واتخذ القرار')}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">{t('نتيجة التحليل وقرار الذكاء الاصطناعي')}</h3>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
};
