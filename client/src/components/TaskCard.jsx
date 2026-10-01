import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCalendar, HiOutlineFlag, HiOutlineTrash, HiOutlinePencil, HiOutlineUser } from 'react-icons/hi';

/**
 * TaskCard Component
 * REQUIRED REACT CONCEPT: React.memo
 * Wrapped with React.memo to prevent unnecessary re-renders when parent lists change
 */
const TaskCard = React.memo(function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const navigate = useNavigate();

  // REQUIRED REACT CONCEPT: useMemo
  // Memoize overdue calculation so it only recalculates if dueDate or status changes
  const isOverdue = useMemo(() => {
    if (!task?.dueDate || task?.status === 'Completed') return false;
    return new Date(task.dueDate).getTime() < Date.now();
  }, [task?.dueDate, task?.status]);

  // REQUIRED REACT CONCEPT: useMemo
  // Memoize date formatting for performance
  const formattedDate = useMemo(() => {
    if (!task?.dueDate) return 'No due date';
    return new Date(task.dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [task?.dueDate]);

  const priorityBadgeClasses = useMemo(() => {
    switch (task?.priority) {
      case 'High':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'Low':
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
    }
  }, [task?.priority]);

  const statusBadgeClasses = useMemo(() => {
    switch (task?.status) {
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'In Progress':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
      case 'Pending':
      default:
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    }
  }, [task?.status]);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header: Priority & Action Buttons */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${priorityBadgeClasses}`}>
            <HiOutlineFlag className="w-3 h-3" />
            {task.priority || 'Medium'}
          </span>

          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
              title="Edit Task"
              aria-label="Edit Task"
            >
              <HiOutlinePencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task._id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
              title="Delete Task"
              aria-label="Delete Task"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => navigate(`/tasks/${task._id}`)}
          className="text-base font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 mb-2"
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer Details */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 mt-auto flex items-center justify-between gap-2 flex-wrap">
        {/* Status Dropdown/Selector */}
        <div className="relative">
          <select
            value={task.status || 'Pending'}
            onChange={(e) => onStatusChange && onStatusChange(task._id, e.target.value)}
            className={`text-xs font-medium px-2.5 py-1 rounded-lg border appearance-none pr-6 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20 ${statusBadgeClasses}`}
          >
            <option value="Pending" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
              Pending
            </option>
            <option value="In Progress" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
              In Progress
            </option>
            <option value="Completed" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
              Completed
            </option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-500">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* Due Date & Assignee */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-red-500 dark:text-red-400 font-medium' : ''}`}>
            <HiOutlineCalendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>

          {task.assignedUser ? (
            <div
              className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-300"
              title={`Assigned to: ${task.assignedUser.name || task.assignedUser.email}`}
            >
              <HiOutlineUser className="w-3 h-3 text-indigo-500" />
              <span className="max-w-[80px] truncate">{task.assignedUser.name || 'User'}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default TaskCard;
