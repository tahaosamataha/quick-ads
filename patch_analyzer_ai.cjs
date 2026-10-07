const fs = require('fs');
let code = fs.readFileSync('src/services/metricsAi.ts', 'utf8');

// Update analyzeAdMetrics signature to include modelType
code = code.replace(
  /export async function analyzeAdMetrics\(\s*metrics: \{[\s\S]*?\},\s*dialect: string\s*\): Promise<string> \{/,
  `export async function analyzeAdMetrics(
  metrics: { hookRate?: string, holdRate?: string, ctr?: string, cpm?: string, cvr?: string, cpa?: string, roas?: string },
  dialect: string,
  modelType: 'pro' | 'flash' = 'pro'
): Promise<string> {`
);

// Update analyzeAdSheet signature and prompt to include modelType and new logic
const oldAnalyzeSheet = /export async function analyzeAdSheet\([\s\S]*?const response = await getAI\(\)\.models\.generateContent\(\{[\s\S]*?model: "gemini-3.1-pro-preview",[\s\S]*?contents: prompt,[\s\S]*?config: \{ temperature: 0.7 \}[\s\S]*?\}\);[\s\S]*?return response.text \|\| '';[\s\S]*?\}/m;

const newAnalyzeSheet = `export async function analyzeAdSheet(csvData: string, dialect: string, modelType: 'pro' | 'flash' = 'pro'): Promise<string> {
  const modelStr = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.6-flash";
  const prompt = \`أنت خبير Media Buyer وتحليل بيانات إعلانات (Data Analyst) محترف جداً.
تم رفع شيت يحتوي على بيانات الحملات الإعلانية (Ads Manager Export) مفصلة على مستوى المجموعات الإعلانية (Ad Set) ومستوى الإعلانات والكرييتف (Ad Level).

البيانات المرفقة تحتوي على مقاييس متقدمة (كما تظهر في مدير الإعلانات) مثل:
(ROAS, CPA, Purchases, CPM, CTR, Link Clicks, Outbound CTR, Landing Page Views, Checkouts Initiated, Quality/Engagement Rankings)
بالإضافة إلى مقاييس الانتباه (Hook Rate, Hold Rate) والمقسمة لأجزاء إذا تم توفيرها.

بيانات الشيت (أهم الأسطر):
\${csvData}

المطلوب منك كخبير:
1. تحليل كل "كرييتف" (Ad) بشكل فردي لمعرفة ماذا فعل بالتحديد بناءً على الأرقام.
2. استخراج جدول يوضح حالة كل كرييتف بوضوح (اسم/معرف الكرييتف | القرار | التكلفة | العائد | الإجراء الفني المطلوب).
3. إعطاء قرارات صارمة ومحددة لكل كرييتف، مثل: 
   - Kill (قفل الإعلان)
   - Scale (زيادة الميزانية)
   - Isolate (فصل الكرييتف في مجموعة إعلانية أو حملة منفصلة لاختباره بشكل أفضل).
4. تقديم نصائح تفصيلية لتعديل الكرييتف نفسه لتجنب حرق الميزانية أو لتحسينه. (مثلاً: "قم بتغيير الهوك (Hook) لأن نسبة الانتباه في أول ثواني ضعيفة جداً"، أو "قم بتغيير الـ Body/Message لأن الـ Hold rate جيد ولكن الـ Outbound CTR أو الـ Link Clicks ضعيفة").
5. تحديد الاختناقات (Bottlenecks) في الفانل: هل الخلل في الكرييتف نفسه، أم أن الكرييتف يجلب زيارات ولكن لا يوجد Checkouts/Purchases مما يعني أن صفحة الهبوط (Landing Page) تحتاج تعديل؟

اكتب التقرير باللغة: العربية ويفضل لهجة \${dialect} وبتنسيق Markdown احترافي، وكن عملياً جداً ومباشراً في نصائحك.\`;

  const response = await getAI().models.generateContent({
    model: modelStr,
    contents: prompt,
    config: { temperature: 0.7 }
  });
  
  return response.text || '';
}`;

code = code.replace(oldAnalyzeSheet, newAnalyzeSheet);

// Fix model selection in analyzeAdMetrics
code = code.replace(
  /const response = await getAI\(\)\.models\.generateContent\(\{\s*model: "gemini-3.1-pro-preview",/m,
  `const modelStr = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.6-flash";
  const response = await getAI().models.generateContent({
    model: modelStr,`
);

fs.writeFileSync('src/services/metricsAi.ts', code);
