import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';

export const fetchHistory = createAsyncThunk('history/fetch', async (page = 1, { rejectWithValue }) => {
  try {
    const res = await API.get(`/user/bookings/history?page=${page}&limit=4`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const cancelBooking = createAsyncThunk('history/cancel', async (bookingId, { rejectWithValue }) => {
  try {
    await API.put(`/user/bookings/${bookingId}/cancel`);
    return bookingId;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const historySlice = createSlice({
  name: 'history',
  initialState: {
    bookings: [],
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.history;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchHistory.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message; })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter(b => b.id !== action.payload);
      })
      .addCase(cancelBooking.rejected, (state, action) => { state.error = action.payload?.message; })
  }
});

export default historySlice.reducer;