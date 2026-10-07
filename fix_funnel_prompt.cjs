const fs = require('fs');
let code = fs.readFileSync('src/services/ai.ts', 'utf8');

const regex = /5\. Format: Output ONLY the final copy\. Divide it into clear, impactful sections using headers \(e\.g\., \[Section Name\]\)\.\s*6\. NO META-TEXT: Do not include any advice, instructions, or conversational filler\. The output must be a cohesive block of text ready to be pasted directly into a page builder\./;

const replacement = `5. Format: Output ONLY the final copy. Divide it into clear, impactful sections using headers (e.g., [Section Name]).
      6. CLEAN TEXT ONLY: ABSOLUTELY NO MARKDOWN STYLING ALLOWED. DO NOT use asterisks (**), hashes (#), underscores, or any markdown formatting. The text must be completely plain and clean, ready to be copied directly without any special symbols like ** or *. Do not use markdown bullet points either, just use a normal dash "-" or numbers.
      7. NO META-TEXT: Do not include any advice, instructions, or conversational filler. The output must be a cohesive block of text ready to be pasted directly into a page builder.`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/services/ai.ts', code);
