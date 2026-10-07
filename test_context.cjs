const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes('AppContext')) {
  appCode = appCode.replace(/import React, \{ useState/g, "import React, { useState, createContext ");
  appCode = appCode.replace(/export default function App\(\) \{/, "export const AppContext = createContext<any>(null);\n\nexport default function App() {");
  appCode = appCode.replace(/return \(/, "const appContextValue = {\n    productName, setProductName,\n    description, setDescription,\n    dialect, setDialect,\n    targetAudience, setTargetAudience,\n    generatedScripts, setGeneratedScripts,\n    generatedFbAds, setGeneratedFbAds,\n    generatedFunnelCopy, setGeneratedFunnelCopy,\n    generatedCreativePrompts, setGeneratedCreativePrompts,\n    generatedVideoScenes, setGeneratedVideoScenes,\n    generatedTextOnVisual, setGeneratedTextOnVisual,\n    generatedSmartAngles, setGeneratedSmartAngles,\n    generatedFlowCharacter, setGeneratedFlowCharacter,\n    generatedWinnerScripts, setGeneratedWinnerScripts,\n    spyData, setSpyData\n  };\n\n  return (\n    <AppContext.Provider value={appContextValue}>");
  appCode = appCode.replace(/<\/div>\n    <\/div>\n  \);\n\}/, "</div>\n    </div>\n    </AppContext.Provider>\n  );\n}");
  fs.writeFileSync('src/App.tsx', appCode);
}
