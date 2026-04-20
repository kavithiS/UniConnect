import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
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
      { id: 1, label: 'At least one uppercase letter', test: /[A-Z]/.test(pwd) },
      { id: 2, label: 'At least one lowercase letter', test: /[a-z]/.test(pwd) },
      { id: 3, label: 'At least one number', test: /[0-9]/.test(pwd) },
      { id: 4, label: 'At least one special symbol (!@#$%^&*)', test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
      { id: 5, label: 'At least 8 characters long', test: pwd.length >= 8 }
    ];
    return checks;
  };

  const passwordChecks = validatePassword(password);
  const isPasswordValid = passwordChecks.every(check => check.test);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }

    setLoading(true);

    try {
      await registerUser({ email, password });
      setSuccess('Account created successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-lg relative">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 shadow-2xl">
          <div className="mb-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-400 p-0.5 mb-6 group">
              <div className="w-full h-full rounded-2xl bg-[#020617] flex items-center justify-center transition-transform group-hover:scale-95">
                <UserPlus size={28} className="text-indigo-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Join UniConnect
            </h1>
            <p className="text-slate-400 mt-2">Start your collaborative journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/5 bg-white/[0.05] pl-12 pr-4 py-3.5 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="student@campus.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/5 bg-white/[0.05] pl-12 pr-4 py-3.5 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Create a strong password"
                />
              </div>
              
              {/* Password Requirements UI */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                {passwordChecks.map(check => (
                  <div key={check.id} className="flex items-center gap-2">
                    {check.test ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                    )}
                    <span className={`text-[11px] ${check.test ? 'text-slate-300' : 'text-slate-500'}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/5 bg-white/[0.05] pl-12 pr-4 py-3.5 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                <CheckCircle2 size={16} />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-indigo-500 px-4 py-4 font-semibold text-white transition-all hover:bg-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
