import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  fetchTasks,
  fetchTaskStats,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  clearTaskError,
} from '../store/slices/tasksSlice';

/**
 * Custom hook to interact with tasks state and operations
 * Demonstrates:
 * - useCallback for memoized action handlers
 * - useMemo for derived state and metrics
 */
export const useTasks = () => {
  const dispatch = useDispatch();
  const {
    tasks,
    currentTask,
    pagination,
    stats,
    loading,
    statsLoading,
    actionLoading,
    error,
  } = useSelector((state) => state.tasks);

  // useCallback hook: memoize task fetching with query parameters
  const getTasks = useCallback(
    (params) => dispatch(fetchTasks(params)),
    [dispatch]
  );

  // useCallback hook: memoize stats fetching
  const getStats = useCallback(
    () => dispatch(fetchTaskStats()),
    [dispatch]
  );

  // useCallback hook: memoize single task fetching
  const getTaskById = useCallback(
    (id) => dispatch(fetchTaskById(id)),
    [dispatch]
  );

  // useCallback hook: memoize task creation
  const handleCreateTask = useCallback(
    (taskData) => dispatch(createTask(taskData)),
    [dispatch]
  );

  // useCallback hook: memoize task update
  const handleUpdateTask = useCallback(
    (id, taskData) => dispatch(updateTask({ id, taskData })),
    [dispatch]
  );

  // useCallback hook: memoize task deletion
  const handleDeleteTask = useCallback(
    (id) => dispatch(deleteTask(id)),
    [dispatch]
  );

  // useCallback hook: clear error
  const handleClearError = useCallback(
    () => dispatch(clearTaskError()),
    [dispatch]
  );

  // useMemo hook: calculate quick completion rate metric
  const completionRate = useMemo(() => {
    if (!stats || !stats.total || stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);

  return {
    tasks,
    currentTask,
    pagination,
    stats,
    completionRate,
    loading,
    statsLoading,
    actionLoading,
    error,
    fetchTasks: getTasks,
    fetchStats: getStats,
    fetchTaskById: getTaskById,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    clearError: handleClearError,
  };
};

export default useTasks;
