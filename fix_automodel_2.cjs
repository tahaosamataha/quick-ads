const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

// I will just use string replace on specific known lines
code = code.replace(/generateVideoScript\(fullDesc, dialect, scriptDuration, scriptTypes, 'pro', scriptVoiceGender, 3, 3000, true\);/, 
                    "generateVideoScript(fullDesc, dialect, scriptDuration, scriptTypes, autoModel, scriptVoiceGender, 3, 3000, true);");

code = code.replace(/generateFbAdCopies\(fullDesc, dialect, 'pro', Array\(fbAdCount\)\.fill\('إعلان مبيعات مباشر'\), 3, 3000, undefined, true, fbAdGoal\);/, 
                    "generateFbAdCopies(fullDesc, dialect, autoModel, Array(fbAdCount).fill('إعلان مبيعات مباشر'), 3, 3000, undefined, true, fbAdGoal);");

code = code.replace(/generateSmartAngles\(fullDesc, 'pro'\);/, 
                    "generateSmartAngles(fullDesc, autoModel);");

code = code.replace(/generateProductBrainReport\(productName \|\| 'منتج', description, dialect, pricingInfo, storeName, targetAudience, '', 'pro'\);/, 
                    "generateProductBrainReport(productName || 'منتج', description, dialect, pricingInfo, storeName, targetAudience, '', autoModel);");

code = code.replace(/generateCreativeImagePrompts\(fullDesc, dialect, creativePromptsCount, creativePromptMode, creativeLandingSections, creativeFontFamily, creativeColorTheme, 'pro'\);/, 
                    "generateCreativeImagePrompts(fullDesc, dialect, creativePromptsCount, creativePromptMode, creativeLandingSections, creativeFontFamily, creativeColorTheme, autoModel);");

code = code.replace(/generateFunnelCopy\(fullDesc, dialect, 'pro', 3, 3000, undefined, funnelCopyLength\);/, 
                    "generateFunnelCopy(fullDesc, dialect, autoModel, 3, 3000, undefined, funnelCopyLength);");

code = code.replace(/generateVideoScenes\(fullDesc, dialect, videoMode, videoDuration, 'pro'\);/, 
                    "generateVideoScenes(fullDesc, dialect, videoMode, videoDuration, autoModel);");

code = code.replace(/generateFlowCharacter\(fullDesc, dialect, flowVoiceGender, 'pro'\);/, 
                    "generateFlowCharacter(fullDesc, dialect, flowVoiceGender, autoModel);");

code = code.replace(/generateTextOnVisual\(fullDesc, dialect, textVisualCount, textVisualMode, 'pro'\);/, 
                    "generateTextOnVisual(fullDesc, dialect, textVisualCount, textVisualMode, autoModel);");

code = code.replace(/generateScenePrompts\(fullDesc, 'pro'\);/, 
                    "generateScenePrompts(fullDesc, autoModel);");

code = code.replace(/analyzeProduct\(getPayload\(\), description, dialect, 'pro', 'Modern', 3, 3000\);/, 
                    "analyzeProduct(getPayload(), description, dialect, autoModel, 'Modern', 3, 3000);");

code = code.replace(/analyzeAdCreatives\(getPayload\(\), description, dialect, 'pro', 'Modern', 3, 3000\);/, 
                    "analyzeAdCreatives(getPayload(), description, dialect, autoModel, 'Modern', 3, 3000);");

// Now inject the UI for it before Action Button
const modelSelectionUI = `
        {/* Model Selection */}
        <div className="pt-4 flex flex-col gap-3">
          <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t("نموذج الذكاء الاصطناعي")}</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className={\`flex-1 flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all \${autoModel === 'pro' ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20 shadow-sm' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}\`}>
              <input type="radio" name="autoModel" value="pro" checked={autoModel === 'pro'} onChange={() => setAutoModel('pro')} className="mt-1 w-4 h-4 text-fuchsia-600 focus:ring-fuchsia-500 border-gray-300" />
              <div>
                <div className="font-bold text-zinc-900 dark:text-white">Gemini Pro</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t("الأذكى والأدق للمهام المعقدة وجودة الإبداع.")}</div>
              </div>
            </label>
            <label className={\`flex-1 flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all \${autoModel === 'flash' ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20 shadow-sm' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}\`}>
              <input type="radio" name="autoModel" value="flash" checked={autoModel === 'flash'} onChange={() => setAutoModel('flash')} className="mt-1 w-4 h-4 text-fuchsia-600 focus:ring-fuchsia-500 border-gray-300" />
              <div>
                <div className="font-bold text-zinc-900 dark:text-white">Gemini 3.6 Flash {t("الجديد")}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t("الأسرع ومناسب لأغلب المهام بكفاءة عالية.")}</div>
              </div>
            </label>
          </div>
        </div>
`;

code = code.replace(/\{\/\* Action Button \*\/\}/, modelSelectionUI + '\n        {/* Action Button */}');

fs.writeFileSync('src/components/AutoSuite.tsx', code);
