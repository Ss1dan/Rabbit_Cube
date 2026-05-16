import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';

export const fetchComputers = createAsyncThunk('computers/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/computers');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const fetchComputerById = createAsyncThunk('computers/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await API.get(`/computers/${id}`);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const fetchOccupiedForSlot = createAsyncThunk('computers/occupied', async ({ date, start_time, end_time }, { rejectWithValue }) => {
  try {
    const response = await API.get('/computers/occupied/slot', { params: { date, start_time, end_time } });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const computerSlice = createSlice({
  name: 'computers',
  initialState: {
    list: [],
    selectedComputer: null,
    occupiedIds: [],
    loading: false,
    error: null
  },
  reducers: {
    clearSelected: (state) => {
      state.selectedComputer = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComputers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchComputers.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchComputers.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message; })
      .addCase(fetchComputerById.pending, (state) => { state.loading = true; })
      .addCase(fetchComputerById.fulfilled, (state, action) => { state.loading = false; state.selectedComputer = action.payload; })
      .addCase(fetchComputerById.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message; })
      .addCase(fetchOccupiedForSlot.fulfilled, (state, action) => { state.occupiedIds = action.payload; })
      .addCase(fetchOccupiedForSlot.rejected, (state, action) => { state.error = action.payload?.message; });
  }
});

export const { clearSelected } = computerSlice.actions;
export default computerSlice.reducer;