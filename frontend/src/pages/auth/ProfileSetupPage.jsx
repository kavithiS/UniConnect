import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, BookOpen, GraduationCap, Briefcase, Plus, X, ArrowRight, Info, Sparkles, Shapes } from 'lucide-react';
import { setupUserProfile, getAuthToken } from '../../services/authService';

const AVAILABLE_SKILLS = [
  'Frontend', 'Backend', 'Database', 'Testing', 'UI/UX', 'DevOps', 'Mobile', 'Data Analysis',
];

const FACULTIES = [
  'Faculty of Computing',
  'Faculty of Engineering',
  'Faculty of Business',
  'Faculty of Humanities & Sciences',
];

function ProfileSetupPage({ onProfileUpdated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    registrationNumber: '',
    year: '',
    semester: '',
    enrolledYear: '',
    about: '',
    faculty: '',
  });
  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requiredFilled = useMemo(() => {
    return (
      form.fullName &&
      form.registrationNumber &&
      form.year &&
      form.semester &&
      form.enrolledYear &&
      form.faculty
    );
  }, [form]);

  const completionProgress = useMemo(() => {
    const fields = Object.values(form).filter(v => v !== '').length;
    const skillBonus = skills.length > 0 ? 1 : 0;
    return Math.min(Math.round(((fields + skillBonus) / 8) * 100), 100);
  }, [form, skills]);

  const toggleSkill = (skill) => {
    setSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      return [...prev, skill];
    });
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills((prev) => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!requiredFilled) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      const user = await setupUserProfile(token, {
        ...form,
        skills,
      });

      onProfileUpdated(user);
      navigate('/dashboard/home');
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 py-16 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="mx-auto w-full max-w-5xl relative">
        <div className="relative rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl p-8 md:p-16 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden">
          
          {/* Header Section */}
          <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles size={12} />
                Profile Setup
              </div>
              <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
                Complete Your <span className="text-indigo-500 italic">Profile</span>
              </h1>
              <p className="text-slate-400 max-w-md text-lg font-medium leading-relaxed">
                Tell us a bit about yourself to get started with the community.
              </p>
            </div>
            
            {/* Progress Visualization */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 min-w-[240px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Setup Status</span>
                <span className="text-xl font-black text-indigo-400 leading-none">{completionProgress}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-1000 ease-out"
                  style={{ width: `${completionProgress}%` }}
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-16">
            {/* 1. Academic Credentials */}
            <div className="relative group">
              <div className="absolute -left-12 top-0 hidden xl:flex flex-col items-center opacity-20 pointer-events-none group-focus-within:opacity-100 transition-opacity">
                <div className="w-1 h-12 bg-indigo-500 rounded-full mb-4" />
                <span className="[writing-mode:vertical-rl] text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Details</span>
              </div>

              <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
                <Field icon={<UserCircle size={22} />} label="Full Name" required value={form.fullName} onChange={(v) => setForm((p) => ({ ...p, fullName: v }))} placeholder="Ex: John Doe" />
                <Field icon={<Briefcase size={22} />} label="Student ID" required value={form.registrationNumber} onChange={(v) => setForm((p) => ({ ...p, registrationNumber: v }))} placeholder="IT2100xxxx" />
                
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Faculty</label>
                  <div className="relative group/select">
                    <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/select:text-indigo-400 transition-colors pointer-events-none" size={20} />
                    <select
                      value={form.faculty}
                      onChange={(e) => setForm((p) => ({ ...p, faculty: e.target.value }))}
                      required
                      className="w-full appearance-none rounded-[1.5rem] border border-white/5 bg-white/[0.04] pl-16 pr-8 py-5 outline-none transition-all focus:border-indigo-500/30 focus:bg-white/[0.07] focus:ring-4 focus:ring-indigo-500/5 text-[15px] font-medium"
                    >
                      <option value="" className="bg-[#020617]">Select your faculty...</option>
                      {FACULTIES.map((fac) => (
                        <option key={fac} value={fac} className="bg-[#020617]">{fac}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Field label="Year" required value={form.year} onChange={(v) => setForm((p) => ({ ...p, year: v }))} placeholder="3" center />
                  <Field label="Sem" required value={form.semester} onChange={(v) => setForm((p) => ({ ...p, semester: v }))} placeholder="1" center />
                  <Field label="Entry" required value={form.enrolledYear} onChange={(v) => setForm((p) => ({ ...p, enrolledYear: v }))} placeholder="2023" center />
                </div>
              </div>
            </div>

            {/* 2. Skills Inventory */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-white/5" />
                <div className="flex items-center gap-2 text-indigo-400">
                  <Shapes size={20} strokeWidth={2.5} />
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">Your Skills</h2>
                </div>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>
              
              <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/10 shadow-inner">
                <div className="flex flex-wrap gap-3 mb-10">
                  {AVAILABLE_SKILLS.map((skill) => {
                    const isSelected = skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-2xl px-6 py-3 text-[13px] font-black transition-all duration-300 uppercase tracking-widest ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] scale-105'
                            : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 relative group/skill">
                    <Plus className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/skill:text-indigo-400 transition-colors" size={20} />
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                      placeholder="Add other skills..."
                      className="w-full rounded-2xl border border-white/5 bg-white/[0.04] pl-16 pr-6 py-4.5 outline-none transition-all focus:border-indigo-500/30 text-[14px] font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="aspect-square flex items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 transition-all hover:text-white px-6 shadow-xl"
                  >
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-10 p-6 rounded-2xl bg-[#020617]/40 border border-white/5">
                    {skills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-2 rounded-xl bg-indigo-500/10 px-4 py-2 text-[11px] font-black text-indigo-300 uppercase tracking-tighter"
                      >
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Personal Abstract */}
            <div className="space-y-6">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">About You</label>
              <textarea
                value={form.about}
                onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))}
                rows={6}
                className="w-full rounded-[2rem] border border-white/5 bg-white/[0.04] px-8 py-8 outline-none transition-all focus:border-indigo-500/30 focus:bg-white/[0.07] text-[15px] font-medium leading-relaxed resize-none shadow-inner"
                placeholder="Share a little about your interests and project experience..."
              />
            </div>

            {error && (
              <div className="flex items-center gap-4 p-6 rounded-[1.5rem] bg-rose-500/5 border border-rose-500/10 text-rose-400 text-sm animate-bounce">
                <Info size={20} />
                <span className="font-bold tracking-tight">{error}</span>
              </div>
            )}

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-[72px] overflow-hidden rounded-[1.5rem] bg-white text-slate-950 shadow-2xl transition-all duration-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-600 mx-auto" />
                ) : (
                  <div className="flex items-center justify-center gap-4 text-[16px] font-black uppercase tracking-[0.3em]">
                    Save Profile
                    <ArrowRight size={22} className="transition-transform group-hover:translate-x-3 duration-500" />
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value, onChange, placeholder, required = false, center = false }) {
  return (
    <div className="space-y-4">
      <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
        {label} {required && <span className="text-indigo-400">*</span>}
      </label>
      <div className="relative group/field">
        {icon && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-indigo-400 transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-[1.5rem] border border-white/5 bg-white/[0.04] ${icon ? 'pl-16' : 'px-8'} ${center ? 'text-center' : ''} py-5 outline-none transition-all focus:border-indigo-500/30 focus:bg-white/[0.07] focus:ring-4 focus:ring-indigo-500/5 text-[15px] font-bold placeholder:text-slate-700`}
        />
      </div>
    </div>
  );
}

export default ProfileSetupPage;
