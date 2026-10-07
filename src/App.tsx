import { buildBrandKitPrompt } from './utils/brandKit';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, createContext , useRef, useEffect } from 'react';
import { Trash2, Bot, Radar, Star, Filter, ThumbsUp, ThumbsDown, Target, Lightbulb, Upload, Image as ImageIcon, Loader2, Download, AlertCircle, X, Globe, Type as TypeIcon, Camera, LayoutTemplate, Check, FileText, Copy, Moon, Sun, Wand2, Mic, Link as LinkIcon, LogIn, LogOut, Menu, Film, History, RefreshCw, Video, Zap, TrendingUp, MousePointer, ArrowRight, Play, ChevronDown, ChevronUp, Home, Folder, Box, BarChart2, Settings, Sparkles, Share2, Quote, Calculator, Brain, Clipboard, Palette, User as UserIcon } from 'lucide-react';
import { analyzeProduct, generateBackgroundImage, generateScenePrompts, LandingPageSection, analyzeAdCreatives, generateVideoScript, generateFbAdCopies, generateFunnelCopy, extractProductData, generateSpeech, generateVideoScenes, generateWinnerAngleScripts, extractWinnerVideoDetails, generateCreativeImagePrompts, generateTextOnVisual, generateSmartAngles, generateFlowCharacter } from './services/ai';
import DownloadPage from './components/DownloadPage';
import ExtractPage from './components/ExtractPage';
import PricingCalculator from './components/PricingCalculator';
import ProductBrainPage, { ProductBrainPageRef } from './components/ProductBrainPage';
import MarketingLandingPage from './components/MarketingLandingPage';
import LandingPageBuilder, { LandingPageBuilderRef } from './components/LandingPageBuilder';
import { ProductSpy } from './components/ProductSpy';
import { AutoSuite } from './components/AutoSuite';
import { AdsMetricsAnalyzer } from './components/AdsMetricsAnalyzer';
import { CPAReductionPlanner } from './components/CPAReductionPlanner';

import SettingsPage from './components/SettingsPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { Dashboard } from './components/Dashboard';
import { VoiceoverSpeedPlayer } from './components/VoiceoverSpeedPlayer';
import ReactMarkdown from 'react-markdown';
import { TemplateRenderer } from './components/Templates';
import { AdTemplateRenderer } from './components/AdTemplates';
import UtmBuilder from './components/UtmBuilder';
import * as htmlToImage from 'html-to-image';
import LZString from 'lz-string';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { deductTokens, checkBalance, TOKEN_COSTS } from './services/billing';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, deleteDoc, doc, getDoc, setDoc, updateDoc, limit } from 'firebase/firestore';
import { useLanguage } from './LanguageContext';
import { handleFirestoreError, OperationType } from './services/firestore-errors';
import { CustomVoiceSelect } from './components/CustomVoiceSelect';

export const AppContext = createContext<any>(null);

