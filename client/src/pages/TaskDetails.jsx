import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskById, updateTask, deleteTask } from '../store/slices/tasksSlice';
import TaskModal from '../components/TaskModal';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCalendar,
  HiOutlineFlag,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Set up login/signup APIs', done: true },
    { id: 2, text: 'Implement token generation & validation', done: true },
    { id: 3, text: 'Secure backend routes with JWT guard', done: false },
    { id: 4, text: 'Handle frontend token storage and session persistence', done: false },
    { id: 5, text: 'Create responsive and accessible UI forms', done: false },
  ]);

  const toggleChecklistItem = (itemId) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item))
    );
  };

  const { currentTask: task, loading, actionLoading, error } = useSelector(
    (state) => state.tasks
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(id));
    }
  }, [id, dispatch]);

  const handleDelete = useCallback(async () => {
    try {
      await dispatch(deleteTask(id)).unwrap();
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (err) {
      toast.error(err || 'Failed to delete task');
    }
  }, [dispatch, id, navigate]);

  const handleStatusChange = useCallback(
    async (newStatus) => {
      try {
        await dispatch(updateTask({ id, taskData: { status: newStatus } })).unwrap();
        toast.success(`Task status updated to ${newStatus}`);
      } catch (err) {
        toast.error('Failed to update status');
      }
    },
    [dispatch, id]
  );

  const formattedDueDate = useMemo(() => {
    if (!task?.dueDate) return 'No due date set';
    return new Date(task.dueDate).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [task?.dueDate]);

  const formattedCreatedAt = useMemo(() => {
    if (!task?.createdAt) return '';
    return new Date(task.createdAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [task?.createdAt]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Task Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          The requested task could not be found or may have been deleted.
        </p>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-3 cursor-pointer"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Task Details
        </h1>
      </div>

      {/* 2-Column Layout (Matching Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Title, Description, Checklist, Audit Timestamps */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#121826] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm p-6 sm:p-7 space-y-6">
            {/* Header: Title and Status Selector */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
              <div className="space-y-2 flex-1">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    task.priority === 'High'
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                      : task.priority === 'Medium'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}
                >
                  <HiOutlineFlag className="w-3.5 h-3.5" />
                  {task.priority || 'Medium'} Priority
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {task.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status:</label>
                <select
                  value={task.status || 'Pending'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white cursor-pointer focus:outline-none focus:border-indigo-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Description
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {task.description || 'No description provided for this task.'}
              </p>
            </div>

            {/* Subtask Checklist (From screenshot) */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Checklist / Subtasks
              </h3>
              <div className="space-y-2">
                {checklist.map((item) => (
                  <label
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                    />
                    <span
                      className={`text-xs font-medium ${
                        item.done
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Audit Timestamps (From screenshot) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 space-y-1">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Audit Timestamps
              </h3>
              <p>Created: {formattedCreatedAt} by {task.creator?.name || 'Administrator'}</p>
              <p>Updated: {formattedDueDate} by {task.assignedUser?.name || 'Assigned User'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Details Sidebar Card (Matching Screenshot) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121826] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Details
            </h3>

            {/* Assigned To */}
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                Assigned To
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/10">
                  {task.assignedUser?.name ? task.assignedUser.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {task.assignedUser?.name || 'Test User'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                    {task.assignedUser?.email || 'testuser@example.com'}
                  </p>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Due Date
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {formattedDueDate}
              </p>
            </div>

            {/* Created By */}
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Created By
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {task.creator?.name || 'Administrator'} on {formattedCreatedAt}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                <HiOutlinePencil className="w-4 h-4" />
                <span>Edit Task</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                <HiOutlineTrash className="w-4 h-4" />
                <span>Delete Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          dispatch(fetchTaskById(id));
        }}
        taskToEdit={task}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Task"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete "{task.title}"? This cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <HiOutlineTrash className="w-4 h-4" />
              <span>{actionLoading ? 'Deleting...' : 'Delete Permanently'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
