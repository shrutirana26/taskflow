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
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Tasks by Status (Pie / Doughnut Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tasks by Status
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribution of task workflows
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Doughnut
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Tasks by Priority (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tasks by Priority
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
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="priority" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
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

      {/* PHASE 13: Recent Tasks Section */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Tasks
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
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTasks.map((task) => (
              <div
                key={task._id}
                onClick={() => navigate(`/tasks/${task._id}`)}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-3 rounded-xl transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineFlag className="w-3.5 h-3.5" />
                      {task.priority || 'Medium'}
                    </span>
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1">
                        <HiOutlineCalendar className="w-3.5 h-3.5" />
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    {task.assignedUser && (
                      <span className="inline-flex items-center gap-1">
                        <HiOutlineUser className="w-3.5 h-3.5" />
                        {task.assignedUser.name || 'Assigned'}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    task.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : task.status === 'In Progress'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {task.status || 'Pending'}
                </span>
              </div>
            ))}
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
