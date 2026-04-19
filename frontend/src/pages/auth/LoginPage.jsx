import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { loginUser, setAuthToken } from "../../services/authService";

function LoginPage({ onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const data = await loginUser({ email: normalizedEmail, password });
      setAuthToken(data.token);
      onAuthSuccess(data.user);

      if (data.user.profileCompleted) {
        navigate("/home");
      } else {
        navigate("/profile-setup");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500/15 p-2 text-indigo-300">
            <LockKeyhole size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Login</h1>
            <p className="text-sm text-slate-400">
              Access your collaboration workspace
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              placeholder="student@campus.edu"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-400">
          New user?{" "}
          <Link
            to="/register"
            className="text-indigo-300 hover:text-indigo-200"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
