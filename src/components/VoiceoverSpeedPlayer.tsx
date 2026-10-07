import React, { useState, useRef, useEffect } from 'react';
import { Download, Gauge, Zap, Loader2, Sparkles, RefreshCw, Check } from 'lucide-react';
import { adjustAudioSpeed } from '../utils/audioSpeed';
import { CustomVoiceSelect } from './CustomVoiceSelect';

interface VoiceoverSpeedPlayerProps {
  id: string | number;
  title?: string;
  audioUrls: { wav: string; mp3: string };
  defaultSpeed?: number;
  onVoiceChange?: (newVoice: string) => void;
  selectedVoice?: string;
  onRegenerate?: (voice?: string) => void;
  isRegenerating?: boolean;
  t?: (key: string) => string;
}

const SPEED_OPTIONS = [
  { value: 1.0, label: '1.0x', desc: 'طبيعي' },
  { value: 1.15, label: '1.15x', desc: 'سريع' },
  { value: 1.25, label: '1.25x ⭐', desc: 'إعلاني مثالي', recommended: true },
  { value: 1.35, label: '1.35x', desc: 'حماسي' },
  { value: 1.5, label: '1.5x', desc: 'سريع جداً' }
];

export const VoiceoverSpeedPlayer: React.FC<VoiceoverSpeedPlayerProps> = ({
  id,
  title,
  audioUrls,
  defaultSpeed = 1.25,
  onVoiceChange,
  selectedVoice,
  onRegenerate,
  isRegenerating = false,
  t = (k) => k
}) => {
  const [speed, setSpeed] = useState<number>(defaultSpeed);
  const [isProcessingDownload, setIsProcessingDownload] = useState<'wav' | 'mp3' | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync playback speed whenever audio loads or speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed, audioUrls]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const handleDownload = async (format: 'wav' | 'mp3') => {
    setIsProcessingDownload(format);
    try {
      let downloadUrl = format === 'wav' ? audioUrls.wav : audioUrls.mp3;
      let filename = `voiceover-${id}-${speed}x.${format}`;

      if (speed !== 1.0) {
        const sourceUrl = format === 'wav' ? audioUrls.wav : audioUrls.mp3;
        const result = await adjustAudioSpeed(sourceUrl, speed);
        downloadUrl = format === 'wav' ? result.wav : result.mp3;
      }

      // Trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(format);
      setTimeout(() => setDownloadSuccess(null), 2500);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsProcessingDownload(null);
    }
  };

  return (
    <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm transition-all">
      {/* Player header with speed indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-700/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#09090b] text-white flex items-center justify-center text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-[#F0B21B]" />
          </div>
          <span className="text-xs font-bold text-[#09090b] dark:text-white">
            {title || `التعليق الصوتي #${id}`}
          </span>
        </div>

        {/* Speed status tag */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F0B21B]/15 text-amber-800 dark:text-[#F0B21B] border border-[#F0B21B]/30">
          <Gauge className="w-3.5 h-3.5" />
          <span>سرعة التشغيل والحفظ: {speed}x</span>
        </div>
      </div>

      {/* Audio player */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <audio
          ref={audioRef}
          controls
          className="w-full sm:flex-1 h-10 accent-[#09090b]"
          src={audioUrls.mp3}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              audioRef.current.playbackRate = speed;
            }
          }}
          onPlay={() => {
            if (audioRef.current) {
              audioRef.current.playbackRate = speed;
            }
          }}
        >
          {t("متصفحك لا يدعم تشغيل الصوت.")}
        </audio>

        {/* Download Buttons with active speed */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => handleDownload('wav')}
            disabled={isProcessingDownload !== null}
            className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-[#09090b] dark:hover:border-[#F0B21B] text-[#09090b] dark:text-zinc-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            title={`تحميل WAV بسرعة ${speed}x`}
          >
            {isProcessingDownload === 'wav' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#09090b]" />
            ) : downloadSuccess === 'wav' ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[#09090b] dark:text-[#F0B21B]" />
            )}
            <span>WAV ({speed}x)</span>
          </button>

          <button
            onClick={() => handleDownload('mp3')}
            disabled={isProcessingDownload !== null}
            className="px-3.5 py-2 bg-[#F0B21B] hover:bg-[#DF9F10] text-[#09090b] rounded-xl text-xs font-black transition-all shadow-md shadow-[#F0B21B]/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            title={`تحميل MP3 بسرعة ${speed}x`}
          >
            {isProcessingDownload === 'mp3' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#09090b]" />
            ) : downloadSuccess === 'mp3' ? (
              <Check className="w-3.5 h-3.5 text-emerald-700" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[#09090b]" />
            )}
            <span>MP3 ({speed}x)</span>
          </button>
        </div>
      </div>

      {/* Speed Selector Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300">
          <Gauge className="w-4 h-4 text-[#09090b] dark:text-[#F0B21B]" />
          <span>تحكم في سرعة الصوت (استمع وحفظ سريعاً):</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {SPEED_OPTIONS.map((opt) => {
            const isSelected = speed === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSpeedChange(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-[#09090b] text-white shadow-md shadow-[#09090b]/20 scale-105'
                    : 'bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-[#09090b] dark:hover:border-[#F0B21B]'
                }`}
                title={`${opt.label} - ${opt.desc}`}
              >
                <span>{opt.label}</span>
                <span className={`text-[10px] opacity-80 ${isSelected ? 'text-[#F0B21B]' : 'text-zinc-400'}`}>
                  ({opt.desc})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Re-generate voice section if passed */}
      {onRegenerate && onVoiceChange && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-700/80 bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F0B21B] shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("إعادة التوليد بصوت مختلف:")}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <CustomVoiceSelect
              size="sm"
              value={selectedVoice || 'auto'}
              onChange={onVoiceChange}
              className="w-44 sm:w-52"
            />
            <button
              onClick={() => onRegenerate(selectedVoice)}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#09090b] to-[#27272a] hover:from-[#18181b] hover:to-[#09090b] shadow-md shadow-[#09090b]/20 text-white rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t("جاري التوليد...")}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t("إعادة التوليد")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceoverSpeedPlayer;
