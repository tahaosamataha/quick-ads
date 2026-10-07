import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Play, Square, ChevronDown, Check, Loader2 } from 'lucide-react';
import { generateSpeech } from '../services/ai';

export const voiceOptions = [
  { value: 'auto', label: 'تلقائي', type: 'general' },
  { value: 'clone', label: 'استنساخ (ملف)', type: 'general' },
  { value: 'male', label: 'ذكر (عشوائي)', type: 'general' },
  { value: 'female', label: 'أنثى (عشوائي)', type: 'general' },
  { value: 'male_Puck', label: 'Puck', type: 'male' },
  { value: 'male_Charon', label: 'Charon', type: 'male' },
  { value: 'male_Fenrir', label: 'Fenrir', type: 'male' },
  { value: 'male_Orus', label: 'Orus', type: 'male' },
  { value: 'male_Enceladus', label: 'Enceladus', type: 'male' },
  { value: 'male_Achird', label: 'Achird', type: 'male' },
  { value: 'male_Alnilam', label: 'Alnilam', type: 'male' },
  { value: 'female_Aoede', label: 'Aoede', type: 'female' },
  { value: 'female_Kore', label: 'Kore', type: 'female' },
  { value: 'female_Zephyr', label: 'Zephyr', type: 'female' },
  { value: 'female_Leda', label: 'Leda', type: 'female' },
  { value: 'female_Laomedeia', label: 'Laomedeia', type: 'female' },
  { value: 'female_Callirrhoe', label: 'Callirrhoe', type: 'female' },
  { value: 'female_Despina', label: 'Despina', type: 'female' },
  { value: 'female_Gacrux', label: 'Gacrux', type: 'female' },
];

export function CustomVoiceSelect({ 
  value, 
  onChange, 
  className = '',
  size = 'md'
}: { 
  value: string, 
  onChange: (val: string) => void, 
  className?: string,
  size?: 'sm' | 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<string | null>(null);
  const [audioCache, setAudioCache] = useState<Record<string, HTMLAudioElement>>({});
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  }>({ left: 0, width: 220 });

  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!selectRef.current) return;
    const rect = selectRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // If not enough room below (less than 280px) and more space above, open upwards
    const openUp = spaceBelow < 280 && spaceAbove > spaceBelow;
    
    const minWidth = Math.max(rect.width, 220);
    const isRtl = document.documentElement.dir === 'rtl' || 
                  document.body.dir === 'rtl' || 
                  (window.getComputedStyle(selectRef.current).direction === 'rtl');
    
    let left = isRtl ? (rect.right - minWidth) : rect.left;
    if (left < 10) left = 10;
    if (left + minWidth > window.innerWidth - 10) {
      left = Math.max(10, window.innerWidth - minWidth - 10);
    }

    setCoords({
      top: openUp ? undefined : Math.round(rect.bottom + 4),
      bottom: openUp ? Math.round(window.innerHeight - rect.top + 4) : undefined,
      left: Math.round(left),
      width: Math.round(minWidth),
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        selectRef.current && 
        !selectRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Clean up playing audio
      Object.values(audioCache).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [audioCache]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  const handlePlaySample = async (e: React.MouseEvent, voiceVal: string) => {
    e.stopPropagation();
    
    if (playingVoice === voiceVal) {
      audioCache[voiceVal]?.pause();
      setPlayingVoice(null);
      return;
    }

    if (playingVoice && audioCache[playingVoice]) {
      audioCache[playingVoice].pause();
      audioCache[playingVoice].currentTime = 0;
    }

    if (audioCache[voiceVal]) {
      setPlayingVoice(voiceVal);
      audioCache[voiceVal].play();
      return;
    }

    try {
      setLoadingVoice(voiceVal);
      const text = "أهلاً بك، هذه عينة صوتية من اختياري لك.";
      const urls = await generateSpeech(text, "", "sample", voiceVal);
      
      const audio = new Audio(urls.mp3);
      audio.onended = () => setPlayingVoice(null);
      
      setAudioCache(prev => ({ ...prev, [voiceVal]: audio }));
      setLoadingVoice(null);
      setPlayingVoice(voiceVal);
      audio.play();
    } catch (err) {
      console.error(err);
      setLoadingVoice(null);
      setPlayingVoice(null);
    }
  };

  const selectedOption = voiceOptions.find(o => o.value === value) || voiceOptions[0];

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => {
          updatePosition();
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] outline-none transition-colors text-right cursor-pointer ${
          size === 'sm' 
            ? 'px-3 py-1.5 text-xs sm:text-sm rounded-lg h-9' 
            : 'p-3 rounded-xl'
        }`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={`shrink-0 transition-transform ${size === 'sm' ? 'w-3.5 h-3.5 ms-1.5' : 'w-4 h-4 ms-2'} ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: coords.top !== undefined ? `${coords.top}px` : undefined,
            bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            zIndex: 999999,
          }}
          className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl max-h-64 overflow-auto py-1"
        >
          {['general', 'male', 'female'].map(type => {
            const groupOptions = voiceOptions.filter(o => o.type === type);
            if (groupOptions.length === 0) return null;
            
            return (
              <div key={type}>
                <div className="px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50">
                  {type === 'general' ? 'خيارات عامة' : type === 'male' ? 'أصوات رجالية' : 'أصوات نسائية'}
                </div>
                {groupOptions.map(option => (
                  <div
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-amber-50 dark:bg-zinc-900 dark:hover:bg-fuchsia-900/20 ${value === option.value ? 'bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/30' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-900 dark:text-zinc-100">{option.label}</span>
                      {value === option.value && <Check className="w-4 h-4 text-[#F0B21B]" />}
                    </div>
                    {option.value !== 'auto' && option.value !== 'clone' && option.value !== 'male' && option.value !== 'female' && (
                      <button
                        type="button"
                        onClick={(e) => handlePlaySample(e, option.value)}
                        className="p-1.5 rounded-full hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] transition-colors"
                        title="تشغيل عينة"
                      >
                        {loadingVoice === option.value ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : playingVoice === option.value ? (
                          <Square className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
