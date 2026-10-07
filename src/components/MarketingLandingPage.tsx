import React from 'react';
import { LogIn, ArrowRight, Zap, Target, LayoutTemplate, Layers, Users, TrendingUp, Mic, ImageIcon, Video, Star, BarChart } from 'lucide-react';

export default function MarketingLandingPage({ onLogin, onContinueAsGuest }: { onLogin: () => void; onContinueAsGuest?: () => void }) {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#09090b] font-sans selection:bg-[#09090b]/30" dir="rtl">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-zinc-200 z-50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between font-sans">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative flex items-center justify-center rounded-xl shrink-0 p-1">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
            </div>
            <div className="flex flex-col shrink-0">
              <h1 className="text-[15px] sm:text-lg md:text-xl font-black text-[#09090b] tracking-tight leading-none mb-0.5">KH</h1>
              <span className="hidden sm:inline-block text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-zinc-500">Quick Ads</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-10 text-[15px] font-bold text-zinc-600">
            <a href="#features" className="hover:text-[#09090b] transition-colors">المميزات</a>
            <a href="#how-it-works" className="hover:text-[#09090b] transition-colors">كيف نعمل</a>
            <a href="#pricing" className="hover:text-[#09090b] transition-colors">الأسعار</a>
            <div className="flex items-center gap-1 cursor-pointer hover:text-[#09090b] transition-colors">
              المصادر
              <svg className="w-4 h-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
            {onContinueAsGuest && (
              <button 
                onClick={onContinueAsGuest}
                className="px-3 py-1.5 sm:px-4 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md text-[13px] sm:text-sm whitespace-nowrap flex items-center gap-1.5"
              >
                <span>الدخول بدون تسجيل</span>
                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
              </button>
            )}
            <button 
              onClick={onLogin}
              className="text-[13px] sm:text-sm md:text-[15px] font-bold text-[#09090b] hover:text-[#09090b] transition-colors"
            >
              تسجيل الدخول
            </button>
            <button 
              onClick={onLogin}
              className="hidden sm:inline-flex px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-[#09090b] hover:bg-[#18181b] text-white rounded-xl font-bold transition-all shadow-xl shadow-[#09090b]/10 text-[13px] sm:text-sm whitespace-nowrap"
            >
              حساب جديد
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:px-6 relative overflow-hidden bg-white">
        {/* Background glow effects */}
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-[#09090b]/5 rounded-full blur-[100px] -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F0B21B]/10 rounded-full blur-[100px] -z-10 pointer-events-none -translate-x-1/4 translate-y-1/4" />

        <div className="max-w-[1400px] mx-auto grid xl:grid-cols-2 gap-16 items-center">
          {/* Left / Text Side */}
          <div className="text-right z-10 pt-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-zinc-900 text-[#09090b] text-xs md:text-sm font-bold mb-8">
              <SparkleIcon className="w-4 h-4" /> منصة الإبداع التسويقي بالذكاء الاصطناعي
            </div>
            
            <h1 className="text-[2.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-black text-[#09090b] leading-[1.1] mb-6 tracking-tight">
              أنشئ إعلانات عالية التحويل.<br/> أسرع بـ 10 أضعاف.
            </h1>
            
            <p className="text-lg md:text-xl md:text-2xl text-zinc-500 mb-10 leading-relaxed font-medium max-w-2xl">
              قم بتوليد صفحات الهبوط، نصوص الإعلانات، أفكار الفيديو، الأصوات بالذكاء الاصطناعي، والمزيد—كل ما تحتاجه لإطلاق حملات رابحة.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto px-8 py-5 bg-[#F0B21B] hover:bg-[#DF9F10] text-[#09090b] rounded-2xl font-black text-xl shadow-xl shadow-[#F0B21B]/20 transition-all flex items-center justify-center gap-3"
              >
                سجل مجاناً الآن
                <ArrowRight className="w-6 h-6 rtl:-scale-x-100" />
              </button>
              {onContinueAsGuest && (
                <button 
                  onClick={onContinueAsGuest}
                  className="w-full sm:w-auto px-8 py-5 bg-[#09090b] hover:bg-[#18181b] text-white rounded-2xl font-bold shadow-xl shadow-[#09090b]/20 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  دخول مباشر كضيف ⚡
                </button>
              )}
              <button 
                className="w-full sm:w-auto px-8 py-5 bg-white text-[#09090b] border border-zinc-200 rounded-2xl font-bold shadow-sm hover:bg-zinc-50 transition-colors flex items-center justify-center gap-3 text-lg"
              >
                كيف نعمل
                <div className="w-6 h-6 rounded-full border border-[#09090b] flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-[#09090b] ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-bold text-zinc-500 mb-12">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#09090b] flex items-center justify-center text-white">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                لا تحتاج لبطاقة ائتمان
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#09090b] flex items-center justify-center text-white">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                يثق بنا 3,000+ مسوق
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#09090b] flex items-center justify-center text-white">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                إلغاء في أي وقت
              </div>
            </div>
          </div>

          {/* Right / Mockup Side */}
          <div className="relative xl:-mr-12 perspective-1000 mt-12 xl:mt-0 w-full max-w-full overflow-hidden md:overflow-visible h-[280px] sm:h-[360px] md:h-auto" dir="ltr">
            {/* The soft glow behind the mockup */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#09090b]/20 to-[#F0B21B]/20 blur-3xl -z-10 w-[120%] h-[120%] -top-10 -right-10 hidden md:block" />
            
            {/* Mobile scale wrapper */}
            <div className="w-[800px] h-[550px] md:w-auto md:h-auto origin-top-left scale-[0.45] sm:scale-[0.6] md:scale-100">
              <div className="relative transform md:rotate-y-[-5deg] md:rotate-x-[2deg] rotate-z-[1deg] translate-x-2 xl:translate-x-4 shadow-[0_30px_60px_-15px_rgba(123,63,242,0.3)] rounded-3xl overflow-hidden border border-white bg-white w-full h-full md:w-[110%] md:h-[750px] flex">
              
              {/* Fake Sidebar */}
              <div className="w-64 bg-zinc-50 border-r border-zinc-100 p-6 flex flex-col h-full shrink-0 relative z-10">
                <div className="flex items-center gap-2 mb-10">
                  <div className="p-1 rounded-lg">
                    <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                  </div>
                  <h1 className="font-black text-[#09090b] tracking-tight">KH</h1>
                </div>
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white shadow-sm rounded-xl text-[#09090b] font-bold text-sm border border-zinc-200">
                    <LayoutTemplate className="w-4 h-4 text-[#09090b]" /> Dashboard
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-zinc-500 font-medium text-sm hover:bg-zinc-100 rounded-xl">
                    <Layers className="w-4 h-4" /> Projects
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-zinc-500 font-medium text-sm hover:bg-zinc-100 rounded-xl">
                    <SparkleIcon className="w-4 h-4" /> Generate
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-zinc-500 font-medium text-sm hover:bg-zinc-100 rounded-xl">
                    <BarChart className="w-4 h-4" /> Analytics
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-zinc-500 font-medium text-sm hover:bg-zinc-100 rounded-xl">
                    <ImageIcon className="w-4 h-4" /> Brand Kits
                  </div>
                </div>
                
                <div className="mt-auto flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-zinc-200">
                  <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200" className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-[#09090b]">Ahmed N.</h4>
                    <p className="text-xs text-zinc-500">Pro Plan</p>
                  </div>
                </div>
              </div>

              {/* Fake Main Content */}
              <div className="flex-1 bg-[#FAFAFA] p-8 overflow-hidden h-full flex flex-col pt-12 relative z-0">
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#09090b]/5 to-transparent pointer-events-none" />
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-[#09090b] mb-1 flex items-center gap-2">
                    <SparkleIcon className="w-5 h-5 text-[#09090b]" /> Create New Asset
                  </h3>
                  <p className="text-zinc-500 text-sm">What would you like to create today?</p>
                </div>
                
                {/* Generation Options */}
                <div className="grid grid-cols-4 gap-4 mb-10">
                  <div className="p-4 border border-zinc-200 rounded-2xl flex flex-col items-center text-center hover:border-[#09090b] transition-colors shadow-sm bg-white">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                      <LayoutTemplate className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-[#09090b]">Landing Page</h4>
                    <span className="text-[10px] text-zinc-400 mt-1">AI landing pages that convert</span>
                  </div>
                  <div className="p-4 border border-[#F0B21B] bg-[#F0B21B]/5 rounded-2xl flex flex-col items-center text-center shadow-sm relative">
                     <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#F0B21B] rounded-full border-2 border-white" />
                    <div className="w-10 h-10 bg-[#F0B21B]/20 text-[#09090b] rounded-xl flex items-center justify-center mb-3">
                      <Mic className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-[#09090b]">Ad Script</h4>
                    <span className="text-[10px] text-zinc-500 mt-1">Powerful scripts that sell</span>
                  </div>
                  <div className="p-4 border border-zinc-200 rounded-2xl flex flex-col items-center text-center hover:border-[#09090b] transition-colors shadow-sm bg-white">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-zinc-900 text-zinc-900 dark:text-[#F0B21B] rounded-xl flex items-center justify-center mb-3">
                      <Video className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-[#09090b]">Short Video Concept</h4>
                    <span className="text-[10px] text-zinc-400 mt-1">Viral video ideas that grab attention</span>
                  </div>
                  <div className="p-4 border border-zinc-200 rounded-2xl flex flex-col items-center text-center hover:border-[#09090b] transition-colors shadow-sm bg-white">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-3">
                      <Target className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-[#09090b]">Ad Copy</h4>
                    <span className="text-[10px] text-zinc-400 mt-1">High-converting copy & headlines</span>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-lg font-bold text-[#09090b]">Recent Creations</h4>
                  <span className="text-xs font-bold text-zinc-500 bg-white border border-zinc-200 shadow-sm px-3 py-1 rounded-full">View all</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <div className="bg-white rounded-2xl border border-zinc-200 p-2 flex flex-col shadow-sm">
                    <div className="h-36 bg-zinc-200 rounded-xl mb-3 overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" />
                    </div>
                    <h5 className="text-sm font-bold text-[#09090b] px-1">Landing Page</h5>
                    <span className="text-xs text-zinc-400 px-1 mt-0.5">2 minutes ago</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-zinc-200 p-2 flex flex-col shadow-sm">
                    <div className="h-36 bg-zinc-200 rounded-xl mb-3 overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">0:30</div>
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-[#09090b] ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </div>
                    <h5 className="text-sm font-bold text-[#09090b] px-1">Ad Script</h5>
                    <span className="text-xs text-zinc-400 px-1 mt-0.5">15 minutes ago</span>
                  </div>
                  <div className="bg-[#E7F2F1] rounded-2xl border border-[#F0B21B]/30 p-2 flex flex-col relative overflow-hidden shadow-sm">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#F0B21B]/20 rounded-full blur-2xl"></div>
                    <h5 className="text-xl font-black text-[#09090b] px-3 pt-3 leading-tight z-10 w-2/3">Transform Your Skin in 7 Days</h5>
                    <div className="mt-auto px-3 pb-3 z-10">
                       <span className="text-[10px] font-bold text-white bg-[#09090b] px-4 py-2 rounded-full inline-block shadow-lg">Shop Now</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Under Hero 4-card Horizontal section */}
      <section className="py-16 px-6 bg-white border-b border-zinc-100">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#09090b]/10 text-[#09090b] flex items-center justify-center shrink-0">
               <Zap className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-[#09090b] text-lg mb-2">توليد بالذكاء الاصطناعي</h3>
              <p className="text-zinc-500 text-[15px] leading-relaxed">انشئ محتوى يتحول لمبيعات بقوة الذكاء الاصطناعي الخاص بنا.</p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#F0B21B]/20 text-[#F0B21B] flex items-center justify-center shrink-0">
               <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-[#09090b] text-lg mb-2">منصة شاملة متكاملة</h3>
              <p className="text-zinc-500 text-[15px] leading-relaxed">كل شيء تحتاجه لإطلاق إعلانات ناجحة في واجهة واحدة.</p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
               <BarChart className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-[#09090b] text-lg mb-2">تطوير وتوسيع الحملات</h3>
              <p className="text-zinc-500 text-[15px] leading-relaxed">قم بتحليل الأداء واحصل على توصيات دقيقة من الذكاء الاصطناعي.</p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
               <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-[#09090b] text-lg mb-2">توفير الوقت والمال</h3>
              <p className="text-zinc-500 text-[15px] leading-relaxed">قلل وقت الإنتاج ووفر تكاليف الإبداع بشكل ضخم.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Section */}
      <section className="py-24 px-6 bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
           <div>
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-100 text-fuchsia-700 text-sm font-bold mb-6">
                <Target className="w-4 h-4" /> توفير الوقت
             </div>
             <h2 className="text-3xl md:text-5xl font-black text-[#09090b] mb-6 leading-tight">آلة كتابة وتصميم تعمل عنك طوال اليوم</h2>
             <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
               تخيل أن يكون لديك كاتب إعلانات محترف، مخرج فيديوهات، ومصمم يعملون معاً على حملتك الإعلانية. منصتنا تغنيك عن توظيف فريق كامل وتمنحك كل ما تحتاجه للبدء بالبيع وإطلاق الإعلانات فوراً.
             </p>
             <ul className="space-y-4 mb-8">
               <li className="flex items-center gap-3 text-zinc-700 font-medium">
                 <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">✓</div>
                 تحليل الـ Winners وكتابة سكريبتات فيديو مشابهة
               </li>
               <li className="flex items-center gap-3 text-zinc-700 font-medium">
                 <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">✓</div>
                 توليد صفحات هبوط متكاملة مصممة لرفع الـ Conversion Rate
               </li>
               <li className="flex items-center gap-3 text-zinc-700 font-medium">
                 <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">✓</div>
                 الحفاظ الجذري على هوية براندك (Brand Identity) في كل سطر مصمم
               </li>
             </ul>
             <button onClick={onLogin} className="text-[#F0B21B] font-bold hover:text-fuchsia-700 flex items-center gap-2">
               ابدأ بصناعة إعلانك الأول <ArrowRight className="w-4 h-4" />
             </button>
           </div>
           <div className="relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full" />
             <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=2070" className="rounded-2xl shadow-2xl border-4 border-white" alt="Dashboard stats" />
           </div>
        </div>
      </section>

      {/* Features / Funnel */}
      <section id="features" className="py-24 px-6 bg-white shrink-0 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#09090b] mb-4">آلة انتاج إعلانية متكاملة</h2>
            <p className="text-lg text-zinc-500">كل ما تحتاجه لإطلاق حملتك الإعلانية من مكان واحد</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<LayoutTemplate />}
              title="صفحات الهبوط"
              desc="وصف منتجك فقط، وسيقوم الذكاء الاصطناعي ببناء وهيكلة صفحة هبوط كاملة مخصصة للمبيعات والتحويلات."
              color="#F0B21B"
            />
            <FeatureCard 
              icon={<Video />}
              title="سكريبتات UGC"
              desc="توليد سيناريوهات لمقاطع فيديو قصيرة للتيك توك والريلز، مع وصف دقيق للمشاهد وحركات الكاميرا."
              color="#09090b"
            />
            <FeatureCard 
              icon={<Target />}
              title="نصوص إعلانية"
              desc="اكتب نصوص إعلانات جذابة للفيسبوك مع إبراز نقاط الألم والفوائد، بنقرة زر واحدة."
              color="#F59E0B"
            />
            <FeatureCard 
              icon={<ImageIcon />}
              title="أوامر التصاميم"
              desc="استخرج أفكارًا لصور إبداعية للمنتجات وولد الـ Prompts الخاصة بها جاهزة للإستخدام في Midjourney."
              color="#EC4899"
            />
            <FeatureCard 
              icon={<Mic />}
              title="تعليق صوتي"
              desc="تحويل السكريبتات إلى أصوات طبيعية ولهجات محلية (مصري، خليجي، فصحى) بجودة استوديو."
              color="#14B8A6"
            />
            <FeatureCard 
              icon={<BarChart />}
              title="تحليل الحملات"
              desc="الذكاء الاصطناعي يحلل لك أداء الحملات ويعطيك استراتيجيات دقيقة لتحسين العائد على الإعلانات (ROAS)."
              color="#09090b"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-[#09090b] text-white">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">كيف تعمل المنصة؟</h2>
          <p className="text-zinc-400 text-lg">بثلاث خطوات بسيطة فقط.</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative">
           <div className="absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#F0B21B] to-[#09090b] hidden md:block" />
           
           <Step 
             num="1" 
             title="شارك رابط المنتج" 
             desc="ضع رابط المنتج أو اكتب وصفاً يدوياً مبسطاً وسيقوم الذكاء الاصطناعي بفهمه وتجهيز البيانات."
             color="#F0B21B"
           />
           <Step 
             num="2" 
             title="اختر الهوية" 
             desc="حدد الـ Brand Kit الخاص بك (نبرة الصوت، الألوان، الخطوط) لضمان اتساق كافة مخرجاتك."
             color="#09090b"
           />
           <Step 
             num="3" 
             title="أنشئ ما تحتاج" 
             desc="ولد صفحة هبوط، إعلانات، نصوص، سكريبتات، وأصوات كلها معدة خصيصاً للتوافق مع هوية البراند."
             color="#FF5F03"
           />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#09090b] mb-4">خطط الأسعار</h2>
            <p className="text-lg text-zinc-500">اختر الخطة المناسبة لحجم عملك</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm relative flex flex-col hover:border-[#F0B21B]/50 transition-colors">
              <h3 className="text-xl font-bold text-[#09090b] mb-2">الأساسية</h3>
              <p className="text-zinc-500 text-sm mb-6">للمبتدئين والمشاريع الصغيرة</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-[#09090b]">$15</span>
                <span className="text-zinc-500">/شهر</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-zinc-700 text-sm"><div className="w-5 h-5 rounded-full bg-[#F0B21B]/20 text-[#F0B21B] flex items-center justify-center shrink-0">✓</div> 100 توكين شهرياً</li>
                <li className="flex items-center gap-3 text-zinc-700 text-sm"><div className="w-5 h-5 rounded-full bg-[#F0B21B]/20 text-[#F0B21B] flex items-center justify-center shrink-0">✓</div> 1 Brand Kit</li>
                <li className="flex items-center gap-3 text-zinc-700 text-sm"><div className="w-5 h-5 rounded-full bg-[#F0B21B]/20 text-[#F0B21B] flex items-center justify-center shrink-0">✓</div> توليد نصوص وصفحات هبوط</li>
                <li className="flex items-center gap-3 text-zinc-400 text-sm"><div className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center shrink-0">✕</div> لا يشمل التعليق الصوتي</li>
              </ul>
              <button onClick={onLogin} className="w-full py-3 rounded-xl font-bold bg-zinc-100 text-[#09090b] hover:bg-zinc-200 transition-colors">
                اشترك الآن
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#09090b] rounded-3xl p-8 border-2 border-[#09090b] shadow-2xl relative flex flex-col transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#09090b] to-[#F0B21B] text-[#09090b] px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                الأكثر شعبية
              </div>
              <h3 className="text-xl font-bold text-white mb-2">الاحترافية</h3>
              <p className="text-zinc-400 text-sm mb-6">للمسوقين وأصحاب المتاجر</p>
              <div className="mb-6 text-white">
                <span className="text-4xl font-black">$49</span>
                <span className="text-zinc-400">/شهر</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-zinc-200 text-sm"><div className="w-5 h-5 rounded-full bg-[#F0B21B]/20 text-[#F0B21B] flex items-center justify-center shrink-0">✓</div> 3,000 توكين شهرياً</li>
                <li className="flex items-center gap-3 text-zinc-200 text-sm"><div className="w-5 h-5 rounded-full bg-[#F0B21B]/20 text-[#F0B21B] flex items-center justify-center shrink-0">✓</div> 5 Brand Kits</li>
                <li className="flex items-center gap-3 text-zinc-200 text-sm"><div className="w-5 h-5 rounded-full bg-[#F0B21B]/20 text-[#F0B21B] flex items-center justify-center shrink-0">✓</div> توليد نصوص وفيديو وصفحات هبوط</li>
                <li className="flex items-center gap-3 text-zinc-200 text-sm"><div className="w-5 h-5 rounded-full bg-[#F0B21B]/20 text-[#F0B21B] flex items-center justify-center shrink-0">✓</div> تعليق صوتي بالذكاء الاصطناعي</li>
              </ul>
              <button onClick={onLogin} className="w-full py-3 rounded-xl font-bold bg-[#F0B21B] text-[#09090b] hover:bg-[#DF9F10] transition-colors shadow-lg shadow-[#F0B21B]/20">
                ابدأ تجربتك
              </button>
            </div>

            {/* Team Plan */}
            <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm relative flex flex-col hover:border-[#F0B21B]/50 transition-colors">
              <h3 className="text-xl font-bold text-[#09090b] mb-2">الفريق</h3>
              <p className="text-zinc-500 text-sm mb-6">للوكالات والفرق الكبيرة</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-[#09090b]">$99</span>
                <span className="text-zinc-500">/شهر</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-zinc-700 text-sm"><div className="w-5 h-5 rounded-full bg-[#F0B21B]/20 text-[#F0B21B] flex items-center justify-center shrink-0">✓</div> 12,000 توكين شهرياً</li>
                <li className="flex items-center gap-3 text-zinc-700 text-sm"><div className="w-5 h-5 rounded-full bg-[#F0B21B]/20 text-[#F0B21B] flex items-center justify-center shrink-0">✓</div> عدد لا محدود Brand Kits</li>
                <li className="flex items-center gap-3 text-zinc-700 text-sm"><div className="w-5 h-5 rounded-full bg-[#F0B21B]/20 text-[#F0B21B] flex items-center justify-center shrink-0">✓</div> كل مميزات الخطة الاحترافية</li>
                <li className="flex items-center gap-3 text-zinc-700 text-sm"><div className="w-5 h-5 rounded-full bg-[#F0B21B]/20 text-[#F0B21B] flex items-center justify-center shrink-0">✓</div> مساحات عمل للفرق ودعم أولوية</li>
              </ul>
              <button onClick={onLogin} className="w-full py-3 rounded-xl font-bold bg-zinc-100 text-[#09090b] hover:bg-zinc-200 transition-colors">
                تواصل معنا
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-[#09090b] to-indigo-900 border-t border-indigo-900/50 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-30">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#F0B21B]/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-6 drop-shadow-lg">الوقت هو المال</h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto drop-shadow-md">
            توقف عن إضاعة الساعات في كتابة الإعلانات والسكريبتات. ادخل عصر الأتمتة الإبداعية وزد من مبيعاتك اليوم.
          </p>
          <button 
            onClick={onLogin}
            className="px-10 py-5 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mx-auto"
          >
            سجل مجاناً الآن
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-12 px-6 text-center text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center font-black text-[#09090b]">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain ml-2 rtl:ml-0 rtl:mr-2" /> Quick Ads System
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} KH Quick Ads. جميع الحقوق محفوظة.
          </div>
          <div className="flex gap-4 text-sm">
            <a href="/privacy-policy" className="hover:text-[#09090b]">سياسة الخصوصية</a>
            <a href="/terms-of-service" className="hover:text-[#09090b]">الشروط والأحكام</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="p-8 rounded-3xl bg-[#F7F9FC] border border-zinc-100 hover:border-[#09090b]/30 hover:shadow-xl hover:shadow-[#09090b]/5 transition-all group">
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md mb-6 transform group-hover:scale-110 transition-transform"
        style={{ backgroundColor: color }}
      >
        {React.cloneElement(icon as React.ReactElement, { className: 'w-7 h-7' })}
      </div>
      <h3 className="text-xl font-bold text-[#09090b] mb-3">{title}</h3>
      <p className="text-zinc-500 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc, color }: { num: string, title: string, desc: string, color: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center bg-[#0F2957] p-8 rounded-3xl border border-white/5">
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-[#09090b] mb-6 shadow-xl"
        style={{ backgroundColor: color }}
      >
        {num}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function SparkleIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 1L9.12 9.12L1 12L9.12 14.88L12 23L14.88 14.88L23 12L14.88 9.12L12 1Z" />
    </svg>
  );
}
