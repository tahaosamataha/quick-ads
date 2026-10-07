const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

const updateGlobalState = `
      // Update Global State from AppContext
      if (newResults.scripts && setGeneratedScripts) setGeneratedScripts(newResults.scripts);
      if (newResults.fbAds && setGeneratedFbAds) setGeneratedFbAds(newResults.fbAds);
      if (newResults.angles && setGeneratedSmartAngles) setGeneratedSmartAngles(newResults.angles);
      if (newResults.prompts && setGeneratedCreativePrompts) setGeneratedCreativePrompts(newResults.prompts);
      if (newResults.funnelCopy && setGeneratedFunnelCopy) setGeneratedFunnelCopy(newResults.funnelCopy);
      if (newResults.videoScenes && setGeneratedVideoScenes) setGeneratedVideoScenes(newResults.videoScenes);
      if (newResults.flowCharacter && setGeneratedFlowCharacter) setGeneratedFlowCharacter(newResults.flowCharacter);
      if (newResults.textOnVisual && setGeneratedTextOnVisual) setGeneratedTextOnVisual(newResults.textOnVisual);
`;

code = code.replace(/setResults\(newResults\);/, updateGlobalState + '\n      setResults(newResults);');
fs.writeFileSync('src/components/AutoSuite.tsx', code);
