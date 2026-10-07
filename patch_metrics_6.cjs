const fs = require('fs');
let code = fs.readFileSync('src/services/metricsAi.ts', 'utf8');

const oldSig = `export async function generateCPAScenarios(
  currentOrders: number, 
  currentCpa: number, 
  targetCpa: number, 
  remainingDays: number, 
  dailySpend: number,
  dialect: string,
  modelType: 'pro' | 'flash' = 'pro'
): Promise<string> {`;

const newSig = `export async function generateCPAScenarios(
  currentOrders: number, 
  currentCpa: number, 
  minCpa: number, 
  maxCpa: number, 
  remainingDays: number, 
  dailySpend: number,
  dialect: string,
  modelType: 'pro' | 'flash' = 'pro'
): Promise<string> {`;
code = code.replace(oldSig, newSig);

const oldPromptStart = `const prompt = \`أنت خبير في تخطيط الميزانيات وتحسين تكلفة الاستحواذ (CPA).
الوضع الحالي:
- إجمالي الطلبات الحالية: \${currentOrders}
- تكلفة الطلب الحالية (CPA): \${currentCpa}
- التكلفة المستهدفة (Target CPA): \${targetCpa}
- الأيام المتبقية في الشهر: \${remainingDays}
- الإنفاق اليومي الحالي: \${dailySpend || 'غير محدد'}

المطلوب:
حساب الأرقام المطلوبة بدقة لتحقيق التكلفة المستهدفة (\${targetCpa}) بنهاية الفترة.`;

const newPromptStart = `const prompt = \`أنت خبير في تخطيط الميزانيات وتحسين تكلفة الاستحواذ (CPA).
الوضع الحالي:
- إجمالي الطلبات الحالية: \${currentOrders}
- تكلفة الطلب الحالية (CPA): \${currentCpa}
- التكلفة المستهدفة (Target CPA Range): بين \${minCpa} و \${maxCpa}
- الأيام المتبقية في الشهر: \${remainingDays}
- الإنفاق اليومي الحالي: \${dailySpend || 'غير محدد'}

المطلوب:
حساب الأرقام المطلوبة بدقة لتحقيق التكلفة المستهدفة (متوسط بين \${minCpa} و \${maxCpa}) بنهاية الفترة.
هام جداً: يجب أن تكون أعداد الطلبات (الكلية واليومية) عبارة عن أرقام صحيحة فقط (Integers) بدون أي كسور عشرية.
بما أن الهدف هو فترة بيانية (Range)، يجب أن تعرض الطلبات والتكلفة على هيئة نطاق (مثال: 200 - 250).`;
code = code.replace(oldPromptStart, newPromptStart);

const oldPromptJson = `[
  {
    "scenario": "اسم الاستراتيجية (من القائمة أعلاه)",
    "action": "الإجراء المطلوب بالتفصيل (مثل: خفض الميزانية تدريجياً وإعادة توجيه الإنفاق...)",
    "additionalOrders": "عدد الطلبات الكلي (رقم أو '--' إذا غير متوفر)",
    "maxCpa": "أقصى تكلفة كلية (مثل: $13 أو '--' إذا غير متوفر)",
    "expectedPerformance": "الأداء المتوقع (مثل: تحسين الأداء تدريجيا وتقليل CPA)",
    "dailyOrders": "عدد الطلبات اليومي المطلوب (رقم مقرب)",
    "dailyCpa": "الـ CPA اليومي المسموح (مثل: $12)",
    "dailySpend": "الإنفاق اليومي المقترح (مثل: $200)"
  }
]\`;`;

const newPromptJson = `[
  {
    "scenario": "اسم الاستراتيجية (من القائمة أعلاه)",
    "action": "الإجراء المطلوب بالتفصيل (مثل: خفض الميزانية تدريجياً وإعادة توجيه الإنفاق...)",
    "additionalOrders": "نطاق الطلبات الكلي (مثال: 300 - 350) (أعداد صحيحة فقط)",
    "maxCpa": "نطاق التكلفة الكلية (مثال: $10 - $12)",
    "expectedPerformance": "الأداء المتوقع",
    "dailyOrders": "نطاق الطلبات اليومي المطلوب (مثال: 30 - 35) (أعداد صحيحة فقط)",
    "dailyCpa": "الـ CPA اليومي المسموح (مثال: $10 - $12)",
    "dailySpend": "الإنفاق اليومي المقترح (مثال: $200 - $250)"
  }
]\`;`;
code = code.replace(oldPromptJson, newPromptJson);

fs.writeFileSync('src/services/metricsAi.ts', code);
