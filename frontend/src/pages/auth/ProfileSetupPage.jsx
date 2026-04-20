import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, BookOpen, GraduationCap, Briefcase, Plus, X, ArrowRight, Info } from 'lucide-react';
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
    <div className="min-h-screen bg-[#020617] text-slate-100 py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />

      <div className="mx-auto w-full max-w-4xl relative">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-xl p-8 md:p-12 shadow-2xl">
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-xl bg-indigo-500/15 p-2 text-indigo-400">
                  <UserCircle size={24} />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Complete Your Profile
                </h1>
              </div>
              <p className="text-slate-400">Let the community know who you are and what you're good at.</p>
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Setup Pending
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Academic Information Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-indigo-400">
                <GraduationCap size={20} />
                <h2 className="text-lg font-semibold text-slate-200">Academic Information</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Field icon={<UserCircle size={18} />} label="Full Name" required value={form.fullName} onChange={(v) => setForm((p) => ({ ...p, fullName: v }))} placeholder="John Doe" />
                <Field icon={<Briefcase size={18} />} label="Registration Number" required value={form.registrationNumber} onChange={(v) => setForm((p) => ({ ...p, registrationNumber: v }))} placeholder="IT21000000" />
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300 ml-1">Faculty <span className="text-rose-400">*</span></label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <select
                      value={form.faculty}
                      onChange={(e) => setForm((p) => ({ ...p, faculty: e.target.value }))}
                      required
                      className="w-full appearance-none rounded-2xl border border-white/5 bg-white/[0.05] pl-12 pr-4 py-3.5 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="" className="bg-[#020617]">Select a faculty</option>
                      {FACULTIES.map((fac) => (
                        <option key={fac} value={fac} className="bg-[#020617]">
                          {fac}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Field label="Year" required value={form.year} onChange={(v) => setForm((p) => ({ ...p, year: v }))} placeholder="3" center />
                  <Field label="Semester" required value={form.semester} onChange={(v) => setForm((p) => ({ ...p, semester: v }))} placeholder="1" center />
                  <Field label="Enrolled" required value={form.enrolledYear} onChange={(v) => setForm((p) => ({ ...p, enrolledYear: v }))} placeholder="2023" center />
                </div>
              </div>
            </section>

            {/* Skills & Expertise Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-indigo-400">
                <Plus size={20} />
                <h2 className="text-lg font-semibold text-slate-200">Skills & Expertise</h2>
              </div>
              
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                <div>
                  <p className="text-sm text-slate-400 mb-4">Choose from common skills or add your own:</p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SKILLS.map((skill) => {
                      const isSelected = skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                            isSelected
                              ? 'border-indigo-400/50 bg-indigo-500/20 text-indigo-300'
                              : 'border-white/5 bg-white/[0.05] text-slate-400 hover:border-white/20 hover:text-slate-200'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 relative group">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                      placeholder="Add custom skill..."
                      className="w-full rounded-2xl border border-white/5 bg-white/[0.05] pl-12 pr-4 py-3 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.08]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {skills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-sm text-indigo-300"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="p-0.5 hover:bg-indigo-500/20 rounded-md transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* About Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Info size={20} />
                  <h2 className="text-lg font-semibold text-slate-200">About Yourself</h2>
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Bio Section</span>
              </div>
              <textarea
                value={form.about}
                onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))}
                rows={4}
                className="w-full rounded-3xl border border-white/5 bg-white/[0.05] px-6 py-4 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/10"
                placeholder="Tell others about your interests, project experiences, and collaboration style..."
              />
            </section>

            {error && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <Info size={16} />
                {error}
              </div>
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl bg-indigo-500 px-6 py-4 font-bold text-white transition-all hover:bg-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      Complete Profile Setup
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
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
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300 ml-1">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            {icon}
          </div>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-white/5 bg-white/[0.05] ${icon ? 'pl-12' : 'px-4'} ${center ? 'text-center' : ''} py-3.5 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-600`}
        />
      </div>
    </div>
  );
}

export default ProfileSetupPage;
