const fs = require('fs');
let code = fs.readFileSync('src/services/metricsAi.ts', 'utf8');

const regex = /export async function generateCPAScenarios\([\s\S]*?\n\}/m;

const newFunc = `export async function generateCPAScenarios(
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
  const modelStr = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.6-flash";
  const prompt = \`أنت خبير في تخطيط الميزانيات وتحسين تكلفة الاستحواذ (CPA).
الوضع الحالي:
- إجمالي الطلبات الحالية: \${currentOrders}
- تكلفة الطلب الحالية (CPA): \${currentCpa}
- التكلفة المستهدفة الإجمالية بنهاية الفترة (Target CPA): \${targetCpa}
- النطاق المسموح لتكلفة الطلب اليومية في الأيام القادمة: بين \${minCpa} و \${maxCpa} (فترة مغلقة ممنوع الخروج عنها)
- الأيام المتبقية في الشهر: \${remainingDays}
- الإنفاق اليومي الحالي: \${dailySpend || 'غير محدد'}

المطلوب:
حساب الأرقام المطلوبة بدقة لتحقيق التكلفة المستهدفة الإجمالية (\${targetCpa}) بنهاية الفترة.
هام جداً: يجب أن تقترح خططاً بحيث تكون التكلفة اليومية المقترحة (Daily CPA) في جميع السيناريوهات محصورة حصراً بين \${minCpa} و \${maxCpa}.
قم بتقسيم الحل إلى 5 سيناريوهات واستراتيجيات احترافية:
1. خفض التدريجي والتوزيع (Gradual)
2. التحكم العدواني (Aggressive)
3. التركيز على الحملات الأعلى ربحية فقط
4. التركيز على معدل التحويل (CVR Focus)
5. العروض الترويجية لزيادة معدل التحويل

تعليمات حاسمة (Strict Constraints):
- يجب أن تكون أعداد الطلبات (الكلية واليومية) عبارة عن أرقام صحيحة فقط (Integers) بدون أي كسور عشرية.
- يجب ألا تتجاوز التكلفة اليومية (Daily CPA) في أي سيناريو الحد الأقصى (\${maxCpa}) ولا تقل عن الحد الأدنى (\${minCpa}).
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
    "dailyCpa": "الـ CPA اليومي المقترح (يجب أن يكون رقماً بين \${minCpa} و \${maxCpa})",
    "dailySpend": "الإنفاق اليومي المقترح"
  }
]\`;

  const response = await getAI().models.generateContent({
    model: modelStr,
    contents: prompt,
    config: { temperature: 0.2 }
  });
  
  return response.text || '';
}`;

code = code.replace(regex, newFunc);
fs.writeFileSync('src/services/metricsAi.ts', code);
