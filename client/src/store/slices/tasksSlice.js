import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../../services/api';

// Fetch tasks with query parameters (search, status, priority, sortBy, order, page, limit)
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await taskService.getTasks(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch tasks'
      );
    }
  }
);

// Fetch task statistics summary for dashboard
export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchTaskStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await taskService.getStatsSummary();
      return data.stats || data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch task stats'
      );
    }
  }
);

// Fetch single task details by ID
export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await taskService.getTaskById(id);
      return data.task || data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch task details'
      );
    }
  }
);

// Create a new task
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const data = await taskService.createTask(taskData);
      return data.task || data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create task'
      );
    }
  }
);

// Update existing task
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const data = await taskService.updateTask(id, taskData);
      return data.task || data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update task'
      );
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete task'
      );
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    currentTask: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
    stats: {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      byStatus: [],
      byPriority: [],
      recentTasks: [],
    },
    loading: false,
    statsLoading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks || action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        if (action.payload.stats) {
          state.stats = { ...state.stats, ...action.payload.stats };
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch task stats
      .addCase(fetchTaskStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.statsLoading = false;
      })

      // Fetch single task
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create task
      .addCase(createTask.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.tasks.unshift(action.payload);
        state.pagination.total += 1;
        state.stats.total += 1;
        if (action.payload.status === 'Pending') state.stats.pending += 1;
        else if (action.payload.status === 'In Progress') state.stats.inProgress += 1;
        else if (action.payload.status === 'Completed') state.stats.completed += 1;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update task
      .addCase(updateTask.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask && state.currentTask._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.actionLoading = false;
        const deletedId = action.payload;
        const taskToDelete = state.tasks.find((t) => t._id === deletedId);
        if (taskToDelete) {
          state.stats.total = Math.max(0, state.stats.total - 1);
          if (taskToDelete.status === 'Pending') state.stats.pending = Math.max(0, state.stats.pending - 1);
          else if (taskToDelete.status === 'In Progress') state.stats.inProgress = Math.max(0, state.stats.inProgress - 1);
          else if (taskToDelete.status === 'Completed') state.stats.completed = Math.max(0, state.stats.completed - 1);
        }
        state.tasks = state.tasks.filter((t) => t._id !== deletedId);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.currentTask && state.currentTask._id === deletedId) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentTask, clearTaskError } = tasksSlice.actions;
export default tasksSlice.reducer;
