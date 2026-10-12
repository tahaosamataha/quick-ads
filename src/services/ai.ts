import { GoogleGenAI, Type } from "@google/genai";
// @ts-ignore
import lamejs from 'lamejsfix';
import { easyOrdersBaseCss } from '../lib/easyOrdersTemplate';

const ADVANCED_COPYWRITING_PRINCIPLES = `
ADVANCED COPYWRITING & CRO PRINCIPLES TO FOLLOW:
- Psychological Triggers: Masterfully deploy Reciprocity, Scarcity (FOMO via limited stock/time), Authority (expert/influencer proof), Consistency, Liking (relatable tone), Social Proof (reviews/numbers), Loss Aversion, Confirmation Bias, Anchoring, and Ego/Status triggers.
- Features vs. Benefits: Never just list features. Always translate features into emotional and functional benefits (e.g., instead of "12mp camera", use "Capture magical memories that last a lifetime").
- Copy Structure & Scannability: Avoid walls of text ("الدشششش"). Use white spaces, short paragraphs, and odd-numbered bullet lists. Write at a 5th-grade reading level.
- Concrete & Specific Words: Do NOT use vague claims like "High quality" or "Fast delivery". Use specific, concrete data (e.g., "Guaranteed for 5 years", "Delivered in 24 hours"). Concrete words are far easier for the brain to remember.
- Emotive & Power Words: Use words that evoke strong emotions. Avoid overused, exaggerated fluff ("Unique", "Unprecedented", "Magic").
- Audience-Centric Voice: Write as if speaking directly to ONE specific person (The "Dear Doris" Warren Buffett method). Use "You" and "Your" more than the product name to create the Endowment Effect. Use their everyday vocabulary and slang.
- Powerful Hooks (Triple Hook Technique): Start with a strong hook to capture attention in the first 3 seconds (e.g., Problem/Pain, Unique Solution, Threat/Warning, Confirmation Bias, Status).
- Offer & Value Proposition: Focus on achieving the goal without the pain point. Provide a clear end result. Reduce friction (minimize effort, time, and hesitancy). Add ironclad guarantees.
`;


export function getBrandKitInstruction(brandKit: any): string {
  if (!brandKit) return '';
  return '\n\nCRITICAL BRAND GUIDELINES (You MUST follow these for content, tone, and visual style):\n- Brand Name: ' + (brandKit.name || '') + '\n- Tone of Voice: ' + (brandKit.voice?.primary || 'Neutral') + '\n- Visual Style: ' + (brandKit.visualStyle || 'Modern') + '\n- Industry: ' + (brandKit.industry || '') + '\n- Description: ' + (brandKit.description || '') + '\n- Generated Content Constraints: Ensure the layout, formatting, and language rigidly reflects the "' + (brandKit.voice?.primary || 'Neutral') + '" tone.\n- For any images generated or suggested (imagePrompts), strictly adhere to the Visual Style: "' + (brandKit.visualStyle || 'Modern') + '".\n\n';
}

let aiClient: GoogleGenAI | null = null;
let lastUsedKey: string = '';

export function getGeminiApiKey(): string {
  let key = process.env.GEMINI_API_KEY || process.env.GEMINI_API || '';
  if (!key && typeof window !== 'undefined') {
    key = (import.meta as any).env?.VITE_GEMINI_API_KEY || 
          (import.meta as any).env?.VITE_GEMINI_API || 
          localStorage.getItem('gemini_api_key') || 
          localStorage.getItem('GEMINI_API_KEY') || 
          localStorage.getItem('GEMINI_API') || 
          '';
  }
  return key.trim();
}

export function setCustomGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gemini_api_key', key.trim());
    aiClient = null;
  }
}

export function getAI(): GoogleGenAI {
  const key = getGeminiApiKey();
  if (!key) {
    throw new Error("مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) مفقود. يرجى إضافته في إعدادات Cloudflare Pages أو من صفحة الإعدادات في التطبيق.");
  }
  if (!aiClient || lastUsedKey !== key) {
    aiClient = new GoogleGenAI({ apiKey: key });
    lastUsedKey = key;
  }
  return aiClient;
}

export async function generateSmartAngles(
  description: string,
  modelType: 'flash' | 'pro' = 'flash',
  retries: number = 3,
  delay: number = 2000
): Promise<{ title: string; hook: string; audience: string; angle: string }[]> {
  const model = modelType === 'pro' ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash';

  try {
    const response = await getAI().models.generateContent({
      model: model,
      contents: `You are an elite marketing strategist with 20 years of experience.
      Based on the following product description, generate 10 unique, powerful, and deeply researched marketing angles.
      Each angle should target a specific audience segment and use deep psychological triggers.

      Product Description:
      "${description}"

      Return the output as a JSON array where each object has:
      - "title": A short catchy title for the angle (in Arabic)
      - "audience": The specific target audience segment (in Arabic)
      - "hook": A powerful hook or headline for this angle (in Arabic)
      - "angle": A detailed explanation of why this angle works and the core marketing message (in Arabic)
      
      ${ADVANCED_COPYWRITING_PRINCIPLES}`,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              audience: { type: "STRING" },
              hook: { type: "STRING" },
              angle: { type: "STRING" }
            },
            required: ["title", "audience", "hook", "angle"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Failed to parse JSON", e);
      return [];
    }
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateSmartAngles(description, modelType, retries - 1, delay * 2);
    }
    throw error;
  }
}


export async function extractProductData(url: string, retries = 3, delay = 3000): Promise<{ name: string, description: string, images: string[] }> {
  try {
    // Fetch the HTML content first
    let htmlContent = '';
    try {
      const proxies = [
        `/api/proxy-media?url=${encodeURIComponent(url)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`
      ];
      
      for (const proxy of proxies) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout
          const res = await fetch(proxy, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (res.ok) {
            if (proxy.includes('allorigins')) {
              const text = await res.text();
              try {
                const data = JSON.parse(text);
                htmlContent = data.contents || '';
              } catch (e) {
                htmlContent = text;
              }
            } else {
              htmlContent = await res.text();
            }
            if (htmlContent && htmlContent.length > 100) break;
          }
        } catch (e) {
          console.warn("Proxy fetch failed:", proxy);
        }
      }
    } catch (e) {
      console.error("Failed to fetch HTML content:", e);
    }

    // Truncate HTML to avoid token limits (keep roughly the first 30k characters which is usually enough for product details)
    // Truncate HTML but allow a much larger chunk to ensure we get the full description
    const truncatedHtml = htmlContent ? htmlContent.substring(0, 250000) : '';

    const response = await getAI().models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are a product data extractor. Extract information about the product at this URL: ${url}
      
      Here is the HTML content of the page (if available):
      \`\`\`html
      ${truncatedHtml}
      \`\`\`
      
      CRITICAL INSTRUCTIONS:
      1. Extract the product name and translate it to Arabic.
      2. Extract the FULL, COMPREHENSIVE product description. Do NOT summarize or shorten it. Include ALL features, specifications, benefits, bullet points, and details found on the page, and translate EVERYTHING accurately to Arabic.
      3. Extract a list of absolute URLs for the product images. Ensure they start with http:// or https://. Look for <img> tags, meta tags (og:image), or JSON-LD data.
      4. IF THE URL CONTAINS "amazon" (e.g., amazon.eg, amazon.sa, amazon.ae) OR IF the provided HTML is a captcha/bot-check/empty, YOU ABSOLUTELY MUST use the googleSearch tool to search for the product using the URL or keywords to find the true product data and images.
      5. If a specific piece of information is not found, leave it empty (or as an empty array).`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "The name of the product in Arabic."
            },
            description: { 
              type: Type.STRING, 
              description: "A complete, highly detailed, and comprehensive description of the product in Arabic, including all specs, features, and benefits." 
            },
            images: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "List of absolute URLs for the product images." 
            }
          }
        }
      }
    });

    if (response.text) {
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      try {
        return JSON.parse(cleanText);
      } catch(e) {
        console.warn("JSON parse error:", e, "on payload:", cleanText);
        return { name: '', description: '', images: [] };
      }
    }
    return { name: '', description: '', images: [] };
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return extractProductData(url, retries - 1, delay * 2);
    }
    console.error("Extraction error:", error);
    throw error;
  }
}

export async function generateSpeech(
  text: string,
  instructions: string,
  scriptType: string,
  voiceGender: string = 'auto',
  voiceCloneFile?: { base64: string; mimeType: string } | null,
  retries = 3,
  delay = 3000
): Promise<{ wav: string, mp3: string }> {
  try {
    // Determine voice and temperature dynamically using AI
        let promptForVoice = `Analyze the following video script and voice-over instructions to determine the most appropriate text-to-speech voice, temperature, and pitch modification factor.

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
  * Enceladus: Bright, enthusiastic, salesy, loud (perfect for retail promos, hype, discounts)
  * Achird: Professional, clear, informative (great for tech, finance, explainer videos)
  * Alnilam: Smooth, suave, sophisticated (good for luxury, perfumes, high-end fashion)
  * Algenib: Casual, conversational, relatable (good for UGC style, vlogs, friendly advice)
  * Algieba, Umbriel, Zubenelgenubi, Sadachbia: Versatile, general-purpose voices for any script.

Rules:
1. User Selected Gender Constraint: If the user selected 'male' (${voiceGender} === 'male'), you ABSOLUTELY MUST choose a Male voice. If 'female' (${voiceGender} === 'female'), you ABSOLUTELY MUST choose a Female voice. This overrides any other rule!
2. VARIETY & MATCHING (CRITICAL): Read the script carefully and match the product/vibe to the correct voice description above. DO NOT always pick the same voice. Ensure the voice character uniquely fits the product and script's energy.
3. If the instructions or script request a very deep, strong, manly, or raspy voice (صوت تخين، قوي جدا، عميق، رجولي، محشرج), you MUST choose the "Charon" voice AND set pitchAdjustmentFactor to 0.85.
4. If the instructions or script indicate a female speaker (e.g., "بنت", "امرأة", "female"), choose a Female voice with pitchAdjustmentFactor 1.0.
5. If they indicate a male speaker (e.g., "رجل", "ولد", "male"), choose a Male voice with pitchAdjustmentFactor 1.0.
6. The temperature MUST be exactly 1.3.
7. The pitchAdjustmentFactor should normally be 1.0. Only set to a lower value (e.g., 0.85) if a specifically thick/deep/raspy man's voice is requested.

User Selected Gender: ${voiceGender}\nScript Type: ${scriptType}
Instructions: ${instructions}\n(Random Seed for Variety: ${Math.random()})
Script: ${text}`;

    const partsForVoice: any[] = [{ text: promptForVoice }];

    if (voiceCloneFile) {
      partsForVoice.unshift({
        inlineData: {
          data: voiceCloneFile.base64.includes(',') ? voiceCloneFile.base64.split(',')[1] : voiceCloneFile.base64,
          mimeType: voiceCloneFile.mimeType
        }
      });
      partsForVoice.unshift({ text: "CRITICAL: The user has provided a reference audio file for VOICE CLONING. Please analyze the speaker's voice in the audio file and identify their tone, accent, pitch, gender, and pacing. Then, choose the closest text-to-speech voice from the Available Voices list that matches their characteristics. Also, suggest a pitchAdjustmentFactor (e.g., 0.85 for deeper/thicker, or 1.15 for higher) to manipulate the prebuilt voice to sound more like the reference audio. This is highly important."});
    }

    let voiceName = 'Puck';
    let temperature = 1.3;
    let pitchAdjustmentFactor = 1.0;

    const femaleVoices = ['Laomedeia', 'Achernar', 'Zephyr', 'Kore', 'Leda', 'Callirrhoe', 'Despina', 'Gacrux'];
    const maleVoices = ['Puck', 'Charon', 'Fenrir', 'Orus', 'Enceladus', 'Achird', 'Alnilam', 'Algenib', 'Algieba', 'Umbriel', 'Zubenelgenubi', 'Sadachbia'];

    if (voiceGender.startsWith('male_') || voiceGender.startsWith('female_')) {
      voiceName = voiceGender.split('_')[1];
      if (voiceName === 'Charon') pitchAdjustmentFactor = 0.85;
    } else if (femaleVoices.includes(voiceGender) || maleVoices.includes(voiceGender) || ['Aoede', 'Achernar'].includes(voiceGender)) {
      voiceName = voiceGender;
      if (voiceName === 'Charon') pitchAdjustmentFactor = 0.85;
    } else {
      try {
        const voiceResponse = await getAI().models.generateContent({
          model: voiceCloneFile ? "gemini-3.1-pro-preview" : "gemini-3.8-flash",
          contents: [{ parts: partsForVoice }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                voiceName: { type: Type.STRING },
                temperature: { type: Type.NUMBER },
                pitchAdjustmentFactor: { type: Type.NUMBER }
              },
              required: ["voiceName", "temperature"]
            }
          }
        });
        
        if (voiceResponse.text) {
          const result = JSON.parse(voiceResponse.text);
          if (result.voiceName) voiceName = result.voiceName;
          if (result.temperature) temperature = 1.3;
          if (result.pitchAdjustmentFactor) pitchAdjustmentFactor = result.pitchAdjustmentFactor;
        }
      } catch (e) {
        console.warn("Failed to determine voice dynamically, falling back to heuristics", e);
        // Fallback heuristics
        const lowerText = instructions.toLowerCase() + " " + text.toLowerCase();
        // Use RegEx to strictly isolate matches. Look out for "no female", "not female"
        const hasFemaleWord = lowerText.includes('نسائي') || lowerText.includes('امرأة') || lowerText.includes('بنت') || lowerText.match(/(?<!no\s)(?<!not\s)(?<!do not use\s)(?<!don't use\s)\bfemale\b/i) !== null;
        const hasMaleWord = lowerText.includes('رجالي') || lowerText.includes('رجل') || lowerText.includes('ولد') || lowerText.match(/(?<!no\s)(?<!not\s)(?<!do not use\s)(?<!don't use\s)\bmale\b/i) !== null;
        
        const isThick = lowerText.includes('تخين') || lowerText.includes('رجولي') || lowerText.includes('عميق') || lowerText.includes('محشرج');
        
        let forceFemale = false;
        let forceMale = false;
        if (voiceGender === 'female') forceFemale = true;
        if (voiceGender === 'male') forceMale = true;
        
        if (forceFemale || (hasFemaleWord && !forceMale && !hasMaleWord)) {
          voiceName = femaleVoices[Math.floor(Math.random() * femaleVoices.length)];
        } else if (forceMale || isThick || hasMaleWord) {
           voiceName = isThick ? 'Charon' : maleVoices[Math.floor(Math.random() * maleVoices.length)];
           if (isThick) pitchAdjustmentFactor = 0.85;
        } else {
           voiceName = Math.random() > 0.5 ? maleVoices[Math.floor(Math.random() * maleVoices.length)] : femaleVoices[Math.floor(Math.random() * femaleVoices.length)];
        }
      }
    }

    // Force constraints regardless of Model output
    if (voiceGender === 'female' && !femaleVoices.includes(voiceName)) {
      voiceName = femaleVoices[Math.floor(Math.random() * femaleVoices.length)];
    } else if (voiceGender === 'male' && !maleVoices.includes(voiceName)) {
      voiceName = maleVoices[Math.floor(Math.random() * maleVoices.length)];
    } else if (voiceGender === 'auto') {

      const lowerText = instructions.toLowerCase() + " " + text.toLowerCase();
      const hasFemaleWord = lowerText.includes('نسائي') || lowerText.includes('امرأة') || lowerText.includes('بنت') || lowerText.match(/(?<!no\s)(?<!not\s)(?<!do not use\s)(?<!don't use\s)\bfemale\b/i) !== null;
      const hasMaleWord = lowerText.includes('رجالي') || lowerText.includes('رجل') || lowerText.includes('ولد') || lowerText.match(/(?<!no\s)(?<!not\s)(?<!do not use\s)(?<!don't use\s)\bmale\b/i) !== null;
      
      if (hasFemaleWord && !hasMaleWord && !femaleVoices.includes(voiceName)) {
        voiceName = femaleVoices[Math.floor(Math.random() * femaleVoices.length)];
      } else if (hasMaleWord && !hasFemaleWord && !maleVoices.includes(voiceName)) {
        voiceName = maleVoices[Math.floor(Math.random() * maleVoices.length)];
      } else if (lowerText.includes('male') && lowerText.includes('only') && !maleVoices.includes(voiceName)) {
        voiceName = maleVoices[Math.floor(Math.random() * maleVoices.length)];
      } else if (lowerText.includes('female') && lowerText.includes('only') && !femaleVoices.includes(voiceName)) {
        voiceName = femaleVoices[Math.floor(Math.random() * femaleVoices.length)];
      }
    }

    // Build the instruction part for the TTS model
    const cleanedText = text.replace(/\[.*?\]|\(.*?\)/g, '').replace(/[\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    // According to Gemini TTS guidelines, we can prefix with instructions like "Say cheerfully: "
    // We remove newlines and weird chars from instructions to avoid it being spoken loudly if the model gets confused.
    const cleanInstructions = instructions.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '').slice(0, 100);
    const textToSpeak = `Say in this style ${cleanInstructions}, speak briskly with lively, fast-paced commercial marketing energy, snappy and engaging delivery, without slow dragging or sluggish pauses: ${cleanedText}`;

    let config: any = {
      temperature: temperature,
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    };

    const response = await getAI().models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: textToSpeak }] }],
      config
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    const base64Audio = audioPart?.inlineData?.data;
    if (!base64Audio) {
      console.error("Full response when failing (raw): ", response.candidates);
      throw new Error("لم يتم إرجاع بيانات صوتية من الخادم.");
    }

    // Decode base64 audio into a playable Blob URL
    // The Gemini TTS returns raw PCM audio (24000Hz, 1 channel, 16-bit)
    
    const binary = atob(base64Audio);
    const originalBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      originalBytes[i] = binary.charCodeAt(i);
    }
    
    const actualSampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    
    const originalPcm = new Int16Array(originalBytes.buffer, originalBytes.byteOffset, originalBytes.length / 2);
    
    // Resample if pitchAdjustmentFactor is not 1.0 to ensure standard 24000Hz output
    let pcmData = originalPcm;
    if (pitchAdjustmentFactor !== 1.0) {
      const newLength = Math.floor(originalPcm.length / pitchAdjustmentFactor);
      pcmData = new Int16Array(newLength);
      for (let i = 0; i < newLength; i++) {
        const originalIndex = i * pitchAdjustmentFactor;
        const indexFloor = Math.floor(originalIndex);
        const fraction = originalIndex - indexFloor;
        const sample1 = originalPcm[indexFloor];
        const sample2 = indexFloor + 1 < originalPcm.length ? originalPcm[indexFloor + 1] : sample1;
        pcmData[i] = sample1 + fraction * (sample2 - sample1);
      }
    }

    const sampleRate = actualSampleRate;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    
    // Generate WAV from pcmData
    const dataSize = pcmData.length * 2;
    const chunkSize = 36 + dataSize;
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // "RIFF" chunk descriptor
    view.setUint32(0, 0x52494646, false); // 'RIFF'
    view.setUint32(4, chunkSize, true);
    view.setUint32(8, 0x57415645, false); // 'WAVE'
    
    // "fmt " sub-chunk
    view.setUint32(12, 0x666d7420, false); // 'fmt '
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, byteRate, true); // ByteRate
    view.setUint16(32, blockAlign, true); // BlockAlign
    view.setUint16(34, bitsPerSample, true); // BitsPerSample
    
    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // 'data'
    view.setUint32(40, dataSize, true);
    
    const wavBytes = new Uint8Array(44 + dataSize);
    wavBytes.set(new Uint8Array(wavHeader), 0);
    wavBytes.set(new Uint8Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength), 44);
    
    const wavBlob = new Blob([wavBytes], { type: 'audio/wav' });
    const wavUrl = URL.createObjectURL(wavBlob);

    // Encode to MP3 using lamejs
    const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, 128); // 128kbps
    const mp3Data = [];
    
    const sampleBlockSize = 1152; // multiple of 576
    for (let i = 0; i < pcmData.length; i += sampleBlockSize) {
      const sampleChunk = pcmData.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
    const mp3Url = URL.createObjectURL(mp3Blob);

    return { wav: wavUrl, mp3: mp3Url };
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateSpeech(text, instructions, scriptType, voiceGender, voiceCloneFile, retries - 1, delay * 2);
    }
    console.error("Speech generation error:", error);
    throw error;
  }
}

