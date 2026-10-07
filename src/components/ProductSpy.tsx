import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Search, Copy, Check, Sparkles, Image as ImageIcon, Video, Target, TrendingUp, Layers, Upload, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { analyzeProductForSpy } from '../services/ai';

export const ProductSpy: React.FC = () => {
    const { t } = useLanguage();
  const cancelFlagRef = useRef<boolean>(false);
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fbCountry, setFbCountry] = useState('ALL');
  const [copiedHookIndex, setCopiedHookIndex] = useState<number | null>(null);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت'));
        return;
      }
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
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
  };

    const handleCopyHook = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedHookIndex(idx);
    setTimeout(() => setCopiedHookIndex(null), 2000);
  };

  const openSearch = (platform: string, query: string) => {
    let url = '';
    const q = encodeURIComponent(query);
    switch (platform) {
      case 'tiktok': url = `https://www.tiktok.com/search?q=${q}`; break;
      case 'fbAds': url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${fbCountry}&q=${q}&search_type=keyword_unordered&media_type=all`; break;
      case 'facebook': url = `https://www.facebook.com/search/videos/?q=${q}`; break;
      case 'instagram': url = `https://www.instagram.com/explore/search/keyword/?q=${q}`; break;
      case 'pinterest': url = `https://www.pinterest.com/search/pins/?q=${q}`; break;
      case 'youtube': url = `https://www.youtube.com/results?search_query=${q}+shorts`; break;
    }
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/30 text-[#F0B21B] dark:text-[#F0B21B] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('صائد المنتجات والإعلانات')}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">{t('ابحث عن إعلانات وفيديوهات منتجك في كل المنصات بدقة واحترافية')}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t('اسم المنتج أو وصفه')}
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={t('مثال: مكنسة كهربائية لاسلكية قابلة للطي')}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F0B21B]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t('صورة المنتج (اختياري للبحث بالذكاء الاصطناعي)')}
            </label>
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg" />
                  <button 
                    onClick={() => { setProductImage(null); setImagePreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20 text-[#F0B21B] dark:text-[#F0B21B] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-[#F0B21B] dark:text-[#F0B21B]">{t('اضغط لرفع صورة')}</span>
                    <p className="text-xs text-zinc-500 mt-1">{t('PNG, JPG حتى 5 ميجا')}</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {isAnalyzing ? (
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
              className="w-full bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-amber-500/20/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {t('إنشاء خطة البحث والروابط')}
            </button>
          )}
        </div>
      </div>

      {results && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[#F0B21B]" />
              {t('منصة البحث السريع (ضغطة واحدة)')}
            </h3>
            
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <Layers className="w-5 h-5" />
                  <span className="font-semibold">{t("دولة البحث في مكتبة إعلانات فيسبوك:")}</span>
                </div>
                <select 
                  value={fbCountry} 
                  onChange={(e) => setFbCountry(e.target.value)}
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 outline-none focus:border-blue-500 w-full md:w-auto"
                >
                  <option value="ALL">{t("جميع الدول (All)")}</option>
                  <option value="US">{t("الولايات المتحدة (US)")}</option>
                  <option value="GB">{t("المملكة المتحدة (UK)")}</option>
                  <option value="EG">{t("مصر (EG)")}</option>
                  <option value="SA">{t("السعودية (SA)")}</option>
                  <option value="AE">{t("الإمارات (AE)")}</option>
                  <option value="KW">{t("الكويت (KW)")}</option>
                  <option value="QA">{t("قطر (QA)")}</option>
                  <option value="BH">{t("البحرين (BH)")}</option>
                  <option value="OM">{t("عُمان (OM)")}</option>
                  <option value="JO">{t("الأردن (JO)")}</option>
                  <option value="MA">{t("المغرب (MA)")}</option>
                  <option value="DZ">{t("الجزائر (DZ)")}</option>
                  <option value="CA">{t("كندا (CA)")}</option>
                  <option value="AU">{t("أستراليا (AU)")}</option>
                </select>
              </div>

              {results.keywordHooks && results.keywordHooks.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    {t('هوكات الكلمات المفتاحية للبحث (10+ Keyword Search Hooks)')}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {t('كلمات مفتاحية وزوايا بحث ذكية تفكر في مشكلة ودوافع الزبون، اضغط على أي منصة للبحث المباشر بها:')}
                  </p>
                </div>
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                  {results.keywordHooks.length} {t('هوك مميز')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.keywordHooks.map((hObj: any, idx: number) => (
                  <div key={idx} className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 flex flex-col justify-between gap-3 hover:border-fuchsia-400 dark:hover:border-fuchsia-600 transition-all">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-bold text-base text-zinc-900 dark:text-white leading-snug">{hObj.hook}</span>
                        <button
                          onClick={() => handleCopyHook(hObj.hook, idx)}
                          className="p-1.5 text-zinc-400 hover:text-[#F0B21B] dark:hover:text-[#F0B21B] bg-white dark:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-600 transition-colors shrink-0"
                          title={t('نسخ')}
                        >
                          {copiedHookIndex === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      {hObj.angle && (
                        <p className="text-xs text-[#F0B21B] dark:text-[#F0B21B] bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20 px-2.5 py-1 rounded-md inline-block font-medium">
                          🎯 {hObj.angle}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                      <span className="text-[11px] text-zinc-400 font-medium ml-1">{t('بحث سريع:')}</span>
                      <button onClick={() => openSearch('fbAds', hObj.hook)} className="px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 font-medium transition-colors">
                        FB Ads
                      </button>
                      <button onClick={() => openSearch('tiktok', hObj.hook)} className="px-2.5 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-300 font-medium transition-colors">
                        TikTok
                      </button>
                      <button onClick={() => openSearch('youtube', hObj.hook)} className="px-2.5 py-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 font-medium transition-colors">
                        Shorts
                      </button>
                      <button onClick={() => openSearch('instagram', hObj.hook)} className="px-2.5 py-1 text-xs bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-100 font-medium transition-colors">
                        Insta
                      </button>
                      <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(hObj.hook)}`, '_blank')} className="px-2.5 py-1 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 font-medium transition-colors">
                        Google
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

              <div className="space-y-8">
              {results.queries.map((qObj: any, idx: number) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200">{t('البحث عن:')} "{qObj.query}"</h4>
                    <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-md">{qObj.reason}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button onClick={() => openSearch('fbAds', qObj.query)} className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors font-medium text-sm">
                      <Layers className="w-4 h-4" /> FB Ads Library
                    </button>
                    <button onClick={() => openSearch('tiktok', qObj.query)} className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors font-medium text-sm">
                      <Video className="w-4 h-4" /> TikTok
                    </button>
                    <button onClick={() => openSearch('facebook', qObj.query)} className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-xl transition-colors font-medium text-sm">
                      <Search className="w-4 h-4" /> FB Videos
                    </button>
                    <button onClick={() => openSearch('instagram', qObj.query)} className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/40 rounded-xl transition-colors font-medium text-sm">
                      <ImageIcon className="w-4 h-4" /> Instagram
                    </button>
                    <button onClick={() => openSearch('pinterest', qObj.query)} className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors font-medium text-sm">
                      <TrendingUp className="w-4 h-4" /> Pinterest
                    </button>
                    <button onClick={() => openSearch('youtube', qObj.query)} className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors font-medium text-sm">
                      <Video className="w-4 h-4" /> YT Shorts
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-4">{t('البحث المتقدم بالصور (Google Lens)')}</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {t('للبحث بدقة 100% عن نفس المنتج في المتاجر الأخرى أو الحصول على فيديوهاته، يمكنك استخدام Google Lens مباشرة:')}
              </p>
              <button onClick={() => window.open('https://lens.google.com/search?p', '_blank')} className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-xl transition-colors font-medium w-full md:w-auto">
                <Search className="w-4 h-4" /> {t('افتح Google Lens')}
              </button>
            </div>
          </div>

          {results.links && results.links.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-[#F0B21B]" />
                {t('روابط فيديوهات وإعلانات مقترحة (بواسطة AI)')}
              </h3>
              <div className="space-y-4">
                {results.links.map((link: any, idx: number) => {
                  let Icon = LinkIcon;
                  let colorClass = "text-zinc-500";
                  let bgClass = "bg-zinc-100 dark:bg-zinc-800";
                  
                  if (link.platform === 'tiktok') { Icon = Video; colorClass = "text-zinc-900 dark:text-white"; bgClass = "bg-zinc-100 dark:bg-zinc-800"; }
                  if (link.platform === 'facebook' || link.platform === 'fbAds') { Icon = Layers; colorClass = "text-blue-600"; bgClass = "bg-blue-50 dark:bg-blue-900/20"; }
                  if (link.platform === 'instagram') { Icon = ImageIcon; colorClass = "text-pink-600"; bgClass = "bg-pink-50 dark:bg-pink-900/20"; }
                  if (link.platform === 'pinterest') { Icon = TrendingUp; colorClass = "text-red-600"; bgClass = "bg-red-50 dark:bg-red-900/20"; }
                  if (link.platform === 'youtube') { Icon = Video; colorClass = "text-red-600"; bgClass = "bg-red-50 dark:bg-red-900/20"; }
                  if (link.platform === 'store') { Icon = Search; colorClass = "text-emerald-600"; bgClass = "bg-emerald-50 dark:bg-emerald-900/20"; }

                  return (
                    <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-start gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-700 transition-colors group">
                      <div className={`p-3 rounded-lg ${bgClass} ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-zinc-900 dark:text-white group-hover:text-[#F0B21B] dark:group-hover:text-[#F0B21B] transition-colors line-clamp-1">{link.title || link.url}</h4>
                        <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                          <span className="capitalize">{link.platform}</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t('نسبة المطابقة:')} {link.relevance || 'عالية'}</span>
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
              {t('الهاشتاجات المقترحة للبحث')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {results.hashtags.map((tag: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => openSearch('tiktok', tag)}
                  className="px-3 py-1.5 bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20 text-[#F0B21B] dark:text-[#F0B21B] rounded-lg text-sm font-medium hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/40 transition-colors"
                >
                  #{tag.replace('#', '')}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
