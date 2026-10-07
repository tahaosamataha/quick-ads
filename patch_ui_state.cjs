const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const \[customScriptVoice, setCustomScriptVoice\] = useState\('auto'\);/;
const replacement = "const [customScriptVoice, setCustomScriptVoice] = useState('auto');\n  const [customScriptStyle, setCustomScriptStyle] = useState('');\n  const [isSampleLoading, setIsSampleLoading] = useState(false);";

code = code.replace(regex, replacement);

const playVoiceSampleCode = `
  const playVoiceSample = async (selectedVoice: string) => {
    if (!selectedVoice || selectedVoice === 'auto' || selectedVoice === 'clone') {
      alert('يرجى اختيار صوت محدد لتجربته');
      return;
    }
    setIsSampleLoading(true);
    try {
      const sampleText = "مرحباً، هذه عينة صوتية لتجربة نبرة الصوت والمستوى الأدائي. أتمنى أن تنال إعجابكم.";
      const urls = await generateSpeech(sampleText, "تحدث بنبرة طبيعية وواضحة", "Sample", selectedVoice, null);
      if (urls && urls.length > 0) {
        const audio = new Audio(urls[0]);
        audio.play();
      }
    } catch(e) {
      console.error(e);
      alert('فشل توليد العينة الصوتية');
    } finally {
      setIsSampleLoading(false);
    }
  };
`;

code = code.replace(
  /const handleGenerateScript = async \(\) => \{/,
  playVoiceSampleCode + "\n  const handleGenerateScript = async () => {"
);

fs.writeFileSync('src/App.tsx', code);
