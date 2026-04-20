import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, LogIn, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { loginUser, setAuthToken } from '../../services/authService';

function LoginPage({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = await loginUser({ email: normalizedEmail, password });
      setAuthToken(data.token);
      onAuthSuccess(data.user);

      if (data.user.profileCompleted) {
        navigate('/dashboard/home');
      } else {
        navigate('/profile-setup');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-600/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-lg relative">
        {/* Decorative Badge */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md shadow-lg">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">Student Portal</span>
          </div>
        </div>

        <div className="relative rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl p-10 md:p-14 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Internal Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="mb-12 text-center text-center">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 p-[1px] mb-8 shadow-2xl transition-transform hover:scale-105 duration-500">
                <div className="w-full h-full rounded-3xl bg-[#020617]/90 flex items-center justify-center backdrop-blur-sm">
                  <LogIn size={32} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Welcome</span>
                <span className="text-indigo-400 ml-2">Back</span>
              </h1>
              <p className="text-slate-400 mt-4 font-medium">Log in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="group space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/5 bg-white/[0.03] pl-14 pr-6 py-4.5 outline-none transition-all focus:border-indigo-400/30 focus:bg-white/[0.06] focus:ring-[6px] focus:ring-indigo-500/10 text-[15px]"
                    placeholder="student@campus.edu"
                  />
                </div>
              </div>

              <div className="group space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">
                    Password
                  </label>
                  <Link to="#" className="text-xs font-bold text-indigo-400/80 hover:text-indigo-300 transition-all border-b border-transparent hover:border-indigo-400/30">
                    Forgot Key?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                    <LockKeyhole size={20} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/5 bg-white/[0.03] pl-14 pr-6 py-4.5 outline-none transition-all focus:border-indigo-400/30 focus:bg-white/[0.06] focus:ring-[6px] focus:ring-indigo-500/10 text-[15px]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-1 rounded-lg bg-rose-500/10">
                    <AlertCircle size={16} />
                  </div>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-[60px] overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-[1px] shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
              >
                <div className="relative h-full w-full rounded-2xl bg-[#020617]/10 flex items-center justify-center transition-all group-hover:bg-transparent">
                  {loading ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                  ) : (
                    <div className="flex items-center justify-center gap-3 font-bold text-white tracking-wide">
                      Sign In
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1.5 duration-300" />
                    </div>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-12 text-center relative">
              <div className="absolute left-0 top-1/2 w-full h-[1px] bg-white/5" />
              <span className="relative px-4 bg-[#020617] text-xs font-bold text-slate-500 uppercase tracking-[0.2em] z-10">New here?</span>
              <p className="mt-6">
                <Link to="/register" className="group text-sm font-bold text-slate-400 hover:text-white transition-all inline-flex items-center gap-2">
                  Create an account
                  <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
