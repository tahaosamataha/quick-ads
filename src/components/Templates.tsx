import * as LucideIcons from 'lucide-react';
import { LandingPageSection } from '../services/ai';

interface TemplateProps {
  section: LandingPageSection;
  imageUrl: string;
  fontFamily?: string;
  themeColor?: string;
  designStyle?: 'tech' | 'lifestyle' | 'direct' | 'minimal' | 'elegant' | 'bold' | 'premium_custom';
  textColor?: string;
  textEffect?: string;
  showTextBackground?: boolean;
}

const getIcon = (name?: string) => {
  if (!name) return LucideIcons.CheckCircle2;
  const pascalName = name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  return (LucideIcons as any)[pascalName] || LucideIcons.CheckCircle2;
};

export const TemplateRenderer = ({ section, imageUrl, fontFamily = 'font-alexandria', themeColor = 'text-yellow-400', designStyle = 'tech', textColor = 'text-white', textEffect = 'none', showTextBackground = true }: TemplateProps) => {
  const { title, subtitle, items, template, ctaText } = section;
  
  // Helper to get background color class from text color class
  const getBgColor = (textClass: string) => textClass.replace('text-', 'bg-');

  // Style configurations based on designStyle
  const isTech = designStyle === 'tech';
  const isLifestyle = designStyle === 'lifestyle';
  const isDirect = designStyle === 'direct';
  const isMinimal = designStyle === 'minimal';
  const isElegant = designStyle === 'elegant';
  const isBold = designStyle === 'bold';
  const isPremium = designStyle === 'premium_custom';

  const isDarkText = textColor === 'text-black' || textColor === 'text-slate-900';
  const baseColor = textColor === 'theme' ? themeColor : textColor;
  const effect = textEffect !== 'none' ? textEffect : '';

  const getIconColor = () => {
    if (isTech) return 'text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]';
    if (isDirect) return isDarkText ? 'text-slate-900' : 'text-yellow-400';
    if (isMinimal) return isDarkText ? 'text-[#112233]' : 'text-white';
    if (isBold) return isDarkText ? 'text-black' : 'text-white';
    
    if (!isDarkText && (themeColor === 'text-slate-900' || themeColor === 'text-black')) return 'text-white';
    if (isDarkText && (themeColor === 'text-white' || themeColor === 'text-zinc-100')) return 'text-slate-900';
    return themeColor;
  };

  const getPanelClass = () => {
    if (!showTextBackground) return '';
    if (isTech) return `${isDarkText ? 'bg-white/90' : 'bg-slate-900/60'} backdrop-blur-md border ${isDarkText ? 'border-slate-200' : 'border-white/10'} shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-2xl`;
    if (isLifestyle) return `${isDarkText ? 'bg-white/90' : 'bg-black/60'} backdrop-blur-sm border ${isDarkText ? 'border-white' : 'border-white/20'} shadow-2xl rounded-[40px]`;
    if (isDirect) return `${isDarkText ? 'bg-white' : 'bg-slate-800'} border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-2xl`;
    if (isMinimal) return `${isDarkText ? 'bg-white' : 'bg-slate-800'} rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]`;
    if (isElegant) return `${isDarkText ? 'bg-[#fdfbf7]/95' : 'bg-[#2c2c2c]/95'} backdrop-blur-md border border-[#d4af37]/30 shadow-2xl rounded-sm`;
    if (isBold) return `${isDarkText ? 'bg-white' : 'bg-black'} border-8 ${isDarkText ? 'border-black' : 'border-white'} shadow-[16px_16px_0px_var(--theme-color)] rounded-none transform -rotate-1`;
    if (isPremium) return `${isDarkText ? 'bg-white/95' : 'bg-slate-900/95'} border-r-4 border-[var(--theme-color)] shadow-2xl rounded-l-2xl rounded-r-none`;
    return `${isDarkText ? 'bg-white/95' : 'bg-slate-900/95'} rounded-3xl shadow-2xl`;
  };

  const getTitleClass = () => {
    if (isTech) return `${baseColor} ${effect} drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`;
    if (isLifestyle) return `${baseColor} ${effect} drop-shadow-sm`;
    if (isDirect) return `${baseColor} ${effect} ${isDarkText ? 'bg-yellow-400' : 'bg-slate-900'} inline-block px-8 py-2 border-4 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] transform -skew-x-6`;
    if (isMinimal) return `${baseColor} ${effect}`;
    if (isElegant) return `${baseColor} ${effect} tracking-wide`;
    if (isBold) return `${baseColor} ${effect} uppercase tracking-tighter drop-shadow-[4px_4px_0px_var(--theme-color)]`;
    if (isPremium) return `${baseColor} ${effect} tracking-tight font-black`;
    return `${baseColor} ${effect}`;
  };

  const getSubtitleClass = () => {
    if (isTech) return `${baseColor} ${effect} drop-shadow-[0_0_10px_currentColor]`;
    if (isLifestyle) return `${baseColor} ${effect} font-medium`;
    if (isDirect) return `${isDarkText ? 'text-white bg-red-600' : 'text-slate-900 bg-yellow-400'} ${effect} inline-block px-6 py-2 border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]`;
    if (isMinimal) return `${baseColor} ${effect} font-medium`;
    if (isElegant) return `${baseColor} ${effect} tracking-widest uppercase text-sm font-semibold`;
    if (isBold) return `${isDarkText ? 'bg-black text-white' : 'bg-white text-black'} ${effect} px-6 py-2 uppercase font-black transform skew-x-12 inline-block`;
    if (isPremium) return `${baseColor} ${effect} font-medium opacity-90`;
    return `${baseColor} ${effect}`;
  };

  const getCtaClass = () => {
    if (isTech) return `bg-gradient-to-r from-slate-800 to-slate-900 text-white border border-${themeColor.replace('text-', '')} shadow-[0_0_20px_currentColor] rounded-full`;
    if (isLifestyle) return "bg-slate-900 text-white rounded-full shadow-xl hover:scale-105 transition-transform";
    if (isDirect) return "bg-red-600 text-white border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-xl font-black uppercase tracking-wider animate-pulse";
    if (isMinimal) return "bg-slate-900 text-white rounded-[24px] shadow-lg";
    if (isElegant) return "bg-[#2c2c2c] text-[#fdfbf7] rounded-sm border border-[#d4af37] px-12 py-4 uppercase tracking-widest shadow-xl";
    if (isBold) return "bg-white text-black border-4 border-black shadow-[8px_8px_0px_var(--theme-color)] rounded-none uppercase font-black text-2xl";
    if (isPremium) return `bg-[var(--theme-color)] ${isDarkText ? 'text-white' : 'text-slate-900'} rounded-lg shadow-lg hover:shadow-xl transition-all font-bold uppercase tracking-wide`;
    return "bg-white text-black rounded-full";
  };

  // Base container: 1080x1080, relative, RTL
  const Container = ({ children, overlay }: any) => {
    let defaultOverlay = 'bg-black/40';
    if (isTech) defaultOverlay = 'bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-900/90';
    if (isLifestyle) defaultOverlay = 'bg-gradient-to-t from-white/90 via-white/20 to-transparent';
    if (isDirect) defaultOverlay = 'bg-black/30';
    if (isMinimal) defaultOverlay = 'bg-[#f4f5f6]'; // Solid light gray background for minimal
    if (isElegant) defaultOverlay = 'bg-gradient-to-b from-[#1a1a1a]/80 to-[#2c2c2c]/90';
    if (isBold) defaultOverlay = 'bg-black/50 mix-blend-multiply';
    if (isPremium) defaultOverlay = 'bg-gradient-to-tr from-slate-900/95 via-slate-900/80 to-transparent';

    return (
      <div className={`w-[1080px] h-[1080px] relative overflow-hidden flex flex-col ${isMinimal ? 'bg-[#f4f5f6]' : isElegant ? 'bg-[#1a1a1a]' : isBold ? 'bg-zinc-900' : 'bg-slate-900'} ${fontFamily}`} dir="rtl">
        {!isMinimal && <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="bg" />}
        <div className={`absolute inset-0 ${overlay || defaultOverlay}`}></div>
        <div className="relative z-10 flex flex-col h-full p-12">
          {children}
        </div>
      </div>
    );
  };

  const TitleBlock = ({  }) => (
    <div className={`text-center mb-8 ${isDirect ? 'flex flex-col items-center gap-4' : ''}`}>
      <h1 className={`text-[75px] font-black leading-tight mb-4 ${getTitleClass()}`}>
        {title}
      </h1>
      {subtitle && (
        <h2 className={`text-[45px] font-bold mt-4 ${getSubtitleClass()}`}>
          {subtitle}
        </h2>
      )}
    </div>
  );

  if (template === 'hero') {
    if (isMinimal) {
      return (
        <Container overlay="bg-[#112233]">
          <div className="absolute top-0 left-0 w-full h-[60%] bg-[#112233]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[40%] bg-white"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex-1 flex items-center">
              <div className="w-1/2 pr-8">
                <div className="bg-white rounded-[40px] p-8 shadow-2xl">
                  <img src={imageUrl} className="w-full h-auto rounded-2xl object-cover" alt="Product" />
                </div>
              </div>
              <div className="w-1/2 pl-8 flex flex-col justify-center">
                <h1 className={`text-[65px] font-black leading-tight mb-6 ${baseColor} ${effect}`}>
                  {title}
                </h1>
                {subtitle && (
                  <p className={`text-[32px] leading-relaxed mb-10 ${baseColor} opacity-80 ${effect}`}>
                    {subtitle}
                  </p>
                )}
                {ctaText && (
                  <div className="self-start">
                    <span className="inline-block bg-white text-[#112233] px-12 py-4 rounded-full text-[40px] font-bold shadow-lg">
                      {ctaText}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-[30%] flex items-center justify-center gap-16 pt-12">
              <div className="bg-[#f4f5f6] rounded-[40px] px-16 py-8 flex items-center gap-16 w-full justify-center">
                <div className="text-center">
                  <div className="text-[60px] font-black text-[#112233]">20</div>
                  <div className={`text-[24px] ${baseColor} opacity-70 ${effect}`}>المخزون المتبقي</div>
                </div>
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[60px] font-black text-[#112233]">4.9</span>
                    <LucideIcons.Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className={`text-[24px] ${baseColor} opacity-70 ${effect}`}>55 تقييم</div>
                </div>
                <div className="text-center">
                  <div className="text-[60px] font-black text-[#112233]">+25k</div>
                  <div className={`text-[24px] ${baseColor} opacity-70 ${effect}`}>نسخة تم بيعها عالمياً</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      );
    }

    return (
      <Container>
        <TitleBlock />
        <div className="mt-auto flex flex-col items-center">
          <div className={`space-y-6 mb-12 ${showTextBackground ? (isLifestyle ? 'bg-white/80 backdrop-blur-md p-8 rounded-[40px] shadow-xl' : '') : ''}`}>
            {items?.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`${isDirect ? 'bg-green-500 border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : getBgColor(themeColor)} rounded-full p-2`}>
                  <LucideIcons.Check className={`w-8 h-8 ${isDirect ? 'text-white' : isDarkText ? 'text-slate-900' : 'text-black'}`} />
                </div>
                <span className={`text-[40px] font-bold ${baseColor} ${effect} ${isLifestyle ? '' : 'drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)]'}`}>{item.text}</span>
              </div>
            ))}
          </div>
          {ctaText && (
            <div className={`px-16 py-5 text-[50px] ${getCtaClass()}`}>
              {ctaText}
            </div>
          )}
        </div>
      </Container>
    );
  }

  if (template === 'pointers') {
    return (
      <Container>
        <TitleBlock />
        <div className="flex-1 relative">
          {items?.slice(0, 4).map((item, i) => {
            const positions = [
              "top-10 right-0",
              "top-10 left-0",
              "bottom-20 right-0",
              "bottom-20 left-0",
            ];
            const Icon = getIcon(item.icon);
            return (
              <div key={i} className={`absolute ${positions[i]} ${getPanelClass()} p-6 flex items-center gap-6 w-[480px]`}>
                <div className={`${isTech ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/30' : isDirect ? 'bg-yellow-400 border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-slate-900' : isMinimal ? (isDarkText ? 'bg-slate-200 text-slate-900' : 'bg-[#112233] text-white') : `${getBgColor(themeColor)}/20 ${themeColor.replace('400', '600')}`} p-5 rounded-2xl`}>
                  <Icon className="w-14 h-14" />
                </div>
                <div className="flex flex-col">
                  {item.title && <span className={`text-[34px] font-black ${baseColor}`}>{item.title}</span>}
                  <span className={`text-[28px] font-bold leading-tight ${baseColor} opacity-80 ${effect}`}>{item.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  if (template === 'grid') {
    return (
      <Container>
        <TitleBlock />
        <div className="mt-auto grid grid-cols-3 gap-6 mb-8">
          {items?.slice(0, 6).map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
              <div key={i} className={`flex flex-col items-center text-center gap-4 p-8 ${getPanelClass()}`}>
                <Icon className={`w-16 h-16 ${getIconColor()}`} />
                <span className={`text-[30px] font-bold leading-tight ${baseColor}`}>{item.text}</span>
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  if (template === 'comparison') {
    return (
      <Container overlay={isMinimal ? 'bg-[#f4f5f6]' : 'bg-black/0'}>
        {!isMinimal && (
          <div className="absolute inset-0 flex">
            <div className={`w-1/2 h-full ${isLifestyle ? 'bg-white/90' : isTech ? 'bg-slate-900/80 backdrop-blur-md border-l border-white/10' : 'bg-slate-900/90 border-l-8 border-yellow-400'}`}></div>
            <div className="w-1/2 h-full bg-transparent"></div>
          </div>
        )}
        <div className="relative z-10 flex flex-col h-full">
          <TitleBlock />
          <div className={`flex-1 flex mt-8 ${showTextBackground ? (isMinimal ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden` : '') : ''}`}>
            <div className={`w-1/2 flex flex-col ${isMinimal ? 'border-l border-slate-100/20' : 'pr-8 gap-8'}`}>
              <div className={`text-center py-4 text-[40px] font-black ${showTextBackground ? (isMinimal ? (isDarkText ? 'bg-slate-200 text-slate-900' : 'bg-slate-900 text-white') : isTech ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-xl mb-4' : isDirect ? 'bg-green-500 text-white border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-xl mb-4' : isBold ? `${isDarkText ? 'bg-white text-black' : 'bg-black text-white'} border-4 border-[var(--theme-color)] shadow-[4px_4px_0px_var(--theme-color)] mb-4` : 'bg-green-100 text-green-800 rounded-full mb-4') : ''}`}>منتجنا</div>
              {items?.filter((_, i) => i % 2 === 0).map((item, i) => (
                <div key={i} className={`flex items-center gap-5 p-5 ${showTextBackground ? (isMinimal ? 'border-b border-slate-100/20 last:border-0' : getPanelClass()) : ''}`}>
                  <LucideIcons.CheckCircle2 className={`w-12 h-12 shrink-0 ${isTech ? 'text-cyan-400' : isBold ? 'text-[var(--theme-color)]' : 'text-green-500'}`} />
                  <span className={`text-[30px] font-bold leading-tight ${baseColor}`}>{item.text}</span>
                </div>
              ))}
            </div>
            <div className={`w-1/2 flex flex-col ${isMinimal ? '' : 'pl-8 gap-8'}`}>
              <div className={`text-center py-4 text-[40px] font-black ${showTextBackground ? (isMinimal ? (isDarkText ? 'bg-slate-200 text-slate-900' : 'bg-slate-900 text-white') : isTech ? 'bg-red-500/20 text-red-400 border border-red-500/50 rounded-xl mb-4' : isDirect ? 'bg-red-500 text-white border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-xl mb-4' : isBold ? `${isDarkText ? 'bg-white text-black' : 'bg-black text-white'} border-4 border-[#ef4444] shadow-[4px_4px_0px_#ef4444] mb-4` : 'bg-red-100 text-red-800 rounded-full mb-4') : ''}`}>المنتجات الأخرى</div>
              {items?.filter((_, i) => i % 2 !== 0).map((item, i) => (
                <div key={i} className={`flex items-center gap-5 p-5 ${showTextBackground ? (isMinimal ? 'border-b border-slate-100/20 last:border-0' : isTech ? 'bg-slate-900/40 border border-red-500/30 rounded-2xl' : isDirect ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-2xl opacity-80` : isBold ? 'bg-black border-4 border-red-500 shadow-[8px_8px_0px_var(--theme-color)] rounded-none transform rotate-1' : `${isDarkText ? 'bg-white/60' : 'bg-slate-900/60'} rounded-[40px] opacity-70`) : ''}`}>
                  <LucideIcons.XCircle className="w-12 h-12 text-red-500 shrink-0" />
                  <span className={`text-[30px] font-bold leading-tight ${baseColor} opacity-80 ${effect}`}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (template === 'faq') {
    return (
      <Container>
        <TitleBlock />
        <div className="flex-1 flex flex-col justify-center gap-10 max-w-4xl mx-auto w-full">
          {items?.map((item, i) => (
            <div key={i} className={`flex flex-col gap-3 p-8 ${getPanelClass()} ${isMinimal ? 'border-r-4 border-red-400' : ''}`}>
              <div className="flex items-start gap-4">
                <LucideIcons.HelpCircle className={`w-12 h-12 shrink-0 mt-1 ${isMinimal ? 'hidden' : getIconColor()}`} />
                <span className={`text-[40px] font-black leading-tight ${baseColor}`}>{item.title || "سؤال؟"}</span>
              </div>
              <div className={isMinimal ? "pr-0" : "pr-16"}>
                <span className={`text-[32px] font-bold leading-tight ${baseColor} opacity-80 ${effect}`}>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  if (template === 'reviews') {
    return (
      <Container>
        <TitleBlock />
        <div className="flex justify-center gap-4 mb-12">
          <div className={`flex items-center gap-4 px-8 py-3 ${showTextBackground ? (isDirect ? 'bg-yellow-400 border-4 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] rounded-2xl' : isTech ? 'bg-slate-900/80 border border-yellow-400/50 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.3)]' : isMinimal ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} rounded-[24px] shadow-sm` : isBold ? `${isDarkText ? 'bg-white' : 'bg-black'} rounded-none border-4 ${isDarkText ? 'border-black' : 'border-white'} shadow-[8px_8px_0px_var(--theme-color)]` : `${isDarkText ? 'bg-white' : 'bg-slate-900'} rounded-full shadow-xl`) : ''}`}>
            <span className={`text-[45px] font-black ${baseColor}`}>4.9/5</span>
            <div className="flex">
              {[1,2,3,4,5].map(s => <LucideIcons.Star key={s} className={`w-10 h-10 ${isTech ? 'text-yellow-400 fill-yellow-400' : isDirect ? 'text-slate-900 fill-slate-900' : 'text-yellow-400 fill-yellow-400'}`} />)}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-8 mb-auto">
          {items?.slice(0, 3).map((item, i) => (
            <div key={i} className={`flex flex-col gap-6 p-8 ${getPanelClass()}`}>
              <div className={`flex justify-between items-center pb-4 ${isTech ? 'border-b border-white/10' : isDirect ? 'border-b-4 border-slate-900' : isBold ? 'border-b-4 border-white' : 'border-b-2 border-slate-100/20'}`}>
                <span className={`text-[28px] font-black ${baseColor}`}>{item.title || "عميل مميز"}</span>
                <div className="flex">
                  {[1,2,3,4,5].map(s => <LucideIcons.Star key={s} className={`w-6 h-6 ${isTech ? 'text-yellow-400 fill-yellow-400' : isDirect ? 'text-slate-900 fill-slate-900' : 'text-yellow-400 fill-yellow-400'}`} />)}
                </div>
              </div>
              <span className={`text-[26px] font-bold leading-tight ${baseColor} opacity-80 ${effect}`}>"{item.text}"</span>
            </div>
          ))}
        </div>
        
        <div className={`flex justify-center gap-12 mt-12 p-8 ${showTextBackground ? (isTech ? 'bg-slate-900/60 border border-white/10 rounded-2xl' : isDirect ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-2xl` : isMinimal ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} rounded-[32px] shadow-sm` : isBold ? `${isDarkText ? 'bg-white' : 'bg-black'} rounded-none border-4 ${isDarkText ? 'border-black' : 'border-white'} shadow-[8px_8px_0px_var(--theme-color)]` : `${isDarkText ? 'bg-white/80' : 'bg-slate-900/80'} backdrop-blur-md rounded-[40px] shadow-xl`) : ''}`}>
          {['ضمان الجودة', 'شحن سريع', 'دفع آمن'].map((badge, i) => (
            <div key={i} className="flex items-center gap-4">
              <LucideIcons.ShieldCheck className={`w-14 h-14 ${getIconColor()}`} />
              <span className={`text-[32px] font-bold ${baseColor}`}>{badge}</span>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  if (template === 'clean-feature') {
    return (
      <Container overlay="bg-transparent">
        <div className={`absolute inset-0 ${isLifestyle ? 'bg-gradient-to-t from-white/90 via-white/40 to-transparent' : isTech ? 'bg-gradient-to-b from-slate-900/90 via-transparent to-slate-900/90' : isMinimal ? 'bg-[#f4f5f6]' : 'bg-gradient-to-b from-black/80 via-transparent to-black/80'}`} />
        
        {isMinimal && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%]">
            <div className={`w-full h-full ${isDarkText ? 'bg-white' : 'bg-slate-800'} rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col`}>
              <div className="h-1/2 relative">
                <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Feature" />
              </div>
              <div className="h-1/2 p-12 flex flex-col justify-center items-center text-center">
                <h2 className={`text-[55px] font-black mb-6 ${baseColor} ${effect}`}>{title}</h2>
                {subtitle && (
                  <p className={`text-[32px] font-bold max-w-2xl leading-relaxed ${baseColor} opacity-80 ${effect}`}>{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {!isMinimal && (
          <div className="relative z-10 flex flex-col justify-between h-full p-16">
            <div className={`space-y-6 max-w-3xl mt-8 ${showTextBackground ? (isLifestyle ? 'bg-white/80 backdrop-blur-md p-10 rounded-[40px] shadow-2xl' : isDirect ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] p-10 rounded-2xl` : '') : ''}`}>
              <h2 className={`text-[65px] font-black leading-tight ${baseColor} ${effect}`}>{title}</h2>
              {subtitle && (
                <p className={`text-[35px] font-bold leading-relaxed ${baseColor} ${effect}`}>{subtitle}</p>
              )}
            </div>
            
            {ctaText && (
              <div className="self-start mb-8">
                <span className={`inline-block px-12 py-5 text-[35px] ${getCtaClass()}`}>
                  {ctaText}
                </span>
              </div>
            )}
          </div>
        )}
      </Container>
    );
  }

  return null;
};

