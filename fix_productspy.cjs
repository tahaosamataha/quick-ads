const fs = require('fs');
let code = fs.readFileSync('src/components/ProductSpy.tsx', 'utf8');

// Add useRef
code = code.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useRef } from 'react';");

// Add cancelFlagRef inside component
const refInsert = `  const { t } = useLanguage();
  const cancelFlagRef = useRef<boolean>(false);`;
code = code.replace(/const \{ t \} = useLanguage\(\);/, refInsert);

// Update handleAnalyze
const analyzeFunc = `const handleAnalyze = async () => {
    if (!productName.trim() && !imagePreview) {
      setError(t('يرجى إدخال اسم المنتج أو رفع صورة'));
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    cancelFlagRef.current = false;
    try {
      const data = await analyzeProductForSpy(productName, imagePreview);
      if (cancelFlagRef.current) return;
      setResults(data);
    } catch (err: any) {
      if (cancelFlagRef.current) return;
      console.error(err);
      setError(err.message || t('حدث خطأ أثناء التحليل'));
    } finally {
      if (!cancelFlagRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleStop = () => {
    cancelFlagRef.current = true;
    setIsAnalyzing(false);
    setError(t('تم إيقاف العملية.'));
  };`;

code = code.replace(/const handleAnalyze = async \(\) => \{[\s\S]*?\} finally \{[\s\S]*?\}\s*\};/, analyzeFunc);

// Update Button
const oldButton = `          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!productName && !imagePreview)}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-fuchsia-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {isAnalyzing ? t('جاري تحليل المنتج...') : t('إنشاء خطة البحث والروابط')}
          </button>`;

const newButton = `          {isAnalyzing ? (
            <button
              onClick={handleStop}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('جاري التحليل... اضغط للإيقاف')}
            </button>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={!productName && !imagePreview}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-fuchsia-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {t('إنشاء خطة البحث والروابط')}
            </button>
          )}`;

code = code.replace(oldButton, newButton);

fs.writeFileSync('src/components/ProductSpy.tsx', code);
