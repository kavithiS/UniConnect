import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { registerUser, setAuthToken } from '../../services/authService';

function RegisterPage({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const checks = [
      { id: 1, label: 'Capital Letter', test: /[A-Z]/.test(pwd) },
      { id: 2, label: 'Lowercase', test: /[a-z]/.test(pwd) },
      { id: 3, label: 'Number', test: /[0-9]/.test(pwd) },
      { id: 4, label: 'Special Symbol', test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
      { id: 5, label: '8+ Characters', test: pwd.length >= 8 }
    ];
    return checks;
  };

  const passwordChecks = validatePassword(password);
  const isPasswordValid = passwordChecks.every(check => check.test);
  const passStrength = (passwordChecks.filter(c => c.test).length / 5) * 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isPasswordValid) {
      setError('Please meet all security requirements');
      return;
    }

    setLoading(true);

    try {
      await registerUser({ email, password });
      setSuccess('Account created! Initializing profile...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }} />

      <div className="w-full max-w-xl relative">
        <div className="absolute -top-6 left-8 z-20">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md">
            <ShieldCheck size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">Safe & Secure</span>
          </div>
        </div>

        <div className="relative rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
          <div className="mb-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] mb-6 transition-transform hover:rotate-3">
              <div className="w-full h-full rounded-2xl bg-[#020617]/80 flex items-center justify-center">
                <UserPlus size={28} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Register
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Create your account to start</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/5 bg-white/[0.04] pl-14 pr-6 py-4 outline-none transition-all focus:border-indigo-500/30 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="student@university.edu"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/5 bg-white/[0.04] pl-14 pr-6 py-4 outline-none transition-all focus:border-indigo-500/30 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/5 bg-white/[0.04] pl-14 pr-6 py-4 outline-none transition-all focus:border-indigo-500/30 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="Repeat"
                  />
                </div>
              </div>
            </div>

            {/* Security Indicator */}
            <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                <span className="text-slate-500">Password Strength</span>
                <span className={passStrength === 100 ? 'text-emerald-400' : 'text-indigo-400'}>{passStrength.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${passStrength === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-indigo-500 to-blue-400'}`}
                  style={{ width: `${passStrength}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {passwordChecks.map(check => (
                  <div key={check.id} className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-md flex items-center justify-center transition-colors ${check.test ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-600'}`}>
                      <CheckCircle2 size={10} strokeWidth={3} />
                    </div>
                    <span className={`text-[10px] font-bold ${check.test ? 'text-slate-300' : 'text-slate-500'}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-400 text-sm">
                <AlertCircle size={16} />
                <span className="font-semibold">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-sm">
                <CheckCircle2 size={16} />
                <span className="font-semibold">{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-[58px] overflow-hidden rounded-2xl bg-white text-slate-950 font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-3 border-indigo-500/30 border-t-indigo-600 mx-auto" />
              ) : (
                <div className="flex items-center justify-center gap-3">
                  Sign Up
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
                </div>
              )}
            </button>
          </form>

          <p className="mt-10 text-center">
            <Link to="/login" className="group text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
              Already have an account? <span className="text-indigo-400 group-hover:ml-1 transition-all underline decoration-indigo-400/30 underline-offset-4">Sign In</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
