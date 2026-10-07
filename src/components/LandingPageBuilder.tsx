import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wand2, Settings, Image as ImageIcon, MessageSquare, Palette, 
  ToggleLeft, ToggleRight, LayoutTemplate, Clock, Link as LinkIcon,
  ChevronDown, ChevronUp, Loader2, Play, Eye, Code, Smartphone, Monitor, Check, Send
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';


import { generateLandingPageHTML } from '../services/ai';

export interface LandingPageBuilderRef {
  handleGenerate: () => void;
  isGenerating: boolean;
}

// Dynamic questions implemented inside component

export const LANDING_SECTION_TYPES = [
  'Hero Section',
  'Problem Section',
  'Solution Section',
  'Benefits Section',
  'Features Section',
  'Social Proof Section',
  'Offer Section',
  'FAQ Section',
  'Trust Section',
  'Call-to-Action (CTA) Section'
];

const LandingPageBuilder = forwardRef<LandingPageBuilderRef, {
  productName: string;
  productDescription: string;
  brandKit?: any;
  history?: any[];
  onSave?: (data: any) => void;
}>(({ productName, productDescription, brandKit, history = [], onSave }, ref) => {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('desktop');

  // Dynamic Questions
  const getQuestions = () => {
    const q = [
      { id: 'images', text: t('أهلاً بك! لإنشاء صفحة الهبوط، يرجى تزويدي بروابط الصور (أو اتركها فارغة لتخطيها).') },
      { id: 'videos', text: t('ممتاز! هل لديك روابط لأي فيديوهات ترغب بإضافتها؟') },
      { id: 'description', text: t('يرجى كتابة وصف مفصل للمنتج وما يميزه لكي أتمكن من كتابة المحتوى الإقناعي.') },
      { id: 'languageDialect', text: t('ما هي اللغة أو اللهجة التي تفضل كتابة الصفحة بها؟ (مثال: فصحى، سعودية بيضاء، مصرية، الخ)') },
      { id: 'colorsTheme', text: t('ما هي الألوان التي تفضل استخدامها في الصفحة؟ (مثال: أزرق مع برتقالي، غامق، فاتح)') },
      { 
        id: 'sections', 
        text: t(`كم عدد الأقسام التي تريدها في الصفحة؟ وما هي؟ حدد من أنواع الأقسام العشرة التالية:
1. Hero Section
2. Problem Section
3. Solution Section
4. Benefits Section
5. Features Section
6. Social Proof Section
7. Offer Section
8. FAQ Section
9. Trust Section
10. Call-to-Action (CTA) Section`) 
      },
      { id: 'copyLength', text: t('هل تفضل أن تكون الكوبي (النصوص) طويلة جداً ومقنعة أم متوسطة ومباشرة؟') },
      { id: 'ctaAnimation', text: t('هل تريد إضافة أنيميشن لأزرار الشراء (CTA) لجذب الانتباه؟ (نعم/لا)') },
      { id: 'includeReviews', text: t('هل ترغب بإضافة قسم للتقييمات والآراء (Reviews)؟ (نعم/لا)') },
      { id: 'reviewsText', text: t('إذا اخترت إضافة التقييمات، يرجى كتابة التقييمات هنا (أو تخطى ذلك ليتم توليدها تلقائياً).') },
      { id: 'generationModel', text: t('هل تود بناء صفحة الهبوط بنموذج مُعلم تقليدي (أساسي)، أم نموذج مُعلم (كاجوال)، أم بنموذج حُر يعتمد على الذكاء الاصطناعي (حر)، أم بنموذج حر احترافي صارم (Anti AI Slop)؟ (أجب بـ: أساسي / كاجوال / حر / Anti AI Slop)') },
      { id: 'aiModelChoice', text: t('أي نموذج ذكاء اصطناعي تفضل استخدامه للتوليد؟ (Flash / Pro). الفلاش أسرع وأرخص، والبرو أدق وأقوى.') }
    ];
    if (brandKit) {
      q.push({ id: 'applyBrand', text: t('تم رصد هوية براند نشطة') + ` (${brandKit.name}). ` + t('هل تود تطبيقها على صفحة الهبوط؟ (نعم/لا)') });
    }
    return q;
  };
  
  const currentQuestions = getQuestions();

  // Chat State
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>([
    { role: 'ai', text: getQuestions()[0].text }
  ]);
  const [inputValue, setInputValue] = useState('');
  
  // Collected Data
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [landingHTML, setLandingHTML] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSendMessage = () => {
    const userMsg = inputValue.trim() || 'تخطي';
    
    const questions = currentQuestions;
    if (currentStep >= questions.length) {
      if (!inputValue.trim()) return;
      setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setInputValue('');
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: t('جاري تطبيق تعديلاتك على الصفحة، يرجى الانتظار...') }]);
        handleGenerate(answers, userMsg);
      }, 500);
      return;
    }

    if (!inputValue.trim() && currentStep !== 0 && currentStep !== 1) return; // allow empty for images/videos
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    const currentQ = questions[currentStep];
    const newAnswers = { ...answers, [currentQ.id]: userMsg };
    setAnswers(newAnswers);
    setInputValue('');

    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: questions[currentStep + 1].text }]);
        setCurrentStep(prev => prev + 1);
      }, 500);
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: t('شكراً لك! جاري بناء وتكويد صفحة الهبوط باحترافية عالية، يرجى الانتظار قليلاً...') }]);
        setCurrentStep(prev => prev + 1);
        handleGenerate(newAnswers);
      }, 500);
    }
  };

  const handleGenerate = async (finalAnswers: Record<string, string>, editRequest?: string) => {
    setIsGenerating(true);
    try {
      
      let descriptionWithFeedback = finalAnswers.description || productDescription || 'وصف منتج افتراضي';
      const successfulLandingPages = history.filter(h => h.feedback === 'success' && (h.type === 'landingBuilder' || h.type === 'landing'));
      if (successfulLandingPages.length > 0) {
         descriptionWithFeedback += "\n\n[ملاحظات من تجارب سابقة ناجحة للمستخدم - LEARN FROM THIS]:\n";
         successfulLandingPages.slice(0, 2).forEach((item, idx) => {
            descriptionWithFeedback += `Example ${idx + 1} SUCCESSFUL OUTPUT: ${typeof item.content === 'string' ? item.content.substring(0, 500) : ''}...\n`;
         });
         descriptionWithFeedback += "يرجى محاكاة نفس الإبداع والهيكلية في المخرجات الناجحة.\n";
      }

      const isAntiSlopModel = finalAnswers.generationModel && finalAnswers.generationModel.toLowerCase().includes('anti');
      const isFreeModel = finalAnswers.generationModel && finalAnswers.generationModel.includes('حر');
      const isCasualModel = finalAnswers.generationModel && finalAnswers.generationModel.includes('كاجوال');
      const generationModel = isAntiSlopModel ? 'free-anti-slop' : (isCasualModel ? 'template-casual' : (isFreeModel ? 'free' : 'template'));
      const isBrandKitApplied = finalAnswers.applyBrand && finalAnswers.applyBrand.includes('نعم') ? true : false;
      const finalBrandKit = (brandKit && isBrandKitApplied) || (brandKit && !finalAnswers.applyBrand) ? brandKit : undefined;

      const htmlStr = await generateLandingPageHTML(
        productName || 'المنتج الخارق',
        descriptionWithFeedback,
        '100 ج.م',
        '180 ج.م',
        '#', // checkoutLink
        '#09090b', // primaryColor
        finalAnswers.images && finalAnswers.images !== 'تخطي' ? finalAnswers.images.split(',') : [],
        finalAnswers.videos && finalAnswers.videos !== 'تخطي' ? finalAnswers.videos.split(',') : [],
        finalAnswers.sections && finalAnswers.sections !== 'تخطي' 
          ? finalAnswers.sections.split(/[\n,،]+/).map(s => {
              const trimmed = s.trim();
              const num = parseInt(trimmed, 10);
              if (!isNaN(num) && num >= 1 && num <= LANDING_SECTION_TYPES.length) {
                return LANDING_SECTION_TYPES[num - 1];
              }
              return trimmed;
            }).filter(Boolean)
          : ['Hero Section', 'Benefits Section', 'Call-to-Action (CTA) Section'],
        finalAnswers.copyLength?.includes('طويل') ? 'long' : 'medium',
        finalAnswers.ctaAnimation?.includes('نعم') ? true : false,
        finalBrandKit,
        finalAnswers.languageDialect && finalAnswers.languageDialect !== 'تخطي' ? finalAnswers.languageDialect : '',
        finalAnswers.colorsTheme && finalAnswers.colorsTheme !== 'تخطي' ? finalAnswers.colorsTheme : '',
        editRequest ? landingHTML || '' : '',
        editRequest || '',
        'easyorders',
        isFreeModel ? 'free' : 'template',
        finalAnswers.includeReviews?.includes('نعم') ? true : false,
        finalAnswers.reviewsText && finalAnswers.reviewsText !== 'تخطي' ? finalAnswers.reviewsText : '',
        finalAnswers.aiModelChoice?.toLowerCase().includes('flash') ? 'flash' : 'pro'
      );
      setLandingHTML(htmlStr);
      setActiveView('preview');
      if (editRequest) {
        setMessages(prev => [...prev, { role: 'ai', text: 'تم تطبيق التعديلات بنجاح! يمكنك معاينتها الآن أو طلب تعديلات إضافية.' }]);
      }
      if (onSave) {
        onSave({ html: htmlStr });
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', text: 'عذراً، حدث خطأ أثناء بناء الصفحة. يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handleGenerate: () => handleGenerate(answers),
    isGenerating
  }));

  return (
    <div className="flex flex-col h-[80vh] min-h-[600px] w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-100 to-purple-100 dark:from-fuchsia-900/30 dark:to-purple-900/30 flex items-center justify-center border border-amber-200 dark:border-zinc-800/50 dark:border-fuchsia-700/30 shadow-inner">
            <LayoutTemplate className="w-5 h-5 text-[#F0B21B] dark:text-[#F0B21B]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{t('باني صفحة الهبوط الذكي')}</h2>
            <p className="text-xs text-zinc-500 font-medium">تصميم احترافي CRO - جاهز للبيع</p>
          </div>
        </div>
        
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveView('editor')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === 'editor' ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            {t('المحادثة')}
          </button>
          <button 
            onClick={() => setActiveView('preview')}
            disabled={!landingHTML}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${activeView === 'preview' ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            {t('معاينة')}
          </button>
          {activeView === 'preview' && (
            <button
              onClick={() => {
                const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                if (iframe && iframe.contentWindow) {
                   let htmlStr = iframe.contentWindow.document.documentElement.outerHTML;
                   htmlStr = htmlStr.replace(/\s*contenteditable="true"/gi, '');
                   navigator.clipboard.writeText(htmlStr);
                   alert('تم نسخ الكود الاحترافي بنجاح!');
                }
              }}
              className="ml-1 px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white shadow hover:bg-emerald-600 transition-all"
            >
              <Code className="w-4 h-4" />
              {t('نسخ الكود')}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeView === 'editor' ? (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col p-6 bg-zinc-50 dark:bg-black/20"
            >
              <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-2">
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl whitespace-pre-line leading-relaxed ${msg.role === 'user' ? 'bg-[#F0B21B] text-white rounded-tl-sm' : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm border border-zinc-100 dark:border-zinc-700 rounded-tr-sm'}`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isGenerating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl rounded-tr-sm shadow-sm border border-zinc-100 dark:border-zinc-700 flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-[#F0B21B] animate-spin" />
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">يتم الآن كتابة وتكويد الصفحة...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {!isGenerating && (
                <div className="flex flex-col gap-2 mt-4">
                  {currentStep < currentQuestions.length && currentQuestions[currentStep]?.id === 'sections' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-amber-50 dark:bg-zinc-900/70 dark:bg-fuchsia-950/30 border border-amber-200 dark:border-zinc-800 dark:border-fuchsia-800/50 rounded-2xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-fuchsia-900 dark:text-fuchsia-300">
                        <span className="flex items-center gap-1.5">
                          <LayoutTemplate className="w-3.5 h-3.5 text-[#F0B21B]" />
                          {t("حدد من أنواع الأقسام العشرة بالنقر أو الكتابة:")}
                        </span>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => {
                              setInputValue(LANDING_SECTION_TYPES.join(', '));
                            }}
                            className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#F0B21B] text-white hover:bg-fuchsia-700 transition-colors shadow-sm font-medium"
                          >
                            {t("تحديد الكل (10 أقسام)")}
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setInputValue('');
                            }}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 transition-colors font-medium"
                          >
                            {t("مسح")}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {LANDING_SECTION_TYPES.map((secName, sIdx) => {
                          const isSelected = inputValue.includes(secName);
                          return (
                            <button
                              key={secName}
                              type="button"
                              onClick={() => {
                                const currentList = inputValue
                                  ? inputValue.split(/[\n,،]+/).map(s => s.trim()).filter(Boolean)
                                  : [];
                                let updatedList: string[];
                                if (currentList.includes(secName)) {
                                  updatedList = currentList.filter(s => s !== secName);
                                } else {
                                  updatedList = [...currentList, secName];
                                }
                                setInputValue(updatedList.join(', '));
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                                isSelected
                                  ? 'bg-[#F0B21B] text-white border-fuchsia-600 shadow-sm'
                                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-400'
                              }`}
                            >
                              <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                              }`}>
                                {sIdx + 1}
                              </span>
                              <span>{secName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  <div className="relative bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-end gap-2">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={currentStep >= currentQuestions.length ? "اكتب التعديل المطلوب هنا..." : currentStep < 2 ? "أدخل الرابط (أو اضغط إرسال للتخطي)..." : "اكتب إجابتك هنا..."}
                      className="flex-1 bg-transparent border-0 outline-none p-3 text-zinc-900 dark:text-white resize-none min-h-[50px] max-h-[150px]"
                      rows={Math.min(5, Math.max(1, inputValue.split('\n').length))}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-3 bg-[#F0B21B] hover:bg-fuchsia-700 text-white rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-[#F0B21B]/20 mb-1"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex items-center justify-center bg-zinc-100 dark:bg-black p-4"
            >
              <div className={`relative transition-all duration-500 ease-in-out ${previewDevice === 'mobile' ? 'w-[375px] h-[812px] border-[12px] border-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden' : 'w-full max-w-5xl h-full border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden bg-white'}`}>
                
                {/* Device controls overlay */}
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                   <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-full ${previewDevice === 'mobile' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 shadow'}`}>
                      <Smartphone className="w-4 h-4" />
                   </button>
                   <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-full ${previewDevice === 'desktop' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 shadow'}`}>
                      <Monitor className="w-4 h-4" />
                   </button>
                </div>

                <div className="w-full h-full overflow-hidden bg-white view-container relative group">
                  <iframe 
                    id="preview-iframe"
                    srcDoc={landingHTML || ''}
                    title="Landing Page Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default LandingPageBuilder;
