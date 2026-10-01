import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import TaskModal from '../components/TaskModal';
import { fetchTasks, fetchTaskStats } from '../store/slices/tasksSlice';
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlinePlus,
  HiOutlineArrowNarrowRight,
  HiOutlineCalendar,
  HiOutlineFlag,
  HiOutlineUser,
} from 'react-icons/hi';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // REQUIRED REACT CONCEPT: useState
  // Local state for modal visibility and recent task filter
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Redux state
  const { user } = useSelector((state) => state.auth);
  const { tasks, stats, loading, statsLoading } = useSelector((state) => state.tasks);

  // REQUIRED REACT CONCEPT: useEffect
  // Dispatch initial API calls to populate tasks and stats
  useEffect(() => {
    dispatch(fetchTasks({ limit: 10 }));
    dispatch(fetchTaskStats());
  }, [dispatch]);

  // REQUIRED REACT CONCEPT: useCallback
  // Handler passed to child modal component
  const handleOpenTaskModal = useCallback(() => {
    setIsTaskModalOpen(true);
  }, []);

  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    dispatch(fetchTaskStats());
    dispatch(fetchTasks({ limit: 10 }));
  }, [dispatch]);

  // REQUIRED REACT CONCEPT: useMemo
  // Calculate dashboard summary statistics
  const summaryStats = useMemo(() => {
    const total = stats?.total ?? tasks.length;
    const pending = stats?.pending ?? tasks.filter((t) => t.status === 'Pending').length;
    const inProgress = stats?.inProgress ?? tasks.filter((t) => t.status === 'In Progress').length;
    const completed = stats?.completed ?? tasks.filter((t) => t.status === 'Completed').length;

    return { total, pending, inProgress, completed };
  }, [stats, tasks]);

  // REQUIRED REACT CONCEPT: useMemo
  // Format dataset for Recharts Pie/Doughnut chart (Tasks by Status)
  const statusChartData = useMemo(() => {
    return [
      { name: 'Pending', value: summaryStats.pending, color: '#f59e0b' },
      { name: 'In Progress', value: summaryStats.inProgress, color: '#3b82f6' },
      { name: 'Completed', value: summaryStats.completed, color: '#10b981' },
    ];
  }, [summaryStats]);

  // REQUIRED REACT CONCEPT: useMemo
  // Format dataset for Recharts Bar chart (Tasks by Priority)
  const priorityChartData = useMemo(() => {
    const lowCount = tasks.filter((t) => t.priority === 'Low').length;
    const mediumCount = tasks.filter((t) => t.priority === 'Medium').length;
    const highCount = tasks.filter((t) => t.priority === 'High').length;

    return [
      { priority: 'Low', count: lowCount, fill: '#10b981' },
      { priority: 'Medium', count: mediumCount, fill: '#3b82f6' },
      { priority: 'High', count: highCount, fill: '#ef4444' },
    ];
  }, [tasks]);

  // REQUIRED REACT CONCEPT: useMemo
  // Compute recent tasks sorted by creation date
  const recentTasks = useMemo(() => {
    if (stats?.recentTasks && stats.recentTasks.length > 0) {
      return stats.recentTasks;
    }
    return [...tasks]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [stats, tasks]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-900/10 via-indigo-600/5 to-transparent p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name || 'User'} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here is what is happening across your tasks and team today.
          </p>
        </div>
        <button
          onClick={handleOpenTaskModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all text-sm self-start sm:self-auto"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* PHASE 13: Four Statistic Cards (Total Tasks, Pending, In Progress, Completed) */}
      {/* Wrapped in React.memo'd StatCard */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={summaryStats.total}
          icon={HiOutlineClipboardList}
          color="indigo"
          subtitle="All workspace tasks"
        />
        <StatCard
          title="Pending"
          value={summaryStats.pending}
          icon={HiOutlineExclamationCircle}
          color="amber"
          subtitle="Awaiting action"
        />
        <StatCard
          title="In Progress"
          value={summaryStats.inProgress}
          icon={HiOutlineClock}
          color="blue"
          subtitle="Under active work"
        />
        <StatCard
          title="Completed"
          value={summaryStats.completed}
          icon={HiOutlineCheckCircle}
          color="emerald"
          subtitle="Successfully closed"
        />
      </section>

      {/* PHASE 13 & 14: Interactive Recharts Section */}
      <section id="charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Tasks by Status (Pie / Doughnut Chart) */}
        <div className="bg-white dark:bg-[#121826] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Task Status Overview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribution of task workflows
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Doughnut
            </span>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    color: '#fff',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                <text
                  x="50%"
                  y="45%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-900 dark:fill-white font-extrabold text-2xl"
                >
                  {summaryStats.total}
                </text>
                <text
                  x="50%"
                  y="57%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-400 text-xs font-medium"
                >
                  Tasks
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Tasks by Priority (Bar Chart) */}
        <div className="bg-white dark:bg-[#121826] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Task Priority Breakdown
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Task urgency breakdown
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Bar Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#334155" />
                <XAxis dataKey="priority" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis allowDecimals={false} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* PHASE 13: Recent Tasks Section (Table View matching screenshot) */}
      <section className="bg-white dark:bg-[#121826] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Tasks List
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recently added or updated activities
            </p>
          </div>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View All Tasks</span>
            <HiOutlineArrowNarrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="text-center py-10">
            <HiOutlineClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No tasks found
            </p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Get started by creating your first task.
            </p>
            <button
              onClick={handleOpenTaskModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors"
            >
              <HiOutlinePlus className="w-4 h-4" /> Create Task
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Task Name</th>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3">Assigned To</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentTasks.map((task) => {
                  const assignedName = task.assignedUser?.name || 'Test User';
                  const initials = assignedName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={task._id}
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                        {task.title}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                        {task.tags?.[0] || 'TaskFlow Core'}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-[10px] text-white font-bold">
                            {initials}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {assignedName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Oct 28-30'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                            task.priority === 'High'
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : task.priority === 'Medium'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}
                        >
                          {task.priority || 'Low'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                            task.status === 'Completed'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : task.status === 'In Progress'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {task.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
      />
    </div>
  );
}
