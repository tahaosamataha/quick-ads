import React, { useState } from 'react';
import { 
  Video, 
  Link as LinkIcon, 
  Loader2, 
  AlertCircle, 
  Download,
  Headphones,
  ClipboardPaste
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';

interface DownloadOption {
  quality: string;
  downloadUrl: string;
  type?: 'video' | 'audio';
  originalUrl?: string;
}

const DownloadItem: React.FC<{ d: DownloadOption }> = ({ d }) => {
  const [format, setFormat] = useState('');

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (format) {
      e.preventDefault();
      const url = `${d.downloadUrl}&format=${format}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg border border-black/5 dark:border-white/5">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100 px-2">{d.quality}</span>
        {d.type && (
          <select 
            value={format} 
            onChange={(e) => setFormat(e.target.value)}
            className="text-xs bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded px-2 py-1 outline-none focus:border-[#09090b] text-neutral-900 dark:text-neutral-100"
          >
            <option value="">الصيغة الأصلية</option>
            {d.type === 'video' ? (
              <>
                <option value="mp4">MP4</option>
                <option value="webm">WEBM</option>
              </>
            ) : (
              <>
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
              </>
            )}
          </select>
        )}
      </div>
      <a 
        href={d.downloadUrl}
        onClick={handleDownload}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-10 h-10 bg-[#09090b]/10 hover:bg-[#09090b]/20 text-[#09090b] rounded-lg transition-colors"
        title="تحميل"
      >
        <Download className="w-5 h-5" />
      </a>
    </div>
  );
};

export default function DownloadPage() {
  const [downloadUrls, setDownloadUrls] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{title: string, thumbnail: string, downloads: DownloadOption[]} | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [clipboardError, setClipboardError] = useState('');
  const [batchType, setBatchType] = useState('video');
  const [batchProgress, setBatchProgress] = useState('');

  const handleGetVideoInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadUrls.trim()) return;

    setInfoLoading(true);
    setDownloadError('');
    setVideoInfo(null);
    setBatchProgress('');

    if (isBatchMode) {
      // Client-Side Batch Download logic
      try {
        const urlsList = downloadUrls.split('\n').map(u => u.trim()).filter(Boolean);
        if (urlsList.length === 0) throw new Error("يرجى إدخال روابط صالحة");
        if (urlsList.length > 30) throw new Error("الحد الأقصى هو 30 رابط في المرة الواحدة");

        const zip = new JSZip();
        let successCount = 0;

        for (let i = 0; i < urlsList.length; i++) {
          const url = urlsList[i];
          try {
            setBatchProgress(`جاري تجهيز الرابط ${i + 1} من ${urlsList.length}...`);
            
            const response = await fetch('/api/video-info', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url })
            });

            if (!response.ok) continue;
            
            const data = await response.json();
            if (!data.downloads || data.downloads.length === 0) continue;

            let targetDownload = null;
            if (batchType === 'audio') {
              targetDownload = data.downloads.find((d: any) => d.type === 'audio' || d.quality.includes('صوت')) || data.downloads[0];
            } else if (batchType === 'hd') {
               // naive check assuming height exists or first is best
              targetDownload = data.downloads.find((d: any) => typeof d.height === 'number') || data.downloads[0];
            } else {
              targetDownload = data.downloads[0];
            }

            if (!targetDownload) continue;

            setBatchProgress(`جاري تحميل الفيديو/الصوت ${i + 1} من ${urlsList.length}...`);

            let mediaUrl = targetDownload.downloadUrl;
            // if media URL is external (fast scrapers direct link), proxy it to bypass CORS
            if (mediaUrl.startsWith('http')) {
              mediaUrl = `/api/proxy-media?url=${encodeURIComponent(mediaUrl)}`;
            }

            const mediaRes = await fetch(mediaUrl);
            if (!mediaRes.ok) continue;

            const blob = await mediaRes.blob();
            
            let ext = batchType === 'audio' ? 'mp3' : 'mp4';
            if (targetDownload.downloadUrl.includes('.webm')) ext = 'webm';

            zip.file(`media_${i+1}.${ext}`, blob);
            successCount++;

          } catch (err) {
            console.error(`Error processing ${url}`, err);
          }
        }

        if (successCount === 0) {
          throw new Error("لم نتمكن من إتمام تحميل أي ملف. تأكد من الروابط.");
        }

        setBatchProgress(`جاري إنشاء الملف المضغوط (قد يستغرق بعض الوقت)...`);
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const downloadUrl = window.URL.createObjectURL(zipBlob);
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Downloadmate-Batch-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        a.remove();
        
      } catch (err: any) {
        setDownloadError(err.message || "حدث خطأ غير متوقع");
      } finally {
        setInfoLoading(false);
        setBatchProgress('');
      }
      return;
    }

    try {
      const response = await fetch('/api/video-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: downloadUrls.trim() })
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'فشل جلب معلومات الفيديو');
        } else {
          throw new Error('فشل جلب معلومات الفيديو. تأكد من صحة الرابط.');
        }
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('جاري بدء تشغيل الخادم، يرجى المحاولة مرة أخرى بعد قليل.');
      }
      const data = await response.json();
      
      setVideoInfo(data);
    } catch (err: any) {
      console.error("Video info error:", err);
      setDownloadError(err.message || 'حدث خطأ أثناء جلب معلومات الفيديو');
    } finally {
      setInfoLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-8 max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
          تحميل الفيديو <br />
          <span className="text-[#09090b]">بسهولة</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-xl mx-auto mb-6">
          قم بتحميل الفيديوهات من تيك توك، إنستجرام، وفيسبوك بجودات مختلفة بنقرة واحدة.
        </p>
        
        <div className="flex justify-center gap-2">
          <button 
            onClick={() => setIsBatchMode(false)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${!isBatchMode ? 'bg-[#09090b] text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'}`}
          >
            رابط واحد
          </button>
          <button 
            onClick={() => setIsBatchMode(true)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${isBatchMode ? 'bg-[#09090b] text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'}`}
          >
            روابط متعددة (ملف مضغوط)
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl shadow-black/5 border border-black/5 dark:border-white/5 p-2 mb-8">
        <form onSubmit={handleGetVideoInfo} className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
              <div className="absolute top-4 left-4 flex items-center pointer-events-none">
                <LinkIcon className="w-5 h-5 text-neutral-400" />
              </div>
              {isBatchMode ? (
                <textarea
                  placeholder="ضع روابط الفيديوهات هنا (رابط واحد في كل سطر)..."
                  className="w-full pl-12 pr-12 py-4 bg-transparent border-none focus:ring-0 text-lg placeholder:text-neutral-400 min-h-[120px] resize-y text-neutral-900 dark:text-white"
                  value={downloadUrls}
                  onChange={(e) => setDownloadUrls(e.target.value)}
                  dir="ltr"
                  required
                />
              ) : (
                <input
                  type="url"
                  placeholder="ضع رابط الفيديو للتحميل..."
                  className="w-full pl-12 pr-12 py-4 bg-transparent border-none focus:ring-0 text-lg placeholder:text-neutral-400 text-neutral-900 dark:text-white"
                  value={downloadUrls}
                  onChange={(e) => setDownloadUrls(e.target.value)}
                  dir="ltr"
                  required
                />
              )}
              {navigator.clipboard && !infoLoading && !isBatchMode && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setClipboardError('');
                      const text = await navigator.clipboard.readText();
                      if (text) setDownloadUrls(text);
                    } catch (err: any) {
                      setClipboardError('لم نتمكن من الوصول للحافظة بسبب قيود المتصفح.');
                      setTimeout(() => setClipboardError(''), 4000);
                    }
                  }}
                  className="absolute top-4 right-4 flex items-center text-neutral-400 hover:text-[#09090b] transition-colors"
                  title="لصق من الحافظة"
                >
                  <ClipboardPaste className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {isBatchMode && (
            <div className="px-4 py-2 flex items-center gap-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
               <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200 border-l border-neutral-300 dark:border-neutral-700 pl-4 ml-4">تحميل كـ:</span>
               <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-700 dark:text-neutral-200">
                 <input type="radio" name="btype" value="video" checked={batchType === 'video'} onChange={() => setBatchType('video')} className="accent-[#09090b] w-4 h-4" /> فيديو 
               </label>
               <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-700 dark:text-neutral-200">
                 <input type="radio" name="btype" value="hd" checked={batchType === 'hd'} onChange={() => setBatchType('hd')} className="accent-[#09090b] w-4 h-4" /> فيديو (HD)
               </label>
               <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-700 dark:text-neutral-200">
                 <input type="radio" name="btype" value="audio" checked={batchType === 'audio'} onChange={() => setBatchType('audio')} className="accent-[#09090b] w-4 h-4" /> صوت (MP3)
               </label>
            </div>
          )}

          <button
            type="submit"
            disabled={infoLoading}
            className="bg-[#09090b] hover:bg-[#09090b]/90 disabled:bg-[#09090b]/50 text-white px-8 py-4 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1 w-full mt-2 shadow-lg shadow-[#09090b]/20"
          >
            {infoLoading ? (
               <div className="flex items-center justify-center gap-2">
                 <Loader2 className="w-5 h-5 animate-spin" /> {isBatchMode && batchProgress ? batchProgress : 'جاري العمل...'}
               </div>
            ) : (isBatchMode ? 'تجهيز وتحميل ZIP' : 'جلب الروابط')}
          </button>
        </form>
        {clipboardError && (
          <p className="text-red-500 text-sm mt-2 px-2 pb-1">{clipboardError}</p>
        )}
      </div>

      <AnimatePresence>
        {downloadError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl mb-6 border border-red-100 dark:border-red-800/30"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{downloadError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {videoInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 p-6 mb-8"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-[#09090b]" />
              روابط التحميل المتاحة
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {videoInfo.thumbnail && (
                <img 
                  src={videoInfo.thumbnail} 
                  alt="Video Thumbnail" 
                  className="w-32 h-20 object-cover rounded-lg border border-black/5 dark:border-white/5"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-neutral-800 dark:text-neutral-100 mb-3 line-clamp-1" dir="auto">
                  {videoInfo.title}
                </p>
                <div className="flex flex-wrap gap-2">
                  {videoInfo.downloads.map((d, i) => (
                    <DownloadItem key={i} d={d} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!videoInfo && !infoLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 sm:mt-24">
          {[
            { icon: Video, title: 'جودات متعددة', desc: 'اختر الجودة المناسبة لك من بين عدة خيارات متاحة.' },
            { icon: Download, title: 'تحميل مباشر', desc: 'روابط تحميل مباشرة وسريعة بدون إعلانات مزعجة.' },
            { icon: Headphones, title: 'صوت أو فيديو', desc: 'إمكانية تحميل الفيديو كامل أو الصوت فقط.' }
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
