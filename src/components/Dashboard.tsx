import React, { useState } from 'react';
import { Zap, Bot, Radar, Play, TrendingUp, Camera, FileText, Image as ImageIcon, ArrowRight, Copy, MousePointer, LayoutTemplate, ChevronDown, CheckCircle2, History, Wand2, Film, User as UserIcon, Target, Quote, Share2, Type as TypeIcon, Brain, Download, Calculator, BarChart2, Link as LinkIcon, ChevronUp } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface DashboardProps {
    setActiveTab: (tab: string) => void;
    history: any[];
    userProfile?: any;
    isToolAllowed: (toolId: string) => boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, history, userProfile, isToolAllowed }) => {
    const { t, language } = useLanguage();
    const isRtl = language === 'ar';
    const [isAiToolsExpanded, setIsAiToolsExpanded] = useState(false);
    const tokens = userProfile?.tokens ?? 0;
    const plan = userProfile?.plan || 'Free';

    // Tool icons map
    const typeMeta: Record<string, { icon: any, color: string, label: string }> = {
      'photoshoot': { icon: Camera, color: 'text-zinc-900 dark:text-[#F0B21B]', label: t('Photoshoot AI') || 'Photoshoot AI' },
      'script': { icon: FileText, color: 'text-blue-500', label: t('Video Scripts') || 'Video Scripts' },
      'landing': { icon: LayoutTemplate, color: 'text-teal-500', label: t('Landing Pages') || 'Landing Pages' },
      'ads': { icon: Play, color: 'text-[#F0B21B]', label: t('Creative Ads') || 'Creative Ads' },
      'creativePrompts': { icon: ImageIcon, color: 'text-amber-500', label: t('Creative Prompts') || 'Prompts' },
      'videoScenes': { icon: Film, color: 'text-rose-500', label: t('أوامر فيديو (Veo)') || 'Veo Prompts' },
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 w-full" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Top Dashboard Hero stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative bg-[#09090b] text-white rounded-3xl p-6 md:p-10 overflow-hidden shadow-xl shadow-[#09090b]/10 flex flex-col justify-center min-h-[260px]">
                   <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b] to-[#09090b]/20 z-0"></div>
                   <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#09090b] blur-[100px] rounded-full opacity-60 z-0 pointer-events-none"></div>
                   
                   <div className="relative z-10">
                      <h1 className="text-2xl md:text-4xl font-black mb-3 tracking-tight">
                          {t("Welcome back,")} <span className="text-[#F0B21B]">{userProfile?.name?.split(' ')[0] || t("Creator")}</span> 👋
                      </h1>
                      <p className="text-white/80 max-w-sm md:max-w-md font-medium text-sm md:text-base leading-relaxed font-sans">
                          {t("Ready to scale your business? Choose a tool below to start generating high-converting creatives in seconds.")}
                      </p>
                   </div>
                </div>

               <div className="bg-white dark:bg-[#121214] border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-[#F0B21B]/50 transition-colors">
                  <div className="w-16 h-16 bg-[#F0B21B]/10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                     <Zap className="w-8 h-8 text-[#F0B21B]" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-500 mb-1">{t("Available Tokens")}</h3>
                  <div className="text-5xl font-black text-[#09090b] dark:text-white mb-2">{tokens.toLocaleString()}</div>
                  <div className="inline-flex items-center gap-1.5 bg-[#F0B21B]/15 text-amber-700 dark:text-[#F0B21B] px-3 py-1 rounded-lg text-xs font-bold border border-[#F0B21B]/30">
                     <CheckCircle2 className="w-3.5 h-3.5" />
                     {plan} Plan
                  </div>
               </div>
            </div>

            {/* AI Tools Grid */}
            <div>
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-bold text-[#111827] dark:text-white tracking-tight flex items-center gap-2">
                     <Wand2 className="w-5 h-5 text-[#09090b]" /> {t("AI Generation Tools")}
                 </h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(() => {
                      const allAiTools = [
                                                    { id: 'autoSuite', icon: Bot, title: t('الأتمتة الشاملة بالذكاء الاصطناعي'), desc: t('توليد كل الأقسام بضغطة زر واحدة'), color: 'from-fuchsia-600/30 to-purple-600/10', iconColor: 'text-[#F0B21B]' },
                          { id: 'adsMetrics', icon: BarChart2, title: t('محلل الحملات والإعلانات'), desc: t('أدوات تحليل الأداء واتخاذ القرار (Metrics)'), color: 'from-blue-600/30 to-blue-600/10', iconColor: 'text-blue-500' },
                          { id: 'cpaPlanner', icon: Calculator, title: t('مخطط تقليل CPA'), desc: t('إنشاء 3 سيناريوهات لتخفيض التكلفة'), color: 'from-emerald-600/30 to-emerald-600/10', iconColor: 'text-emerald-500' },
                          { id: 'productBrain', icon: Brain, title: t('تحليل المنتج'), desc: t('Deep product analysis'), color: 'from-fuchsia-500/20 to-fuchsia-500/5', iconColor: 'text-[#F0B21B]' },
                          { id: 'smartAngles', icon: Target, title: t('زوايا إعلانية ذكية'), desc: t('Smart ad angles'), color: 'from-red-500/20 to-red-500/5', iconColor: 'text-red-600' },
                          { id: 'productSpy', icon: Radar, title: t('صائد المنتجات'), desc: t('البحث عن الإعلانات'), color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-600' },
                          { id: 'photoshoot', icon: Camera, title: t('Photoshoot AI'), desc: t('Professional product shots'), color: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-zinc-900 dark:text-[#F0B21B]' },
                          { id: 'videoScenes', icon: Film, title: t('أوامر فيديو (Veo / Flow)'), desc: t('Professional video visual prompts'), color: 'from-rose-500/20 to-rose-500/5', iconColor: 'text-rose-600' },
                          { id: 'flowCharacter', icon: UserIcon, title: t('إنشاء شخصية لـ Flow'), desc: t('Character generation for Flow'), color: 'from-pink-500/20 to-pink-500/5', iconColor: 'text-pink-600' },
                          { id: 'creativePrompts', icon: ImageIcon, title: t('Creative Prompts'), desc: t('AI Image visual ideas'), color: 'from-amber-500/20 to-amber-500/5', iconColor: 'text-amber-600' },
                          { id: 'landing', icon: LayoutTemplate, title: t('Landing Pages'), desc: t('Funnel sections & copy'), color: 'from-teal-500/20 to-teal-500/5', iconColor: 'text-teal-600' },
                          { id: 'landingBuilder', icon: LayoutTemplate, title: t('بناء صفحة الهبوط'), desc: t('Drag & drop builder'), color: 'from-cyan-500/20 to-cyan-500/5', iconColor: 'text-cyan-600' },
                          { id: 'ads', icon: Play, title: t('Creative Ads'), desc: t('Ad generation & ideas'), color: 'from-orange-500/20 to-orange-500/5', iconColor: 'text-orange-600' },
                          { id: 'script', icon: FileText, title: t('Video Scripts'), desc: t('High-converting ad copies'), color: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-600' },
                          { id: 'winnerAngle', icon: Quote, title: t('Winner Scripts'), desc: t('Winning angles for scripts'), color: 'from-indigo-500/20 to-indigo-500/5', iconColor: 'text-indigo-600' },
                          { id: 'extractor', icon: Wand2, title: t('Script Extractor'), desc: t('Extract scripts from videos'), color: 'from-violet-500/20 to-violet-500/5', iconColor: 'text-violet-600' },
                          { id: 'fbAds', icon: Share2, title: t('FB Ads Copies'), desc: t('Facebook ads generation'), color: 'from-sky-500/20 to-sky-500/5', iconColor: 'text-sky-600' },
                          { id: 'funnelCopy', icon: MousePointer, title: t('Funnel Copy'), desc: t('Sales funnel copywriting'), color: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-600' },
                          { id: 'textOnVisual', icon: TypeIcon, title: t('Text on Visual'), desc: t('Text overlay for visuals'), color: 'from-lime-500/20 to-lime-500/5', iconColor: 'text-lime-600' },
                          { id: 'downloader', icon: Download, title: t('Ad Downloader'), desc: t('Download ads easily'), color: 'from-zinc-500/20 to-zinc-500/5', iconColor: 'text-zinc-600' },
                          { id: 'pricing', icon: Calculator, title: t('تسعير المنتج'), desc: t('Product pricing calculator'), color: 'from-yellow-500/20 to-yellow-500/5', iconColor: 'text-yellow-600' },
                          { id: 'utmBuilder', icon: LinkIcon, title: t('UTM Builder'), desc: t('Generate UTM links'), color: 'from-slate-500/20 to-slate-500/5', iconColor: 'text-slate-600' },
                      ];

                      const allowedTools = allAiTools.filter(tool => isToolAllowed(tool.id));
                      const displayedTools = isAiToolsExpanded ? allowedTools : allowedTools.slice(0, 8);

                      return (
                        <>
                          {displayedTools.map(tool => (
                            <div 
                               key={tool.id} 
                               onClick={() => setActiveTab(tool.id as any)} 
                               className="bg-white dark:bg-[#1E293B] border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl hover:-translate-y-1 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-[#09090b]/5"
                            >
                               <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                   <tool.icon className={`w-6 h-6 ${tool.iconColor}`} />
                               </div>
                               <h4 className="font-bold text-base text-zinc-900 dark:text-white mb-1 group-hover:text-[#09090b] transition-colors">{tool.title}</h4>
                               <p className="text-xs text-zinc-500">{tool.desc}</p>
                            </div>
                          ))}
                        </>
                      );
                  })()}
               </div>
               
               {/* View All Button */}
               <div className="mt-6 flex justify-center">
                 <button 
                   onClick={() => setIsAiToolsExpanded(!isAiToolsExpanded)}
                   className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-[#09090b] dark:hover:text-[#09090b] transition-colors shadow-sm"
                 >
                   {isAiToolsExpanded ? (
                     <>
                       {t("عرض أقل")} <ChevronUp className="w-4 h-4" />
                     </>
                   ) : (
                     <>
                       {t("عرض كل الأدوات")} <ChevronDown className="w-4 h-4" />
                     </>
                   )}
                 </button>
               </div>
            </div>

            {/* Dashboard Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Generations */}
                <div className="lg:col-span-2 space-y-4">
                     <div className="flex justify-between items-center bg-transparent">
                         <h2 className="text-xl font-bold text-[#111827] dark:text-white tracking-tight">{t("Recent Projects")}</h2>
                         <button onClick={() => setActiveTab('history')} className="text-sm font-semibold text-[#09090b] hover:text-[#18181b] transition-colors flex items-center gap-1">
                             {t("View all")} <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                         </button>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {history && history.length > 0 ? (
                              history.slice(0, 4).map((item, idx) => {
                                  const meta = typeMeta[item.type] || { icon: Zap, color: 'text-zinc-500', label: item.type };
                                  const Icon = meta.icon;
                                  return (
                                  <div key={idx} onClick={() => setActiveTab(item.type)} className="bg-white dark:bg-[#1E293B] border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl hover:border-[#09090b]/50 hover:shadow-lg transition-all cursor-pointer flex items-start gap-4">
                                      <div className={`w-12 h-12 rounded-xl bg-zinc-50 dark:bg-[#0F172A] border border-zinc-100 dark:border-zinc-700 flex flex-shrink-0 items-center justify-center`}>
                                          <Icon className={`w-5 h-5 ${meta.color}`} />
                                      </div>
                                      <div className="overflow-hidden flex-1">
                                          <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate" title={item.description}>{item.description || t('Untitled Project')}</h3>
                                          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                                              <span className="capitalize font-medium">{meta.label}</span>
                                              <span>&bull;</span>
                                              <span>{new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                                          </p>
                                      </div>
                                  </div>
                              )})
                          ) : (
                              // Empty state
                              <div className="col-span-2 bg-white dark:bg-[#1E293B] border border-dashed border-zinc-300 dark:border-zinc-700 p-8 rounded-2xl text-center">
                                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <History className="w-8 h-8 text-zinc-400" />
                                  </div>
                                  <h3 className="font-bold text-zinc-900 dark:text-white mb-1">{t("No projects yet")}</h3>
                                  <p className="text-sm text-zinc-500">{t("Your generated content will appear here.")}</p>
                              </div>
                          )}
                     </div>
                </div>

                {/* Performance / Updates Side */}
                <div className="space-y-4">
                     <h2 className="text-xl font-bold text-[#111827] dark:text-white tracking-tight">{t("Quick Actions")}</h2>
                     <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] dark:from-[#09090b] dark:to-[#0a1830] text-white p-6 rounded-3xl relative overflow-hidden border border-white/10">
                          {/* Decorative pattern */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
                          <div className="relative z-10 flex flex-col gap-4">
                               <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 bg-[#F0B21B]/20 rounded-xl flex items-center justify-center border border-[#F0B21B]/30">
                                         <TrendingUp className="w-5 h-5 text-[#F0B21B]" />
                                    </div>
                                    <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded border border-white/5">{t("Recommended")}</span>
                               </div>
                               <div>
                                   <h3 className="text-lg font-bold mb-1">{t("Generate Ads Faster")}</h3>
                                   <p className="text-sm text-white/70">{t("Try our new Landing Page generator to build complete funnels in 1 click.")}</p>
                               </div>
                               <button onClick={() => setActiveTab('landing')} className="w-full mt-2 bg-white text-[#09090b] font-bold py-2.5 rounded-xl hover:bg-zinc-200 transition-colors text-sm">
                                   {t("Try Landing Pages")}
                               </button>
                          </div>
                     </div>
                     <div className="bg-white dark:bg-[#1E293B] border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex items-center justify-between shadow-sm cursor-pointer hover:border-[#09090b]/50 transition-colors" onClick={() => setActiveTab('history')}>
                         <div>
                             <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{t("Download Assets")}</h4>
                             <p className="text-[11px] text-zinc-500 mt-0.5">{t("Access your generated media")}</p>
                         </div>
                         <ArrowRight className={`w-5 h-5 text-zinc-400 ${isRtl ? 'rotate-180' : ''}`} />
                     </div>
                </div>
            </div>
        </div>
    );
};
