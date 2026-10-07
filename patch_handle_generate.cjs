const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
    let finalDescription = description || "المنتج غير محدد";
    if (activeBrandKit && applyBrandKit) {
       finalDescription += \`

[ملاحظة هامة جدا للذكاء الاصطناعي: قم بصياغة كل شيء وفقاً للهوية البصرية والصوتية للبراند التالي:
       - مجال العمل: \${activeBrandKit.industry}
       - نبرة الصوت: \${activeBrandKit.tone || activeBrandKit.voice?.primary || 'Neutral'}
       - أسلوب الإقناع/التصميم: \${activeBrandKit.style || activeBrandKit.visualStyle || 'Modern'}
       الرجاء الالتزام التام بنوعية المفردات والأسلوب والرسالة الخاصة بهذه الهوية.]\`;
    }
    
    let scripts = [];
    if (scriptGenMode === 'custom') {
      if (!customScriptText.trim()) throw new Error("يرجى كتابة الإسكريبت أولاً");
      scripts = [{
        type: "إسكريبت مخصص",
        content: "Language: Arabic\\nDialect: " + dialect + "\\nVoice Description: " + customScriptVoice + "\\n\\n" + customScriptText,
        customVoice: customScriptVoice
      }];
    } else {
      scripts = await generateVideoScript(finalDescription, dialect, scriptDuration, mappedScriptTypes, aiModel, voiceGender, 3, 3000, scriptGenMode === 'auto');
    }
`;

code = code.replace(
  /let finalDescription = description \|\| "المنتج غير محدد";[\s\S]*?const scripts = await generateVideoScript\([\s\S]*?\);/,
  replacement.trim()
);

fs.writeFileSync('src/App.tsx', code);
