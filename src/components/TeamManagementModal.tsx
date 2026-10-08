import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Copy, Check, Eye, EyeOff, Shield, KeyRound, Sparkles, AlertCircle, Loader2, X, Activity, BarChart2, CheckCircle2 } from 'lucide-react';
import { TeamMember, getTeamMembersList, addTeamMember, removeTeamMember, updateAdminCredentials, changeMemberPassword, getSavedAdminCredentials, fetchAuthoritativeAdmin, ALL_TOOLS_PERMISSIONS } from '../services/teamAuth';
import { getTeamUsageBreakdown, getRecentLogins, MemberUsageSummary, LoginLogItem } from '../services/usageTracker';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
}

const TOOL_LABELS: Record<string, string> = {
  photoshoot: 'جلسة تصوير المنتج (Photoshoot)',
  landing: 'صفحات الهبوط Gemini',
  ads: 'إعلانات صور Gemini',
  script: 'اسكريبتات وفويس أوفر AI',
  fbAds: 'نصوص إعلانات فيسبوك وتيك توك',
  funnelCopy: 'محتوى صفحة المنتج كفانل',
  winnerAngle: 'إعادة توليد الوينر أنجل',
  videoScenes: 'اسكريبتات المشاهد وفويس أوفر',
  creativePrompts: 'أوامر التصاميم (Creative Prompts)',
  textOnVisual: 'نصوص ثابتة على الفيديوهات',
  smartAngles: 'الزوايا التسويقية الذكية',
  flowCharacter: 'تأسيس شخصية Flow'
};

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'admin-creds' | 'usage'>('members');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPasswordId, setShowPasswordId] = useState<string | null>(null);

  // New Member Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [selectedTools, setSelectedTools] = useState<string[]>(ALL_TOOLS_PERMISSIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Admin Credentials Form
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [isAdminSaving, setIsAdminSaving] = useState(false);

  // Member Password Change Modal
  const [editingPasswordMember, setEditingPasswordMember] = useState<TeamMember | null>(null);
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Activity & Usage Data
  const [usageData, setUsageData] = useState<MemberUsageSummary[]>([]);
  const [recentLogins, setRecentLogins] = useState<LoginLogItem[]>([]);
  const [isUsageLoading, setIsUsageLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
      loadAdminCreds();
    }
  }, [isOpen]);

  const loadAdminCreds = async () => {
    try {
      const creds = await fetchAuthoritativeAdmin();
      setAdminUsername(creds.email);
      setAdminPassword(creds.password);
      setAdminConfirmPassword(creds.password);
      setAdminName(creds.name || 'المدير العام');
    } catch {
      const creds = getSavedAdminCredentials();
      setAdminUsername(creds.email);
      setAdminPassword(creds.password);
      setAdminConfirmPassword(creds.password);
      setAdminName(creds.name || 'المدير العام');
    }
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const list = await getTeamMembersList();
      setMembers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsageStats = async () => {
    setIsUsageLoading(true);
    try {
      const [usage, logins] = await Promise.all([
        getTeamUsageBreakdown(members),
        getRecentLogins()
      ]);
      setUsageData(usage);
      setRecentLogins(logins);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUsageLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'usage' && members.length > 0) {
      loadUsageStats();
    }
  }, [activeTab, members]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!email.trim()) throw new Error('يرجى كتابة اسم المستخدم أو البريد');
      if (!password.trim()) throw new Error('يرجى كتابة كلمة المرور');

      await addTeamMember({
        name: name.trim() || email.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        permissions: selectedTools
      });

      showToast(`تم إنشاء حساب ${name || email} بنجاح!`);
      setName('');
      setEmail('');
      setPassword('');
      setSelectedTools(ALL_TOOLS_PERMISSIONS);
      await loadMembers();
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل في إنشاء الحساب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, memberName: string) => {
    if (!confirm(`هل أنت متأكد من حذف حساب ${memberName}؟`)) return;
    try {
      await removeTeamMember(id);
      showToast('تم حذف العضو بنجاح');
      await loadMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAdminCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword !== adminConfirmPassword) {
      setErrorMessage('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }
    setIsAdminSaving(true);
    setErrorMessage(null);
    try {
      await updateAdminCredentials(adminUsername, adminPassword, adminName);
      showToast('تم تحديث بيانات دخول المدير العام بنجاح! لن يعمل الحساب القديم بعد الآن.');
      await loadMembers();
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل في تحديث بيانات المدير');
    } finally {
      setIsAdminSaving(false);
    }
  };

  const handleUpdateMemberPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPasswordMember) return;
    setIsUpdatingPassword(true);
    try {
      await changeMemberPassword(editingPasswordMember.id, newMemberPassword);
      showToast(`تم تغيير كلمة المرور لـ ${editingPasswordMember.name} بنجاح!`);
      setEditingPasswordMember(null);
      setNewMemberPassword('');
      await loadMembers();
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل تغيير كلمة المرور');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCopyCredentials = (member: TeamMember) => {
    const text = `👋 مرحباً ${member.name}، إليك بيانات دخولك لمنظومة إعلانات الفريق:\n\n🔗 الرابط: ${window.location.origin}\n👤 اسم المستخدم / البريد: ${member.email}\n🔑 كلمة المرور: ${member.password}\n\nيرجى الاحتفاظ بها وتسجيل الدخول مباشرة.`;
    navigator.clipboard.writeText(text);
    setCopiedId(member.id);
    showToast('تم نسخ بيانات الدخول إلى الحافظة!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-alexandria animate-in fade-in duration-200" dir="rtl">
      <div className="bg-[#0e0a19] border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden text-white">
        
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5B800]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#482878]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#482878] to-[#1c0f33] border border-[#F5B800]/30 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-[#F5B800]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                لوحة إدارة فريق العمل والصلاحيات
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                إنشاء وتعديل حسابات الفريق، تعديل كلمات المرور، ومتابعة الاستهلاك والنشاط
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4 border-b border-zinc-800/80 flex gap-2 relative z-10 bg-[#090613]/50">
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'members'
                ? 'border-[#F5B800] text-[#F5B800]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>أعضاء الفريق ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('admin-creds')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'admin-creds'
                ? 'border-[#F5B800] text-[#F5B800]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>بيانات دخول المدير العام 👑</span>
          </button>

          <button
            onClick={() => setActiveTab('usage')}
            className={`pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'usage'
                ? 'border-[#F5B800] text-[#F5B800]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>سجل النشاط واستهلاك AI</span>
          </button>
        </div>

        {/* Toast & Error messages */}
        {toastMessage && (
          <div className="m-4 mb-0 p-3 bg-emerald-950/80 border border-emerald-700/80 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in z-20">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="m-4 mb-0 p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-center gap-2 animate-in fade-in z-20">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">

          {/* TAB 1: MEMBERS */}
          {activeTab === 'members' && (
            <>
              {/* Add Member Form */}
              <div className="bg-[#140e24]/80 border border-zinc-800/90 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
                  <UserPlus className="w-4 h-4 text-[#F5B800]" />
                  <span>إنشاء حساب جديد لعضو في الفريق</span>
                </h3>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1">اسم العضو</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: أحمد عادل"
                        className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-[#F5B800] rounded-xl text-xs text-white placeholder-zinc-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1">اسم المستخدم / البريد *</label>
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ahmed أو ahmed@team.com"
                        className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-[#F5B800] rounded-xl text-xs text-white placeholder-zinc-500 outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-bold text-zinc-300">كلمة المرور *</label>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="text-[10px] text-[#F5B800] hover:underline font-bold"
                        >
                          توليد عشوائي
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-[#F5B800] rounded-xl text-xs text-white placeholder-zinc-500 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-zinc-400 font-bold">الرتبة:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'editor'}
                          onChange={() => setRole('editor')}
                          className="accent-[#F5B800]"
                        />
                        <span>عضو فريق (محرر)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'viewer'}
                          onChange={() => setRole('viewer')}
                          className="accent-[#F5B800]"
                        />
                        <span>مشاهد فقط</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#F5B800] hover:bg-[#e0a800] text-[#09090b] font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>إنشاء حساب وتسليم البيانات</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-300">
                    قائمة حسابات الفريق الحالية ({members.length})
                  </h3>
                  <span className="text-[11px] text-zinc-500">
                    يمكنك نسخ بيانات الدخول أو تعديل كلمة المرور في أي وقت
                  </span>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-zinc-400 flex items-center justify-center gap-2 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-[#F5B800]" />
                    <span>جاري تحميل بيانات الفريق...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="p-4 bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            m.role === 'admin'
                              ? 'bg-gradient-to-br from-[#F5B800] to-amber-600 text-[#09090b] shadow-md shadow-amber-500/20'
                              : 'bg-zinc-800 text-zinc-200'
                          }`}>
                            {m.name[0] || m.email[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{m.name}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                m.role === 'admin'
                                  ? 'bg-[#F5B800]/15 text-[#F5B800] border border-[#F5B800]/30'
                                  : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                              }`}>
                                {m.role === 'admin' ? 'مدير عام 👑' : 'عضو فريق'}
                              </span>
                            </div>
                            <div className="text-xs text-zinc-400 flex items-center gap-3 mt-0.5">
                              <span>اسم الدخول: <strong className="text-zinc-200">{m.email}</strong></span>
                              <span className="text-zinc-600">•</span>
                              <span className="flex items-center gap-1 font-mono">
                                كلمة المرور: {showPasswordId === m.id ? (
                                  <span className="text-[#F5B800] font-bold">{m.password}</span>
                                ) : (
                                  '••••••••'
                                )}
                                <button
                                  type="button"
                                  onClick={() => setShowPasswordId(showPasswordId === m.id ? null : m.id)}
                                  className="text-zinc-500 hover:text-zinc-300 ml-1 cursor-pointer"
                                  title="عرض/إخفاء"
                                >
                                  {showPasswordId === m.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                          <button
                            onClick={() => handleCopyCredentials(m)}
                            className="px-3 py-1.5 bg-[#482878]/30 hover:bg-[#482878]/50 border border-[#482878]/60 text-purple-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="نسخ رسالة الترحيب وبيانات الدخول"
                          >
                            {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#F5B800]" />}
                            <span>نسخ البيانات</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingPasswordMember(m);
                              setNewMemberPassword('');
                            }}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="تغيير كلمة المرور لهذا العضو"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                            <span>تغيير المرور</span>
                          </button>

                          {m.role !== 'admin' && (
                            <button
                              onClick={() => handleDelete(m.id, m.name)}
                              className="p-2 text-zinc-500 hover:text-red-400 rounded-xl hover:bg-red-950/30 transition-colors cursor-pointer"
                              title="حذف العضو"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: ADMIN CREDENTIALS */}
          {activeTab === 'admin-creds' && (
            <div className="max-w-xl mx-auto space-y-6 py-2">
              <div className="bg-[#140e24]/90 border border-[#F5B800]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5B800] text-[#09090b] flex items-center justify-center font-bold">
                    👑
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      تعديل بيانات حساب المدير العام
                    </h3>
                    <p className="text-xs text-zinc-400">
                      يمكنك هنا تخصيص اسم المستخدم وكلمة المرور الخاصة بك كمدير للنظام
                    </p>
                  </div>
                </div>

                <div className="mb-5 p-3.5 bg-amber-950/40 border border-amber-800/50 rounded-xl text-xs text-amber-200 leading-relaxed">
                  ⚠️ <strong>تنبيه أمني:</strong> عند حفظ اسم المستخدم وكلمة المرور الجديدة، سيتم تعطيل حساب <code className="bg-black/40 px-1 py-0.5 rounded text-[#F5B800]">admin/admin</code> فوراً، ولن يتمكن أحد من الدخول إلا بالبيانات الجديدة التي تضعها هنا.
                </div>

                <form onSubmit={handleSaveAdminCreds} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      اسم المدير (الظاهر في النظام)
                    </label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="المدير العام"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-[#F5B800] rounded-xl text-sm text-white placeholder-zinc-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      اسم المستخدم أو البريد الإلكتروني الجديد للدخول *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="اسم المستخدم الجديد"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-[#F5B800] rounded-xl text-sm text-white placeholder-zinc-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      كلمة المرور الجديدة *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="كلمة مرور قوية"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-[#F5B800] rounded-xl text-sm text-white placeholder-zinc-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      تأكيد كلمة المرور الجديدة *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                      placeholder="أعد كتابة كلمة المرور"
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-[#F5B800] rounded-xl text-sm text-white placeholder-zinc-500 outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAdminSaving}
                    className="w-full py-3.5 bg-[#F5B800] hover:bg-[#e0a800] text-[#09090b] font-black rounded-xl text-sm transition-all shadow-xl shadow-[#F5B800]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isAdminSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>حفظ بيانات المدير الجديدة وتأمين النظام</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: USAGE & ACTIVITY */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#F5B800]" />
                    <span>إحصائيات استهلاك نماذج الذكاء الاصطناعي للفريق</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    متابعة استهلاك كل عضو من توكينز Gemini Flash و Gemini Pro والصور والفويس أوفر
                  </p>
                </div>
                <button
                  onClick={loadUsageStats}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs rounded-xl transition-colors font-bold text-zinc-300"
                >
                  تحديث البيانات
                </button>
              </div>

              {isUsageLoading ? (
                <div className="text-center py-12 text-zinc-400 flex items-center justify-center gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-[#F5B800]" />
                  <span>جاري حساب واحتساب الإحصائيات...</span>
                </div>
              ) : (
                <>
                  {/* Aggregated Table */}
                  <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/90">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#140e24] text-zinc-300 border-b border-zinc-800">
                        <tr>
                          <th className="p-3.5">العضو</th>
                          <th className="p-3.5">إجمالي الطلبات</th>
                          <th className="p-3.5">توكينز Gemini Flash</th>
                          <th className="p-3.5">توكينز Gemini Pro</th>
                          <th className="p-3.5">توليد الصور</th>
                          <th className="p-3.5">الفويس أوفر</th>
                          <th className="p-3.5">آخر تسجيل دخول</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {usageData.map((u) => (
                          <tr key={u.memberId} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="p-3.5 font-bold text-white">
                              {u.memberName}
                              <span className="block text-[10px] text-zinc-400 font-normal">{u.memberEmail}</span>
                            </td>
                            <td className="p-3.5 font-bold text-[#F5B800]">{u.totalRequests}</td>
                            <td className="p-3.5 font-mono text-zinc-300">{u.flashTokens.toLocaleString()}</td>
                            <td className="p-3.5 font-mono text-purple-300">{u.proTokens.toLocaleString()}</td>
                            <td className="p-3.5 text-zinc-300">{u.imageGenerations} صورة</td>
                            <td className="p-3.5 text-zinc-300">{u.voiceGenerations} صوت</td>
                            <td className="p-3.5 text-zinc-400 text-[11px]">
                              {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('ar-EG') : 'قيد الانتظار'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Recent Logins Timeline */}
                  <div className="bg-[#140e24]/80 border border-zinc-800 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-[#F5B800]" />
                      <span>سجل آخر تسجيلات الدخول للأعضاء</span>
                    </h4>

                    {recentLogins.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-3">لا توجد تسجيلات دخول مسجلة مؤخراً.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {recentLogins.slice(0, 15).map((l, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-950/60 rounded-xl text-xs border border-zinc-800/60">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              <span className="font-bold text-white">{l.memberName}</span>
                              <span className="text-zinc-500">({l.memberEmail})</span>
                            </div>
                            <span className="text-zinc-400 text-[11px]">
                              {new Date(l.loginAt).toLocaleString('ar-EG')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Member Password Change Sub-Modal */}
      {editingPasswordMember && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e0a19] border border-zinc-800 rounded-2xl p-6 w-full max-w-sm text-white shadow-2xl relative">
            <h3 className="text-sm font-black mb-1">
              تغيير كلمة المرور لـ {editingPasswordMember.name}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              أدخل كلمة المرور الجديدة لهذا العضو وسيتم حفظها فوراً
            </p>

            <form onSubmit={handleUpdateMemberPassword} className="space-y-4">
              <input
                type="text"
                required
                value={newMemberPassword}
                onChange={(e) => setNewMemberPassword(e.target.value)}
                placeholder="كلمة المرور الجديدة"
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-[#F5B800] rounded-xl text-xs text-white placeholder-zinc-500 outline-none font-mono"
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 py-2.5 bg-[#F5B800] text-[#09090b] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                >
                  {isUpdatingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'تحديث كلمة المرور'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPasswordMember(null)}
                  className="px-4 py-2.5 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-bold hover:text-white"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
