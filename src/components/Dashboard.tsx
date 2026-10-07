import React from 'react';
import { 
  Bot, Radar, Play, Camera, FileText, Image as ImageIcon, 
  ArrowRight, MousePointer, LayoutTemplate, 
  History, Wand2, Film, User as UserIcon, Target, Quote, 
  Share2, Type as TypeIcon, Brain, Download, Calculator, 
  BarChart2, Link as LinkIcon, Sparkles, Layers, Video, 
  Palette, TrendingUp, Compass, Zap
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  history: any[];
  userProfile?: any;
  isToolAllowed: (toolId: string) => boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  setActiveTab, 
  history, 
  userProfile, 
  isToolAllowed 
}) => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const categories = [
    {
      id: 'ai-automation',
      title: t('الأتمتة وتحليل الأداء الإعلاني'),
      subtitle: t('أدوات الذكاء الاصطناعي الشاملة لتحليل الحملات والمنتجات ومضاعفة الأرباح'),
      icon: Sparkles,
      badge: t('ذكاء اصطناعي ⚡'),
      tools: [
        { 
          id: 'autoSuite', 
          icon: Bot, 
          title: t('الأتمتة الشاملة بالذكاء الاصطناعي'), 
          desc: t('توليد كامل عناصر الحملة (صفحة هبوط، سكريبت، إعلانات، صور) بضغطة زر واحدة'),
          badge: 'All-in-One ⭐'
        },
        { 
          id: 'adsMetrics', 
          icon: BarChart2, 
          title: t('محلل الحملات والإعلانات'), 
          desc: t('فحص مؤشرات الأداء والـ ROAS وتقديم قرارات عملية لتحسين الحملات الممولة') 
        },
        { 
          id: 'cpaPlanner', 
          icon: Calculator, 
          title: t('مخطط تقليل التكلفة (CPA)'), 
          desc: t('إنشاء 3 سيناريوهات ذكية لتخفيض تكلفة الشراء وزيادة هامش الربح') 
        },
        { 
          id: 'productBrain', 
          icon: Brain, 
          title: t('تحليل المنتج المتقدم (Product Brain)'), 
          desc: t('فحص شامل لخصائص المنتج، الجمهور المستهدف، ونقاط الألم والفرص البيعية') 
        },
        { 
          id: 'smartAngles', 
          icon: Target, 
          title: t('زوايا إعلانية ذكية'), 
          desc: t('توليد زوايا تسويقية إبداعية غير تقليدية لتجديد الحملات وزيادة المبيعات') 
        },
        { 
          id: 'productSpy', 
          icon: Radar, 
          title: t('صائد المنتجات والإعلانات'), 
          desc: t('البحث والتجسس على المنتجات المنافسة والإعلانات الرابحة في مختلف الأسواق') 
        },
      ]
    },
    {
      id: 'video-audio',
      title: t('صناعة الفيديو والسكريبتات والفويس أوفر'),
      subtitle: t('إنتاج نصوص إعلانات الفيديو مع تعليق صوتي احترافي فائق السرعة'),
      icon: Video,
      badge: t('فيديو وصوت 🎙️'),
      tools: [
        { 
          id: 'script', 
          icon: FileText, 
          title: t('اسكريبتات وفويس اوفر AI'), 
          desc: t('توليد سكريبتات إعلانية احترافية مع تعليق صوتي وإمكانية تسريع وحفظ الصوت'),
          badge: 'فويس أوفر سريع ⚡'
        },
        { 
          id: 'winnerAngle', 
          icon: Quote, 
          title: t('إعادة توليد الوينر أنجل'), 
          desc: t('إعادة صياغة الزوايا البيعية الرابحة بأساليب تسويقية مقنعة ومتنوعة') 
        },
        { 
          id: 'videoScenes', 
          icon: Film, 
          title: t('أوامر فيديو احترافية (Veo / Flow)'), 
          desc: t('برومبتات بصرية موجهة لتوليد لقطات ومشاهد فيديو إعلانية واقعية') 
        },
        { 
          id: 'flowCharacter', 
          icon: UserIcon, 
          title: t('إنشاء وتثبيت شخصية لـ Flow'), 
          desc: t('تصميم وتثبيت ملامح شخصية موحدة لاستخدامها عبر مشاهد الفيديو المتعددة') 
        },
        { 
          id: 'extractor', 
          icon: Wand2, 
          title: t('استخراج السكريبت من الفيديو'), 
          desc: t('تفريغ النصوص والتعليق الصوتي من أي رابط فيديو إعلاني بدقة تامة') 
        },
      ]
    },
    {
      id: 'visual-creatives',
      title: t('تصاميم الإعلانات والصور الإبداعية'),
      subtitle: t('ابتكار تصاميم بصرية وخلفيات منتجات تزيد من معدل التحويل والنقر CTR'),
      icon: Palette,
      badge: t('تصاميم وصور 🎨'),
      tools: [
        { 
          id: 'creativePrompts', 
          icon: ImageIcon, 
          title: t('أوامر تصاميم الإعلانات (Creative Prompts)'), 
          desc: t('أفكار وتوجيهات بصرية جاهزة لتوليد صور إعلانية جذابة ومحققة للمبيعات') 
        },
        { 
          id: 'photoshoot', 
          icon: Camera, 
          title: t('تصوير المنتجات (Photoshoot AI)'), 
          desc: t('وضع صور المنتج في استوديوهات وخلفيات إعلانية مخصصة بالذكاء الاصطناعي') 
        },
        { 
          id: 'ads', 
          icon: Play, 
          title: t('تصاميم السوشيال ميديا وقصص الإعلانات'), 
          desc: t('إنتاج تصاميم ستوريات وبوستات إعلانية متناسقة وجاهزة للنشر') 
        },
        { 
          id: 'textOnVisual', 
          icon: TypeIcon, 
          title: t('الكتابة الإعلانية على الصور'), 
          desc: t('صياغة نصوص وهوكات بيعية مصممة للتركيب فوق صور وتصاميم المنتجات') 
        },
      ]
    },
    {
      id: 'landing-copy',
      title: t('صفحات الهبوط وكتابة النسخ البيعية'),
      subtitle: t('بناء صفحات هبوط سريعة وكتابة نصوص ترويجية مقنعة للفانلز'),
      icon: Layers,
      badge: t('صفحات ونصوص 📄'),
      tools: [
        { 
          id: 'landingBuilder', 
          icon: LayoutTemplate, 
          title: t('بناء وتعديل صفحة الهبوط'), 
          desc: t('محرر تفاعلي بالسحب والإفلات لتصميم وتعديل صفحات الهبوط وتصدير الكود'),
          badge: 'Drag & Drop 🛠️'
        },
        { 
          id: 'landing', 
          icon: LayoutTemplate, 
          title: t('أقسام ونصوص صفحة الهبوط'), 
          desc: t('صياغة نصوص احترافية لأقسام الهيرو، الفوائد، المقارنات، والـ CTA') 
        },
        { 
          id: 'fbAds', 
          icon: Share2, 
          title: t('نصوص إعلانات فيسبوك وإنستغرام'), 
          desc: t('كتابة نصوص Primary Text وهوكات تسويقية قوية للحملات الإعلانية الممولة') 
        },
        { 
          id: 'funnelCopy', 
          icon: MousePointer, 
          title: t('نسخ صفحات البيع (Funnel Copy)'), 
          desc: t('كتابة عروض البيع الترويجي، صفحات الدفع (Checkout)، والصفحات التكميلية') 
        },
      ]
    },
    {
      id: 'ecommerce-tools',
      title: t('أدوات التجارة الإلكترونية والتتبع'),
      subtitle: t('حساب التكاليف وهوامش الربح بدقة وتتبع الحملات وحفظ الإعلانات'),
      icon: Compass,
      badge: t('أدوات ونمو 📈'),
      tools: [
        { 
          id: 'pricing', 
          icon: Calculator, 
          title: t('حاسبة تسعير وهامش ربح المنتج'), 
          desc: t('حساب تكلفة الإعلان والشحن والرسوم لتحديد سعر البيع الرابح بدقة') 
        },
        { 
          id: 'utmBuilder', 
          icon: LinkIcon, 
          title: t('منشئ روابط التتبع (UTM Builder)'), 
          desc: t('توليد روابط تتبع دقيقة للحملات على جوجل وميتا وتيك توك وسناب') 
        },
        { 
          id: 'downloader', 
          icon: Download, 
          title: t('أداة تنزيل وحفظ الإعلانات'), 
          desc: t('تحميل الفيديوهات الإعلانية والصور من منصات التواصل الاجتماعي بجودة عالية') 
        },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 w-full pb-16" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Category Sections */}
      {categories.map((category) => {
        const allowedTools = category.tools.filter(tool => isToolAllowed(tool.id));
        if (allowedTools.length === 0) return null;

        const CategoryIcon = category.icon;

        return (
          <section key={category.id} className="space-y-5">
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#09090b] text-[#F0B21B] dark:bg-zinc-900 dark:text-[#F0B21B] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                  <CategoryIcon className="w-5 h-5 text-[#F0B21B]" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[#09090b] dark:text-white tracking-tight font-sans">
                    {category.title}
                  </h2>
                  <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {category.subtitle}
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F0B21B]/15 text-amber-800 dark:text-[#F0B21B] border border-[#F0B21B]/30 shrink-0">
                {category.badge}
              </span>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allowedTools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <div
                    key={tool.id}
                    onClick={() => setActiveTab(tool.id)}
                    className="group bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 hover:border-[#F0B21B] dark:hover:border-[#F0B21B] p-5 rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-[#F0B21B]/5 transition-all cursor-pointer flex flex-col justify-between min-h-[145px] relative overflow-hidden shadow-sm"
                  >
                    {/* Top row: Icon + optional badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-[#09090b] text-[#F0B21B] dark:bg-zinc-900 dark:text-[#F0B21B] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-[#F0B21B] group-hover:text-black group-hover:scale-105 transition-all shadow-sm">
                        <ToolIcon className="w-6 h-6 transition-colors" />
                      </div>

                      {tool.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#F0B21B] text-[#09090b] shadow-sm">
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="space-y-1 flex-1">
                      <h3 className="font-extrabold text-base text-[#09090b] dark:text-white group-hover:text-[#F0B21B] dark:group-hover:text-[#F0B21B] transition-colors leading-snug">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>

                    {/* Bottom action hint */}
                    <div className="pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-zinc-400 group-hover:text-[#F0B21B] transition-colors">
                      <span>{t('فتح الأداة')}</span>
                      <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ${isRtl ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Recent Generations Section */}
      {history && history.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#F0B21B]" />
              <h2 className="text-xl font-black text-[#09090b] dark:text-white tracking-tight">
                {t("Recent Projects")}
              </h2>
            </div>
            <button 
              onClick={() => setActiveTab('history')} 
              className="text-xs sm:text-sm font-bold text-[#F0B21B] hover:text-[#DF9F10] transition-colors flex items-center gap-1 cursor-pointer"
            >
              {t("View all")} <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {history.slice(0, 4).map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveTab(item.type)} 
                className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl hover:border-[#F0B21B] hover:shadow-md transition-all cursor-pointer flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0B21B]/15 border border-[#F0B21B]/30 flex flex-shrink-0 items-center justify-center">
                  <Zap className="w-4 h-4 text-[#F0B21B]" />
                </div>
                <div className="overflow-hidden flex-1">
                  <h3 className="font-bold text-xs text-zinc-900 dark:text-white truncate group-hover:text-[#F0B21B] transition-colors" title={item.description}>
                    {item.description || t('Untitled Project')}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                    <span className="capitalize font-medium">{item.type}</span>
                    <span>&bull;</span>
                    <span>{new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
