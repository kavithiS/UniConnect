import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  createFeedback,
  deleteFeedback,
  fetchFeedbackGiven,
  fetchFeedbackReceived,
  fetchMyMemberGroups,
  getAuthToken,
  updateFeedback,
} from '../services/authService';
import { Star, MessageSquare, Edit2, Trash2 } from 'lucide-react';

function FeedbackPage({ user }) {
  const { isDarkMode } = useTheme();
  const [memberGroups, setMemberGroups] = useState([]);
  const [received, setReceived] = useState([]);
  const [given, setGiven] = useState([]);
  const [form, setForm] = useState({ targetUser: '', comment: '', rating: 0 });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('received');

  const token = getAuthToken();

  const selectableUsers = useMemo(() => {
    const teammates = new Map();
    memberGroups.forEach(group => {
      group.members?.forEach(member => {
        const memberId = typeof member === 'object' ? member._id : member;
        if (memberId && memberId !== user?._id) {
          teammates.set(memberId, member); 
        }
      });
    });
    
    return Array.from(teammates.values()).slice(0, 3);
  }, [memberGroups, user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [receivedList, givenList, groups] = await Promise.all([
        fetchFeedbackReceived(token, user?._id),
        fetchFeedbackGiven(token),
        fetchMyMemberGroups(token)
      ]);

      setReceived(receivedList);
      setGiven(givenList);
      setMemberGroups(groups);
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
    setForm({ targetUser: '', comment: '', rating: 0 });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.targetUser || !form.comment.trim()) return;

    if (form.rating < 1 || form.rating > 5) {
      setError('Please provide a rating between 1 and 5 stars');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (editingId) {
        await updateFeedback(token, editingId, {
          comment: form.comment,
          rating: Number(form.rating),
        });
      } else {
        await createFeedback(token, {
          targetUser: form.targetUser,
          comment: form.comment,
          rating: Number(form.rating),
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
      rating: item.rating || 0,
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

  const StarRating = ({ rating, setRating, interactive = true }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRating(star)}
            className={`transition-colors ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              size={24}
              className={`${
                star <= rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-400 fill-transparent'
              } transition-all duration-200 hover:scale-110`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <header>
        <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Peer Feedback</h1>
        <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Rate your teammates and provide constructive feedback on your collaborations.</p>
      </header>

      {error && <div className={`rounded-xl border ${isDarkMode ? 'border-rose-900/50 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'} p-3 text-sm`}>{error}</div>}

      <section className={`rounded-2xl border p-6 ${isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{editingId ? 'Edit Feedback' : 'Rate a Teammate'}</h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={`mb-2 block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Select Teammate</label>
              <select
                value={form.targetUser}
                onChange={(e) => setForm((p) => ({ ...p, targetUser: e.target.value }))}
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500 transition-colors ${isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                required
                disabled={Boolean(editingId)}
              >
                <option value="">Select a teammate</option>
                {selectableUsers.map((candidate) => (
                  <option key={candidate._id} value={candidate._id}>
                    {candidate.fullName || candidate.name || candidate.email}
                  </option>
                ))}
              </select>
              {selectableUsers.length === 0 && (
                <p className="mt-2 text-xs text-slate-500 italic">No teammates found. Join a group to rate others.</p>
              )}
            </div>

            <div>
              <label className={`mb-2 block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Rating</label>
              <div className="py-2">
                <StarRating rating={form.rating} setRating={(r) => setForm(p => ({ ...p, rating: r }))} />
              </div>
            </div>
          </div>

          <div>
            <label className={`mb-2 block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Your Comment</label>
            <textarea
              rows={3}
              value={form.comment}
              onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
              placeholder="How was the collaboration experience?"
              className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500 transition-colors ${isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting || !form.rating}
              className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : editingId ? 'Update Feedback' : 'Submit Rating'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className={`rounded-xl border px-6 py-3 text-sm font-medium ${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'} hover:bg-slate-100/10`}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <div className="flex border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('received')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'received' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Received
        </button>
        <button 
          onClick={() => setActiveTab('given')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'given' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Given
        </button>
      </div>

      <section className="grid gap-6">
        {activeTab === 'received' ? (
          <ListCard title="Feedback Received" items={received} type="received" emptyText="No feedback received yet." />
        ) : (
          <ListCard
            title="Feedback Given"
            items={given}
            type="given"
            emptyText="No feedback given yet."
            onEdit={startEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        )}
      </section>
    </div>
  );
}

function ListCard({ title, items, type, emptyText, onEdit, onDelete, loading }) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`rounded-2xl border p-6 ${isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'} min-h-[300px]`}>
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{title}</h3>
      
      {loading ? (
        <div className="mt-12 flex justify-center text-slate-500">Loading feedback...</div>
      ) : items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-slate-500 text-center">
          <MessageSquare size={48} className="opacity-20" />
          <p>{emptyText}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item._id} className={`group rounded-xl border p-4 transition-all ${isDarkMode ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {(type === 'received' ? item.fromUser?.fullName || 'U' : item.targetUser?.fullName || 'U')[0]}
                  </div>
                  <div>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                      {type === 'received' 
                        ? (item.fromUser?.fullName || item.fromUser?.email || 'Unknown') 
                        : (item.targetUser?.fullName || item.targetUser?.email || 'Unknown')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {item.rating && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-amber-400">{item.rating}</span>
                  </div>
                )}
              </div>

              <p className={`mt-3 text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {item.comment}
              </p>

              {type === 'given' && (
                <div className="mt-4 flex opacity-0 group-hover:opacity-100 transition-opacity justify-end gap-2">
                  <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete(item._id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FeedbackPage;
