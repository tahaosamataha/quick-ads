import React, { useState } from 'react';
import { Plus, Trash2, Wand2, Copy, Palette, Type, MessageSquare, Layout, Image as ImageIcon, CheckCircle2, ChevronRight, Upload, Save, Settings2, Sparkles } from 'lucide-react';
import { db } from '../firebase';
import { addDoc, collection, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '../LanguageContext';
import { generateBrandKit } from '../services/ai';

export default function BrandKitManager({ 
  brandKits, 
  currentUser, 
  onRefresh, 
  showToast 
}: { 
  brandKits: any[]; 
  currentUser: any; 
  onRefresh: () => void; 
  showToast: (m: string, t?: 'success'|'error') => void; 
}) {
  const { t, language } = useLanguage();
  const [activeView, setActiveView] = useState<'list' | 'editor'>('list');
  const [editingKit, setEditingKit] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const defaultKit = {
    name: 'New Brand',
    description: '',
    industry: '',
    website: '',
    targetAudience: '',
    uniqueSellingProposition: '',
    keyBenefits: '',
    objectionsToOvercome: '',
    communicationStyle: '',
    prohibitedWords: '',
    colors: {
      primary: '#09090b',
      secondary: '#09090b',
      accent: '#F0B21B',
      background: '#F7F9FC'
    },
    typography: { heading: 'Inter', body: 'Inter' },
    voice: { primary: 'Professional' },
    visualStyle: 'Modern',
    generationPreferences: {
      landingPages: 'Sales Layout',
      creatives: 'Product Focused',
      copies: 'Direct Response',
      voiceOvers: 'Energetic'
    }
  };

  const handleCreateNew = () => {
    setEditingKit({ ...defaultKit });
    setActiveView('editor');
  };

  const handleEdit = (kit: any) => {
    setEditingKit({ ...defaultKit, ...kit });
    setActiveView('editor');
  };

  const handleSave = async () => {
    try {
      if (editingKit.id) {
        await updateDoc(doc(db, 'brandKits', editingKit.id), {
          ...editingKit,
          updatedAt: serverTimestamp()
        });
        showToast(t("Brand Kit updated"));
      } else {
        await addDoc(collection(db, 'brandKits'), {
          ...editingKit,
          userId: currentUser.uid,
          isActive: brandKits.length === 0,
          createdAt: serverTimestamp()
        });
        showToast(t("Brand Kit created"));
      }
      onRefresh();
      setActiveView('list');
    } catch (e) {
      showToast(t("Error saving Brand Kit"), 'error');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'brandKits', id));
      showToast(t("Brand Kit deleted"));
      onRefresh();
      setDeleteConfirmId(null);
    } catch (e) {
      console.error("Delete error:", e); showToast(t("Error deleting Brand Kit"), 'error');
    }
  };

  const handleDuplicate = async (kit: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { id, isActive, ...kitData } = kit;
      await addDoc(collection(db, 'brandKits'), {
        ...kitData,
        name: kit.name + ' (Copy)',
        userId: currentUser.uid,
        isActive: false,
        createdAt: serverTimestamp()
      });
      showToast(t("Brand Kit duplicated"));
      onRefresh();
    } catch (e) {
      showToast(t("Error duplicating Brand Kit"), 'error');
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      for (const kit of brandKits) {
        if (kit.isActive) await updateDoc(doc(db, 'brandKits', kit.id), { isActive: false });
      }
      await updateDoc(doc(db, 'brandKits', id), { isActive: true });
      showToast(t("Brand Kit Applied to Application"));
      onRefresh();
    } catch (e) {
      showToast(t("Error applying brand kit"), 'error');
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generatedData = await generateBrandKit(aiPrompt);
      const kit = {
        ...defaultKit,
        ...generatedData,
        name: String(generatedData.name || aiPrompt).substring(0, 199),
        industry: String(generatedData.industry || defaultKit.industry || ''),
        description: String(generatedData.description || aiPrompt).substring(0, 199000),
        website: String(generatedData.website || defaultKit.website || ''),
        visualStyle: String(generatedData.visualStyle || defaultKit.visualStyle || ''),
        typography: (generatedData.typography && typeof generatedData.typography === 'object' && !Array.isArray(generatedData.typography)) ? generatedData.typography : defaultKit.typography,
        voice: (generatedData.voice && typeof generatedData.voice === 'object' && !Array.isArray(generatedData.voice)) ? generatedData.voice : defaultKit.voice,
        generationPreferences: (generatedData.generationPreferences && typeof generatedData.generationPreferences === 'object' && !Array.isArray(generatedData.generationPreferences)) ? generatedData.generationPreferences : defaultKit.generationPreferences,
        colors: (generatedData.colors && typeof generatedData.colors === 'object' && !Array.isArray(generatedData.colors)) ? generatedData.colors : defaultKit.colors,
        userId: currentUser.uid,
        isActive: brandKits.length === 0,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'brandKits'), kit);
      showToast(t("Brand Kit Generated successfully!"));
      setAiPrompt('');
      onRefresh();
    } catch (e) {
      console.error('Error generating brand kit:', e);
      showToast(t("Error generating brand kit"), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateColor = (key: string, value: string) => {
    setEditingKit({ ...editingKit, colors: { ...editingKit.colors, [key]: value } });
  };

  if (activeView === 'editor' && editingKit) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveView('list')} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              الرجوع
            </button>
            <h3 className="text-xl font-bold text-[#09090b] dark:text-white">إعدادات الهوية البصرية (Brand Kit)</h3>
          </div>
          <button onClick={handleSave} className="px-6 flex items-center gap-2 py-2 bg-[#F0B21B] hover:bg-[#DF9F10] text-[#09090b] font-bold rounded-xl transition-all shadow-sm text-sm">
            <Save className="w-4 h-4" />
            حفظ التغييرات
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* Main Settings Panel */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Identity */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Settings2 className="w-5 h-5 text-[#09090b]" />
                <h4 className="font-bold text-lg text-zinc-900 dark:text-white">تفاصيل البراند</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">اسم البراند</label>
                  <input type="text" value={editingKit.name || ''} onChange={e => setEditingKit({...editingKit, name: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">المجال (Industry)</label>
                  <input type="text" value={editingKit.industry || ''} onChange={e => setEditingKit({...editingKit, industry: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">وصف قصير للبراند</label>
                  <textarea value={editingKit.description || ''} onChange={e => setEditingKit({...editingKit, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none resize-none" />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Palette className="w-5 h-5 text-[#F0B21B]" />
                <h4 className="font-bold text-lg text-zinc-900 dark:text-white">الألوان (Colors)</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'primary', label: 'Primary' },
                  { id: 'secondary', label: 'Secondary' },
                  { id: 'accent', label: 'Accent' },
                  { id: 'background', label: 'Background' }
                ].map(c => (
                  <div key={c.id}>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2">{c.label}</label>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg shadow-sm border border-black/10 overflow-hidden relative flex-shrink-0 cursor-pointer">
                        <input type="color" value={editingKit.colors[c.id]} onChange={e => updateColor(c.id, e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                      </div>
                      <input type="text" value={editingKit.colors[c.id]} onChange={e => updateColor(c.id, e.target.value)} className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs outline-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography & Voice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Type className="w-5 h-5 text-[#09090b]" />
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-white">الخطوط (Typography)</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2">Heading Font</label>
                    <select value={editingKit.typography.heading} onChange={e => setEditingKit({...editingKit, typography: {...editingKit.typography, heading: e.target.value}})} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-sm">
                      <option>Inter</option><option>Space Grotesk</option><option>Playfair Display</option><option>Cairo</option><option>Tajawal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2">Body Font</label>
                    <select value={editingKit.typography.body} onChange={e => setEditingKit({...editingKit, typography: {...editingKit.typography, body: e.target.value}})} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-sm">
                      <option>Inter</option><option>Roboto</option><option>Open Sans</option><option>Cairo</option><option>Tajawal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                  <h4 className="font-bold text-lg text-zinc-900 dark:text-white">نبرة الصوت (Tone of Voice)</h4>
                </div>
                <select value={editingKit.voice.primary} onChange={e => setEditingKit({...editingKit, voice: {...editingKit.voice, primary: e.target.value}})} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-sm">
                  {['Professional', 'Luxury', 'Casual', 'Bold', 'Emotional', 'Aggressive Sales', 'Friendly', 'Minimal'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 italic">
                  ستقوم الذكاء الاصطناعي بكتابة المحتوى بناءً على هذه النبرة لتناسب هويتك.
                </div>
              </div>
            </div>

            
            {/* Advanced Brand Settings */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mt-8">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <h4 className="font-bold text-lg text-zinc-900 dark:text-white">الهوية العميقة و استراتيجية التسويق</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">الفئة المستهدفة (Target Audience)</label>
                  <textarea value={editingKit.targetAudience || ''} onChange={e => setEditingKit({...editingKit, targetAudience: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none resize-none" placeholder="مثال: الشباب من 18-35 المهتمين بالموضة" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">الميزة التنافسية (USP)</label>
                  <textarea value={editingKit.uniqueSellingProposition || ''} onChange={e => setEditingKit({...editingKit, uniqueSellingProposition: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none resize-none" placeholder="مثال: توصيل سريع خلال ساعتين، جودة أعلى بسعر أقل" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">أهم الفوائد (Key Benefits)</label>
                  <textarea value={editingKit.keyBenefits || ''} onChange={e => setEditingKit({...editingKit, keyBenefits: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none resize-none" placeholder="يحل مشكلة التعرق، يعطي ثقة بالنفس" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">اعتراضات شائعة (Objections)</label>
                  <textarea value={editingKit.objectionsToOvercome || ''} onChange={e => setEditingKit({...editingKit, objectionsToOvercome: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none resize-none" placeholder="غالي الثمن -> الرد: جودة تدوم طويلا" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">أسلوب التواصل (Comm. Style)</label>
                  <textarea value={editingKit.communicationStyle || ''} onChange={e => setEditingKit({...editingKit, communicationStyle: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none resize-none" placeholder="مرح، صديق، يتحدث بلغة الشارع، أو رسمي جداً" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">كلمات ممنوعة (Prohibited Words)</label>
                  <textarea value={editingKit.prohibitedWords || ''} onChange={e => setEditingKit({...editingKit, prohibitedWords: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none resize-none" placeholder="رخيص، مجاني، وغيرها" />
                </div>
              </div>
            </div>


            {/* AI Generation Preferences */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Layout className="w-5 h-5 text-blue-500" />
                <h4 className="font-bold text-lg text-zinc-900 dark:text-white">تفضيلات التوليد (AI Preferences)</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-2">Landing Pages Layout</label>
                  <select value={editingKit.generationPreferences.landingPages} onChange={e => setEditingKit({...editingKit, generationPreferences: {...editingKit.generationPreferences, landingPages: e.target.value}})} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-sm">
                    {['Minimal Layout', 'Sales Layout', 'Product Showcase', 'Long-form Layout'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-2">Creatives Style</label>
                  <select value={editingKit.generationPreferences.creatives} onChange={e => setEditingKit({...editingKit, generationPreferences: {...editingKit.generationPreferences, creatives: e.target.value}})} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-sm">
                    {['UGC', 'Studio', 'Lifestyle', 'Product Focused'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
          </div>

          {/* Sticky Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-3xl p-6 overflow-hidden">
              <h4 className="text-sm font-bold text-zinc-500 mb-4 tracking-wider uppercase text-center">Live Preview</h4>
              
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-black/5 overflow-hidden transition-all duration-300" style={{ backgroundColor: editingKit.colors.background }}>
                <div className="p-6">
                   <div style={{ fontFamily: editingKit.typography.heading, color: editingKit.colors.primary }} className="font-black text-2xl mb-2 text-center">
                     {editingKit.name || 'Brand Name'}
                   </div>
                   <p style={{ fontFamily: editingKit.typography.body, color: editingKit.colors.secondary }} className="text-sm text-center mb-6 opacity-80">
                     {editingKit.description || 'This is how your brand typography and colors will look in generated content.'}
                   </p>
                   <button style={{ backgroundColor: editingKit.colors.accent, color: '#fff' }} className="w-full py-3 rounded-xl font-bold shadow-sm transition-transform hover:scale-105 active:scale-95">
                     Call To Action
                   </button>
                </div>
                
                <div className="bg-gradient-to-t from-black/5 to-transparent h-12 w-full mt-auto" />
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                 <span className="px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400">Tone: {editingKit.voice.primary}</span>
                 <span className="px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400">{editingKit.generationPreferences.landingPages}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#09090b] dark:text-white mb-2">إدارة الهوية البصرية (Brand Kits)</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">قم بإعداد الهوية لعلاماتك التجارية لتضمن توافق مخرجات الذكاء الاصطناعي مع ألوانك ونبرتك دائماً.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create with AI Card */}
        <div className="bg-gradient-to-br from-[#09090b]/10 to-[#F0B21B]/10 border border-[#09090b]/20 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#09090b]/20 rounded-full blur-2xl group-hover:bg-[#09090b]/30 transition-all"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm text-[#09090b]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#09090b] dark:text-white text-lg">توليد بالذكاء الاصطناعي</h4>
              <p className="text-xs text-zinc-500">سريع وذكي</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-3">
             <textarea 
               value={aiPrompt}
               onChange={e => setAiPrompt(e.target.value)}
               placeholder="وصف البراند (مثال: براند ملابس شبابية ألوان أسود وأصفر ونبرة حماسية...)"
               rows={3}
               className="w-full px-4 py-3 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm focus:ring-2 focus:ring-[#09090b]/50 outline-none resize-none backdrop-blur-sm"
             />
             <button 
               onClick={handleAIGenerate}
               disabled={isGenerating || !aiPrompt.trim()}
               className="w-full py-2.5 bg-[#09090b] hover:bg-[#18181b] text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
             >
               {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wand2 className="w-4 h-4" />}
               توليد البراند
             </button>
          </div>
        </div>

        {/* Create Custom Card */}
        <div 
          onClick={handleCreateNew}
          className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#F0B21B] dark:hover:border-[#F0B21B] rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-900/20 group min-h-[220px]"
        >
           <div className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <Plus className="w-6 h-6 text-[#F0B21B]" />
           </div>
           <h4 className="font-bold text-[#09090b] dark:text-white text-lg mb-1">إضافة يدوية (Custom)</h4>
           <p className="text-sm text-zinc-500 px-4">قم بتخصيص الألوان، والخطوط، ونبرة الصوت بالتفصيل.</p>
        </div>

        {/* Existing Brand Kits */}
        {brandKits.map(kit => (
          <div key={kit.id} className={`bg-white dark:bg-zinc-900 border ${kit.isActive ? 'border-[#09090b] ring-2 ring-[#09090b]/20' : 'border-zinc-200 dark:border-zinc-800'} rounded-3xl p-6 flex flex-col shadow-sm transition-all hover:shadow-md relative group`}>
            {kit.isActive && (
               <div className="absolute -top-3 -right-3 bg-[#F0B21B] text-[#09090b] rounded-full p-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
               </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-xl text-zinc-900 dark:text-white line-clamp-1">{kit.name}</h4>
                <div className="flex gap-1">
                   {['primary', 'secondary', 'accent'].map((k) => (
                     <div key={k} className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: kit.colors?.[k] || '#ccc' }} />
                   ))}
                </div>
              </div>
              <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{kit.description || 'لا يوجد وصف.'}</p>
              
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg w-fit mb-4">
                 <MessageSquare className="w-3 h-3" /> {kit.voice?.primary || 'Normal'}
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
               {!kit.isActive ? (
                 <button onClick={() => handleSetActive(kit.id)} className="text-sm font-semibold text-[#09090b] hover:text-[#18181b]">تفعيل</button>
               ) : (
                 <span className="text-sm font-semibold text-zinc-400">مُفعّل حالياً</span>
               )}
               
               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleEdit(kit)} className="p-1.5 text-zinc-400 hover:text-[#09090b] dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-md">
                   <Settings2 className="w-4 h-4" />
                 </button>
                 <button onClick={(e) => handleDuplicate(kit, e)} className="p-1.5 text-zinc-400 hover:text-blue-500 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                   <Copy className="w-4 h-4" />
                 </button>
                 {deleteConfirmId === kit.id ? (
                   <div className="flex items-center gap-1">
                     <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }} className="p-1 text-xs text-zinc-500 hover:text-zinc-700 bg-zinc-200 dark:bg-zinc-700 rounded">
                       {t("Cancel")}
                     </button>
                     <button onClick={(e) => handleDelete(kit.id, e)} className="p-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded">
                       {t("Delete")}
                     </button>
                   </div>
                 ) : (
                   <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(kit.id); }} className="p-1.5 text-zinc-400 hover:text-red-500 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 )}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
