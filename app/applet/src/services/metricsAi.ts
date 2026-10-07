import { getAI } from './ai';

export async function analyzeAdMetrics(
  metrics: { hookRate?: string, holdRate?: string, ctr?: string, cpm?: string, cvr?: string, cpa?: string, roas?: string },
  dialect: string
): Promise<string> {
  let dialectInstruction = "Standard Arabic";
  if (dialect === 'egyptian') dialectInstruction = "Egyptian Arabic dialect (العامية المصرية الدارجة)";
  // ... other dialects
  
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

  const response = await getAI().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: { temperature: 0.7 }
  });
  
  return response.text || '';
}

export async function analyzeAdSheet(csvData: string, dialect: string): Promise<string> {
  const prompt = `أنت خبير Media Buyer وتحليل بيانات إعلانات (Data Analyst).
تم رفع شيت يحتوي على بيانات الحملات الإعلانية (Ads Manager Export).
نظراً لحجم البيانات، قمت باستخراج أهم الأسطر أو ملخص لها:
${csvData}

المطلوب:
1. تحليل شامل لأداء الحملات/الإعلانات الموجودة في الشيت.
2. استخراج أفضل الإعلانات (Top Performers) وأسوأ الإعلانات (Underperformers).
3. تقديم توصيات حاسمة لكل فئة: Kill, Punish, or Scale.
4. اكتشاف الأنماط (Patterns): هل المشكلة في الكرييتف (مثال: Hook rate ضعيف) أم في صفحة الهبوط (CVR ضعيف)؟

اكتب التقرير باللغة: العربية ويفضل لهجة ${dialect} وبتنسيق Markdown منظم بوضوح باستخدام الجداول وقوائم النقاط.`;

  const response = await getAI().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: { temperature: 0.7 }
  });
  
  return response.text || '';
}

export async function generateCPAScenarios(
  currentOrders: number, 
  currentCpa: number, 
  targetCpa: number,
  minDailyCpa: number,
  maxDailyCpa: number,
  remainingDays: number, 
  dailySpend: number,
  dialect: string,
  modelType: 'pro' | 'flash' = 'pro'
): Promise<string> {
  const modelStr = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.6-flash";
  
  // Mathematical logic: To reduce CPA from current to target, future CPA must be < targetCpa
  const safeMax = Math.min(maxDailyCpa, targetCpa > 1 ? targetCpa - 0.5 : targetCpa * 0.9);
  const safeMin = Math.min(minDailyCpa, safeMax - 0.5 > 0 ? safeMax - 0.5 : safeMax * 0.7);

  const prompt = `أنت خبير واستراتيجي معتمد ونموذج رياضي دقيق في إدارة الميزانيات الإعلانية وتخفيض تكلفة الاستحواذ (CPA Optimizer).

البيانات المدخلة للحملات:
- إجمالي الطلبات المحققة حتى الآن: ${currentOrders} طلب
- تكلفة الطلب الحالية (Current CPA): $${currentCpa}
- التكلفة المستهدفة الإجمالية بنهاية الفترة (Target CPA): $${targetCpa}
- النطاق اليومي المسموح به لتكلفة الطلب في الأيام القادمة: من $${safeMin} إلى $${safeMax} (أقل من الـ Target CPA)
- الأيام المتبقية في الشهر/الفترة: ${remainingDays} يوم
- متوسط الإنفاق اليومي الحالي: ${dailySpend ? `$${dailySpend}` : 'غير محدد'}

القاعدة الرياضية الإلزامية:
لتخفيض المتوسط التراكمي من $${currentCpa} إلى $${targetCpa}، فإن كل طلب قادم في الـ ${remainingDays} يوماً المتبقية يجب أن يكلف تكلفة CPA أقل تماماً من التكلفة المستهدفة ($${targetCpa}).
المعادلة الدقيقة:
عدد الطلبات الإضافية = [ ${currentOrders} * (${currentCpa} - ${targetCpa}) ] / (${targetCpa} - FutureCPA)

المطلوب:
توليد 5 سيناريوهات واستراتيجيات احترافية مختلفة ومتنوعة رياضياً، بحيث تختار كل استراتيجية تكلفة CPA مستقبلية مختلفة (Future CPA) تقع بدقة داخل النطاق [$${safeMin} إلى $${safeMax}]:
1. خفض التدريجي والتوزيع (Gradual) - تكلفة CPA مستقبلية قريبة من $${safeMax}
2. التحكم العدواني وإيقاف الخاسر (Aggressive) - تكلفة CPA مستقبلية قريبة من $${safeMin} لتحقيق الهدف بأقل عدد طلبات ممكن
3. التركيز على الحملات الأعلى ربحية فقط - تكلفة CPA مستقبلية متوسطة متوازنة
4. التركيز على معدل التحويل (CVR Focus) - تكلفة CPA مستقبلية منخفضة مع زيادة التحويلات
5. العروض الترويجية لزيادة حجم المبيعات - تكلفة CPA مستقبلية متوسطة مع زيادة حجم الطلبات اليومية

شروط حاسمة جداً وإلزامية:
1. يمنع منعاً باتاً تثبيت عمود (Max CPA) على قيمة الـ Target CPA ($${targetCpa})! بل يجب أن يكون لكل سيناريو تكلفة مستهدفة مستقبلية مختلفة وواقعية داخل النطاق [$${safeMin} - $${safeMax}] وأقل من $${targetCpa}.
2. يجب أن تكون جميع أعداد الطلبات (الإضافية الكلية واليومية) أعداداً صحيحة فقط (Integers) بدون أي فواصل أو كسور عشرية.
3. اليوميات: dailyOrders = إجمالي الطلبات الإضافية مقسوماً على ${remainingDays} (مقرب لأقرب رقم صحيح).
4. الإنفاق اليومي المقترح: dailySpend = dailyOrders * dailyCpa (مقرب لأقرب رقم صحيح).
5. الإخراج يكون فقط عبارة عن JSON Array خام وصالح بدون أي نصوص قبلها أو بعدها.

الصيغة المطلوبة للـ JSON:
[
  {
    "scenario": "اسم الاستراتيجية",
    "action": "شرح الإجراء العملي في الحملات",
    "additionalOrders": 240,
    "maxCpa": "$13",
    "expectedPerformance": "تحقيق التكلفة المستهدفة عبر خفض تدريجي",
    "dailyOrders": 30,
    "dailyCpa": "$13",
    "dailySpend": "$390"
  }
]`;

  const response = await getAI().models.generateContent({
    model: modelStr,
    contents: prompt,
    config: { temperature: 0.1 }
  });
  
  return response.text || '';
}
