/**
 * Format a date string into readable text
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const defaultOptions = { month: 'short', day: 'numeric', year: 'numeric', ...options };
  return date.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Check if a date is in the past
 */
export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'completed') return false;
  return new Date(dueDate) < new Date();
};

/**
 * Get user initials from full name
 */
export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Task priority styling map
 */
export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-surface-400', bg: 'bg-surface-700/50' },
  medium: { label: 'Medium', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  high: { label: 'High', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  urgent: { label: 'Urgent', color: 'text-red-400', bg: 'bg-red-500/10' },
};

/**
 * Task status styling map
 */
export const STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'text-surface-300', bg: 'bg-surface-700' },
  'in-progress': { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  review: { label: 'In Review', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
};
