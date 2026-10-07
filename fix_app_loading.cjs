const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const badLoading = `  const appContextValue = {
    productName, setProductName,
    description, setDescription,
    dialect, setDialect,
    targetAudience, setTargetAudience,
    generatedScripts, setGeneratedScripts,
    generatedFbAds, setGeneratedFbAds,
    generatedFunnelCopy, setGeneratedFunnelCopy,
    generatedCreativePrompts, setGeneratedCreativePrompts,
    generatedVideoScenes, setGeneratedVideoScenes,
    generatedTextOnVisual, setGeneratedTextOnVisual,
    generatedSmartAngles, setGeneratedSmartAngles,
    generatedFlowCharacter, setGeneratedFlowCharacter,
    generatedWinnerScripts, setGeneratedWinnerScripts,
    spyData: null, setSpyData: () => {} // ProductSpy doesn't share state to App.tsx originally
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] dark:bg-[#0F172A]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7B3FF2]" />
      </div>
    );
  }`;

const goodLoading = `  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] dark:bg-[#0F172A]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7B3FF2]" />
      </div>
    );
  }`;

code = code.replace(badLoading, goodLoading);

// Now find the REAL main return!
const mainReturnMatch = `  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0F172A] text-[#0B1E3F] dark:text-zinc-100 font-sans transition-colors duration-200" dir={language === 'ar' ? 'rtl' : 'ltr'}>`;

const newMainReturn = `  const appContextValue = {
    productName, setProductName,
    description, setDescription,
    dialect, setDialect,
    targetAudience, setTargetAudience,
    generatedScripts, setGeneratedScripts,
    generatedFbAds, setGeneratedFbAds,
    generatedFunnelCopy, setGeneratedFunnelCopy,
    generatedCreativePrompts, setGeneratedCreativePrompts,
    generatedVideoScenes, setGeneratedVideoScenes,
    generatedTextOnVisual, setGeneratedTextOnVisual,
    generatedSmartAngles, setGeneratedSmartAngles,
    generatedFlowCharacter, setGeneratedFlowCharacter,
    generatedWinnerScripts, setGeneratedWinnerScripts,
    spyData: null, setSpyData: () => {}
  };

  return (
    <AppContext.Provider value={appContextValue}>
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0F172A] text-[#0B1E3F] dark:text-zinc-100 font-sans transition-colors duration-200" dir={language === 'ar' ? 'rtl' : 'ltr'}>`;

code = code.replace(mainReturnMatch, newMainReturn);

fs.writeFileSync('src/App.tsx', code);
