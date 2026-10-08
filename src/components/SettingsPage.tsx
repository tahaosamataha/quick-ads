import React, { useState, useEffect } from 'react';
import { User, CreditCard, Paintbrush, Link2, Users, CheckCircle2, ChevronRight, Download, Plus, Trash2, Camera, Upload, AlertCircle, Loader2, Shield, Edit, Save, Check, Settings, Activity } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { allocateTokensToMember } from '../services/billing';
import { handleFirestoreError, OperationType } from '../services/firestore-errors';
import BrandKitManager from './BrandKitManager';
import ActivityLogsTab from './ActivityLogsTab';

const UserRow = ({ user, handleUpdateAdminUser, savingRowId, setSavingRowId }: any) => {
  const [tokens, setTokens] = useState(user.tokens || 0);
  const [role, setRole] = useState(user.role || 'member');
  const [plan, setPlan] = useState(user.plan || 'Free');

  const isDirty = tokens !== user.tokens || role !== user.role || plan !== user.plan;
  
  const onSave = async () => {
      setSavingRowId(user.id);
      await handleUpdateAdminUser(user.id, tokens, role, plan);
      setSavingRowId(null);
  };

  useEffect(() => {
    setTokens(user.tokens || 0);
    setRole(user.role || 'member');
    setPlan(user.plan || 'Free');
  }, [user]);

  return (
      <tr className="bg-white dark:bg-zinc-900/50">
         <td className="p-3 font-medium text-zinc-900 dark:text-white">{user.email}</td>
         <td className="p-3">
            <select className="bg-transparent border border-zinc-200 dark:border-zinc-700 rounded p-1" value={role} onChange={e => setRole(e.target.value)}>
               <option value="member">Member</option>
               <option value="admin">Admin</option>
               <option value="owner">Owner</option>
            </select>
         </td>
         <td className="p-3">
            <select className="bg-transparent border border-zinc-200 dark:border-zinc-700 rounded p-1" value={plan} onChange={e => setPlan(e.target.value)}>
               <option value="Free">Free</option>
               <option value="Pro">Pro</option>
               <option value="Agency">Agency</option>
            </select>
         </td>
         <td className="p-3">
            <input type="number" className="w-24 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded p-1 outline-none" value={tokens} onChange={e => setTokens(Number(e.target.value))} />
         </td>
         <td className="p-3 text-emerald-600 font-medium whitespace-nowrap">
            {isDirty ? (
               <button onClick={onSave} disabled={savingRowId === user.id} className="flex items-center gap-1 bg-[#F0B21B] text-[#09090b] px-3 py-1 rounded text-xs font-bold hover:bg-[#DF9F10] disabled:opacity-50">
                  {savingRowId === user.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3" />} Save
               </button>
            ) : (
               <span className="flex items-center gap-1 text-zinc-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Saved</span>
            )}
         </td>
      </tr>
  );
};

const AdminTab = ({ allUsers, handleUpdateAdminUser }: { allUsers: any[], handleUpdateAdminUser: any }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const filteredUsers = allUsers.filter(u => u.email?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
  <div className="space-y-6">
    <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
      <div>
        <h3 className="text-xl font-bold text-[#09090b] dark:text-white mb-2">إدارة النظام والمستخدمين</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">تحكم بالرصيد والباقات والوصول لكل مستخدم.</p>
      </div>
      <div className="relative">
         <input 
           type="text" 
           value={searchQuery}
           onChange={e => setSearchQuery(e.target.value)}
           placeholder="ابحث بالايميل..."
           className="pl-4 pr-10 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none transition-colors text-sm w-full sm:w-64"
         />
      </div>
    </div>
    
    <div className="overflow-x-auto">
       <table className="w-full text-left text-sm border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
             <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Tokens</th>
                <th className="p-3">Actions</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
             {filteredUsers.map((u) => (
                <UserRow key={u.id} user={u} handleUpdateAdminUser={handleUpdateAdminUser} savingRowId={savingRowId} setSavingRowId={setSavingRowId} />
             ))}
          </tbody>
       </table>
    </div>
  </div>
  );
};

const TeamMemberRow = ({ member, onRemove, onUpdate }: { member: any, onRemove: (id: string) => void, onUpdate: (member: any, data: any) => void }) => {
  const [role, setRole] = useState(member.role || 'editor');
  const [permissions, setPermissions] = useState<string[]>(member.permissions || []);
  const [password, setPassword] = useState(member.password || '123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    setRole(member.role || 'editor');
    setPermissions(member.permissions || []);
    setPassword(member.password || '123456');
  }, [member]);

  const allTools = [
    { id: 'photoshoot', label: 'جلسة تصوير المنتج (Photoshoot)' },
    { id: 'landing', label: 'صفحات الهبوط Gemini' },
    { id: 'ads', label: 'إعلانات صور Gemini' },
    { id: 'script', label: 'اسكريبتات وفويس اوفر AI' },
    { id: 'fbAds', label: 'نصوص إعلانات فيسبوك وتيك توك' },
    { id: 'funnelCopy', label: 'محتوى صفحة المنتج كفانل' },
    { id: 'winnerAngle', label: 'إعادة توليد الوينر أنجل' },
    { id: 'videoScenes', label: 'اسكريبتات المشاهد وفويس اوفر' },
    { id: 'creativePrompts', label: 'أوامر التصاميم (Creative Prompts)' },
    { id: 'textOnVisual', label: 'نصوص ثابتة على الفيديوهات' }
  ];

  const handleTogglePermission = (toolId: string) => {
    if (permissions.includes(toolId)) {
      setPermissions(permissions.filter(p => p !== toolId));
    } else {
      setPermissions([...permissions, toolId]);
    }
  };

  const handleCopyCredentials = () => {
    const text = `بيانات دخول منصة الإعلانات:\nاسم المستخدم / الإيميل: ${member.email}\nكلمة المرور: ${password}\nالرابط: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const isPermissionsDirty = () => {
    if (!member.permissions || permissions.length !== member.permissions.length) return true;
    return !permissions.every((p: string) => member.permissions.includes(p));
  };
  const isDirty = role !== member.role || isPermissionsDirty() || password !== member.password;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(member, { role, permissions, password });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <div className="font-bold text-lg text-zinc-900 dark:text-white">{member.name || member.email}</div>
                <div className="text-xs text-zinc-500 font-mono">{member.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="text-xs bg-[#F0B21B]/15 hover:bg-[#F0B21B]/25 text-[#B88006] dark:text-[#F0B21B] border border-[#F0B21B]/30 px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="نسخ بيانات الدخول"
              >
                {isCopied ? <span>تم النسخ ✓</span> : <span>نسخ بيانات الدخول 📋</span>}
              </button>
              <button 
                onClick={() => onRemove(member.id)}
                className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg transition-colors"
                title="حذف العضو"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">الدور الوظيفي</label>
              <select 
                value={role} 
                onChange={e => setRole(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2 outline-none text-sm"
              >
                <option value="editor">محرر (Editor)</option>
                <option value="viewer">مشاهد (Viewer)</option>
                <option value="admin">مدير (Admin)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">كلمة مرور العضو (Password)</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2 pr-3 pl-10 outline-none text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? 'إخفاء' : 'عرض'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">صلاحيات الأدوات</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPermissions(allTools.map(t => t.id))}
                  className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded hover:bg-zinc-200 transition-colors"
                >
                  الكل
                </button>
                <button 
                  onClick={() => setPermissions([])}
                  className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded hover:bg-zinc-200 transition-colors"
                >
                  لا شيء
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {allTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => handleTogglePermission(tool.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    permissions.includes(tool.id)
                      ? 'bg-[#09090b]/10 border-[#09090b] text-[#09090b]'
                      : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    permissions.includes(tool.id) ? 'bg-[#09090b] border-[#09090b]' : 'border-zinc-300 dark:border-zinc-600'
                  }`}>
                    {permissions.includes(tool.id) && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  {tool.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {isDirty && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#F0B21B] hover:bg-[#DF9F10] text-[#09090b] px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات للصلاحيات
          </button>
        </div>
      )}
    </div>
  );
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'billing' | 'brands' | 'integrations' | 'team' | 'admin' | 'logs'>('account');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [brandKits, setBrandKits] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  
  // Generating Brand Kit State
  const [isGeneratingBrand, setIsGeneratingBrand] = useState(false);
  const [brandKitPrompt, setBrandKitPrompt] = useState("");

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadUserData(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser || !userProfile) return;
    
    // Fetch team members
    if (userProfile.plan === 'Agency' || userProfile.plan === 'Team' || userProfile.role === 'owner') {
      const teamQ = query(collection(db, 'agencyTeams'), where('agencyId', '==', currentUser.uid));
      getDocs(teamQ).then((snap: any) => {
        setTeamMembers(snap.docs.map((d: any) => ({id: d.id, ...d.data()})));
      }).catch((error) => {
        handleFirestoreError(error, OperationType.LIST, 'agencyTeams');
      });
    }
  }, [currentUser, userProfile]);

  const loadUserData = async (uid: string) => {
    try {
      // Load user profile
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef).catch(err => {
        handleFirestoreError(err, OperationType.GET, 'users/' + uid);
        throw err;
      });
      let pData: any = null;
      if (userSnap.exists()) {
         pData = { id: userSnap.id, ...userSnap.data() };
         if (auth.currentUser?.email?.includes('admin') && pData.role !== 'owner') {
             pData.role = 'owner';
             await updateDoc(userRef, { role: 'owner' }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'users/' + uid));
         }
         setUserProfile(pData);
      } else {
         pData = {
           uid,
           email: auth.currentUser?.email || '',
           name: auth.currentUser?.displayName || '',
           role: (auth.currentUser?.email?.includes('admin')) ? 'owner' : 'member',
           language: 'ar',
           plan: 'Free',
           
           createdAt: new Date().toISOString()
         };
         await setDoc(userRef, pData).catch(err => handleFirestoreError(err, OperationType.CREATE, 'users/' + uid));
         setUserProfile(pData);
      }

      if (pData.role === 'admin' || pData.role === 'owner') {
        const usersSnap = await getDocs(collection(db, 'users')).catch(err => {
            handleFirestoreError(err, OperationType.LIST, 'users');
            throw err;
        });
        const uList = usersSnap.docs.map(d => ({id: d.id, ...d.data()}));
        setAllUsers(uList);
      }

      // Load brand kits
      const kitsQ = query(collection(db, 'brandKits'), where('userId', '==', uid));
      const kitsSnap = await getDocs(kitsQ).catch(err => {
          handleFirestoreError(err, OperationType.LIST, 'brandKits');
          throw err;
      });
      setBrandKits(kitsSnap.docs.map(d => ({id: d.id, ...d.data()})));

      // Integrations
      const intQ = query(collection(db, 'integrations'), where('userId', '==', uid));
      const intSnap = await getDocs(intQ).catch(err => {
          handleFirestoreError(err, OperationType.LIST, 'integrations');
          throw err;
      });
      setIntegrations(intSnap.docs.map(d => ({id: d.id, ...d.data()})));

      // Team Members fetch removed, handled by reactive onSnapshot
    } catch (err: any) {
      if (!String(err).includes('Quota')) console.error(err);
      if (!err.message?.includes('Firestore Error') && !String(err).includes('Quota')) {
        showToast('Error loading settings', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: userProfile.name,
        language: userProfile.language
      });
      showToast('Profile updated successfully');
    } catch {
      showToast('Error updating profile', 'error');
    }
  };

  const handleIntegrate = async (platform: string, connect: boolean) => {
    try {
      if (connect) {
        await addDoc(collection(db, 'integrations'), {
          platform,
          userId: currentUser.uid,
          status: 'Connected',
          account_id: Math.floor(Math.random()*1000000000).toString(),
        });
      } else {
        const intToDel = integrations.find(i => i.platform === platform);
        if (intToDel) {
           await deleteDoc(doc(db, 'integrations', intToDel.id));
        }
      }
      await loadUserData(currentUser.uid);
      showToast(`${platform} ${connect ? 'connected' : 'disconnected'} `);
    } catch {
      showToast(`Error ${connect ? 'connecting' : 'disconnecting'} ${platform}`, 'error');
    }
  };

  const handleGenerateBrandKit = async () => {
     if(!brandKitPrompt.trim()) return;
     setIsGeneratingBrand(true);
     try {
       // Mock AI generation for brand kit
       const newColors = ['#1a1a1a', '#ffffff', '#09090b', '#F0B21B'];
       const kit = {
         userId: currentUser.uid,
         name: brandKitPrompt,
         industry: 'E-commerce',
         colors: newColors,
         tone: 'Professional and Bold',
         style: 'Minimalist Modern',
         isActive: brandKits.length === 0,
         createdAt: new Date().toISOString()
       };
       await addDoc(collection(db, 'brandKits'), kit);
       setBrandKitPrompt("");
       await loadUserData(currentUser.uid);
       showToast('Brand Kit Generated successfully!');
     } catch (e) {
       showToast('Error generating brand kit', 'error');
     } finally {
       setIsGeneratingBrand(false);
     }
  };

  const setBrandKitActive = async (id: string) => {
     try {
       // Set all false
       for (const kit of brandKits) {
          if (kit.isActive) {
            await updateDoc(doc(db, 'brandKits', kit.id), { isActive: false });
          }
       }
       await updateDoc(doc(db, 'brandKits', id), { isActive: true });
       await loadUserData(currentUser.uid);
       showToast('Brand Kit Applied to Application');
     } catch(e) {
       showToast('Error applying brand kit', 'error');
     }
  };
  
  const handleUpdateAdminUser = async (uId: string, tokens: number, role: string, plan: string) => {
      try {
         await updateDoc(doc(db, 'users', uId), {
            tokens: Number(tokens),
            role,
            plan
         });
         await loadUserData(currentUser.uid);
         showToast('User updated successfully');
      } catch (e) {
         showToast('Error updating user', 'error');
      }
  };

  const handleUpdateTeamMember = async (member: any, data: any) => {
    try {
      await updateDoc(doc(db, 'agencyTeams', member.id), data);
      await loadUserData(currentUser.uid); // Refresh
      showToast('تم تحديث بيانات العضو بنجاح');
    } catch (e: any) {
      console.error("Update Error:", e);
      showToast('خطأ في التحديث', 'error');
    }
  };

  const handleRemoveTeamMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'agencyTeams', id));
      showToast('تم حذف العضو بنجاح');
    } catch (e: any) {
      console.error("Delete Error:", e);
      showToast('خطأ في حذف العضو', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#09090b]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto w-full">
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white ${toast.type === 'success' ? 'bg-[#F0B21B] text-[#09090b]' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
        <h2 className="text-xl font-bold text-[#09090b] dark:text-white mb-4 px-3">الإعدادات</h2>
        {[
          { id: 'account', icon: User, label: 'الحساب' },
          { id: 'billing', icon: CreditCard, label: 'الباقات والاشتراك' },
          { id: 'brands', icon: Paintbrush, label: 'تطبيق البراند كيت' },
          { id: 'integrations', icon: Link2, label: 'الربط مع المنصات' },
          ...(userProfile?.plan === 'Agency' || userProfile?.plan === 'Team' || userProfile?.role === 'owner' ? [{ id: 'team', icon: Users, label: 'فريق العمل (Agency)' }] : []),
          ...(userProfile?.role === 'admin' || userProfile?.role === 'owner' ? [
            { id: 'admin', icon: Shield, label: 'إدارة المستخدمين' },
            { id: 'logs', icon: Activity, label: 'سجل النشاطات' }
          ] : [])
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#09090b]/10 text-[#09090b]'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-[#09090b] dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-0 bg-white dark:bg-[#09090b]/50 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 md:p-8 min-h-[60vh]">
        
        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-[#09090b] dark:text-white mb-6">خطة العمل والاشتراك</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
               <div className="bg-[#482878]/10 border border-[#482878]/30 p-6 rounded-2xl">
                  <h4 className="text-sm font-semibold text-[#482878] dark:text-purple-300 mb-1">الرصيد والاستهلاك</h4>
                  <div className="text-3xl font-black text-[#F5B800]">غير محدود ⚡ <span className="text-base text-zinc-400 font-medium">(Unlimited)</span></div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">تم إلغاء نظام التوكينز وتفعيل الوصول الكامل غير المحدود لجميع أعضاء الفريق المعتمدين.</p>
               </div>
               <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl">
                  <h4 className="text-sm font-semibold text-zinc-500 mb-1">حالة الحساب</h4>
                  <div className="text-3xl font-black text-[#09090b] dark:text-white">باقة الفريق الحصرية 👑</div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">وصول كامل لجميع أدوات الذكاء الاصطناعي وجلسات التصوير والاسكريبتات وصفحات الهبوط.</p>
               </div>
            </div>

            <div className="bg-gradient-to-r from-[#482878]/20 via-[#F5B800]/10 to-transparent p-6 rounded-2xl border border-zinc-800">
               <h4 className="text-lg font-bold text-white mb-3">مميزات منظومة الفريق:</h4>
               <ul className="grid sm:grid-cols-2 gap-3 text-sm text-zinc-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#F5B800]" /> توليد صور وفيديوهات بلا قيود</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#F5B800]" /> اسكريبتات وفويس أوفر فوري</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#F5B800]" /> صفحات هبوط ذكية متكاملة</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#F5B800]" /> إدارة أعضاء الفريق والصلاحيات بسهولة</li>
               </ul>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && userProfile && (
          <form onSubmit={handleUserUpdate} className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-xl font-bold text-[#09090b] dark:text-white mb-1">تفاصيل الحساب</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={userProfile.name || ''}
                  onChange={e => setUserProfile({...userProfile, name: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={userProfile.email}
                  disabled
                  className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Language</label>
                <select
                  value={userProfile.language || 'en'}
                  onChange={e => setUserProfile({...userProfile, language: e.target.value})}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none transition-colors"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  مفتاح الذكاء الاصطناعي (Gemini API Key)
                </label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  مطلوب للتوليد على الاستضافات الخارجية مثل Cloudflare Pages. يمكنك الحصول عليه مجاناً من Google AI Studio.
                </p>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  defaultValue={localStorage.getItem('gemini_api_key') || ''}
                  onChange={(e) => {
                    localStorage.setItem('gemini_api_key', e.target.value.trim());
                  }}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#09090b]/50 outline-none transition-colors text-sm"
                />
              </div>
            </div>
            <button type="submit" className="px-6 py-2.5 bg-[#F0B21B] hover:bg-[#DF9F10] text-[#09090b] font-bold rounded-xl transition-colors shadow-sm">
              Save Changes
            </button>
          </form>
        )}

        {/* Brand Kits Tab */}
        {activeTab === 'brands' && (
          <BrandKitManager 
            brandKits={brandKits} 
            currentUser={currentUser} 
            onRefresh={() => loadUserData(currentUser.uid)} 
            showToast={showToast} 
          />
        )}

        {/* Team / Agency Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#09090b] dark:text-white mb-2">إدارة فريق العمل (Agency)</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">يمكنك إضافة ما يصل إلى عضوين لفريقك ومشاركة الرصيد والصلاحيات معهم.</p>
            </div>
            
            <div className="bg-[#09090b]/10 border border-[#09090b]/20 rounded-2xl p-6">
               <h4 className="font-bold text-[#09090b] dark:text-white mb-2">إضافة عضو جديد للفريق</h4>
               <p className="text-xs text-zinc-500 mb-4">أنشئ بيانات الدخول (البريد وكلمة المرور) للعضو لتسليمها له مباشرة للوصول للمنصة.</p>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <input type="text" placeholder="اسم العضو (مثال: أحمد)..." className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none text-xs" id="invite-name" />
                  <input type="text" placeholder="اسم المستخدم أو الإيميل..." className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none text-xs" id="invite-email" />
                  <input type="text" placeholder="كلمة المرور..." className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none text-xs font-mono" id="invite-password" defaultValue="123456" />
                  <select className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none text-xs" id="invite-role">
                     <option value="editor">محرر (Editor)</option>
                     <option value="viewer">مشاهد (Viewer)</option>
                     <option value="admin">مدير (Admin)</option>
                  </select>
               </div>
               <button 
                 onClick={async () => {
                    const nameInput = document.getElementById('invite-name') as HTMLInputElement;
                    const emailInput = document.getElementById('invite-email') as HTMLInputElement;
                    const passwordInput = document.getElementById('invite-password') as HTMLInputElement;
                    const roleInput = document.getElementById('invite-role') as HTMLSelectElement;
                    const email = emailInput?.value.trim();
                    const password = passwordInput?.value.trim() || '123456';
                    const name = nameInput?.value.trim() || email?.split('@')[0] || 'عضو';
                    if (!email) {
                      showToast('يرجى إدخال اسم المستخدم أو البريد', 'error');
                      return;
                    }
                    
                    try {
                       await addDoc(collection(db, 'agencyTeams'), {
                           agencyId: currentUser.uid,
                           name,
                           email: email.toLowerCase(),
                           password,
                           role: roleInput?.value,
                           permissions: ['photoshoot', 'landing', 'ads', 'script', 'fbAds', 'funnelCopy', 'winnerAngle', 'videoScenes', 'creativePrompts', 'textOnVisual'],
                           addedAt: new Date().toISOString()
                       });
                       showToast(`تم إنشاء حساب ${name} بنجاح! كلمة المرور: ${password}`);
                       if (nameInput) nameInput.value = '';
                       if (emailInput) emailInput.value = '';
                       await loadUserData(currentUser.uid);
                    } catch(e: any) {
                       showToast('حدث خطأ أثناء الإضافة', 'error');
                    }
                 }}
                 className="px-6 py-2.5 bg-[#F0B21B] hover:bg-[#DF9F10] text-[#09090b] font-bold rounded-xl text-xs transition-colors shadow-sm"
               >
                  ➕ إضافة وإنشاء حساب العضو
               </button>
            </div>

            <div className="mt-8">
               <h4 className="font-bold text-[#09090b] dark:text-white mb-4">الأعضاء الحاليين</h4>
               {teamMembers.length > 0 ? (
                 <div className="space-y-4">
                   {teamMembers.map(member => (
                     <TeamMemberRow 
                        key={member.id} 
                        member={member} 
                        onUpdate={handleUpdateTeamMember}
                        onRemove={handleRemoveTeamMember}
                     />
                   ))}
                 </div>
               ) : (
                 <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
                    <Users className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                    <p>لا يوجد أعضاء في فريقك حتى الآن.</p>
                    <p className="text-xs mt-1">قم بإضافة أعضاء بالأعلى للاستفادة من خطة الوكالة.</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && (
          <AdminTab allUsers={allUsers} handleUpdateAdminUser={handleUpdateAdminUser} />
        )}

        {activeTab === 'logs' && (
          <ActivityLogsTab allUsers={allUsers} />
        )}

      </div>
    </div>
  );
}
