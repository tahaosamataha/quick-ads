import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { 
  Video, 
  Link as LinkIcon, 
  FileText, 
  Loader2, 
  AlertCircle, 
  Copy, 
  Check,
  Languages,
  Download,
  XCircle,
  Globe,
  UploadCloud,
  FileAudio,
  ClipboardPaste
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TRANSLATION_LANGUAGES = [
  { id: 'en', name: 'الإنجليزية (English)' },
  { id: 'fr', name: 'الفرنسية (French)' },
  { id: 'es', name: 'الإسبانية (Spanish)' },
  { id: 'de', name: 'الألمانية (German)' },
  { id: 'tr', name: 'التركية (Turkish)' },
  { id: 'ar-eg', name: 'اللهجة المصرية' },
  { id: 'ar-sa', name: 'اللهجة السعودية' },
  { id: 'ar-ly', name: 'اللهجة الليبية' },
  { id: 'ar-iq', name: 'اللهجة العراقية' },
  { id: 'ar-sy', name: 'اللهجة السورية' },
  { id: 'ar-ma', name: 'اللهجة المغربية' },
  { id: 'ar-dz', name: 'اللهجة الجزائرية' },
  { id: 'ar-ae', name: 'اللهجة الإماراتية' },
];

export default function ExtractPage() {
  const [extractUrl, setExtractUrl] = useState('');
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractStatus, setExtractStatus] = useState('');
  const [script, setScript] = useState('');
  const [extractError, setExtractError] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [translatedScript, setTranslatedScript] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [translationError, setTranslationError] = useState('');
  const [translatedCopied, setTranslatedCopied] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractFormat, setExtractFormat] = useState<'srt' | 'text'>('srt');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [ttsAudio, setTtsAudio] = useState('');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState('');
  const [voiceGender, setVoiceGender] = useState<'Kore' | 'Puck'>('Puck');
  const [voiceStyle, setVoiceStyle] = useState('حماسي وحيوي (إعلان تجاري)');
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const [ttsStatus, setTtsStatus] = useState('');
  const [clipboardError, setClipboardError] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.size > 30 * 1024 * 1024) {
        setExtractError('حجم الملف كبير جداً. الحد الأقصى هو 30 ميجابايت.');
      } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        setSelectedFile(file);
        setExtractUrl('');
      } else {
        setExtractError('يرجى رفع ملف فيديو أو صوت صالح.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 30 * 1024 * 1024) {
        setExtractError('حجم الملف كبير جداً. الحد الأقصى هو 30 ميجابايت.');
      } else {
        setSelectedFile(file);
        setExtractUrl('');
      }
    }
  };

  const handleStopExtract = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setExtractLoading(false);
      setExtractStatus('');
      setExtractError('تم إيقاف العملية بواسطة المستخدم.');
    }
  };

  const handleExtract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!extractUrl && !selectedFile) return;

    setExtractLoading(true);
    setExtractError('');
    setScript('');
    setTranslatedScript('');
    setTargetLanguage('');
    setExtractStatus('جاري استخراج الصوت...');

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      let audioBase64 = '';
      let mimeType = '';

      if (selectedFile) {
        setExtractStatus('جاري رفع الملف واستخراج الصوت...');
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/upload-extract', {
          method: 'POST',
          body: formData,
          signal
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            throw new Error(data.error || 'فشل استخراج الصوت من الملف');
          } else {
            throw new Error('فشل استخراج الصوت من الملف. قد يكون حجم الملف كبيراً جداً.');
          }
        }

        const data = await response.json();
        audioBase64 = data.audioBase64;
        mimeType = data.mimeType;
      } else {
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: extractUrl }),
          signal
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            throw new Error(data.error || 'فشل استخراج الصوت');
          } else {
            throw new Error('فشل استخراج الصوت. تأكد من صحة الرابط.');
          }
        }

        const data = await response.json();
        audioBase64 = data.audioBase64;
        mimeType = data.mimeType;
      }
      
      setExtractStatus('جاري تحليل الصوت وتفريغ النص باستخدام الذكاء الاصطناعي...');

      const apiKey = process.env.GEMINI_API_KEY as string;
      const genAI = new GoogleGenAI({ apiKey });
      const model = "gemini-3.8-flash";
      const prompt = extractFormat === 'srt' 
        ? "Please transcribe every word spoken in this audio and format it as a valid SRT (SubRip Subtitle) file. Include accurate timestamps for each subtitle block. Identify the language automatically. Provide ONLY the raw SRT text without any markdown formatting, code blocks, or additional comments."
        : "Please transcribe every word spoken in this audio as plain text. Do NOT include any timestamps, sequence numbers, or SRT formatting. Just provide the clean, continuous text of what is being said. Identify the language automatically. Provide ONLY the raw text without any markdown formatting, code blocks, or additional comments.";

      const result = await genAI.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: audioBase64
                }
              }
            ]
          }
        ],
      });

      if (signal.aborted) throw new Error("تم إيقاف العملية");

      const text = result.text;
      if (!text) throw new Error("لم يتم العثور على نص في الفيديو");

      setScript(text);
      setExtractStatus('');
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'تم إيقاف العملية') {
        setExtractError('تم إيقاف العملية بواسطة المستخدم.');
      } else {
        console.error(err);
        setExtractError(err.message || 'حدث خطأ غير متوقع');
      }
    } finally {
      setExtractLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleTranslate = async (langId: string, langName: string) => {
    if (!script) return;
    
    setTargetLanguage(langId);
    setIsTranslating(true);
    setTranslationError('');
    
    try {
      const apiKey = process.env.GEMINI_API_KEY as string;
      const genAI = new GoogleGenAI({ apiKey });
      const model = "gemini-3.8-flash";
      const prompt = `Translate the following text to ${langName}. Maintain the original meaning and tone. If the target language is a specific Arabic dialect (like Egyptian, Saudi, Libyan, Iraqi), ensure the vocabulary and phrasing match that dialect accurately and naturally. Provide ONLY the translated text without any additional comments or formatting. ${extractFormat === 'srt' ? 'Maintain the exact SRT formatting and timestamps.' : 'Provide it as plain text.'}

Text to translate:
${script}`;

      const result = await genAI.models.generateContent({
        model,
        contents: prompt,
      });

      const text = result.text;
      if (!text) throw new Error("فشلت عملية الترجمة");

      setTranslatedScript(text);
    } catch (err: any) {
      console.error(err);
      setTranslationError(err.message || 'حدث خطأ أثناء الترجمة');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerateTTS = async (textToRead: string) => {
    if (!textToRead) return;
    setTtsLoading(true);
    setTtsError('');
    setTtsAudio('');
    setTtsStatus('جاري توليد الصوت باستخدام الذكاء الاصطناعي...');

    try {
      const apiKey = process.env.GEMINI_API_KEY as string;
      const genAI = new GoogleGenAI({ apiKey });
      const prompt = `Read the following advertising script. Style and tone instructions: ${voiceStyle}.\n\nScript:\n${textToRead}`;
      
      const response = await genAI.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceGender },
              },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
         throw new Error("No audio data returned");
      }

      setTtsStatus('جاري تحويل الصوت إلى صيغة MP3...');
      const convertRes = await fetch('/api/convert-pcm-to-mp3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pcmBase64: base64Audio, sampleRate: 24000 })
      });

      if (!convertRes.ok) {
        const errData = await convertRes.json().catch(() => ({}));
        throw new Error(errData.error || 'فشل تحويل الصوت إلى MP3.');
      }

      const convertData = await convertRes.json();
      setTtsAudio(`data:audio/mp3;base64,${convertData.mp3Base64}`);
    } catch (err: any) {
      console.error(err);
      setTtsError(err.message || 'حدث خطأ أثناء إنشاء الصوت.');
    } finally {
      setTtsLoading(false);
      setTtsStatus('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyTranslatedToClipboard = () => {
    navigator.clipboard.writeText(translatedScript);
    setTranslatedCopied(true);
    setTimeout(() => setTranslatedCopied(false), 2000);
  };

  const downloadFile = (content: string, filename: string, isSrt: boolean) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: isSrt ? 'text/srt' : 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
          استخراج النص من <br />
          <span className="text-[#09090b]">الفيديو والصوت</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-xl mx-auto">
          قم بتحويل أي فيديو أو ملف صوتي إلى نص مكتوب بدقة عالية مع توقيتات (SRT).
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl shadow-black/5 border border-black/5 dark:border-white/5 p-6 mb-8">
        <div className="flex flex-col gap-6">
          {/* Format Selection */}
          <div className="flex items-center justify-center gap-6 bg-white dark:bg-neutral-900/50 py-3 rounded-xl border border-black/5 dark:border-white/5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="extractFormat"
                value="srt"
                checked={extractFormat === 'srt'}
                onChange={() => setExtractFormat('srt')}
                className="w-4 h-4 text-[#09090b] focus:ring-[#09090b]"
                disabled={extractLoading}
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">مع التوقيت (SRT)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="extractFormat"
                value="text"
                checked={extractFormat === 'text'}
                onChange={() => setExtractFormat('text')}
                className="w-4 h-4 text-[#09090b] focus:ring-[#09090b]"
                disabled={extractLoading}
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">نص فقط (بدون توقيت)</span>
            </label>
          </div>

          {/* URL Input */}
          <form onSubmit={handleExtract} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <LinkIcon className="w-5 h-5 text-neutral-400" />
              </div>
              <input
                type="url"
                placeholder="ضع رابط الفيديو هنا..."
                className="w-full pl-12 pr-12 py-4 bg-white dark:bg-neutral-900/50 rounded-xl border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-lg placeholder:text-neutral-400 transition-all text-neutral-900 dark:text-white"
                value={extractUrl}
                onChange={(e) => {
                  setExtractUrl(e.target.value);
                  if (e.target.value) setSelectedFile(null);
                }}
                disabled={!!selectedFile || extractLoading}
              />
              {navigator.clipboard && !extractLoading && !selectedFile && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setClipboardError('');
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        setExtractUrl(text);
                        setSelectedFile(null);
                      }
                    } catch (err: any) {
                      console.error('Failed to read clipboard:', err);
                      setClipboardError('لم نتمكن من الوصول للحافظة بسبب قيود المتصفح. يرجى استخدام (Ctrl+V) ألصق الرابط يدوياً.');
                      setTimeout(() => setClipboardError(''), 4000);
                    }
                  }}
                  className="absolute inset-y-0 right-4 flex items-center text-neutral-400 hover:text-[#09090b] transition-colors"
                  title="لصق من الحافظة"
                >
                  <ClipboardPaste className="w-5 h-5" />
                </button>
              )}
            </div>
            {extractLoading && !selectedFile ? (
              <button
                type="button"
                onClick={handleStopExtract}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 min-w-[140px]"
              >
                <XCircle className="w-5 h-5" />
                إيقاف
              </button>
            ) : (
              <button
                type="submit"
                disabled={!extractUrl || !!selectedFile || extractLoading}
                className="bg-[#09090b] hover:bg-[#09090b]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 min-w-[140px]"
              >
                استخراج من الرابط
              </button>
            )}
          </form>
          {clipboardError && (
              <p className="text-red-500 text-sm mt-1 mb-2">{clipboardError}</p>
          )}

          <div className="flex items-center gap-4">
            <div className="h-px bg-black/10 flex-1"></div>
            <span className="text-sm font-medium text-neutral-400">أو</span>
            <div className="h-px bg-black/10 flex-1"></div>
          </div>

          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? 'border-[#09090b] bg-[#09090b]/5 dark:bg-[#09090b]/10' : 'border-neutral-200 dark:border-neutral-700 hover:border-[#09090b]/40 dark:hover:border-[#09090b]/50 hover:bg-neutral-50 dark:hover:bg-neutral-800'} ${selectedFile ? 'bg-[#09090b]/5 dark:bg-[#09090b]/10 border-[#09090b]/20 dark:border-[#09090b]/30' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*,audio/*"
              className="hidden" 
              disabled={extractLoading}
            />
            
            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-[#09090b]/10 text-[#09090b] rounded-full flex items-center justify-center">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-neutral-800 dark:text-neutral-100">{selectedFile.name}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => setSelectedFile(null)}
                    disabled={extractLoading}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                  {extractLoading ? (
                    <button
                      onClick={handleStopExtract}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      إيقاف
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleExtract()}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#09090b] hover:bg-[#09090b]/90 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      استخراج النص
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-full flex items-center justify-center mb-2">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="font-bold text-neutral-700 dark:text-neutral-200">اسحب وأفلت ملف الفيديو أو الصوت هنا</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">أو اضغط لاختيار ملف من جهازك</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {extractStatus && (
          <motion.div 
            key="extract-status"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 text-[#09090b] bg-[#09090b]/5 dark:bg-[#09090b]/10 px-4 py-3 rounded-xl mb-6 border border-[#09090b]/20 dark:border-[#09090b]/30 overflow-hidden"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">{extractStatus}</span>
          </motion.div>
        )}

        {extractError && (
          <motion.div 
            key="extract-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl mb-6 border border-red-100 dark:border-red-800/30 overflow-hidden"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{extractError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {script && (
          <motion.div
            key="extract-result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl shadow-black/5 border border-black/5 dark:border-white/5 overflow-hidden"
          >
            <div className="border-b border-black/5 dark:border-white/5 px-6 py-4 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#09090b]" />
                <span className="font-bold text-neutral-900 dark:text-white">{extractFormat === 'srt' ? 'النص المستخرج (SRT)' : 'النص المستخرج'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/5 text-neutral-500 dark:text-neutral-400 hover:text-[#09090b] flex items-center gap-2 text-sm font-medium"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'تم النسخ' : 'نسخ'}
                </button>
                <button 
                  onClick={() => downloadFile(script, extractFormat === 'srt' ? "subtitles.srt" : "transcript.txt", extractFormat === 'srt')}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-transparent hover:border-black/5 dark:hover:border-white/5 text-neutral-500 dark:text-neutral-400 hover:text-[#09090b] flex items-center gap-2 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  {extractFormat === 'srt' ? 'تحميل SRT' : 'تحميل TXT'}
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="prose prose-neutral max-w-none">
                <textarea 
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="w-full bg-transparent border border-transparent hover:border-black/10 dark:hover:border-white/10 focus:border-[#09090b]/50 focus:bg-white dark:focus:bg-neutral-900 rounded-lg p-3 resize-y min-h-[200px] whitespace-pre-wrap leading-relaxed text-lg text-neutral-700 dark:text-neutral-200 text-right focus:ring-0 focus:outline-none transition-colors" 
                  dir="auto"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-1">
                <Languages className="w-3 h-3" />
                تم التعرف على اللغة تلقائياً
              </div>
              <div>بواسطة Gemini AI</div>
            </div>

            {/* Translation Section */}
            <div className="px-6 py-6 bg-white dark:bg-neutral-800 border-t border-black/5 dark:border-white/5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-200">
                  <Globe className="w-4 h-4 text-[#09090b]" />
                  ترجمة النص إلى:
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRANSLATION_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleTranslate(lang.id, lang.name)}
                      disabled={isTranslating}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        targetLanguage === lang.id && (isTranslating || translatedScript)
                          ? 'bg-[#09090b] text-white'
                          : 'bg-white dark:bg-neutral-800/50 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-[#09090b]/5 hover:border-[#09090b]/30 hover:text-[#09090b]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
                
                {translationError && (
                  <div className="text-sm text-red-600 flex items-center gap-1 mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {translationError}
                  </div>
                )}
                
                {isTranslating && (
                  <div className="flex items-center gap-2 text-[#09090b] text-sm mt-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الترجمة...
                  </div>
                )}
                
                {translatedScript && !isTranslating && (
                  <motion.div
                    key="translated-script-container"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-5 bg-[#09090b]/5 dark:bg-[#09090b]/10 rounded-xl border border-[#09090b]/20 dark:border-[#09090b]/30 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#09090b]/10 dark:border-[#09090b]/20">
                      <span className="font-bold text-[#09090b] text-sm">{extractFormat === 'srt' ? 'النص المترجم (SRT)' : 'النص المترجم'}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={copyTranslatedToClipboard}
                          className="text-neutral-500 dark:text-neutral-400 hover:text-[#09090b] text-xs flex items-center gap-1 font-medium bg-white dark:bg-neutral-800 px-2 py-1 rounded border border-black/5 dark:border-white/5"
                        >
                          {translatedCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {translatedCopied ? 'تم النسخ' : 'نسخ'}
                        </button>
                        <button 
                          onClick={() => downloadFile(translatedScript, extractFormat === 'srt' ? `subtitles_${targetLanguage}.srt` : `transcript_${targetLanguage}.txt`, extractFormat === 'srt')}
                          className="text-neutral-500 dark:text-neutral-400 hover:text-[#09090b] text-xs flex items-center gap-1 font-medium bg-white dark:bg-neutral-800 px-2 py-1 rounded border border-black/5 dark:border-white/5"
                        >
                          <Download className="w-3 h-3" />
                          {extractFormat === 'srt' ? 'تحميل SRT' : 'تحميل TXT'}
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={translatedScript}
                      onChange={(e) => setTranslatedScript(e.target.value)}
                      className="w-full bg-transparent border border-transparent hover:border-[#09090b]/30 focus:border-[#09090b]/50 focus:bg-white dark:focus:bg-neutral-900 rounded-lg p-3 resize-y min-h-[200px] whitespace-pre-wrap leading-relaxed text-neutral-800 dark:text-neutral-100 text-left focus:ring-0 focus:outline-none transition-colors" 
                      dir="ltr" 
                      style={{ fontFamily: 'monospace' }}
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* TTS Section */}
            {extractFormat === 'text' && (
              <div className="px-6 py-6 bg-neutral-50 dark:bg-neutral-900/50 border-t border-black/5 dark:border-white/5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-200">
                    <FileAudio className="w-4 h-4 text-[#09090b]" />
                    تصدير كصوت إعلاني (TTS):
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">اختيار الصوت</label>
                      <select 
                        value={voiceGender} 
                        onChange={(e) => setVoiceGender(e.target.value as any)}
                        className="w-full bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-neutral-900 dark:text-white"
                      >
                        <option value="Puck">صوت رجالي</option>
                        <option value="Kore">صوت نسائي</option>
                      </select>
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">تعليمات الأسلوب (Style Instructions)</label>
                      <input 
                        type="text" 
                        value={voiceStyle}
                        onChange={(e) => setVoiceStyle(e.target.value)}
                        placeholder="مثال: بحماس وطاقة عالية مثل الإعلانات التجارية"
                        className="w-full bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex text-neutral-500 dark:text-neutral-400 text-xs mb-1">
                     * سيتم تحويل النص ({translatedScript ? 'المترجم' : 'الأصلي'}) إلى صوت إعلاني جاهز.
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleGenerateTTS(translatedScript || script)}
                      disabled={ttsLoading}
                      className="bg-[#09090b] hover:bg-[#09090b]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {ttsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileAudio className="w-4 h-4" />}
                      {ttsLoading ? 'جاري الإنشاء...' : 'إنشاء الصوت الإعلاني'}
                    </button>
                    {ttsStatus && ttsLoading && (
                      <span className="text-sm font-medium text-[#09090b]">
                        {ttsStatus}
                      </span>
                    )}
                    {ttsError && !ttsLoading && (
                      <div className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {ttsError}
                      </div>
                    )}
                  </div>

                  {ttsAudio && !ttsLoading && (
                    <motion.div 
                      key="tts-result-container"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-4 bg-white dark:bg-neutral-800 border border-[#09090b]/20 dark:border-[#09090b]/30 rounded-xl shadow-sm flex flex-col gap-3"
                    >
                      <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">الصوت الإعلاني الجاهز:</span>
                      <audio src={ttsAudio} controls className="w-full h-10" />
                      <div className="flex justify-end">
                        <a 
                          href={ttsAudio} 
                          download={`ad_voiceover_${Date.now()}.mp3`}
                          className="text-[#09090b] dark:text-[#09090b] hover:text-[#09090b]/80 dark:hover:text-[#09090b]/80 text-sm font-medium flex items-center gap-1 bg-[#09090b]/5 dark:bg-[#09090b]/10 px-3 py-1.5 rounded-lg transition-colors border border-[#09090b]/10 dark:border-[#09090b]/20"
                        >
                          <Download className="w-4 h-4" />
                          تحميل الملف الصوتي (.mp3)
                        </a>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {!script && !extractLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 sm:mt-24">
          {[
            { icon: Languages, title: 'كل اللغات', desc: 'يتعرف تلقائياً على أي لغة في الفيديو ويقوم بتفريغها.' },
            { icon: Video, title: 'منصات متعددة', desc: 'يدعم تيك توك، إنستجرام، وفيسبوك.' },
            { icon: FileText, title: 'دقة عالية', desc: 'يستخدم أحدث نماذج الذكاء الاصطناعي لضمان أفضل النتائج.' }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-neutral-800"
            >
              <feature.icon className="w-8 h-8 text-[#09090b] mb-4" />
              <h3 className="font-bold mb-2 text-neutral-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