export interface TemplateItem {
  title?: string;
  text: string;
  icon?: string;
}

export interface LandingPageSection {
  sectionName: string;
  template: 'hero' | 'pointers' | 'grid' | 'comparison' | 'faq' | 'reviews' | 'clean-feature' | 'ad-hook' | 'ad-offer' | 'ad-review' | 'ad-comparison' | 'ad-pain-solution';
  title: string;
  subtitle?: string;
  items: TemplateItem[];
  ctaText?: string;
  imagePrompt: string;
}

export async function analyzeProduct(
  images: { base64: string; mimeType: string }[], 
  description: string,
  dialect: string,
  modelType: 'flash' | 'pro' = 'flash',
  designStyle: string = 'tech',
  retries = 3,
  delay = 3000,
  brandKit?: any
): Promise<LandingPageSection[]> {
  
  const imageParts = images.map(img => ({
    inlineData: { data: img.base64, mimeType: img.mimeType }
  }));

  let dialectInstruction = "Standard Arabic";
  if (dialect === 'egyptian') dialectInstruction = "Egyptian Arabic dialect (العامية المصرية - زي: احمي موبايلك، شوف طريقك، هتركب موبايلك بأمان)";
  if (dialect === 'saudi') dialectInstruction = "Saudi Arabic dialect (اللهجة السعودية - زي: احم جوالك، ركب براحة، اطلب الحين)";
  if (dialect === 'emirati') dialectInstruction = "Emirati Arabic dialect (اللهجة الإماراتية الدارجة)";
  if (dialect === 'libyan') dialectInstruction = "Libyan Arabic dialect (اللهجة الليبية الدارجة)";
  if (dialect === 'iraqi') dialectInstruction = "Iraqi Arabic dialect (اللهجة العراقية الدارجة)";
  if (dialect === 'syrian') dialectInstruction = "Syrian Arabic dialect (اللهجة السورية الدارجة)";
  if (dialect === 'palestinian') dialectInstruction = "Palestinian Arabic dialect (اللهجة الفلسطينية الدارجة)";
  if (dialect === 'english') dialectInstruction = "English Language (اللغة الإنجليزية)";

  const isMultiImage = images.length > 1;
  const mappingInstruction = isMultiImage 
    ? `CRITICAL: I have provided ${images.length} images. You MUST generate EXACTLY 10 sections. Cycle through the provided images to inspire the content for each section. Analyze the images and write copy that perfectly describes the specific features or angles shown.`
    : `Generate exactly 10 sections highlighting different features.`;

  const brandKitInstruction = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
  const modelName = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            ...imageParts,
            { text: `Analyze this product from the images and its description: "${description}". 
            Create an image-based landing page (carousel/story format) designed like professional e-commerce ad creatives.
            
            ${mappingInstruction}
            ${brandKitInstruction}
            
            ${typeof brandKitInstruction !== 'undefined' ? brandKitInstruction : ''}\nThe text MUST be in ${dialectInstruction}.
            Keep the text concise, punchy, and suitable for a social media story or carousel (e.g., "تركيب سهل.. بدون تعقيد", "تصميم مقاوم للماء").
            Do not include English text.
            
            Use these templates for the 10 sections:
            1. 'hero': Main hook, big title, subtitle, and a Call to Action (ctaText).
            2. 'clean-feature': Highlight a specific feature from the images. Needs 'title' and optional 'subtitle'.
            3. 'pointers': Technical specs. Title, and 4 items (text + icon).
            4. 'clean-feature': Highlight another specific feature.
            5. 'grid': Multiple uses/benefits. Title, and up to 6 items.
            6. 'comparison': Us vs Them.
            7. 'clean-feature': Highlight another specific feature.
            8. 'faq': Common questions.
            9. 'reviews': Social proof.
            10. 'hero': Final Call to Action.

            For 'clean-feature', keep it simple: just a strong title and subtitle that match the image.
            
            For the 'icon' field, provide a valid lucide-react icon name in lowercase-dash format (e.g. 'shield-check', 'droplets', 'smartphone', 'zap', 'star', 'check', 'x').
            
            For 'imagePrompt', provide a highly descriptive prompt for an AI image generator to place the product in a relevant context for this section. For example: "placed on a sleek modern kitchen counter with natural lighting", "being held by a person jogging outdoors", "clean studio lighting with a dark background". Make it specific to the product and the section's message.
            ${brandKitInstruction}\n${designStyle === 'premium_custom' ? '\nCRITICAL INSTRUCTION FOR IMAGE PROMPTS: The image style MUST be highly professional, customized specifically to the product\'s field and colors. ABSOLUTELY NO FEMALE ELEMENTS OR WOMEN should be included in any of the image prompts. Focus on the product, professional environments, and abstract or masculine/neutral elements.' : ''}` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sectionName: { type: Type.STRING },
              template: { 
                type: Type.STRING, 
                description: "One of: 'hero', 'pointers', 'grid', 'comparison', 'faq', 'reviews', 'clean-feature'" 
              },
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              items: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    text: { type: Type.STRING },
                    icon: { type: Type.STRING }
                  },
                  required: ["text"]
                } 
              },
              ctaText: { type: Type.STRING },
              imagePrompt: { 
                type: Type.STRING,
                description: "Prompt for AI image generator to place the product in a relevant context."
              }
            },
            required: ["sectionName", "template", "title", "items", "imagePrompt"]
          }
        }
      }
    });

    let parsed;
try {
    parsed = JSON.parse(response.text || "[]");
} catch(e) {
    console.error("JSON parse error:", e, "on payload:", response.text || "[]");
    throw e;
}

    return Array.isArray(parsed) ? parsed : (parsed.sections || parsed.items || parsed.creatives || parsed.ads || [parsed]);
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return analyzeProduct(images, description, dialect, modelType, designStyle, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function analyzeAdCreatives(
  images: { base64: string; mimeType: string }[], 
  description: string,
  dialect: string,
  modelType: 'flash' | 'pro' = 'flash',
  designStyle: string = 'tech',
  retries = 3,
  delay = 3000,
  brandKit?: any
): Promise<LandingPageSection[]> {
  
  const imageParts = images.map(img => ({
    inlineData: { data: img.base64, mimeType: img.mimeType }
  }));

  let dialectInstruction = "Standard Arabic";
  if (dialect === 'egyptian') dialectInstruction = "Egyptian Arabic dialect (العامية المصرية)";
  if (dialect === 'saudi') dialectInstruction = "Saudi Arabic dialect (اللهجة السعودية)";
  if (dialect === 'emirati') dialectInstruction = "Emirati Arabic dialect (اللهجة الإماراتية الدارجة)";
  if (dialect === 'libyan') dialectInstruction = "Libyan Arabic dialect (اللهجة الليبية الدارجة)";
  if (dialect === 'iraqi') dialectInstruction = "Iraqi Arabic dialect (اللهجة العراقية الدارجة)";
  if (dialect === 'syrian') dialectInstruction = "Syrian Arabic dialect (اللهجة السورية الدارجة)";
  if (dialect === 'palestinian') dialectInstruction = "Palestinian Arabic dialect (اللهجة الفلسطينية الدارجة)";
  if (dialect === 'english') dialectInstruction = "English Language (اللغة الإنجليزية)";

  const brandKitInstruction = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
  const modelName = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            ...imageParts,
            { text: `Analyze this product from the images and its description: "${description}". 
            Create 10 complete Ad Creative designs based on 10 DIFFERENT advertising angles.
            
            ${brandKitInstruction}
            
            Use the following Copywriting Mindset and AR Strategy to craft the copy:
            1. Deep Buyer Persona: Target their deepest fears, what keeps them up at night, their desires, and pain points.
            2. AR Strategy: Hook (Eye-catching text on visual), Problem, Exaggerating the problem, Solution, Offer + CTA.
            3. Angles: Use different angles like Fear of loss, Desire for better lifestyle, Educational, Us vs Them, Storytelling, Direct Response, etc.
            
            ${typeof brandKitInstruction !== 'undefined' ? brandKitInstruction : ''}\nThe text MUST be in ${dialectInstruction}.
            Keep the text concise, punchy, and suitable for a social media ad creative (Facebook/Instagram/TikTok ads).
            Do not include English text.
            
            Use these templates for the 10 ad creatives:
            - 'ad-hook': Focus on a massive, attention-grabbing hook text. Best for direct response and curiosity angles.
            - 'ad-offer': Focus on a strong offer, discount, or urgency. Best for retargeting and bottom-of-funnel.
            - 'ad-review': Focus on a customer testimonial and 5-star rating. Best for social proof.
            - 'ad-comparison': Us vs Them (Old way vs New way). Best for highlighting unique selling propositions.
            - 'ad-pain-solution': Highlight a specific pain point and how the product solves it. Best for problem-aware audiences.

            For each creative, provide:
            - 'sectionName': The advertising angle used (e.g., "Fear of Loss Angle").
            - 'template': One of the templates above.
            - 'title': The Hook (H) - KEEP IT SHORT AND PUNCHY (Max 5-7 words).
            - 'subtitle': The Problem/Solution (P/S) - KEEP IT SHORT (Max 10-15 words).
            - 'ctaText': The Call to Action (e.g., "اطلب الآن", "احصل على العرض").
            - 'items': For 'ad-comparison', provide 4 items (2 for 'Us', 2 for 'Them').
            - 'imagePrompt': A highly descriptive prompt for an AI image generator to create the background image for this specific ad angle.
            ${brandKitInstruction}\n${designStyle === 'premium_custom' ? '\nCRITICAL INSTRUCTION FOR IMAGE PROMPTS: The image style MUST be highly professional, customized specifically to the product\'s field and colors. ABSOLUTELY NO FEMALE ELEMENTS OR WOMEN should be included in any of the image prompts. Focus on the product, professional environments, and abstract or masculine/neutral elements.' : ''}` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sectionName: { type: Type.STRING },
              template: { 
                type: Type.STRING, 
                description: "One of: 'ad-hook', 'ad-offer', 'ad-review', 'ad-comparison', 'ad-pain-solution'" 
              },
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              ctaText: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    text: { type: Type.STRING },
                    icon: { type: Type.STRING }
                  },
                  required: ["text"]
                }
              }
            },
            required: ["sectionName", "template", "title", "items", "imagePrompt"]
          }
        }
      }
    });
    let parsed;
