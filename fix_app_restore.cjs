const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const badCode = `    const appContextValue = {
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
    spyData, setSpyData
  };

  return (
    <AppContext.Provider value={appContextValue}>) => {`;

const restoredCode = `    return () => {`;
code = code.replace(badCode, restoredCode);

// Now I need to properly inject the context provider.
// I need to find the MAIN return inside the App component.
// It usually starts with `return (\n    <div className=`
const mainReturnRegex = /return \(\s*<div className="min-h-screen/s;

const appContextValueStr = `  const appContextValue = {
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
      <div className="min-h-screen`;

code = code.replace(mainReturnRegex, appContextValueStr);

fs.writeFileSync('src/App.tsx', code);
