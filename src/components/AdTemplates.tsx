import * as LucideIcons from 'lucide-react';
import { LandingPageSection } from '../services/ai';

interface AdTemplateProps {
  section: LandingPageSection;
  imageUrl: string;
  fontFamily?: string;
  themeColor?: string;
  designStyle?: 'tech' | 'lifestyle' | 'direct' | 'minimal' | 'elegant' | 'bold' | 'premium_custom';
  textColor?: string;
  textEffect?: string;
  showTextBackground?: boolean;
}

export const AdTemplateRenderer = ({ section, imageUrl, fontFamily = 'font-alexandria', themeColor = 'text-yellow-400', designStyle = 'tech', textColor = 'text-white', textEffect = 'none', showTextBackground = true }: AdTemplateProps) => {
  const { title, subtitle, items, template, ctaText } = section;
  
  const getBgColor = (textClass: string) => textClass.replace('text-', 'bg-');
  const getFillColor = (textClass: string) => textClass.replace('text-', 'fill-');

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

  const getPanelClass = () => {
    if (!showTextBackground) return '';
    if (isTech) return `${isDarkText ? 'bg-white/90' : 'bg-slate-900/60'} backdrop-blur-md border ${isDarkText ? 'border-slate-200' : 'border-white/10'} shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-2xl`;
    if (isLifestyle) return `${isDarkText ? 'bg-white/90' : 'bg-black/60'} backdrop-blur-sm border ${isDarkText ? 'border-white' : 'border-white/20'} shadow-2xl rounded-[40px]`;
    if (isDirect) return `${isDarkText ? 'bg-white' : 'bg-slate-800'} border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-2xl`;
    if (isMinimal) return `${isDarkText ? 'bg-white' : 'bg-slate-800'} rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]`;
    if (isElegant) return `${isDarkText ? 'bg-[#fdfbf7]/95' : 'bg-[#2c2c2c]/95'} backdrop-blur-md border border-[#d4af37]/30 shadow-2xl rounded-sm`;
    if (isBold) return `${isDarkText ? 'bg-white' : 'bg-black'} border-8 ${isDarkText ? 'border-black' : 'border-white'} shadow-[16px_16px_0px_var(--theme-color)] rounded-none transform -rotate-1`;
    if (isPremium) return `${isDarkText ? 'bg-white/95' : 'bg-slate-900/95'} border-r-4 border-[var(--theme-color)] shadow-2xl rounded-l-2xl rounded-r-none`;
    return `${isDarkText ? 'bg-white/90 border-2 border-slate-200' : 'bg-black/60 border-2 border-white/20'} backdrop-blur-md rounded-3xl`;
  };

  const getTitleClass = () => {
    if (isTech) return `${baseColor} ${effect} drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`;
    if (isLifestyle) return `${baseColor} ${effect} drop-shadow-sm`;
    if (isDirect) return `${baseColor} ${effect} ${isDarkText ? 'bg-yellow-400' : 'bg-slate-900'} inline-block px-8 py-2 border-4 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] transform -skew-x-6`;
    if (isMinimal) return `${baseColor} ${effect}`;
    if (isElegant) return `${baseColor} ${effect} tracking-wide`;
    if (isBold) return `${baseColor} ${effect} uppercase tracking-tighter drop-shadow-[4px_4px_0px_var(--theme-color)]`;
    if (isPremium) return `${baseColor} ${effect} tracking-tight font-black`;
    return `${baseColor} ${effect} drop-shadow-[0_8px_8px_rgba(0,0,0,0.9)]`;
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
    return `${getBgColor(themeColor)} text-black rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-4 border-white/50`;
  };

  // Base container: 1080x1080, relative, RTL
  const Container = ({ children, overlay }: any) => {
    let defaultOverlay = 'bg-black/40';
    if (isTech) defaultOverlay = 'bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-900/90';
    if (isLifestyle) defaultOverlay = 'bg-gradient-to-t from-white/90 via-white/20 to-transparent';
    if (isDirect) defaultOverlay = 'bg-black/30';
    if (isMinimal) defaultOverlay = 'bg-[#f4f5f6]';
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

  if (template === 'ad-hook') {
    return (
      <Container overlay={isMinimal ? 'bg-[#f4f5f6]' : isLifestyle ? 'bg-gradient-to-t from-white/90 via-white/40 to-transparent' : 'bg-gradient-to-b from-black/80 via-black/20 to-black/90'}>
        {isMinimal && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%]">
            <div className="w-full h-full bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
              <div className="h-[60%] relative">
                <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Ad" />
              </div>
              <div className="h-[40%] p-12 flex flex-col justify-center items-center text-center">
                <h1 className={`text-[65px] font-black mb-4 ${baseColor} ${effect}`}>{title}</h1>
                {subtitle && (
                  <p className={`text-[32px] font-bold ${baseColor} opacity-80 ${effect}`}>{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {!isMinimal && (
          <div className="flex flex-col h-full justify-between items-center text-center py-12">
            <div className="w-full">
              <h1 className={`text-[90px] font-black leading-tight mb-6 ${getTitleClass()}`}>
                {title}
              </h1>
              {subtitle && (
                <div className={showTextBackground ? (isLifestyle ? 'mt-4' : isDirect ? 'mt-6' : 'inline-block bg-black/60 backdrop-blur-md px-10 py-4 rounded-3xl border-2 border-white/20') : 'mt-4'}>
                  <h2 className={`text-[45px] font-bold ${getSubtitleClass()}`}>
                    {subtitle}
                  </h2>
                </div>
              )}
            </div>
            
            {ctaText && (
              <div className={`mt-auto px-20 py-6 text-[55px] ${getCtaClass()}`}>
                {ctaText}
              </div>
            )}
          </div>
        )}
      </Container>
    );
  }

  if (template === 'ad-offer') {
    return (
      <Container overlay={isMinimal ? 'bg-[#f4f5f6]' : isLifestyle ? 'bg-white/60 backdrop-blur-sm' : 'bg-black/40'}>
        {!isLifestyle && !isMinimal && <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>}
        
        {isMinimal && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%]">
            <div className="w-full h-full bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
              <div className="h-[50%] relative">
                <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Ad" />
                <div className={`absolute top-8 right-8 ${isDarkText ? 'bg-white text-slate-900 border-2 border-slate-200' : 'bg-[#112233] text-white'} px-8 py-3 rounded-full text-[30px] font-bold`}>عرض خاص</div>
              </div>
              <div className="h-[50%] p-12 flex flex-col justify-center items-center text-center">
                <h1 className={`text-[70px] font-black mb-4 ${baseColor} ${effect}`}>{title}</h1>
                {subtitle && (
                  <p className={`text-[35px] font-bold mb-8 ${baseColor} opacity-80 ${effect}`}>{subtitle}</p>
                )}
                {ctaText && (
                  <div className={`mt-auto px-16 py-5 text-[40px] ${getCtaClass()}`}>
                    {ctaText}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!isMinimal && (
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className={`self-start px-12 py-4 rounded-br-3xl rounded-tl-3xl shadow-2xl transform -rotate-2 -ml-4 mt-4 ${showTextBackground ? (isDirect ? 'bg-yellow-400 text-slate-900 border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)]' : isTech ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : isBold ? `${isDarkText ? 'bg-white text-black' : 'bg-black text-white'} border-4 border-[var(--theme-color)] shadow-[8px_8px_0px_var(--theme-color)]` : `${isDarkText ? 'bg-white text-red-600' : 'bg-red-600 text-white'} border-4 border-white`) : ''}`}>
              <h2 className="text-[60px] font-black uppercase tracking-wider">عرض خاص</h2>
            </div>
            
            <div className="text-center my-auto">
              <h1 className={`text-[110px] font-black leading-none mb-4 ${getTitleClass()}`}>
                {title}
              </h1>
              {subtitle && (
                <h2 className={`text-[55px] font-bold ${isLifestyle ? `${baseColor} opacity-80 ${effect}` : isDirect ? `${isDarkText ? 'text-red-600 bg-white' : 'text-white bg-red-600'} inline-block px-8 py-2 border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]` : isBold ? `${isDarkText ? 'bg-black text-white' : 'bg-white text-black'} px-8 py-2 uppercase font-black transform skew-x-12 inline-block` : `${themeColor} drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] bg-black/50 inline-block px-12 py-4 rounded-full backdrop-blur-sm`}`}>
                  {subtitle}
                </h2>
              )}
            </div>
            
            {ctaText && (
              <div className="flex flex-col items-center gap-4 mt-auto">
                <div className={`flex items-center gap-3 px-8 py-3 rounded-full ${showTextBackground ? (isLifestyle ? 'bg-red-100 text-red-600' : isDirect ? 'bg-yellow-400 text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]' : isBold ? `${isDarkText ? 'bg-white text-black' : 'bg-black text-white'} border-4 border-[var(--theme-color)] shadow-[4px_4px_0px_var(--theme-color)]` : `${isDarkText ? 'text-slate-900 bg-white/90' : 'text-white bg-black/60'} backdrop-blur-md`) : ''}`}>
                  <LucideIcons.Clock className={`w-8 h-8 ${isLifestyle ? 'text-red-600' : isDirect ? 'text-slate-900' : isBold ? 'text-[var(--theme-color)]' : 'text-red-400'}`} />
                  <span className="text-[30px] font-bold">الكمية محدودة! اطلب الآن</span>
                </div>
                <div className={`w-full text-center py-6 text-[60px] ${getCtaClass()}`}>
                  {ctaText}
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    );
  }

  if (template === 'ad-review') {
    return (
      <Container overlay={isMinimal ? 'bg-[#f4f5f6]' : isLifestyle ? 'bg-gradient-to-t from-white/90 via-white/40 to-white/80' : 'bg-gradient-to-t from-black/90 via-black/30 to-black/60'}>
        {isMinimal && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%]">
            <div className="w-full h-full bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
              <div className="h-[40%] relative">
                <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Ad" />
              </div>
              <div className="h-[60%] p-12 flex flex-col justify-center items-center text-center relative">
                <LucideIcons.Quote className="absolute top-8 right-8 w-16 h-16 text-slate-200" />
                <div className="flex gap-2 mb-6">
                  {[1,2,3,4,5].map(s => <LucideIcons.Star key={s} className="w-10 h-10 text-yellow-400 fill-yellow-400" />)}
                </div>
                <h1 className={`text-[45px] font-black leading-tight mb-6 ${baseColor} ${effect}`}>"{title}"</h1>
                {subtitle && (
                  <p className={`text-[28px] font-bold ${baseColor} opacity-80 ${effect}`}>- {subtitle}</p>
                )}
                {ctaText && (
                  <div className={`mt-auto px-16 py-4 text-[35px] ${getCtaClass()}`}>
                    {ctaText}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!isMinimal && (
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-center mt-8">
              <div className={`flex gap-2 px-8 py-4 rounded-full ${showTextBackground ? (isDirect ? 'bg-yellow-400 border-4 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)]' : isTech ? 'bg-slate-900/80 border border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.3)]' : isBold ? 'bg-black border-4 border-[var(--theme-color)] shadow-[6px_6px_0px_var(--theme-color)]' : 'bg-white/95 shadow-2xl backdrop-blur-sm border-2 border-white/50') : ''}`}>
                {[1,2,3,4,5].map(s => <LucideIcons.Star key={s} className={`w-14 h-14 ${isTech ? 'text-yellow-400 fill-yellow-400' : isDirect ? 'text-slate-900 fill-slate-900' : `${themeColor} ${getFillColor(themeColor)}`}`} />)}
              </div>
            </div>
            
            <div className="my-auto">
              <div className={`p-12 relative mx-8 ${getPanelClass()}`}>
                <LucideIcons.Quote className={`absolute -top-10 -right-10 w-24 h-24 opacity-50 ${isTech ? 'text-cyan-400' : isDirect ? 'text-slate-900' : themeColor}`} />
                <h1 className={`text-[55px] font-black leading-tight text-center mb-6 ${baseColor} ${effect}`}>
                  "{title}"
                </h1>
                {subtitle && (
                  <p className={`text-[35px] font-bold text-center border-t-2 pt-6 ${baseColor} opacity-80 ${effect} ${isTech || isBold ? 'border-white/10' : isDirect ? 'border-slate-900' : 'border-slate-200'}`}>
                    - {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {ctaText && (
              <div className="flex justify-center mb-8">
                <div className={`inline-flex items-center gap-4 px-16 py-5 text-[45px] ${getCtaClass()}`}>
                  <span>{ctaText}</span>
                  <LucideIcons.ArrowLeft className="w-12 h-12" />
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    );
  }

  if (template === 'ad-comparison') {
    return (
      <Container overlay={isMinimal ? 'bg-[#f4f5f6]' : 'bg-black/0'}>
        {!isMinimal && (
          <div className="absolute inset-0 flex">
            <div className={`w-1/2 h-full ${isLifestyle ? 'bg-white/90' : isTech ? 'bg-slate-900/80 backdrop-blur-md border-l border-white/10' : 'bg-black/75 backdrop-blur-sm border-l-4 border-white/20'}`}></div>
            <div className="w-1/2 h-full bg-transparent"></div>
          </div>
        )}
        <div className="relative z-10 flex flex-col h-full">
          <div className={`text-center py-6 rounded-3xl mb-12 ${showTextBackground ? (isMinimal ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} shadow-[0_8px_30px_rgb(0,0,0,0.04)]` : isLifestyle ? 'bg-white/90 shadow-xl' : isDirect ? 'bg-yellow-400 border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)]' : isTech ? 'bg-slate-900/80 border border-white/10 backdrop-blur-md' : isBold ? 'bg-black border-4 border-[var(--theme-color)] shadow-[8px_8px_0px_var(--theme-color)] rounded-none' : 'bg-black/80 border-2 border-white/20 backdrop-blur-md') : ''}`}>
            <h1 className={`text-[65px] font-black ${baseColor} ${effect}`}>
              {title}
            </h1>
          </div>
          
          <div className={`flex-1 flex ${showTextBackground ? (isMinimal ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden` : '') : ''}`}>
            <div className={`w-1/2 flex flex-col justify-center ${isMinimal ? 'border-l border-slate-100/20' : 'pr-8 gap-10'}`}>
              <div className={`text-center py-5 text-[50px] font-black ${showTextBackground ? (isMinimal ? (isDarkText ? 'bg-slate-200 text-slate-900' : 'bg-slate-900 text-white') : isLifestyle ? 'bg-green-100 text-green-800 rounded-3xl' : isDirect ? 'bg-green-500 text-white border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-3xl' : isTech ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-3xl' : isBold ? `${isDarkText ? 'bg-white text-black' : 'bg-black text-white'} border-4 border-[var(--theme-color)] shadow-[8px_8px_0px_var(--theme-color)]` : 'bg-green-500 text-white shadow-2xl border-4 border-green-400 rounded-3xl') : ''}`}>منتجنا</div>
              <div className={`flex flex-col ${isMinimal ? '' : 'gap-8'}`}>
                {items?.filter((_, i) => i % 2 === 0).slice(0, 3).map((item, i) => (
                  <div key={i} className={`flex items-center gap-6 p-6 ${showTextBackground ? (isMinimal ? 'border-b border-slate-100/20 last:border-0' : getPanelClass()) : ''}`}>
                    <div className={`rounded-full p-2 shrink-0 ${isMinimal ? 'bg-green-100' : isLifestyle ? 'bg-green-100' : isDirect ? 'bg-green-500 border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : isTech ? 'bg-cyan-500/20' : 'bg-green-500'}`}>
                      <LucideIcons.Check className={`w-10 h-10 ${isMinimal ? 'text-green-600' : isLifestyle ? 'text-green-600' : isTech ? 'text-cyan-400' : isDarkText ? 'text-slate-900' : 'text-white'}`} />
                    </div>
                    <span className={`text-[35px] font-bold leading-tight ${baseColor} ${effect}`}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`w-1/2 flex flex-col justify-center ${isMinimal ? '' : 'pl-8 gap-10'}`}>
              <div className={`text-center py-5 text-[50px] font-black ${showTextBackground ? (isMinimal ? (isDarkText ? 'bg-slate-200 text-slate-900' : 'bg-slate-900 text-white') : isLifestyle ? 'bg-red-100 text-red-800 rounded-3xl' : isDirect ? 'bg-red-600 text-white border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-3xl' : isTech ? 'bg-red-500/20 text-red-400 border border-red-500/50 rounded-3xl' : isBold ? `${isDarkText ? 'bg-white text-black' : 'bg-black text-white'} border-4 border-red-500 shadow-[8px_8px_0px_#ef4444]` : 'bg-red-600 text-white shadow-2xl border-4 border-red-500 rounded-3xl') : ''}`}>المنتجات الأخرى</div>
              <div className={`flex flex-col ${isMinimal ? '' : 'gap-8'}`}>
                {items?.filter((_, i) => i % 2 !== 0).slice(0, 3).map((item, i) => (
                  <div key={i} className={`flex items-center gap-6 p-6 ${showTextBackground ? (isMinimal ? 'border-b border-slate-100/20 last:border-0' : isLifestyle ? 'bg-white/60 rounded-[40px]' : isDirect ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-2xl opacity-90` : isTech ? 'bg-slate-900/40 border border-red-500/30 rounded-2xl' : isBold ? 'bg-black border-4 border-red-500 shadow-[8px_8px_0px_var(--theme-color)] rounded-none transform rotate-1' : `${isDarkText ? 'bg-white/60' : 'bg-slate-900/60'} rounded-3xl border border-red-500/30 backdrop-blur-sm`) : ''}`}>
                    <div className={`rounded-full p-2 shrink-0 ${isMinimal ? 'bg-red-100' : isLifestyle ? 'bg-red-100' : isDirect ? 'bg-red-600 border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]' : isTech ? 'bg-red-500/20' : 'bg-red-500'}`}>
                      <LucideIcons.X className={`w-10 h-10 ${isMinimal ? 'text-red-600' : isLifestyle ? 'text-red-600' : isTech ? 'text-red-400' : isDarkText ? 'text-slate-900' : 'text-white'}`} />
                    </div>
                    <span className={`text-[35px] font-bold leading-tight ${baseColor} ${effect} opacity-80`}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {ctaText && (
            <div className={`mt-12 text-center py-6 text-[50px] ${getCtaClass()}`}>
              {ctaText}
            </div>
          )}
        </div>
      </Container>
    );
  }

  if (template === 'ad-pain-solution') {
    return (
      <Container overlay={isMinimal ? 'bg-[#f4f5f6]' : isLifestyle ? 'bg-white/80 backdrop-blur-sm' : 'bg-black/50'}>
        <div className="flex flex-col h-full justify-between">
          <div className={`p-10 mt-8 ${isMinimal ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]` : `transform -rotate-1 ${isLifestyle ? 'bg-white shadow-2xl rounded-[40px]' : isDirect ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-2xl` : isTech ? 'bg-slate-900/80 backdrop-blur-md border border-red-500/50 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.3)]' : isBold ? `${isDarkText ? 'bg-white' : 'bg-black'} border-4 border-red-500 shadow-[12px_12px_0px_#ef4444] rounded-none` : `${isDarkText ? 'bg-white/90' : 'bg-red-600/90'} backdrop-blur-md rounded-[40px] shadow-2xl border-4 border-red-400/50`}`}`}>
            <div className="flex items-center gap-6 mb-4">
              <LucideIcons.AlertTriangle className={`w-16 h-16 ${isMinimal ? 'text-red-500' : isLifestyle ? 'text-red-500' : isDirect ? 'text-red-600' : isTech ? 'text-red-400' : isBold ? 'text-red-500' : isDarkText ? 'text-slate-900' : 'text-white'}`} />
              <span className={`text-[40px] font-black ${isMinimal ? 'text-red-500' : isLifestyle ? 'text-red-500' : isDirect ? 'text-red-600' : isTech ? 'text-red-400' : isDarkText ? 'text-slate-900' : 'text-white/90'}`}>المشكلة</span>
            </div>
            <h1 className={`text-[60px] font-black leading-tight ${baseColor} ${effect}`}>
              {title}
            </h1>
          </div>
          
          <div className={`p-10 mb-8 ${isMinimal ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]` : `transform rotate-1 ${isLifestyle ? 'bg-white shadow-2xl rounded-[40px]' : isDirect ? `${isDarkText ? 'bg-white' : 'bg-slate-800'} border-4 border-slate-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-2xl` : isTech ? 'bg-slate-900/80 backdrop-blur-md border border-cyan-500/50 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)]' : isBold ? `${isDarkText ? 'bg-white' : 'bg-black'} border-4 border-[var(--theme-color)] shadow-[12px_12px_0px_var(--theme-color)] rounded-none` : `${isDarkText ? 'bg-white/95' : 'bg-green-500/95'} backdrop-blur-md rounded-[40px] shadow-2xl border-4 border-green-400/50`}`}`}>
            <div className="flex items-center gap-6 mb-4">
              <LucideIcons.CheckCircle2 className={`w-16 h-16 ${isMinimal ? 'text-green-500' : isLifestyle ? 'text-green-500' : isDirect ? 'text-green-600' : isTech ? 'text-cyan-400' : isBold ? 'text-[var(--theme-color)]' : isDarkText ? 'text-slate-900' : 'text-white'}`} />
              <span className={`text-[40px] font-black ${isMinimal ? 'text-green-500' : isLifestyle ? 'text-green-500' : isDirect ? 'text-green-600' : isTech ? 'text-cyan-400' : isDarkText ? 'text-slate-900' : 'text-white/90'}`}>الحل</span>
            </div>
            <h2 className={`text-[60px] font-black leading-tight ${baseColor} ${effect}`}>
              {subtitle}
            </h2>
          </div>
          
          {ctaText && (
            <div className={`mt-auto text-center py-6 text-[55px] ${getCtaClass()}`}>
              {ctaText}
            </div>
          )}
        </div>
      </Container>
    );
  }

  // Fallback to ad-hook
  return (
    <Container overlay={isMinimal ? 'bg-[#f4f5f6]' : isLifestyle ? 'bg-gradient-to-t from-white/90 via-white/40 to-white/80' : 'bg-gradient-to-t from-black/90 via-black/40 to-black/80'}>
      <div className="flex flex-col h-full justify-end pb-12 text-center">
        <h1 className={`text-[80px] font-black leading-tight mb-6 ${getTitleClass()}`}>
          {title}
        </h1>
        {subtitle && (
          <h2 className={`text-[45px] font-bold mb-12 ${getSubtitleClass()}`}>
            {subtitle}
          </h2>
        )}
        {ctaText && (
          <div className={`inline-block mx-auto py-6 px-16 text-[50px] ${getCtaClass()}`}>
            {ctaText}
          </div>
        )}
      </div>
    </Container>
  );
};
