import React from 'react';

/**
 * StatCard Component
 * REQUIRED REACT CONCEPT: React.memo
 * Wrapped with React.memo to prevent unnecessary re-renders of stat displays when other dashboard components update
 */
const StatCard = React.memo(function StatCard({ title, value, icon: Icon, color = 'indigo', subtitle }) {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/30',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30',
    },
    blue: {
      bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/30',
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30',
    },
  }[color] || {
    bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-100 dark:border-indigo-900/30',
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-5 border ${colorStyles.border} shadow-sm flex items-center justify-between`}>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {value !== undefined && value !== null ? value : 0}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorStyles.bg}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
});

export default StatCard;
