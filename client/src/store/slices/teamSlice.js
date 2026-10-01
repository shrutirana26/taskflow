import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// Fetch all teams
export const fetchTeams = createAsyncThunk('teams/fetchTeams', async (_, thunkAPI) => {
  try {
    const { data } = await API.get('/teams');
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch teams');
  }
});

// Get single team
export const fetchTeam = createAsyncThunk('teams/fetchTeam', async (id, thunkAPI) => {
  try {
    const { data } = await API.get(`/teams/${id}`);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch team');
  }
});

// Create team
export const createTeam = createAsyncThunk('teams/createTeam', async (teamData, thunkAPI) => {
  try {
    const { data } = await API.post('/teams', teamData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create team');
  }
});

// Update team
export const updateTeam = createAsyncThunk('teams/updateTeam', async ({ id, teamData }, thunkAPI) => {
  try {
    const { data } = await API.put(`/teams/${id}`, teamData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update team');
  }
});

// Delete team
export const deleteTeam = createAsyncThunk('teams/deleteTeam', async (id, thunkAPI) => {
  try {
    await API.delete(`/teams/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete team');
  }
});

// Add member
export const addMember = createAsyncThunk('teams/addMember', async ({ teamId, email, role }, thunkAPI) => {
  try {
    const { data } = await API.post(`/teams/${teamId}/members`, { email, role });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add member');
  }
});

// Remove member
export const removeMember = createAsyncThunk('teams/removeMember', async ({ teamId, userId }, thunkAPI) => {
  try {
    const { data } = await API.delete(`/teams/${teamId}/members/${userId}`);
    return { teamId, data };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to remove member');
  }
});

const teamSlice = createSlice({
  name: 'teams',
  initialState: {
    teams: [],
    currentTeam: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearTeamError: (state) => { state.error = null; },
    clearCurrentTeam: (state) => { state.currentTeam = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload.data;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single team
      .addCase(fetchTeam.pending, (state) => { state.loading = true; })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTeam = action.payload.data;
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create team
      .addCase(createTeam.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.unshift(action.payload.data);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update team
      .addCase(updateTeam.pending, (state) => { state.error = null; })
      .addCase(updateTeam.fulfilled, (state, action) => {
        const index = state.teams.findIndex((t) => t._id === action.payload.data._id);
        if (index !== -1) state.teams[index] = action.payload.data;
        if (state.currentTeam?._id === action.payload.data._id) {
          state.currentTeam = action.payload.data;
        }
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete team
      .addCase(deleteTeam.pending, (state) => { state.error = null; })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter((t) => t._id !== action.payload);
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Add member
      .addCase(addMember.pending, (state) => { state.error = null; })
      .addCase(addMember.fulfilled, (state, action) => {
        const index = state.teams.findIndex((t) => t._id === action.payload.data._id);
        if (index !== -1) state.teams[index] = action.payload.data;
        if (state.currentTeam?._id === action.payload.data._id) {
          state.currentTeam = action.payload.data;
        }
      })
      .addCase(addMember.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove member
      .addCase(removeMember.pending, (state) => { state.error = null; })
      .addCase(removeMember.fulfilled, (state, action) => {
        const { teamId, data } = action.payload;
        const index = state.teams.findIndex((t) => t._id === teamId);
        if (index !== -1) state.teams[index] = data.data;
        if (state.currentTeam?._id === teamId) {
          state.currentTeam = data.data;
        }
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearTeamError, clearCurrentTeam } = teamSlice.actions;
export default teamSlice.reducer;
