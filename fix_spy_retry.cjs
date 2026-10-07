const fs = require('fs');
let code = fs.readFileSync('src/services/ai.ts', 'utf8');

const analyzeProductForSpyFullRegex = /export async function analyzeProductForSpy\([\s\S]*?throw new Error\('فشل في تحليل المنتج والبحث البصري\. يرجى المحاولة مرة أخرى\.'\);\n  \}\n\}/;

const newSpyFunc = `export async function analyzeProductForSpy(productName: string, imageBase64: string | null): Promise<any> {
  const model = "gemini-3.1-pro-preview";
  let prompt = \`أنت خبير في دراسة السوق والبحث الجاسوسي عن الإعلانات المربحة (Ad Spy Specialist) وتعمل كمحرك بحث بصري وتحليلي متقدم.

المهمة المطلوبة:
1. تحليل صورة و/أو اسم المنتج المدخل ("\${productName}") بدقة متناهية.
2. توليد "هوكات الكلمات المفتاحية للبحث" (Keyword Hooks & Search Angles):
   قم بالتفكير في زوايا البحث العميقة والهوكات التسويقية التي يبحث بها الجمهور أو المنافسون عن إعلانات هذا المنتج.
   يجب توليد ما لا يقل عن 10 هوكات بحثية متنوعة باللغتين العربية والإنجليزية.

3. استخدام أداة بحث جوجل (Google Search) لاستخراج روابط حقيقية وفعلية لإعلانات وفيديوهات ومتاجر تبيع هذا المنتج تحديداً.
4. توفير ما لا يقل عن 8 روابط حقيقية في قسم links.

اسم المنتج/الوصف المدخل: "\${productName}"

الإخراج يجب أن يكون JSON صالح (Valid JSON) بالهيكلية التالية فقط بدون أي نصوص إضافية:
{
  "keywordHooks": [
    {
      "hook": "الكلمة المفتاحية أو الهوك الموجه للبحث",
      "angle": "الزاوية التسويقية",
      "language": "ar | en"
    }
  ],
  "queries": [
    { "query": "كلمة مفتاحية للبحث", "reason": "سبب اختيارها" }
  ],
  "hashtags": ["#tag1", "#tag2"],
  "links": [
    {
      "platform": "tiktok | facebook | instagram | pinterest | youtube | store",
      "url": "رابط حقيقي (https://...)",
      "title": "عنوان الصفحة",
      "relevance": "نسبة المطابقة (مثال: 95%)"
    }
  ]
}\`;
  let parts: any[] = [{ text: prompt }];
  if (imageBase64) {
    const base64Data = imageBase64.split(',')[1];
    const mimeType = imageBase64.split(';')[0].split(':')[1];
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    });
    parts[0].text += "\\n\\nالصورة المرفقة للمنتج: قم بتفعيل قدراتك في الرؤية لاستخراج الخصائص البصرية.";
  }
  
  let retries = 2;
  while (retries > 0) {
    try {
      const response = await getAI().models.generateContent({
        model: model,
        contents: parts,
        config: { 
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });

      let text = response.text || "{}";
      text = text.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
      text = text.replace(/\\[\\d+(?:,\\s*\\d+)*\\]/g, '');
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn("JSON parsing failed, trying to repair", text.substring(0, 100) + "...");
        // Basic repair: if it ends abruptly, try to close it
        if (!text.endsWith('}')) {
           text = text + ']}]}'; // highly naive, but it might work for trailing lists
           try {
             return JSON.parse(text);
           } catch(e) {}
        }
        throw parseError; // Retry on failure
      }
    } catch (e) {
      console.error("Attempt failed:", e);
      retries--;
      if (retries === 0) {
        throw new Error('فشل في تحليل المنتج والبحث البصري. يرجى المحاولة مرة أخرى.');
      }
      // wait 2 seconds before retry
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}`;

code = code.replace(analyzeProductForSpyFullRegex, newSpyFunc);
fs.writeFileSync('src/services/ai.ts', code);
