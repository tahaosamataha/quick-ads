const fs = require('fs');
let code = fs.readFileSync('src/components/AutoSuite.tsx', 'utf8');

// Fix Scripts API call
const scriptsRegex = /const scriptTypes = \[\n\s+\{ type: 'مشكلة وحل \(Problem-Solution\)', gender: 'auto' \},\n\s+\{ type: 'قبل وبعد \(Before-After\)', gender: 'auto' \},\n\s+\{ type: 'توصية صانع محتوى \(UGC\)', gender: 'auto' \}\n\s+\];\n\s+const scripts = await generateVideoScript\(fullDesc, dialect, scriptDuration, scriptTypes, autoModel, scriptVoiceGender, 3, 3000, true\);/;

const newScriptsCall = `const scriptTypes = autoScriptAngles 
            ? Array.from({ length: scriptCount }).map(() => ({ type: 'زاوية مختلفة (Auto Angle)', gender: scriptVoiceGender }))
            : selectedScriptTypes.slice(0, scriptCount).map((type, idx) => ({ type, gender: selectedScriptGenders[idx] || scriptVoiceGender }));
          const scripts = await generateVideoScript(fullDesc, dialect, scriptDuration, scriptTypes, autoModel, scriptVoiceGender, 3, 3000, true);`;

code = code.replace(scriptsRegex, newScriptsCall);

// Fix FB Ads API call
const fbAdsRegex = /const fbAds = await generateFbAdCopies\(fullDesc, dialect, autoModel, Array\(fbAdCount\).fill\('إعلان مبيعات مباشر'\), 3, 3000, undefined, true, fbAdGoal\);/;

const newFbAdsCall = `const adTypes = autoFbAngles ? Array(fbAdCount).fill('زاوية مختلفة (Auto Angle)') : selectedFbAdTypes.slice(0, fbAdCount);
          const fbAds = await generateFbAdCopies(fullDesc, dialect, autoModel, adTypes, 3, 3000, undefined, true, fbCampaignObjective);`;

code = code.replace(fbAdsRegex, newFbAdsCall);

// Fix FB Ads Rendering
const fbAdsRenderRegex = /\{Array\.isArray\(results\.fbAds\) \? results\.fbAds\.map\(\(ad: any, idx: number\) => \(/;
const newFbAdsRender = `{Array.isArray(results.fbAds?.fbAds) ? results.fbAds.fbAds.map((ad: any, idx: number) => (`;
code = code.replace(fbAdsRenderRegex, newFbAdsRender);

// Another fix for FB ads output
const fbAdsRenderRegex2 = /\{Array\.isArray\(results\.fbAds\) \? results\.fbAds\.map/g;
code = code.replace(fbAdsRenderRegex2, `{Array.isArray(results.fbAds?.fbAds) ? results.fbAds.fbAds.map`);

fs.writeFileSync('src/components/AutoSuite.tsx', code);
