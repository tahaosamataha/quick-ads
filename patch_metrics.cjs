const fs = require('fs');
let code = fs.readFileSync('src/services/metricsAi.ts', 'utf8');

const oldFunc = `export async function generateCPAScenarios(
  currentOrders: number, 
  currentCpa: number, 
  targetCpa: number, 
  remainingDays: number, 
  dailySpend: number,
  dialect: string
): Promise<string> {`;

const newFunc = `export async function generateCPAScenarios(
  currentOrders: number, 
  currentCpa: number, 
  targetCpa: number, 
  remainingDays: number, 
  dailySpend: number,
  dialect: string,
  modelType: 'pro' | 'flash' = 'pro'
): Promise<string> {
  const modelStr = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.6-flash";`;

code = code.replace(oldFunc, newFunc);

const oldPrompt = `أخرج التقرير بصيغة Markdown احترافية وجذابة، واجعله باللغة/اللهجة: \${dialect}.\`;`;
const newPrompt = `أخرج التقرير بصيغة Markdown احترافية وجذابة، واجعله باللغة/اللهجة: \${dialect}.

هام جداً:
يجب أن يبدأ التقرير مباشرة بجدول (Markdown Table) يختصر الـ 3 سيناريوهات بشكل منظم وواضح، بحيث يحتوي الجدول على أعمدة مثل: (السيناريو، الإجراء، الهدف اليومي للطلبات، أقصى CPA مسموح). بعد الجدول، اكتب تفاصيل كل سيناريو.\`;`;

code = code.replace(oldPrompt, newPrompt);

const oldModelCall = `  const response = await getAI().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,`;

const newModelCall = `  const response = await getAI().models.generateContent({
    model: modelStr,
    contents: prompt,`;

code = code.replace(oldModelCall, newModelCall);

fs.writeFileSync('src/services/metricsAi.ts', code);
