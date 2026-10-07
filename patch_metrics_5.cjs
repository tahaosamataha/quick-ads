const fs = require('fs');
let code = fs.readFileSync('src/services/metricsAi.ts', 'utf8');

const oldPrompt = `[
  {
    "scenario": "اسم الاستراتيجية (من القائمة أعلاه)",
    "action": "الإجراء المطلوب بالتفصيل (مثل: خفض الميزانية تدريجياً وإعادة توجيه الإنفاق...)",
    "additionalOrders": "عدد الطلبات (رقم أو '--' إذا غير متوفر)",
    "maxCpa": "أقصى تكلفة (مثل: $13 أو '--' إذا غير متوفر)",
    "expectedPerformance": "الأداء المتوقع (مثل: تحسين الأداء تدريجيا وتقليل CPA)"
  }
]\`;`;

const newPrompt = `[
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

code = code.replace(oldPrompt, newPrompt);
fs.writeFileSync('src/services/metricsAi.ts', code);
