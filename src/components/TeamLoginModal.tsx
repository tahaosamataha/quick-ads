import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { authenticateTeamMember, TeamMember, DEFAULT_ADMIN_USERS } from '../services/teamAuth';

interface TeamLoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (member: TeamMember) => void;
}

export const TeamLoginModal: React.FC<TeamLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const member = await authenticateTeamMember(identifier, password);
      onSuccess(member);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء تسجيل الدخول.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminLogin = async (adminUser: TeamMember) => {
    setIdentifier(adminUser.email);
    setPassword(adminUser.password);
    setIsLoading(true);
    try {
      const member = await authenticateTeamMember(adminUser.email, adminUser.password);
      onSuccess(member);
      if (onClose) onClose();
    } catch (err: any) {
      setError(err?.message || 'فشل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="bg-[#09090b] border border-zinc-800 text-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden font-alexandria">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F0B21B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#F0B21B]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-zinc-800 mb-3 text-[#F0B21B] shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            تسجيل دخول الفريق
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            أدخل اسم المستخدم وكلمة المرور المسلمة لك من الإدارة
          </p>
        </div>

        {/* Notice: No Public Registration */}
        <div className="mb-5 p-3.5 bg-[#F0B21B]/10 border border-[#F0B21B]/25 rounded-2xl text-xs text-[#F0B21B] flex items-start gap-2.5 leading-relaxed">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            هذا النظام خاص بفريق العمل ومغلق عن التسجيل العام. يتم إنشاء الحسابات وتوزيع بيانات الدخول من قبل مدير النظام فقط.
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="مثال: ahmed أو ahmed@team.com"
                className="w-full pl-4 pr-10 py-3 bg-zinc-900 border border-zinc-800 focus:border-[#F0B21B] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors"
              />
              <User className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-zinc-900 border border-zinc-800 focus:border-[#F0B21B] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3.5 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-[#F0B21B] hover:bg-[#d99e12] active:scale-[0.99] disabled:opacity-50 text-[#09090b] font-black rounded-xl text-sm transition-all shadow-lg shadow-[#F0B21B]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التحقق...</span>
              </>
            ) : (
              <>
                <span>دخول إلى المنصة</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Admin Access */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center relative z-10">
          <p className="text-[11px] text-zinc-500 mb-2.5">
            للمسؤولين والمدراء: دخول سريع بحساب المدير الافتراضي
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickAdminLogin(DEFAULT_ADMIN_USERS[0])}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-[#F0B21B] rounded-lg transition-colors font-medium cursor-pointer"
            >
              👑 دخول كـ مدير (admin / admin)
            </button>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
