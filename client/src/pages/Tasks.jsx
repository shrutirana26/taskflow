import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Modal from '../components/Modal';
import { fetchTasks, updateTask, deleteTask } from '../store/slices/tasksSlice';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineSortAscending,
  HiOutlineSortDescending,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineTrash,
  HiOutlineFilter,
} from 'react-icons/hi';

export default function Tasks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // REQUIRED REACT CONCEPT: useState
  // Local state for search, filters, pagination, sorting, and modals
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Task modals and delete confirmation modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // REQUIRED CUSTOM HOOK: useDebounce
  // Debounce search input by 350ms before firing server query
  const debouncedSearch = useDebounce(searchInput, 350);

  // Redux store state
  const { tasks, pagination, loading, actionLoading } = useSelector(
    (state) => state.tasks
  );

  // REQUIRED REACT CONCEPT: useEffect
  // Trigger server-side fetch with pagination, filters, sorting & debounced search
  useEffect(() => {
    const params = {
      page,
      limit,
      sortBy,
      order,
    };

    if (debouncedSearch && debouncedSearch.trim() !== '') {
      params.search = debouncedSearch.trim();
    }
    if (statusFilter !== 'All') {
      params.status = statusFilter;
    }
    if (priorityFilter !== 'All') {
      params.priority = priorityFilter;
    }

    dispatch(fetchTasks(params));
  }, [dispatch, debouncedSearch, statusFilter, priorityFilter, sortBy, order, page]);

  // Reset to page 1 whenever filters or search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter]);

  // REQUIRED REACT CONCEPT: useCallback
  // Handler passed to child TaskCard components for edit
  const handleEdit = useCallback((task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  }, []);

  // REQUIRED REACT CONCEPT: useCallback
  // Handler passed to child TaskCard components to trigger delete confirmation
  const handleDeletePrompt = useCallback((id) => {
    setTaskToDeleteId(id);
    setIsDeleteModalOpen(true);
  }, []);

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!taskToDeleteId) return;
    try {
      await dispatch(deleteTask(taskToDeleteId)).unwrap();
      toast.success('Task deleted successfully');
      setIsDeleteModalOpen(false);
      setTaskToDeleteId(null);
    } catch (err) {
      toast.error(err || 'Failed to delete task');
    }
  };

  // REQUIRED REACT CONCEPT: useCallback
  // Handler for quick status change directly from card
  const handleStatusChange = useCallback(
    async (id, newStatus) => {
      try {
        await dispatch(updateTask({ id, taskData: { status: newStatus } })).unwrap();
        toast.success(`Status changed to ${newStatus}`);
      } catch (err) {
        toast.error('Failed to update status');
      }
    },
    [dispatch]
  );

  // REQUIRED REACT CONCEPT: useMemo
  // Memoize active filter indicator
  const hasActiveFilters = useMemo(() => {
    return (
      searchInput !== '' ||
      statusFilter !== 'All' ||
      priorityFilter !== 'All' ||
      sortBy !== 'createdAt' ||
      order !== 'desc'
    );
  }, [searchInput, statusFilter, priorityFilter, sortBy, order]);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setSearchInput('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setSortBy('createdAt');
    setOrder('desc');
    setPage(1);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tasks Board
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize, prioritize, and manage tasks across your team workflow
          </p>
        </div>
        <button
          onClick={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all text-sm self-start sm:self-auto"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Control Bar: Debounced Search, Status/Priority Filters, Sorting */}
      <section className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input with useDebounce */}
        <div className="relative flex-1 max-w-md">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by task title (debounced)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters and Sorting controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>

          {/* Sort By Field */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="createdAt">Date Created</option>
            <option value="dueDate">Due Date</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title={`Order: ${order === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {order === 'asc' ? (
              <HiOutlineSortAscending className="w-4 h-4" />
            ) : (
              <HiOutlineSortDescending className="w-4 h-4" />
            )}
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </section>

      {/* Task List Grid */}
      {loading ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No tasks match your criteria
          </p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Try adjusting your search filters or create a new task.
          </p>
          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-500"
          >
            <HiOutlinePlus className="w-4 h-4" /> Create New Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDeletePrompt}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* PHASE 12 & 14 BONUS: Server-side Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-600 dark:text-slate-400">
          <div>
            Showing page <span className="font-semibold text-slate-900 dark:text-white">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{pagination.totalPages}</span> ({pagination.total} total items)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <HiOutlineChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 font-medium">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNextPage}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <span>Next</span>
              <HiOutlineChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
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
            Are you sure you want to delete this task? This action cannot be undone.
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
              onClick={handleConfirmDelete}
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
