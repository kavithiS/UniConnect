import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  createFeedback,
  deleteFeedback,
  fetchFeedbackGiven,
  fetchFeedbackReceived,
  fetchUsers,
  getAuthToken,
  updateFeedback,
} from '../services/authService';
import { Send, Star, Users, MessageSquare, Edit2, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

function FeedbackPage({ user }) {
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [received, setReceived] = useState([]);
  const [given, setGiven] = useState([]);
  const [form, setForm] = useState({ targetUser: '', comment: '', rating: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('received');

  const token = getAuthToken();

  const selectableUsers = useMemo(
    () => users.filter((candidate) => candidate._id !== user?._id),
    [users, user]
  );

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [userList, receivedList, givenList] = await Promise.all([
        fetchUsers(token),
        fetchFeedbackReceived(token, user?._id),
        fetchFeedbackGiven(token),
      ]);

      setUsers(userList);
      setReceived(receivedList);
      setGiven(givenList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadData();
    }
  }, [user]);

  const resetForm = () => {
    setForm({ targetUser: '', comment: '', rating: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.targetUser || !form.comment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      if (editingId) {
        await updateFeedback(token, editingId, {
          comment: form.comment,
          rating: form.rating ? Number(form.rating) : null,
        });
      } else {
        await createFeedback(token, {
          targetUser: form.targetUser,
          comment: form.comment,
          rating: form.rating ? Number(form.rating) : null,
        });
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      targetUser: item.targetUser?._id || item.targetUser,
      comment: item.comment || '',
      rating: item.rating || '',
    });
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await deleteFeedback(token, id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <header>
        <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Peer Feedback</h1>
        <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Create, review, update, and delete your collaboration feedback.</p>
      </header>

      {error && <div className={`rounded-xl border ${isDarkMode ? 'border-rose-900/50 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'} p-3 text-sm`}>{error}</div>}

      <section className={`rounded-2xl border p-6 ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{editingId ? 'Edit Feedback' : 'Create Feedback'}</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={`mb-2 block text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Target User</label>
            <select
              value={form.targetUser}
              onChange={(e) => setForm((p) => ({ ...p, targetUser: e.target.value }))}
              className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500 ${isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
              required
              disabled={Boolean(editingId)}
            >
              <option value="">Select user</option>
              {selectableUsers.map((candidate) => (
                <option key={candidate._id} value={candidate._id}>
                  {candidate.fullName || candidate.name || candidate.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`mb-2 block text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Rating (optional)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={form.rating}
              onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
              className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500 ${isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
              placeholder="1 - 5"
            />
          </div>

          <div className="md:col-span-2">
            <label className={`mb-2 block text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Comment</label>
            <textarea
              rows={3}
              value={form.comment}
              onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
              className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500 ${isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
              required
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Feedback' : 'Submit Feedback'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className={`rounded-xl border px-4 py-2.5 text-sm ${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'}`}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ListCard title="Feedback Received" items={received} type="received" emptyText="No feedback received yet." />
        <ListCard
          title="Feedback Given"
          items={given}
          type="given"
          emptyText="No feedback given yet."
          onEdit={startEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </section>
    </div>
  );
}

function ListCard({ title, items, type, emptyText, onEdit, onDelete, loading }) {
  const { isDarkMode } = useTheme();
  return (
    <div className={`rounded-2xl border p-6 ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{title}</h3>
      <div className="mt-4 space-y-3">
        {loading ? (
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Loading...</p>
        ) : items.length === 0 ? (
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{emptyText}</p>
        ) : (
          items.map((item) => (
            <div key={item._id} className={`rounded-xl border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {type === 'received'
                    ? item.reviewer?.fullName || item.reviewer?.name || item.reviewer?.email
                    : item.targetUser?.fullName || item.targetUser?.name || item.targetUser?.email}
                </p>
                <span className={`text-xs ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>{item.rating ? `${item.rating}/5` : 'No rating'}</span>
              </div>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.comment}</p>
              {type === 'given' && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => onEdit(item)} className={`rounded-lg border px-3 py-1.5 text-xs ${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'}`}>
                    Edit
                  </button>
                  <button onClick={() => onDelete(item._id)} className={`rounded-lg border px-3 py-1.5 text-xs ${isDarkMode ? 'border-rose-700/60 text-rose-300' : 'border-rose-200 text-rose-700'}`}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FeedbackPage;
