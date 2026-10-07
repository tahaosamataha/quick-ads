const fs = require('fs');
let code = fs.readFileSync('src/services/ai.ts', 'utf8');

code = code.replace(/const truncatedHtml = htmlContent \? htmlContent\.substring\(0, 30000\) : '';/g, 
  "// Truncate HTML but allow a much larger chunk to ensure we get the full description\n    const truncatedHtml = htmlContent ? htmlContent.substring(0, 250000) : '';");

code = code.replace(/2\. Extract the main product description and translate it to Arabic\./g,
  "2. Extract the FULL, COMPREHENSIVE product description. Do NOT summarize or shorten it. Include ALL features, specifications, benefits, bullet points, and details found on the page, and translate EVERYTHING accurately to Arabic.");

code = code.replace(/description: "A detailed description of the product in Arabic\."/g,
  "description: \"A complete, highly detailed, and comprehensive description of the product in Arabic, including all specs, features, and benefits.\"");

fs.writeFileSync('src/services/ai.ts', code);
