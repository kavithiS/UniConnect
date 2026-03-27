import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Target, Users, Plus, X, ArrowRight } from 'lucide-react';

const AddProject = ({ setProjectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([{ name: '', role: '' }]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddMember = () => {
    setMembers([...members, { name: '', role: '' }]);
  };

  const handleUpdateMember = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const handleRemoveMember = (index) => {
    if (members.length === 1) return;
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const filteredMembers = members.filter(m => m.name.trim() && m.role.trim());

    // Validate that at least 2 members are provided
    if (filteredMembers.length < 2) {
      alert('Please add at least 2 team members to create a project.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/projects', {
        title,
        description,
        members: filteredMembers
      });

      setProjectId(res.data._id);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 text-gray-900 dark:text-white">
          <Target className="text-blue-600 dark:text-blue-400" size={36} />
          Create New Project
        </h1>

        <p className="text-gray-600 dark:text-slate-400">
          Set up a new workspace and add your team members.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Project Details */}
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-4 
            text-gray-900 dark:text-white border-gray-200 dark:border-white/10">
            Project Details
          </h2>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-slate-300">
                Project Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Web App Final Assessment"
                className="form-control"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-slate-300">
                Group Name / ID
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. G105 (Optional)"
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="glass-panel p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4 
            border-gray-200 dark:border-white/10">

            <h2 className="text-2xl font-semibold flex items-center gap-2 
              text-gray-900 dark:text-white">
              <Users className="text-blue-600 dark:text-blue-400" />
              Team Members
              <span className="text-sm font-normal text-gray-500 dark:text-slate-400">
                (At least 2 required)
              </span>
            </h2>

            <button
              type="button"
              onClick={handleAddMember}
              className="btn btn-secondary text-sm py-2"
            >
              <Plus size={16} /> Add Member
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {members.map((member, i) => (
              <div
                key={i}
                className="flex gap-4 items-start p-4 rounded-lg border animate-slideUp
                bg-gray-100 border-gray-200
                dark:bg-slate-900/40 dark:border-white/10"
              >
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-slate-300">
                    Name
                  </label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleUpdateMember(i, 'name', e.target.value)}
                    placeholder="e.g. Alice"
                    className="form-control text-sm py-2.5"
                  />
                </div>

                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-slate-300">
                    Role
                  </label>
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => handleUpdateMember(i, 'role', e.target.value)}
                    placeholder="e.g. Developer"
                    className="form-control text-sm py-2.5"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveMember(i)}
                  className="mt-6 p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-100 
                  dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-md transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="btn btn-primary text-lg py-3 px-8 w-full sm:w-auto"
            disabled={loading || members.filter(m => m.name.trim() && m.role.trim()).length < 2}
          >
            {loading ? 'Creating...' : 'Create Project'} <ArrowRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProject;