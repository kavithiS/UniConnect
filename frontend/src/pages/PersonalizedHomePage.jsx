import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  TrendingUp,
  Lightbulb,
  BookOpen,
  Star,
  ArrowRight,
  Sparkles,
  Users,
  Code,
  Palette,
  TestTubes,
} from "lucide-react";

const PersonalizedHomePage = ({ user }) => {
  const navigate = useNavigate();
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);

  const userName = user?.fullName ? user.fullName.split(" ")[0] : "Developer";

  const userSkills = [
    { name: "React", color: "from-blue-500 to-cyan-500" },
    { name: "Frontend", color: "from-purple-500 to-pink-500" },
    { name: "JavaScript", color: "from-yellow-500 to-orange-500" },
  ];

  const suggestedSkills = [
    { name: "Backend", icon: Code, color: "bg-blue-500/20 text-blue-300 border-blue-400/30" },
    { name: "Testing", icon: TestTubes, color: "bg-green-500/20 text-green-300 border-green-400/30" },
    { name: "UI/UX", icon: Palette, color: "bg-pink-500/20 text-pink-300 border-pink-400/30" },
    { name: "DevOps", icon: Zap, color: "bg-orange-500/20 text-orange-300 border-orange-400/30" },
  ];

  const resources = [
    { title: "React Fundamentals", icon: Code, description: "Master React hooks and components" },
    { title: "API Testing Guide", icon: TestTubes, description: "Learn REST and GraphQL testing" },
    { title: "UI Design Patterns", icon: Palette, description: "Create beautiful user interfaces" },
    { title: "Advanced JavaScript", icon: Sparkles, description: "Deep dive into async and await" },
  ];

  const mockFeedback = [
    {
      author: "Alice Johnson",
      rating: 5,
      comment: "Amazing collaborator! Great at problem-solving and communication.",
      avatar: "AJ",
      date: "2 days ago",
    },
    {
      author: "Bob Smith",
      rating: 5,
      comment: "Exceptional frontend skills. Delivered pixel-perfect UI components.",
      avatar: "BS",
      date: "1 week ago",
    },
    {
      author: "Carol Davis",
      rating: 4,
      comment: "Strong technical abilities. Would love to work together again!",
      avatar: "CD",
      date: "2 weeks ago",
    },
  ];

  const proTip = "Complete your profile with all skills to unlock better teammate recommendations!";

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-1/3 -left-16 h-80 w-80 rounded-full bg-purple-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[160px]" />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-10 md:p-12 backdrop-blur">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                  Uni Connect Studio
                </span>
                <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                    Welcome back, {userName}
                  </span>
                  <span className="block text-white">Build your next collaboration arc.</span>
                </h1>
                <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                  Coordinate projects, unlock skilled teammates, and keep momentum with actionable insights tailored to your learning journey.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate("/dashboard/groups")}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-400"
                  >
                    Explore Groups
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate("/dashboard/projects")}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-400/60 hover:text-white"
                  >
                    View Projects
                    <TrendingUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid w-full max-w-md grid-cols-2 gap-4">
                {[
                  { label: "Active Skills", value: "12", icon: Sparkles },
                  { label: "Team Matches", value: "8", icon: Users },
                  { label: "Feedback", value: mockFeedback.length, icon: Star },
                  { label: "Projects", value: "4", icon: TrendingUp },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-500">{stat.label}</p>
                          <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                        <div className="rounded-xl bg-blue-500/15 p-2 text-blue-300">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Momentum Hub</h2>
                  <p className="text-sm text-slate-400">Actionable insights inspired by the HackerEarth workflow.</p>
                </div>
                <button
                  onClick={() => navigate("/dashboard/recommendations")}
                  className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-200 transition hover:border-blue-400/60"
                >
                  View Matches
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-slate-950/40 p-5">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-blue-300" />
                    <h3 className="text-lg font-semibold text-white">Skill Synergies</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">Blend your strengths with these high-impact teammate roles.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {suggestedSkills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className={`rounded-full border px-3 py-1 text-xs font-semibold ${skill.color}`}>
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-5 w-5 text-amber-300" />
                    <h3 className="text-lg font-semibold text-white">Pro Tip</h3>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{proTip}</p>
                  <button
                    onClick={() => navigate("/dashboard/profile")}
                    className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-200"
                  >
                    Update Profile
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {resources.slice(0, 3).map((resource, idx) => (
                  <button
                    key={idx}
                    className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/50 px-5 py-4 text-left transition hover:border-blue-400/40"
                  >
                    <div className="flex items-center gap-3">
                      <resource.icon className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">{resource.title}</p>
                        <p className="text-xs text-slate-500">{resource.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-blue-300" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur">
              <h3 className="text-lg font-semibold text-white">Focus Sprint</h3>
              <p className="mt-2 text-sm text-slate-400">
                A quick checklist to keep your collaboration aligned this week.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  "Finalize team roles and responsibilities",
                  "Share your project status update",
                  "Schedule a 15-minute sync-up",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    <p className="text-sm text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/dashboard/tasks")}
                className="mt-6 w-full rounded-full bg-blue-500/20 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/30"
              >
                Open Task Board
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-10 backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Peer Feedback Spotlight</h2>
                <p className="text-sm text-slate-400">Showcase the most recent feedback and highlight collaboration wins.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/dashboard/feedback")}
                  className="rounded-full border border-slate-700 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-slate-200 transition hover:border-blue-400/60"
                >
                  View All Feedback
                </button>
                <button
                  onClick={() => navigate("/dashboard/feedback")}
                  className="rounded-full bg-blue-500 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-blue-400"
                >
                  Request Review
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockFeedback.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                      {item.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.author}</p>
                      <p className="text-xs text-slate-500">{item.date}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-slate-300">"{item.comment}"</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedHomePage;
