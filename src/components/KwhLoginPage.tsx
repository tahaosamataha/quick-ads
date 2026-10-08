import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { authenticateTeamMember, TeamMember } from '../services/teamAuth';

interface KwhLoginPageProps {
  onLoginSuccess: (member: TeamMember) => void;
}

export const KwhLoginPage: React.FC<KwhLoginPageProps> = ({
  onLoginSuccess
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const member = await authenticateTeamMember(identifier, password);
      onLoginSuccess(member);
    } catch (err: any) {
      setError(err?.message || 'بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07050d] text-white flex flex-col justify-center items-center p-4 font-alexandria relative overflow-hidden select-none" dir="rtl">
      {/* Background Ambient Luxury Glow */}
      <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-[#482878]/30 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-[#F5B800]/15 rounded-full blur-[170px] pointer-events-none" />

      {/* Main Centered Login Card */}
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="bg-[#0e0a19]/95 border border-zinc-800/90 rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden">
          
          {/* Subtle Card Glow Highlights */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#F5B800]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#482878]/30 rounded-full blur-2xl pointer-events-none" />

          {/* Brand Logo & Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="w-18 h-18 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#482878] to-[#1c0f33] border border-[#F5B800]/40 flex items-center justify-center p-3 shadow-xl shadow-purple-950/60 ring-4 ring-black/40">
              <img src="/kwh-icon-yellow.svg" alt="خد وهات" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(245,184,0,0.6)]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              تسجيل الدخول للمنصة
            </h1>
            <p className="text-xs text-zinc-400 mt-2 font-medium">
              أدخل اسم المستخدم وكلمة المرور للمتابعة
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/80 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-center gap-2.5 animate-shake relative z-10">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="اسم المستخدم أو البريد"
                  className="w-full pl-4 pr-11 py-3.5 bg-zinc-950/90 border border-zinc-800 focus:border-[#F5B800] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  autoFocus
                />
                <User className="w-4 h-4 text-zinc-500 absolute right-3.5 top-4" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 bg-zinc-950/90 border border-zinc-800 focus:border-[#F5B800] rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute right-3.5 top-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-4 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-[#F5B800] hover:bg-[#e0a800] active:scale-[0.99] disabled:opacity-50 text-[#09090b] font-black rounded-xl text-sm transition-all shadow-xl shadow-[#F5B800]/25 flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق من الحساب...</span>
                </>
              ) : (
                <>
                  <span>دخول إلى المنصة</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Minimal Footer */}
        <div className="text-center mt-6 text-xs text-zinc-500">
          منظومة خد وهات الذكية &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
