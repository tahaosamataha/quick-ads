const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

const regex = /const \{ t, language \} = useLanguage\(\);/;
const replaceStr = `const { t, language } = useLanguage();
  const appCtx = React.useContext(AppContext) || {};
  const {
    productName, setProductName,
    description, setDescription,
    dialect, setDialect,
    targetAudience, setTargetAudience,
    setGeneratedScripts, setGeneratedFbAds,
    setGeneratedFunnelCopy, setGeneratedCreativePrompts,
    setGeneratedVideoScenes, setGeneratedTextOnVisual,
    setGeneratedSmartAngles, setGeneratedFlowCharacter
  } = appCtx;
`;

code = code.replace(regex, replaceStr);
fs.writeFileSync('src/components/AutoSuite.tsx', code);
