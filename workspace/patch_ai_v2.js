const fs = require('fs');
let aiContent = fs.readFileSync('src/services/ai.ts', 'utf8');

const helper = "\nexport function getBrandKitInstruction(brandKit: any): string {\n  if (!brandKit) return '';\n  return '\\n\\nCRITICAL BRAND GUIDELINES (You MUST follow these for content, tone, and visual style):\\n- Brand Name: ' + (brandKit.name || '') + '\\n- Tone of Voice: ' + (brandKit.voice?.primary || 'Neutral') + '\\n- Visual Style: ' + (brandKit.visualStyle || 'Modern') + '\\n- Industry: ' + (brandKit.industry || '') + '\\n- Description: ' + (brandKit.description || '') + '\\n- Generated Content Constraints: Ensure the layout, formatting, and language rigidly reflects the \"' + (brandKit.voice?.primary || 'Neutral') + '\" tone.\\n- For any images generated or suggested (imagePrompts), strictly adhere to the Visual Style: \"' + (brandKit.visualStyle || 'Modern') + '\".\\n\\n';\n}\n\n";

aiContent = aiContent.replace("let aiClient: GoogleGenAI | null = null;", helper + "let aiClient: GoogleGenAI | null = null;");

const functions = [
  "analyzeProduct",
  "analyzeAdCreatives",
  "generateScenePrompts",
  "generateBackgroundImage",
  "generateVideoScript",
  "generateFbAdCopies",
  "generateFunnelCopy",
  "generateVideoScenes",
  "extractWinnerVideoDetails",
  "generateCreativeImagePrompts",
  "generateWinnerAngleScripts",
  "generateTextOnVisual"
];

for (const fn of functions) {
  // Replace the signature carefully.
  const oldSig = "delay = 3000\\n\\s*\\): Promise<";
  const regex = new RegExp("export async function " + fn + "\\([\\s\\S]*?" + oldSig);
  const match = aiContent.match(regex);
  if(match) {
     aiContent = aiContent.replace(match[0], match[0].replace(/delay = 3000\n\s*\): Promise</, "delay = 3000,\n  brandKit?: any\n): Promise<"));
  }
}

aiContent = aiContent.replaceAll("const modelName = modelType", "const brandKitInstruction = getBrandKitInstruction(brandKit);\n  const modelName = modelType");
aiContent = aiContent.replaceAll("${designStyle === 'premium_custom'", "${brandKitInstruction}\\n${designStyle === 'premium_custom'");
aiContent = aiContent.replaceAll("The text MUST be in ${dialectInstruction}.", "${brandKitInstruction}\\nThe text MUST be in ${dialectInstruction}.");

fs.writeFileSync('src/services/ai.ts', aiContent);
