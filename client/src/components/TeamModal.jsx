import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Modal from './Modal';
import { createTeam, updateTeam } from '../store/slices/teamSlice';
import toast from 'react-hot-toast';
import { HiOutlineUserGroup, HiOutlineColorSwatch } from 'react-icons/hi';

const COLOR_PRESETS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Purple
];

export default function TeamModal({ isOpen, onClose, teamToEdit = null }) {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (teamToEdit) {
      setName(teamToEdit.name || '');
      setDescription(teamToEdit.description || '');
      setColor(teamToEdit.color || '#6366f1');
    } else {
      setName('');
      setDescription('');
      setColor('#6366f1');
    }
  }, [teamToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Team name is required');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      color,
    };

    try {
      if (teamToEdit) {
        await dispatch(updateTeam({ id: teamToEdit._id, teamData: payload })).unwrap();
        toast.success('Team updated successfully');
      } else {
        await dispatch(createTeam(payload)).unwrap();
        toast.success('Team created successfully');
      }
      onClose();
    } catch (err) {
      toast.error(err || 'Failed to save team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={teamToEdit ? 'Edit Team' : 'Create New Team'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Team Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">
            Team Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <HiOutlineUserGroup className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
            <input
              type="text"
              required
              placeholder="e.g. Design Core, Backend Squad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1.5">
            Description
          </label>
          <textarea
            rows="3"
            placeholder="What does this team focus on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface-800/60 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm resize-none"
          />
        </div>

        {/* Color Accent */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-400 mb-2 flex items-center gap-1">
            <HiOutlineColorSwatch className="w-4 h-4 text-surface-400" /> Team Accent Color
          </label>
          <div className="flex items-center gap-2.5">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-700/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 shadow-md shadow-primary-500/20 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Saving...' : teamToEdit ? 'Save Changes' : 'Create Team'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
