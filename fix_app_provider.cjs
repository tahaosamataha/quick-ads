const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const mainReturnMatch = `  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0F172A] text-[#0B1E3F] dark:text-zinc-100 font-sans transition-colors duration-200 flex flex-row-reverse selection:bg-[#7B3FF2]/30" dir="rtl">`;

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
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0F172A] text-[#0B1E3F] dark:text-zinc-100 font-sans transition-colors duration-200 flex flex-row-reverse selection:bg-[#7B3FF2]/30" dir="rtl">`;

code = code.replace(mainReturnMatch, newMainReturn);

fs.writeFileSync('src/App.tsx', code);
