import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
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
      const data = await loginUser({ email, password });
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
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-lg relative">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-xl p-8 md:p-12 shadow-2xl">
          <div className="mb-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-400 p-0.5 mb-6 group">
              <div className="w-full h-full rounded-2xl bg-[#020617] flex items-center justify-center transition-transform group-hover:scale-95">
                <LogIn size={28} className="text-indigo-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-slate-400 mt-2">Log in to your UniConnect account</p>
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
              <div className="flex items-center justify-between ml-1 px-0.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Link to="#" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/5 bg-white/[0.05] pl-12 pr-4 py-3.5 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-pulse-once">
                <AlertCircle size={16} />
                {error}
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
                    Sign In
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              New here?{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
