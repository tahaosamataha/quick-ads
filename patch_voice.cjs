const fs = require('fs');
let code = fs.readFileSync('src/services/ai.ts', 'utf8');

const newPrompt = `    let promptForVoice = \`Analyze the following video script and voice-over instructions to determine the most appropriate text-to-speech voice, temperature, and pitch modification factor.

Available Voices & Their Characteristics:
- Female Voices:
  * Zephyr: Young, energetic, trendy (perfect for fashion, beauty, youth, social media)
  * Leda: Calm, luxurious, soft, elegant (great for cosmetics, spas, luxury items)
  * Kore: Bright, sweet, approachable, friendly (ideal for food, lifestyle, casual, everyday)
  * Laomedeia: Warm, maternal, caring, empathetic (best for health, kids, family, home)
  * Achernar: Professional, clear, authoritative (excellent for corporate, tech, news, finance)
  * Callirrhoe: Enthusiastic, dynamic, salesy (perfect for retail, fast promos, discounts)
  * Despina: Mature, storytelling, narrative (good for serious topics, documentaries)
  * Gacrux: Confident, bold, strong (ideal for fitness, cars, intense sports)

- Male Voices:
  * Puck: Energetic, young, upbeat, modern (perfect for fast tech, modern fashion, trendy apps)
  * Charon: Deep, raspy, heavy, authoritative (best for trucks, fitness, intense promos, cinematic)
  * Fenrir: Strong, serious, commanding, premium (great for luxury, real estate, corporate)
  * Orus: Warm, friendly, approachable, relatable (ideal for food, family, everyday products)
  * Lapetus: Calm, narrative, storytelling, wise (good for documentaries, health, calm vibes)
  * Enceladus: Bright, enthusiastic, salesy, loud (perfect for retail promos, hype, discounts)
  * Achird: Professional, clear, informative (great for tech, finance, explainer videos)
  * Alnilam: Smooth, suave, sophisticated (good for luxury, perfumes, high-end fashion)
  * Algenib: Casual, conversational, relatable (good for UGC style, vlogs, friendly advice)
  * Algieba, Umbriel, Zubenelgenubi, Sadachbia: Versatile, general-purpose voices for any script.

Rules:
1. User Selected Gender Constraint: If the user selected 'male' (\${voiceGender} === 'male'), you ABSOLUTELY MUST choose a Male voice. If 'female' (\${voiceGender} === 'female'), you ABSOLUTELY MUST choose a Female voice. This overrides any other rule!
2. VARIETY & MATCHING (CRITICAL): Read the script carefully and match the product/vibe to the correct voice description above. DO NOT always pick the same voice. Ensure the voice character uniquely fits the product and script's energy.
3. If the instructions or script request a very deep, strong, manly, or raspy voice (صوت تخين، قوي جدا، عميق، رجولي، محشرج), you MUST choose the "Charon" voice AND set pitchAdjustmentFactor to 0.85.
4. If the instructions or script indicate a female speaker (e.g., "بنت", "امرأة", "female"), choose a Female voice with pitchAdjustmentFactor 1.0.
5. If they indicate a male speaker (e.g., "رجل", "ولد", "male"), choose a Male voice with pitchAdjustmentFactor 1.0.
6. Temperature controls creativity and pacing. The temperature MUST be between 1.35 and 1.6 depending on the type of script. For energetic or fast-paced ads, use a higher temperature (up to 1.6). For slower or dramatic scripts, use a lower temperature (down to 1.35).
7. The pitchAdjustmentFactor should normally be 1.0. Only set to a lower value (e.g., 0.85) if a specifically thick/deep/raspy man's voice is requested.

User Selected Gender: \${voiceGender}\\nScript Type: \${scriptType}
Instructions: \${instructions}
Script: \${text}\`;`;

code = code.replace(/let promptForVoice = `Analyze the following[\s\S]*?Script: \$\{text\}`;/, newPrompt);

fs.writeFileSync('src/services/ai.ts', code);