try {
    parsed = JSON.parse(response.text || "[]");
} catch(e) {
    console.error("JSON parse error:", e, "on payload:", response.text || "[]");
    throw e;
}

    return Array.isArray(parsed) ? parsed : (parsed.sections || parsed.items || parsed.creatives || parsed.ads || [parsed]);
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return analyzeAdCreatives(images, description, dialect, modelType, designStyle, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateScenePrompts(
  description: string, 
  countOrModel: number | 'flash' | 'pro' = 4,
  modelType: 'flash' | 'pro' = 'flash',
  retries = 3,
  delay = 3000,
  brandKit?: any
): Promise<string[]> {
  const count = typeof countOrModel === 'number' ? countOrModel : 4;
  const actualModel = typeof countOrModel === 'string' ? countOrModel : modelType;
  const brandKitInstruction = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
  const modelName = actualModel === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: `Based on this product description: "${description}", generate EXACTLY ${count} distinct, highly descriptive prompts for an AI image generator to place this product in different, visually appealing, and highly interactive contexts. 
      CRITICAL: Do not just change the background. Create dynamic scenes based on the product's features. For example:
      - If it's water-resistant, show water splashing on it or place it in the rain.
      - If it's a kid's toy, show a child actively playing with it.
      - If it's a smart doorbell, show a finger pressing it or a delivery person interacting with it.
      Make the scenes realistic, action-oriented, and diverse.
      Return ONLY a JSON array of ${count} strings. Example: ["water splashing dramatically over the product in a dark moody setting", "a young child happily riding the product in a sunny park", ...]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    let parsed;
try {
    parsed = JSON.parse(response.text || "[]");
} catch(e) {
    console.error("JSON parse error:", e, "on payload:", response.text || "[]");
    throw e;
}

    const list = Array.isArray(parsed) ? parsed : (parsed.prompts || parsed.scenes || parsed.items || [parsed]);
    return list.slice(0, count);
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateScenePrompts(description, count, actualModel, retries - 1, delay * 2, brandKit);
    }
    throw error;
  }
}

export async function generateBackgroundImage(
  referenceImage: { base64: string; mimeType: string },
  prompt: string,
  modelType: 'flash' | 'pro' = 'flash',
  retries = 3,
  delay = 3000,
  brandKit?: any
): Promise<string> {
  const brandKitInstruction = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
  
  // Use dedicated multimodal image generation models
  const modelsToTry = modelType === 'pro'
    ? ['gemini-nano-banana-2.1', 'gemini-3.1-flash-lite-image']
    : ['gemini-3.1-flash-lite-image'];

  let cleanBase64 = referenceImage?.base64 || '';
  if (cleanBase64.includes(',')) {
    cleanBase64 = cleanBase64.split(',')[1];
  }
  let cleanMimeType = referenceImage?.mimeType || 'image/jpeg';
  if (cleanMimeType.includes(';')) {
    cleanMimeType = cleanMimeType.split(';')[0];
  }

  const parts: any[] = [];
  if (cleanBase64) {
    parts.push({
      inlineData: { data: cleanBase64, mimeType: cleanMimeType }
    });
  }
  parts.push({
    text: `Edit this image to place the product in this dynamic scene: ${prompt}. 
    CRITICAL: Integrate the product naturally into the scene. If the prompt asks for water splashing, add realistic water splashes over the product. If it asks for a person holding or using it, generate realistic hands or people interacting with the product. Keep the main product design intact and clearly visible, but allow environmental effects (lighting, shadows, water, dust, hands) to interact with it. Professional product photography, 8k resolution, highly detailed.${brandKitInstruction}`
  });

  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    try {
      const response = await getAI().models.generateContent({
        model: currentModel,
        contents: {
          parts
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          return `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
        }
      }
      
      console.warn(`Model ${currentModel} returned no image inlineData, attempting fallback...`);
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
      const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';

      console.warn(`Model ${currentModel} error:`, error?.message || error);

      if ((isRateLimit || isInternalError) && retries > 0) {
        console.warn(`API error on ${currentModel}. Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return generateBackgroundImage(referenceImage, prompt, modelType, retries - 1, delay * 2, brandKit);
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("لم يتمكن النموذج من توليد الصورة.");
}

export async function generateVideoScript(
  description: string,
  dialect: string,
  duration: string,
  scriptTypes: string[] | { type: string, gender: string }[],
  modelType: 'flash' | 'pro' = 'flash',
  voiceGender: string = 'auto',
  retries = 3,
  delay = 3000,
  autoScriptAngles?: boolean,
  brandKit?: any
): Promise<{type: string, content: string, voiceOverInstructions: string, gender?: string}[]> {
  let dialectInstruction = "Standard Arabic";
  if (dialect === 'egyptian') dialectInstruction = "Egyptian Arabic dialect (العامية المصرية الدارجة)";
  if (dialect === 'saudi') dialectInstruction = "Saudi Arabic dialect (اللهجة السعودية الدارجة)";
  if (dialect === 'emirati') dialectInstruction = "Emirati Arabic dialect (اللهجة الإماراتية الدارجة)";
  if (dialect === 'libyan') dialectInstruction = "Libyan Arabic dialect (اللهجة الليبية الدارجة)";
  if (dialect === 'iraqi') dialectInstruction = "Iraqi Arabic dialect (اللهجة العراقية الدارجة)";
  if (dialect === 'syrian') dialectInstruction = "Syrian Arabic dialect (اللهجة السورية الدارجة)";
  if (dialect === 'palestinian') dialectInstruction = "Palestinian Arabic dialect (اللهجة الفلسطينية الدارجة)";
  if (dialect === 'english') dialectInstruction = "English Language (اللغة الإنجليزية)";


  const genderReq = voiceGender === 'male' ? "CRITICAL: ALL speaker roles/voice-over instructions MUST SPECIFY A MALE VOICE (رجل/ذكر). Do not generate any female speakers. Design the script for a MAN." : 
                    voiceGender === 'female' ? "CRITICAL: ALL speaker roles/voice-over instructions MUST SPECIFY A FEMALE VOICE (أنثى/امرأة). Do not generate any male speakers. Design the script for a WOMAN." : "";
  const wordCountTarget = duration === '15s' ? '30-40 words' : duration === '30s' ? '60-80 words' : '120-150 words';
  const typesString = scriptTypes.map((t, i) => {
    if (typeof t === 'string') return `${i+1}. ${t}`;
    let genderConstraint = "";
    if (t.gender === 'male') genderConstraint = " - CRITICAL: MUST USE MALE VOICE (رجل/ذكر) FOR THIS SCRIPT. Design the script for a MAN.";
    if (t.gender === 'female') genderConstraint = " - CRITICAL: MUST USE FEMALE VOICE (أنثى/امرأة) FOR THIS SCRIPT. Design the script for a WOMAN.";
    return `${i+1}. ${t.type}${genderConstraint}`;
  }).join('\n');

  const brandKitInstruction = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
  const modelName = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";

  const typesPromptSection = autoScriptAngles
    ? `You are an elite marketer and copywriter with 20 years of experience. Fully automate the angle creation and find exactly ${scriptTypes.length} absolutely unique, hyper-targeted, and highly converting video angles tailored specifically to this product. Disregard any standard preset types (like UGC, Direct Response, etc.) and innovate completely outside the box to avoid boring/repetitive scripts.`
    : `You must generate one script for EACH of the following styles/types:
       ${typesString}`;

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: `Write ${scriptTypes.length} highly engaging, high-converting video ad scripts for a product based on this description: "${description}".
      
      CRITICAL REQUIREMENTS:
      ${genderReq}
      1. Language/Dialect: MUST be written entirely in ${dialectInstruction}. No English words unless it's a well-known brand name.
      2. Duration Target: Approximately ${duration} (${wordCountTarget}) PER SCRIPT.
      3. High CTR Hook: The very first 3 seconds of EACH script MUST have a powerful, attention-grabbing hook designed to stop the scroll and achieve a high Click-Through Rate (CTR).
      4. Call to Action (CTA): End EACH script with a strong, clear CTA.
      5. Voice-Over Instructions: For EACH script, provide detailed style instructions for the voice-over artist IN ENGLISH. The instructions MUST include:
         - Dialect & Pronunciation: The exact dialect (${dialectInstruction}) and how to deliver it naturally (e.g., "Authentic street style", "Formal but friendly").
         - Overall Style & Energy: The general vibe (e.g., "High energy, enthusiastic, fast-paced", "Calm, ASMR-like, reassuring").
         - Line-by-Line Tone: Specific tone directions for each section/sentence (e.g., "Hook: Urgent and surprised. Body: Empathetic and warm. CTA: Exciting and demanding").
      6. Emotion/Tone Tags: Throughout the Arabic script, BEFORE EVERY SINGLE SENTENCE OR PHRASE, you MUST add an emotion/tone tag enclosed in square brackets [], in Arabic. For example: [يتحدث بحماس]، [يضحك]، [نبرة هادئة]، [متفاجئ]. These tags help the user understand the delivery but will not be spoken out loud.
      
      CRITICAL FORMATTING REQUIREMENT FOR THE "content" FIELD:
      The "content" field MUST begin with the voice-over instructions formatted exactly like this:
      "Language: Arabic
      Dialect: ${dialectInstruction}
      Voice Description: [English description of the voice, tone, and energy]
      
      [The actual Arabic script begins here...]"
      
      7. No Empty Lines: DO NOT use double line breaks or empty lines. Every line of text must be immediately followed by the next. Do not add blank lines between the Hook, Body, and CTA sections.
      
      ${ADVANCED_COPYWRITING_PRINCIPLES}
      
      ${typesPromptSection}
      
      For each script, format the content clearly with sections for:
      - [Hook / الثواني الأولى]
      - [Body / المحتوى]
      - [CTA / الدعوة لاتخاذ إجراء]
      
      Also include brief visual cues in brackets like [يظهر المنتج] or [المتحدث ينظر للكاميرا] to guide the video editor/creator.
      
      Return ONLY a JSON array of objects.`,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "The script type/style" },
              content: { type: Type.STRING, description: "The formatted script text" },
              voiceOverInstructions: { type: Type.STRING, description: "Voice-over style instructions in English" }
            },
            required: ["type", "content", "voiceOverInstructions"]
          }
        }
      }
    });

    let parsed;
try {
    parsed = JSON.parse(response.text || "[]");
} catch(e) {
    console.error("JSON parse error:", e, "on payload:", response.text || "[]");
    throw e;
}

    let scripts = Array.isArray(parsed) ? parsed : (parsed.scripts || parsed.items || [parsed]);
    
    scripts = scripts.map((script: any, index: number) => {
      const typeInfo = scriptTypes[index];
      const scriptGender = typeInfo && typeof typeInfo === 'object' ? typeInfo.gender : voiceGender;
      return { 
        ...script, 
        content: script.content ? script.content.replace(/(?:\r?\n\s*){2,}/g, '\n').trim() : '',
        gender: scriptGender 
      };
    });

    return scripts;
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateVideoScript(description, dialect, duration, scriptTypes, modelType, voiceGender, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateFbAdCopies(
  description: string,
  dialect: string,
  modelType: 'flash' | 'pro' = 'flash',
  selectedFbAdTypes: string[] = [],
  retries = 3,
  delay = 3000,
  brandKit?: any,
  autoFbAngles?: boolean,
  fbCampaignObjective: string = 'زيادة المبيعات (Sales)'
): Promise<{fbAds: {type: string, hook: string, body: string, cta: string}[], tiktokHeadlines: string[]}> {
  let dialectInstruction = "Standard Arabic";
  if (dialect === 'egyptian') dialectInstruction = "Egyptian Arabic dialect (العامية المصرية الدارجة)";
  if (dialect === 'saudi') dialectInstruction = "Saudi Arabic dialect (اللهجة السعودية الدارجة)";
  if (dialect === 'emirati') dialectInstruction = "Emirati Arabic dialect (اللهجة الإماراتية الدارجة)";
  if (dialect === 'libyan') dialectInstruction = "Libyan Arabic dialect (اللهجة الليبية الدارجة)";
  if (dialect === 'iraqi') dialectInstruction = "Iraqi Arabic dialect (اللهجة العراقية الدارجة)";
  if (dialect === 'syrian') dialectInstruction = "Syrian Arabic dialect (اللهجة السورية الدارجة)";
  if (dialect === 'palestinian') dialectInstruction = "Palestinian Arabic dialect (اللهجة الفلسطينية الدارجة)";
  if (dialect === 'english') dialectInstruction = "English Language (اللغة الإنجليزية)";

  const brandKitInstruction = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
  const modelName = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";
  const targetFbCount = selectedFbAdTypes.length > 0 ? selectedFbAdTypes.length : 3;
  const typesText = autoFbAngles
    ? `You are a master marketer and copywriter with over 20 years of experience. Fully automate the angle creation and find exactly ${targetFbCount} unique, deeply researched, and highly converting angles tailored specifically to this product. Disregard any standard preset types and innovate completely outside the box to avoid boring/repetitive ads.`
    : (selectedFbAdTypes.length > 0 
      ? `Generate exactly ${selectedFbAdTypes.length} Facebook ad copies. Each copy MUST strictly follow one of these exact types in order:\n${selectedFbAdTypes.map((t, i) => `Type ${i+1}: ${t}`).join('\n')}`
      : `Generate exactly 3 different types of ad copies (e.g., Storytelling, Direct Offer, Problem/Solution, Testimonial/Review, Urgency/Scarcity).`);

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: `Write highly engaging Facebook ad copies and TikTok ad headlines for a product based on this description: "${description}".
      
      CRITICAL REQUIREMENTS FOR FACEBOOK ADS:
      1. Campaign Objective: ${fbCampaignObjective}. The ad text, angle, and Call to Action MUST be heavily optimized to achieve this specific objective.
      2. Language/Dialect: MUST be written entirely in ${dialectInstruction}. No English words unless it's a well-known brand name.
      3. Types: ${typesText}
      4. Structure: EACH copy MUST have a clear Hook, Body, and Call to Action (CTA).
      5. Hook: The hook must be scroll-stopping and compelling.
      6. CTA: The CTA must be strong, clear, and tell the user exactly what to do next to fulfill the campaign objective.
      7. Emojis: Use emojis naturally and effectively in the Facebook ad copies.
      ${brandKitInstruction}
      
      ${ADVANCED_COPYWRITING_PRINCIPLES}
      
      CRITICAL REQUIREMENTS FOR TIKTOK HEADLINES:
      1. Language/Dialect: MUST be written entirely in ${dialectInstruction}.
      2. Quantity: Generate exactly 5 headlines.
      3. Length: Each headline MUST NOT exceed 100 characters.
      4. Emojis: DO NOT use any emojis in the TikTok headlines. Absolutely NO emojis.
      5. Style: Catchy, punchy, and suitable for TikTok text overlays or captions.
      
      Return ONLY a JSON object containing 'fbAds' array and 'tiktokHeadlines' array.`,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fbAds: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "The ad copy type/style (e.g., Storytelling, Direct Offer)" },
                  hook: { type: Type.STRING, description: "The scroll-stopping hook" },
                  body: { type: Type.STRING, description: "The main body of the ad copy" },
                  cta: { type: Type.STRING, description: "The Call to Action" }
                },
                required: ["type", "hook", "body", "cta"]
              }
            },
            tiktokHeadlines: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "A TikTok ad headline (max 100 chars, NO emojis)"
              }
            }
          },
          required: ["fbAds", "tiktokHeadlines"]
        }
      }
    });

    try {
    return JSON.parse(response.text || "{\"fbAds\": [], \"tiktokHeadlines\": []}");
} catch(e) {
    console.error("JSON parse error:", e, "on payload:", response.text || "{\"fbAds\": [], \"tiktokHeadlines\": []}");
    throw e;
}
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateFbAdCopies(description, dialect, modelType, selectedFbAdTypes, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateFunnelCopy(
  description: string,
  dialect: string,
  modelType: 'flash' | 'pro' = 'flash',
  retries = 3,
  delay = 3000,
  brandKit?: any,
  copyLength: 'auto' | 'short' | 'long' = 'auto'
): Promise<string> {
  let dialectInstruction = "Standard Arabic";
  if (dialect === 'egyptian') dialectInstruction = "Egyptian Arabic dialect (العامية المصرية الدارجة)";
  if (dialect === 'saudi') dialectInstruction = "Saudi Arabic dialect (اللهجة السعودية الدارجة)";
  if (dialect === 'emirati') dialectInstruction = "Emirati Arabic dialect (اللهجة الإماراتية الدارجة)";
  if (dialect === 'libyan') dialectInstruction = "Libyan Arabic dialect (اللهجة الليبية الدارجة)";
  if (dialect === 'iraqi') dialectInstruction = "Iraqi Arabic dialect (اللهجة العراقية الدارجة)";
  if (dialect === 'syrian') dialectInstruction = "Syrian Arabic dialect (اللهجة السورية الدارجة)";
  if (dialect === 'palestinian') dialectInstruction = "Palestinian Arabic dialect (اللهجة الفلسطينية الدارجة)";
  if (dialect === 'english') dialectInstruction = "English Language (اللغة الإنجليزية)";

  const brandKitInstruction = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
  const modelName = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";

  let lengthInstruction = "Use the optimal length for maximizing conversion rate.";
  if (copyLength === 'short') lengthInstruction = "Make the copy concise, punchy, and relatively SHORT. Focus on high-impact rapid persuasion.";
  if (copyLength === 'long') lengthInstruction = "Make the copy LONG-FORM. Provide an extensive, deeply persuasive funnel with comprehensive storytelling, detailed benefits, and thorough objection handling.";

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: `You are an elite, world-class copywriter and conversion rate optimization (CRO) expert. Write a complete, highly-converting product page (funnel) copy based on this product description: "${description}".
      
      CRITICAL REQUIREMENTS:
      1. Language/Dialect: MUST be written entirely in ${dialectInstruction}.
      2. Length Instruction: ${lengthInstruction}
      3. AI-Driven Automation: DO NOT restrict yourself to traditional templates like AIDA. Use your expertise to automate the copy, choosing whatever angle, psychological triggers, and structural methodology you believe will yield the HIGHEST CONVERSION RATE for this specific product. Ensure the copy is designed to achieve the maximum Conversion Rate Optimization (CRO).
      4. Highlight Value: You MUST explicitly identify, list, and compellingly phrase all USPs (Unique Selling Propositions) and UVPs (Unique Value Propositions) of the product.
      5. Format: Output ONLY the final copy. Divide it into clear, impactful sections using clear text headers without any brackets or markdown.
      6. CLEAN TEXT ONLY: ABSOLUTELY NO MARKDOWN STYLING ALLOWED. DO NOT use asterisks (**), hashes (#), underscores, or any markdown formatting. The text must be completely plain and clean, ready to be copied directly without any special symbols like ** or *. Do not use markdown bullet points either, just use a normal dash "-" or numbers.
      7. NO META-TEXT: Do not include any advice, instructions, or conversational filler. The output must be a cohesive block of text ready to be pasted directly into a page builder.
      
      ${ADVANCED_COPYWRITING_PRINCIPLES}
      ${brandKitInstruction}`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || '';
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateFunnelCopy(description, dialect, modelType, retries - 1, delay * 2, brandKit, copyLength);
    }
    throw error;
  }
}

export async function generateVideoScenes(
  description: string,
  dialect: string,
  mode: 'consecutive' | 'hooks' | 'frames' | 'single_15s' | 'consecutive_15s' = 'consecutive',
  duration: string = '40s',
  modelType: 'flash' | 'pro' = 'flash',
  voiceGender: string = 'auto',
  retries = 3,
  delay = 3000,
  brandKit?: any
): Promise<{ sceneNumber: number, duration: string, prompt: string, script: string }[]> {
  let dialectInstruction = "Standard Arabic";
  if (dialect === 'egyptian') dialectInstruction = "Egyptian Arabic dialect (العامية المصرية الدارجة)";
  if (dialect === 'saudi') dialectInstruction = "Saudi Arabic dialect (اللهجة السعودية الدارجة)";
  if (dialect === 'emirati') dialectInstruction = "Emirati Arabic dialect (اللهجة الإماراتية الدارجة)";
  if (dialect === 'libyan') dialectInstruction = "Libyan Arabic dialect (اللهجة الليبية الدارجة)";
  if (dialect === 'iraqi') dialectInstruction = "Iraqi Arabic dialect (اللهجة العراقية الدارجة)";
  if (dialect === 'syrian') dialectInstruction = "Syrian Arabic dialect (اللهجة السورية الدارجة)";
  if (dialect === 'palestinian') dialectInstruction = "Palestinian Arabic dialect (اللهجة الفلسطينية الدارجة)";
  if (dialect === 'english') dialectInstruction = "English Language (اللغة الإنجليزية)";

  const brandKitInstruction = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
  const modelName = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";

  let totalDurationSec = 40;
  if (duration === '15s') totalDurationSec = 15;
  if (duration === '30s') totalDurationSec = 30;
  if (duration === '45s') totalDurationSec = 45;
  if (duration === '60s') totalDurationSec = 60;
  
  let scenesCount = Math.max(3, Math.floor(totalDurationSec / 8));
  let timePerScene = Math.floor(totalDurationSec / scenesCount);

  if (mode === 'single_15s') {
    scenesCount = 1;
    timePerScene = 15;
  } else if (mode === 'consecutive_15s') {
    timePerScene = 15;
    scenesCount = Math.max(1, Math.floor(totalDurationSec / 15));
  }

  const genderReq = voiceGender === 'male' ? "CRITICAL: ALL speaker roles/voice-over instructions MUST SPECIFY A MALE VOICE (رجل/ذكر). Do not generate any female speakers. Design the script for a MAN." : 
                    voiceGender === 'female' ? "CRITICAL: ALL speaker roles/voice-over instructions MUST SPECIFY A FEMALE VOICE (أنثى/امرأة). Do not generate any male speakers. Design the script for a WOMAN." : "";
  const modeInstruction = mode === 'hooks' 
    ? `Create ${scenesCount} DIFFERENT "Hook" scenes (intros) for a video ad. Each scene should be a standalone powerful opening designed to stop the scroll. They are NOT consecutive; they are ${scenesCount} different options for the first ${timePerScene} seconds of an ad.`
    : mode === 'frames'
    ? `Create a ${totalDurationSec}-second video ad script divided into exactly ${scenesCount} consecutive scenes. The 'prompt' MUST be a highly detailed IMAGE GENERATION PROMPT (e.g. Midjourney v6 style) to create a static initial frame for Veo. Do not describe camera movement, only the static visual composition.`
    : mode === 'single_15s'
    ? `Create EXACTLY 1 single complete, continuous 15-second video scene. The visual 'prompt' MUST describe one complete continuous 15-second shot/action for Veo 3 / Flow, and the 'script' MUST be a complete 15-second voiceover or spoken dialogue.`
    : mode === 'consecutive_15s'
    ? `Create a video ad script divided into exactly ${scenesCount} consecutive scenes, where EACH individual scene is exactly 15 seconds long (total duration ${scenesCount * 15} seconds). Each scene must have a 15-second visual prompt and a 15-second voiceover script.`
    : `Create a ${totalDurationSec}-second video ad script divided into exactly ${scenesCount} consecutive scenes. Each scene follows the previous one to tell a complete story.`;

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: `You are an expert video commercial director and copywriter.
      Based on this product description: "${description}", generate video scenes.
      
      CRITICAL REQUIREMENTS:
      ${genderReq}
      1. ${modeInstruction}
      2. It MUST be divided into exactly ${scenesCount} scenes.
      3. The text/spoken dialogue for each scene MUST perfectly fit within its designated time duration (${timePerScene} seconds). People speak at roughly 2-3 words per second. Keep scripts for each scene concise enough to fit this limit.
      4. Target AI Video Generator: "Flow" software using the "Veo 3" model.
      5. ${mode === 'frames' ? 'The "prompt" for each scene must be a highly detailed static IMAGE GENERATION COMMAND in English, optimized for creating the initial visual frame. Describe lighting, composition, and subject, but NO camera movement.' : 'The "prompt" for each scene must be a highly detailed visual command in English, optimized for Veo 3, describing the action, lighting, camera movement, and subject (e.g., UGC actor or product focus).'}
      6. The "script" for each scene is the voiceover or spoken dialogue. It MUST be written in ${dialectInstruction}.
      
      CRITICAL FORMATTING REQUIREMENT FOR THE "script" FIELD:
      The "script" field MUST begin with voice-over instructions formatted exactly like this:
      "Language: Arabic
      Dialect: ${dialectInstruction}
      Voice Description: [English description of the voice, tone, and energy for this scene]
      
      [The actual Arabic script begins here...]"
      
      Return the output as a JSON array of objects, where each object represents a scene and has the following keys:
      - "sceneNumber": number (1 to ${scenesCount})
      - "duration": string (e.g. "${timePerScene} seconds")
      - "prompt": string (The English visual prompt for Veo 3)
      - "script": string (The Arabic spoken script for this scene)`,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              sceneNumber: { type: "INTEGER" },
              duration: { type: "STRING" },
              prompt: { type: "STRING" },
              script: { type: "STRING" }
            },
            required: ["sceneNumber", "duration", "prompt", "script"]
          }
        }
      }
    });

    try {
    return JSON.parse(response.text || "[]");
} catch(e) {
    console.error("JSON parse error:", e, "on payload:", response.text || "[]");
    throw e;
}
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateVideoScenes(description, dialect, mode, duration, modelType, voiceGender, retries - 1, delay * 2, brandKit);
    }
    throw error;
  }
}

export async function extractWinnerVideoDetails(
  videoBase64: string,
  videoMimeType: string,
  modelType: 'flash' | 'pro' = 'flash',
  brandKit?: any
): Promise<string> {
  const brandKitInstruction = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
  const modelName = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: [
        {
          inlineData: {
            data: videoBase64,
            mimeType: videoMimeType
          }
        },
        {
          text: `You are an expert video analyst. Watch this video ad and extract its FULL spoken script (dialogue) exactly as spoken, and include brief visual cues in brackets [like this] where important.
          
          Provide the extracted script in the original language of the video (if Arabic, provide the Arabic text). Do NOT add extra explanations, JUST return the raw script.`
        }
      ],
      config: {
        temperature: 0.2
      }
    });

    return response.text || "لم يتم العثور على سكريبت واضح.";
  } catch (error: any) {
    console.error("Failed to extract video details:", error);
    throw new Error('فشل في استخراج سكريبت الفيديو. يرجى المحاولة مرة أخرى.');
  }
}

export async function generateCreativeImagePrompts(
  description: string,
  dialect: string,
  count: number,
  mode: 'standalone' | 'carousel' | 'landing_page' = 'standalone',
  landingSections: string[] = [],
  fontFamily: string = 'font-cairo',
  colorTheme: string = '',
  modelType: 'flash' | 'pro' = 'flash',
  retries = 3,
  delay = 3000,
  brandKit?: any
): Promise<{ 
  concept: string, 
  visualStyle: string,
  layout: { background: string, productPlacement: string, extraElements: string[] },
  textOverlay: { headline: string, subheadline: string, callToAction: string },
  aiPrompt: string 
}[]> {
  let dialectInstruction = "Standard Arabic";
  if (dialect === 'egyptian') dialectInstruction = "Egyptian Arabic dialect (العامية المصرية الدارجة)";
  if (dialect === 'saudi') dialectInstruction = "Saudi Arabic dialect (اللهجة السعودية الدارجة)";
  if (dialect === 'emirati') dialectInstruction = "Emirati Arabic dialect (اللهجة الإماراتية الدارجة)";
  if (dialect === 'libyan') dialectInstruction = "Libyan Arabic dialect (اللهجة الليبية الدارجة)";
  if (dialect === 'iraqi') dialectInstruction = "Iraqi Arabic dialect (اللهجة العراقية الدارجة)";
  if (dialect === 'syrian') dialectInstruction = "Syrian Arabic dialect (اللهجة السورية الدارجة)";
  if (dialect === 'palestinian') dialectInstruction = "Palestinian Arabic dialect (اللهجة الفلسطينية الدارجة)";
  if (dialect === 'english') dialectInstruction = "English Language (اللغة الإنجليزية)";

  let fontName = "Cairo";
  if (fontFamily === 'font-tajawal') fontName = "Tajawal";
  if (fontFamily === 'font-almarai') fontName = "Almarai";
  if (fontFamily === 'font-readex') fontName = "Readex Pro";
  if (fontFamily === 'font-ibm') fontName = "IBM Plex Sans Arabic";
  if (fontFamily === 'font-ge') fontName = "GE SS Two";
  if (fontFamily === 'font-din') fontName = "DIN Next Arabic";

  const brandKitInstruction = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
  const modelName = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";

  const colorThemeInstruction = colorTheme ? `\nVERY IMPORTANT COLOR/THEME CONSTRAINT: The user explicitly requested the following color scheme or visual vibe: "${colorTheme}". YOU MUST strictly enforce this theme across all designs. Incorporate this deeply into the visualStyle description and especially the English aiPrompt.` : '';

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: [
        {
          text: `You are a world-class performance marketing director with 20 years of experience in direct-response advertising and high-converting visual creatives.

          Your task is to generate EXACTLY ${count} highly detailed ad creative briefs based on the following product description: "${description}".
          The user needs a FULL breakdown of the design layout, elements, text, and an incredibly rich AI prompt that merges ALL these details to generate the final design.
          ${brandKitInstruction}
          ${colorThemeInstruction}

          CRITICAL RULES:
          1. ALL fields EXCEPT "aiPrompt" MUST be written in ${dialectInstruction}.
          2. NEVER add "Free Shipping" / "شحن مجاني" or any shipping offers to the textOverlay, concept, or any element UNLESS the user explicitly mentions it in the product description.
          3. Field Breakdown:
             - "concept": (Arabic) Explain the sales angle, why it converts, and the psychological trigger it targets. ${mode === 'landing_page' ? 'In landing page mode, this should represent the specific funnel section (e.g., Header, Reviews, Features, FAQ, etc.).' : ''}
             - "visualStyle": (Arabic) Explain the color palette, lighting, mood, and aesthetic (e.g., contrast colors to make it pop, dark mode for luxury).
             - "layout.background": (Arabic) Describe the background setting.
             - "layout.productPlacement": (Arabic) Describe EXACTLY where the product should be placed (e.g., center, slightly to the right, floating).
             - "layout.extraElements": (Arabic) Array of other elements to add (e.g., 5-star rating badge, discount tag, trust shields). STRICT RULE: NEVER add "Free Shipping" / "شحن مجاني" unless the user's description explicitly mentions it.
             - "textOverlay.headline": (Arabic) The main hook/headline to write on the design (short, punchy).
             - "textOverlay.subheadline": (Arabic) A supporting sub-headline.
             - "textOverlay.callToAction": (Arabic) The button text or CTA to put on the design (e.g., اطلب الآن, تسوق اليوم).
             - "aiPrompt": (English) A comprehensive, incredibly detailed Midjourney/DALL-E prompt that MUST encapsulate ALL the beautiful design details mentioned above! It must intensely describe the visual style, lighting, exact color palette, product placement, background, atmosphere, extra elements, and compositional layout. In the prompt, instruct the image generation model to stylize any text elements or typographic design using the visually similar font "${fontName}". ${mode !== 'standalone' ? 'Make sure the exact same color hex codes or specific color names are explicitly repeated in EVERY aiPrompt across all the generated images to guarantee visual continuity.' : ''} Make it an absolute master-level text-to-image prompt.
          
          ${mode === 'carousel' 
            ? 'The designs MUST be part of a highly cohesive, continuous carousel (muti-image post). Each image should naturally progress the story/angle from the previous one, maintaining exactly the same character/product vibes, a unified color palette, and identical structural UI elements across all cards, but changing scenes or copy to drive the final CTA on the last card.'
            : mode === 'landing_page'
            ? `The designs MUST together form a highly professional and high-converting landing page funnel. The specific sections requested are: ${landingSections.length > 0 ? landingSections.join(', ') : 'Headers, Features, Benefits, Social Proof, and CTA'}. EXTREMELY IMPORTANT: Every single design across these sections MUST share the exact same unified color palette, lighting style, shapes, and structural elements (like badges/buttons) to look like they belong to the exact same website. Do NOT change colors randomly between sections.`
            : 'Make every design completely different in angle (e.g., one lifestyle, one studio/minimal, one problem/solution, one unboxing style, one urgent offer).'
          }`
        }
      ],
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              concept: { type: "STRING" },
              visualStyle: { type: "STRING" },
              layout: {
                type: "OBJECT",
                properties: {
                  background: { type: "STRING" },
                  productPlacement: { type: "STRING" },
                  extraElements: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                  }
                },
                required: ["background", "productPlacement", "extraElements"]
              },
              textOverlay: {
                type: "OBJECT",
                properties: {
                  headline: { type: "STRING" },
                  subheadline: { type: "STRING" },
                  callToAction: { type: "STRING" }
                },
                required: ["headline", "subheadline", "callToAction"]
              },
              aiPrompt: { type: "STRING" }
            },
            required: ["concept", "visualStyle", "layout", "textOverlay", "aiPrompt"]
          }
        }
      }
    });

    try {
    return JSON.parse(response.text || "[]");
} catch(e) {
    console.error("JSON parse error:", e, "on payload:", response.text || "[]");
    throw e;
}
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateCreativeImagePrompts(description, dialect, count, mode, landingSections, fontFamily, colorTheme, modelType, retries - 1, delay * 2, brandKit);
    }
    throw error;
  }
}

export async function generateWinnerAngleScripts(
  extractedScript: string,
  description: string,
  dialect: string,
  duration: string,
  modelType: 'flash' | 'pro' = 'flash',
  voiceGender: string = 'auto',
  retries = 3,
  delay = 3000,
  brandKit?: any
): Promise<{ type: string, content: string, voiceOverInstructions: string }[]> {
  let dialectInstruction = "Standard Arabic";
  if (dialect === 'egyptian') dialectInstruction = "Egyptian Arabic dialect (العامية المصرية الدارجة)";
  if (dialect === 'saudi') dialectInstruction = "Saudi Arabic dialect (اللهجة السعودية الدارجة)";
  if (dialect === 'emirati') dialectInstruction = "Emirati Arabic dialect (اللهجة الإماراتية الدارجة)";
  if (dialect === 'libyan') dialectInstruction = "Libyan Arabic dialect (اللهجة الليبية الدارجة)";
  if (dialect === 'iraqi') dialectInstruction = "Iraqi Arabic dialect (اللهجة العراقية الدارجة)";
  if (dialect === 'syrian') dialectInstruction = "Syrian Arabic dialect (اللهجة السورية الدارجة)";
  if (dialect === 'palestinian') dialectInstruction = "Palestinian Arabic dialect (اللهجة الفلسطينية الدارجة)";
  if (dialect === 'english') dialectInstruction = "English Language (اللغة الإنجليزية)";

  const brandKitInstruction = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
  const modelName = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";

  const genderReq = voiceGender === 'male' ? "CRITICAL: ALL speaker roles/voice-over instructions MUST SPECIFY A MALE VOICE (رجل/ذكر). Do not generate any female speakers. Design the script for a MAN." : 
                    voiceGender === 'female' ? "CRITICAL: ALL speaker roles/voice-over instructions MUST SPECIFY A FEMALE VOICE (أنثى/امرأة). Do not generate any male speakers. Design the script for a WOMAN." : "";

  const taskInstructions = description ? 
`Your task is to REPLICATE a "Winning Angle" video ad for a NEW product. You must dissect the exact psychological trigger, the specific hook, and the situational context of the original ad, and apply it DIRECTLY to the new product. Do NOT create a generic ad. Do NOT lose the original creative spark or situation.
          
--- ORIGINAL WINNING VIDEO SCRIPT ---
${extractedScript}
----------------------------------

--- NEW PRODUCT TO ADVERTISE ---
${description}
----------------------------------

INSTRUCTIONS:
First, identify the exact situational hook, the psychological trigger, the ad angle, and the style of the original script.
Then, applying exactly that SAME situation, hook, and winning formula to the NEW product, generate 3 powerful video ad script variations. You MUST STRICTLY keep the EXACT SAME situational hook and context as the winning script. If the original hook was about "the power going out," your new scripts MUST literally start with a scenario where the power goes out, simply substituting how the NEW product fits into that identical situation. Do NOT invent a new hook.

${ADVANCED_COPYWRITING_PRINCIPLES}` 
: 
`Your task is to REPLICATE and ENHANCE a "Winning Angle" video ad. You must dissect the exact psychological trigger, the specific hook, and the situational context of the original ad, and create 3 fresh variations that maintain the winning formula.

--- ORIGINAL WINNING VIDEO SCRIPT ---
${extractedScript}
----------------------------------

INSTRUCTIONS:
First, identify the exact situational hook, the psychological trigger, the ad angle, and the style of the original script.
Then, keeping exactly that SAME situation, hook, and winning formula, generate 3 fresh and powerful video ad script variations that feel unique but rely on the same proven structure.

${ADVANCED_COPYWRITING_PRINCIPLES}`;

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: [
        {
          text: `You are an expert video ad copywriter and creative director.
          ${taskInstructions}
          
          CRITICAL REQUIREMENTS:
          ${genderReq}
          1. The scripts MUST be written in ${dialectInstruction}.
          2. The target duration for each script is ${duration}.
          3. Generate exactly 3 script variations.
          4. Emotion/Tone Tags: Throughout the Arabic script dialogue, BEFORE EVERY SINGLE SENTENCE OR PHRASE, you MUST add an emotion/tone tag enclosed in square brackets [], in Arabic. For example: [يتحدث بحماس]، [يضحك]، [نبرة هادئة]، [متفاجئ]. These tags help the user understand the delivery but will not be spoken out loud.
          5. No Empty Lines: DO NOT use double line breaks or empty lines in the content. Every line of text must be immediately followed by the next. Do not add blank lines between the Hook, Body, and CTA sections.
          
          CRITICAL FORMATTING REQUIREMENT FOR THE "content" FIELD:
          The "content" field MUST contain the Arabic dialogue/visuals side-by-side or clearly separated.
          The "voiceOverInstructions" field MUST contain an English description of the voice, tone, and energy for this script.
          
          Return the output as a JSON array of objects, where each object has:
          - "type": string (The name of the detected angle/style for this variation)
          - "content": string (The full script including the Arabic dialogue/visuals)
          - "voiceOverInstructions": string (Voice-over style instructions in English)`
        }
      ],
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              type: { type: "STRING" },
              content: { type: "STRING" },
              voiceOverInstructions: { type: "STRING" }
            },
            required: ["type", "content", "voiceOverInstructions"]
          }
        }
      }
    });

    try {
      const parsed = JSON.parse(response.text || "[]");
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          ...item,
          content: item.content ? item.content.replace(/(?:\r?\n\s*){2,}/g, '\n').trim() : ''
        }));
      }
      return parsed;
    } catch(e) {
      console.error("JSON parse error:", e, "on payload:", response.text || "[]");
      throw e;
    }
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateWinnerAngleScripts(extractedScript, description, dialect, duration, modelType, voiceGender, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateTextOnVisual(
  description: string,
  dialect: string,
  count: number,
  mode: 'sequential' | 'high_ctr_fixed' = 'sequential',
  modelType: 'flash' | 'pro' = 'flash',
  retries = 3,
  delay = 3000,
  brandKit?: any
): Promise<string[]> {
  let dialectInstruction = "Standard Arabic";
  if (dialect === 'egyptian') dialectInstruction = "Egyptian Arabic dialect (العامية المصرية الدارجة)";
  if (dialect === 'saudi') dialectInstruction = "Saudi Arabic dialect (اللهجة السعودية الدارجة)";
  if (dialect === 'emirati') dialectInstruction = "Emirati Arabic dialect (اللهجة الإماراتية الدارجة)";
  if (dialect === 'libyan') dialectInstruction = "Libyan Arabic dialect (اللهجة الليبية الدارجة)";
  if (dialect === 'iraqi') dialectInstruction = "Iraqi Arabic dialect (اللهجة العراقية الدارجة)";
  if (dialect === 'syrian') dialectInstruction = "Syrian Arabic dialect (اللهجة السورية الدارجة)";
  if (dialect === 'palestinian') dialectInstruction = "Palestinian Arabic dialect (اللهجة الفلسطينية الدارجة)";
  if (dialect === 'english') dialectInstruction = "English Language (اللغة الإنجليزية)";

  const brandKitInstruction = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
  const modelName = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";

  const sequentialPrompt = `Create EXACTLY ${count} short, punchy, persuasive sentences to be placed consecutively on the video as text overlays. 
            These sentences should flow logically if read one after the other, and they should be designed to increase the CTR (Click-Through Rate).`;

  const highCtrFixedPrompt = `Create EXACTLY ${count} high-converting, high-CTR fixed sentences designed to persuade the customer to purchase. 
            These should be short, punchy, and highly persuasive statements that can remain visible on the screen or be used as main overlays. 
            Focus on conversion, benefits, and call to action.`;

  const prompt = mode === 'sequential' ? sequentialPrompt : highCtrFixedPrompt;

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [{
            text: `You are an expert copywriter and video editor. The user wants to add "Text on Visual" to their short-form video ad.
            
Product Description: ${description}
Language/Dialect: ${dialectInstruction}

Mode: ${mode === 'sequential' ? 'Sequential Sentences' : 'Fixed High-Converting Sentences'}

${prompt}
Each sentence must be highly convincing, short, and easy to read quickly on screen. Do not include quotes or numbering in the output strings themselves.

Return ONLY a valid JSON array of ${count} strings, e.g. ["Sentence 1", "Sentence 2"]. Nothing else.`
          }]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const output = response.text || "[]";
    const result = JSON.parse(output);
    return Array.isArray(result) ? result : [];
  } catch (error: any) {
    console.error("Text on Visual generation failed:", error);
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateTextOnVisual(description, dialect, count, mode, modelType, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateProductBrainReport(
  productName: string,
  productDescription: string,
  targetCountry: string,
  price: string,
  brandInfo?: string,
  audienceInfo?: string,
  competitorLinks?: string,
  modelType: 'flash' | 'pro' = 'flash',
  retries = 3,
  delay = 2000,
  brandKit?: any
): Promise<string> {
  try {
    const model = modelType === 'pro' ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash';
    
    // Prepare the input text replacing empty fields
    const brandKitPrompt = typeof brandKit !== 'undefined' ? getBrandKitInstruction(brandKit) : '';
    const inputs = `
PRODUCT NAME: ${productName}
PRODUCT LINK OR DESCRIPTION: ${productDescription}
TARGET COUNTRY: ${targetCountry}
PRICE: ${price}
BRAND INFORMATION: ${brandInfo || 'Not provided'}\n${brandKitPrompt}
AUDIENCE INFORMATION: ${audienceInfo || 'Not provided'}
COMPETITOR LINKS: ${competitorLinks || 'Not provided'}
`;

    const promptText = `
You are an elite Product Intelligence & Marketing Strategy AI system.
Your role is to deeply understand the product like a world-class marketer and strategist.

Build a COMPLETE, highly organized, and professional Product Intelligence Report in standard Markdown format.

━━━━━━━━━━━━━━━━━━
📊 بيانات المدخلات (INPUT DATA)
━━━━━━━━━━━━━━━━━━
${inputs}

━━━━━━━━━━━━━━━━━━
⚙️ التوجيهات الاستراتيجية
━━━━━━━━━━━━━━━━━━
- استخدم عناوين واضحة ومنظمة (Markdown #, ##, ###).
- استخدم القوائم النقطية والخط العريض (Bold) للتركيز على النقاط الهامة.
- تحدث كخبير استراتيجي يعد عرضاً تقديمياً فاخراً لبراند عالمي.
- ركز على الدوافع العاطفية، محفزات الشراء، والمزايا التنافسية الخفية.
- التنسيق يجب أن يكون مريحاً للعين ومنظماً جداً بعناوين مرقمة.

${ADVANCED_COPYWRITING_PRINCIPLES}

━━━━━━━━━━━━━━━━━━
📝 هيكل التقرير المطلوب (Markdown)
━━━━━━━━━━━━━━━━━━

# 🧠 تقرير ذكاء المنتج الاستراتيجي: ${productName}

## 1️⃣ الملخص التنفيذي الاستراتيجي (Strategic Executive Summary)
- **البيان الجوهري:** ما هي المشكلة الحقيقية التي يحلها المنتج بعمق؟
- **التحول الجذري:** حالة العميل "قبل" استخدام المنتج vs "بعده".
- **محرك الهوية:** ماذا يقول امتلاك هذا المنتج عن شخصية العميل؟

## 2️⃣ التشريح العميق للمنتج (Deep Product Breakdown)
- **الآليات الخفية (The Magic):** كيف يعمل المنتج فعلياً ليحقق نتائجه المذهلة؟
- **هندسة التجربة:** التجربة الحسية والعاطفية الكاملة عند الاستخدام.

## 3️⃣ مصفوفة الألم (The Problem Matrix)
- **الألم الظاهري:** الإزعاج اليومي الملحظ.
- **الألم النفسي الخفي:** الصراع الداخلي والقلق الذي يسببه المشكل.
- **ألم المكانة والاجتماع:** كيف يؤثر المشكل على نظرة الآخرين للعميل أو نظرته لنفسه.

## 4️⃣ شخصية المشتري المثالي (Perfect Buyer Persona)
- **الخصائص النفسية والسلوكية:** من هو هذا الشخص وما الذي يحركه فعلياً؟
- **الإحباطات اليومية:** مواقف حقيقية من "يوم في حياته" يظهر فيها احتياجه للمنتج.
- **الطموحات الكبرى:** ما الذي يطمح للوصول إليه حقاً؟

## 5️⃣ التموضع في السوق والآلية الفريدة (Market Positioning)
- **الفجوة المتاحة:** ما الذي يفتقده المنافسون وتغطيه أنت؟
- **الآلية الفريدة (USP):** السبب الوحيد والمنطقي لاختيارك أنت دون غيرك.
- **زاوية "ضد السوق":** لماذا تفشل البدائل الحالية في إرضاء العميل؟

## 6️⃣ معالجة الاعتراضات وبناء الثقة (Objection Handling)
- **الاعتراضات المنطقية:** (السعر، الجودة، وقت التوصيل) وكيفية الرد عليها.
- **التردد العاطفي:** "هل سينجح الأمر معي أنا تحديداً؟"
- **محفزات الثقة:** ما هي الإثباتات التي يحتاج العميل رؤيتها الآن؟

## 7️⃣ الاستراتيجية الإبداعية والإعلانية (Creative & Ad Strategy)
- **زوايا البيع الرابحة:** 3 زوايا إبداعية فريدة لبيع المنتج.
- **أفكار الهوك (Viral Hooks):** مفاهيم تخطف الأنظار في أول 3 ثوانٍ.
- **محفزات التحويل:** لماذا يجب عليهم الشراء "الآن" وليس غداً؟

## 8️⃣ الاستراتيجية الرابحة في جملة واحدة
> **نحن نساعد [الجمهور] الذين يعانون من [المشكلة] في تحقيق [التحول/النتيجة] من خلال [الآلية الفريدة الخاصة بنا].**

اكتب التقرير بالكامل باللغة العربية الفصحى (أو اللهجة البيضاء المفهومة) بأسلوب تسويقي احترافي جداً. تأكد من تنظيم التقرير بشكل مثالي باستخدام Markdown.
ملاحظة هامة جداً: يُمنع منعاً باتاً اقتراح عروض الشحن المجاني (Free Shipping) أو الباقات والعروض المجمعة (Bundles). ركز على قيمة المنتج نفسه وجودته وخصائصه.
`;

    const response = await getAI().models.generateContent({
      model: model,
      contents: promptText,
    });

    return response.text || "";
  } catch (error: any) {
    console.error("Product Brain generation failed:", error);
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.message?.includes('Internal error') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error (${isRateLimit ? 'Rate Limit' : 'Internal Error'}). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateProductBrainReport(productName, productDescription, targetCountry, price, brandInfo, audienceInfo, competitorLinks, modelType, retries - 1, delay * 2, brandKit);
    }
    throw error;
  }
}

import { buildBrandKitPrompt } from '../utils/brandKit';

export async function generateLandingPageHTML(
  productName: string,
  description: string,
  price: string,
  oldPrice: string,
  checkoutLink: string,
  primaryColor: string,
  images: string[],
  videoLinks: string[],
  sections: string[],
  copyLength: 'long' | 'medium',
  ctaAnimation: boolean,
  brandKit?: any,
  languageDialect: string = '',
  colorsTheme: string = '',
  previousHtml: string = '',
  editRequest: string = '',
  platformType: 'easyorders' | 'generic' = 'easyorders',
  generationModelType: 'template' | 'template-casual' | 'free' | 'free-anti-slop' = 'template',
  includeReviews: boolean = true,
  reviewsText: string = '',
  aiModelChoice: 'flash' | 'pro' = 'pro',
  retries = 3,
  delay = 3000
): Promise<string> {
  try {
    const selectedAiModel = aiModelChoice === 'pro' ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash';
    
    let basePrompt = `أنت خبير CRO, Conversion Copywriting, UX Writing, Landing Page Strategy, وVisual Hierarchy.`;

    if (brandKit) {
       basePrompt += "\n\n" + buildBrandKitPrompt(brandKit) + "\n[CRITICAL DESIGN NOTE: CREATE A UNIQUE, BRAND-SPECIFIC HTML LAYOUT BASED ON THE INDUSTRY (e.g., Perfumes, Clothes, Tech). THE HTML MUST BE CRO OPTIMIZED WITH A PERFECT CONVERSION FUNNEL COPY.]";
    }

    basePrompt += `\n\n
مهمتك الأساسية هي إنشاء Landing Pages احترافية ومقنعة ومُصممة لزيادة التحويلات، بناءً على المنتج أو الخدمة والجمهور والهدف.

تصرّف كأنك Senior Conversion Strategist + Landing Page Designer + Copywriter.

هدفك هو إنتاج Landing Page:
- واضحة
- سريعة
- عملية
- عالية الإقناع
- مناسبة للجمهور المستهدف
- متوافقة مع هدف التحويل
- الرجاء إطلاق العنان لإبداعك وتصميم صفحات HTML بهياكل و Layouts مختلفة ومبتكرة بالكامل، بدون الالتزام بأي قوالب أو تنسيقات ثابتة (حرية مطلقة للذكاء الاصطناعي في التصميم). 
- تنبيه صارم جدًا (CRITICAL INSTRUCTION): لا تقم أبدًا بإعادة استخدام أو تكرار نفس الهيكل (Layout) أو التصميم (Design) الذي قمت بتوليده في الرسائل السابقة في هذا السجل (History). حتى لو قام المستخدم بالإعجاب (Like) بتصميم سابق، يجب عليك في كل مرة يتم استدعائك فيها لتوليد صفحة HTML أن تقوم بابتكار تصميم جديد كليًا، بألوان جديدة، ترتيب مختلف للأقسام، وأفكار بصرية غير مكررة نهائيًا. التنوع والتجديد المستمر هو الأهم. 
*** تنبيه صارم جدًا بخصوص الـ Brand Kit ***: إذا تم تزويدك بـ Brand Kit في بداية هذا الـ Prompt، يجب عليك فرض جميع قواعده (الألوان، نبرة الصوت، الأسلوب البصري، وكل شيء) بشكل إجباري وقاطع على تصميم وصفحة الـ HTML بالكامل بدون أي نقاش أو استثناء.

دائما ما تبني اللاند ككود HTML+CSS
- يجب ان تكون صفحة الهبوط متوافقة مع جميع الشاشات responsive
- يجب ان جميع الازرار والعناوين والنصوص في منتصف الصفحة
- يجب أن تتناسق الالوان بحيث يكون الكلام دائما واضح
- يجب الا يخرج الانيميشن عن اطار الصفحة حتى لا تخرج عن حدودها

المعطيات:
وصف المنتج/الروابط/المعلومات: ${description}
روابط الصور: ${images.length > 0 ? images.join(', ') : 'بدون صور حالياً'}
روابط الفيديوهات: ${videoLinks.length > 0 ? videoLinks.join(', ') : 'بدون فيديوهات حالياً'}
عدد/أنواع الأقسام المقترحة من المستخدم: ${sections.join(', ')} (الأقسام المعتمدة هي: Hero Section, Problem Section, Solution Section, Benefits Section, Features Section, Social Proof Section, Offer Section, FAQ Section, Trust Section, Call-to-Action (CTA) Section. قم ببناء وهيكلة الأقسام المحددة بكفاءة وإبداع تسويقي عالي بما يناسب المنتج والتحويل)
اللغة أو اللهجة: ${languageDialect || 'اللغة العربية'}
الألوان/الستايل: ${colorsTheme || 'ألوان متناسقة تناسب المنتج'}
طول الكوبي المطلوب: ${copyLength === 'long' ? 'طويلة جداً ومقنعة' : 'متوسطة'}
أنيميشن الأزرار: ${ctaAnimation ? 'نعم، اجعل أزرار الـ CTA بالأنيميشن (ضروري ومهم)' : 'لا تضف أنيميشن للأزرار'}
`;

    if (previousHtml && editRequest) {
      basePrompt += `
تنبيه هام جداً:
لديك بالفعل كود HTML سابق للصفحة (مرفق في الأسفل).
المستخدم يطلب التعديل التالي: "${editRequest}"

يجب عليك:
1. التعديل فقط على الجزء المطلوب وتلبية طلب المستخدم.
2. حفظ باقي عناصر وأقسام الصفحة كما هي تماماً بدون حذف أو تغيير.
3. إرجاع الكود كاملاً بعد التعديل.

=== الكود السابق ===
${previousHtml}
=== نهاية الكود السابق ===
`;
    }

    basePrompt += `
عند بناء أو تعديل الصفحة، لا تُخرج محتوى عشوائيًا. ابنِ الصفحة حسب منطق التحويل التالي:
- اجذب الانتباه في الهيرو
- وضّح القيمة بسرعة
- اثبت المصداقية
- ابني الرغبة
- عالج الاعتراضات
- سهّل القرار
- ادفع نحو CTA واضح

عند كتابة المحتوى:
- استخدم لغة قوية ومباشرة
- اجعل العناوين واضحة ومثيرة للاهتمام
- اجعل الفقرات قصيرة
- اعتمد على benefit-driven copy
- اكتب بطريقة تفيد التحويل وليس الوصف فقط

${ADVANCED_COPYWRITING_PRINCIPLES}

عند اقتراح التصميم:
- اجعل اللاند نظيفة وسهلة التصفح
- اقترح مساحات بيضاء جيدة
- اجعل الأزرار واضحة بالأنيميشن إذا طُلب ذلك
`;

    if (generationModelType === 'free') {
      basePrompt += `
*** تعليمات النموذج الحر المطلق (Gemini Pro) - قواعد صارمة للتصميم والتجاوب والفوتر ***
أنت الآن تعمل بنظام "النموذج الحر". يُمنع منعاً باتاً الالتزام بأي قوالب CSS أو HTML سابقة (مثل النماذج المرفوعة).
- لديك الحرية المطلقة في الإبداع والتصميم كما تشاء وبدون أي قيود هيكلية، ابدع في تصميم صفحة الهبوط.
- قم بابتكار واجهة مستخدم (UI) وهيكل (Layout) جديد كلياً ومختلف تماماً عن أي قوالب قياسية، استخدم كل قدراتك كنموذج Gemini Pro لتخرج بتصميم مبهر وغير تقليدي إطلاقاً.
- استخدم Tailwind CSS عن طريق CDN لتصميم صفحة هبوط عصرية. **هام:** يجب إيقاف Preflight في Tailwind بإضافة \`<script>tailwind.config = { corePlugins: { preflight: false } }</script>\` لتجنب تدمير ألوان متجر EasyOrders.
- يمكنك استخدام مكتبات أيقونات (مثل FontAwesome) أو خطوط جوجل بحرية تامة (يفضل خط Cairo).
- صمم أقساماً غير تقليدية وإبداعية جداً لصفحة الهبوط.

*** قواعد حاسمة للتجاوب (Responsive) وحماية الفوتر وتناسق الألوان ***:
1. **التجاوب المطلق مع الجوال (100% Mobile Responsive)**:
   - يجب تضمين \`<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\` داخل \`<head>\`.
   - جميع الأقسام والكونتينرات يجب أن تكون بعرض كامل ومحمية من التمدد العرضي: \`w-full max-w-full overflow-x-hidden\`.
   - استخدم الشبكات المرنة المجهزة للجوال أولاً: \`grid-cols-1 md:grid-cols-2 lg:grid-cols-3\` و \`flex-col md:flex-row\`.
   - اجعل الخطوط والعناوين متجاوبة بمرونة (مثال: \`text-2xl md:text-5xl\` أو \`clamp()\`).
   - اجعل الصور والفيديوهات مرنة ومقيدة بحجم الشاشة: \`max-w-full h-auto object-cover\` أو \`object-contain\`.
   - اجعل المسافات الهامشية (Padding/Margin) مناسبة للشاشات الصغيرة على الجوال (مثل \`px-4 py-8 md:py-20 md:px-8\`).

2. **تناسق الألوان والتباين (High Contrast & Color Harmony)**:
   - يجب أن يكون التباين حاداً وواضحاً جداً بين النص والخلفية في كل قسم (WCAG AA compliant).
   - إذا كانت خلفية الصفحة أو القسم داكنة (مثل الداكن العنابي/الكحلي/الأسود #061124)، يجب إجبار جميع النصوص والعناوين والفقرات والأيقونات على استخدام ألوان فاتحة أو بيضاء قاطعة (\`color: #ffffff !important\` أو \`text-white\` / \`text-gray-300\`).
   - يُمنع قاطعاً وضع نصوص داكنة على خلفيات داكنة أو نصوص فاتحة على خلفيات بيضاء.

3. **حماية الفوتر ونموذج الشراء من الكسر (Footer & Form Protection)**:
   - قم بتغليف الصفحة بالكامل داخل كونتينر رئيسي مثل \`<div class="landing-root">\` بـ \`width: 100%; max-width: 100%; overflow-x: hidden;\`.
   - تأكد من إغلاق جميع الأوسمة (\`</div>\`, \`</section>\`, \`</header>\`) بدقة متناهية وبشكل صحيح 100%.
   - يُمنع استخدام عناصر ذات تموضع ثابت (\`position: fixed\`) أو مطلق (\`position: absolute\`) تسبب تغطية أو إزاحة لنموذج الشراء أو الفوتر.
`;
      if (platformType === 'easyorders') {
        basePrompt += `
- حافظ فقط على وضع \`<div id="form-section"></div>\` بعد انتهاء كل السكاشن وقبل إغلاق وسم \`</body>\`، وتوجيه أزرار الـ CTA إليه عبر \`<a href="#form-section">\` ولا تضع روابط خارجية.
`;
      } else {
        basePrompt += `
- أزرار الشراء يجب أن توجه إلى هذا الرابط: ${checkoutLink}
`;
      }
      basePrompt += `
- يُمنع وضع هيدر (Header) أو فوتر (Footer) خادمي يمنع ظهور فوتر المتجر الأصلي.
- اجعل الصفحة متوافقة 100% مع الجوال \`dir="rtl"\`.
- قم بإرجاع الكود النهائي كـ HTML صالح ولا تقم بوضعه داخل Markdown.
`;
    
    } else if (generationModelType === 'free-anti-slop') {
      basePrompt += `
*** تعليمات النموذج الحر الاحترافي الصارم (Anti AI Slop) ***
أنت تبني واجهة ويب إنتاجية عالية الاحترافية. القواعد أدناه هي **قيود صارمة وليست اقتراحات**.
عندما تتعارض قاعدة مع ما كنت على وشك إنشائه، فإن القاعدة هي التي تفوز.
يُمنع الالتزام بقوالب سابقة. لديك الحرية الإبداعية في الهيكل ولكن مع الالتزام التام بالتالي:

1. الألوان (Colour)
- اختر لون تمييز (Accent) **واحد فقط**. كل شيء آخر يجب أن يكون محايداً (عائلة واحدة من الرماديات إما دافئة أو باردة، لا تخلط).
- اللون الثاني مسموح به فقط إذا كان يحمل معنى (مدمر/أحمر، نجاح/أخضر، تحذير/أصفر). لا تستخدم الألوان للتنويع.
- **ممنوع منعاً باتاً**: أي تدرجات لونية (Gradients) من الأزرق إلى البنفسجي، أو تدرجات البنفسجي. هذا يعني ممنوع في الخلفيات، الأزرار، العناوين، الشعارات، الأيقونات، الحدود، أو الـ blurred blobs.
- **ممنوع منعاً باتاً**: تدرجات ألوان النصوص (gradient text). العناوين بلون صلب واحد فقط.
- **ممنوع منعاً باتاً**: إعطاء كل ميزة أو قسم لون خاص. استخدم نفس اللون لكل الكروت في الشبكات.
- لا تستخدم باليتة Tailwind الافتراضية كما هي (بالذات indigo/violet/slate فهي علامات مميزة للمواقع المولدة بالذكاء الاصطناعي). عرف الألوان الخاصة بك.
- نسبة استخدام اللون المميز (Accent) يجب أن تكون أقل من 10% من الشاشة. إذا بدت الصفحة ملونة جداً، فقد أفرطت.

2. العمق والفصل (Depth and separation)
- **ممنوع منعاً باتاً**: الـ drop shadow على أي عنصر لا يطفو فعلياً فوق الصفحة. الكروت، الأقسام، الصور، الحقول، والشارات لا تأخذ أي ظلال (No shadow).
- الظلال مسموحة فقط على العناصر التي تتراكب فعلياً (مثل dropdowns, modals, toasts). يجب أن تكون صغيرة وشفافيتها منخفضة جداً (مثلاً \`rgba(0,0,0,.06)\`).
- افصل بين الكتل (Blocks) إما بحدود (1px border)، أو تغيير طفيف في لون الخلفية، أو **المسافات البيضاء (Whitespace)** (وهو المفضل).
- اختر قيمة واحدة لـ border-radius ولون واحد لـ border واستخدمها في كل مكان. لا تضع أكثر من ظل لعمل عمق.

3. الأيقونات والإيموجي (Icons and emoji)
- **ممنوع منعاً باتاً**: أيقونة النجمة اللامعة (✨ ✦ ✧ 🪄) أو أي رمز "AI shimmer" في الأزرار، الشارات، العناوين، إلخ.
- **ممنوع منعاً باتاً**: استخدام الإيموجي كواجهة مستخدم (UI). لا إيموجي في العناوين، الأزرار، قوائم المميزات (❌ 🚀 ⚡ 🎯 🔥). الإيموجي للمحتوى الذي يكتبه المستخدم فقط.
- **ممنوع منعاً باتاً**: أي حاوية ملونة خلف الأيقونة (لا مربعات بحواف دائرية ولا دوائر ولا شارات ملونة خلف الأيقونة). الأيقونة توضع مباشرة على الخلفية وتأخذ نفس حجم النص.
- استخدم مجموعة أيقونات حقيقية (مثل Lucide عبر مكتبة أو SVG) بوزن موحد ولون أحادي (Monochrome). إذا كانت الميزة واضحة من الكلمة، فلا تضع أيقونة.

4. النصوص والطباعة (Typography and copy)
- **كلمات ممنوعة**: unleash, supercharge, elevate, transform, revolutionise, empower, seamless, effortless, cutting-edge, game-changing, next-level, unlock, harness, robust, leverage, powerful, synergy.
- **ممنوع منعاً باتاً**: استخدام شرطة (—) في واجهة المستخدم.
- اذكر ما يفعله المنتج بكلمات دقيقة وأرقام حقيقية ("تصدير بصيغة CSV بنقرة واحدة" أفضل من "أطلق العنان لبياناتك بمرونة").
- استخدم عائلة خطوط واحدة (عربي/إنجليزي)، وحدد مقاسات حقيقية للمقاييس: تقريباً 12 / 14 / 16 / 20 / 24 / 32 / 48.
- توسيط العناوين القصيرة فقط. لا تقم أبداً بتوسيط فقرة تتجاوز 3 أسطر. النص الأساسي (Body text) يكون بمحاذاة اليمين (في العربي) أو اليسار (في الإنجليزي). أقصى عرض للسطر 70 حرفاً.

5. الحركة (Motion)
- **ممنوع منعاً باتاً**: سهم يتحرك عند التمرير داخل الزر. وأي أسهم تتحرك من تلقاء نفسها أو تتنطط.
- **ممنوع منعاً باتاً**: توهج عند التمرير (hover glow). لا box-shadow bloom، لا هالة ملونة، لا scale() أكبر من 1.02، ولا رفع للكارت عند التمرير.
- حالة الـ Hover تغير فقط لون الخلفية أو الحدود بمدة 120-160ms ease-out.
- الانيميشن يكون فقط للـ opacity و transform بمدة 120-200ms. لا يوجد fade-in عند السكرول في كل قسم. لا parallax، لا typewriter.

6. المقاسات والنسب (Scale and proportion)
- لا شيء يكون مفرط الحجم (Oversized).
- عنوان الـ Hero: بين 40-56px للديسكتوب، 28-34px للجوال. لا تتجاوز 72px أبداً. لا يحتاج العنوان لملء الشاشة ليكون عنواناً.
- النص الأساسي 15-16px. لا شيء أقل من 12px.
- الأزرار بارتفاع 36-44px. المسافات الداخلية تعتمد على النص. لا تجعل الزر بكامل العرض (full-width) على الديسكتوب.
- حشوة الأقسام (Section padding) عمودية 64-96px للديسكتوب، 40-56px للجوال. لا 160px+.
- أقصى عرض للمحتوى 1100-1280px.
- الأيقونات 16-20px (متضمنة مع النص)، والمستقلة 24px. لا يوجد أيقونات زينة 48px+.
- لا قسم يأخذ ارتفاع الشاشة بالكامل (100vh) فقط من أجل التأثير. الـ hero يجب أن يلمح لوجود محتوى أسفله.
- كل مسافة (Spacing) هي مضاعف للرقم 4. النسق العمودي والأفقي يجب أن يكون متناسقاً.

7. التخطيط والهيكلة (Layout and structure)
- **ممنوع منعاً باتاً**: شارات الكلمات (eyebrow badges) فوق العناوين (مثل "Introducing v2.0" أو "AI-Powered").
- لا تقم بنسخ ترتيب القوالب الافتراضية (هيرو -> شعارات -> 3 مميزات -> آراء -> أسعار). ابنِ الأقسام التي يحتاجها المنتج فقط وبترتيب منطقي.
- لا يشترط أن تكون شبكة المميزات (Feature grids) 3 أعمدة متساوية. دع المحتوى يحدد الشكل (غير متساوي أفضل وأكثر بشرية).
- ليس كل شيء يتوسط الشاشة. وليس كل شيء عبارة عن كارت.

8. الكود (Code craft)
- HTML دلالي: header, nav, main, section, button. الـ div القابل للنقر يعتبر خطأ (Bug).
- ألوان متباينة (Contrast): 4.5:1 للنص الأساسي و 3:1 للنص الكبير.
- استخدام Tailwind CSS لإنشاء التصميم، مع إضافة \`<script>tailwind.config = { corePlugins: { preflight: false } }</script>\` لمنع تعارضات ألوان المنصة.
- اجعل الصفحة متوافقة 100% مع الجوال \`dir="rtl"\`.
- قم بتغليف الصفحة بـ \`<div class="landing-root">\` لحماية المحتوى.

**قبل التسليم:**
راجع كل سطر. هل يوجد أي تدرج لوني أزرق-إلى-بنفسجي؟ هل هناك أي ظل لعنصر ثابت؟ هل هناك إيموجي كواجهة؟ هل هناك شارة فوق العنوان؟ إذا كان التصميم يبدو كأنه مُوَلّد بواسطة ذكاء اصطناعي رخيص ومزخرف بلمعان، قم بتنظيفه فوراً.
`;
      if (platformType === 'easyorders') {
        basePrompt += `
- حافظ فقط على وضع \`<div id="form-section"></div>\` بعد انتهاء كل السكاشن وقبل إغلاق وسم \`</body>\`، وتوجيه أزرار الـ CTA إليه عبر \`<a href="#form-section">\` ولا تضع روابط خارجية.
`;
      } else {
        basePrompt += `
- أزرار الشراء يجب أن توجه إلى هذا الرابط: ${checkoutLink}
`;
      }
      basePrompt += `
- قم بإرجاع الكود النهائي كـ HTML صالح ولا تقم بوضعه داخل Markdown.
`;
    } else if (generationModelType === 'template-casual') {
      basePrompt += `
*** تعليمات النموذج الكاجوال (Lyon Light Template) ***
أنت الآن تعمل بنظام "النموذج الكاجوال". يجب عليك الالتزام بشكل صااااارم بالقالب المرفق (Lyon Light).
- قم باستبدال النصوص والصور والألوان في القالب المرفق بما يتناسب مع المنتج الحالي والـ Brand Kit (إن وُجد).
- لا تقم بتعديل أسماء الـ Classes أو بنية الـ HTML الأساسية. قم فقط بتغيير المحتوى الداخلي والألوان في متغيرات الـ CSS (مثل --g, --d, --gold, --gold2, --cream) لتناسب ألوان الـ Brand Kit أو المنتج.
- استخدم الهيكل التالي كأساس وابنِ عليه (يجب أن تُعيد الـ HTML والـ CSS والـ JS بالكامل):


=== CASUAL TEMPLATE (Lyon Light) ===
<style>
/* ===== LYON LIGHT LANDING PAGE ===== */
#rzLyonLight{
  --g:#15381f;--d:#07150c;--gold:#cda65a;--gold2:#efd99d;
  --cream:#f8f2e9;--text:#172019;--muted:#687169;
  width:100%;overflow:hidden;direction:rtl;background:#fff;color:var(--text);
  font-family:Cairo,Tajawal,Tahoma,Arial,sans-serif
}
#rzLyonLight,#rzLyonLight *{box-sizing:border-box}
#rzLyonLight img{display:block;width:100%;height:auto}
#rzLyonLight button{font:inherit}
#rzLyonLight .w{width:min(1120px,calc(100% - 24px));margin:auto}
#rzLyonLight .s{padding:62px 0}
#rzLyonLight .head{max-width:760px;margin:0 auto 28px;text-align:center}
#rzLyonLight .eyebrow{display:inline-block;margin-bottom:10px;padding:7px 14px;border:1px solid rgba(205,166,90,.5);border-radius:999px;background:#fff;color:var(--g);font-size:12px;font-weight:900}
#rzLyonLight h1,#rzLyonLight h2,#rzLyonLight h3,#rzLyonLight p{margin-top:0}
#rzLyonLight h2{margin-bottom:10px;color:var(--d);font-size:clamp(27px,4vw,44px);line-height:1.3}
#rzLyonLight .lead{margin-bottom:0;color:var(--muted);font-size:16px;line-height:1.9}
#rzLyonLight .grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;align-items:center}
#rzLyonLight .card{overflow:hidden;border:1px solid rgba(205,166,90,.25);border-radius:20px;background:var(--cream);box-shadow:0 12px 32px rgba(15,45,22,.09)}
#rzLyonLight .box{padding:26px;border:1px solid rgba(205,166,90,.25);border-radius:20px;background:#fff}
#rzLyonLight .btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:12px 24px;border:0;border-radius:13px;cursor:pointer;font-weight:900}
#rzLyonLight .btn-gold{color:#142619;background:linear-gradient(135deg,var(--gold2),var(--gold))}
#rzLyonLight .btn-green{color:#fff;background:linear-gradient(135deg,#285f36,#091f10)}
#rzLyonLight .actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
#rzLyonLight .hero{padding:22px 0 58px;color:#fff;background:linear-gradient(145deg,#061109,#102a18)}
#rzLyonLight .logo{width:min(190px,48vw);margin:0 auto 20px}
#rzLyonLight .hero-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(310px,.9fr);overflow:hidden;border:1px solid rgba(205,166,90,.25);border-radius:25px;background:#0b2413}
#rzLyonLight .hero-grid img{height:100%;object-fit:cover}
#rzLyonLight .hero-copy{display:flex;flex-direction:column;justify-content:center;padding:38px}
#rzLyonLight .hero h1{margin:12px 0 14px;font-size:clamp(36px,5vw,64px);line-height:1.18}
#rzLyonLight .hero p{color:rgba(255,255,255,.75);font-size:16px;line-height:1.9}
#rzLyonLight .tags{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 2px}
#rzLyonLight .tag{padding:7px 10px;border:1px solid rgba(205,166,90,.28);border-radius:10px;background:rgba(255,255,255,.05);font-size:12px;font-weight:800}
#rzLyonLight .status{min-height:20px;margin-top:9px;color:#dfe9df;font-size:12px}
#rzLyonLight .soft{background:linear-gradient(145deg,#fffdf9,#f5ede2)}
#rzLyonLight .dark{color:#fff;background:linear-gradient(145deg,#061109,#14331d)}
#rzLyonLight .dark h2{color:#fff}
#rzLyonLight .dark .lead{color:rgba(255,255,255,.72)}
#rzLyonLight .dark .box{border-color:rgba(205,166,90,.2);background:rgba(255,255,255,.05)}
#rzLyonLight .dark .box p{color:rgba(255,255,255,.72)}
#rzLyonLight .points{display:grid;gap:9px;margin-top:14px}
#rzLyonLight .point{padding:10px 12px;border-radius:10px;background:rgba(205,166,90,.12);font-size:14px;line-height:1.7}
#rzLyonLight .final{padding:60px 0;color:#fff;background:linear-gradient(145deg,#050f08,#102a18)}
#rzLyonLight .final h2{color:#fff}
#rzLyonLight .mobile-cta{display:none}

/* ===== Easy Orders native bundles: minimal safe styling ===== */
body.rz-lyon-light .bundles_container{
  scroll-margin-top:20px;width:min(860px,calc(100% - 20px))!important;
  margin:32px auto!important;padding:22px!important;direction:rtl!important;
  border:1px solid rgba(205,166,90,.35)!important;border-radius:20px!important;
  background:#fffaf2!important;box-shadow:0 14px 36px rgba(18,52,25,.10)!important
}
body.rz-lyon-light .bundles_title{text-align:center!important;color:#102719!important;font-size:28px!important}
body.rz-lyon-light .bundles_description{text-align:center!important;color:#687169!important}
body.rz-lyon-light .bundles_item{
  position:relative!important;display:block!important;height:auto!important;min-height:110px!important;
  margin:0 0 14px!important;padding:32px 14px 15px!important;overflow:visible!important;
  border:2px solid #ded5c8!important;border-radius:16px!important;background:#fff!important
}
body.rz-lyon-light .bundles_item[class*="border-skin-primary"],
body.rz-lyon-light .bundles_item.rz-selected{
  border-color:#cda65a!important;box-shadow:0 0 0 4px rgba(205,166,90,.12)!important
}
body.rz-lyon-light .bundles_item .flex-1{
  display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:7px!important
}
body.rz-lyon-light .bundles_item .relative.flex.items-center{
  display:flex!important;align-items:center!important;gap:7px!important;width:100%!important
}
body.rz-lyon-light .bundles_item p{
  display:block!important;width:auto!important;max-width:100%!important;height:auto!important;
  margin:0!important;overflow:visible!important;visibility:visible!important;opacity:1!important;
  white-space:normal!important;color:#152019!important;line-height:1.7!important;text-align:right!important
}
body.rz-lyon-light .bundles_item p.text-xl{font-size:16px!important;font-weight:900!important}
body.rz-lyon-light .bundles_item p[class*="text-[#6c6c6c]"]{
  display:inline-block!important;padding:6px 9px!important;border-radius:8px!important;
  background:#edf6ee!important;color:#18502b!important;font-size:12px!important;font-weight:800!important
}
body.rz-lyon-light .bundles_item .!text-xs{top:-9px!important;right:16px!important;left:auto!important;margin:0!important}
body.rz-lyon-light .bundles_label{
  padding:6px 11px!important;border-radius:0 0 8px 8px!important;
  background:linear-gradient(135deg,#efd797,#cda65a)!important;color:#102719!important;font-weight:900!important
}
body.rz-lyon-light .rz-bundle-action{
  width:min(860px,calc(100% - 20px));margin:-14px auto 32px;padding:0 18px 18px;
  direction:rtl;text-align:center;font-family:Cairo,Tajawal,Tahoma,Arial,sans-serif
}
body.rz-lyon-light .rz-bundle-status{min-height:23px;margin-bottom:10px;color:#536057;font-size:13px;font-weight:800}
body.rz-lyon-light .rz-bundle-confirm{
  width:min(100%,440px);min-height:54px;border:0;border-radius:13px;cursor:pointer;
  color:#fff;background:linear-gradient(135deg,#285f36,#091f10);font-size:16px;font-weight:900
}
body.rz-lyon-light .product_form_checkout{scroll-margin-top:20px}

@media(max-width:850px){
  #rzLyonLight .hero-grid,#rzLyonLight .grid2{grid-template-columns:1fr}
  #rzLyonLight .hero-copy{text-align:center;padding:26px 18px}
  #rzLyonLight .actions,#rzLyonLight .tags{justify-content:center}
}
@media(max-width:650px){
  #rzLyonLight{padding-bottom:72px}
  #rzLyonLight .s{padding:46px 0}
  #rzLyonLight .hero{padding:18px 0 45px}
  #rzLyonLight .hero-grid{border-radius:18px}
  #rzLyonLight .btn{width:100%}
  #rzLyonLight .mobile-cta{
    position:fixed;z-index:9998;right:9px;left:9px;bottom:9px;display:flex;align-items:center;gap:8px;
    padding:8px;border-radius:15px;background:rgba(7,24,12,.96);box-shadow:0 12px 35px rgba(0,0,0,.28)
  }
  #rzLyonLight .mobile-cta span{flex:1;color:#fff;font-size:12px;font-weight:800}
  #rzLyonLight .mobile-cta .btn{width:auto;min-height:43px;padding:9px 14px;font-size:12px}
  body.rz-lyon-light .bundles_container{padding:17px 10px!important}
  body.rz-lyon-light .bundles_item{min-height:105px!important;padding:31px 11px 14px!important}
}
</style>

<div id="rzLyonLight" dir="rtl">
  <!-- سيتم استبدال المحتوى بالأسفل ببيانات المنتج الجديد مع الحفاظ على نفس بنية العناصر والـ Classes -->
</div>

<script>
(function(){
  "use strict";
  if(window.RZ_LYON_LIGHT_V1)return;
  window.RZ_LYON_LIGHT_V1=true;
  document.body.classList.add("rz-lyon-light");

  var root=document.getElementById("rzLyonLight");
  if(!root)return;

  var status=root.querySelector("[data-status]");
  var reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  function scrollToEl(el,focus){
    if(!el)return;
    el.scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
    if(focus)setTimeout(function(){var x=el.querySelector('input[name="full_name"]');if(x)x.focus()},reduced?50:500);
  }

  function waitFor(selector,done,max){
    var count=0,t=setInterval(function(){
      var el=document.querySelector(selector);
      count++;
      if(el||count>max){clearInterval(t);if(el)done(el)}
    },250);
  }

  function goOffers(){
    var b=document.querySelector(".bundles_container");
    if(b){scrollToEl(b,false);return}
    if(status)status.textContent="جاري تجهيز العروض…";
    waitFor(".bundles_container",function(el){if(status)status.textContent="اختر العرض المناسب لك.";scrollToEl(el,false);installBundles(el)},40);
  }

  root.addEventListener("click",function(e){
    var o=e.target.closest("[data-offers]");
    if(o){e.preventDefault();goOffers();return}
    var s=e.target.closest("[data-scroll]");
    if(s){e.preventDefault();var t=document.querySelector(s.getAttribute("data-scroll"));if(t)scrollToEl(t,false)}
  });

  function items(box){return Array.prototype.slice.call(box.querySelectorAll(".bundles_item"))}
  function selectedIndex(box){
    var list=items(box),idx=-1;
    list.some(function(it,i){
      var r=it.querySelector(".radio_circle");
      var yes=it.className.indexOf("border-skin-primary")>-1||(r&&r.classList.contains("bg-blue-500"));
      if(yes){idx=i;return true}
      return false
    });
    return idx
  }

  function updateStatus(box){
    var idx=selectedIndex(box),st=document.querySelector(".rz-bundle-status");
    items(box).forEach(function(it,i){it.classList.toggle("rz-selected",i===idx)});
    if(!st)return;
    // تخصيص النص حسب المنتج
    st.textContent=idx>-1 ? "تم اختيار العرض بنجاح." : "اختر أحد العروض لإكمال الطلب.";
    st.style.color=idx>-1?"#17602b":"#536057";
  }

  function installBundles(box){
    if(!box||box.dataset.rzLightBound==="1")return;
    box.dataset.rzLightBound="1";
    var action=document.createElement("div");
    action.className="rz-bundle-action";
    action.innerHTML='<div class="rz-bundle-status" role="status" aria-live="polite">اختر أحد العروض لإكمال الطلب.</div><button type="button" class="rz-bundle-confirm">ثبّت العرض وأكمل الطلب</button>';
    box.insertAdjacentElement("afterend",action);
    box.addEventListener("click",function(){setTimeout(function(){updateStatus(box)},100)});
    action.querySelector(".rz-bundle-confirm").addEventListener("click",function(){
      var idx=selectedIndex(box),st=action.querySelector(".rz-bundle-status");
      if(idx<0){st.textContent="اختر أحد العروض أولًا.";st.style.color="#a42626";return}
      st.textContent="تم التثبيت. أكمل بياناتك بالأسفل.";
      st.style.color="#17602b";
      var checkout=document.querySelector(".product_form_checkout.checkout_container,.product_form_checkout");
      if(checkout)scrollToEl(checkout,true)
    });
    updateStatus(box);
  }

  waitFor(".bundles_container",installBundles,40);
})();
</script>
=== END CASUAL TEMPLATE ===

`;
      if (platformType === 'easyorders') {
        basePrompt += `
- في نهاية الصفحة، ضع حصراً وبشكل إجباري هذا الكود: \`<div id="form-section"></div>\` وهو مكان الحقن التلقائي للفورم.
- تأكد من توجيه كل أزرار الشراء أو العروض للنزول إلى هذا القسم عبر إضافة خاصية \`data-offers\` أو رابط يوجه إلى الفورم.
`;
      } else {
        basePrompt += `
- أزرار الشراء يجب أن توجه إلى هذا الرابط: ${checkoutLink}
`;
      }
      basePrompt += `
- قم بإرجاع الكود النهائي كـ HTML صالح ولا تقم بوضعه داخل Markdown.
`;
    } else if (platformType === 'easyorders') {
      basePrompt += `
**تعليمات هامة لمنصة EasyOrders:**
- ضع الكود كله داخل \`<div class="landing-container">\`.
- في نهاية الصفحة، ضع حصراً وبشكل إجباري هذا الكود: \`<div id="form-section"></div>\` وهو مكان الحقن التلقائي للفورم.
- استخدم CSS المرفق كأساس وقم بتعديله وتجميله وتوظيف الألوان، وضع ستايلات الأنيميشن والتجاوب فيه.
- استخدم أزرار الـ CTA بالشكل التالي للنزول للفورم: \`<a href="#form-section" class="${ctaAnimation ? 'btn-pulse' : ''} ...">...\` ولا تضع أي رابط خارجي.
- قم بإرجاع الكود النهائي كـ HTML صالح (من \`<html>\` إلى \`</html>\`) ولا تقم بوضعه داخل Markdown Code blocks، ارجعه مباشرة.

=== BASE CSS TEMPLATE ===
<style>
:root { --primary-color: ${primaryColor}; }
${easyOrdersBaseCss}
/* يجب إضافة أكوادك وإبداعاتك هنا، وإضافة الأنيميشن المناسب والتأكد من التوافق مع الشاشات وتوسيط المحتوى. */
body { overflow-x: hidden; }
</style>
=== END BASE CSS ===
`;
    } else {
      basePrompt += `
**تعليمات هامة لمنصة Generic:**
- استخدم Tailwind CSS عن طريق CDN.
- استخدم خطوط Google (مثل Cairo).
- اجعل الصفحة متوافقة 100% مع الجوال \`dir="rtl"\`.
- أزرار الشراء يجب أن توجه إلى هذا الرابط: ${checkoutLink}
- قم بإرجاع الكود النهائي كـ HTML صالح (من \`<html>\` إلى \`</html>\`) ولا تقم بوضعه داخل Markdown Code blocks، ارجعه مباشرة.
`;
    }

    const extractHtml = (text: string) => {
      const htmlRegex = /```html\s*([\s\S]*?)\s*```/;
      const match = text.match(htmlRegex);
      if (match) return match[1].trim();
      const genericRegex = /```\s*([\s\S]*?)\s*```/;
      const genericMatch = text.match(genericRegex);
      if (genericMatch) return genericMatch[1].trim();
      return text.trim();
    };

    if (generationModelType !== 'template-casual' && !editRequest && sections && sections.length > 1) {
      // Generate Section by Section
      let skeletonPrompt = basePrompt + `
      
=== تعليمات التوليد المُجزأ (الخطوة 1: الهيكل والأساسيات) ===
بناءً على طلب المستخدم، سنقوم بتوليد الصفحة قسماً تلو الآخر لضمان أعلى جودة.
مهمتك الآن في هذه الخطوة الأولى:
1. توليد هيكل الـ HTML الأساسي (من \`<html>\` و \`<head>\` إلى بداية \`<body>\` أو الـ Wrapper الرئيسي \`<div class="landing-container">\`).
2. إضافة جميع الـ CSS Styles العامة (سواء Tailwind CDN أو CSS مخصص)، الألوان المستوحاة من الـ Brand Kit، والخطوط، والأنيميشنز.
3. **لا تقم بتوليد أي أقسام محتوى هنا.** فقط الأساسيات وافتح وسم الـ body.
4. قم بإرجاع الكود فقط ولا تضع خاتمة \`</html>\`.
`;
      const skeletonResponse = await getAI().models.generateContent({
        model: selectedAiModel,
        contents: skeletonPrompt,
        config: { temperature: 0.7, maxOutputTokens: 8192 }
      });
      let finalHtml = extractHtml(skeletonResponse.text || "");

      for (let i = 0; i < sections.length; i++) {
         let sectionPrompt = basePrompt + `
         
=== تعليمات التوليد المُجزأ (الخطوة: توليد قسم ${sections[i]}) ===
لقد قمت مسبقاً بتوليد الأساسيات وهذا هو الكود الحالي للصفحة:
\`\`\`html
${finalHtml}
\`\`\`
مهمتك الآن:
1. توليد كود الـ HTML الخاص بقسم "${sections[i]}" **فقط لا غير**.
2. يجب أن تلتزم تماماً بالهوية البصرية والـ CSS Classes والألوان المستخدمة في الأساسيات.
3. لا تُعد كتابة الـ \`<html>\` أو \`<head>\`، قم فقط بكتابة الكود الخاص بالقسم.
4. تأكد من أن التصميم متناسق تماماً مع الأقسام السابقة.
`;
         const sectionResponse = await getAI().models.generateContent({
           model: selectedAiModel,
           contents: sectionPrompt,
           config: { temperature: 0.7, maxOutputTokens: 8192 }
         });
         finalHtml += "\n" + extractHtml(sectionResponse.text || "");
      }

      let footerPrompt = basePrompt + `
=== تعليمات التوليد المُجزأ (الخطوة الأخيرة: إغلاق الصفحة) ===
هذا هو الكود الحالي:
\`\`\`html
${finalHtml}
\`\`\`
مهمتك الآن:
1. إغلاق وسم الـ \`<body>\` والـ \`<html>\`.
2. إذا كان مطلوباً نموذج فورم، تأكد من وضع \`<div id="form-section"></div>\` قبل إغلاق الـ body مباشرة.
3. قم بإرجاع الأسطر الأخيرة فقط لإغلاق الكود بشكل صحيح.
`;
      const footerResponse = await getAI().models.generateContent({
        model: selectedAiModel,
        contents: footerPrompt,
        config: { temperature: 0.7, maxOutputTokens: 8192 }
      });
      finalHtml += "\n" + extractHtml(footerResponse.text || "");
      return finalHtml;

    } else {
      const response = await getAI().models.generateContent({
        model: selectedAiModel,
        contents: basePrompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      });
      return extractHtml(response.text || "");
    }
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`Error generating landing page HTML. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateLandingPageHTML(productName, description, price, oldPrice, checkoutLink, primaryColor, images, videoLinks, sections, copyLength, ctaAnimation, brandKit, languageDialect, colorsTheme, previousHtml, editRequest, platformType, generationModelType, includeReviews, reviewsText, aiModelChoice, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function generateFlowCharacter(
  description: string,
  dialect: string,
  voiceGender: string,
  modelType: 'flash' | 'pro' = 'flash',
  retries: number = 3,
  delay: number = 2000
): Promise<string> {
  const modelName = modelType === 'pro' ? "gemini-3.1-pro-preview" : "gemini-3.8-flash";

  let dialectInstruction = "Standard Arabic";
  if (dialect === 'egyptian') dialectInstruction = "Egyptian Arabic dialect (العامية المصرية الدارجة)";
  if (dialect === 'saudi') dialectInstruction = "Saudi Arabic dialect (اللهجة السعودية الدارجة)";
  if (dialect === 'emirati') dialectInstruction = "Emirati Arabic dialect (اللهجة الإماراتية الدارجة)";
  if (dialect === 'libyan') dialectInstruction = "Libyan Arabic dialect (اللهجة الليبية الدارجة)";
  if (dialect === 'iraqi') dialectInstruction = "Iraqi Arabic dialect (اللهجة العراقية الدارجة)";
  if (dialect === 'syrian') dialectInstruction = "Syrian Arabic dialect (اللهجة السورية الدارجة)";
  if (dialect === 'palestinian') dialectInstruction = "Palestinian Arabic dialect (اللهجة الفلسطينية الدارجة)";
  if (dialect === 'english') dialectInstruction = "English Language (اللغة الإنجليزية)";

  const genderInstruction = voiceGender === 'male' ? "MALE character (شخصية ذكر)." : 
                            voiceGender === 'female' ? "FEMALE character (شخصية أنثى)." : 
                            "suitable character based on the product.";

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: `You are an expert character designer and AI video generation prompt engineer (specifically for Google Omni and Flow).
      
      Based on the following product description, target audience dialect (${dialectInstruction}), and gender (${genderInstruction}), generate a comprehensive Character Design Prompt and Voice Specification for a consistent character to be used in AI video generation (Flow).
      
      Product Description: "${description}"
      
      Your output MUST be entirely in Arabic (except for technical prompt keywords if necessary) and formatted as Markdown.
      Provide the following sections:
      
      ## 1. الهوية والسمات (Identity & Traits)
      - الاسم والعمر
      - المهنة أو الدور (بما يتناسب مع المنتج)
      - الخلفية الثقافية / المظهر العام (مناسب لـ ${dialectInstruction})
      
      ## 2. المظهر الجسدي (Physical Appearance)
      - ملامح الوجه (تفاصيل دقيقة للعين، الأنف، الوجه)
      - الشعر والتسريحة
      - شكل الجسم والوقفة (بناءً على ${genderInstruction})
      
      ## 3. الملابس والإكسسوارات (Clothing & Accessories)
      - الزي الرئيسي (تفاصيل الألوان والخامات بما يتناسب مع المنتج)
      - الإكسسوارات (نظارات، ساعات، مجوهرات)
      
      ## 4. مواصفات الصوت والأداء (Voice & Performance - Google Omni Style)
      - نبرة الصوت والمشاعر (Tone & Emotion)
      - سرعة الإيقاع وتوقف النطق
      - طريقة التحدث بـ ${dialectInstruction} بشكل طبيعي، مع كتابة أمثلة لطريقة النطق.
      
      ## 5. الأوامر الشاملة للذكاء الاصطناعي (AI Prompts)
      - **Image Generation Prompt (English):** الوصف الدقيق باللغة الإنجليزية لنسخه واستخدامه في نماذج توليد الصور/الفيديو (مثال Midjourney, Flow) لتثبيت الشخصية واستخدام الملابس والملامح بالضبط.
      - **Google Omni Voice Prompt (English):** الوصف الدقيق لتعليمات الصوت باللغة الإنجليزية لـ Google Omni للحصول على الأداء الدقيق بالنبرة المطلوبة وتحديد نوع الجنس.

      Make it highly creative, detailed, professional, and perfectly aligned with the product's target audience.`,
      config: {
        temperature: 0.7
      }
    });

    return response.text || "حدث خطأ أثناء التوليد.";
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429');
    const isInternalError = error?.status === 500 || error?.message?.includes('500') || error?.status === 'INTERNAL';
    
    if ((isRateLimit || isInternalError) && retries > 0) {
      console.warn(`API error. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateFlowCharacter(description, dialect, voiceGender, modelType, retries - 1, delay * 2);
    }
    console.error("Error generating flow character", error);
    throw new Error('حدث خطأ أثناء التوليد. الرجاء المحاولة مرة أخرى.');
  }
}

export async function generateBrandKit(prompt: string): Promise<any> {
  const modelName = "gemini-3.1-pro-preview";
  const instructions = `You are an expert Brand Strategist and Designer.
  Create a complete brand kit based on this prompt/idea: "${prompt}"
  
  You MUST return ONLY valid JSON matching this structure:
  {
    "name": "Brand Name",
    "industry": "e.g., E-commerce, Tech, Fashion",
    "targetAudience": "...",
    "uniqueSellingProposition": "...",
    "keyBenefits": "...",
    "objectionsToOvercome": "...",
    "communicationStyle": "...",
    "prohibitedWords": "...",
    "colors": {
      "primary": "#HEX",
      "secondary": "#HEX",
      "accent": "#HEX",
      "background": "#HEX"
    },
    "typography": { "heading": "Font Name", "body": "Font Name" },
    "voice": { "primary": "e.g., Professional, Playful, Authoritative" },
    "visualStyle": "e.g., Modern, Minimalist, Bold",
    "generationPreferences": {
      "landingPages": "e.g., Sales Layout, Lead Gen",
      "creatives": "e.g., Product Focused, Lifestyle",
      "copies": "e.g., Direct Response, Storytelling",
      "voiceOvers": "e.g., Energetic, Calm"
    }
  }`;

  try {
    const response = await getAI().models.generateContent({
      model: modelName,
      contents: instructions,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("No JSON found in response");
    }
  } catch (error) {
    console.error("Error generating brand kit with AI:", error);
    throw error;
  }
}


export async function analyzeProductForSpy(productName: string, imageBase64: string | null): Promise<any> {
  const model = "gemini-3.1-pro-preview";
  let prompt = `أنت خبير في دراسة السوق والبحث الجاسوسي عن الإعلانات المربحة (Ad Spy Specialist) وتعمل كمحرك بحث بصري وتحليلي متقدم.

المهمة المطلوبة:
1. تحليل صورة و/أو اسم المنتج المدخل ("${productName}") بدقة متناهية.
2. توليد "هوكات الكلمات المفتاحية للبحث" (Keyword Hooks & Search Angles):
   قم بالتفكير في زوايا البحث العميقة والهوكات التسويقية التي يبحث بها الجمهور أو المنافسون عن إعلانات هذا المنتج.
   يجب توليد ما لا يقل عن 10 هوكات بحثية متنوعة باللغتين العربية والإنجليزية.

3. استخدام أداة بحث جوجل (Google Search) لاستخراج روابط حقيقية وفعلية لإعلانات وفيديوهات ومتاجر تبيع هذا المنتج تحديداً.
4. توفير ما لا يقل عن 8 روابط حقيقية في قسم links.

اسم المنتج/الوصف المدخل: "${productName}"

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
}`;
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
    parts[0].text += "\n\nالصورة المرفقة للمنتج: قم بتفعيل قدراتك في الرؤية لاستخراج الخصائص البصرية.";
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
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      text = text.replace(/\[\d+(?:,\s*\d+)*\]/g, '');
      
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
}
