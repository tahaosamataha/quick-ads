import { getAI } from './ai';

export async function analyzeAdMetrics(
  metrics: { hookRate?: string, holdRate?: string, ctr?: string, cpm?: string, cvr?: string, cpa?: string, roas?: string },
  dialect: string,
  modelType: 'pro' | 'flash' = 'pro'
): Promise<string> {
  let dialectInstruction = "Standard Arabic";
  if (dialect === 'egyptian') dialectInstruction = "Egyptian Arabic dialect (العامية المصرية الدارجة)";
  if (dialect === 'saudi') dialectInstruction = "Saudi Arabic dialect (اللهجة السعودية الدارجة)";
  
  const prompt = `أنت خبير في تحليل إعلانات السوشيال ميديا (Media Buying & Performance Marketing).
البيانات الحالية للحملة:
- Hook Rate: ${metrics.hookRate || 'غير متوفر'}%
- Hold Rate: ${metrics.holdRate || 'غير متوفر'}%
- CTR: ${metrics.ctr || 'غير متوفر'}%
- CPM: ${metrics.cpm || 'غير متوفر'}
- CVR (معدل التحويل): ${metrics.cvr || 'غير متوفر'}%
- CPA (تكلفة الشراء): ${metrics.cpa || 'غير متوفر'}
- ROAS (العائد على الإنفاق): ${metrics.roas || 'غير متوفر'}

المطلوب:
1. تقييم شامل لأداء الإعلان بناءً على هذه الأرقام (جيد، سيء، متوسط).
2. اتخاذ قرار حاسم: Kill (إيقاف) أو Punish (تقليل الميزانية/تحجيم) أو Scale (زيادة الميزانية) مع ذكر الأسباب التفصيلية.
3. توصيات لتحسين الكرييتف (Creative) استناداً على Hook و Hold rate.

اكتب التقرير باللغة: ${dialectInstruction} وبتنسيق Markdown نظيف وجذاب.`;

  const modelStr = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";
  const response = await getAI().models.generateContent({
    model: modelStr,
    contents: prompt,
    config: { temperature: 0.7 }
  });
  
  return response.text || '';
}

export async function analyzeAdSheet(csvData: string, dialect: string, modelType: 'pro' | 'flash' = 'pro'): Promise<string> {
  const modelStr = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";
  const prompt = `أنت خبير Media Buyer وتحليل بيانات إعلانات (Data Analyst) محترف جداً.
تم رفع شيت يحتوي على بيانات الحملات الإعلانية (Ads Manager Export) مفصلة على مستوى المجموعات الإعلانية (Ad Set) ومستوى الإعلانات والكرييتف (Ad Level).

البيانات المرفقة تحتوي على مقاييس متقدمة (كما تظهر في مدير الإعلانات) مثل:
(ROAS, CPA, Purchases, CPM, CTR, Link Clicks, Outbound CTR, Landing Page Views, Checkouts Initiated, Quality/Engagement Rankings)
بالإضافة إلى مقاييس الانتباه (Hook Rate, Hold Rate) والمقسمة لأجزاء إذا تم توفيرها.

بيانات الشيت (أهم الأسطر):
${csvData}

المطلوب منك كخبير:
1. تحليل كل "كرييتف" (Ad) بشكل فردي لمعرفة ماذا فعل بالتحديد بناءً على الأرقام.
2. استخراج جدول يوضح حالة كل كرييتف بوضوح (اسم/معرف الكرييتف | القرار | التكلفة | العائد | الإجراء الفني المطلوب).
3. إعطاء قرارات صارمة ومحددة لكل كرييتف، مثل: 
   - Kill (قفل الإعلان)
   - Scale (زيادة الميزانية)
   - Isolate (فصل الكرييتف في مجموعة إعلانية أو حملة منفصلة لاختباره بشكل أفضل).
4. تقديم نصائح تفصيلية لتعديل الكرييتف نفسه لتجنب حرق الميزانية أو لتحسينه. (مثلاً: "قم بتغيير الهوك (Hook) لأن نسبة الانتباه في أول ثواني ضعيفة جداً"، أو "قم بتغيير الـ Body/Message لأن الـ Hold rate جيد ولكن الـ Outbound CTR أو الـ Link Clicks ضعيفة").
5. تحديد الاختناقات (Bottlenecks) في الفانل: هل الخلل في الكرييتف نفسه، أم أن الكرييتف يجلب زيارات ولكن لا يوجد Checkouts/Purchases مما يعني أن صفحة الهبوط (Landing Page) تحتاج تعديل؟

اكتب التقرير باللغة: العربية ويفضل لهجة ${dialect} وبتنسيق Markdown احترافي، وكن عملياً جداً ومباشراً في نصائحك.`;

  const response = await getAI().models.generateContent({
    model: modelStr,
    contents: prompt,
    config: { temperature: 0.7 }
  });
  
  return response.text || '';
}

