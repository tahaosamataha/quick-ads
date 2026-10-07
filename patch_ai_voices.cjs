const fs = require('fs');
let code = fs.readFileSync('src/services/ai.ts', 'utf8');

const newCode = `    let voiceName = 'Puck';
    let temperature = 1.3;
    let pitchAdjustmentFactor = 1.0;

    const maleVoices = ['Puck', 'Charon', 'Fenrir', 'Orus', 'Lapetus', 'Enceladus', 'Achird', 'Alnilam', 'Algenib', 'Algieba', 'Umbriel', 'Zubenelgenubi', 'Sadachbia'];
    const femaleVoices = ['Laomedeia', 'Achernar', 'Zephyr', 'Kore', 'Leda', 'Callirrhoe', 'Despina', 'Gacrux'];

    if (voiceGender.startsWith('male_') || voiceGender.startsWith('female_')) {
      voiceName = voiceGender.split('_')[1];
    } else {
      try {
        const voiceResponse = await getAI().models.generateContent({
          model: voiceCloneFile ? "gemini-3.1-pro-preview" : "gemini-3.6-flash",
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
        const hasFemaleWord = lowerText.includes('نسائي') || lowerText.includes('امرأة') || lowerText.includes('بنت') || lowerText.match(/(?<!no\\s)(?<!not\\s)(?<!do not use\\s)(?<!don't use\\s)\\bfemale\\b/i) !== null;
        const hasMaleWord = lowerText.includes('رجالي') || lowerText.includes('رجل') || lowerText.includes('ولد') || lowerText.match(/(?<!no\\s)(?<!not\\s)(?<!do not use\\s)(?<!don't use\\s)\\bmale\\b/i) !== null;
        
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

    if (!maleVoices.includes(voiceName) && !femaleVoices.includes(voiceName)) {
      voiceName = 'Puck'; // default safe fallback
    }`;

code = code.replace(/    let voiceName = 'Puck';[\s\S]*?voiceName = 'Puck'; \/\/ default safe fallback\n    \}/, newCode);

fs.writeFileSync('src/services/ai.ts', code);
