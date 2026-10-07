export const buildBrandKitPrompt = (brandKit: any): string => {
  if (!brandKit) return '';
  return `
[🔥 THE ULTIMATE BRAND KIT ENFORCEMENT - CRITICAL INSTRUCTION 🔥]
YOU MUST ADHERE TO THE FOLLOWING BRAND IDENTITY AND RULES WITH 100% STRICTNESS.
ANY DEVIATION WILL BE CONSIDERED A FAILURE.

** Brand Name: ${brandKit.name || ''} **
** Industry: ${brandKit.industry || ''} **
** Tone of Voice: ${brandKit.tone || brandKit.voice?.primary || 'Neutral'} **
** Visual / Design Style: ${brandKit.style || brandKit.visualStyle || 'Modern'} **

** Target Audience: ${brandKit.targetAudience || 'Not specified'} **
** Unique Selling Proposition (USP): ${brandKit.uniqueSellingProposition || 'Not specified'} **
** Key Benefits: ${brandKit.keyBenefits || 'Not specified'} **
** Common Objections to Overcome: ${brandKit.objectionsToOvercome || 'Not specified'} **
** Communication Style: ${brandKit.communicationStyle || 'Direct and persuasive'} **
** Prohibited Words (DO NOT USE THESE): ${brandKit.prohibitedWords || 'None'} **

[INSTRUCTIONS]
1. EVERYTHING YOU GENERATE MUST EXPLICITLY ALIGN WITH THIS TARGET AUDIENCE AND COMMUNICATION STYLE.
2. YOU MUST HIGHLIGHT THE USP AND KEY BENEFITS ORGANICALLY.
3. YOU MUST PROACTIVELY CRUSH THE OBJECTIONS MENTIONED ABOVE.
4. YOU MUST NEVER, EVER USE ANY PROHIBITED WORDS.
5. ALL OUTPUT MUST MATCH THE BRAND'S TONE OF VOICE FLAWLESSLY.
`;
};