export async function generateCPAScenarios(
  currentOrders: number, 
  currentCpa: number, 
  targetCpa: number,
  minCpa: number, 
  maxCpa: number, 
  remainingDays: number, 
  dailySpend: number,
  dialect: string,
  modelType: 'pro' | 'flash' = 'pro'
): Promise<string> {
  const modelStr = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";
  const prompt = `أنت خبير في تخطيط الميزانيات وتحسين تكلفة الاستحواذ (CPA).
الوضع الحالي:
- إجمالي الطلبات الحالية: ${currentOrders}
- تكلفة الطلب الحالية (CPA): ${currentCpa}
- التكلفة المستهدفة الإجمالية بنهاية الفترة (Target CPA): ${targetCpa}
- النطاق المسموح لتكلفة الطلب اليومية في الأيام القادمة: بين ${minCpa} و ${maxCpa} (فترة مغلقة ممنوع الخروج عنها)
- الأيام المتبقية في الشهر: ${remainingDays}
- الإنفاق اليومي الحالي: ${dailySpend || 'غير محدد'}

المطلوب:
حساب الأرقام المطلوبة بدقة لتحقيق التكلفة المستهدفة الإجمالية (${targetCpa}) بنهاية الفترة.
هام جداً: يجب أن تقترح خططاً بحيث تكون التكلفة اليومية المقترحة (Daily CPA) في جميع السيناريوهات محصورة حصراً بين ${minCpa} و ${maxCpa}.
قم بتقسيم الحل إلى 5 سيناريوهات واستراتيجيات احترافية:
1. خفض التدريجي والتوزيع (Gradual)
2. التحكم العدواني (Aggressive)
3. التركيز على الحملات الأعلى ربحية فقط
4. التركيز على معدل التحويل (CVR Focus)
5. العروض الترويجية لزيادة معدل التحويل

تعليمات حاسمة (Strict Constraints):
- يجب أن تكون أعداد الطلبات (الكلية واليومية) عبارة عن أرقام صحيحة فقط (Integers) بدون أي كسور عشرية.
- يجب ألا تتجاوز التكلفة اليومية (Daily CPA) في أي سيناريو الحد الأقصى (${maxCpa}) ولا تقل عن الحد الأدنى (${minCpa}).
- أخرج النتيجة على هيئة كود JSON صالح (Valid JSON) فقط لا غير، بدون أي نصوص، مقدمات، أو Markdown (لا تضع Markdown Code Blocks).

الـ JSON يجب أن يكون مصفوفة (Array) تحتوي على 5 كائنات (Objects) تمثل الـ 5 سيناريوهات المذكورة، بالصيغة التالية بالضبط:
[
  {
    "scenario": "اسم الاستراتيجية",
    "action": "الإجراء المطلوب بالتفصيل",
    "additionalOrders": "إجمالي عدد الطلبات الإضافية المطلوبة (رقم صحيح)",
    "maxCpa": "أقصى تكلفة كلية مسموحة (مثال: $12)",
    "expectedPerformance": "الأداء المتوقع",
    "dailyOrders": "عدد الطلبات اليومي المطلوب (رقم صحيح)",
    "dailyCpa": "الـ CPA اليومي المقترح (يجب أن يكون رقماً بين ${minCpa} و ${maxCpa})",
    "dailySpend": "الإنفاق اليومي المقترح"
  }
]`;

  const response = await getAI().models.generateContent({
    model: modelStr,
    contents: prompt,
    config: { temperature: 0.2 }
  });
  
  return response.text || '';
}
