import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupUserProfile, getAuthToken } from '../../services/authService';

const AVAILABLE_SKILLS = [
  'Frontend',
  'Backend',
  'Database',
  'Testing',
  'UI/UX',
  'DevOps',
  'Mobile',
  'Data Analysis',
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
  });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requiredFilled = useMemo(() => {
    return (
      form.fullName &&
      form.registrationNumber &&
      form.year &&
      form.semester &&
      form.enrolledYear
    );
  }, [form]);

  const toggleSkill = (skill) => {
    setSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      return [...prev, skill];
    });
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
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
        <h1 className="text-2xl font-semibold">First-Time Profile Setup</h1>
        <p className="mt-2 text-sm text-slate-400">Complete your details to continue to your personalized dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full Name" required value={form.fullName} onChange={(v) => setForm((p) => ({ ...p, fullName: v }))} />
            <Field label="Registration Number" required value={form.registrationNumber} onChange={(v) => setForm((p) => ({ ...p, registrationNumber: v }))} />
            <Field label="Year" required value={form.year} onChange={(v) => setForm((p) => ({ ...p, year: v }))} placeholder="e.g. 3" />
            <Field label="Semester" required value={form.semester} onChange={(v) => setForm((p) => ({ ...p, semester: v }))} placeholder="e.g. 1" />
            <Field label="Enrolled Year" required value={form.enrolledYear} onChange={(v) => setForm((p) => ({ ...p, enrolledYear: v }))} placeholder="e.g. 2023" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Skills</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                    skills.includes(skill)
                      ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">About Yourself</label>
            <textarea
              value={form.about}
              onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              placeholder="Tell others about your interests and collaboration style"
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving profile...' : 'Complete Profile Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
      />
    </div>
  );
}

export default ProfileSetupPage;
