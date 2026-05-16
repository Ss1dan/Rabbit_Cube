import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';

export const createBooking = createAsyncThunk('booking/create', async (data, { rejectWithValue }) => {
  try {
    const response = await API.post('/bookings', data);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const fetchActiveBooking = createAsyncThunk('booking/active', async (_, { rejectWithValue }) => {
  try {
    const response = await API.get('/bookings/active');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data?.message || 'Нет активных броней');
  }
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    activeBooking: null,
    selectedDate: new Date().toISOString(),
    selectedTimeStart: '',
    selectedTimeEnd: '',
    selectedPlace: null,
    kitchenItems: [],
    success: false,
    loading: false,
    error: null
  },
  reducers: {
    setDate: (state, action) => { state.selectedDate = action.payload.toISOString(); },
    setTimeStart: (state, action) => { state.selectedTimeStart = action.payload; },
    setTimeEnd: (state, action) => { state.selectedTimeEnd = action.payload; },
    selectPlace: (state, action) => { state.selectedPlace = action.payload; },
    toggleKitchenItem: (state, action) => {
      const id = action.payload;
      if (state.kitchenItems.includes(id)) {
        state.kitchenItems = state.kitchenItems.filter(i => i !== id);
      } else {
        state.kitchenItems.push(id);
      }
    },
    clearBooking: (state) => {
      state.selectedPlace = null;
      state.kitchenItems = [];
      state.success = false;
      state.error = null;
    },
    clearActiveBooking: (state) => {
      state.activeBooking = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createBooking.fulfilled, (state) => { state.loading = false; state.success = true; })
      .addCase(createBooking.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message || 'Ошибка бронирования'; })
      .addCase(fetchActiveBooking.fulfilled, (state, action) => { state.activeBooking = action.payload; })
      .addCase(fetchActiveBooking.rejected, (state) => { state.activeBooking = null; });
  }
});

export const { setDate, setTimeStart, setTimeEnd, selectPlace, toggleKitchenItem, clearBooking, clearActiveBooking } = bookingSlice.actions;
export default bookingSlice.reducer;