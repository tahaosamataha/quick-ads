const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPageBuilder.tsx', 'utf8');

code = code.replace(
  "هل تود بناء صفحة الهبوط بنموذج مُعلم تقليدي (أساسي)، أم نموذج مُعلم (كاجوال)، أم بنموذج حُر يعتمد على قدرات نموذج الذكاء الاصطناعي لابتكار تصميمات مختلفة تماماً وبدون قيود؟ (أجب بـ: أساسي / كاجوال / حر)",
  "هل تود بناء صفحة الهبوط بنموذج مُعلم تقليدي (أساسي)، أم نموذج مُعلم (كاجوال)، أم بنموذج حُر يعتمد على الذكاء الاصطناعي (حر)، أم بنموذج حر احترافي صارم (Anti AI Slop)؟ (أجب بـ: أساسي / كاجوال / حر / Anti AI Slop)"
);

code = code.replace(
  "const isFreeModel = finalAnswers.generationModel && finalAnswers.generationModel.includes('حر');",
  "const isAntiSlopModel = finalAnswers.generationModel && finalAnswers.generationModel.toLowerCase().includes('anti');\n      const isFreeModel = finalAnswers.generationModel && finalAnswers.generationModel.includes('حر');"
);

code = code.replace(
  "const generationModel = isCasualModel ? 'template-casual' : (isFreeModel ? 'free' : 'template');",
  "const generationModel = isAntiSlopModel ? 'free-anti-slop' : (isCasualModel ? 'template-casual' : (isFreeModel ? 'free' : 'template'));"
);

fs.writeFileSync('src/components/LandingPageBuilder.tsx', code);