export default function App() {
  const { t, language, toggleLanguage } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [guestMode, setGuestMode] = useState<boolean>(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [agencyOwnerProfile, setAgencyOwnerProfile] = useState<any>(null);
  const [agencyMemberInfo, setAgencyMemberInfo] = useState<any>(null);
  const [activeBrandKit, setActiveBrandKit] = useState<any>(null);
  const [applyBrandKit, setApplyBrandKit] = useState<boolean>(true);
  
  const productBrainRef = useRef<ProductBrainPageRef>(null);
  const landingPageBuilderRef = useRef<LandingPageBuilderRef>(null);

  if (window.location.pathname === '/privacy-policy') {
    return <PrivacyPolicy />;
  }

  if (window.location.pathname === '/terms-of-service') {
    return <TermsOfService />;
  }

  const isToolAllowed = (toolId: string) => {
    if (!agencyMemberInfo) return true;
    if (['dashboard', 'history', 'settings', 'pricing', 'extractor', 'downloader', 'utmBuilder', 'productBrain', 'landingBuilder', 'smartAngles', 'flowCharacter', 'productSpy', 'autoSuite'].includes(toolId)) return true;
    if (agencyMemberInfo.permissions?.includes('all')) return true;
    return agencyMemberInfo.permissions?.includes(toolId);
  };

  useEffect(() => {
    let unsubTeam: (() => void) | null = null;
    let unsubOwnerProfile: (() => void) | null = null;
    let unsubProfile: (() => void) | null = null;

    const cleanupListeners = () => {
      if (unsubTeam) { unsubTeam(); unsubTeam = null; }
      if (unsubOwnerProfile) { unsubOwnerProfile(); unsubOwnerProfile = null; }
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      
      cleanupListeners();

      if (currentUser) {
         try {
            const agencyTeamsRef = collection(db, 'agencyTeams');
            const aq = query(agencyTeamsRef, where('email', '==', currentUser.email));
            getDocs(aq).then((snap) => {
               if (!snap.empty) {
                  const teamData = { id: snap.docs[0].id, ...(snap.docs[0].data() as any) };
                  setAgencyMemberInfo(teamData);
                  
                  // Fetch agency owner's balance
                  if (teamData.agencyId) {
                      const ownerRef = doc(db, 'users', teamData.agencyId);
                      getDoc(ownerRef).then((ownerSnap) => {
                          if (ownerSnap.exists()) {
                              setAgencyOwnerProfile(ownerSnap.data());
                          }
                      }).catch((error) => {
                          console.error('Agency owner sync error ignored on logout', error);
                      });
                  }
               } else {
                  setAgencyMemberInfo(null);
                  setAgencyOwnerProfile(null);
               }
            }).catch((error) => {
               if (!String(error).includes('Quota')) console.error('Agency team sync error ignored on logout', error);
            });
         } catch (e) {
            if (!String(e).includes('Quota')) console.error("Error setting up team listener:", e);
         }

         const userRef = doc(db, 'users', currentUser.uid);
         getDoc(userRef).then(snap => {
            if (!snap.exists()) {
                setDoc(userRef, {
                   uid: currentUser.uid,
                   email: currentUser.email || '',
                   name: currentUser.displayName || '',
                   role: (currentUser.email === 'elashory7@gmail.com' || currentUser.email === 'taha.mediabuyer@gmail.com') ? 'owner' : 'member',
                   language: 'ar',
                   plan: 'Free',
                   tokens: 50,
                   lastActiveAt: Date.now(),
                   createdAt: new Date().toISOString()
                }).catch(err => {
                  if (!String(err).includes('Quota')) console.error("Error creating user profile", err);
                });
            } else {
                const updates: any = {};
                if ((currentUser.email === 'elashory7@gmail.com' || currentUser.email === 'taha.mediabuyer@gmail.com') && snap.data().role !== 'owner') {
                   updates.role = 'owner';
                }
                if (Object.keys(updates).length > 0) {
                   updateDoc(userRef, updates).catch(err => {
                     if (!String(err).includes('Quota')) console.error("Error updating profile", err);
                   });
                }
            }
         }).catch(err => {
            if (!String(err).includes('Quota')) console.error("Error fetching user profile", err);
         });
         
         getDoc(userRef).then((snap) => {
            if (snap.exists()) {
               setUserProfile(snap.data());
            }
         }).catch((error) => {
            if (!String(error).includes('Quota')) console.error('User profile fetch error', error);
         });

         const q = query(collection(db, 'brandKits'), where('userId', '==', currentUser.uid), where('isActive', '==', true));
         getDocs(q).then(snap => {
            if (!snap.empty) {
               setActiveBrandKit(snap.docs[0].data());
            } else {
               setActiveBrandKit(null);
            }
         }).catch(err => {
            if (!String(err).includes('Quota')) console.error(err);
         });
      } else {
         setActiveBrandKit(null);
         setUserProfile(null);
         setAgencyMemberInfo(null);
         setAgencyOwnerProfile(null);
      }
    });
    
    return () => {
       cleanupListeners();
       unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request' || error.message?.includes('Pending promise')) {
        // User closed the popup or overlapping requests, silently ignore instead of showing ugly error
        return;
      }
      if (error.code === 'auth/invalid-credential' && error.message?.includes('invalid_client')) {
        setError(`${t("فشل تسجيل الدخول:")} The Google Sign-In client secret in your Firebase Console is invalid. Please go to Firebase Console -> Authentication -> Sign-in method -> Google and verify the Web client secret.`);
        return;
      }
      if (error.code === 'auth/unauthorized-domain') {
        setError(`${t("فشل تسجيل الدخول:")} النطاق الحالي غير مصرح به. يرجى الذهاب إلى إعدادات Firebase (Authentication -> Settings -> Authorized domains) وإضافة النطاق التالي: ${window.location.hostname}`);
        return;
      }
      if (error.code === 'auth/network-request-failed') {
        setError(`${t("فشل تسجيل الدخول:")} حدث خطأ في الاتصال بالشبكة. يرجى التأكد من اتصالك بالإنترنت، وتعطيل إضافات حظر الإعلانات، أو تجربة فتح التطبيق في علامة تبويب جديدة.`);
        return;
      }
      setError(`${t("فشل تسجيل الدخول:")} ${error.message || 'Unknown Error'}`);
    }
  };

  
  const handleFeedback = async (itemId: string, status: 'success' | 'fail') => {
    if (!user) {
      setHistory(prev => prev.map(item => item.id === itemId ? { ...item, feedback: status } : item));
      try {
        const localHist = JSON.parse(localStorage.getItem('quickads_guest_history') || '[]');
        const updated = localHist.map((item: any) => item.id === itemId ? { ...item, feedback: status } : item);
        localStorage.setItem('quickads_guest_history', JSON.stringify(updated));
      } catch (e) {}
      return;
    }
    try {
      await updateDoc(doc(db, 'history', itemId), { feedback: status });
      setHistory(prev => prev.map(item => item.id === itemId ? { ...item, feedback: status } : item));
    } catch (err) {
      console.error('Error updating feedback:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setGuestMode(true);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAiToolsOpen, setIsAiToolsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [images, setImages] = useState<{file: File, preview: string}[]>([]);
  const [description, setDescription] = useState('');
  const [productName, setProductName] = useState('');
  const [dialect, setDialect] = useState('saudi');
  const [targetAudience, setTargetAudience] = useState('');
  const [voiceGender, setVoiceGender] = useState('auto');
  const [fontFamily, setFontFamily] = useState('font-alexandria');
  const [themeColor, setThemeColor] = useState('text-yellow-400');
  const [customHex, setCustomHex] = useState('#3b82f6');
  const [textColor, setTextColor] = useState('text-white');
  const [textEffect, setTextEffect] = useState('none');
  const [showTextBackground, setShowTextBackground] = useState(true);
  const [designStyle, setDesignStyle] = useState<'tech' | 'lifestyle' | 'direct' | 'minimal' | 'elegant' | 'bold' | 'premium_custom'>('tech');
  const [pendingDesignStyle, setPendingDesignStyle] = useState<'tech' | 'lifestyle' | 'direct' | 'minimal' | 'elegant' | 'bold' | 'premium_custom' | null>(null);
  const [useAIGeneratedBackgrounds, setUseAIGeneratedBackgrounds] = useState(false);
  const [aiModel, setAiModel] = useState<'flash' | 'pro'>('flash');
  
  // Winner Angle State
  const [winnerVideo, setWinnerVideo] = useState<{ file: File, previewUrl: string, base64: string, mimeType: string } | null>(null);
  const [isGeneratingWinnerScripts, setIsGeneratingWinnerScripts] = useState(false);
  const [generatedWinnerScripts, setGeneratedWinnerScripts] = useState<{ type: string, content: string, voiceOverInstructions: string }[]>([]);
  const [isGeneratingWinnerAudio, setIsGeneratingWinnerAudio] = useState<{[key: number]: boolean}>({});
  const [winnerAudios, setWinnerAudios] = useState<{[key: number]: { wav: string, mp3: string }}>({});
  const [extractedWinnerScript, setExtractedWinnerScript] = useState<string>('');
  const [isExtractingWinnerScript, setIsExtractingWinnerScript] = useState(false);
  
  // Landing Page State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{ step: string; current: number; total: number }>({ step: '', current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<LandingPageSection[]>([]);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Only process paste if we are on a generator tab and not typing in an input/textarea
      const generatorTabs = ['photoshoot', 'landing', 'landingBuilder', 'ads', 'script', 'fbAds', 'funnelCopy', 'videoScenes', 'winnerAngle', 'creativePrompts', 'textOnVisual', 'productBrain', 'smartAngles', 'flowCharacter', 'productSpy'];
      if (!generatorTabs.includes(activeTab)) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const items = e.clipboardData?.items;
      if (items) {
        let addedImage = false;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const file = new File([blob], "pasted-image.png", { type: items[i].type });
              const newImage = {
                file,
                preview: URL.createObjectURL(file)
              };
              setImages(prev => [...prev, newImage]);
              addedImage = true;
            }
          }
        }
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [activeTab, setImages]);
  const [sectionBackgrounds, setSectionBackgrounds] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; section: string }[]>([]);
  
  // Photoshoot State
  const [isGeneratingPhotoshoot, setIsGeneratingPhotoshoot] = useState(false);
  const [photoshootProgress, setPhotoshootProgress] = useState<{ step: string; current: number; total: number }>({ step: '', current: 0, total: 0 });
  const [photoshootImages, setPhotoshootImages] = useState<{ url: string; prompt: string }[]>([]);
  const [selectedPhotoshootImages, setSelectedPhotoshootImages] = useState<Set<number>>(new Set());
  const [isTransferring, setIsTransferring] = useState(false);

  // Ads State
  const [isGeneratingAds, setIsGeneratingAds] = useState(false);
  const [adsProgress, setAdsProgress] = useState<{ step: string; current: number; total: number }>({ step: '', current: 0, total: 0 });
  const [generatedAds, setGeneratedAds] = useState<{ url: string; section: string }[]>([]);
  const [adSections, setAdSections] = useState<LandingPageSection[]>([]);
  const [adBackgrounds, setAdBackgrounds] = useState<string[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const cancelFlagRef = useRef(false);

  // Script State
  const [scriptDuration, setScriptDuration] = useState('15s');
  const [scriptCount, setScriptCount] = useState<number>(5);
  const [scriptGenMode, setScriptGenMode] = useState<'auto' | 'manual' | 'custom'>('manual');
  const [customScriptText, setCustomScriptText] = useState('');
  const [customScriptVoice, setCustomScriptVoice] = useState('auto');
  const [customScriptStyle, setCustomScriptStyle] = useState('');
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [selectedScriptTypes, setSelectedScriptTypes] = useState<string[]>([
    'UGC (محتوى عفوي وتجربة مستخدم)',
    'Direct Response (استجابة مباشرة وعرض قوي)',
    'Storytelling (قصة قصيرة تجذب الانتباه)',
    'Problem/Solution (عرض المشكلة وتقديم المنتج كحل)',
    'Educational/How-to (تعليمي / كيف تستخدم المنتج)'
  ]);
  const [selectedScriptGenders, setSelectedScriptGenders] = useState<string[]>(Array(10).fill('auto'));

  const handleScriptCountChange = (count: number) => {
    setScriptCount(count);
    setSelectedScriptTypes(prev => {
      const newTypes = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) {
          newTypes.push(scriptTypes[i % scriptTypes.length]);
        }
      } else if (count < prev.length) {
        newTypes.length = count;
      }
      return newTypes;
    });
    setSelectedScriptGenders(prev => {
      const newGenders = [...prev];
      if (count > prev.length) {
        for (let i = prev.length; i < count; i++) {
          newGenders.push('auto');
        }
      } else if (count < prev.length) {
        newGenders.length = count;
      }
      return newGenders;
    });
  };

  const [generatedScripts, setGeneratedScripts] = useState<{type: string, content: string, voiceOverInstructions: string, gender?: string, customVoice?: string}[] | null>(null);
  const [scriptAudios, setScriptAudios] = useState<{[key: number]: { wav: string, mp3: string }}>({});
  const [scriptSelectedVoices, setScriptSelectedVoices] = useState<{[key: number]: string}>({});
  const [winnerSelectedVoices, setWinnerSelectedVoices] = useState<{[key: number]: string}>({});
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<{[key: number]: boolean}>({});
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [autoGenerateVoiceover, setAutoGenerateVoiceover] = useState(true);
  const [scriptCopied, setScriptCopied] = useState<number | null>(null);
  const [historyItemCopied, setHistoryItemCopied] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // FB Ads State
  const [isGeneratingFbAds, setIsGeneratingFbAds] = useState(false);
  const [generatedFbAds, setGeneratedFbAds] = useState<{fbAds: {type: string, hook: string, body: string, cta: string}[], tiktokHeadlines: string[]} | null>(null);
  const [fbAdCopied, setFbAdCopied] = useState<number | null>(null);
  const [autoFbAngles, setAutoFbAngles] = useState(false);
  const [fbCampaignObjective, setFbCampaignObjective] = useState<string>('زيادة المبيعات (Sales)');
  const [selectedFbAdTypes, setSelectedFbAdTypes] = useState<string[]>([
    'القصة القصيرة والمشاعر (Storytelling & Emotion)',
    'العرض المباشر (Direct Offer)',
    'المشكلة والحل (Problem & Solution)',
    'الشهادات والتقييمات (Testimonial & Social Proof)',
    'الخوف من التفويت (FOMO & Urgency)'
  ]);

  // Funnel Copy State
  const [isGeneratingFunnelCopy, setIsGeneratingFunnelCopy] = useState(false);
  const [generatedFunnelCopy, setGeneratedFunnelCopy] = useState<string | null>(null);

  // Creative Prompts State
  const [creativePromptMode, setCreativePromptMode] = useState<'standalone' | 'carousel' | 'landing_page'>('standalone');
  const [creativeColorTheme, setCreativeColorTheme] = useState<string>('');
  const [landingPageSections, setLandingPageSections] = useState<string[]>(['الهيدر', 'مميزات المنتج', 'مواصفات المنتج', 'التقييمات', 'دعوة لاتخاذ إجراء (CTA)']);
  const [isGeneratingCreativePrompts, setIsGeneratingCreativePrompts] = useState(false);
  const [creativePromptCopied, setCreativePromptCopied] = useState<number | null>(null);
  const [generatedCreativePrompts, setGeneratedCreativePrompts] = useState<{ 
    concept: string, 
    visualStyle: string,
    layout: { background: string, productPlacement: string, extraElements: string[] },
    textOverlay: { headline: string, subheadline: string, callToAction: string },
    aiPrompt: string 
  }[]>([]);
  const [creativePromptsCount, setCreativePromptsCount] = useState<number>(3);

  // Video Scenes State
  const [isGeneratingVideoScenes, setIsGeneratingVideoScenes] = useState(false);
  const [videoGenerationMode, setVideoGenerationMode] = useState<'consecutive' | 'hooks' | 'frames' | 'single_15s' | 'consecutive_15s'>('consecutive');
  const [generatedVideoScenes, setGeneratedVideoScenes] = useState<{ sceneNumber: number, duration: string, prompt: string, script: string }[]>([]);
  const [funnelCopyCopied, setFunnelCopyCopied] = useState(false);
  const [funnelCopyLength, setFunnelCopyLength] = useState<'auto' | 'short' | 'long'>('auto');
  const [tiktokHeadlineCopied, setTiktokHeadlineCopied] = useState<number | null>(null);

  // Text On Visual State
  const [isGeneratingTextOnVisual, setIsGeneratingTextOnVisual] = useState(false);
  const [isGeneratingProductBrain, setIsGeneratingProductBrain] = useState(false);
  const [generatedTextOnVisual, setGeneratedTextOnVisual] = useState<string[]>([]);
  const [textOnVisualCount, setTextOnVisualCount] = useState<number>(5);
  const [textOnVisualMode, setTextOnVisualMode] = useState<'sequential' | 'high_ctr_fixed'>('sequential');

  // Smart Angles State
  const [isGeneratingSmartAngles, setIsGeneratingSmartAngles] = useState(false);
  const [generatedSmartAngles, setGeneratedSmartAngles] = useState<{title: string, hook: string, audience: string, angle: string}[]>([]);
  const [selectedSmartAngleIndex, setSelectedSmartAngleIndex] = useState<number | null>(null);

  // Flow Character State
  const [isGeneratingFlowCharacter, setIsGeneratingFlowCharacter] = useState(false);
  const [generatedFlowCharacter, setGeneratedFlowCharacter] = useState<string | null>(null);

  const [voiceCloneFile, setVoiceCloneFile] = useState<{base64: string, mimeType: string, filename: string} | null>(() => {
    try {
      const saved = localStorage.getItem('elashory_voice_clone');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleVoiceCloneUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // limit to audio files
    if (!file.type.startsWith('audio/')) {
      setError('يرجى اختيار ملف صوتي صحيح.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const cloneData = { base64, mimeType: file.type, filename: file.name };
      setVoiceCloneFile(cloneData);
      try {
        localStorage.setItem('elashory_voice_clone', JSON.stringify(cloneData));
      } catch (err) {
        console.warn("Could not save voice clone to localStorage (quota exceeded). It will be kept in memory only.");
      }
    };
    reader.readAsDataURL(file);
  };

  const removeVoiceClone = () => {
    setVoiceCloneFile(null);
    localStorage.removeItem('elashory_voice_clone');
  };

  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [sharedProject, setSharedProject] = useState<any>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      try {
        const localHist = JSON.parse(localStorage.getItem('quickads_guest_history') || '[]');
        setHistory(localHist);
      } catch (e) {
        setHistory([]);
      }
      setIsHistoryLoading(false);
      return;
    }
    setIsHistoryLoading(true);
    let q;
    if (agencyMemberInfo) {
      // Fetch agency's history
      q = query(
        collection(db, 'history'),
        where('agencyId', '==', agencyMemberInfo.agencyId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } else {
      q = query(
        collection(db, 'history'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }
    
    getDocs(q).then((querySnapshot) => {
      const historyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(historyData);
      setIsHistoryLoading(false);
    }).catch((error) => {
      if (!String(error).includes('Quota')) console.error("Error fetching history:", error);
      setIsHistoryLoading(false);
    });
  }, [user, agencyMemberInfo]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedDataStr = urlParams.get('shared');
    if (sharedDataStr) {
       try {
         const decompressed = LZString.decompressFromEncodedURIComponent(sharedDataStr);
         if (decompressed) {
            const parsedItem = JSON.parse(decompressed);
            setSharedProject(parsedItem);
         }
       } catch(e) {
         console.error('Failed to parse shared project', e);
       }
    }
  }, []);

  const removeCircular = (obj: any, cache = new Set()): any => {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (obj instanceof HTMLElement || obj.nodeType === 1) return undefined;
    if (cache.has(obj)) return '[Circular]';
    
    cache.add(obj);
    if (Array.isArray(obj)) {
      const arr = obj.map(item => removeCircular(item, cache));
      cache.delete(obj);
      return arr;
    }
    
    const clone: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clone[key] = removeCircular(obj[key], cache);
      }
    }
    cache.delete(obj);
    return clone;
  };

  const saveToHistory = async (type: string, content: any, productDescription: string) => {
    try {
      // Strip circular structures to prevent Firebase addDoc from failing
      const safeContent = removeCircular(content);
      
      const newDoc = {
        id: 'guest_' + Date.now(),
        userId: user ? String(user.uid) : 'guest_user',
        agencyId: agencyMemberInfo?.agencyId ? String(agencyMemberInfo.agencyId) : null,
        type: String(type),
        content: safeContent,
        description: String(productDescription || ''),
        createdAt: new Date().toISOString()
      };

      if (!user) {
        try {
          const localHist = JSON.parse(localStorage.getItem('quickads_guest_history') || '[]');
          const updated = [newDoc, ...localHist].slice(0, 50);
          localStorage.setItem('quickads_guest_history', JSON.stringify(updated));
          setHistory(updated);
        } catch (e) {
          setHistory(prev => [newDoc, ...prev]);
        }
        return;
      }
      
      const docRef = await addDoc(collection(db, 'history'), {
        ...newDoc,
        createdAt: serverTimestamp()
      });
      
      setHistory(prev => [{ ...newDoc, id: docRef.id }, ...prev]);
    } catch (error) {
      if (!String(error).includes('Quota')) console.error("Error saving to history:", error);
      handleFirestoreError(error, OperationType.CREATE, 'history');
    }
  };

  
  const updateHistoryStatus = async (id: string, status: 'success' | 'failed' | null) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'history', id), { status });
      setHistory(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    } catch (error) {
      console.error("Error updating history status:", error);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    console.log("Attempting to delete history item with id:", id);
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'history', id));
      setHistory(prev => prev.filter(item => item.id !== id));
      console.log("Successfully deleted history item:", id);
    } catch (error) {
      console.error("Error deleting history item:", error);
      if (!String(error).includes('Quota')) console.error("Error deleting history item details:", error);
      handleFirestoreError(error, OperationType.DELETE, 'history/' + id);
    }
  };

  const clearAllHistory = async () => {
    if (!user) return;
    
    try {
      setIsHistoryLoading(true);
      const historyIds = history.map(item => item.id);
      await Promise.all(historyIds.map(id => deleteDoc(doc(db, 'history', id))));
      setHistory([]);
      setShowClearConfirm(false);
    } catch (error) {
      console.error("Error clearing history:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const toggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'history', id), { isFavorite: !currentStatus });
      setHistory(prev => prev.map(item => item.id === id ? { ...item, isFavorite: !currentStatus } : item));
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Extraction State
  const [extractUrl, setExtractUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtractFromUrl = async () => {
    if (!extractUrl) return;
    setIsExtracting(true);
    setError(null);
    try {
      await checkBalance(TOKEN_COSTS.TEXT);
      const data = await extractProductData(extractUrl);
      await deductTokens(TOKEN_COSTS.TEXT, 'URL Extractor', extractUrl, productName);
      if (data.name) {
        setProductName(data.name);
      }
      if (data.description) {
        setDescription(data.description);
      }
      if (data.images && data.images.length > 0) {
        // Add extracted images to the existing images
        const newImages = await Promise.all(data.images.map(async (url) => {
          try {
            // Ensure URL is absolute
            let absoluteUrl = url;
            if (url.startsWith('//')) {
              absoluteUrl = `https:${url}`;
            } else if (url.startsWith('/')) {
              const urlObj = new URL(extractUrl);
              absoluteUrl = `${urlObj.origin}${url}`;
            }

            let fetchSuccess = false;
            let response;
            const proxies = [
              '/api/proxy-media?url=',
              '', // Direct fetch
              'https://corsproxy.io/?',
              'https://api.allorigins.win/raw?url=',
              'https://api.codetabs.com/v1/proxy?quest='
            ];

            for (const proxy of proxies) {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                let targetUrl = absoluteUrl;
                if (proxy === 'https://api.allorigins.win/raw?url=' || proxy === 'https://api.codetabs.com/v1/proxy?quest=' || proxy === '/api/proxy-media?url=') {
                  targetUrl = `${proxy}${encodeURIComponent(absoluteUrl)}`;
                } else if (proxy) {
                  targetUrl = `${proxy}${absoluteUrl}`;
                }

                // Append a cache-buster to prevent some CDN blocks occasionally
                if (!proxy && targetUrl.includes('?')) targetUrl += '&cb=' + Date.now();
                else if (!proxy) targetUrl += '?cb=' + Date.now();

                response = await fetch(targetUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                
                if (response.ok) {
                  // For APIs that might wrap errors in 200 OK
                  const contentType = response.headers.get('content-type');
                  if (contentType && (contentType.includes('text/html') || contentType.includes('application/json')) && targetUrl.match(/\.(jpe?g|png|webp|gif)/i)) {
                     // Probably a captcha page or error page disguised as success
                     continue; 
                  }
                  fetchSuccess = true;
                  break;
                }
              } catch (e) {
                // Ignore and try next proxy
              }
            }

            if (!fetchSuccess || !response) {
              console.warn(`Failed to fetch image: ${absoluteUrl} after trying proxies.`);
              return null; // Don't throw error, just skip the image silently so others can succeed
            }

            const blob = await response.blob();
            const file = new File([blob], 'extracted-image.jpg', { type: blob.type || 'image/jpeg' });
            return { file, preview: URL.createObjectURL(blob) };
          } catch (e) {
            console.error("Failed to fetch image:", url, e);
            return null;
          }
        }));
        
        const validImages = newImages.filter(img => img !== null) as {file: File, preview: string}[];
        if (validImages.length === 0 && data.images.length > 0) {
          setError('تم استخراج الوصف بنجاح، ولكن تعذر تحميل الصور بسبب حماية الموقع (CORS). يرجى تحميل الصور يدوياً.');
        } else {
          setImages(prev => [...prev, ...validImages]);
          
          // Save to Firebase if user is logged in
          if (auth.currentUser) {
            try {
              await addDoc(collection(db, 'products'), {
                uid: auth.currentUser.uid,
                url: extractUrl,
                description: data.description || '',
                images: data.images.slice(0, 50), // Limit to 50 images to avoid size issues
                createdAt: serverTimestamp()
              });
            } catch (fbError) {
              console.error("Failed to save product to Firebase:", fbError);
            }
          }
        }
      } else if (auth.currentUser && data.description) {
        // Save to Firebase even if no images
        try {
          await addDoc(collection(db, 'products'), {
            uid: auth.currentUser.uid,
            url: extractUrl,
            description: data.description,
            images: [],
            createdAt: serverTimestamp()
          });
        } catch (fbError) {
          console.error("Failed to save product to Firebase:", fbError);
        }
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsExtracting(false);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const scriptTypes = [
    'UGC (محتوى عفوي وتجربة مستخدم)',
    'Direct Response (استجابة مباشرة وعرض قوي)',
    'Storytelling (قصة قصيرة تجذب الانتباه)',
    'Problem/Solution (عرض المشكلة وتقديم المنتج كحل)',
    'Educational/How-to (تعليمي / كيف تستخدم المنتج)',
    'Testimonial/Review (مراجعة وتقييم للمنتج)',
    'Unboxing (فتح الصندوق واستعراض المحتويات)',
    'Behind the Scenes (كواليس التصنيع أو التجهيز)',
    'Humorous/Comedy (كوميدي وطريف)',
    'Fear of Missing Out - FOMO (خلق شعور بالاستعجال والندرة)',
    'Hook & Hold Winner (هوك صادم يليه عرض لا يقاوم بقوة)',
    'Us vs. Them (مقارنة: منتجنا مقابل المنتجات الأخرى لإثبات التفوق)',
    'Three Reasons Why (ثلاثة أسباب تدفع المشتري لاتخاذ القرار فوراً)',
    'The "Secret" Revealed (كشف السر وراء الحصول على نتيجة مذهلة)',
    'Pain-Agitate-Solution / PAS (استفزاز ألم العميل ثم طمأنته بالمنتج كحل مثالي)',
    'Myth Busting (تحطيم خرافة أو معتقد سائد واثبات العكس بمنتجك)',
    'Value Stack (تراكم القيمة: عرض كل المزايا والهدايا مقابل سعر واحد لا يهزم)',
    'Before & After (التحول المذهل: قبل استخدام المنتج وبعده)',
    'Massive Social Proof (دليل اجتماعي ضخم: آلاف العملاء جربوا واقتنعوا)',
    'The Objection Killer (التغلب المسبق على كل اعتراضات الشراء المحتملة للعميل)'
  ];

  const fbAdTypesList = [
    'القصة القصيرة والمشاعر (Storytelling & Emotion)',
    'العرض المباشر (Direct Offer)',
    'المشكلة والحل (Problem & Solution)',
    'الشهادات والتقييمات (Testimonial & Social Proof)',
    'الخوف من التفويت (FOMO & Urgency)',
    'السبب المنطقي (Logical Reason Why)',
    'إثارة الفضول (Curiosity Gap)',
    'التحدي والوعد (Challenge & Promise)',
    'كيف تعمل (Educational / How-To)',
    'الأسطورة مقابل الحقيقة (Myth vs. Fact)',
    'أسئلة وأجوبة (Q&A / Overcoming Objections)',
    'المقارنة "نحن مقابل هم" (Us vs. Them)',
    'النتيجة المحددة (Hyper-Specific Result)',
    'الاعتراف الصريح (The Confession / Transparency)',
    'القائمة السريعة (Listicle / X Reasons Why)'
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const renderContainerRef = useRef<HTMLDivElement>(null);
  const renderAdsContainerRef = useRef<HTMLDivElement>(null);

  const togglePhotoshootSelection = (idx: number) => {
    const newSet = new Set(selectedPhotoshootImages);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setSelectedPhotoshootImages(newSet);
  };

  const handleTransferSelected = async () => {
    if (selectedPhotoshootImages.size === 0) return;
    setIsTransferring(true);
    try {
      const newImages = await Promise.all(
        Array.from(selectedPhotoshootImages).map(async (idx) => {
          const img = photoshootImages[idx];
          const response = await fetch(img.url);
          const blob = await response.blob();
          const file = new File([blob], `scene-${idx}.jpg`, { type: 'image/jpeg' });
          return { file, preview: img.url };
        })
      );
      setImages(prev => [...prev, ...newImages]);
      setActiveTab('landing');
      setSelectedPhotoshootImages(new Set());
    } catch (err) {
      console.error("Failed to transfer images", err);
      setError("حدث خطأ أثناء نقل الصور.");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      const newImages = imageFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const stopGeneration = () => {
    cancelFlagRef.current = true;
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsGenerating(false);
    setIsGeneratingAds(false);
    setIsGeneratingPhotoshoot(false);
    setIsGeneratingScript(false);
    setIsGeneratingFbAds(false);
    setIsGeneratingFunnelCopy(false);
    setIsGeneratingVideoScenes(false);
    setIsGeneratingCreativePrompts(false);
    setIsGeneratingWinnerScripts(false);
    setIsGeneratingTextOnVisual(false);
    setError('تم إيقاف عملية الإنشاء بناءً على طلبك.');
  };

  const handleGenerateAllAudios = async () => {
    if (!generatedScripts) return;
    for (let i = 0; i < generatedScripts.length; i++) {
      if (!scriptAudios[i]) {
        await handleGenerateAudio(i, generatedScripts[i]);
      }
    }
  };

  const handleDownloadAllAudios = (format: 'wav' | 'mp3') => {
    Object.entries(scriptAudios).forEach(([index, urls], i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = format === 'mp3' ? (urls as {mp3: string, wav: string}).mp3 : (urls as {mp3: string, wav: string}).wav;
        a.download = `voiceover-${parseInt(index) + 1}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 500); // 500ms delay between downloads to prevent browser blocking
    });
  };

  const getScriptVoice = (idx: number, script: { gender?: string, customVoice?: string }) => {
    return scriptSelectedVoices[idx] || script.customVoice || script.gender || (selectedScriptGenders && selectedScriptGenders[idx]) || voiceGender || 'auto';
  };

  const handleScriptVoiceChange = (idx: number, newVoice: string) => {
    setScriptSelectedVoices(prev => ({ ...prev, [idx]: newVoice }));
    if (generatedScripts && generatedScripts[idx]) {
      const updated = [...generatedScripts];
      updated[idx] = { ...updated[idx], customVoice: newVoice, gender: newVoice };
      setGeneratedScripts(updated);
    }
  };

  const handleGenerateAudio = async (index: number, script: {type: string, content: string, voiceOverInstructions: string, gender?: string, customVoice?: string}, overrideVoice?: string) => {
    setIsGeneratingAudio(prev => ({ ...prev, [index]: true }));
    setError(null);
    try {
      await checkBalance(TOKEN_COSTS.VOICE_OVER);
      const chosenVoice = overrideVoice || scriptSelectedVoices[index] || script.customVoice || script.gender || (selectedScriptGenders && selectedScriptGenders[index]) || voiceGender || 'auto';
      const audioUrls = await generateSpeech(
        script.content, 
        script.voiceOverInstructions, 
        script.type, 
        chosenVoice, 
        (chosenVoice === 'clone' || script.gender === 'clone' || voiceGender === 'clone') ? voiceCloneFile : null
      );
      await deductTokens(TOKEN_COSTS.VOICE_OVER, 'Script Voice Over', extractUrl, productName);
      setScriptAudios(prev => ({ ...prev, [index]: audioUrls }));
    } catch (err: any) {
      console.error("Audio generation failed:", err);
      setError(err?.message || 'حدث خطأ أثناء توليد التعليق الصوتي.');
    } finally {
      setIsGeneratingAudio(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleGenerateWinnerAudio = async (index: number, script: {type: string, content: string, voiceOverInstructions: string}, overrideVoice?: string) => {
    setIsGeneratingWinnerAudio(prev => ({ ...prev, [index]: true }));
    setError(null);
    try {
      await checkBalance(TOKEN_COSTS.VOICE_OVER);
      const chosenVoice = overrideVoice || winnerSelectedVoices[index] || voiceGender || 'auto';
      const audioUrls = await generateSpeech(
        script.content, 
        script.voiceOverInstructions, 
        script.type, 
        chosenVoice, 
        (chosenVoice === 'clone' || voiceGender === 'clone') ? voiceCloneFile : null
      );
      await deductTokens(TOKEN_COSTS.VOICE_OVER, 'Winner Script Voice Over', extractUrl, productName);
      setWinnerAudios(prev => ({ ...prev, [index]: audioUrls }));
    } catch (err: any) {
      console.error("Audio generation failed:", err);
      setError(err?.message || 'حدث خطأ أثناء توليد التعليق الصوتي.');
    } finally {
      setIsGeneratingWinnerAudio(prev => ({ ...prev, [index]: false }));
    }
  };

  
  const playVoiceSample = async (selectedVoice: string) => {
    if (!selectedVoice || selectedVoice === 'auto' || selectedVoice === 'clone') {
      alert('يرجى اختيار صوت محدد لتجربته');
      return;
    }
    setIsSampleLoading(true);
    try {
      const sampleText = "مرحباً، هذه عينة صوتية لتجربة نبرة الصوت والمستوى الأدائي. أتمنى أن تنال إعجابكم.";
      const urls = await generateSpeech(sampleText, "تحدث بنبرة طبيعية وواضحة", "Sample", selectedVoice, null);
      if (urls && urls.mp3) {
        const audio = new Audio(urls.mp3);
        audio.play();
      } else if (urls && urls.wav) {
        const audio = new Audio(urls.wav);
        audio.play();
      }
    } catch(e) {
      console.error(e);
      alert('فشل توليد العينة الصوتية');
    } finally {
      setIsSampleLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!description && scriptGenMode !== 'custom') {
      setError('يرجى إدخال وصف المنتج أولاً.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsGeneratingScript(true);
    setError(null);
    setGeneratedScripts(null);
    setScriptAudios({});
    setIsGeneratingAudio({});
    setScriptSelectedVoices({});

    try {
      if (controller.signal.aborted) return;
      
      await checkBalance(TOKEN_COSTS.SCRIPT);

      const mappedScriptTypes = selectedScriptTypes.map((type, index) => ({
        type, 
        gender: selectedScriptGenders[index] || 'auto'
      }));

      
    let finalDescription = description || "المنتج غير محدد";
    if (activeBrandKit && applyBrandKit) {
       finalDescription += `

[ملاحظة هامة جدا للذكاء الاصطناعي: قم بصياغة كل شيء وفقاً للهوية البصرية والصوتية للبراند التالي:
       - مجال العمل: ${activeBrandKit.industry}
       - نبرة الصوت: ${activeBrandKit.tone || activeBrandKit.voice?.primary || 'Neutral'}
       - أسلوب الإقناع/التصميم: ${activeBrandKit.style || activeBrandKit.visualStyle || 'Modern'}
       الرجاء الالتزام التام بنوعية المفردات والأسلوب والرسالة الخاصة بهذه الهوية.]`;
    }
    
    let scripts = [];
    if (scriptGenMode === 'custom') {
      if (!customScriptText.trim()) throw new Error("يرجى كتابة الإسكريبت أولاً");
      scripts = [{
        type: "إسكريبت مخصص",
        content: "Language: Arabic\nDialect: " + dialect + "\nVoice Description: " + customScriptVoice + "\n\n" + customScriptText,
        voiceOverInstructions: "",
        customVoice: customScriptVoice
      }];
    } else {
      scripts = await generateVideoScript(finalDescription, dialect, scriptDuration, mappedScriptTypes, aiModel, voiceGender, 3, 3000, scriptGenMode === 'auto');
    }
      await deductTokens(TOKEN_COSTS.SCRIPT, 'Video Scripts', extractUrl, productName);
      
      if (controller.signal.aborted) return;
      setGeneratedScripts(scripts);
      saveToHistory('script', scripts, description);
      
      if (autoGenerateVoiceover && scripts && scripts.length > 0) {
        setTimeout(() => {
          for (let i = 0; i < scripts.length; i++) {
            handleGenerateAudio(i, scripts[i]);
          }
        }, 300);
      }
    } catch (err: any) {
      if (controller.signal.aborted) return;
      handleError(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsGeneratingScript(false);
        setAbortController(null);
      }
    }
  };

  const handleGenerateTextOnVisual = async () => {
    if (!description) {
      setError('يرجى إدخال وصف المنتج أولاً.');
      return;
    }
    const controller = new AbortController();
    setAbortController(controller);
    cancelFlagRef.current = false;
    setIsGeneratingTextOnVisual(true);
    setError(null);
    setGeneratedTextOnVisual([]);

    try {
      if (controller.signal.aborted || cancelFlagRef.current) return;
      await checkBalance(TOKEN_COSTS.TEXT);
      const count = textOnVisualMode === 'high_ctr_fixed' ? 10 : textOnVisualCount;
      const scenes = await generateTextOnVisual(description, dialect, count, textOnVisualMode, aiModel);
      await deductTokens(TOKEN_COSTS.TEXT, 'Text On Visual', extractUrl, productName);
      
      if (controller.signal.aborted || cancelFlagRef.current) return;
      setGeneratedTextOnVisual(scenes);
      saveToHistory('textOnVisual', scenes, description);
    } catch (err: any) {
      if (controller.signal.aborted || cancelFlagRef.current) return;
      handleError(err);
    } finally {
      if (!controller.signal.aborted && !cancelFlagRef.current) {
        setIsGeneratingTextOnVisual(false);
        setAbortController(null);
      }
    }
  };

  const handleCopyScript = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setScriptCopied(index);
    setTimeout(() => setScriptCopied(null), 2000);
  };

  const handleGenerateCreativePrompts = async () => {
    if (!description) {
      setError('يرجى إدخال وصف المنتج أولاً.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    cancelFlagRef.current = false;
    setIsGeneratingCreativePrompts(true);
    setError(null);
    setGeneratedCreativePrompts([]);

    try {
      if (controller.signal.aborted || cancelFlagRef.current) return;
      await checkBalance(TOKEN_COSTS.TEXT);
      const prompts = await generateCreativeImagePrompts(description, dialect, creativePromptsCount, creativePromptMode, landingPageSections, fontFamily, creativeColorTheme, aiModel);
      await deductTokens(TOKEN_COSTS.TEXT, 'Creative Prompts', extractUrl, productName);
      
      if (controller.signal.aborted || cancelFlagRef.current) return;
      setGeneratedCreativePrompts(prompts);
      saveToHistory('creativePrompts', prompts, description);
    } catch (err: any) {
      if (controller.signal.aborted || cancelFlagRef.current) return;
      handleError(err);
    } finally {
      if (!controller.signal.aborted && !cancelFlagRef.current) {
        setIsGeneratingCreativePrompts(false);
        setAbortController(null);
      }
    }
  };

  const handleGenerateFbAds = async () => {
    if (!description) {
      setError('يرجى إدخال وصف المنتج أولاً.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsGeneratingFbAds(true);
    setError(null);
    setGeneratedFbAds(null);

    try {
      if (controller.signal.aborted) return;
      await checkBalance(TOKEN_COSTS.TEXT);
      const ads = await generateFbAdCopies(description, dialect, aiModel, selectedFbAdTypes, 3, 3000, activeBrandKit && applyBrandKit ? activeBrandKit : undefined, autoFbAngles, fbCampaignObjective);
      await deductTokens(TOKEN_COSTS.TEXT, 'Creative Ads', extractUrl, productName);
      
      if (controller.signal.aborted) return;
      setGeneratedFbAds(ads);
      saveToHistory('fbAds', ads, description);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      handleError(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsGeneratingFbAds(false);
        setAbortController(null);
      }
    }
  };

  const handleCopyFbAd = (ad: {hook: string, body: string, cta: string}, index: number) => {
    const content = `${ad.hook}

${ad.body}

${ad.cta}`;
    navigator.clipboard.writeText(content);
    setFbAdCopied(index);
    setTimeout(() => setFbAdCopied(null), 2000);
  };

  const handleCopyTiktokHeadline = (headline: string, index: number) => {
    navigator.clipboard.writeText(headline);
    setTiktokHeadlineCopied(index);
    setTimeout(() => setTiktokHeadlineCopied(null), 2000);
  };

  const handleGenerateSmartAngles = async () => {
    if (!description) {
      setError('يرجى إدخال وصف المنتج أولاً.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsGeneratingSmartAngles(true);
    setError(null);
    setGeneratedSmartAngles([]);

    try {
      if (controller.signal.aborted) return;
      await checkBalance(TOKEN_COSTS.TEXT);
      const angles = await generateSmartAngles(description, aiModel);
      await deductTokens(TOKEN_COSTS.TEXT, 'Smart Angles', extractUrl, productName);
      
      if (controller.signal.aborted) return;
      setGeneratedSmartAngles(angles);
      saveToHistory('smartAngles', angles, description);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      handleError(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsGeneratingSmartAngles(false);
        setAbortController(null);
      }
    }
  };

  const handleGenerateFlowCharacter = async () => {
    if (!description) {
      setError('يرجى إدخال وصف المنتج أولاً.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsGeneratingFlowCharacter(true);
    setError(null);
    setGeneratedFlowCharacter(null);

    try {
      if (controller.signal.aborted) return;
      await checkBalance(TOKEN_COSTS.TEXT);
      const character = await generateFlowCharacter(description, dialect, voiceGender, aiModel);
      await deductTokens(TOKEN_COSTS.TEXT, 'Flow Character', extractUrl, productName);
      
      if (controller.signal.aborted) return;
      setGeneratedFlowCharacter(character);
      saveToHistory('flowCharacter', character, description);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      handleError(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsGeneratingFlowCharacter(false);
        setAbortController(null);
      }
    }
  };

  const handleGenerateFunnelCopy = async () => {
    if (!description) {
      setError('يرجى إدخال وصف المنتج أولاً.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsGeneratingFunnelCopy(true);
    setError(null);
    setGeneratedFunnelCopy(null);

    try {
      if (controller.signal.aborted) return;
      
    let finalDescription = description || "المنتج غير محدد";
    if (activeBrandKit && applyBrandKit) {
       finalDescription += `

[ملاحظة هامة جدا للذكاء الاصطناعي: قم بصياغة كل شيء وفقاً للهوية البصرية والصوتية للبراند التالي:
       - مجال العمل: ${activeBrandKit.industry}
       - نبرة الصوت: ${activeBrandKit.tone || activeBrandKit.voice?.primary || 'Neutral'}
       - أسلوب الإقناع/التصميم: ${activeBrandKit.style || activeBrandKit.visualStyle || 'Modern'}
       الرجاء الالتزام التام بنوعية المفردات والأسلوب والرسالة الخاصة بهذه الهوية.]`;
    }
    await checkBalance(TOKEN_COSTS.TEXT);
const copy = await generateFunnelCopy(finalDescription, dialect, aiModel, 3, 3000, activeBrandKit && applyBrandKit ? activeBrandKit : undefined, funnelCopyLength);
      await deductTokens(TOKEN_COSTS.TEXT, 'Funnel Copy', extractUrl, productName);
      
      if (controller.signal.aborted) return;
      setGeneratedFunnelCopy(copy);
      saveToHistory('funnelCopy', copy, description);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      handleError(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsGeneratingFunnelCopy(false);
        setAbortController(null);
      }
    }
  };

  const handleGenerateVideoScenes = async () => {
    if (!description) {
      setError('يرجى إدخال وصف المنتج أولاً.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsGeneratingVideoScenes(true);
    setError(null);
    setGeneratedVideoScenes([]);

    try {
      if (controller.signal.aborted) return;
      
    let finalDescription = description || "المنتج غير محدد";
    if (activeBrandKit && applyBrandKit) {
       finalDescription += `

[ملاحظة هامة جدا للذكاء الاصطناعي: قم بصياغة كل شيء وفقاً للهوية البصرية والصوتية للبراند التالي:
       - مجال العمل: ${activeBrandKit.industry}
       - نبرة الصوت: ${activeBrandKit.tone || activeBrandKit.voice?.primary || 'Neutral'}
       - أسلوب الإقناع/التصميم: ${activeBrandKit.style || activeBrandKit.visualStyle || 'Modern'}
       الرجاء الالتزام التام بنوعية المفردات والأسلوب والرسالة الخاصة بهذه الهوية.]`;
    }
    await checkBalance(TOKEN_COSTS.TEXT);
const scenes = await generateVideoScenes(finalDescription, dialect, videoGenerationMode, scriptDuration, aiModel, voiceGender);
      await deductTokens(TOKEN_COSTS.TEXT, 'Video Scenes', extractUrl, productName);
      
      if (controller.signal.aborted) return;
      setGeneratedVideoScenes(scenes);
      saveToHistory('videoScenes', scenes, description);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      handleError(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsGeneratingVideoScenes(false);
        setAbortController(null);
      }
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        setError('حجم الفيديو يجب أن لا يتجاوز 20 ميجابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setWinnerVideo({
          file,
          previewUrl: URL.createObjectURL(file),
          base64,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractWinnerScript = async () => {
    if (!winnerVideo) {
      setError('يرجى رفع فيديو الانجل الوينر أولاً.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsExtractingWinnerScript(true);
    setError(null);

    try {
      if (controller.signal.aborted) return;
      await checkBalance(TOKEN_COSTS.SCRIPT);
      const script = await extractWinnerVideoDetails(
        winnerVideo.base64,
        winnerVideo.mimeType,
        aiModel
      );
      await deductTokens(TOKEN_COSTS.SCRIPT, 'Winner Angle Extraction', extractUrl, productName);
      if (controller.signal.aborted) return;
      setExtractedWinnerScript(script);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      handleError(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsExtractingWinnerScript(false);
        setAbortController(null);
      }
    }
  };

  const handleGenerateWinnerScripts = async () => {
    if (!extractedWinnerScript) {
      setError('يرجى استخراج سكريبت الفيديو ثم محاولة التوليد.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsGeneratingWinnerScripts(true);
    setError(null);
    setGeneratedWinnerScripts([]);

    try {
      if (controller.signal.aborted) return;
      await checkBalance(TOKEN_COSTS.SCRIPT);
      const scripts = await generateWinnerAngleScripts(
        extractedWinnerScript,
        description,
        dialect,
        scriptDuration,
        aiModel,
        voiceGender
      );
      await deductTokens(TOKEN_COSTS.SCRIPT, 'Winner Angle', extractUrl, productName);
      
      if (controller.signal.aborted) return;
      setGeneratedWinnerScripts(scripts);
      saveToHistory('winnerAngle', scripts, description);
    } catch (err: any) {
      if (controller.signal.aborted) return;
      handleError(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsGeneratingWinnerScripts(false);
        setAbortController(null);
      }
    }
  };

  const handleCopyFunnelCopy = () => {
    if (generatedFunnelCopy) {
      navigator.clipboard.writeText(generatedFunnelCopy);
      setFunnelCopyCopied(true);
      setTimeout(() => setFunnelCopyCopied(false), 2000);
    }
  };

  const handleGenerateAds = async () => {
    if (images.length === 0) {
      setError('يرجى رفع صورة واحدة على الأقل للمنتج');
      return;
    }
    if (!description) {
      setError('يرجى إدخال وصف المنتج');
      return;
    }

    setIsGeneratingAds(true);
    setError(null);
    setGeneratedAds([]);
    setAdSections([]);
    setAdBackgrounds([]);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      if (controller.signal.aborted) return;
      setAdsProgress({ step: 'جاري تحليل المنتج واستراتيجية الإعلانات...', current: 0, total: 10 });
      
      const imagePayloads = await Promise.all(images.map(async (img) => {
        return new Promise<{base64: string, mimeType: string}>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              const base64 = (reader.result as string).split(',')[1];
              resolve({ base64, mimeType: img.file.type });
            } else {
              reject(new Error("Failed to read image file"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(img.file);
        });
      }));

      if (controller.signal.aborted) return;
      await checkBalance(TOKEN_COSTS.IMAGE);
      const generatedAdsData = await analyzeAdCreatives(imagePayloads, description, dialect, aiModel, designStyle, 3, 3000, activeBrandKit && applyBrandKit ? activeBrandKit : undefined);
      await deductTokens(TOKEN_COSTS.IMAGE, 'Creative Ads', extractUrl, productName);
      
      if (controller.signal.aborted) return;
      setAdSections(generatedAdsData);
      
      const backgrounds: string[] = [];
      
      for (let i = 0; i < generatedAdsData.length; i++) {
        if (controller.signal.aborted) return;
        const ad = generatedAdsData[i];
        setAdsProgress({ step: `جاري توليد صورة للإعلان: ${ad.sectionName}...`, current: i + 1, total: 10 });
        
        try {
          const bgUrl = await generateBackgroundImage(imagePayloads[0], ad.imagePrompt || ad.title, aiModel);
          backgrounds.push(bgUrl);
        } catch (err: any) {
          console.error(`Failed to generate background for ad ${i}:`, err);
          backgrounds.push('');
          if (err.message?.includes('429') || err.message?.includes('500') || err.message?.includes('Internal error') || err.message?.includes('INTERNAL')) {
            throw err;
          }
        }
        if (controller.signal.aborted) return;
        setAdBackgrounds([...backgrounds]);
      }

      if (controller.signal.aborted) return;
      setAdsProgress({ step: 'جاري تجميع التصميمات...', current: 10, total: 10 });
      
      // Use a loop with small delays to check for abortion instead of a single long timeout
      let waited = 0;
      while (waited < 5000) {
        if (controller.signal.aborted) return;
        await new Promise(resolve => setTimeout(resolve, 100));
        waited += 100;
      }
      
      if (controller.signal.aborted) return;
      
      if (!renderAdsContainerRef.current) {
        console.error("Render ads container not found");
        setIsGeneratingAds(false);
        setAbortController(null);
        return;
      }
      
      const results: { url: string; section: string }[] = [];
      const templateElements = renderAdsContainerRef.current.children;
      
      for (let i = 0; i < templateElements.length; i++) {
        if (controller.signal.aborted) return;
        setAdsProgress({ step: `جاري تجميع وتصميم صورة: ${generatedAdsData[i].sectionName}...`, current: i + 1, total: 10 });
        
        try {
          const el = templateElements[i] as HTMLElement;
          const dataUrl = await htmlToImage.toJpeg(el, {
            quality: 0.9,
            backgroundColor: '#0f172a',
            pixelRatio: 1,
          });
          
          results.push({
            url: dataUrl,
            section: generatedAdsData[i].sectionName
          });
          if (controller.signal.aborted) return;
          setGeneratedAds([...results]);
        } catch (err) {
          console.error(`Failed to generate ad section ${i}:`, err);
        }
      }

      if (controller.signal.aborted) return;
      setAdsProgress({ step: 'اكتمل الإنشاء!', current: 10, total: 10 });
      setIsGeneratingAds(false);
      setAbortController(null);

    } catch (err: any) {
      if (controller.signal.aborted) return;
      handleError(err);
      setIsGeneratingAds(false);
      setAbortController(null);
    }
  };

  const handleDownloadAllAds = () => {
    generatedAds.forEach((img, index) => {
      const a = document.createElement('a');
      a.href = img.url;
      a.download = `ad-creative-${index + 1}-${img.section.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const handleError = (err: any) => {
    const errorMsg = String(err?.message || err || '');
    if (!errorMsg.includes('Quota')) {
      console.error("Caught error:", err);
    }
    if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      setError('عذراً، لقد استنفدت الحد المسموح به للاستخدام المجاني للذكاء الاصطناعي حالياً. يرجى الانتظار بضع دقائق ثم المحاولة مرة أخرى.');
    } else if (errorMsg.includes('500') || errorMsg.includes('Internal error') || errorMsg.includes('INTERNAL')) {
      setError('حدث خطأ داخلي في خوادم الذكاء الاصطناعي. يرجى المحاولة مرة أخرى بعد قليل.');
    } else {
      setError(errorMsg || 'حدث خطأ غير متوقع.');
    }
  };

  const handleGeneratePhotoshoot = async () => {
    if (images.length === 0 || !description) {
      setError('الرجاء إرفاق صورة واحدة على الأقل وكتابة وصف للمنتج.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsGeneratingPhotoshoot(true);
    setError(null);
    setPhotoshootImages([]);

    try {
      if (controller.signal.aborted) return;
      setPhotoshootProgress({ step: 'جاري ابتكار أفكار للمشاهد...', current: 0, total: 8 });
      
      const refImage = images[0];
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            resolve((reader.result as string).split(',')[1]);
          } else {
            reject(new Error("Failed to read image file"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(refImage.file);
      });
      const imagePayload = { base64, mimeType: refImage.file.type };

      if (controller.signal.aborted) return;
      await checkBalance(TOKEN_COSTS.IMAGE);
      const prompts = await generateScenePrompts(description, aiModel);
      await deductTokens(TOKEN_COSTS.IMAGE, 'Photoshoot AI', extractUrl, productName);
      const results: {url: string, prompt: string}[] = [];

      for (let i = 0; i < prompts.length; i++) {
        if (controller.signal.aborted) return;
        setPhotoshootProgress({ step: `جاري تصوير المشهد ${i + 1}...`, current: i + 1, total: prompts.length });
        try {
          const url = await generateBackgroundImage(imagePayload, prompts[i], aiModel);
          results.push({ url, prompt: prompts[i] });
          if (controller.signal.aborted) return;
          setPhotoshootImages([...results]);
          if (i < prompts.length - 1) {
            let waited = 0;
            while (waited < 8000) {
              if (controller.signal.aborted) return;
              await new Promise(resolve => setTimeout(resolve, 100));
              waited += 100;
            }
          }
        } catch (err: any) {
          console.error(`Failed to generate scene ${i}:`, err);
          if (err?.message?.includes('429') || err?.message?.includes('quota')) {
            throw new Error('تم الوصول للحد الأقصى للاستخدام المجاني.');
          }
          // Continue to next prompt if it's not a rate limit error
        }
      }
      
      if (controller.signal.aborted) return;
      if (results.length === 0) {
        throw new Error("فشل في توليد أي مشاهد. يرجى المحاولة مرة أخرى.");
      }
      setPhotoshootProgress({ step: 'اكتملت جلسة التصوير!', current: prompts.length, total: prompts.length });
    } catch (err: any) {
      if (controller.signal.aborted) return;
      handleError(err);
    } finally {
      if (!controller.signal.aborted) {
        setIsGeneratingPhotoshoot(false);
        setAbortController(null);
      }
    }
  };

  const handleGenerate = async () => {
    if (images.length === 0 || !description) {
      setError('الرجاء إرفاق صورة واحدة على الأقل وكتابة وصف للمنتج.');
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    setSections([]);
    setSectionBackgrounds([]);

    try {
      await checkBalance(TOKEN_COSTS.LANDING_PAGE);
      if (controller.signal.aborted) return;
      setProgress({ step: 'جاري تحليل المنتج وتخطيط الأقسام...', current: 0, total: 10 });
      
      const imagePayloads = await Promise.all(images.map(async (img) => {
        return new Promise<{base64: string, mimeType: string}>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              const base64 = (reader.result as string).split(',')[1];
              resolve({ base64, mimeType: img.file.type });
            } else {
              reject(new Error("Failed to read image file"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(img.file);
        });
      }));

      if (controller.signal.aborted) return;
      const generatedSections = await analyzeProduct(imagePayloads, description, dialect, aiModel, designStyle, 3, 3000, activeBrandKit && applyBrandKit ? activeBrandKit : undefined);
      
      if (controller.signal.aborted) return;
      if (!generatedSections || generatedSections.length === 0) {
        throw new Error("فشل في توليد الأقسام.");
      }

      setSections(generatedSections);
      await deductTokens(TOKEN_COSTS.LANDING_PAGE, 'Landing Page Generation', extractUrl, productName);

      const backgrounds: string[] = [];
      if (useAIGeneratedBackgrounds) {
        for (let i = 0; i < generatedSections.length; i++) {
          if (controller.signal.aborted) return;
          setProgress({ step: `جاري تخيل وتوليد خلفية القسم ${i + 1}: ${generatedSections[i].sectionName}...`, current: i + 1, total: generatedSections.length * 2 });
          try {
            const refImage = imagePayloads[i % imagePayloads.length];
            const bgUrl = await generateBackgroundImage(refImage, generatedSections[i].imagePrompt, aiModel);
            backgrounds.push(bgUrl);
            
            // Add a delay between requests to avoid rate limits (429 RESOURCE_EXHAUSTED)
            if (i < generatedSections.length - 1) {
              let waited = 0;
              while (waited < 8000) {
                if (controller.signal.aborted) return;
                await new Promise(resolve => setTimeout(resolve, 100));
                waited += 100;
              }
            }
          } catch (err: any) {
            console.error(`Failed to generate background for section ${i}:`, err);
            backgrounds.push(images[i % images.length].preview); // fallback
            if (err?.message?.includes('429') || err?.message?.includes('quota')) {
               throw new Error('تم الوصول للحد الأقصى للاستخدام المجاني.');
            }
          }
        }
      } else {
        // Use original images as fallback
        for (let i = 0; i < generatedSections.length; i++) {
          backgrounds.push(images[i % images.length].preview);
        }
      }
      if (controller.signal.aborted) return;
      setSectionBackgrounds(backgrounds);

      // Wait for React to render the hidden templates and images to load
      let waited = 0;
      while (waited < 5000) {
        if (controller.signal.aborted) return;
        await new Promise(resolve => setTimeout(resolve, 100));
        waited += 100;
      }
      
      if (controller.signal.aborted) return;
      
      if (!renderContainerRef.current) {
        setError('حدث خطأ أثناء تحضير الصور.');
        setIsGenerating(false);
        setAbortController(null);
        return;
      }
      
      const results: { url: string; section: string }[] = [];
      const templateElements = renderContainerRef.current.children;
      const totalSteps = useAIGeneratedBackgrounds ? generatedSections.length * 2 : generatedSections.length;
      
      for (let i = 0; i < templateElements.length; i++) {
        if (controller.signal.aborted) return;
        const currentStep = useAIGeneratedBackgrounds ? generatedSections.length + i + 1 : i + 1;
        setProgress({ step: `جاري تجميع وتصميم صورة: ${generatedSections[i].sectionName}...`, current: currentStep, total: totalSteps });
        
        try {
          const el = templateElements[i] as HTMLElement;
          const dataUrl = await htmlToImage.toJpeg(el, {
            quality: 0.9,
            backgroundColor: '#0f172a', // slate-900
            pixelRatio: 1, // 1080x1080 is already large enough
          });
          
          results.push({
            url: dataUrl,
            section: generatedSections[i].sectionName
          });
          if (controller.signal.aborted) return;
          setGeneratedImages([...results]);
        } catch (err) {
          console.error(`Failed to generate section ${i}:`, err);
        }
      }

      if (controller.signal.aborted) return;
      setProgress({ step: 'اكتمل الإنشاء!', current: totalSteps, total: totalSteps });
      setIsGenerating(false);
      setAbortController(null);

    } catch (err: any) {
      if (controller.signal.aborted) return;
      handleError(err);
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const handleDownloadAll = () => {
    generatedImages.forEach((img, index) => {
      const a = document.createElement('a');
      a.href = img.url;
      a.download = `landing-page-${index + 1}-${img.section.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  
  if (isAuthLoading && !guestMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] dark:bg-[#0F172A]">
        <Loader2 className="w-8 h-8 animate-spin text-[#09090b]" />
      </div>
    );
  }

  if (!user && !guestMode && !sharedProject) {
    return <MarketingLandingPage onLogin={handleLogin} onContinueAsGuest={() => setGuestMode(true)} />;
  }

  if (sharedProject) {
    const resolvedProfile = agencyOwnerProfile || userProfile;

   return (
      <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0F172A] text-[#09090b] dark:text-zinc-100 font-sans transition-colors duration-200 p-8 flex flex-col items-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl w-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-zinc-900">
              {t("مشروع مشارك")}
            </h1>
            <button 
              onClick={() => {
                window.history.replaceState({}, document.title, window.location.pathname);
                setSharedProject(null);
              }}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              {t("العودة للتطبيق")}
            </button>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="p-3 bg-gradient-to-br from-black to-zinc-900 text-white rounded-xl shadow-lg shadow-[#F0B21B]/20">
                {sharedProject.type === 'funnelCopy' && <LayoutTemplate className="w-6 h-6" />}
                {sharedProject.type === 'script' && <FileText className="w-6 h-6" />}
                {sharedProject.type === 'fbAds' && <TypeIcon className="w-6 h-6" />}
                {sharedProject.type === 'videoScenes' && <Film className="w-6 h-6" />}
                {sharedProject.type === 'winnerAngle' && <RefreshCw className="w-6 h-6" />}
                {sharedProject.type === 'creativePrompts' && <ImageIcon className="w-6 h-6" />}
                {sharedProject.type === 'textOnVisual' && <Quote className="w-6 h-6" />}
                {sharedProject.type === 'productBrain' && <Brain className="w-6 h-6" />}
                {sharedProject.type === 'smartAngles' && <Target className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {sharedProject.type === 'funnelCopy' && 'محتوى صفحة المنتج كفانل'}
                  {sharedProject.type === 'script' && 'اسكريبتات وفويس اوفر AI'}
                  {sharedProject.type === 'fbAds' && 'نصوص إعلانات فيسبوك وتيك توك'}
                  {sharedProject.type === 'videoScenes' && 'اسكريبتات وفويس اوفر AI (Flow)'}
                  {sharedProject.type === 'winnerAngle' && 'إعادة توليد الوينر أنجل'}
                  {sharedProject.type === 'creativePrompts' && 'كريتيف GPT'}
                  {sharedProject.type === 'textOnVisual' && 'نصوص ثابتة على الفيديوهات'}
                  {sharedProject.type === 'productBrain' && 'تحليل المنتج (Product Brain)'}
                  {sharedProject.type === 'smartAngles' && 'زوايا إعلانية ذكية'}
                </h3>
              </div>
            </div>

            <div className="mt-6 text-zinc-800 dark:text-zinc-200 leading-relaxed max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
              {sharedProject.type === 'productBrain' && (
                <div className="prose dark:prose-invert max-w-none text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 whitespace-pre-wrap">
                  <ReactMarkdown>{sharedProject.content}</ReactMarkdown>
                </div>
              )}

              {sharedProject.type === 'smartAngles' && Array.isArray(sharedProject.content) && (
                <div className="space-y-6">
                  {sharedProject.content.map((script: any, idx: number) => (
                    <div key={idx} className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-xl">
                      <h4 className="font-bold text-[#F0B21B] dark:text-[#F0B21B] mb-3">{script.title}</h4>
                      <div className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                        {`الجمهور: ${script.audience}

الهوك:
${script.hook}

الزاوية:
${script.angle}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sharedProject.type === 'funnelCopy' && (
                <div className="whitespace-pre-wrap">{sharedProject.content}</div>
              )}
              
              {(sharedProject.type === 'script' || sharedProject.type === 'winnerAngle') && Array.isArray(sharedProject.content) && (
                <div className="space-y-6">
                  {sharedProject.content.map((script: any, idx: number) => (
                    <div key={idx} className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-xl">
                      <h4 className="font-bold text-[#F0B21B] dark:text-[#F0B21B] mb-3">{script.type}</h4>
                      <div className="whitespace-pre-wrap">{script.content}</div>
                    </div>
                  ))}
                </div>
              )}

              {sharedProject.type === 'textOnVisual' && Array.isArray(sharedProject.content) && (
                <div className="space-y-4">
                  {sharedProject.content.map((sentence: string, idx: number) => (
                    <div key={idx} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-xl flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#09090b]/10 text-[#09090b] flex items-center justify-center font-bold shrink-0">{idx + 1}</div>
                      <div className="text-lg font-medium leading-relaxed pt-1">{sentence}</div>
                    </div>
                  ))}
                </div>
              )}

              {sharedProject.type === 'fbAds' && sharedProject.content?.fbAds && (
                <div className="space-y-6">
                  {sharedProject.content.fbAds.map((ad: any, idx: number) => (
                    <div key={idx} className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-xl">
                      <h4 className="font-bold text-[#F0B21B] dark:text-[#F0B21B] mb-4 text-lg">{ad.type}</h4>
                      <div className="space-y-4">
                        <div><strong className="text-[#F0B21B]">Hook:</strong> {ad.hook}</div>
                        <div><strong className="text-[#F0B21B]">Body:</strong> {ad.body}</div>
                        <div><strong className="text-[#F0B21B]">CTA:</strong> {ad.cta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sharedProject.type === 'videoScenes' && Array.isArray(sharedProject.content) && (
                <div className="space-y-6">
                  {sharedProject.content.map((scene: any, idx: number) => (
                    <div key={idx} className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-xl">
                      <h4 className="font-bold text-[#F0B21B] dark:text-[#F0B21B] mb-3 text-lg">
                        {scene.prompt?.toLowerCase().includes('hook') ? 'هوك (بداية)' : 'المشهد'} {scene.sceneNumber}
                      </h4>
                      <div className="mb-3">
                        <strong className="text-zinc-500 text-sm">Prompt:</strong> 
                        <div dir="ltr" className="font-mono text-sm bg-black/5 dark:bg-black/20 p-2 rounded mt-1">{scene.prompt}</div>
                      </div>
                      <div>
                        <strong className="text-zinc-500 text-sm">Script:</strong>
                        <div className="whitespace-pre-wrap mt-1">{scene.script}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sharedProject.type === 'creativePrompts' && Array.isArray(sharedProject.content) && (
                <div className="space-y-6">
                  {sharedProject.content.map((promptData: any, idx: number) => (
                    <div key={idx} className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-xl">
                      <h4 className="font-bold text-[#F0B21B] dark:text-[#F0B21B] mb-4 border-b border-zinc-200 dark:border-zinc-700/50 pb-3 text-lg">{t("تصميم")} {idx + 1}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{t("الفكرة البيعية:")}</p>
                          <p className="text-base">{promptData.concept}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{t("الاستايل البصري:")}</p>
                          <p className="text-base">{promptData.visualStyle}</p>
                        </div>
                      </div>

                      {promptData.textOverlay && (
                        <div className="mb-6 bg-fuchsia-100/50 dark:bg-fuchsia-900/20 p-5 rounded-xl border border-amber-200 dark:border-zinc-800 dark:border-fuchsia-900/30 text-center">
                          <p className="text-xs font-semibold text-[#F0B21B] uppercase tracking-wider mb-3">{t("النص التسويقي")}</p>
                          <p className="text-2xl font-bold text-fuchsia-700 dark:text-[#F0B21B] mb-2">"{promptData.textOverlay.headline}"</p>
                          {promptData.textOverlay.subheadline && <p className="text-base text-[#F0B21B]/80 dark:text-[#F0B21B]/80">{promptData.textOverlay.subheadline}</p>}
                        </div>
                      )}

                      {promptData.layout && (
                        <div className="mb-6 p-4 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">{t("تفاصيل التصميم")}</p>
                          <ul className="text-sm space-y-2">
                            <li><span className="font-semibold">{t("الخلفية:")}</span> {promptData.layout.background}</li>
                            <li><span className="font-semibold">{t("موضع المنتج:")}</span> {promptData.layout.productPlacement}</li>
                            {promptData.layout.extraElements && promptData.layout.extraElements.length > 0 && (
                              <li><span className="font-semibold">{t("عناصر إضافية:")}</span> {promptData.layout.extraElements.join('، ')}</li>
                            )}
                          </ul>
                        </div>
                      )}
                      
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Prompt (English):</p>
                        <p dir="ltr" className="font-mono text-sm">{promptData.aiPrompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const guestProfile = {
    uid: 'guest_user',
    email: 'guest@quickads.ai',
    name: language === 'ar' ? 'مستخدم تجريبي (ضيف)' : 'Guest User',
    displayName: language === 'ar' ? 'مستخدم تجريبي' : 'Guest User',
    role: 'owner',
    plan: 'Pro',
    tokens: 9999,
    lastActiveAt: Date.now(),
    createdAt: new Date().toISOString()
  };

  const resolvedProfile = agencyOwnerProfile || userProfile || (guestMode ? guestProfile : null);
  const lastUsedTool = history && history.length > 0 ? history[0].type : null;

  const appContextValue = {
    productName, setProductName,
    description, setDescription,
    dialect, setDialect,
    targetAudience, setTargetAudience,
    generatedScripts, setGeneratedScripts,
    generatedFbAds, setGeneratedFbAds,
    generatedFunnelCopy, setGeneratedFunnelCopy,
    generatedCreativePrompts, setGeneratedCreativePrompts,
    generatedVideoScenes, setGeneratedVideoScenes,
    generatedTextOnVisual, setGeneratedTextOnVisual,
    generatedSmartAngles, setGeneratedSmartAngles,
    generatedFlowCharacter, setGeneratedFlowCharacter,
    generatedWinnerScripts, setGeneratedWinnerScripts,
    spyData: null, setSpyData: () => {}
  };

  return (
    <AppContext.Provider value={appContextValue}>
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0F172A] text-[#09090b] dark:text-zinc-100 font-sans transition-colors duration-200 flex flex-row selection:bg-[#09090b]/30" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hidden container for rendering templates */}
      <div className="fixed top-[-20000px] left-[-20000px] pointer-events-none z-[-1]">
        <div ref={renderContainerRef} className="flex flex-col gap-4" style={{ '--theme-color': customHex } as React.CSSProperties}>
          {sections.map((section, idx) => (
            <div key={idx}>
              <TemplateRenderer 
                section={section} 
                imageUrl={sectionBackgrounds[idx] || images[idx % images.length].preview} 
                fontFamily={fontFamily}
                themeColor={themeColor}
                designStyle={designStyle}
                textColor={textColor}
                textEffect={textEffect}
                showTextBackground={showTextBackground}
              />
            </div>
          ))}
        </div>
        
        <div ref={renderAdsContainerRef} className="flex flex-col gap-4 mt-10" style={{ '--theme-color': customHex } as React.CSSProperties}>
          {adSections.map((section, idx) => (
            <div key={`ad-render-${idx}`}>
              <AdTemplateRenderer 
                section={section} 
                imageUrl={adBackgrounds[idx] || images[0]?.preview} 
                fontFamily={fontFamily}
                themeColor={themeColor}
                designStyle={designStyle}
                textColor={textColor}
                textEffect={textEffect}
                showTextBackground={showTextBackground}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:sticky top-0 h-[100dvh] w-72 bg-white dark:bg-[#0a0a0a] ltr:border-r rtl:border-l border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 z-50 transition-transform duration-300 ease-in-out ltr:left-0 rtl:right-0 lg:!translate-x-0 lg:!transform-none ${
        isSidebarOpen 
          ? 'translate-x-0 shadow-2xl' 
          : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')
      }`}>
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10 group cursor-pointer" onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}>
            <div className="relative flex items-center justify-center p-1 rounded-2xl group-hover:scale-105 transition-transform duration-300">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md rounded-xl shadow-sm shadow-[#F0B21B]/30" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black bg-gradient-to-r from-[#09090b] via-[#27272a] to-[#F0B21B] bg-clip-text text-transparent tracking-tight leading-none mb-1">KH</h1>
              <div className="flex items-center gap-1.5 opacity-80">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F0B21B] animate-pulse"></div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 dark:text-zinc-400">Quick Ads</span>
              </div>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 text-zinc-500 hover:text-[#F0B21B] dark:hover:text-[#F0B21B] relative z-10"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {/* Main Group */}
          <button
            className={`w-full p-3 rounded-xl font-semibold text-sm flex items-center gap-3 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20 text-[#F0B21B] dark:text-[#F0B21B]'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            onClick={() => {
              setActiveTab('dashboard');
              setIsSidebarOpen(false);
            }}
          >
             <Home className={`w-5 h-5 shrink-0 ${activeTab === 'dashboard' ? 'text-[#F0B21B] dark:text-[#F0B21B]' : ''}`} />
             <div className="flex-1 text-start">{t('الرئيسية')}</div>
          </button>

          <button
            className={`w-full p-3 rounded-xl font-semibold text-sm flex items-center gap-3 transition-all ${
              activeTab === 'productBrain'
                ? 'bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20 text-[#F0B21B] dark:text-[#F0B21B]'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            onClick={() => {
              setActiveTab('productBrain');
              setIsSidebarOpen(false);
            }}
          >
             <Brain className={`w-5 h-5 shrink-0 ${activeTab === 'productBrain' ? 'text-[#F0B21B] dark:text-[#F0B21B]' : ''}`} />
             <div className="flex-1 text-start flex items-center justify-between">{t('تحليل المنتج')}<div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] mr-auto" title="أداة ذكاء اصطناعي متاحة"></div></div>
          </button>

          <div className="mt-4 px-3 mb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("الاستراتيجية وتحليل البيانات")}</span>
          </div>

          {[
            { id: 'smartAngles', icon: Target, label: t('زوايا إعلانية ذكية') },
            { id: 'productSpy', icon: Radar, label: t('صائد المنتجات') },
          ].filter(item => isToolAllowed(item.id)).map((item) => (
            <button
              key={item.id}
              className={`w-full p-3 rounded-xl font-semibold text-sm flex items-center gap-3 transition-all ${
                activeTab === item.id
                  ? 'bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20 text-[#F0B21B] dark:text-[#F0B21B]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-[#F0B21B] dark:text-[#F0B21B]' : ''}`} />
              <div className="flex-1 text-start flex items-center justify-between"><span>{item.label}</span>{item.id === lastUsedTool && (<span className="flex h-2 w-2 relative" title={t("آخر أداة مستخدمة")}><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>)}</div>
            </button>
          ))}

          <div className="mt-4 px-3 mb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("الإنتاج البصري والفيديو")}</span>
          </div>

          {[
            { id: 'photoshoot', icon: Camera, label: t('Photoshoot AI') },
            { id: 'videoScenes', icon: Film, label: t('أوامر فيديو (Veo / Flow)') },
            { id: 'flowCharacter', icon: UserIcon, label: t('إنشاء شخصية لـ Flow') },
            { id: 'creativePrompts', icon: ImageIcon, label: t('Creative Prompts') },
            { id: 'landing', icon: LayoutTemplate, label: t('Landing Pages') },
            { id: 'landingBuilder', icon: LayoutTemplate, label: t('بناء صفحة الهبوط') },
            { id: 'ads', icon: Play, label: t('Creative Ads') },
          ].filter(item => isToolAllowed(item.id)).map((item) => (
            <button
              key={item.id}
              className={`w-full p-3 rounded-xl font-semibold text-sm flex items-center gap-3 transition-all ${
                activeTab === item.id
                  ? 'bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20 text-[#F0B21B] dark:text-[#F0B21B]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
            >
               <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-[#F0B21B] dark:text-[#F0B21B]' : ''}`} />
               <div className="flex-1 text-start flex items-center justify-between"><span>{item.label}</span>{item.id === lastUsedTool && (<span className="flex h-2 w-2 relative" title={t("آخر أداة مستخدمة")}><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>)}</div>
            </button>
          ))}

          <div className="mt-4 px-3 mb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("توليد الصوت والسيناريو")}</span>
          </div>

          {[
            { id: 'script', icon: FileText, label: t('Video Scripts') },
            { id: 'winnerAngle', icon: Quote, label: t('Winner Scripts') },
            { id: 'extractor', icon: Wand2, label: t('Script Extractor') },
          ].filter(item => isToolAllowed(item.id)).map((item) => (
            <button
              key={item.id}
              className={`w-full p-3 rounded-xl font-semibold text-sm flex items-center gap-3 transition-all ${
                activeTab === item.id
                  ? 'bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20 text-[#F0B21B] dark:text-[#F0B21B]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
            >
               <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-[#F0B21B] dark:text-[#F0B21B]' : ''}`} />
               <div className="flex-1 text-start flex items-center justify-between"><span>{item.label}</span>{item.id === lastUsedTool && (<span className="flex h-2 w-2 relative" title={t("آخر أداة مستخدمة")}><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>)}</div>
            </button>
          ))}

          <div className="mt-4 px-3 mb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("توليد النصوص")}</span>
          </div>

          {[
            { id: 'fbAds', icon: Share2, label: t('FB Ads Copies') },
            { id: 'funnelCopy', icon: MousePointer, label: t('Funnel Copy') },
            { id: 'textOnVisual', icon: TypeIcon, label: t('Text on Visual') },
          ].filter(item => isToolAllowed(item.id)).map((item) => (
            <button
              key={item.id}
              className={`w-full p-3 rounded-xl font-semibold text-sm flex items-center gap-3 transition-all ${
                activeTab === item.id
                  ? 'bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20 text-[#F0B21B] dark:text-[#F0B21B]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
            >
               <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-[#F0B21B] dark:text-[#F0B21B]' : ''}`} />
               <div className="flex-1 text-start flex items-center justify-between"><span>{item.label}</span>{item.id === lastUsedTool && (<span className="flex h-2 w-2 relative" title={t("آخر أداة مستخدمة")}><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>)}</div>
            </button>
          ))}

          <div className="mt-4 px-3 mb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t("أدوات مساعدة")}</span>
          </div>

          {[
            { id: 'downloader', icon: Download, label: t('Ad Downloader') },
            { id: 'pricing', icon: Calculator, label: t('تسعير المنتج') },
            { id: 'utmBuilder', icon: LinkIcon, label: t('UTM Builder') },
            { id: 'history', icon: History, label: t('سجل المشاريع') },
            { id: 'adsMetrics', icon: BarChart2, label: t('محلل الحملات (Metrics)') },
            { id: 'cpaPlanner', icon: Calculator, label: t('مخطط تقليل CPA') },
          ].filter(item => isToolAllowed(item.id)).map((item) => (
            <button
              key={item.id}
              className={`w-full p-3 rounded-xl font-semibold text-sm flex items-center gap-3 transition-all ${
                activeTab === item.id
                  ? 'bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20 text-[#F0B21B] dark:text-[#F0B21B]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
            >
               <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-[#F0B21B] dark:text-[#F0B21B]' : ''}`} />
               <div className="flex-1 text-start flex items-center justify-between"><span>{item.label}</span>{item.id === lastUsedTool && (<span className="flex h-2 w-2 relative" title={t("آخر أداة مستخدمة")}><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>)}</div>
            </button>
          ))}

          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4"></div>

          <button 
            className={`w-full p-3 rounded-xl font-semibold text-sm flex items-center gap-3 transition-all ${activeTab === 'settings' ? 'bg-[#09090b]/10 text-[#09090b]' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
          >
            <Settings className="w-5 h-5 shrink-0" />
            <div className="flex-1 text-start">
              { (userProfile?.role === 'admin' || userProfile?.role === 'owner') ? t("Settings / Users") : t("Settings") }
            </div>
          </button>

        </div>

        <div className="shrink-0 p-4 border-t border-zinc-200 dark:border-zinc-800">

           {/* Tokens Block */}
           {(userProfile || agencyOwnerProfile || guestMode) && (
           <div className="mt-4 bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm relative">
             <h4 className="font-bold text-[#111827] dark:text-white mb-3 text-sm flex justify-between items-center">
               <span>{agencyMemberInfo ? t("Agency Balance") : t("Tokens")}</span>
               <Zap className="w-4 h-4 text-[#F0B21B]" />
             </h4>
             
             {agencyMemberInfo ? (
               <>
                 <div className="flex flex-col gap-3">
                   {/* Shared Agency Balance First */}
                   <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-zinc-400">{t("Shared Balance")}</div>
                      <div className="text-lg font-black text-[#F0B21B] dark:text-[#F0B21B]">
                         {(agencyOwnerProfile?.tokens || 0).toLocaleString()} <span className="text-xs text-zinc-500 font-medium">توكينز</span>
                      </div>
                   </div>

                   {/* Member's Usage Limit if applicable */}
                   {agencyMemberInfo.tokenLimit > 0 && (
                     <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex justify-between items-center mb-1.5">
                           <span className="text-[10px] uppercase font-bold text-zinc-400">{t("Personal Limit")}</span>
                           <span className="text-[10px] font-bold text-zinc-500">{Math.round((agencyMemberInfo.tokensUsed / agencyMemberInfo.tokenLimit) * 100)}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mb-2 overflow-hidden">
                          <div 
                            className="bg-[#09090b] h-full rounded-full transition-all duration-1000 ease-in-out" 
                            style={{ width: `${Math.min(100, Math.max(0, (agencyMemberInfo.tokensUsed / agencyMemberInfo.tokenLimit) * 100))}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                          <span>{(agencyMemberInfo.tokenLimit - agencyMemberInfo.tokensUsed).toLocaleString()} {t("Remaining")}</span>
                          <span>{agencyMemberInfo.tokenLimit.toLocaleString()}</span>
                        </div>
                     </div>
                   )}
                 </div>
               </>
             ) : (
               <>
                 <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 mb-2 overflow-hidden">
                   <div 
                     className="bg-[#F0B21B] h-full rounded-full transition-all duration-1000 ease-in-out" 
                     style={{ width: `${Math.min(100, Math.max(0, (((userProfile || guestProfile)?.tokens || 0) / ((userProfile || guestProfile)?.plan === 'Team' ? 12000 : (userProfile || guestProfile)?.plan === 'Pro' ? 3000 : 100)) * 100))}%` }}
                   ></div>
                 </div>
                 <div className="text-sm font-bold text-[#111827] dark:text-white flex items-center justify-between">
                   <span>{((userProfile || guestProfile)?.tokens || 0).toLocaleString()}</span>
                   <span className="text-zinc-400 font-medium text-xs">
                     {(userProfile || guestProfile)?.plan === 'Team' ? '12,000' : (userProfile || guestProfile)?.plan === 'Pro' ? '3,000' : '100'} MAX
                   </span>
                 </div>
               </>
             )}
           </div>
           )}
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="lg:hidden">
            {user ? (
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-[#F0B21B] dark:text-[#F0B21B] flex items-center justify-center shrink-0 font-bold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                  )}
                  <div className="truncate">
                    <div className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user.displayName || 'مستخدم'}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-[#F0B21B] transition-colors" title={t("تسجيل الخروج")}>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-[#F0B21B]/15 border border-[#F0B21B]/30 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#F0B21B] text-[#09090b] flex items-center justify-center text-xs font-black">
                      ✓
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-amber-800 dark:text-[#F0B21B] block">{t("وضع الضيف (مفتوح)")}</span>
                      <span className="text-amber-700/80 dark:text-[#F0B21B]/80">{t("جميع الأدوات متاحة")}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full py-2.5 px-3 bg-[#09090b] hover:bg-[#18181b] shadow-sm text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t("تسجيل الدخول بحساب Google")}
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <button 
                onClick={() => window.location.href = '/privacy-policy'}
                className="text-xs font-bold text-indigo-500 hover:underline"
              >
                {t("Privacy Policy")}
              </button>
              <button 
                onClick={() => window.location.href = '/terms-of-service'}
                className="text-xs font-bold text-indigo-500 hover:underline"
              >
                {t("Terms of Service")}
              </button>
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Powered by <span className="text-[#09090b] font-bold">KH AI</span></p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">&copy; {new Date().getFullYear()} All Rights Reserved</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-[#09090b] sticky top-0 z-40 transition-colors duration-200 shadow-sm py-3 px-4 lg:px-8 border-b border-zinc-200 dark:border-[#09090b] flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-3">
              <div className="flex lg:hidden items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <div className="p-1 rounded-lg">
                  <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <h1 className="text-lg font-black text-[#09090b] dark:text-white tracking-tight">KH</h1>
              </div>
              <div className="hidden lg:flex flex-col">
                <h2 className="text-lg font-black text-[#09090b] dark:text-white drop-shadow-md">{t("مولّد الإعلانات الذكي ✨")}</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-300 font-medium">{t("خطوتك الأسرع لمضاعفة مبيعاتك بنقرة واحدة")}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm shadow-sm ${activeTab === 'history' ? 'bg-[#09090b] text-white shadow-[#F0B21B]/20' : 'bg-[#09090b]/5 dark:bg-white/10 hover:bg-[#09090b]/10 dark:hover:bg-white/20 text-[#09090b] dark:text-white border border-[#09090b]/10 dark:border-white/20'}`}
              >
                <History className="w-4 h-4" />
                {t("سجل المحفوظات")}</button>

              <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 mx-1"></div>

              {user ? (
                <div className="flex items-center gap-3 bg-[#09090b]/5 dark:bg-white/10 px-3 py-1.5 rounded-xl shadow-sm border border-[#09090b]/10 dark:border-white/20 backdrop-blur-md">
                  <div className="flex items-center gap-2">

                    {user.photoURL && (
                      <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full ring-2 ring-[#09090b]/20 dark:ring-white/50" referrerPolicy="no-referrer" />
                    )}
                    
   <div className="flex flex-col items-start gap-0.5 max-w-[100px] truncate">
       <span className="text-sm font-medium text-[#09090b] dark:text-white truncate w-full">{user.displayName?.split(' ')[0] || 'مستخدم'}</span>
       {(userProfile || agencyOwnerProfile) && (
           <span className="text-xs font-bold text-[#F0B21B] dark:text-[#F0B21B] flex items-center gap-1">
              <Zap className="w-3 h-3" /> {(agencyOwnerProfile ? agencyOwnerProfile.tokens : (userProfile?.tokens ?? 0))} توكينز
           </span>
       )}
   </div>
  
                  </div>
                  <button onClick={handleLogout} className="p-1.5 text-[#09090b]/50 dark:text-white/70 hover:text-[#09090b] dark:hover:text-white hover:bg-[#09090b]/10 dark:hover:bg-white/10 transition-colors rounded-lg" title={t("تسجيل الخروج")}>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F0B21B]/15 text-amber-800 dark:text-[#F0B21B] rounded-xl border border-[#F0B21B]/30 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#F0B21B] animate-pulse"></span>
                    <span>{t("دخول مباشر (ضيف)")}</span>
                    <span className="opacity-75">| 9,999 توكينز</span>
                  </div>
                  <button
                    onClick={handleLogin}
                    className="px-3.5 py-1.5 bg-[#09090b] hover:bg-[#18181b] shadow-sm text-white rounded-xl font-bold transition-colors text-xs sm:text-sm flex items-center gap-1.5"
                    title={t("ربط حساب Google")}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t("تسجيل الدخول")}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="hidden lg:block h-6 w-px bg-zinc-200 dark:bg-white/10 mx-1"></div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-[#09090b]/5 dark:bg-white/10 hover:bg-[#09090b]/10 dark:hover:bg-white/20 text-[#09090b] dark:text-white transition-colors shadow-sm border border-[#09090b]/10 dark:border-white/20 backdrop-blur-md"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-[#09090b]" />}
            </button>
            
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl bg-[#09090b]/5 dark:bg-white/10 hover:bg-[#09090b]/10 dark:hover:bg-white/20 text-[#09090b] dark:text-white transition-colors shadow-sm border border-[#09090b]/10 dark:border-white/20 backdrop-blur-md font-bold text-sm min-w-[40px] whitespace-nowrap"
              aria-label="Toggle language"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>

            {/* Mobile Menu Button - Ensure it's visually the last item */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-gradient-to-br from-[#09090b] to-purple-600 text-white shadow-xl hover:opacity-90 transition-opacity mr-1 rtl:mr-0 rtl:ml-1 shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
              <Dashboard setActiveTab={setActiveTab} history={history} userProfile={resolvedProfile} isToolAllowed={isToolAllowed} />
            </div>
            
            {activeTab === 'landingBuilder' && (
              <div className="w-full h-full">
                <LandingPageBuilder 
                  ref={landingPageBuilderRef}
                  productName={productName}
                  productDescription={description}
                  brandKit={activeBrandKit && applyBrandKit ? activeBrandKit : undefined}
                  history={history}
                  onSave={(data) => saveToHistory('landingBuilder', data.html, description)}
                />
              </div>
            )}
            
            {activeTab === 'brandKits' && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <Box className="w-16 h-16 text-[#09090b] opacity-50 mb-2" />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t("Brand Kits")}</h2>
                <p className="text-zinc-500 dark:text-zinc-400">{t("Create consistent ads by saving your brand colors, fonts, and logos. Coming soon!")}</p>
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <BarChart2 className="w-16 h-16 text-[#09090b] opacity-50 mb-2" />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t("Analytics")}</h2>
                <p className="text-zinc-500 dark:text-zinc-400">{t("Track your ad performance and ROI across all campaigns. Coming soon!")}</p>
              </div>
            )}
            
            <div style={{ display: activeTab === 'downloader' ? 'block' : 'none' }}>
              <DownloadPage />
            </div>
            
            <div style={{ display: activeTab === 'extractor' ? 'block' : 'none' }}>
              <ExtractPage />
            </div>

            <div style={{ display: activeTab === 'utmBuilder' ? 'block' : 'none' }}>
              <UtmBuilder />
            </div>
            
            {activeTab === 'pricing' && (
              <PricingCalculator />
            )}
            
            <div className={`animate-fade-in pb-16 max-w-7xl mx-auto px-4 mt-8 ${activeTab === 'autoSuite' ? 'block' : 'hidden'}`}>
              <AutoSuite />
            </div>
            
            <div className={`animate-fade-in pb-16 max-w-7xl mx-auto px-4 mt-8 ${activeTab === 'productSpy' ? 'block' : 'hidden'}`}>
              <ProductSpy />
            </div>
            
                        {activeTab === 'adsMetrics' && (
              <AdsMetricsAnalyzer />
            )}
            
            {activeTab === 'cpaPlanner' && (
              <CPAReductionPlanner />
            )}
            
            {activeTab === 'settings' && (
              <SettingsPage />
            )}
            
            {activeTab === 'history' && (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("سجل المحفوظات")}</h2>
                    
                    {user && history.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={historyFilter}
                          onChange={(e) => setHistoryFilter(e.target.value)}
                          className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#F0B21B]/50"
                        >
                          <option value="all">{t("جميع الأدوات")}</option>
                          <option value="script">{t("اسكريبت وفويس")}</option>
                          <option value="fbAds">{t("إعلانات منصات التواصل")}</option>
                          <option value="funnelCopy">{t("محتوى الفانل")}</option>
                          <option value="smartAngles">{t("الزوايا الإعلانية")}</option>
                          <option value="landingBuilder">{t("صفحات الهبوط")}</option>
                          <option value="productBrain">{t("تحليل المنتج")}</option>
                          <option value="videoScenes">{t("Flow Video")}</option>
                        </select>
                        
                        <button
                          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showFavoritesOnly ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                        >
                          <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                          <span className="hidden sm:inline">{t("المفضلة")}</span>
                        </button>

                        {!showClearConfirm ? (
                          <button
                            onClick={() => setShowClearConfirm(true)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                            title={t("مسح الكل")}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">{t("مسح الكل")}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
                            <span className="text-xs text-red-600 dark:text-red-400">{t("متأكد؟")}</span>
                            <button onClick={clearAllHistory} className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-200 dark:bg-red-800/50 px-2 py-1 rounded">{t("نعم")}</button>
                            <button onClick={() => setShowClearConfirm(false)} className="text-xs font-bold text-zinc-600 hover:text-zinc-800 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">{t("إلغاء")}</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!user ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <History className="w-16 h-16 mb-4 opacity-50" />
                      <p className="mb-4">{t("يرجى تسجيل الدخول لعرض سجل المحفوظات")}</p>
                      <button
                        onClick={handleLogin}
                        className="py-2 px-6 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black shadow-lg shadow-amber-500/20/30 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        {t("تسجيل الدخول")}
                      </button>
                    </div>
                  ) : isHistoryLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#F0B21B]" />
                      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">{t("جاري تحميل السجل...")}</p>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <History className="w-16 h-16 mb-4 opacity-50" />
                      <p>{t("لا يوجد سجل محفوظات حتى الآن")}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {history.filter(item => (historyFilter === 'all' || item.type === historyFilter) && (!showFavoritesOnly || item.isFavorite)).map((item) => (
                        <div key={item.id} className="bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-black to-zinc-900 shadow-lg shadow-amber-500/20/30 text-white rounded-lg text-[#F0B21B] dark:text-[#F0B21B]">
                                {item.type === 'funnelCopy' && <LayoutTemplate className="w-5 h-5" />}
                                {item.type === 'script' && <FileText className="w-5 h-5" />}
                                {item.type === 'fbAds' && <TypeIcon className="w-5 h-5" />}
                                {item.type === 'videoScenes' && <Film className="w-5 h-5" />}
                                {item.type === 'winnerAngle' && <RefreshCw className="w-5 h-5" />}
                                {item.type === 'creativePrompts' && <ImageIcon className="w-5 h-5" />}
                                {item.type === 'textOnVisual' && <Quote className="w-5 h-5" />}
                                {item.type === 'productBrain' && <Brain className="w-5 h-5" />}
                                {item.type === 'landingBuilder' && <LayoutTemplate className="w-5 h-5" />}
                                {item.type === 'smartAngles' && <Target className="w-5 h-5" />}
                                {item.type === 'flowCharacter' && <UserIcon className="w-5 h-5" />}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                  {item.type === 'funnelCopy' && 'محتوى صفحة المنتج كفانل'}
                                  {item.type === 'script' && 'اسكريبتات وفويس اوفر AI'}
                                  {item.type === 'fbAds' && 'نصوص إعلانات فيسبوك وتيك توك'}
                                  {item.type === 'videoScenes' && 'اسكريبتات وفويس اوفر AI (Flow)'}
                                  {item.type === 'winnerAngle' && 'إعادة توليد الوينر أنجل'}
                                  {item.type === 'creativePrompts' && 'كريتيف GPT'}
                                  {item.type === 'textOnVisual' && 'نصوص ثابتة على الفيديوهات'}
                                  {item.type === 'productBrain' && 'تحليل المنتج (Product Brain)'}
                                  {item.type === 'landingBuilder' && 'بناء صفحة الهبوط'}
                                  {item.type === 'smartAngles' && 'زوايا إعلانية ذكية'}
                                  {item.type === 'flowCharacter' && 'إنشاء شخصية في Flow'}
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                  {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleString('ar-EG') : 'تاريخ غير معروف'}
                                </p>
                              </div>
                            </div>
                                                        <div className="flex items-center gap-2">
                              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 mr-2">
                                <button 
                                  onClick={() => updateHistoryStatus(item.id, 'success')}
                                  className={`p-1.5 rounded-md transition-colors ${item.status === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'text-zinc-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                                  title={t("نجح")}
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => updateHistoryStatus(item.id, 'failed')}
                                  className={`p-1.5 rounded-md transition-colors ${item.status === 'failed' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                                  title={t("لم ينجح")}
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  toggleFavorite(item.id, !!item.isFavorite);
                                }}
                                className={`p-2 rounded-lg transition-colors ${item.isFavorite ? 'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' : 'text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                                title={t("المفضلة")}
                              >
                                <Star className={`w-5 h-5 ${item.isFavorite ? 'fill-current' : ''}`} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  let textToCopy = '';
                                  if (typeof item.content === 'string') {
                                    textToCopy = item.content;
                                  } else if (item.type === 'fbAds' && item.content?.fbAds) {
                                    textToCopy = item.content.fbAds.map((ad: any) => `[${ad.type}]
Hook: ${ad.hook}
Body: ${ad.body}
CTA: ${ad.cta}`).join('\n\n');
                                  } else if (item.type === 'smartAngles') {
                                    textToCopy = item.content.map((script: any) => `[${script.title}]
الجمهور: ${script.audience}
الهوك: ${script.hook}
الزاوية: ${script.angle}`).join('\n\n');
                                  } else if (Array.isArray(item.content)) {
                                    textToCopy = item.content.map((c: any) => typeof c === 'string' ? c : (c.content || JSON.stringify(c))).join('\n\n');
                                  } else {
                                    textToCopy = JSON.stringify(item.content, null, 2);
                                  }
                                  
                                  navigator.clipboard.writeText(textToCopy);
                                  setHistoryItemCopied(item.id);
                                  setTimeout(() => setHistoryItemCopied(null), 2000);
                                }}
                                className={`p-2 rounded-lg transition-colors ${historyItemCopied === item.id ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                title={t("نسخ المحتوى")}
                              >
                                {historyItemCopied === item.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  let textToCopy = '';
                                  if (typeof item.content === 'string') {
                                    textToCopy = item.content;
                                  } else if (item.type === 'fbAds' && item.content?.fbAds) {
                                    textToCopy = item.content.fbAds.map((ad: any) => `[${ad.type}]
Hook: ${ad.hook}
Body: ${ad.body}
CTA: ${ad.cta}`).join('\n\n');
                                  } else if (item.type === 'smartAngles') {
                                    textToCopy = item.content.map((script: any) => `[${script.title}]
الجمهور: ${script.audience}
الهوك: ${script.hook}
الزاوية: ${script.angle}`).join('\n\n');
                                  } else if (Array.isArray(item.content)) {
                                    textToCopy = item.content.map((c: any) => typeof c === 'string' ? c : (c.content || JSON.stringify(c))).join('\n\n');
                                  } else {
                                    textToCopy = JSON.stringify(item.content, null, 2);
                                  }
                                  
                                  navigator.clipboard.writeText(textToCopy);
                                  setHistoryItemCopied(item.id);
                                  setTimeout(() => setHistoryItemCopied(null), 2000);
                                }}
                                className={`p-2 rounded-lg transition-colors ${historyItemCopied === item.id ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                                title={t("نسخ المحتوى")}
                              >
                                {historyItemCopied === item.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                              </button>
                              <button 
                                onClick={() => {
                                  const safeItem = {
                                    id: item.id,
                                    type: item.type,
                                    description: item.description,
                                    content: item.content,
                                    createdAt: item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : item.createdAt
                                  };
                                  let stringified = "";
                                  try {
                                    const safeClone = removeCircular(safeItem);
                                    stringified = JSON.stringify(safeClone);
                                  } catch (e) {
                                    console.error('Error stringifying item', e);
                                    stringified = JSON.stringify({ error: 'Circular reference omitted' });
                                  }
                                  const encoded = LZString.compressToEncodedURIComponent(stringified);
                                  const url = `${window.location.origin}?shared=${encoded}`;
                                  try {
                                    if (navigator.share) {
                                      navigator.share({
                                        title: 'مشروع أداة KH',
                                        url: url
                                      }).catch(() => {
                                        navigator.clipboard.writeText(url);
                                        alert(t('تم نسخ الرابط!'));
                                      });
                                    } else {
                                      navigator.clipboard.writeText(url);
                                      alert(t('تم نسخ الرابط!'));
                                    }
                                  } catch (error) {
                                    navigator.clipboard.writeText(url);
                                    alert(t('تم نسخ الرابط!'));
                                  }
                                }}
                                className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title={t("مشاركة الأداة")}
                              >
                                <Share2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  deleteHistoryItem(item.id);
                                }}
                                className="p-2 text-zinc-400 hover:text-[#F0B21B] hover:bg-amber-50 dark:bg-zinc-900 dark:hover:bg-fuchsia-900/20 rounded-lg transition-colors"
                                title={t("حذف من السجل")}
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4">
                            {item.type === 'productBrain' && (
                              <div className="prose dark:prose-invert max-w-none text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed max-h-64 overflow-y-auto p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                <ReactMarkdown>{item.content}</ReactMarkdown>
                              </div>
                            )}

                            {item.type === 'landingBuilder' && (
                              <div className="mt-4">
                                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white relative group">
                                  <iframe srcDoc={item.content} className="w-full h-96" sandbox="allow-scripts allow-same-origin" />
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(item.content);
                                    setHistoryItemCopied(item.id + '_code');
                                    setTimeout(() => setHistoryItemCopied(null), 2000);
                                  }}
                                  className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-center ${historyItemCopied === item.id + '_code' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'}`}
                                >
                                  {historyItemCopied === item.id + '_code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  {historyItemCopied === item.id + '_code' ? 'تم نسخ الكود!' : 'نسخ كود HTML'}
                                </button>
                              </div>
                            )}

                            {item.type === 'flowCharacter' && (
                              <div className="prose dark:prose-invert max-w-none text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed max-h-64 overflow-y-auto p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                <ReactMarkdown>{item.content}</ReactMarkdown>
                              </div>
                            )}

                            {item.type === 'funnelCopy' && (
                              <div className="font-sans text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm whitespace-pre-wrap max-h-64 overflow-y-auto p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                {item.content}
                              </div>
                            )}
                            
                            {(item.type === 'script' || item.type === 'winnerAngle' || item.type === 'smartAngles') && Array.isArray(item.content) && (
                              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {item.content.map((script: any, idx: number) => (
                                  <div key={idx} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                    <h4 className="font-bold text-[#F0B21B] dark:text-[#F0B21B] mb-2">
                                      {item.type === 'smartAngles' ? script.title : script.type}
                                    </h4>
                                    <div className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                                      {item.type === 'smartAngles' ? `الجمهور: ${script.audience}

الهوك:
${script.hook}

الزاوية:
${script.angle}` : script.content}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {item.type === 'textOnVisual' && Array.isArray(item.content) && (
                              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {item.content.map((sentence: string, idx: number) => (
                                  <div key={idx} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-start gap-3">
                                     <div className="w-6 h-6 rounded-full bg-[#09090b]/10 text-[#09090b] flex items-center justify-center font-bold shrink-0 text-xs">{idx + 1}</div>
                                     <div className="text-sm font-medium pt-0.5">{sentence}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {item.type === 'fbAds' && item.content?.fbAds && (
                              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {item.content.fbAds.map((ad: any, idx: number) => (
                                  <div key={idx} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                    <h4 className="font-bold text-[#F0B21B] dark:text-[#F0B21B] mb-2">{ad.type}</h4>
                                    <div className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                                      <strong>Hook:</strong> {ad.hook}<br/><br/>
                                      <strong>Body:</strong> {ad.body}<br/><br/>
                                      <strong>CTA:</strong> {ad.cta}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {item.type === 'videoScenes' && Array.isArray(item.content) && (
                              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {item.content.map((scene: any, idx: number) => (
                                  <div key={idx} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                    <h4 className="font-bold text-[#F0B21B] dark:text-[#F0B21B] mb-2">
                                      {scene.prompt?.toLowerCase().includes('hook') ? 'هوك (بداية)' : 'المشهد'} {scene.sceneNumber}
                                    </h4>
                                    <div className="text-sm text-zinc-800 dark:text-zinc-200 mb-2">
                                      <strong>Prompt:</strong> <span dir="ltr" className="font-mono text-xs">{scene.prompt}</span>
                                    </div>
                                    <div className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                                      <strong>Script:</strong><br/>{scene.script}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {item.type === 'creativePrompts' && Array.isArray(item.content) && (
                              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {item.content.map((promptData: any, idx: number) => (
                                  <div key={idx} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                    <h4 className="font-bold text-[#F0B21B] dark:text-[#F0B21B] mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">{t("تصميم")}{idx + 1}</h4>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <p className="text-xs font-semibold text-zinc-500 uppercase">{t("الفكرة البيعية:")}</p>
                                        <p className="text-sm text-zinc-800 dark:text-zinc-200">{promptData.concept}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-zinc-500 uppercase">{t("الاستايل البصري:")}</p>
                                        <p className="text-sm text-zinc-800 dark:text-zinc-200">{promptData.visualStyle}</p>
                                      </div>
                                    </div>

                                    {promptData.textOverlay && (
                                      <div className="mb-4 bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/10 p-3 rounded-lg border border-fuchsia-100 dark:border-fuchsia-900/20 text-center">
                                        <p className="text-xs font-semibold text-[#F0B21B] mb-1">{t("النص التسويقي")}</p>
                                        <p className="text-lg font-bold text-fuchsia-700 dark:text-[#F0B21B]">"{promptData.textOverlay.headline}"</p>
                                        {promptData.textOverlay.subheadline && <p className="text-sm text-[#F0B21B]/80 dark:text-[#F0B21B]/80 mt-1">{promptData.textOverlay.subheadline}</p>}
                                      </div>
                                    )}

                                    {promptData.layout && (
                                      <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                        <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">{t("تفاصيل التصميم")}</p>
                                        <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
                                          <li><span className="font-semibold">{t("الخلفية:")}</span> {promptData.layout.background}</li>
                                          <li><span className="font-semibold">{t("المنتج:")}</span> {promptData.layout.productPlacement}</li>
                                        </ul>
                                      </div>
                                    )}
                                    
                                    <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">{t("أمر توليد التصميم الشامل (AI Prompt):")}</p>
                                    <div dir="ltr" className="bg-black/5 dark:bg-black/20 p-2 rounded text-xs font-mono text-zinc-800 dark:text-zinc-300">
                                      {promptData.aiPrompt}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
            )}
            
            {(activeTab === 'photoshoot' || activeTab === 'landing' || activeTab === 'ads' || activeTab === 'script' || activeTab === 'fbAds' || activeTab === 'funnelCopy' || activeTab === 'videoScenes' || activeTab === 'winnerAngle' || activeTab === 'creativePrompts' || activeTab === 'textOnVisual' || activeTab === 'productBrain' || activeTab === 'smartAngles' || activeTab === 'flowCharacter') && (
            <div className="flex flex-col gap-8 items-start w-full">
              <div className="w-full shrink-0 space-y-6">
                <div className={`bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors duration-200 w-full mb-6`}>
  {activeTab !== 'winnerAngle' && (
  <div className="mb-8 flex flex-col items-center justify-center text-center">
    <h2 className="text-2xl font-bold text-[#09090b] dark:text-white mb-2 flex items-center justify-center gap-2">
      <Box className="w-5 h-5 text-[#F0B21B] dark:text-[#F0B21B]" />
      {t("بيانات المنتج")}
    </h2>
    <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t("أدخل بيانات المنتج وسيتم توليد التصميم الإعلاني المناسب")}</p>
  </div>
  )}
  
  <div className="flex flex-col gap-8 w-full">
    {/* الصف الأول */}
    {activeTab !== 'winnerAngle' && (
    <div className="w-full">
      <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t("رابط المنتج (اختياري)")}</label>
      <div className="flex gap-2 relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <LinkIcon className="h-4 w-4 text-zinc-400" />
        </div>
        <input
          type="url"
          value={extractUrl}
          onChange={(e) => setExtractUrl(e.target.value)}
          placeholder={t("https://example.com/product")}
          className="block w-full pr-10 pl-32 py-3 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] outline-none transition-colors text-sm shadow-sm"
          dir="ltr"
        />
        <button
          onClick={handleExtractFromUrl}
          disabled={isExtracting || !extractUrl}
          className="absolute left-2 top-2 bottom-2 px-6 bg-[#09090b] hover:bg-[#18181b] shadow-sm text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm whitespace-nowrap"
        >
          {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>✨ {t("استخراج")}</>}
        </button>
      </div>
    </div>
    )}

    {/* الصف الثاني والثالث */}
    {activeTab !== 'winnerAngle' && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
      {/* Col Right: Product Name */}
      <div className="w-full flex flex-col">
        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t("اسم المنتج")}</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder={t("اكتب اسم المنتج")}
          className="block w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] outline-none transition-colors text-sm shadow-sm"
        />
      </div>

      {/* Col Left: Product Description */}
      <div className="w-full flex flex-col">
        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t("وصف المنتج")}</label>
        
        {generatedSmartAngles.length > 0 && (
          <div className="mb-4">
            <select
              value={selectedSmartAngleIndex === null ? '' : selectedSmartAngleIndex}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setSelectedSmartAngleIndex(null);
                } else {
                  const idx = parseInt(val);
                  setSelectedSmartAngleIndex(idx);
                  const angle = generatedSmartAngles[idx];
                  setDescription(prev => {
                    const cleanPrev = prev.replace(/\n\n--- زاوية إعلانية مستهدفة ---.*/s, '');
                    return cleanPrev + `

--- زاوية إعلانية مستهدفة ---
الزاوية الإعلانية: ${angle.title}
الجمهور: ${angle.audience}
الهوك: ${angle.hook}
التفاصيل: ${angle.angle}`;
                  });
                }
              }}
              className="w-full p-3 border border-fuchsia-300 dark:border-fuchsia-700 bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/10 text-fuchsia-900 dark:text-fuchsia-300 rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 outline-none transition-colors text-sm shadow-sm"
            >
              <option value="">{t("-- اختر زاوية إعلانية لتطبيقها في الوصف --")}</option>
              {generatedSmartAngles.map((angle, idx) => (
                <option key={idx} value={idx}>{angle.title} - {angle.audience}</option>
              ))}
            </select>
          </div>
        )}

        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("اكتب وصفاً مختصراً عن المنتج ومميزاته وفوائده...")}
          className="block w-full h-[140px] p-4 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] outline-none resize-none transition-colors shadow-sm text-sm leading-relaxed"
        />

        {activeBrandKit && (
           <div className="flex items-center gap-3 p-4 mb-4 rounded-xl border border-[#09090b]/20 bg-[#09090b]/5 mt-4">
              <input 
                 type="checkbox" 
                 id="applyBrandToggle" 
                 checked={applyBrandKit} 
                 onChange={e => setApplyBrandKit(e.target.checked)}
                 className="w-5 h-5 text-[#09090b] bg-white border-zinc-300 rounded focus:ring-[#09090b] focus:ring-2 cursor-pointer"
              />
              <label htmlFor="applyBrandToggle" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                 تطبيق هوية البراند النشطة (Brand Kit: {activeBrandKit.name})
              </label>
           </div>
        )}
      </div>
    </div>
    )}

    {/* الصف الرابع - رفع الصور أو الفيديو */}
    <div className="w-full flex flex-col gap-6 mt-2">
      {/* Col Left: Image Upload OR Winner Video Upload */}
      <div className="w-full flex-1 flex flex-col">
          {activeTab === 'winnerAngle' ? (
              <div className="w-full">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        {t("ارفع فيديو/صوت الانجل الوينر (الحد الأقصى 20 ميجابايت)")}</label>
                    <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <input 
                        type="file" 
                        accept="video/*,audio/*" 
                        onChange={handleVideoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        {winnerVideo ? (
                        <div className="flex flex-col items-center">
                            {winnerVideo.file.type.startsWith('audio/') ? (
                            <audio src={winnerVideo.previewUrl} className="w-full max-w-sm rounded-lg mb-4" controls />
                            ) : (
                            <video src={winnerVideo.previewUrl} className="h-32 rounded-lg mb-4" controls />
                            )}
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{winnerVideo.file.name}</p>
                        </div>
                        ) : (
                        <div className="flex flex-col items-center">
                            <Video className="w-12 h-12 text-zinc-400 mb-4" />
                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t("اسحب وأفلت الفيديو أو الصوت هنا أو اضغط للاختيار")}</p>
                            <p className="text-xs text-zinc-500 mt-2">{t("يدعم MP4, MOV, WEBM, MP3, WAV (حتى 20MB)")}</p>
                        </div>
                        )}
                    </div>
                </div>

                {winnerVideo && (
                <div className="mb-6 p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {t("السكريبت الأصلي (قابل للتعديل)")}</label>
                    <button
                        onClick={handleExtractWinnerScript}
                        disabled={isExtractingWinnerScript || !winnerVideo}
                        className="py-1.5 px-4 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black shadow-[0_0_15px_rgba(192,38,211,0.5)] text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isExtractingWinnerScript ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t("جاري الاستخراج...")}</>
                        ) : (
                        <>
                            <FileText className="w-4 h-4" />
                            {t("استخراج السكريبت")}</>
                        )}
                    </button>
                    </div>
                    <textarea
                    value={extractedWinnerScript}
                    onChange={(e) => setExtractedWinnerScript(e.target.value)}
                    placeholder={t("سيظهر السكريبت المستخرج هنا، ويمكنك تعديله قبل التوليد...")}
                    className="w-full h-48 p-4 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] bg-white dark:bg-[#0a0510] outline-none resize-none transition-colors font-sans leading-relaxed"
                    dir="auto"
                    />

                    {activeBrandKit && (
                       <div className="flex items-center gap-3 p-4 mt-4 rounded-xl border border-[#09090b]/20 bg-[#09090b]/5">
                          <input 
                             type="checkbox" 
                             id="applyBrandToggleWinner" 
                             checked={applyBrandKit} 
                             onChange={e => setApplyBrandKit(e.target.checked)}
                             className="w-5 h-5 text-[#09090b] bg-white border-zinc-300 rounded focus:ring-[#09090b] focus:ring-2 cursor-pointer"
                          />
                          <label htmlFor="applyBrandToggleWinner" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                             تطبيق هوية البراند في إعادة صياغة الفيديو (Brand Kit: {activeBrandKit.name})
                          </label>
                       </div>
                    )}
                </div>
                )}
            </div>
          ) : (
              // IMAGE UPLOAD BLOCK
            <div className="w-full flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("رفع الصور")}</label>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const clipboardItems = await navigator.clipboard.read();
                      let foundImage = false;
                      for (const clipboardItem of clipboardItems) {
                        const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
                        for (const imageType of imageTypes) {
                          foundImage = true;
                          const blob = await clipboardItem.getType(imageType);
                          const file = new File([blob], "pasted-image.png", { type: imageType });
                          const newImage = {
                            file,
                            preview: URL.createObjectURL(file)
                          };
                          setImages(prev => [...prev, newImage]);
                        }
                      }
                      if (!foundImage) {
                        alert(t("لم يتم العثور على صور في الحافظة. قم بنسخ صورة أولاً."));
                      }
                    } catch (err: any) {
                      console.error("Failed to read clipboard:", err);
                      let errorMsg = t("حدث خطأ أثناء قراءة الحافظة. تأكد من إعطاء الصلاحيات للمتصفح.");
                      if (err && err.name === 'NotAllowedError') {
                        errorMsg = t("إذن الوصول للحافظة غير متاح (ربما لأن التطبيق يعمل داخل إطار). يرجى استخدام الاختصار المباشر: Ctrl+V (في ويندوز) أو Cmd+V (في الماك) أثناء وقوفك على هذه الشاشة للصق الصورة مباشرًة.");
                      }
                      alert(errorMsg);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#09090b] font-semibold bg-[#09090b]/10 hover:bg-[#09090b]/20 px-3 py-1.5 rounded-lg transition-colors border border-[#09090b]/20 cursor-pointer"
                >
                  <Clipboard className="w-4 h-4" />
                  {t("لصق الصور من الحافظة")}
                </button>
              </div>
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer relative flex flex-col items-center justify-center min-h-[160px] ${isDragging ? 'border-[#09090b] bg-[#09090b]/5' : 'border-amber-200 dark:border-zinc-800 dark:border-fuchsia-900/30 bg-amber-50 dark:bg-zinc-900/50 dark:bg-fuchsia-900/10 hover:border-fuchsia-300 dark:hover:border-fuchsia-800'}`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {images.length > 0 ? (
                  <div className="grid grid-cols-4 lg:grid-cols-5 gap-2 w-full max-h-full overflow-y-auto">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-square z-10">
                          <img src={img.preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#09090b] z-0 pointer-events-none">
                    <Upload className={`w-8 h-8 mb-3 ${isDragging ? 'scale-110' : ''} transition-transform`} />
                    <span className="text-sm font-bold">{isDragging ? 'أفلت الصور هنا' : 'اسحب وأفلت الصور هنا'}</span>
                    <span className="text-xs mt-1 text-[#09090b]/70">{t("أو اضغط للاختيار من جهازك")}</span>
                    <span className="text-[10px] mt-2 text-zinc-400 dark:text-zinc-500">10MB أقصى حجم • PNG, JPG, WEBP</span>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  </div>

  {/* ProductBrain specific section */}
  {activeTab === 'productBrain' && (
      <ProductBrainPage 
        ref={productBrainRef}
        productName={productName}
        productDescription={description}
        onTransferToDescription={(text) => {
          setDescription(text);
          setActiveTab('dashboard');
        }} 
        setIsGeneratingExternal={setIsGeneratingProductBrain}
        onSaveHistory={(report) => saveToHistory('productBrain', report, description)}
        brandKit={activeBrandKit}
        applyBrandKit={applyBrandKit}
      />
  )}
  


  {/* Generate CTA Button Container */}
  

<div className={`mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/50`}>
    <div className="mb-4">
       <button className="text-xs font-semibold text-zinc-500 flex items-center gap-1 hover:text-zinc-700 transition-colors">
          <Settings className="w-4 h-4" /> إعدادات متقدمة
       </button>
    </div>
    <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
{(activeTab === 'landing' || activeTab === 'ads' || activeTab === 'script' || activeTab === 'fbAds' || activeTab === 'funnelCopy' || activeTab === 'videoScenes' || activeTab === 'winnerAngle' || activeTab === 'creativePrompts' || activeTab === 'textOnVisual' || activeTab === 'flowCharacter') && (
                  <div className="py-6 flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:w-1/3">
                      <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {t("إعدادات التوليد")}
                      </label>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {t("حدد اللهجة والنمط المناسب لعملك.")}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col gap-4">
                        <div className={`grid ${activeTab === 'creativePrompts' || activeTab === 'winnerAngle' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                          <div>
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t("اللهجة")}</label>
                            <select 
                              value={dialect}
                              onChange={(e) => setDialect(e.target.value)}
                              className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] bg-white dark:bg-[#0a0510] outline-none transition-colors shadow-sm"
                            >
                              <option value="egyptian">{t("المصرية (عامية)")}</option>
                              <option value="saudi">{t("السعودية (عامية)")}</option>
                              <option value="emirati">{t("الإماراتية")}</option>
                              <option value="libyan">{t("الليبية")}</option>
                              <option value="iraqi">{t("العراقية")}</option>
                              <option value="syrian">{t("السورية")}</option>
                              <option value="palestinian">{t("الفلسطينية")}</option>
                              <option value="english">{t("الإنجليزية")}</option>
                              <option value="standard">{t("العربية الفصحى")}</option>
                            </select>
                          </div>

                          {(activeTab === 'winnerAngle' || activeTab === 'flowCharacter') && (
                            <div>
                              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t("جنس المُعلّق الصوتي")}</label>
                              <select 
                                value={voiceGender}
                                onChange={(e) => setVoiceGender(e.target.value)}
                                className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] bg-white dark:bg-[#0a0510] outline-none transition-colors shadow-sm"
                              >
                                <option value="auto">{t("تلقائي (حسب الاسكريبت)")}</option>
                                <option value="male">{t("ذكر")}</option>
                                <option value="female">{t("أنثى")}</option>
                                <option value="clone">{t("استنساخ صوت (ملف)")}</option>
                              </select>
                            </div>
                          )}
                          
                          {activeTab === 'creativePrompts' && (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                                  <LayoutTemplate className="w-4 h-4" />
                                  {t("نمط التصاميم")}</label>
                                <select 
                                  value={creativePromptMode}
                                  onChange={(e) => setCreativePromptMode(e.target.value as 'standalone' | 'carousel' | 'landing_page')}
                                  className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] outline-none transition-colors shadow-sm"
                                >
                                  <option value="standalone">{t("أفكار متنوعة منفصلة")}</option>
                                  <option value="carousel">{t("كاروسيل متصل (سلايدر)")}</option>
                                  <option value="landing_page">{t("صفحة هبوط متتابعة (Landing Page)")}</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                                  <Palette className="w-4 h-4" />
                                  {t("بيئة الألوان الخاصة (اختياري)")}</label>
                                <select
                                  value={creativeColorTheme}
                                  onChange={(e) => setCreativeColorTheme(e.target.value)}
                                  className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] outline-none transition-colors shadow-sm text-sm"
                                >
                                  <option value="">{t("بدون تحديد (تلقائي بناءً على المنتج)")}</option>
                                  <option value="فاتحة ومشرقة (Light & Bright)">{t("فاتحة ومشرقة")}</option>
                                  <option value="غامقة وفاخرة (Dark & Luxury)">{t("غامقة وفاخرة")}</option>
                                  <option value="تكنولوجية مضيئة ومتوهجة (Neon & Cyberpunk)">{t("تكنولوجية مضيئة ومتوهجة (Neon)")}</option>
                                  <option value="هادئة وبسيطة (Minimalist & Calm)">{t("هادئة وبسيطة (Minimalist)")}</option>
                                  <option value="ألوان سينمائية قوية (Cinematic & Dramatic)">{t("ألوان سينمائية قوية")}</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {activeTab === 'creativePrompts' && creativePromptMode === 'landing_page' && (
                          <div className="mt-2 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                              <LayoutTemplate className="w-4 h-4" />
                              {t("أقسام صفحة الهبوط المطلوبة في التصاميم")}</label>
                            
                            <div className="flex flex-wrap gap-2">
                              {['الهيدر', 'مميزات المنتج', 'مواصفات المنتج', 'التقييمات', 'مقارنة مع المنافسين', 'الأسئلة الشائعة', 'طريقة الاستخدام', 'الضمان', 'دعوة لاتخاذ إجراء (CTA)'].map(section => (
                                <button
                                  key={section}
                                  onClick={() => {
                                    if (landingPageSections.includes(section)) {
                                      setLandingPageSections(landingPageSections.filter(s => s !== section));
                                    } else {
                                      setLandingPageSections([...landingPageSections, section]);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                                    landingPageSections.includes(section)
                                      ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-[#F0B21B] border-fuchsia-300 dark:border-fuchsia-700'
                                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                                  }`}
                                >
                                  {t(section)}
                                </button>
                              ))}
                            </div>
                            {landingPageSections.length === 0 && (
                               <p className="text-xs text-red-500 mt-2">{t("يرجى اختيار قسم واحد على الأقل.")}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                      {activeTab === 'textOnVisual' && (
                        <>
                        <div className="py-6 flex flex-col lg:flex-row gap-6 border-t border-zinc-100 dark:border-zinc-800">
                          <div className="w-full lg:w-1/3">
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              <TypeIcon className="w-4 h-4" />
                              {t("نوع النصوص")}
                            </label>
                            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                              {t("اختر نوع النصوص التي تريد وضعها على الفيديو")}
                            </p>
                          </div>
                          <div className="flex-1">
                            <select 
                              value={textOnVisualMode}
                              onChange={(e) => setTextOnVisualMode(e.target.value as 'sequential' | 'high_ctr_fixed')}
                              className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] bg-white dark:bg-[#0a0510] outline-none transition-colors shadow-sm"
                            >
                              <option value="sequential">{t("جمل متتالية (تحكي قصة)")}</option>
                              <option value="high_ctr_fixed">{t("10 جمل ثابتة (لزيادة المبيعات والـ CTR)")}</option>
                            </select>
                          </div>
                        </div>

                        {textOnVisualMode === 'sequential' && (
                        <div className="py-6 flex flex-col lg:flex-row gap-6 border-t border-zinc-100 dark:border-zinc-800">
                          <div className="w-full lg:w-1/3">
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              <TypeIcon className="w-4 h-4" />
                              {t("عدد الجمل")}
                            </label>
                            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                              {t("اختر عدد الجمل النصية التي تريد توليدها من 1 إلى 10 جمل")}
                            </p>
                          </div>
                          <div className="flex-1">
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={textOnVisualCount}
                              onChange={(e) => setTextOnVisualCount(parseInt(e.target.value))}
                              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-600 dark:accent-fuchsia-500 mb-3"
                              dir="ltr"
                            />
                            <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400" dir="ltr">
                               <span>1 {t("جملة")}</span>
                               <span className="text-zinc-900 dark:text-zinc-100 text-base bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-md">{textOnVisualCount}</span>
                               <span>10 {t("جمل")}</span>
                            </div>
                          </div>
                        </div>
                        )}
                        </>
                      )}

                      {activeTab === 'videoScenes' && (
                        <div className="py-6 flex flex-col lg:flex-row gap-6">
                          <div className="w-full lg:w-1/3">
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              <Wand2 className="w-4 h-4" />
                              {t("نوع المشاهد")}
                            </label>
                          </div>
                          <div className="flex-1">
                            <select 
                              value={videoGenerationMode}
                              onChange={(e) => setVideoGenerationMode(e.target.value as 'consecutive' | 'hooks' | 'frames' | 'single_15s' | 'consecutive_15s')}
                              className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] bg-white dark:bg-[#0a0510] outline-none transition-colors shadow-sm"
                            >
                              <option value="consecutive">{t("مشاهد متتالية (تقسيم تلقائي حسب المدة)")}</option>
                              <option value="single_15s">{t("مشهد واحد كامل على بعضه (15 ثانية)")}</option>
                              <option value="consecutive_15s">{t("مشاهد متتالية (كل مشهد 15 ثانية)")}</option>
                              <option value="hooks">{t("5 هوكات مختلفة (بدايات فقط)")}</option>
                              <option value="frames">{t("صور كإطارات (Frames) كاملة لـ Veo")}</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {(activeTab === 'landing' || activeTab === 'ads' || activeTab === 'creativePrompts') && (
                        <div className="py-6 flex flex-col lg:flex-row gap-6">
                          <div className="w-full lg:w-1/3">
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              <TypeIcon className="w-4 h-4" />
                              {t("الخط")}
                            </label>
                          </div>
                          <div className="flex-1">
                            <select 
                              value={fontFamily}
                              onChange={(e) => setFontFamily(e.target.value)}
                              className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] bg-white dark:bg-[#0a0510] outline-none transition-colors shadow-sm"
                            >
                              <option value="font-alexandria">{t("Alexandria (خط الهوية الرسمي - فخم وعصري)")}</option>
                              <option value="font-cairo">{t("Cairo (عصري وجريء)")}</option>
                              <option value="font-tajawal">{t("Tajawal (أنيق ورسمي)")}</option>
                              <option value="font-almarai">{t("Almarai (واضح ومقروء)")}</option>
                              <option value="font-readex">{t("Readex Pro (تقني وحديث)")}</option>
                              <option value="font-ibm">{t("IBM Plex (احترافي)")}</option>
                              <option value="font-ge">{t("GE SS Two (مميز وجذاب)")}</option>
                              <option value="font-din">{t("DIN Next Arabic (شائع وأنيق)")}</option>
                            </select>
                          </div>
                        </div>
                      )}

                    {(activeTab === 'landing' || activeTab === 'ads') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t("لون الهوية (العناصر المميزة)")}</label>
                          <div className="flex gap-3">
                            {[
                              { value: 'text-yellow-400', bg: 'bg-yellow-400' },
                              { value: 'text-[#F0B21B]', bg: 'bg-fuchsia-400' },
                              { value: 'text-emerald-400', bg: 'bg-emerald-400' },
                              { value: 'text-rose-400', bg: 'bg-rose-400' },
                              { value: 'text-cyan-400', bg: 'bg-cyan-400' },
                            ].map((color) => (
                              <button
                                key={color.value}
                                onClick={() => setThemeColor(color.value)}
                                className={`w-10 h-10 rounded-full ${color.bg} border-2 transition-all ${themeColor === color.value ? 'border-zinc-900 dark:border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                aria-label={`Select color ${color.value}`}
                              />
                            ))}
                            <div className="relative flex items-center">
                              <input 
                                type="color" 
                                value={customHex}
                                onChange={(e) => {
                                  setCustomHex(e.target.value);
                                  setThemeColor('text-[var(--theme-color)]');
                                }}
                                className="w-10 h-10 rounded-full cursor-pointer opacity-0 absolute inset-0 z-10"
                                title={t("اختر لون مخصص")}
                              />
                              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${themeColor === 'text-[var(--theme-color)]' ? 'border-zinc-900 dark:border-white scale-110 shadow-md' : 'border-dashed border-zinc-400 dark:border-zinc-600 hover:scale-105'}`}
                                   style={{ backgroundColor: customHex }}>
                                {themeColor !== 'text-[var(--theme-color)]' && <span className="text-xl leading-none text-zinc-400 dark:text-zinc-500">+</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t("تصميم صفحة الهبوط والإعلانات")}</label>
                          <div className="grid grid-cols-1 gap-3">
                            <button
                              onClick={() => setPendingDesignStyle('tech')}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-right transition-all ${designStyle === 'tech' ? 'border-fuchsia-600 bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-700'}`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${designStyle === 'tech' ? 'bg-[#F0B21B] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                                <LayoutTemplate className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-medium text-zinc-900 dark:text-white">{t("تكنولوجي حديث (Tech)")}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{t("خلفيات داكنة، إضاءات نيون، عناصر عائمة (مناسب للإلكترونيات)")}</div>
                              </div>
                            </button>
                            <button
                              onClick={() => setPendingDesignStyle('lifestyle')}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-right transition-all ${designStyle === 'lifestyle' ? 'border-fuchsia-600 bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-700'}`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${designStyle === 'lifestyle' ? 'bg-[#F0B21B] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                                <LayoutTemplate className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-medium text-zinc-900 dark:text-white">{t("أسلوب حياة (Lifestyle)")}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{t("تصميم نظيف، نصوص واضحة، التركيز على الاستخدام اليومي")}</div>
                              </div>
                            </button>
                            <button
                              onClick={() => setPendingDesignStyle('direct')}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-right transition-all ${designStyle === 'direct' ? 'border-fuchsia-600 bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-700'}`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${designStyle === 'direct' ? 'bg-[#F0B21B] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                                <LayoutTemplate className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-medium text-zinc-900 dark:text-white">{t("بيع مباشر (Direct Response)")}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{t("مقارنات واضحة، خطوات استخدام، تركيز على التقييمات والضمان")}</div>
                              </div>
                            </button>
                            <button
                              onClick={() => setPendingDesignStyle('minimal')}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-right transition-all ${designStyle === 'minimal' ? 'border-fuchsia-600 bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-700'}`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${designStyle === 'minimal' ? 'bg-[#F0B21B] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                                <LayoutTemplate className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-medium text-zinc-900 dark:text-white">{t("أنيق وبسيط (Minimal & Elegant)")}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{t("خلفيات فاتحة، مساحات بيضاء، تصميم هادئ واحترافي")}</div>
                              </div>
                            </button>
                            <button
                              onClick={() => setPendingDesignStyle('elegant')}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-right transition-all ${designStyle === 'elegant' ? 'border-fuchsia-600 bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-700'}`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${designStyle === 'elegant' ? 'bg-[#F0B21B] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                                <LayoutTemplate className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-medium text-zinc-900 dark:text-white">{t("فخم وراقي (Luxury & Elegant)")}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{t("ألوان دافئة، خطوط رفيعة، تصميم يعكس الجودة العالية")}</div>
                              </div>
                            </button>
                            <button
                              onClick={() => setPendingDesignStyle('bold')}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-right transition-all ${designStyle === 'bold' ? 'border-fuchsia-600 bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-700'}`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${designStyle === 'bold' ? 'bg-[#F0B21B] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                                <LayoutTemplate className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-medium text-zinc-900 dark:text-white">{t("قوي وجريء (Bold & Dynamic)")}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{t("تباين عالي، ألوان صارخة، تصميم يخطف الأنظار")}</div>
                              </div>
                            </button>
                            <button
                              onClick={() => setPendingDesignStyle('premium_custom')}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-right transition-all ${designStyle === 'premium_custom' ? 'border-fuchsia-600 bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-700'}`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${designStyle === 'premium_custom' ? 'bg-[#F0B21B] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                                <LayoutTemplate className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-medium text-zinc-900 dark:text-white">{t("بريميوم مخصص (Premium Custom)")}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{t("تصميم احترافي مخصص حسب المنتج، خالي من العناصر النسائية، مع تركيز على الألوان والمجال")}</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                              <TypeIcon className="w-4 h-4" />
                              {t("لون النص الأساسي")}</label>
                            <select 
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] bg-white dark:bg-[#0a0510] outline-none transition-colors"
                            >
                              <option value="text-white">{t("أبيض")}</option>
                              <option value="text-black">{t("أسود")}</option>
                              <option value="text-slate-900">{t("رمادي داكن")}</option>
                              <option value="theme">{t("لون الهوية")}</option>
                              <optgroup label={t("تدرجات لونية (ميكسات)")}>
                                <option value="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">{t("بنفسجي - وردي")}</option>
                                <option value="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">{t("سماوي - أزرق")}</option>
                                <option value="bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">{t("أصفر - برتقالي")}</option>
                                <option value="bg-gradient-to-r from-emerald-400 to-teal-500 text-transparent bg-clip-text">{t("أخضر - فيروزي")}</option>
                                <option value="bg-gradient-to-r from-rose-400 to-fuchsia-500 text-transparent bg-clip-text">{t("وردي - أحمر")}</option>
                                <option value="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">{t("نيلي - بنفسجي")}</option>
                              </optgroup>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                              <TypeIcon className="w-4 h-4" />
                              {t("تأثير النص")}</label>
                            <select 
                              value={textEffect}
                              onChange={(e) => setTextEffect(e.target.value)}
                              className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] bg-white dark:bg-[#0a0510] outline-none transition-colors"
                            >
                              <option value="none">{t("بدون تأثير")}</option>
                              <option value="drop-shadow-md">{t("ظل خفيف")}</option>
                              <option value="drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">{t("ظل قوي")}</option>
                              <option value="text-outline-black">{t("إطار أسود رفيع (Outline)")}</option>
                              <option value="text-outline-white">{t("إطار أبيض رفيع (Outline)")}</option>
                              <option value="text-outline-black-thick">{t("إطار أسود سميك")}</option>
                              <option value="text-outline-white-thick">{t("إطار أبيض سميك")}</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                              <LayoutTemplate className="w-4 h-4" />
                              {t("خلفية النصوص (البلوكات)")}</label>
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                              <button
                                onClick={() => setShowTextBackground(true)}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${showTextBackground ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
                              >
                                {t("داخل بلوكات (كما هو)")}</button>
                              <button
                                onClick={() => setShowTextBackground(false)}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${!showTextBackground ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
                              >
                                {t("بدون خلفية (نص حر)")}</button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {(activeTab === 'script' || activeTab === 'winnerAngle' || activeTab === 'videoScenes') && (
                      <>
                        {scriptGenMode !== 'custom' && (
                        <div className="py-6 flex flex-col lg:flex-row gap-6">
                          <div className="w-full lg:w-1/3">
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F0B21B]"></span>
                              {t("مدة الفيديو")}
                            </label>
                          </div>
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['15s', '30s', '45s', '60s'].map((duration) => (
                              <button
                                key={duration}
                                onClick={() => setScriptDuration(duration)}
                                className={`py-3 rounded-xl border-2 text-center transition-all font-medium ${scriptDuration === duration ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900 text-fuchsia-700 dark:bg-[#F0B21B]/10 dark:text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.15)]' : 'border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-700 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                              >
                                {duration.replace('s', ' ثانية')}
                              </button>
                            ))}
                          </div>
                        </div>
                        )}
                        {activeTab === 'script' && (
                          <>
                        <div>
                          <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{t("طريقة توليد السكريبت")}</label>
                          <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl mb-6">
                                                        <button
                              onClick={() => setScriptGenMode('manual')}
                              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${scriptGenMode === 'manual' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                            >
                              {t("اختيار الزوايا يدوياً")}
                            </button>
                            <button
                              onClick={() => setScriptGenMode('auto')}
                              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${scriptGenMode === 'auto' ? 'bg-gradient-to-r from-black to-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                            >
                              <Sparkles className="w-4 h-4" />
                              {t("أتمتة")}
                            </button>
                            <button
                              onClick={() => setScriptGenMode('custom')}
                              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${scriptGenMode === 'custom' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                            >
                              ✍️ {t("كتابة مخصص")}
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="mb-6">
                            <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2 flex items-center gap-2">
                              <Mic className="w-4 h-4 text-[#F0B21B]" />
                              {t("وضع التوليد (إسكريبت وفويس أوفر)")}
                            </label>
                            <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                              <button
                                type="button"
                                onClick={() => setAutoGenerateVoiceover(false)}
                                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${!autoGenerateVoiceover ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-600' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                              >
                                📄 {t("إسكريبت فقط")}
                              </button>
                              <button
                                type="button"
                                onClick={() => setAutoGenerateVoiceover(true)}
                                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${autoGenerateVoiceover ? 'bg-gradient-to-r from-black to-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                              >
                                🎙️ {t("إسكريبت + فويس أوفر تلقائي")}
                              </button>
                            </div>
                          </div>

                          {scriptGenMode !== 'custom' && (
                            <>
                              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t("عدد السكريبتات")}</label>
                              <div className="grid grid-cols-4 gap-2">
                                {[3, 5, 7, 10].map((count) => (
                                  <button
                                    key={count}
                                    onClick={() => handleScriptCountChange(count)}
                                    className={`py-2 rounded-xl border-2 text-center transition-all font-medium ${scriptCount === count ? 'border-[#F0B21B] bg-amber-50 dark:bg-zinc-900 text-fuchsia-700 dark:bg-[#F0B21B]/10 dark:text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.15)]' : 'border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-700 text-zinc-600 dark:text-zinc-400'}`}
                                  >
                                    {count}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {scriptGenMode === 'manual' ? (
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t("أنواع السكريبتات (اختر")}{scriptCount})</label>
                            <div className="space-y-3">
                              {Array.from({ length: scriptCount }).map((_, index) => (
                                <div key={index} className="flex gap-2">
                                  <select 
                                    value={selectedScriptTypes[index] || scriptTypes[0]}
                                    onChange={(e) => {
                                      const newTypes = [...selectedScriptTypes];
                                      newTypes[index] = e.target.value;
                                      setSelectedScriptTypes(newTypes);
                                    }}
                                    className="flex-1 p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] bg-white dark:bg-[#0a0510] outline-none transition-colors"
                                  >
                                    {scriptTypes.map((type) => (
                                      <option key={type} value={type}>{t(type)}</option>
                                    ))}
                                  </select>
                                  <CustomVoiceSelect
                                    value={selectedScriptGenders[index] || 'auto'}
                                    onChange={(val) => {
                                      const newGenders = [...selectedScriptGenders];
                                      newGenders[index] = val;
                                      setSelectedScriptGenders(newGenders);
                                    }}
                                    className="w-48"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : scriptGenMode === 'auto' ? (
                          <div className="bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/30 p-5 rounded-xl text-sm leading-relaxed mt-4">
                            <p className="text-zinc-800 dark:text-zinc-200 font-medium mb-2">{t("أتمتة كاملة بصلاحيات ماركتير محترف (20 سنة خبرة)")}</p>
                            <p className="text-zinc-600 dark:text-zinc-400">{t("سيقوم الذكاء الاصطناعي بتجاهل القوالب التقليدية وتوليد")} {scriptCount} {t("إسكريبتات زوايا إعلانية مبتكرة وقوية جداً بناءً على منتجك لتحقيق أعلى تحويل.")}</p>
                          </div>
                        ) : (
                          <div className="mt-4 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800">
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t("النص المخصص")}</label>
                            <textarea
                              value={customScriptText}
                              onChange={(e) => setCustomScriptText(e.target.value)}
                              placeholder={t("اكتب الإسكريبت هنا لتوليد التعليق الصوتي...")}
                              className="w-full h-32 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#F0B21B] outline-none mb-4"
                            />
                            
                            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t("تعليمات الأداء الصوتي (Style Instructions)")}</label>
                            <textarea
                              value={customScriptStyle}
                              onChange={(e) => setCustomScriptStyle(e.target.value)}
                              placeholder={t("مثال: تحدث بحماس وسرعة، أو تحدث بهدوء وبطء كأنك تروي قصة...")}
                              className="w-full h-16 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-[#F0B21B] outline-none mb-4"
                            />

                            <div className="mt-2">
                              <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t("الصوت")}</label>
                              <div className="flex gap-2">
                                <CustomVoiceSelect
                                  value={customScriptVoice}
                                  onChange={(val) => setCustomScriptVoice(val)}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        </>
                      )}

                      {((activeTab === 'script' && selectedScriptGenders.includes('clone')) || (activeTab === 'winnerAngle' && voiceGender === 'clone')) && (
                        <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                          <label className="block text-sm font-semibold text-fuchsia-800 dark:text-fuchsia-300 mb-3 flex items-center gap-2">
                            <Mic className="w-4 h-4" />
                            {t("ملف الصوت المرجعي (Voice Clone)")}
                          </label>
                          
                          {voiceCloneFile ? (
                            <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-3 rounded-xl border border-amber-200 dark:border-zinc-800 dark:border-fuchsia-800/50 shadow-sm">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/50 flex items-center justify-center shrink-0">
                                  <Mic className="w-5 h-5 text-[#F0B21B] dark:text-[#F0B21B]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{voiceCloneFile.filename || 'تم رفع ملف'}</p>
                                  <p className="text-xs text-[#F0B21B] dark:text-[#F0B21B]">{t("جاهز للاستنساخ")}</p>
                                </div>
                              </div>
                              <button 
                                onClick={removeVoiceClone}
                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title={t("إزالة الملف")}
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-fuchsia-300 border-dashed rounded-xl cursor-pointer bg-amber-50 dark:bg-zinc-900/50 dark:bg-zinc-900 dark:hover:bg-zinc-800 hover:bg-amber-50 dark:bg-zinc-900 dark:border-fuchsia-800/50 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-[#F0B21B]" />
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                                  {t("اضغط لرفع ملف صوتي")} (.mp3, .wav)
                                </p>
                              </div>
                              <input type="file" accept="audio/*" className="hidden" onChange={handleVoiceCloneUpload} />
                            </label>
                          )}
                        </div>
                      )}
                      </>
                    )}

                    {activeTab === 'funnelCopy' && (
                      <div className="mt-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{t("طول المحتوى (Copy Length)")}</label>
                        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl mb-6">
                          <button
                            onClick={() => setFunnelCopyLength('auto')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                              funnelCopyLength === 'auto'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                          >
                            {t("تلقائي (الأفضل للمنتج)")}
                          </button>
                          <button
                            onClick={() => setFunnelCopyLength('short')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                              funnelCopyLength === 'short'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                          >
                            {t("قصير ومباشر (Short)")}
                          </button>
                          <button
                            onClick={() => setFunnelCopyLength('long')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                              funnelCopyLength === 'long'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                          >
                            {t("طويل ومفصل (Long)")}
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'fbAds' && (
                      <div className="mt-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{t("هدف الحملة (Campaign Objective)")}</label>
                          <select
                            value={fbCampaignObjective}
                            onChange={(e) => setFbCampaignObjective(e.target.value)}
                            className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] outline-none transition-colors shadow-sm"
                          >
                            <option value="زيادة المبيعات (Sales)">{t("زيادة المبيعات (Sales)")}</option>
                            <option value="الوعي بالعلامة التجارية (Brand Awareness)">{t("الوعي بالعلامة التجارية (Brand Awareness)")}</option>
                            <option value="تحويلات الموقع (Website Conversions)">{t("تحويلات الموقع (Website Conversions)")}</option>
                            <option value="تفاعل مع المنشور (Post Engagement)">{t("تفاعل مع المنشور (Post Engagement)")}</option>
                            <option value="تجميع بيانات العملاء (Lead Generation)">{t("تجميع بيانات العملاء (Lead Generation)")}</option>
                            <option value="إعادة الاستهداف (Retargeting)">{t("إعادة الاستهداف (Retargeting)")}</option>
                          </select>
                        </div>

                        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{t("طريقة توليد الإعلانات")}</label>
                        
                        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl mb-6">
                          <button
                            onClick={() => setAutoFbAngles(false)}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${!autoFbAngles ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                          >
                            {t("اختيار الزوايا يدوياً")}
                          </button>
                          <button
                            onClick={() => setAutoFbAngles(true)}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${autoFbAngles ? 'bg-gradient-to-r from-black to-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                          >
                            <Sparkles className="w-4 h-4" />
                            {t("أتمتة الزوايا بالذكاء الاصطناعي")}
                          </button>
                        </div>

                        {!autoFbAngles ? (
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t("أنواع إعلانات الفيسبوك (اختر 5 انواع)")}</label>
                            {Array.from({ length: 5 }).map((_, index) => (
                              <div key={index} className="flex gap-2">
                                <select 
                                  value={selectedFbAdTypes[index] || fbAdTypesList[0]}
                                  onChange={(e) => {
                                    const newTypes = [...selectedFbAdTypes];
                                    newTypes[index] = e.target.value;
                                    setSelectedFbAdTypes(newTypes);
                                  }}
                                  className="flex-1 p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] outline-none transition-colors shadow-sm"
                                >
                                  {fbAdTypesList.map((type) => (
                                    <option key={type} value={type}>{t(type)}</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/30 p-5 rounded-xl text-sm leading-relaxed">
                            <p className="text-zinc-800 dark:text-zinc-200 font-medium mb-2">{t("أتمتة كاملة بصلاحيات ماركتير محترف (20 سنة خبرة)")}</p>
                            <p className="text-zinc-600 dark:text-zinc-400">{t("سيقوم الذكاء الاصطناعي بتجاهل القوالب التقليدية المملة واستخراج 5 زوايا إعلانية مبتكرة وقوية جداً بناءً على منتجك لتحقيق أعلى تحويل (Conversion).")}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                
                {activeTab === 'landing' && (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-zinc-900/50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-900/30 rounded-xl">
                    <input 
                      type="checkbox" 
                      id="ai-bg-toggle"
                      checked={useAIGeneratedBackgrounds}
                      onChange={(e) => setUseAIGeneratedBackgrounds(e.target.checked)}
                      className="w-5 h-5 text-[#F0B21B] rounded border-zinc-300 dark:border-zinc-600 focus:ring-[#F0B21B] dark:bg-zinc-800"
                    />
                    <label htmlFor="ai-bg-toggle" className="text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <span className="font-medium block text-fuchsia-900 dark:text-[#F0B21B]">{t("توليد خلفيات بالذكاء الاصطناعي (ميزة متقدمة)")}</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("يضع المنتج في بيئات مختلفة. قد يستغرق وقتاً أطول ويتطلب باقة مدفوعة لتجنب حدود الاستخدام.")}</span>
                    </label>
                  </div>
                )}

                {activeTab === 'creativePrompts' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t("عدد الأوامر/التصاميم")}</label>
                    <select
                      value={creativePromptsCount}
                      onChange={(e) => setCreativePromptsCount(parseInt(e.target.value))}
                      className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] outline-none transition-colors"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(count => (
                        <option key={count} value={count}>{count}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t("نموذج الذكاء الاصطناعي")}</label>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <button
                      onClick={() => setAiModel('flash')}
                      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all ${aiModel === 'flash' ? 'bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600' : 'border border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'}`}
                    >
                      <div className={`font-medium ${aiModel === 'flash' ? 'text-[#F0B21B] dark:text-[#F0B21B]' : 'text-zinc-700 dark:text-zinc-300'}`}>{t("Gemini Flash (Last)")}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Gemini Flash</div>
                    </button>
                    <button
                      onClick={() => setAiModel('pro')}
                      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg transition-all ${aiModel === 'pro' ? 'bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600' : 'border border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'}`}
                    >
                      <div className={`font-medium ${aiModel === 'pro' ? 'text-[#F0B21B] dark:text-[#F0B21B]' : 'text-zinc-700 dark:text-zinc-300'}`}>{t("النموذج المتقدم (Pro)")}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Gemini Pro</div>
                    </button>
                  </div>
                </div>


              </div>

<div className={`mt-8 flex flex-col justify-center w-full max-w-xl mx-auto`}>
                {error && (
                  <div className="p-4 bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-950/40 text-fuchsia-800 dark:text-fuchsia-300 rounded-xl flex flex-col gap-3 text-sm border border-amber-200 dark:border-zinc-800 dark:border-fuchsia-800/50 shadow-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0 text-[#F0B21B] dark:text-[#F0B21B] mt-0.5" />
                      <p className="font-semibold">{error}</p>
                    </div>
                    {(error.includes('GEMINI_API_KEY') || error.includes('مفتاح الذكاء الاصطناعي')) && (
                      <div className="pt-2 border-t border-amber-200 dark:border-zinc-800/60 dark:border-fuchsia-800/40 flex flex-col sm:flex-row gap-2">
                        <input
                          type="password"
                          placeholder="الصق مفتاح Gemini API هنا (يبدأ بـ AIzaSy...)"
                          id="inline-api-key-input"
                          className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#09090b]"
                        />
                        <button
                          onClick={() => {
                            const val = (document.getElementById('inline-api-key-input') as HTMLInputElement)?.value;
                            if (val && val.trim()) {
                              localStorage.setItem('gemini_api_key', val.trim());
                              setError(null);
                              alert('تم حفظ مفتاح API بنجاح! يمكنك الآن النقر على التوليد مجدداً.');
                            }
                          }}
                          className="px-4 py-2 bg-[#F0B21B] hover:bg-[#DF9F10] text-[#09090b] rounded-lg font-bold text-xs shrink-0 transition-colors shadow-sm cursor-pointer"
                        >
                          حفظ وتفعيل المفتاح ⚡
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'productBrain' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => productBrainRef.current?.handleGenerate()}
                      disabled={isGeneratingProductBrain || !productName || !description}
                      className="flex-1 py-4 px-6 bg-gradient-to-r from-[#09090b] to-purple-700 hover:from-[#18181b] hover:to-purple-600 shadow-xl shadow-purple-500/30 border-0 disabled:opacity-50 text-white rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                    >
                      {isGeneratingProductBrain ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          {t("جاري التفكير ووضع الاستراتيجية...")}</>
                      ) : (
                        <>
                          <Brain className="w-6 h-6" />
                          {t('بناء التقرير الاستراتيجي الشامل')}
                        </>
                      )}
                    </button>
                    {isGeneratingProductBrain && (
                      <button
                        onClick={stopGeneration}
                        className="py-4 px-6 bg-fuchsia-100 dark:bg-fuchsia-900/30 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] rounded-2xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف")}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                ) : activeTab === 'landing' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerate}
                      disabled={isGenerating || images.length === 0 || !description}
                      className="flex-1 py-3 px-4 bg-[#09090b] hover:bg-[#18181b] shadow-sm disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("جاري الإنشاء...")}</>
                      ) : (
                        'إنشاء صفحة الهبوط (10 صور)'
                      )}
                    </button>
                    {isGenerating && (
                      <button
                        onClick={stopGeneration}
                        className="py-3 px-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] rounded-xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف الإنشاء")}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : activeTab === 'ads' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateAds}
                      disabled={isGeneratingAds || images.length === 0 || !description}
                      className="flex-1 py-3 px-4 bg-[#09090b] hover:bg-[#18181b] shadow-sm disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isGeneratingAds ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("جاري الإنشاء...")}</>
                      ) : (
                        'توليد الكريتيفز الإعلانية (10 صور)'
                      )}
                    </button>
                    {isGeneratingAds && (
                      <button
                        onClick={stopGeneration}
                        className="py-3 px-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] rounded-xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف الإنشاء")}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : activeTab === 'script' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateScript}
                      disabled={isGeneratingScript || (scriptGenMode !== 'custom' && !description) || (scriptGenMode === 'custom' && !customScriptText.trim())}
                      className="flex-1 py-3 px-4 bg-[#09090b] hover:bg-[#18181b] shadow-sm disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isGeneratingScript ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("جاري كتابة السكريبت...")}</>
                      ) : (
                        autoGenerateVoiceover ? t('توليد الإسكريبت والفويس أوفر تلقائياً 🎙️') : t('توليد السكريبت 📄')
                      )}
                    </button>
                    {isGeneratingScript && (
                      <button
                        onClick={stopGeneration}
                        className="py-3 px-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] rounded-xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف الإنشاء")}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : activeTab === 'fbAds' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateFbAds}
                      disabled={isGeneratingFbAds || !description}
                      className="flex-1 py-3 px-4 bg-[#09090b] hover:bg-[#18181b] shadow-sm disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isGeneratingFbAds ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("جاري كتابة الإعلانات...")}</>
                      ) : (
                        'توليد إعلانات فيسبوك (5 نسخ)'
                      )}
                    </button>
                    {isGeneratingFbAds && (
                      <button
                        onClick={stopGeneration}
                        className="py-3 px-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] rounded-xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف الإنشاء")}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : activeTab === 'funnelCopy' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateFunnelCopy}
                      disabled={isGeneratingFunnelCopy || !description}
                      className="flex-1 py-3 px-4 bg-[#09090b] hover:bg-[#18181b] shadow-sm disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isGeneratingFunnelCopy ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("جاري كتابة الاستراكشر...")}</>
                      ) : (
                        'توليد استراكشر لاند بيدج'
                      )}
                    </button>
                    {isGeneratingFunnelCopy && (
                      <button
                        onClick={stopGeneration}
                        className="py-3 px-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] rounded-xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف الإنشاء")}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : activeTab === 'videoScenes' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateVideoScenes}
                      disabled={isGeneratingVideoScenes || !description}
                      className="flex-1 py-3 px-4 bg-[#09090b] hover:bg-[#18181b] shadow-sm disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isGeneratingVideoScenes ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("جاري توليد المشاهد...")}</>
                      ) : (
                        'توليد مشاهد وأوامر فيديو (Veo)'
                      )}
                    </button>
                    {isGeneratingVideoScenes && (
                      <button
                        onClick={stopGeneration}
                        className="py-3 px-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] rounded-xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف الإنشاء")}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : activeTab === 'winnerAngle' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateWinnerScripts}
                      disabled={isGeneratingWinnerScripts || !extractedWinnerScript}
                      className="flex-1 py-3 px-4 bg-[#09090b] hover:bg-[#18181b] shadow-sm disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isGeneratingWinnerScripts ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("جاري التوليد...")}</>
                      ) : (
                        'إعادة توليد الانجل الوينر'
                      )}
                    </button>
                    {isGeneratingWinnerScripts && (
                      <button
                        onClick={stopGeneration}
                        className="py-3 px-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] rounded-xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف الإنشاء")}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : activeTab === 'creativePrompts' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateCreativePrompts}
                      disabled={isGeneratingCreativePrompts || !description || (creativePromptMode === 'landing_page' && landingPageSections.length === 0)}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black shadow-lg shadow-amber-500/20/25 border-0 disabled:bg-fuchsia-400/50 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isGeneratingCreativePrompts ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("جاري التوليد...")}</>
                      ) : (
                        `توليد مشاهد للإعلان (${creativePromptsCount} تصاميم)`
                      )}
                    </button>
                    {isGeneratingCreativePrompts && (
                      <button
                        onClick={stopGeneration}
                        className="py-3 px-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] rounded-xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف الإنشاء")}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : activeTab === 'smartAngles' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateSmartAngles}
                      disabled={isGeneratingSmartAngles || !description}
                      className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-xl shadow-emerald-500/30 border-0 disabled:opacity-50 text-white rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                    >
                      {isGeneratingSmartAngles ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          {t("جاري التفكير والتوليد...")}</>
                      ) : (
                        <>
                          <Target className="w-6 h-6" />
                          {t('توليد 10 زوايا إعلانية ذكية للجمهور')}
                        </>
                      )}
                    </button>
                    {isGeneratingSmartAngles && (
                      <button
                        onClick={stopGeneration}
                        className="py-4 px-6 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف")}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                ) : activeTab === 'flowCharacter' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateFlowCharacter}
                      disabled={isGeneratingFlowCharacter || !description}
                      className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-xl shadow-blue-500/30 border-0 disabled:opacity-50 text-white rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                    >
                      {isGeneratingFlowCharacter ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          {t("جاري بناء الشخصية وتوليد الأوامر...")}</>
                      ) : (
                        <>
                          <UserIcon className="w-6 h-6" />
                          {t('توليد وتأسيس شخصية Flow')}
                        </>
                      )}
                    </button>
                    {isGeneratingFlowCharacter && (
                      <button
                        onClick={stopGeneration}
                        className="py-4 px-6 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف الإنشاء")}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                ) : activeTab === 'textOnVisual' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateTextOnVisual}
                      disabled={isGeneratingTextOnVisual || !description}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black shadow-lg shadow-amber-500/20/25 border-0 disabled:bg-fuchsia-400/50 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isGeneratingTextOnVisual ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("جاري التوليد...")}</>
                      ) : (
                        `توليد نصوص على الشاشة (${textOnVisualMode === 'high_ctr_fixed' ? 10 : textOnVisualCount} جمل)`
                      )}
                    </button>
                    {isGeneratingTextOnVisual && (
                      <button
                        onClick={stopGeneration}
                        className="py-3 px-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] rounded-xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف الإنشاء")}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : activeTab === 'photoshoot' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGeneratePhotoshoot}
                      disabled={isGeneratingPhotoshoot || images.length === 0 || !description}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black shadow-lg shadow-amber-500/20/25 border-0 disabled:bg-fuchsia-400 dark:disabled:bg-fuchsia-900/50 dark:disabled:text-fuchsia-200 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isGeneratingPhotoshoot ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t("جاري التصوير...")}</>
                      ) : (
                        t('توليد مشاهد للمنتج (8 صور)')
                      )}
                    </button>
                    {isGeneratingPhotoshoot && (
                      <button
                        onClick={stopGeneration}
                        className="py-3 px-4 bg-fuchsia-100 dark:bg-fuchsia-900/30 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] rounded-xl font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title={t("إيقاف الإنشاء")}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : null}
  </div>

              {isGenerating && (
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">{t("حالة تقدم صفحة الهبوط")}</h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-zinc-600 dark:text-zinc-400">{progress.step}</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5">
                  <div 
                    className="bg-[#F0B21B] h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {isGeneratingAds && (
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">{t("حالة تقدم الإعلانات")}</h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-zinc-600 dark:text-zinc-400">{adsProgress.step}</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{adsProgress.current} / {adsProgress.total}</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5">
                  <div 
                    className="bg-[#F0B21B] h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(adsProgress.current / Math.max(adsProgress.total, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {isGeneratingPhotoshoot && (
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">{t("حالة تقدم جلسة التصوير")}</h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-zinc-600 dark:text-zinc-400">{photoshootProgress.step}</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{photoshootProgress.current} / {photoshootProgress.total}</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5">
                  <div 
                    className="bg-[#F0B21B] h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(photoshootProgress.current / Math.max(photoshootProgress.total, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          { (isGenerating || isGeneratingAds || isGeneratingScript || isGeneratingFbAds || isGeneratingFunnelCopy || isGeneratingVideoScenes || isGeneratingWinnerScripts || isGeneratingCreativePrompts || isGeneratingTextOnVisual || isGeneratingPhotoshoot || isGeneratingSmartAngles || isGeneratingFlowCharacter || generatedImages.length > 0 || generatedAds.length > 0 || generatedScripts !== null || generatedFbAds !== null || generatedFunnelCopy !== null || generatedVideoScenes.length > 0 || extractedWinnerScript || generatedCreativePrompts.length > 0 || generatedTextOnVisual.length > 0 || photoshootImages.length > 0 || generatedSmartAngles.length > 0 || generatedFlowCharacter !== null) && (
<div className="flex-1 w-full min-w-0" id="outputs">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                 <div className="w-10 h-10 bg-[#09090b]/10 text-[#09090b] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 pointer-events-none" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-zinc-900 dark:text-white pointer-events-none">{t("النتائج والمخرجات")}</h2>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400 pointer-events-none">{t("قم بمعاينة وتعديل أو تحميل النتائج")}</p>
                 </div>
              </div>
              {activeTab === 'landing' ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("الصور الناتجة (صفحة الهبوط)")}</h2>
                    {generatedImages.length > 0 && (
                      <button 
                        onClick={handleDownloadAll}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        {t("تحميل الكل")}</button>
                    )}
                  </div>

                  {generatedImages.length === 0 && !isGenerating ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                      <p>{t("الصور ستظهر هنا بعد الإنشاء")}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {generatedImages.map((img, idx) => (
                        <div key={idx} className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm">
                          <img src={img.url} alt={`Section ${idx + 1}`} className="w-full h-auto object-cover aspect-square" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            <span className="text-white font-medium px-4 text-center">{img.section}</span>
                            <a 
                              href={img.url} 
                              download={`landing-page-${idx + 1}.jpg`}
                              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-colors"
                            >
                              <Download className="w-5 h-5" />
                            </a>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md">
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                      {isGenerating && progress.current < progress.total && (
                        <div className="rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center aspect-square text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50">
                          <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#F0B21B]" />
                          <span className="text-sm text-center px-2">{t("جاري تصميم الصورة")}{progress.current > sections.length ? progress.current - sections.length + 1 : 1}...</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : activeTab === 'ads' ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("الكريتيفز الإعلانية (AI)")}</h2>
                    {generatedAds.length > 0 && (
                      <button 
                        onClick={handleDownloadAllAds}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        {t("تحميل الكل")}</button>
                    )}
                  </div>

                  {generatedAds.length === 0 && !isGeneratingAds ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                      <p>{t("الكريتيفز الإعلانية ستظهر هنا بعد الإنشاء")}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {generatedAds.map((img, idx) => (
                        <div key={idx} className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm">
                          <img src={img.url} alt={`Ad ${idx + 1}`} className="w-full h-auto object-cover aspect-square" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            <span className="text-white font-medium px-4 text-center">{img.section}</span>
                            <a 
                              href={img.url} 
                              download={`ad-creative-${idx + 1}.jpg`}
                              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-colors"
                            >
                              <Download className="w-5 h-5" />
                            </a>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md">
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                      {isGeneratingAds && adsProgress.current < adsProgress.total && (
                        <div className="rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center aspect-square text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50">
                          <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#F0B21B]" />
                          <span className="text-sm text-center px-2">{t("جاري تصميم الإعلان")}{adsProgress.current > adSections.length ? adsProgress.current - adSections.length + 1 : 1}...</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : activeTab === 'script' ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("سكريبتات الفيديو (AI)")}</h2>
                    <div className="flex items-center gap-2">
                      {Object.keys(scriptAudios).length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadAllAudios('wav')}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            {t("تحميل WAV")}</button>
                          <button
                            onClick={() => handleDownloadAllAudios('mp3')}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            {t("تحميل MP3")}</button>
                        </div>
                      )}
                      {generatedScripts && generatedScripts.length > 0 && (
                        <button
                          onClick={handleGenerateAllAudios}
                          disabled={Object.values(isGeneratingAudio).some(v => v)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black shadow-lg shadow-amber-500/20/25 border-0 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {Object.values(isGeneratingAudio).some(v => v) ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {t("جاري التوليد...")}</>
                          ) : (
                            <>
                              <Mic className="w-4 h-4" />
                              {t("توليد الصوت للجميع")}</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {!generatedScripts && !isGeneratingScript ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <FileText className="w-16 h-16 mb-4 opacity-50" />
                      <p>{t("سكريبتات الفيديو ستظهر هنا بعد الإنشاء")}</p>
                    </div>
                  ) : isGeneratingScript ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#F0B21B]" />
                      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">{t("جاري كتابة السكريبتات...")}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">{t("نصنع هوك قوي يجذب الانتباه")}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {generatedScripts?.map((script, idx) => (
                        <div key={idx} className="bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                            <h3 className="text-lg font-bold text-[#F0B21B] dark:text-[#F0B21B] flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              {script.type}
                            </h3>
                            <button 
                              onClick={() => handleCopyScript(script.content, idx)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${scriptCopied === idx ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200'}`}
                            >
                              {scriptCopied === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {scriptCopied === idx ? 'تم النسخ!' : 'نسخ'}
                            </button>
                          </div>
                          {script.voiceOverInstructions !== undefined && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg flex items-start gap-3">
                              <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                              <div className="w-full">
                                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">{t("تعليمات التعليق الصوتي (Voice-Over Instructions)")}</h4>
                                <textarea 
                                  value={script.voiceOverInstructions}
                                  onChange={(e) => {
                                    const newScripts = [...generatedScripts!];
                                    newScripts[idx].voiceOverInstructions = e.target.value;
                                    setGeneratedScripts(newScripts);
                                  }}
                                  className="w-full bg-white/50 dark:bg-black/20 border border-blue-200 dark:border-blue-800/50 rounded p-2 text-sm text-blue-900 dark:text-blue-300 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y min-h-[60px]"
                                  dir="auto"
                                />
                              </div>
                            </div>
                          )}
                          <textarea
                            value={script.content}
                            onChange={(e) => {
                              const newScripts = [...generatedScripts!];
                              newScripts[idx].content = e.target.value;
                              setGeneratedScripts(newScripts);
                            }}
                            className="w-full min-h-[150px] font-sans text-zinc-800 dark:text-zinc-200 leading-relaxed text-lg whitespace-pre-wrap bg-transparent border border-zinc-200 dark:border-zinc-700 p-3 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#F0B21B]/50 mb-4"
                          />
                          
                          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                <Mic className="w-4 h-4 text-[#F0B21B] dark:text-[#F0B21B]" />
                                {t("التعليق الصوتي (AI)")}
                              </h4>
                              {!scriptAudios[idx] && (
                                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                  <CustomVoiceSelect
                                    size="sm"
                                    value={getScriptVoice(idx, script)}
                                    onChange={(val) => handleScriptVoiceChange(idx, val)}
                                    className="w-44 sm:w-52"
                                  />
                                  <button
                                    onClick={() => handleGenerateAudio(idx, script, getScriptVoice(idx, script))}
                                    disabled={isGeneratingAudio[idx]}
                                    className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black shadow-md shadow-amber-500/20/25 border-0 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    {isGeneratingAudio[idx] ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t("جاري التوليد...")}
                                      </>
                                    ) : (
                                      <>
                                        <Wand2 className="w-4 h-4" />
                                        {t("توليد الصوت")}
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {scriptAudios[idx] && (
                              <VoiceoverSpeedPlayer
                                id={idx + 1}
                                title={script.type}
                                audioUrls={scriptAudios[idx]}
                                defaultSpeed={1.25}
                                selectedVoice={getScriptVoice(idx, script)}
                                onVoiceChange={(val) => handleScriptVoiceChange(idx, val)}
                                onRegenerate={() => handleGenerateAudio(idx, script, getScriptVoice(idx, script))}
                                isRegenerating={isGeneratingAudio[idx]}
                                t={t}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : activeTab === 'fbAds' ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("نسخ إعلانات فيسبوك (AI)")}</h2>
                  </div>

                  {!generatedFbAds && !isGeneratingFbAds ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <TypeIcon className="w-16 h-16 mb-4 opacity-50" />
                      <p>{t("نسخ إعلانات فيسبوك ستظهر هنا بعد الإنشاء")}</p>
                    </div>
                  ) : isGeneratingFbAds ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#F0B21B]" />
                      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">{t("جاري كتابة الإعلانات...")}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">{t("نصنع 5 أنواع مختلفة من الإعلانات")}</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* TikTok Headlines Section */}
                      {generatedFbAds?.tiktokHeadlines && generatedFbAds.tiktokHeadlines.length > 0 && (
                        <div className="bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                            <h3 className="text-lg font-bold text-[#F0B21B] dark:text-[#F0B21B] flex items-center gap-2">
                              <TypeIcon className="w-5 h-5" />
                              {t("عناوين تيك توك (TikTok Headlines)")}</h3>
                          </div>
                          <div className="space-y-3">
                            {generatedFbAds.tiktokHeadlines.map((headline, idx) => (
                              <div key={`tiktok-${idx}`} className="flex items-start justify-between gap-4 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                                <textarea 
                                  value={headline}
                                  onChange={(e) => {
                                    const newAds = {...generatedFbAds!};
                                    newAds.tiktokHeadlines[idx] = e.target.value;
                                    setGeneratedFbAds(newAds);
                                  }}
                                  className="w-full font-sans text-zinc-800 dark:text-zinc-200 leading-relaxed bg-transparent border-0 resize-y outline-none focus:ring-0 p-0 m-0"
                                  rows={2}
                                />
                                <button 
                                  onClick={() => handleCopyTiktokHeadline(headline, idx)}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer flex-shrink-0 ${tiktokHeadlineCopied === idx ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200'}`}
                                >
                                  {tiktokHeadlineCopied === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  {tiktokHeadlineCopied === idx ? 'تم النسخ!' : 'نسخ'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Facebook Ads Section */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">{t("نسخ إعلانات فيسبوك")}</h3>
                        {generatedFbAds?.fbAds?.map((ad, idx) => (
                          <div key={`fb-${idx}`} className="bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                              <h3 className="text-lg font-bold text-[#F0B21B] dark:text-[#F0B21B] flex items-center gap-2">
                                <TypeIcon className="w-5 h-5" />
                                {ad.type}
                              </h3>
                              <button 
                                onClick={() => handleCopyFbAd(ad, idx)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${fbAdCopied === idx ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200'}`}
                              >
                                {fbAdCopied === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {fbAdCopied === idx ? 'تم النسخ!' : 'نسخ'}
                              </button>
                            </div>
                            <div className="space-y-4 font-sans text-zinc-800 dark:text-zinc-200 leading-relaxed text-lg flex flex-col gap-2">
                              <div className="flex flex-col">
                                <span className="font-bold text-[#F0B21B] dark:text-[#F0B21B] block mb-1">{t("Hook (الخطاف):")}</span>
                                <textarea 
                                  value={ad.hook}
                                  onChange={(e) => {
                                    const newAds = {...generatedFbAds!};
                                    newAds.fbAds[idx].hook = e.target.value;
                                    setGeneratedFbAds(newAds);
                                  }}
                                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 resize-y outline-none focus:ring-2 focus:ring-[#F0B21B]/50"
                                  rows={2}
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-[#F0B21B] dark:text-[#F0B21B] block mb-1">{t("Body (المحتوى):")}</span>
                                <textarea 
                                  value={ad.body}
                                  onChange={(e) => {
                                    const newAds = {...generatedFbAds!};
                                    newAds.fbAds[idx].body = e.target.value;
                                    setGeneratedFbAds(newAds);
                                  }}
                                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 resize-y outline-none focus:ring-2 focus:ring-[#F0B21B]/50"
                                  rows={5}
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-[#F0B21B] dark:text-[#F0B21B] block mb-1">{t("CTA (الدعوة لاتخاذ إجراء):")}</span>
                                <textarea 
                                  value={ad.cta}
                                  onChange={(e) => {
                                    const newAds = {...generatedFbAds!};
                                    newAds.fbAds[idx].cta = e.target.value;
                                    setGeneratedFbAds(newAds);
                                  }}
                                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 resize-y outline-none focus:ring-2 focus:ring-[#F0B21B]/50"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : activeTab === 'funnelCopy' ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("استراكشر لاند بيدج (AI)")}</h2>
                  </div>

                  {!generatedFunnelCopy && !isGeneratingFunnelCopy ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <LayoutTemplate className="w-16 h-16 mb-4 opacity-50" />
                      <p>{t("استراكشر اللاند بيدج سيظهر هنا بعد الإنشاء")}</p>
                    </div>
                  ) : isGeneratingFunnelCopy ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#F0B21B]" />
                      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">{t("جاري كتابة الاستراكشر...")}</p>
                    </div>
                  ) : (
                    <div className="bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                        <h3 className="text-lg font-bold text-[#F0B21B] dark:text-[#F0B21B] flex items-center gap-2">
                          <LayoutTemplate className="w-5 h-5" />
                          {t("النص الكامل")}</h3>
                        <button 
                          onClick={handleCopyFunnelCopy}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${funnelCopyCopied ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200'}`}
                        >
                          {funnelCopyCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {funnelCopyCopied ? 'تم النسخ!' : 'نسخ النص بالكامل'}
                        </button>
                      </div>
                      <textarea
                        value={generatedFunnelCopy || ''}
                        onChange={(e) => setGeneratedFunnelCopy(e.target.value)}
                        className="w-full min-h-[500px] bg-transparent border-0 font-sans text-zinc-800 dark:text-zinc-200 leading-relaxed text-lg whitespace-pre-wrap resize-y outline-none p-0 focus:ring-0"
                      />
                    </div>
                  )}
                </>
              ) : activeTab === 'videoScenes' ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("مشاهد فيديو (Flow / Veo 3)")}</h2>
                    {generatedVideoScenes.length > 0 && !isGeneratingVideoScenes && (
                      <button 
                        onClick={() => {
                          const allTexts = generatedVideoScenes.map(s => `المشهد ${s.sceneNumber} (${s.duration})

Visual Prompt (Veo / Flow):
${s.prompt}

السكريبت (التعليق الصوتي):
${s.script}`).join('\n\n---\n\n');
                          navigator.clipboard.writeText(allTexts);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black shadow-lg shadow-amber-500/20/30 text-white rounded-xl font-medium transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        {t("نسخ كل المشاهد")}
                      </button>
                    )}
                  </div>

                  {generatedVideoScenes.length === 0 && !isGeneratingVideoScenes ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <Film className="w-16 h-16 mb-4 opacity-50" />
                      <p>{t("المشاهد والأوامر ستظهر هنا بعد الإنشاء")}</p>
                    </div>
                  ) : isGeneratingVideoScenes ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#F0B21B]" />
                      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">{t("جاري توليد المشاهد...")}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {generatedVideoScenes.map((scene, index) => (
                        <div key={index} className="bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                            <h3 className="text-lg font-bold text-[#F0B21B] dark:text-[#F0B21B] flex items-center gap-2">
                              <Film className="w-5 h-5" />
                              {videoGenerationMode === 'hooks' ? `هوك (بداية) ${scene.sceneNumber}` : videoGenerationMode === 'frames' ? `إطار المشهد ${scene.sceneNumber} (${scene.duration})` : videoGenerationMode === 'single_15s' ? `مشهد كامل (15 ثانية)` : `المشهد ${scene.sceneNumber} (${scene.duration})`}
                            </h3>
                            <button 
                              onClick={() => {
                                const fullSceneText = `Visual Prompt (Veo / Flow):
${scene.prompt}

السكريبت (التعليق الصوتي):
${scene.script}`;
                                navigator.clipboard.writeText(fullSceneText);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" /> {t("نسخ المشهد")}
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-zinc-700 dark:text-zinc-300">{t("Visual Prompt (Veo / Flow):")}</h4>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(scene.prompt)}
                                  className="flex items-center gap-1 px-2 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded text-xs font-medium transition-colors"
                                >
                                  <Copy className="w-3 h-3" /> {t("نسخ")}
                                </button>
                              </div>
                              <textarea
                                value={scene.prompt}
                                onChange={(e) => {
                                  const newScenes = [...generatedVideoScenes];
                                  newScenes[index].prompt = e.target.value;
                                  setGeneratedVideoScenes(newScenes);
                                }}
                                className="block w-full min-h-[100px] p-3 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] outline-none resize-y transition-colors text-sm font-mono text-left"
                                dir="ltr"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-zinc-700 dark:text-zinc-300">{t("السكريبت (التعليق الصوتي):")}</h4>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(scene.script)}
                                  className="flex items-center gap-1 px-2 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded text-xs font-medium transition-colors"
                                >
                                  <Copy className="w-3 h-3" /> {t("نسخ")}
                                </button>
                              </div>
                              <textarea
                                value={scene.script}
                                onChange={(e) => {
                                  const newScenes = [...generatedVideoScenes];
                                  newScenes[index].script = e.target.value;
                                  setGeneratedVideoScenes(newScenes);
                                }}
                                className="block w-full min-h-[100px] p-3 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-[#F0B21B] outline-none resize-y transition-colors text-sm"
                                dir="rtl"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : activeTab === 'winnerAngle' ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("إعادة توليد الانجل الوينر")}</h2>
                    {generatedWinnerScripts.length > 0 && !isGeneratingWinnerScripts && (
                      <button 
                        onClick={() => {
                          const allTexts = generatedWinnerScripts.map(s => `${s.type}

${s.content}`).join('\n\n---\n\n');
                          navigator.clipboard.writeText(allTexts);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black shadow-lg shadow-amber-500/20/30 text-white rounded-xl font-medium transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        {t("نسخ كل المحتوى")}</button>
                    )}
                  </div>

                  {generatedWinnerScripts.length === 0 && !isGeneratingWinnerScripts ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-16">
                      <RefreshCw className="w-16 h-16 mb-4 opacity-50" />
                      <p>{t("قم برفع الفيديو واستخراج السكريبت لتوليد سكريبتات جديدة")}</p>
                    </div>
                  ) : isGeneratingWinnerScripts ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-16">
                      <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#F0B21B]" />
                      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">{t("جاري تحليل الفيديو وتوليد السكريبتات...")}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {generatedWinnerScripts.map((script, index) => (
                        <div key={index} className="bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                            <h3 className="text-lg font-bold text-[#F0B21B] dark:text-[#F0B21B] flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              {script.type}
                            </h3>
                            <div className="flex items-center gap-2">
                              <CustomVoiceSelect
                                size="sm"
                                value={winnerSelectedVoices[index] || voiceGender || 'auto'}
                                onChange={(val) => setWinnerSelectedVoices(prev => ({ ...prev, [index]: val }))}
                                className="w-40 sm:w-48"
                              />
                              <button 
                                onClick={() => handleGenerateWinnerAudio(index, script, winnerSelectedVoices[index])}
                                disabled={isGeneratingWinnerAudio[index]}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                {isGeneratingWinnerAudio[index] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : winnerAudios[index] ? (
                                  <RefreshCw className="w-4 h-4" />
                                ) : (
                                  <Mic className="w-4 h-4" />
                                )}
                                {winnerAudios[index] ? 'إعادة التوليد' : 'توليد الصوت'}
                              </button>
                              <button 
                                onClick={() => navigator.clipboard.writeText(script.content)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-xs font-medium transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" /> {t("نسخ")}</button>
                            </div>
                          </div>
                          
                          {script.voiceOverInstructions !== undefined && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg flex items-start gap-3">
                              <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                              <div className="w-full">
                                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">{t("تعليمات التعليق الصوتي (Voice-Over Instructions)")}</h4>
                                <textarea 
                                  value={script.voiceOverInstructions}
                                  onChange={(e) => {
                                    const newScripts = [...generatedWinnerScripts];
                                    newScripts[index].voiceOverInstructions = e.target.value;
                                    setGeneratedWinnerScripts(newScripts);
                                  }}
                                  className="w-full bg-white/50 dark:bg-black/20 border border-blue-200 dark:border-blue-800/50 rounded p-2 text-sm text-blue-900 dark:text-blue-300 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y min-h-[60px]"
                                  dir="auto"
                                />
                              </div>
                            </div>
                          )}

                          <textarea
                            value={script.content}
                            onChange={(e) => {
                              const newScripts = [...generatedWinnerScripts];
                              newScripts[index].content = e.target.value;
                              setGeneratedWinnerScripts(newScripts);
                            }}
                            className="w-full min-h-[150px] font-sans text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm whitespace-pre-wrap bg-transparent border border-zinc-200 dark:border-zinc-700 p-3 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#F0B21B]/50"
                          />

                          {winnerAudios[index] && (
                            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                              <VoiceoverSpeedPlayer
                                id={`winner-${index + 1}`}
                                title={`${t("صوت زاوية الوينر")} #${index + 1}`}
                                audioUrls={winnerAudios[index]}
                                defaultSpeed={1.25}
                                t={t}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : activeTab === 'creativePrompts' ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("أوامر توليد تصاميم الإعلانات (Creative Prompts)")}</h2>
                    {generatedCreativePrompts.length > 0 && !isGeneratingCreativePrompts && (
                      <button 
                        onClick={() => {
                          const allTexts = generatedCreativePrompts.map((p, i) => `${t("الديزاين #")}${i + 1}

${t("الفكرة والزاوية البيعية")}:
${p.concept}

${t("الاستايل البصري والألوان")}:
${p.visualStyle}

${t("النص التسويقي (Text Overlay)")}:
${p.textOverlay.subheadline ? p.textOverlay.subheadline + '\n' : ''}${p.textOverlay.headline}
${p.textOverlay.callToAction}

${t("تفاصيل التصميم (Layout Breakdown)")}:
${t("الخلفية:")} ${p.layout.background}
${t("موضع المنتج (Product Placement):")} ${p.layout.productPlacement}
${p.layout.extraElements && p.layout.extraElements.length > 0 ? t("عناصر إضافية على الديزاين:") + ' ' + p.layout.extraElements.join(', ') + '\n' : ''}
${t("أمر توليد التصميم للذكاء الاصطناعي (AI Prompt)")}:
${p.aiPrompt}`).join('\n\n=================================\n\n');
                          navigator.clipboard.writeText(allTexts);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black shadow-lg shadow-amber-500/20/30 text-white rounded-xl font-medium transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        {t("نسخ كل المحتوى")}
                      </button>
                    )}
                  </div>

                  {generatedCreativePrompts.length === 0 && !isGeneratingCreativePrompts ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-16">
                      <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                      <p>{t("قم بإدخال وصف المنتج لتوليد ديزاينات إعلانية قوية ومفصلة")}</p>
                    </div>
                  ) : isGeneratingCreativePrompts ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-16">
                      <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#F0B21B]" />
                      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">{t("جاري وضع تصور شامل للديزاينات المبيعية وحساب أبعادها...")}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {generatedCreativePrompts.map((promptData, index) => (
                        <div key={index} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                            <h3 className="text-xl font-black text-[#F0B21B] dark:text-[#F0B21B]">
                              {t("الديزاين #")}{index + 1}
                            </h3>
                            <button
                              onClick={() => {
                                const text = `${t("الديزاين #")}${index + 1}

${t("الفكرة والزاوية البيعية")}:
${promptData.concept}

${t("الاستايل البصري والألوان")}:
${promptData.visualStyle}

${t("النص التسويقي (Text Overlay)")}:
${promptData.textOverlay.subheadline ? promptData.textOverlay.subheadline + '\n' : ''}${promptData.textOverlay.headline}
${promptData.textOverlay.callToAction}

${t("تفاصيل التصميم (Layout Breakdown)")}:
${t("الخلفية:")} ${promptData.layout.background}
${t("موضع المنتج (Product Placement):")} ${promptData.layout.productPlacement}
${promptData.layout.extraElements && promptData.layout.extraElements.length > 0 ? t("عناصر إضافية على الديزاين:") + ' ' + promptData.layout.extraElements.join(', ') + '\n' : ''}
${t("أمر توليد التصميم للذكاء الاصطناعي (AI Prompt)")}:
${promptData.aiPrompt}`;
                                navigator.clipboard.writeText(text);
                                setCreativePromptCopied(index);
                                setTimeout(() => setCreativePromptCopied(null), 2000);
                              }}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${creativePromptCopied === index ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200'}`}
                            >
                              {creativePromptCopied === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {creativePromptCopied === index ? 'تم النسخ!' : 'نسخ'}
                            </button>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white/50 dark:bg-zinc-800/20 p-4 rounded-xl border border-zinc-100/50 dark:border-zinc-700/30 backdrop-blur-md border border-zinc-100 dark:border-zinc-800/80">
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/50 text-[#F0B21B] dark:text-[#F0B21B] flex items-center justify-center text-xs">💡</span>
                                {t("الفكرة والزاوية البيعية")}</h4>
                              <textarea
                                value={promptData.concept}
                                onChange={(e) => {
                                  const newP = [...generatedCreativePrompts];
                                  newP[index].concept = e.target.value;
                                  setGeneratedCreativePrompts(newP);
                                }}
                                className="w-full text-sm text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed bg-transparent border border-zinc-200/50 dark:border-zinc-700/50 p-2 rounded-lg resize-y outline-none focus:ring-2 focus:ring-[#F0B21B]/50"
                                rows={4}
                              />
                            </div>
                            <div className="bg-white/50 dark:bg-zinc-800/20 p-4 rounded-xl border border-zinc-100/50 dark:border-zinc-700/30 backdrop-blur-md border border-zinc-100 dark:border-zinc-800/80">
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">🎨</span>
                                {t("الاستايل البصري والألوان")}</h4>
                              <textarea
                                value={promptData.visualStyle}
                                onChange={(e) => {
                                  const newP = [...generatedCreativePrompts];
                                  newP[index].visualStyle = e.target.value;
                                  setGeneratedCreativePrompts(newP);
                                }}
                                className="w-full text-sm text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed bg-transparent border border-zinc-200/50 dark:border-zinc-700/50 p-2 rounded-lg resize-y outline-none focus:ring-2 focus:ring-[#F0B21B]/50"
                                rows={4}
                              />
                            </div>
                          </div>

                          <div className="bg-zinc-900 text-white dark:bg-black rounded-xl p-6 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B21B]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            <h4 className="text-sm font-bold text-zinc-300 mb-4 opacity-80 uppercase tracking-wider text-center">{t("النص التسويقي (Text Overlay)")}</h4>
                            <div className="text-center space-y-3 max-w-lg mx-auto">
                              <input
                                value={promptData.textOverlay.subheadline || ""}
                                onChange={(e) => {
                                  const newP = [...generatedCreativePrompts];
                                  newP[index].textOverlay.subheadline = e.target.value;
                                  setGeneratedCreativePrompts(newP);
                                }}
                                className="w-full text-center text-sm text-[#F0B21B] font-medium bg-transparent border-b border-[#F0B21B]/30 focus:border-[#F0B21B] outline-none pb-1"
                                placeholder={t("العنوان الفرعي")}
                              />
                              <textarea
                                value={promptData.textOverlay.headline}
                                onChange={(e) => {
                                  const newP = [...generatedCreativePrompts];
                                  newP[index].textOverlay.headline = e.target.value;
                                  setGeneratedCreativePrompts(newP);
                                }}
                                className="w-full text-center text-2xl md:text-3xl font-black text-white leading-tight bg-transparent border-0 resize-y outline-none focus:ring-0 p-0"
                                rows={2}
                              />
                              <div className="pt-2 flex justify-center">
                                <input
                                  value={promptData.textOverlay.callToAction}
                                  onChange={(e) => {
                                    const newP = [...generatedCreativePrompts];
                                    newP[index].textOverlay.callToAction = e.target.value;
                                    setGeneratedCreativePrompts(newP);
                                  }}
                                  className="text-center px-4 py-1.5 bg-[#F0B21B] text-white text-sm font-bold rounded-full outline-none focus:ring-2 focus:ring-white border-0 min-w-[200px]"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mb-6 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                            <div className="bg-zinc-100 dark:bg-zinc-800/80 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <LayoutTemplate className="w-4 h-4 text-zinc-500" />
                                {t("تفاصيل التصميم (Layout Breakdown)")}</h4>
                            </div>
                            <div className="p-4 space-y-4 bg-white dark:bg-zinc-900">
                              <div>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">{t("الخلفية:")}</span>
                                <textarea
                                  value={promptData.layout.background}
                                  onChange={(e) => {
                                    const newP = [...generatedCreativePrompts];
                                    newP[index].layout.background = e.target.value;
                                    setGeneratedCreativePrompts(newP);
                                  }}
                                  className="w-full text-sm text-zinc-800 dark:text-zinc-200 bg-transparent border border-zinc-200 dark:border-zinc-700/50 p-2 rounded-lg resize-y outline-none focus:ring-2 focus:ring-[#F0B21B]/50"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">{t("موضع المنتج (Product Placement):")}</span>
                                <textarea
                                  value={promptData.layout.productPlacement}
                                  onChange={(e) => {
                                    const newP = [...generatedCreativePrompts];
                                    newP[index].layout.productPlacement = e.target.value;
                                    setGeneratedCreativePrompts(newP);
                                  }}
                                  className="w-full text-sm text-zinc-800 dark:text-zinc-200 font-medium bg-transparent border border-zinc-200 dark:border-zinc-700/50 p-2 rounded-lg resize-y outline-none focus:ring-2 focus:ring-[#F0B21B]/50"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">{t("عناصر إضافية على الديزاين (مفصولة بفاصلة):")}</span>
                                <textarea
                                  value={promptData.layout.extraElements ? promptData.layout.extraElements.join(', ') : ''}
                                  onChange={(e) => {
                                    const newP = [...generatedCreativePrompts];
                                    newP[index].layout.extraElements = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                    setGeneratedCreativePrompts(newP);
                                  }}
                                  className="w-full text-sm text-zinc-800 dark:text-zinc-200 font-medium bg-transparent border border-zinc-200 dark:border-zinc-700/50 p-2 rounded-lg resize-y outline-none focus:ring-2 focus:ring-[#F0B21B]/50"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Wand2 className="w-4 h-4 text-zinc-500" />
                                {t("أمر توليد التصميم للذكاء الاصطناعي (AI Prompt)")}</h4>
                              <button 
                                onClick={() => navigator.clipboard.writeText(promptData.aiPrompt)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg text-xs font-medium transition-colors text-zinc-800 dark:text-white"
                              >
                                <Copy className="w-3 h-3" /> {t("انسخ الأمر (Prompt)")}</button>
                            </div>
                            <textarea
                              value={promptData.aiPrompt}
                              onChange={(e) => {
                                const newP = [...generatedCreativePrompts];
                                newP[index].aiPrompt = e.target.value;
                                setGeneratedCreativePrompts(newP);
                              }}
                              className="w-full min-h-[200px] bg-black/5 dark:bg-black/20 p-4 rounded-xl font-mono text-sm text-zinc-800 dark:text-zinc-300 text-left border border-zinc-200 dark:border-zinc-700 leading-relaxed whitespace-pre-wrap outline-none focus:ring-2 focus:ring-[#F0B21B]/50 resize-y"
                              dir="ltr"
                            />
                            <p className="text-xs mt-2 text-zinc-500 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {t("يمكنك استخدام هذا الأمر الشامل في نماذج توليد الصور (مثل Midjourney أو DALL-E) لتوليد التصميم كاملاً بكل تفاصيله.")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : activeTab === 'smartAngles' ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                       <Target className="w-5 h-5 text-emerald-500" />
                       {t("الزوايا الإعلانية الذكية (10 زوايا)")}
                    </h2>
                  </div>
                  
                  {isGeneratingSmartAngles ? (
                    <div className="text-center py-20 text-zinc-500 flex flex-col items-center">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Target className="w-6 h-6 text-emerald-500 animate-pulse" />
                        </div>
                      </div>
                      <p className="mt-6 font-medium text-emerald-600 dark:text-emerald-400">{t("جاري البحث والتفكير في أفضل الزوايا الإعلانية...")}</p>
                      <p className="text-sm mt-2 opacity-70">يتم تحديد شرائح الجمهور المحتملة وصياغة أفضل الرسائل البيعية</p>
                    </div>
                  ) : generatedSmartAngles.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500 flex flex-col items-center bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                       <Target className="w-12 h-12 mb-4 text-emerald-400/50 dark:text-emerald-500/30" />
                       <p className="font-medium text-zinc-600 dark:text-zinc-400">ستظهر الزوايا الإعلانية للجمهور هنا بعد التوليد</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {generatedSmartAngles.map((angle, index) => (
                        <div key={index} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                          <div className="flex gap-4">
                             <div className="w-10 h-10 shrink-0 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-xl font-bold text-lg">
                               {index + 1}
                             </div>
                             <div className="flex-1">
                               <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                    {angle.title}
                                  </h3>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                    الجمهور: {angle.audience}
                                  </span>
                               </div>
                               
                               <div className="mb-4">
                                 <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">الهوك (Hook)</h4>
                                 <p className="text-lg font-bold text-[#09090b] dark:text-[#F0B21B] leading-relaxed bg-amber-50 dark:bg-zinc-900 dark:bg-fuchsia-900/10 p-4 rounded-xl border border-fuchsia-100 dark:border-fuchsia-800/30">
                                   {angle.hook}
                                 </p>
                               </div>

                               <div>
                                 <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">شرح الزاوية البيعية</h4>
                                 <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                   {angle.angle}
                                 </p>
                               </div>
                               
                               <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                                 <button 
                                   onClick={() => {
                                     const text = `الزاوية الإعلانية: ${angle.title}
الجمهور: ${angle.audience}
الهوك: ${angle.hook}
الشرح: ${angle.angle}`;
                                     navigator.clipboard.writeText(text);
                                   }}
                                   className="text-xs font-semibold flex items-center gap-1.5 text-zinc-500 hover:text-emerald-600 transition-colors"
                                 >
                                   <Copy className="w-4 h-4" />
                                   نسخ هذه الزاوية
                                 </button>
                               </div>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : activeTab === 'flowCharacter' ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                       <UserIcon className="w-5 h-5 text-blue-500" />
                       {t("شخصية Flow (Character Prompt)")}
                    </h2>
                    {generatedFlowCharacter && !isGeneratingFlowCharacter && (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedFlowCharacter);
                        }}
                        className="text-sm font-semibold text-[#09090b] hover:text-[#5A2DB2] transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                        {t("نسخ المخرجات")}
                      </button>
                    )}
                  </div>
                  
                  {isGeneratingFlowCharacter ? (
                    <div className="text-center py-20 text-zinc-500 flex flex-col items-center">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-blue-500 animate-pulse" />
                        </div>
                      </div>
                      <p className="mt-6 font-medium text-blue-600 dark:text-blue-400">{t("جاري بناء الشخصية وتحديد ملامحها...")}</p>
                      <p className="text-sm mt-2 opacity-70">{t("يتم تجهيز أوامر Omni والفيديو")}</p>
                    </div>
                  ) : !generatedFlowCharacter ? (
                    <div className="text-center py-20 text-zinc-500 flex flex-col items-center bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                       <UserIcon className="w-12 h-12 mb-4 text-blue-400/50 dark:text-blue-500/30" />
                       <p className="font-medium text-zinc-600 dark:text-zinc-400">{t("ستظهر مواصفات الشخصية وأوامرها هنا بعد التوليد")}</p>
                    </div>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed overflow-y-auto p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl whitespace-pre-wrap" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <ReactMarkdown>{generatedFlowCharacter}</ReactMarkdown>
                    </div>
                  )}
                </>
              ) : activeTab === 'textOnVisual' ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("نصوص على الشاشة (Text on Visual)")}</h2>
                    {generatedTextOnVisual.length > 0 && !isGeneratingTextOnVisual && (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedTextOnVisual.join('\n'));
                        }}
                        className="text-sm font-semibold text-[#09090b] hover:text-[#5A2DB2] transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                        {t("نسخ كل النصوص")}
                      </button>
                    )}
                  </div>

                  {generatedTextOnVisual.length === 0 && !isGeneratingTextOnVisual ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-16">
                      <Quote className="w-16 h-16 mb-4 opacity-50" />
                      <p>{t("قم بإدخال وصف المنتج لتوليد نصوص مقنعة للشاشة")}</p>
                    </div>
                  ) : isGeneratingTextOnVisual ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-16">
                      <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#09090b]" />
                      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">{t("جاري توليد الجمل...")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {generatedTextOnVisual.map((sentence, index) => (
                        <div key={index} className="p-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-xl relative group flex items-start gap-4 transition-colors hover:border-amber-200 dark:border-zinc-800 dark:hover:border-fuchsia-800">
                          <div className="w-8 h-8 rounded-full bg-[#09090b]/10 text-[#09090b] flex items-center justify-center font-bold shrink-0">{index + 1}</div>
                          <div className="flex-1">
                            <textarea
                              value={sentence}
                              onChange={(e) => {
                                const newTexts = [...generatedTextOnVisual];
                                newTexts[index] = e.target.value;
                                setGeneratedTextOnVisual(newTexts);
                              }}
                              className="w-full text-xl font-medium leading-relaxed bg-transparent border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 rounded-lg p-2 resize-y outline-none focus:ring-2 focus:ring-[#F0B21B]/50 focus:border-transparent text-zinc-800 dark:text-zinc-200 min-h-[60px]"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(sentence);
                            }}
                            className="p-2 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-[#F0B21B] shadow-sm border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors shrink-0"
                            title={t("نسخ")}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t("مشاهد المنتج (AI)")}</h2>
                    {selectedPhotoshootImages.size > 0 && (
                      <button
                        onClick={handleTransferSelected}
                        disabled={isTransferring}
                        className="flex items-center gap-2 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black shadow-lg shadow-amber-500/20/25 border-0 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {isTransferring ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t("جاري النقل...")}</>
                        ) : (
                          <>
                            <LayoutTemplate className="w-4 h-4" />
                            {t("استخدام")}{selectedPhotoshootImages.size} {t("صور في صفحة الهبوط")}</>
                        )}
                      </button>
                    )}
                  </div>

                  {photoshootImages.length === 0 && !isGeneratingPhotoshoot ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 py-32">
                      <Camera className="w-16 h-16 mb-4 opacity-50" />
                      <p>{t("مشاهد المنتج ستظهر هنا بعد الإنشاء")}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {photoshootImages.map((img, idx) => (
                        <div 
                          key={idx} 
                          className={`group relative rounded-xl overflow-hidden border-2 shadow-sm cursor-pointer transition-all ${
                            selectedPhotoshootImages.has(idx) ? 'border-fuchsia-600 ring-2 ring-fuchsia-600/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-700'
                          }`}
                          onClick={() => togglePhotoshootSelection(idx)}
                        >
                          <img src={img.url} alt={`Scene ${idx + 1}`} className="w-full h-auto object-cover aspect-square" />
                          
                          {/* Selection Indicator */}
                          <div className="absolute top-3 right-3 z-20">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              selectedPhotoshootImages.has(idx) 
                                ? 'bg-[#F0B21B] border-fuchsia-600 text-white' 
                                : 'bg-white/80 dark:bg-zinc-800/80 border-zinc-400 dark:border-zinc-500 text-transparent hover:border-fuchsia-600 dark:hover:border-[#F0B21B]'
                            }`}>
                              <Check className="w-4 h-4" />
                            </div>
                          </div>

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                            <p className="text-white text-sm text-center leading-relaxed line-clamp-4">{img.prompt}</p>
                            <a 
                              href={img.url} 
                              download={`product-scene-${idx + 1}.jpg`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-3 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-colors mt-2"
                            >
                              <Download className="w-5 h-5" />
                            </a>
                          </div>
                        </div>
                      ))}
                      {isGeneratingPhotoshoot && photoshootProgress.current < photoshootProgress.total && (
                        <div className="rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center aspect-square text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50">
                          <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#F0B21B]" />
                          <span className="text-sm text-center px-2">{t("جاري تصوير المشهد")}{photoshootProgress.current + 1}...</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          )}
        </div>
        )}
        </div>
        </main>
      </div>

      {/* Design Style Confirmation Modal */}
      {pendingDesignStyle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{t("تأكيد تغيير التصميم")}</h3>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {t("تغيير نمط التصميم قد يؤدي إلى إعادة تعيين بعض التخصيصات الحالية (مثل الألوان أو الخطوط) لتتناسب مع النمط الجديد. هل أنت متأكد من رغبتك في المتابعة؟")}</p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setPendingDesignStyle(null)}
                className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg font-medium transition-colors"
              >
                {t("إلغاء")}</button>
              <button
                onClick={() => {
                  if (pendingDesignStyle) {
                    setDesignStyle(pendingDesignStyle);
                    setPendingDesignStyle(null);
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-black to-zinc-900 hover:from-zinc-900 hover:to-black shadow-lg shadow-amber-500/20/25 border-0 text-white rounded-lg font-medium transition-colors"
              >
                {t("تأكيد التغيير")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AppContext.Provider>
  );
}
