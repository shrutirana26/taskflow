import React from 'react';

/**
 * StatCard Component
 * REQUIRED REACT CONCEPT: React.memo
 * Wrapped with React.memo to prevent unnecessary re-renders of stat displays when other dashboard components update
 */
const StatCard = React.memo(function StatCard({ title, value, icon: Icon, color = 'indigo', subtitle, badge }) {
  const colorStyles = {
    indigo: {
      text: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
      defaultBadge: `↗ ${value || 0}`,
    },
    amber: {
      text: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-400',
      defaultBadge: `⏱ ${value || 0}`,
    },
    blue: {
      text: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      iconBg: 'bg-blue-500/10 text-blue-400',
      defaultBadge: `🔄 ${value || 0}`,
    },
    emerald: {
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      defaultBadge: `✓ ${value || 0}`,
    },
  }[color] || {
    text: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    iconBg: 'bg-indigo-500/10 text-indigo-400',
    defaultBadge: `${value || 0}`,
  };

  return (
    <div className="bg-white dark:bg-[#121826] rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorStyles.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
            {title}
          </span>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colorStyles.badgeBg}`}>
          {badge || colorStyles.defaultBadge}
        </span>
      </div>

      <div className="mt-1">
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value !== undefined && value !== null ? value : 0}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
});

export default StatCard;
