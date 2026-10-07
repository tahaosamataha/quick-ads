const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

// 1. Import AppContext
if (!code.includes('import { AppContext }')) {
  code = code.replace(/import \{ \n  Bot/, "import { AppContext } from '../App';\nimport { \n  Bot");
}

// 2. Remove local state and use AppContext for inputs
// I need to carefully replace the local useState for productName, description, targetAudience, dialect
code = code.replace(/const \[productName, setProductName\] = useState\(''\);/, "");
code = code.replace(/const \[description, setDescription\] = useState\(''\);/, "");
code = code.replace(/const \[targetAudience, setTargetAudience\] = useState\(''\);/, "");
code = code.replace(/const \[dialect, setDialect\] = useState\('egyptian'\);/, "");

// Insert useContext
code = code.replace(/const \{ t \} = useLanguage\(\);/, "const { t } = useLanguage();\n  const appCtx = React.useContext(AppContext) || {};\n  const {\n    productName, setProductName,\n    description, setDescription,\n    dialect, setDialect,\n    targetAudience, setTargetAudience,\n    setGeneratedScripts, setGeneratedFbAds,\n    setGeneratedFunnelCopy, setGeneratedCreativePrompts,\n    setGeneratedVideoScenes, setGeneratedTextOnVisual,\n    setGeneratedSmartAngles, setGeneratedFlowCharacter\n  } = appCtx;");

fs.writeFileSync('src/components/AutoSuite.tsx', code);
