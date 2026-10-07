import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Brain, Search, Loader2, Save, Download, Copy, Check, ArrowRight, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateProductBrainReport } from '../services/ai';
import { checkBalance, deductTokens, TOKEN_COSTS } from '../services/billing';
import { useLanguage } from '../LanguageContext';

export interface ProductBrainPageRef {
  handleGenerate: () => Promise<void>;
  isGenerating: boolean;
}

const ProductBrainPage = forwardRef<ProductBrainPageRef, { 
  onTransferToDescription: (text: string) => void,
  productName?: string,
  productDescription?: string,
  setIsGeneratingExternal?: (val: boolean) => void,
  onSaveHistory?: (report: string) => void,
  brandKit?: any,
  applyBrandKit?: boolean
}>(({ 
  onTransferToDescription,
  productName = '',
  productDescription = '',
  setIsGeneratingExternal,
  onSaveHistory,
  brandKit,
  applyBrandKit
}, ref) => {
  const { t } = useLanguage();
  const [targetCountry, setTargetCountry] = useState('Egypt');
  const [price, setPrice] = useState('');
  const [brandInfo, setBrandInfo] = useState('');
  const [audienceInfo, setAudienceInfo] = useState('');
  const [competitorLinks, setCompetitorLinks] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [transferCopied, setTransferCopied] = useState(false);

  const handleGenerate = async () => {
    if (!productName || !productDescription) {
      setError(t('يرجى إدخال اسم المنتج ووصف أو رابط المنتج من قسم بيانات المنتج باللأعلى.'));
      return;
    }

    setIsGenerating(true);
    if (setIsGeneratingExternal) setIsGeneratingExternal(true);
    setError(null);
    setReport(null);

    try {
      await checkBalance(TOKEN_COSTS.TEXT);
      
      const generatedReport = await generateProductBrainReport(
        productName,
        productDescription,
        targetCountry,
        price,
        brandInfo,
        audienceInfo,
        competitorLinks,
        'flash',
        3,
        2000,
        (applyBrandKit && brandKit) ? brandKit : undefined
      );
      
      await deductTokens(TOKEN_COSTS.TEXT, 'Product Brain Report', '', productName);
      setReport(generatedReport);
      if (onSaveHistory) {
        onSaveHistory(generatedReport);
      }
      
    } catch (err: any) {
      console.error(err);
      setError(err?.message || t('حدث خطأ أثناء تحليل المنتج.'));
    } finally {
      setIsGenerating(false);
      if (setIsGeneratingExternal) setIsGeneratingExternal(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handleGenerate,
    isGenerating
  }));

  const handleCopy = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTransfer = () => {
    if (report) {
      onTransferToDescription(report);
      setTransferCopied(true);
      setTimeout(() => setTransferCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('السعر')}
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t('مثال: 350 جنيه')}
                className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#09090b] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('الدولة المستهدفة')}
              </label>
              <input
                type="text"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                placeholder={t('مثال: مصر، السعودية')}
                className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#09090b] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('معلومات عن البراند (اختياري)')}
              </label>
              <input
                type="text"
                value={brandInfo}
                onChange={(e) => setBrandInfo(e.target.value)}
                placeholder={t('نجاحات سابقة، اسم الشركة الأم، الخ')}
                className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#09090b] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('معلومات عن الجمهور (اختياري)')}
              </label>
              <input
                type="text"
                value={audienceInfo}
                onChange={(e) => setAudienceInfo(e.target.value)}
                placeholder={t('مثال: فتيات 18-35 سنة')}
                className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#09090b] focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('روابط المنافسين (اختياري)')}
              </label>
              <input
                type="text"
                value={competitorLinks}
                onChange={(e) => setCompetitorLinks(e.target.value)}
                placeholder={t('استخدم فواصل بين الروابط إن وجدت')}
                className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#09090b] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm mt-4">
              {error}
            </div>
          )}

          {report && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white items-center gap-2 flex">
                  <Check className="w-6 h-6 text-green-500" />
                  {t('التقرير الاستراتيجي الشامل')}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition-all flex items-center justify-center gap-2 px-4"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm font-medium">{copied ? t('تم النسخ') : t('نسخ التقرير')}</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 leading-relaxed prose dark:prose-invert max-w-none prose-sm md:prose-base translate-z-0 overflow-hidden">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleTransfer}
                  className="bg-green-600 hover:bg-green-500 text-white rounded-xl py-3 px-6 font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/25"
                >
                  {transferCopied ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                  {transferCopied ? t('تم النقل') : t('نقل لحقل وصف المنتج الرئيسي')}
                </button>
              </div>
            </div>
          )}
    </div>
  );
});

ProductBrainPage.displayName = 'ProductBrainPage';

export default ProductBrainPage;
