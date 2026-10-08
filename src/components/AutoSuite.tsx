import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { AppContext } from '../App';
import { 
  Bot, Sparkles, Target, FileText, Mic, Layers, Brain, 
  ImageIcon, LayoutTemplate, Check, AlertCircle, Loader2, 
  Upload, Copy, Download, Search, Video, Play, ExternalLink,
  Store, Camera, MessageSquare, Tag, Phone, User as UserIcon, Facebook
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { 
    analyzeProduct,
analyzeAdCreatives,
analyzeProductForSpy, 
  generateVideoScript, 
  generateSpeech, 
  generateFbAdCopies, 
  generateSmartAngles, 
  generateProductBrainReport, 
  generateCreativeImagePrompts, 
  generateLandingPageHTML,
  generateFunnelCopy,
  generateVideoScenes,
  generateFlowCharacter,
  generateTextOnVisual,
  generateScenePrompts 
} from '../services/ai';

export const AutoSuite: React.FC = () => {
  const { t, language } = useLanguage();
  const appCtx = React.useContext(AppContext) || {};
  const {
    productName, setProductName,
    description, setDescription,
    dialect, setDialect,
    targetAudience, setTargetAudience,
    setGeneratedScripts, setGeneratedFbAds,
    setGeneratedFunnelCopy, setGeneratedCreativePrompts,
    setGeneratedVideoScenes, setGeneratedTextOnVisual,
    setGeneratedSmartAngles, setGeneratedFlowCharacter
  } = appCtx;

  const isRtl = language === 'ar';

  // Form Inputs
  
  
  
  
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Landing Page Specific Fields
  const [imageUrls, setImageUrls] = useState('');
  const [videoUrls, setVideoUrls] = useState('');
  const [testimonials, setTestimonials] = useState('');
  const [storeName, setStoreName] = useState('');
  const [pricingInfo, setPricingInfo] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  
  // New States

  const [creativePromptMode, setCreativePromptMode] = useState<'standalone' | 'carousel' | 'landing_page'>('standalone');
  const [creativePromptsCount, setCreativePromptsCount] = useState<number>(4);

  const [creativeColorTheme, setCreativeColorTheme] = useState('');
  const [creativeFontFamily, setCreativeFontFamily] = useState('Cairo');
  const [creativeLandingSections, setCreativeLandingSections] = useState<string[]>([]);

  const [landingThemeColor, setLandingThemeColor] = useState('indigo');
  const [useAILandingBg, setUseAILandingBg] = useState(true);

  const [funnelCopyLength, setFunnelCopyLength] = useState<'auto' | 'long' | 'short'>('auto');
  const [scriptDuration, setScriptDuration] = useState('30_seconds');
  const [scriptVoiceGender, setScriptVoiceGender] = useState('auto');
  const [scriptCount, setScriptCount] = useState<number>(3);
  const [autoScriptAngles, setAutoScriptAngles] = useState(false);
  const [selectedScriptTypes, setSelectedScriptTypes] = useState<string[]>([
    'مشكلة وحل (Problem-Solution)',
    'قبل وبعد (Before-After)',
    'توصية صانع محتوى (UGC)'
  ]);
  const [selectedScriptGenders, setSelectedScriptGenders] = useState<string[]>(Array(10).fill('auto'));

  const [autoFbAngles, setAutoFbAngles] = useState(false);
  const [fbCampaignObjective, setFbCampaignObjective] = useState<string>('زيادة المبيعات (Sales)');
  const [selectedFbAdTypes, setSelectedFbAdTypes] = useState<string[]>([
    'إعلان مبيعات مباشر',
    'إعلان مميزات وفوائد',
    'إعلان بناء وعي (Awareness)'
  ]);
  
  const [fbAdGoal, setFbAdGoal] = useState('conversion');
  const [fbAdCount, setFbAdCount] = useState<number>(3);




  const [videoMode, setVideoMode] = useState<'consecutive' | 'hooks'>('consecutive');
  const [videoDuration, setVideoDuration] = useState('40s');
  const [flowVoiceGender, setFlowVoiceGender] = useState('female');
  const [textVisualMode, setTextVisualMode] = useState<'sequential' | 'high_ctr_fixed'>('sequential');
  const [textVisualCount, setTextVisualCount] = useState(4);
  const [photoshootCount, setPhotoshootCount] = useState<number>(4);

  // Selected Sections to Auto Generate
  const [selectedSections, setSelectedSections] = useState({
    productSpy: true,
    scriptAndVoice: true,
    fbAds: true,
    smartAngles: true,
    productBrain: true,
    visualPrompts: false,
    landingPage: false,
    funnelCopy: false,
    videoScenes: false,
    flowCharacter: false,
    textOnVisual: false,
    photoshoot: false,

    geminiLanding: false,
    geminiAds: false,

  });

  // Generation state & progress
  
  const [autoModel, setAutoModel] = useState<'pro' | 'flash'>('pro');
const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cancelFlagRef = useRef<boolean>(false);

  const handleStopAutomation = () => {
    cancelFlagRef.current = true;
    setIsGenerating(false);
    setCurrentStepText('تم إيقاف التوليد');
  };


  // Generated Results
  const [results, setResults] = useState<{
    spyData?: any;
    scripts?: any[];
    scriptAudios?: Record<number, any>;
    fbAds?: any;
    angles?: any;
    brainReport?: any;
    prompts?: any[];
    landingHtml?: string;
    funnelCopy?: any;
    videoScenes?: any;
    flowCharacter?: any;
    textOnVisual?: any;
    photoshootPrompts?: any[];
    geminiLandingData?: any;
    geminiAdsData?: any;
  } | null>(null);

  // Active Output Tab
  const [activeOutputTab, setActiveOutputTab] = useState<'spy' | 'scripts' | 'fbAds' | 'angles' | 'brain' | 'prompts' | 'landing' | 'funnel' | 'video' | 'flow' | 'textVisual' | 'photoshoot' | 'geminiLanding' | 'geminiAds'>('spy');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [fbCountry, setFbCountry] = useState('ALL');

  const toggleSection = (key: keyof typeof selectedSections) => {
    setSelectedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRunAutomation = async () => {
    cancelFlagRef.current = false;
    setError(null);

    // Validation checks
    if (!description.trim() && !productName.trim()) {
      setError(t('يرجى كتابة اسم أو وصف المنتج على الأقل لبدء التوليد التلقائي.'));
      return;
    }

    // Check mandatory fields for Product Spy if selected
    if (cancelFlagRef.current) return;
      if (selectedSections.productSpy) {
      if (!productName.trim() && !imagePreview) {
        setError(t('تنبيه هام: قسم صائد المنتجات يتطلب إدخال اسم المنتج أو رفع صورته إجبارياً للتحليل البصري والبحث عن الهوكات والإعلانات.'));
        return;
      }
    }

    setIsGenerating(true);
    setProgressPercent(5);
    setCurrentStepText(t('بدء تشغيل محرك الأتمتة الشاملة...'));

    const newResults: any = {};

    try {
      // 1. Product Spy & Keyword Hooks
      if (cancelFlagRef.current) return;
      if (selectedSections.productSpy) {
        setCurrentStepText(t('1/6: جاري تحليل المنتج واستخراج هوكات البحث والروابط...'));
        setProgressPercent(15);
        try {
          const spyData = await analyzeProductForSpy(productName || description, imagePreview);
          newResults.spyData = spyData;
        } catch (e: any) {
          console.error("Spy error:", e);
        }
      }

      // 2. Scripts & Auto Voiceovers
      if (cancelFlagRef.current) return;
      if (selectedSections.scriptAndVoice) {
        setCurrentStepText(t('2/6: جاري كتابة إسكريبتات الفيديو الإعلانية...'));
        setProgressPercent(35);
        try {
          const fullDesc = `${productName ? 'اسم المنتج: ' + productName + '\n' : ''}${description}${targetAudience ? '\nالجمهور: ' + targetAudience : ''}`;
          const scriptTypes = autoScriptAngles 
            ? Array.from({ length: scriptCount }).map(() => ({ type: 'زاوية مختلفة (Auto Angle)', gender: scriptVoiceGender }))
            : selectedScriptTypes.slice(0, scriptCount).map((type, idx) => ({ type, gender: selectedScriptGenders[idx] || scriptVoiceGender }));
          const scripts = await generateVideoScript(fullDesc, dialect, scriptDuration, scriptTypes, autoModel, scriptVoiceGender, 3, 3000, true);
          newResults.scripts = scripts;

          // Generate Speech Auto for scripts
          setCurrentStepText(t('2/6: جاري توليد التعليق الصوتي التلقائي للإسكريبتات...'));
          setProgressPercent(50);
          const audios: Record<number, any> = {};
          for (let i = 0; i < scripts.length; i++) {
            try {
              const audioUrls = await generateSpeech(scripts[i].content, scripts[i].voiceOverInstructions, scripts[i].type, 'auto', null);
              audios[i] = audioUrls;
            } catch (err) {
              console.error(`Audio gen failed for script ${i}:`, err);
            }
          }
          newResults.scriptAudios = audios;
        } catch (e: any) {
          console.error("Script & Voice error:", e);
        }
      }

      // 3. Facebook Ads Copy
      if (cancelFlagRef.current) return;
      if (selectedSections.fbAds) {
        setCurrentStepText(t('3/6: جاري صياغة نصوص إعلانات فيسبوك الإقناعية...'));
        setProgressPercent(65);
        try {
          const fullDesc = `${productName ? productName + ': ' : ''}${description}`;
          const adTypes = autoFbAngles ? Array(fbAdCount).fill('زاوية مختلفة (Auto Angle)') : selectedFbAdTypes.slice(0, fbAdCount);
          const fbAds = await generateFbAdCopies(fullDesc, dialect, autoModel, adTypes, 3, 3000, undefined, true, fbCampaignObjective);
          newResults.fbAds = fbAds;
        } catch (e: any) {
          console.error("FB Ads error:", e);
        }
      }

      // 4. Smart Angles
      if (selectedSections.smartAngles) {
        setCurrentStepText(t('4/6: جاري توليد الزوايا الإعلانية الذكية...'));
        setProgressPercent(75);
        try {
          const fullDesc = `${productName ? productName + ': ' : ''}${description}`;
          const angles = await generateSmartAngles(fullDesc, autoModel);
          newResults.angles = angles;
        } catch (e: any) {
          console.error("Smart Angles error:", e);
        }
      }

      // 5. Product Brain
      if (cancelFlagRef.current) return;
      if (selectedSections.productBrain) {
        setCurrentStepText(t('5/6: جاري التفكير التحليلي وإعداد تقرير عقل المنتج...'));
        setProgressPercent(85);
        try {
          const fullDesc = `${productName ? productName + ': ' : ''}${description}`;
          const brain = await generateProductBrainReport(productName || 'منتج', description, dialect, pricingInfo, storeName, targetAudience, '', autoModel);
          newResults.brainReport = brain;
        } catch (e: any) {
          console.error("Product Brain error:", e);
        }
      }

      // 6. Visual Prompts
      if (cancelFlagRef.current) return;
      if (selectedSections.visualPrompts) {
        setCurrentStepText(t('جاري صياغة أوامر صور وفيديوهات الإعلانات...'));
        try {
          const fullDesc = `${productName ? productName + ': ' : ''}${description}`;
          const prompts = await generateCreativeImagePrompts(fullDesc, dialect, creativePromptsCount, creativePromptMode, creativeLandingSections, creativeFontFamily, creativeColorTheme, autoModel);
          newResults.prompts = prompts;
        } catch (e: any) {
          console.error("Visual Prompts error:", e);
        }
      }

      
      // 7. Funnel Copy
      if (cancelFlagRef.current) return;
      if (selectedSections.funnelCopy) {
        setCurrentStepText(t('جاري صياغة محتوى صفحة المنتج كفانل...'));
        try {
          const fullDesc = `${productName ? productName + ': ' : ''}${description}`;
          const funnel = await generateFunnelCopy(fullDesc, dialect, autoModel, 3, 3000, undefined, funnelCopyLength);
          newResults.funnelCopy = funnel;
        } catch (e: any) {
          console.error("Funnel Copy error:", e);
        }
      }

      // 8. Video Scenes
      if (cancelFlagRef.current) return;
      if (selectedSections.videoScenes) {
        setCurrentStepText(t('جاري توليد أوامر فيديو (Veo / Flow)...'));
        try {
          const fullDesc = `${productName ? productName + ': ' : ''}${description}`;
          const scenes = await generateVideoScenes(fullDesc, dialect, videoMode, videoDuration, autoModel);
          newResults.videoScenes = scenes;
        } catch (e: any) {
          console.error("Video Scenes error:", e);
        }
      }

      // 9. Flow Character
      if (cancelFlagRef.current) return;
      if (selectedSections.flowCharacter) {
        setCurrentStepText(t('جاري إنشاء شخصية إعلانية لـ Flow...'));
        try {
          const fullDesc = `${productName ? productName + ': ' : ''}${description}`;
          const char = await generateFlowCharacter(fullDesc, dialect, flowVoiceGender, autoModel);
          newResults.flowCharacter = char;
        } catch (e: any) {
          console.error("Flow Character error:", e);
        }
      }

      // 10. Text On Visual
      if (selectedSections.textOnVisual) {
        setCurrentStepText(t('جاري كتابة نصوص ثابتة على الفيديوهات...'));
        try {
          const fullDesc = `${productName ? productName + ': ' : ''}${description}`;
          const textVisual = await generateTextOnVisual(fullDesc, dialect, textVisualCount, textVisualMode, autoModel);
          newResults.textOnVisual = textVisual;
        } catch (e: any) {
          console.error("Text On Visual error:", e);
        }
      }

      // 11. Photoshoot
      if (cancelFlagRef.current) return;
      if (selectedSections.photoshoot) {
        setCurrentStepText(t('جاري ابتكار أوامر الصور الاحترافية (Photoshoot)...'));
        try {
          const fullDesc = `${productName ? productName + ': ' : ''}${description}`;
          const photoPrompts = await generateScenePrompts(fullDesc, photoshootCount, autoModel);
          newResults.photoshootPrompts = photoPrompts;
        } catch (e: any) {
          console.error("Photoshoot error:", e);
        }
      }
      
      
      
      const getPayload = () => {
        if (imagePreview) {
          const mimeType = imagePreview.split(';')[0].split(':')[1];
          const base64 = imagePreview.split(',')[1];
          return [{base64, mimeType}];
        }
        return [];
      };

      // Gemini Landing
      if (selectedSections.geminiLanding) {
        setCurrentStepText(t('جاري تخطيط صفحة الهبوط (Gemini)...'));
        try {
          // just generate the sections
          const sections = await analyzeProduct(getPayload(), description, dialect, autoModel, 'Modern', 3, 3000);
          newResults.geminiLandingData = sections;
        } catch (e: any) {
          console.error("Gemini Landing error:", e);
        }
      }

      // Gemini Ads
      if (selectedSections.geminiAds) {
        setCurrentStepText(t('جاري ابتكار إعلانات صور (Gemini)...'));
        try {
          const ads = await analyzeAdCreatives(getPayload(), description, dialect, autoModel, 'Modern', 3, 3000);
          newResults.geminiAdsData = ads;
        } catch (e: any) {
          console.error("Gemini Ads error:", e);
        }
      }

      // 12. Landing Page HTML

      if (cancelFlagRef.current) return;
      if (selectedSections.landingPage) {
        setCurrentStepText(t('6/6: جاري تصميم وبناء صفحة الهبوط HTML بالكامل...'));
        setProgressPercent(95);
        try {
          const imagesList = imageUrls.split('\n').filter(u => u.trim());
          const videosList = videoUrls.split('\n').filter(u => u.trim());
          const reviewsList = testimonials.split('\n').filter(t => t.trim());

          const html = await generateLandingPageHTML(
            productName || 'منتج مميز',
            description,
            pricingInfo || '299 ج.م',
            '500 ج.m',
            whatsappNumber || 'https://wa.me/201000000000',
            '#09090b',
            imagesList,
            videosList,
            ['hero', 'problem', 'features', 'gallery', 'reviews', 'cta'],
            'medium',
            true,
            undefined,
            dialect,
            '',
            '',
            '',
            'easyorders',
            'template',
            true,
            testimonials,
            'pro'
          );
          newResults.landingHtml = html;
        } catch (e: any) {
          console.error("Landing Page HTML error:", e);
        }
      }

      setProgressPercent(100);
      setCurrentStepText(t('تم الانتهاء من التوليد التلقائي الشامل بنجاح! 🎉'));
      
      // Update Global State from AppContext
      if (newResults.scripts && setGeneratedScripts) setGeneratedScripts(newResults.scripts);
      if (newResults.fbAds && setGeneratedFbAds) setGeneratedFbAds(newResults.fbAds);
      if (newResults.angles && setGeneratedSmartAngles) setGeneratedSmartAngles(newResults.angles);
      if (newResults.prompts && setGeneratedCreativePrompts) setGeneratedCreativePrompts(newResults.prompts);
      if (newResults.funnelCopy && setGeneratedFunnelCopy) setGeneratedFunnelCopy(newResults.funnelCopy);
      if (newResults.videoScenes && setGeneratedVideoScenes) setGeneratedVideoScenes(newResults.videoScenes);
      if (newResults.flowCharacter && setGeneratedFlowCharacter) setGeneratedFlowCharacter(newResults.flowCharacter);
      if (newResults.textOnVisual && setGeneratedTextOnVisual) setGeneratedTextOnVisual(newResults.textOnVisual);

      setResults(newResults);

      
      // Set initial tab to first populated result
      if (newResults.spyData) setActiveOutputTab('spy');
      else if (newResults.scripts) setActiveOutputTab('scripts');
      else if (newResults.fbAds) setActiveOutputTab('fbAds');
      else if (newResults.angles) setActiveOutputTab('angles');
      else if (newResults.brainReport) setActiveOutputTab('brain');
      else if (newResults.funnelCopy) setActiveOutputTab('funnel');
      else if (newResults.videoScenes) setActiveOutputTab('video');
      else if (newResults.flowCharacter) setActiveOutputTab('flow');
      else if (newResults.textOnVisual) setActiveOutputTab('textVisual');
      else if (newResults.prompts) setActiveOutputTab('prompts');
      else if (newResults.photoshootPrompts) setActiveOutputTab('photoshoot');
      else if (newResults.landingHtml) setActiveOutputTab('landing');

      else if (newResults.geminiLandingData) setActiveOutputTab('geminiLanding');
      else if (newResults.geminiAdsData) setActiveOutputTab('geminiAds');


    } catch (err: any) {
      console.error("Automation error:", err);
      setError(err.message || t('حدث خطأ أثناء التوليد الشامل.'));
    } finally {
      setIsGenerating(false);
    }
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
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-fuchsia-900 via-purple-900 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-[#F0B21B]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F0B21B]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0B21B]/20 border border-fuchsia-400/30 text-fuchsia-300 text-xs font-bold">
              <Bot className="w-4 h-4" />
              {t("الأتمتة الشاملة بالذكاء الاصطناعي (AI Auto Suite)")}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {t("توليد حملتك الإعلانية بالكامل بضغطة زر واحدة 🚀")}
            </h1>
            <p className="text-zinc-300 text-sm max-w-2xl leading-relaxed">
              {t("أدخل بيانات منتجك مرة واحدة وحدد الأقسام المطلوبة (صائد المنتجات والهوكات، الإسكريبت، الفويس أوفر التلقائي، نصوص فيسبوك، وصفحة الهبوط HTML) ليقوم الذكاء الاصطناعي بتنفيذها متتالياً وتلقائياً.")}
            </p>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <Sparkles className="w-5 h-5 text-[#F0B21B]" />
          {t("1. بيانات المنتج الأساسية")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
              <span>{t("اسم المنتج / العلامة التجارية")}</span>
              {selectedSections.productSpy && (
                <span className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded">
                  * {t("إجباري لصائد المنتجات")}
                </span>
              )}
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder={t("مثال: حزام الظهر الذكي لمكافحة الآلام")}
              className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#F0B21B] transition-all font-medium text-zinc-900 dark:text-white"
            />
          </div>

          {/* Dialect */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {t("اللهجة / السوق المستهدف")}
            </label>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#F0B21B] transition-all font-medium text-zinc-900 dark:text-white"
            >
              <option value="egyptian">{t("مصري (Egyptian)")}</option>
              <option value="saudi">{t("سعودي (Saudi)")}</option>
              <option value="emirati">{t("إماراتي / خليجي (Gulf)")}</option>
              <option value="fusha">{t("فصحى مبسطة (Modern Standard Arabic)")}</option>
              <option value="english">{t("إنجليزية (English)")}</option>
            </select>
          </div>

          {/* Target Audience */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {t("الجمهور المستهدف (اختياري)")}
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder={t("مثال: الموظفون وسائقو السيارات والأمهات اللاتي يعانين من آلام أسفل الظهر")}
              className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#F0B21B] transition-all font-medium text-zinc-900 dark:text-white"
            />
          </div>

          {/* Product Description */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {t("وصف المنتج والمشكلة والحل")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={t("اكتب تفاصيل المنتج، المشكلة التي يحلها، أهم الفوائد والميزات، العرض أو السعر...")}
              className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-[#F0B21B] transition-all font-medium text-zinc-900 dark:text-white"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
              <span>{t("صورة المنتج (للبحث البصري والتوليد)")}</span>
              {selectedSections.productSpy && (
                <span className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded">
                  * {t("إجباري لصائد المنتجات")}
                </span>
              )}
            </label>
            <div className="flex flex-col md:flex-row items-center gap-4 p-4 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50">
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                  <img src={imagePreview} alt="Product" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setProductImage(null); setImagePreview(null); }}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-pointer hover:border-[#F0B21B] transition-colors shadow-sm">
                  <Upload className="w-5 h-5 text-[#F0B21B]" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{t("رفع صورة المنتج")}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
              <span className="text-xs text-zinc-500">
                {t("ارفع صورة جيدة وواضحة للمنتج لتفعيل البحث البصري وتحديد الكلمات الهوك بدقة عالية")}
              </span>
            </div>
          </div>
        </div>

        {/* Section Selection */}
        <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F0B21B]" />
            {t("2. حدد الأقسام المراد توليدها تلقائياً بضغطة زر")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Product Spy */}
            <div 
              onClick={() => toggleSection('productSpy')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.productSpy ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.productSpy ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.productSpy && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#F0B21B]" />
                  {t("صائد المنتجات + هوكات البحث")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("جلب روابط الإعلانات + توليد أكثر من 10 هوكات كلمات مفتاحية للبحث")}
                </p>
              </div>
            </div>

            {/* Script & Voice */}
            <div 
              onClick={() => toggleSection('scriptAndVoice')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.scriptAndVoice ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.scriptAndVoice ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.scriptAndVoice && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-zinc-900 dark:text-[#F0B21B]" />
                  {t("الإسكريبتات + التعليق الصوتي التلقائي")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("كتابة إسكريبتات إعلانية وتوليد ملفات الصوت فوراً بضغطة واحدة")}
                </p>
              </div>
            </div>

            {/* FB Ads */}
            <div 
              onClick={() => toggleSection('fbAds')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.fbAds ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.fbAds ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.fbAds && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" />
                  {t("نصوص إعلانات فيسبوك (Primary Copies)")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("صياغة نصوص إعلانات احترافية بالهواك والعناوين الحماسية")}
                </p>
              </div>
            </div>

            {/* Smart Angles */}
            <div 
              onClick={() => toggleSection('smartAngles')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.smartAngles ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.smartAngles ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.smartAngles && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-rose-500" />
                  {t("الزوايا الإعلانية الذكية")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("تحليل زوايا التسويق النفسية والإقناعية للمنتج")}
                </p>
              </div>
            </div>

            {/* Product Brain */}
            <div 
              onClick={() => toggleSection('productBrain')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.productBrain ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.productBrain ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.productBrain && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-emerald-500" />
                  {t("تحليل عقل المنتج (Product Brain)")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("تقرير شامل عن نقاط الألم والدوافع وموانع الشراء")}
                </p>
              </div>
            </div>

            {/* HTML Landing Page */}
            <div 
              onClick={() => toggleSection('landingPage')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.landingPage ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.landingPage ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.landingPage && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <LayoutTemplate className="w-4 h-4 text-teal-500" />
                  {t("صفحة هبوط كاملة HTML")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("إنشاء صفحة هبوط جاهزة بكود HTML وتنسيقات عالية التحويل")}
                </p>
              </div>
            </div>
          
            
            {/* Gemini Landing */}
            <div 
              onClick={() => toggleSection('geminiLanding')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.geminiLanding ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.geminiLanding ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.geminiLanding && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  {t("صفحات الهبوط Gemini")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("توليد هيكل ونصوص وتخيل صفحات هبوط باستخدام Gemini")}
                </p>
              </div>
            </div>

            {/* Gemini Ads */}
            <div 
              onClick={() => toggleSection('geminiAds')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.geminiAds ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.geminiAds ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.geminiAds && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-blue-500" />
                  {t("إعلانات صور Gemini")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("توليد نصوص وأفكار إعلانات بصرية مبتكرة")}
                </p>
              </div>
            </div>

            {/* Visual Prompts (Creative GPT) */}
            <div 
              onClick={() => toggleSection('visualPrompts')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.visualPrompts ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.visualPrompts ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.visualPrompts && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  {t("كريتيف GPT (أوامر صور)")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("صياغة أفكار وأوامر صور وفيديوهات")}
                </p>
              </div>
            </div>

            {/* Funnel Copy */}
            <div 
              onClick={() => toggleSection('funnelCopy')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.funnelCopy ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.funnelCopy ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.funnelCopy && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-orange-500" />
                  {t("محتوى صفحة المنتج كفانل")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("كتابة نصوص صفحة هبوط مبنية على مراحل الفانل")}
                </p>
              </div>
            </div>

            {/* Text On Visual */}
            <div 
              onClick={() => toggleSection('textOnVisual')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.textOnVisual ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.textOnVisual ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.textOnVisual && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-pink-500" />
                  {t("نصوص ثابتة على الفيديوهات")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("كتابة هوكات ونصوص لتركيبها على الفيديوهات")}
                </p>
              </div>
            </div>

            {/* Video Scenes */}
            <div 
              onClick={() => toggleSection('videoScenes')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.videoScenes ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.videoScenes ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.videoScenes && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-500" />
                  {t("أوامر فيديو (Veo / Flow)")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("توليد أوامر برومبت لفيديوهات احترافية")}
                </p>
              </div>
            </div>

            {/* Flow Character */}
            <div 
              onClick={() => toggleSection('flowCharacter')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.flowCharacter ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.flowCharacter ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.flowCharacter && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-cyan-500" />
                  {t("شخصية إعلانية لـ Flow")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("ابتكار شخصية مناسبة للفيديوهات")}
                </p>
              </div>
            </div>

            {/* Photoshoot */}
            <div 
              onClick={() => toggleSection('photoshoot')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedSections.photoshoot ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900/40 dark:bg-fuchsia-900/20 shadow-md shadow-amber-500/20/10' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 opacity-70'}`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 border ${selectedSections.photoshoot ? 'bg-[#F0B21B] border-fuchsia-600 text-white' : 'border-zinc-300'}`}>
                {selectedSections.photoshoot && <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-zinc-900 dark:text-[#F0B21B]" />
                  {t("الصور الاحترافية (Photoshoot)")}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t("أوامر برومبت لتوليد صور احترافية للمنتج")}
                </p>
              </div>
            </div>

          </div>

        </div>

        
        
        {/* Dynamic Fields for Creative Prompts */}
        {selectedSections.visualPrompts && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 pt-6 border-t border-dashed border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-base">
              <ImageIcon className="w-5 h-5" />
              {t("متطلبات كريتيف GPT")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("نمط التصاميم")}</label>
                <select value={creativePromptMode} onChange={(e) => setCreativePromptMode(e.target.value as any)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="standalone">{t("أفكار متنوعة منفصلة")}</option>
                  <option value="carousel">{t("كاروسيل متصل (سلايدر)")}</option>
                  <option value="landing_page">{t("صفحة هبوط متتابعة (Landing Page)")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("عدد الأوامر/التصاميم")}</label>
                <select value={creativePromptsCount} onChange={(e) => setCreativePromptsCount(Number(e.target.value))} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="3">3 تصاميم</option>
                  <option value="4">4 تصاميم</option>
                  <option value="5">5 تصاميم</option>
                  <option value="6">6 تصاميم</option>
                  <option value="8">8 تصاميم</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("بيئة الألوان الخاصة (اختياري)")}</label>
                <select value={creativeColorTheme} onChange={(e) => setCreativeColorTheme(e.target.value)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="">{t("افتراضي (حسب المنتج)")}</option>
                  <option value="dark_luxury">{t("داكن فخم (Dark & Luxury)")}</option>
                  <option value="light_minimal">{t("فاتح بسيط (Light & Minimal)")}</option>
                  <option value="colorful_vibrant">{t("ملون وحيوي (Colorful & Vibrant)")}</option>
                  <option value="neon_cyberpunk">{t("نيون سبربانك (Neon Cyberpunk)")}</option>
                  <option value="warm_earthy">{t("دافئ وترابي (Warm & Earthy)")}</option>
                  <option value="cold_tech">{t("بارد وتقني (Cold & Tech)")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("الخط")}</label>
                <select value={creativeFontFamily} onChange={(e) => setCreativeFontFamily(e.target.value)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="Cairo">Cairo (عصري - مفضل)</option>
                  <option value="Tajawal">Tajawal (رسمي وأنيق)</option>
                  <option value="Almarai">Almarai (تقني وواضح)</option>
                  <option value="Alexandria">Alexandria (عريض وقوي)</option>
                </select>
              </div>

            
            </div>
            {creativePromptMode === 'landing_page' && (
              <div className="mt-4 space-y-3 p-4 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("أقسام صفحة الهبوط المطلوبة")}</label>
                <div className="flex flex-wrap gap-2">
                  {['Hero Section', 'Problem Section', 'Solution Section', 'Benefits Section', 'Features Section', 'Social Proof Section', 'Offer Section', 'FAQ Section', 'Trust Section', 'Call-to-Action (CTA) Section'].map(section => (
                    <button
                      key={section}
                      onClick={() => setCreativeLandingSections(prev => 
                        prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
                      )}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        creativeLandingSections.includes(section) 
                          ? 'bg-amber-600 text-white shadow-sm' 
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}

        
        
        
        {/* Dynamic Fields for Funnel Copy */}
        {selectedSections.funnelCopy && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 pt-6 border-t border-dashed border-orange-200 dark:border-orange-900/50 bg-orange-50/30 dark:bg-orange-950/10 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-bold text-base">
              <FileText className="w-5 h-5" />
              {t("متطلبات محتوى صفحة المنتج كفانل")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("طول المحتوى (Copy Length)")}</label>
                <select value={funnelCopyLength} onChange={(e) => setFunnelCopyLength(e.target.value as any)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="auto">{t("تلقائي (حسب المنتج)")}</option>
                  <option value="long">{t("طويل (شرح مفصل)")}</option>
                  <option value="short">{t("قصير (مباشر وسريع)")}</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Fields for Video Scenes */}
        {selectedSections.videoScenes && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 pt-6 border-t border-dashed border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold text-base">
              <Video className="w-5 h-5" />
              {t("متطلبات أوامر الفيديو")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("النمط")}</label>
                <select value={videoMode} onChange={(e) => setVideoMode(e.target.value as any)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="consecutive">{t("متتابع (مشاهد متصلة)")}</option>
                  <option value="hooks">{t("تجميعة هوكات (أول 3 ثواني)")}</option>
                  <option value="frames">{t("إطارات سريعة جدًا (Frames)")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("المدة")}</label>
                <select value={videoDuration} onChange={(e) => setVideoDuration(e.target.value)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="15s">15 ثانية</option>
                  <option value="30s">30 ثانية</option>
                  <option value="40s">40 ثانية (Flow)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Fields for Flow Character */}
        {selectedSections.flowCharacter && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 pt-6 border-t border-dashed border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/30 dark:bg-cyan-950/10 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-bold text-base">
              <UserIcon className="w-5 h-5" />
              {t("متطلبات شخصية Flow")}
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("جنس الشخصية")}</label>
                <select value={flowVoiceGender} onChange={(e) => setFlowVoiceGender(e.target.value)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="female">{t("أنثى")}</option>
                  <option value="male">{t("ذكر")}</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Fields for Text on Visual */}
        {selectedSections.textOnVisual && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 pt-6 border-t border-dashed border-pink-200 dark:border-pink-900/50 bg-pink-50/30 dark:bg-pink-950/10 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-pink-700 dark:text-pink-300 font-bold text-base">
              <FileText className="w-5 h-5" />
              {t("متطلبات النصوص الثابتة")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("النمط")}</label>
                <select value={textVisualMode} onChange={(e) => setTextVisualMode(e.target.value as any)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="sequential">{t("نصوص متتابعة (تظهر وتختفي)")}</option>
                  <option value="high_ctr_fixed">{t("نص ثابت واحد (High CTR)")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("العدد")}</label>
                <select value={textVisualCount} onChange={(e) => setTextVisualCount(Number(e.target.value))} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="4">4 نصوص</option>
                  <option value="6">6 نصوص</option>
                  <option value="8">8 نصوص</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        
        {/* Dynamic Fields for Script & Voice */}
        {selectedSections.scriptAndVoice && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-800 dark:border-purple-900/50 bg-amber-50 dark:bg-zinc-900/30 dark:bg-purple-950/10 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold mb-4">
              <Mic className="w-5 h-5" />
              {t("متطلبات الإسكريبتات والتعليق الصوتي")}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("مدة الإسكريبت")}</label>
                <select value={scriptDuration} onChange={(e) => setScriptDuration(e.target.value)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="15_seconds">15 ثانية (سريع / Reels)</option>
                  <option value="30_seconds">30 ثانية (قياسي)</option>
                  <option value="60_seconds">60 ثانية (شرح مفصل)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("نوع المعلق الصوتي")}</label>
                <select value={scriptVoiceGender} onChange={(e) => setScriptVoiceGender(e.target.value)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="auto">{t("تلقائي (حسب المنتج)")}</option>
                  <option value="male">{t("صوت رجالي")}</option>
                  <option value="female">{t("صوت نسائي")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("عدد الإسكريبتات")}</label>
                <select value={scriptCount} onChange={(e) => {
                  const count = Number(e.target.value);
                  setScriptCount(count);
                  setSelectedScriptTypes(Array(count).fill('إعلان مبيعات مباشر'));
                  setSelectedScriptGenders(Array(count).fill('auto'));
                }} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} {t("إسكريبتات")}</option>)}
                </select>
              </div>
              <div className="space-y-2 flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={autoScriptAngles} onChange={(e) => setAutoScriptAngles(e.target.checked)} className="w-4 h-4 text-zinc-900 dark:text-[#F0B21B] rounded" />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("توليد زوايا تسويقية تلقائية للإسكريبتات")}</span>
                </label>
              </div>
            </div>
            
            {!autoScriptAngles && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("تخصيص كل إسكريبت")}</label>
                {Array.from({ length: scriptCount }).map((_, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select 
                      value={selectedScriptTypes[idx] || 'إعلان مبيعات مباشر'} 
                      onChange={(e) => {
                        const newArr = [...selectedScriptTypes];
                        newArr[idx] = e.target.value;
                        setSelectedScriptTypes(newArr);
                      }} 
                      className="flex-1 p-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                    >
                      <option value="مشكلة وحل (Problem-Solution)">مشكلة وحل (Problem-Solution)</option>
                      <option value="قبل وبعد (Before-After)">قبل وبعد (Before-After)</option>
                      <option value="توصية صانع محتوى (UGC)">توصية صانع محتوى (UGC)</option>
                      <option value="إعلان مبيعات مباشر">إعلان مبيعات مباشر</option>
                      <option value="قصة نجاح (Success Story)">قصة نجاح (Success Story)</option>
                      <option value="إعلان فكاهي / تريند">إعلان فكاهي / تريند</option>
                    </select>
                    <select
                      value={selectedScriptGenders[idx] || 'auto'}
                      onChange={(e) => {
                        const newGenders = [...selectedScriptGenders];
                        newGenders[idx] = e.target.value;
                        setSelectedScriptGenders(newGenders);
                      }}
                      className="w-24 p-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                    >
                      <option value="auto">تلقائي</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Dynamic Fields for FB Ads */}
        {selectedSections.fbAds && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 pt-6 border-t border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/10 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold mb-4">
              <FileText className="w-5 h-5" />
              {t("متطلبات إعلانات فيسبوك وتيك توك")}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("الهدف الإعلاني (Campaign Objective)")}</label>
                <select value={fbCampaignObjective} onChange={(e) => setFbCampaignObjective(e.target.value)} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  <option value="زيادة المبيعات (Sales)">زيادة المبيعات (Sales)</option>
                  <option value="جلب عملاء محتملين (Leads)">جلب عملاء محتملين (Leads)</option>
                  <option value="تفاعل (Engagement)">تفاعل (Engagement)</option>
                  <option value="زيارات للموقع (Traffic)">زيارات للموقع (Traffic)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("عدد نسخ الإعلانات")}</label>
                <select value={fbAdCount} onChange={(e) => {
                  const count = Number(e.target.value);
                  setFbAdCount(count);
                  setSelectedFbAdTypes(Array(count).fill('إعلان مبيعات مباشر'));
                }} className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} {t("إعلانات")}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2 flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={autoFbAngles} onChange={(e) => setAutoFbAngles(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("توليد زوايا تسويقية مختلفة لكل إعلان تلقائياً")}</span>
                </label>
              </div>
            </div>

            {!autoFbAngles && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("تخصيص أنواع الإعلانات")}</label>
                {Array.from({ length: fbAdCount }).map((_, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select 
                      value={selectedFbAdTypes[idx] || 'إعلان مبيعات مباشر'} 
                      onChange={(e) => {
                        const newArr = [...selectedFbAdTypes];
                        newArr[idx] = e.target.value;
                        setSelectedFbAdTypes(newArr);
                      }} 
                      className="flex-1 p-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none"
                    >
                      <option value="إعلان مبيعات مباشر">إعلان مبيعات مباشر</option>
                      <option value="إعلان مميزات وفوائد">إعلان مميزات وفوائد</option>
                      <option value="إعلان إعادة استهداف (Retargeting)">إعلان إعادة استهداف (Retargeting)</option>
                      <option value="إعلان سرد قصصي (Storytelling)">إعلان سرد قصصي (Storytelling)</option>
                      <option value="إعلان مقارنة مع المنافسين">إعلان مقارنة مع المنافسين</option>
                      <option value="إعلان مبني على سؤال وجواب">إعلان مبني على سؤال وجواب</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Dynamic Fields for Landing Page HTML */}
        {selectedSections.landingPage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 pt-6 border-t border-dashed border-teal-200 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-950/10 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-base">
              <LayoutTemplate className="w-5 h-5" />
              {t("متطلبات صفحة الهبوط HTML")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("لون الهوية الأساسي")}</label>
                <div className="flex gap-2">
                  {['indigo', 'rose', 'emerald', 'amber', 'sky', 'violet'].map(color => (
                    <button
                      key={color}
                      onClick={() => setLandingThemeColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${landingThemeColor === color ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent'}`}
                      style={{
                        backgroundColor: 
                          color === 'indigo' ? '#4f46e5' : 
                          color === 'rose' ? '#e11d48' : 
                          color === 'emerald' ? '#059669' : 
                          color === 'amber' ? '#d97706' : 
                          color === 'sky' ? '#0284c7' : '#7c3aed'
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <input type="checkbox" checked={useAILandingBg} onChange={e => setUseAILandingBg(e.target.checked)} className="rounded text-teal-600" />
                  {t("توليد خلفيات بالذكاء الاصطناعي")}
                </label>
                <p className="text-[10px] text-zinc-500">{t("إذا تم إيقافه، سيتم استخدام صور المنتج كخلفيات.")}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Fields for Landing Page if Selected */}
        {selectedSections.landingPage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 pt-6 border-t border-dashed border-teal-200 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-950/10 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-base">
              <LayoutTemplate className="w-5 h-5" />
              {t("3. بيانات إضافية مخصصة لصفحة الهبوط HTML")}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                  {t("روابط الصور (ضع رابط كل صورة في سطر)")}
                </label>
                <textarea
                  value={imageUrls}
                  onChange={(e) => setImageUrls(e.target.value)}
                  rows={2}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-teal-600" />
                  {t("روابط الفيديوهات (ضع رابط كل فيديو في سطر)")}
                </label>
                <textarea
                  value={videoUrls}
                  onChange={(e) => setVideoUrls(e.target.value)}
                  rows={2}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                  {t("آراء وتقييمات العملاء / الريفيوهات")}
                </label>
                <textarea
                  value={testimonials}
                  onChange={(e) => setTestimonials(e.target.value)}
                  rows={2}
                  placeholder={t("أحمد: منتج ممتاز وفرق معي جداً في الظهر!\nمريم: التوصيل كان سريع والنتيجة روعة.")}
                  className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-teal-600" />
                  {t("اسم المتجر / البراند")}
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder={t("متجر الرعاية الصحية")}
                  className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-teal-600" />
                  {t("السعر والخصم")}
                </label>
                <input
                  type="text"
                  value={pricingInfo}
                  onChange={(e) => setPricingInfo(e.target.value)}
                  placeholder={t("خصم 40% لفترة محدودة - فقط 299 ج.م بدلاً من 500 ج.م")}
                  className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  {t("رقم الواتساب أو رابط الشراء المباشر")}
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="https://wa.me/201000000000 أو +201000000000"
                  className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Fields for Photoshoot if Selected */}
        {selectedSections.photoshoot && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 pt-6 border-t border-dashed border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-zinc-900/30 p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#B88006] dark:text-[#F0B21B] font-bold text-base">
                <Camera className="w-5 h-5" />
                {t("إعدادات أوامر الصور الاحترافية (Photoshoot)")}
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#F0B21B]/15 text-[#B88006] dark:text-[#F0B21B] font-bold">
                {photoshootCount === 1 ? t('صورة واحدة (الأسرع والأوفر)') : t(`${photoshootCount} صور`)}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {t("عدد أوامر/مشاهد الصور المطلوبة")}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 6, 8].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setPhotoshootCount(count)}
                    className={`py-2 px-3 rounded-xl border-2 text-center transition-all font-bold text-xs cursor-pointer ${
                      photoshootCount === count
                        ? 'border-[#F0B21B] bg-[#F0B21B]/10 text-zinc-900 dark:text-[#F0B21B] shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-[#F0B21B]/50 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-600 dark:text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        
        {/* Model Selection */}
        <div className="pt-4 flex flex-col gap-3">
          <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t("نموذج الذكاء الاصطناعي")}</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className={`flex-1 flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${autoModel === 'pro' ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20 shadow-sm' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}>
              <input type="radio" name="autoModel" value="pro" checked={autoModel === 'pro'} onChange={() => setAutoModel('pro')} className="mt-1 w-4 h-4 text-[#F0B21B] focus:ring-[#F0B21B] border-gray-300" />
              <div>
                <div className="font-bold text-zinc-900 dark:text-white">Gemini Pro</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t("الأذكى والأدق للمهام المعقدة وجودة الإبداع.")}</div>
              </div>
            </label>
            <label className={`flex-1 flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${autoModel === 'flash' ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20 shadow-sm' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}>
              <input type="radio" name="autoModel" value="flash" checked={autoModel === 'flash'} onChange={() => setAutoModel('flash')} className="mt-1 w-4 h-4 text-[#F0B21B] focus:ring-[#F0B21B] border-gray-300" />
              <div>
                <div className="font-bold text-zinc-900 dark:text-white">Gemini Flash (Last)</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t("الأسرع ومناسب لأغلب المهام بكفاءة عالية.")}</div>
              </div>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex gap-4">
          <button
            onClick={handleRunAutomation}
            disabled={isGenerating}
            className="flex-1 py-4 px-8 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-amber-500/20/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{currentStepText}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>{t("بدء الأتمتة السحرية (Run Automation)")}</span>
              </>
            )}
          </button>
          
          {isGenerating && (
            <button
              onClick={handleStopAutomation}
              className="py-4 px-8 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-red-500/25 transition-all flex items-center justify-center gap-3"
            >
              <AlertCircle className="w-6 h-6" />
              <span>{t("إيقاف التوليد")}</span>
            </button>
          )}
        </div>

        {/* Progress Bar during generation */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-500 font-medium">
              <span>{currentStepText}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-black to-zinc-900 transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Generated Results Workspace */}
      {results && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#F0B21B]" />
              {t("نتائج التوليد التلقائي الشامل")}
            </h2>

            {/* Navigation tabs for results */}
            <div className="flex flex-wrap gap-2">
              {results.spyData && (
                <button
                  onClick={() => setActiveOutputTab('spy')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'spy' ? 'bg-[#F0B21B] text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}
                >
                  <Target className="w-4 h-4" />
                  {t("صائد المنتجات والهوكات")}
                </button>
              )}
              {results.scripts && (
                <button
                  onClick={() => setActiveOutputTab('scripts')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'scripts' ? 'bg-[#F0B21B] text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}
                >
                  <Mic className="w-4 h-4" />
                  {t("الإسكريبتات والصوت")}
                </button>
              )}
              {results.fbAds && (
                <button
                  onClick={() => setActiveOutputTab('fbAds')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'fbAds' ? 'bg-[#F0B21B] text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}
                >
                  <FileText className="w-4 h-4" />
                  {t("إعلانات فيسبوك")}
                </button>
              )}
              {results.angles && (
                <button
                  onClick={() => setActiveOutputTab('angles')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'angles' ? 'bg-[#F0B21B] text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}
                >
                  <Target className="w-4 h-4" />
                  {t("الزوايا الإعلانية")}
                </button>
              )}
              {results.brainReport && (
                <button
                  onClick={() => setActiveOutputTab('brain')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'brain' ? 'bg-[#F0B21B] text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}
                >
                  <Brain className="w-4 h-4" />
                  {t("عقل المنتج")}
                </button>
              )}
              {results.landingHtml && (
                <button
                  onClick={() => setActiveOutputTab('landing')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'landing' ? 'bg-[#F0B21B] text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}
                >
                  <LayoutTemplate className="w-4 h-4" />
                  {t("صفحة الهبوط HTML")}
                </button>
              )}

              {results.geminiLandingData && (
                <button 
                  onClick={() => setActiveOutputTab('geminiLanding')}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'geminiLanding' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
                >
                  <Layers className="w-3.5 h-3.5" /> {t("هيكل صفحات Gemini")}
                </button>
              )}
              {results.geminiAdsData && (
                <button 
                  onClick={() => setActiveOutputTab('geminiAds')}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'geminiAds' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
                >
                  <Play className="w-3.5 h-3.5" /> {t("أفكار إعلانات Gemini")}
                </button>
              )}


              
              {results.prompts && (
                <button 
                  onClick={() => setActiveOutputTab('prompts')}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'prompts' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> {t("كريتيف GPT")}
                </button>
              )}

              {results.funnelCopy && (
                <button 
                  onClick={() => setActiveOutputTab('funnel')}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'funnel' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
                >
                  <FileText className="w-3.5 h-3.5" /> {t("محتوى الفانل")}
                </button>
              )}
              {results.videoScenes && (
                <button 
                  onClick={() => setActiveOutputTab('video')}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'video' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
                >
                  <Video className="w-3.5 h-3.5" /> {t("أوامر الفيديو")}
                </button>
              )}
              {results.flowCharacter && (
                <button 
                  onClick={() => setActiveOutputTab('flow')}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'flow' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
                >
                  <UserIcon className="w-3.5 h-3.5" /> {t("شخصية Flow")}
                </button>
              )}
              {results.textOnVisual && (
                <button 
                  onClick={() => setActiveOutputTab('textVisual')}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'textVisual' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
                >
                  <FileText className="w-3.5 h-3.5" /> {t("نصوص الفيديوهات")}
                </button>
              )}
              {results.photoshootPrompts && (
                <button 
                  onClick={() => setActiveOutputTab('photoshoot')}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeOutputTab === 'photoshoot' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
                >
                  <Camera className="w-3.5 h-3.5" /> {t("الصور الاحترافية")}
                </button>
              )}

            </div>
          </div>

          {/* TAB 1: PRODUCT SPY & KEYWORD HOOKS */}
          {activeOutputTab === 'spy' && results.spyData && (
            <div className="space-y-6">
              {/* Country selector for FB Ads Library */}
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <Layers className="w-5 h-5" />
                  <span className="font-semibold">{t("دولة البحث في مكتبة إعلانات فيسبوك:")}</span>
                </div>
                <select 
                  value={fbCountry} 
                  onChange={(e) => setFbCountry(e.target.value)}
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 outline-none text-sm font-medium"
                >
                  <option value="ALL">{t("جميع الدول (All)")}</option>

                  <option value="US">{t("الولايات المتحدة (US)")}</option>
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
                </select>
              </div>

              {/* Keyword Hooks */}
              {results.spyData.keywordHooks && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    {t("هوكات الكلمات المفتاحية للبحث (10+ Keyword Hooks)")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.spyData.keywordHooks.map((hObj: any, idx: number) => (
                      <div key={idx} className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="font-bold text-base text-zinc-900 dark:text-white">{hObj.hook}</span>
                            <button
                              onClick={() => handleCopy(hObj.hook, `hook_${idx}`)}
                              className="p-1.5 text-zinc-400 hover:text-[#F0B21B] bg-white dark:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-600 shrink-0"
                            >
                              {copiedIndex === `hook_${idx}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          {hObj.angle && (
                            <span className="text-xs text-[#F0B21B] dark:text-[#F0B21B] bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/30 px-2 py-0.5 rounded font-medium">
                              🎯 {hObj.angle}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                          <button onClick={() => openSearch('fbAds', hObj.hook)} className="px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium">
                            FB Ads
                          </button>
                          <button onClick={() => openSearch('tiktok', hObj.hook)} className="px-2.5 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-medium">
                            TikTok
                          </button>
                          <button onClick={() => openSearch('youtube', hObj.hook)} className="px-2.5 py-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium">
                            Shorts
                          </button>
                          <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(hObj.hook)}`, '_blank')} className="px-2.5 py-1 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg font-medium">
                            Google
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {results.spyData.links && (
                <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#F0B21B]" />
                    {t("روابط الإعلانات والمنافسين المستخرجة")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.spyData.links.map((link: any, idx: number) => (
                      <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-[#F0B21B] transition-colors flex items-start gap-3">
                        <ExternalLink className="w-5 h-5 text-[#F0B21B] shrink-0 mt-0.5" />
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{link.title || link.url}</h4>
                          <p className="text-xs text-zinc-500 mt-1 capitalize">{link.platform} • {link.relevance || 'عالية'}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCRIPTS & VOICE */}
          {activeOutputTab === 'scripts' && results.scripts && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-[#F0B21B]" />
                {t("الإسكريبتات المولدة والتعليق الصوتي التلقائي")}
              </h3>

              <div className="space-y-6">
                {results.scripts.map((script: any, idx: number) => (
                  <div key={idx} className="p-6 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F0B21B] dark:text-[#F0B21B] text-sm">
                        الإسكريبت #{idx + 1} - {script.type}
                      </span>
                      <button
                        onClick={() => handleCopy(script.content, `script_${idx}`)}
                        className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg border border-zinc-200 dark:border-zinc-600 flex items-center gap-1.5"
                      >
                        {copiedIndex === `script_${idx}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {t("نسخ الإسكريبت")}
                      </button>
                    </div>

                    <div className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      {script.content}
                    </div>

                    {/* Audio Player if generated */}
                    {results.scriptAudios?.[idx] && (
                      <div className="p-4 bg-amber-50 dark:bg-zinc-900/50 dark:bg-fuchsia-950/20 border border-amber-200 dark:border-zinc-800 dark:border-fuchsia-800/50 rounded-xl space-y-3">
                        <span className="text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300 flex items-center gap-1.5">
                          <Mic className="w-4 h-4" />
                          {t("التعليق الصوتي التلقائي جاهز:")}
                        </span>
                        <audio controls className="w-full h-10">
                          <source src={results.scriptAudios[idx].wav} type="audio/wav" />
                          <source src={results.scriptAudios[idx].mp3} type="audio/mp3" />
                        </audio>
                        <div className="flex gap-2">
                          <a href={results.scriptAudios[idx].mp3} download={`voiceover_${idx + 1}.mp3`} className="px-3 py-1.5 bg-[#F0B21B] text-white text-xs font-bold rounded-lg flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" /> تحميل MP3
                          </a>
                          <a href={results.scriptAudios[idx].wav} download={`voiceover_${idx + 1}.wav`} className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-lg flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" /> تحميل WAV
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FB ADS */}
          {activeOutputTab === 'fbAds' && results.fbAds && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                {t("نصوص إعلانات فيسبوك المولدة")}
              </h3>

              <div className="space-y-6">
                {Array.isArray(results.fbAds?.fbAds) ? results.fbAds.fbAds.map((ad: any, idx: number) => (
                  <div key={idx} className="p-6 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">نسخة إعلان #{idx + 1}</span>
                      <button
                        onClick={() => handleCopy(`${ad.primaryText}\n\n${ad.headline}`, `fb_${idx}`)}
                        className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-600 flex items-center gap-1"
                      >
                        {copiedIndex === `fb_${idx}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {t("نسخ الإعلان")}
                      </button>
                    </div>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{ad.primaryText || ad.text}</p>
                    {ad.headline && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block mb-1">العنوان الرئيسي (Headline):</span>
                        <span className="font-bold text-zinc-900 dark:text-white text-sm">{ad.headline}</span>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                    {JSON.stringify(results.fbAds, null, 2)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ANGLES */}
          {activeOutputTab === 'angles' && results.angles && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-500" />
                {t("الزوايا الإعلانية التسويقية")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(results.angles) ? results.angles.map((ang: any, idx: number) => (
                  <div key={idx} className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2">
                    <h4 className="font-bold text-rose-600 dark:text-rose-400 text-sm">{ang.angle || ang.title}</h4>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">{ang.description || ang.hook}</p>
                  </div>
                )) : (
                  <div className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                    {JSON.stringify(results.angles, null, 2)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PRODUCT BRAIN */}
          {activeOutputTab === 'brain' && results.brainReport && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-500" />
                {t("تقرير عقل المنتج التحليلي")}
              </h3>
              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                <pre className="whitespace-pre-wrap text-xs font-mono text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {typeof results.brainReport === 'string' ? results.brainReport : JSON.stringify(results.brainReport, null, 2)}
                </pre>
              </div>
            </div>
          )}

          
          
          {/* TAB: CREATIVE GPT */}
          {activeOutputTab === 'prompts' && results.prompts && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-500" />
                {t("كريتيف GPT (أوامر صور وفيديوهات)")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.prompts.map((p: any, idx: number) => (
                  <div key={idx} className="p-6 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">التصميم #{idx + 1}</span>
                      <button
                        onClick={() => handleCopy(p, `c_prompt_${idx}`)}
                        className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-600 flex items-center gap-1"
                      >
                        {copiedIndex === `c_prompt_${idx}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {t("نسخ")}
                      </button>
                    </div>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-sans">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: FUNNEL COPY */}
          {activeOutputTab === 'funnel' && results.funnelCopy && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                {t("محتوى صفحة المنتج كفانل")}
              </h3>
              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                <pre className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                  {typeof results.funnelCopy === 'string' ? results.funnelCopy : JSON.stringify(results.funnelCopy, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB: VIDEO SCENES */}
          {activeOutputTab === 'video' && results.videoScenes && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                {t("أوامر فيديو (Veo / Flow)")}
              </h3>
              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                <pre className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                  {typeof results.videoScenes === 'string' ? results.videoScenes : JSON.stringify(results.videoScenes, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB: FLOW CHARACTER */}
          {activeOutputTab === 'flow' && results.flowCharacter && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-cyan-500" />
                {t("شخصية إعلانية لـ Flow")}
              </h3>
              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                <pre className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                  {typeof results.flowCharacter === 'string' ? results.flowCharacter : JSON.stringify(results.flowCharacter, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB: TEXT ON VISUAL */}
          {activeOutputTab === 'textVisual' && results.textOnVisual && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-500" />
                {t("نصوص ثابتة على الفيديوهات")}
              </h3>
              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                <pre className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                  {typeof results.textOnVisual === 'string' ? results.textOnVisual : JSON.stringify(results.textOnVisual, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB: PHOTOSHOOT */}
          {activeOutputTab === 'photoshoot' && results.photoshootPrompts && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-zinc-900 dark:text-[#F0B21B]" />
                {t("أوامر الصور الاحترافية (Photoshoot)")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.photoshootPrompts.map((p: string, idx: number) => (
                  <div key={idx} className="p-6 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-900 dark:text-[#F0B21B] dark:text-purple-400 text-sm">أمر (Prompt) #{idx + 1}</span>
                      <button
                        onClick={() => handleCopy(p, `photo_${idx}`)}
                        className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-600 flex items-center gap-1"
                      >
                        {copiedIndex === `photo_${idx}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {t("نسخ الأمر")}
                      </button>
                    </div>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-sans">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          
          {/* TAB: GEMINI LANDING */}
          {activeOutputTab === 'geminiLanding' && results.geminiLandingData && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                {t("هيكل صفحة الهبوط (Gemini)")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.geminiLandingData.map((sec: any, idx: number) => (
                  <div key={idx} className="p-6 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                    <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{sec.sectionName}</h4>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-bold whitespace-pre-wrap">{sec.headline}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{sec.copyText}</p>
                    {sec.imagePrompt && (
                      <div className="p-3 bg-zinc-200 dark:bg-zinc-700/50 rounded-xl mt-2">
                        <span className="text-[10px] font-bold text-zinc-500 block mb-1">تخيل الصورة (Prompt)</span>
                        <p className="text-xs text-zinc-800 dark:text-zinc-200">{sec.imagePrompt}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GEMINI ADS */}
          {activeOutputTab === 'geminiAds' && results.geminiAdsData && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-500" />
                {t("أفكار إعلانات (Gemini)")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.geminiAdsData.map((ad: any, idx: number) => (
                  <div key={idx} className="p-6 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                    <h4 className="font-bold text-blue-600 dark:text-blue-400 text-sm">إعلان #{idx + 1}</h4>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-bold whitespace-pre-wrap">{ad.headline}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{ad.primaryText}</p>
                    {ad.imagePrompt && (
                      <div className="p-3 bg-zinc-200 dark:bg-zinc-700/50 rounded-xl mt-2">
                        <span className="text-[10px] font-bold text-zinc-500 block mb-1">تخيل الصورة (Prompt)</span>
                        <p className="text-xs text-zinc-800 dark:text-zinc-200">{ad.imagePrompt}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: LANDING PAGE HTML */}
          {activeOutputTab === 'landing' && results.landingHtml && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-teal-500" />
                  {t("كود صفحة الهبوط HTML الجاهز")}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(results.landingHtml!, 'landing_code')}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                  >
                    {copiedIndex === 'landing_code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {t("نسخ كود HTML")}
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([results.landingHtml!], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'landing_page.html';
                      a.click();
                    }}
                    className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    {t("تحميل ملف HTML")}
                  </button>
                </div>
              </div>

              {/* Live Preview iFrame */}
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-white h-[600px] shadow-inner">
                <iframe
                  title="Landing Page Preview"
                  srcDoc={results.landingHtml}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

        </motion.div>
      )}
    </div>
  );
};
