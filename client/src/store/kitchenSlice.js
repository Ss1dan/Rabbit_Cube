import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';

export const fetchKitchenItems = createAsyncThunk(
  'kitchen/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/kitchen');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Ошибка загрузки');
    }
  }
);

const kitchenSlice = createSlice({
  name: 'kitchen',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKitchenItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKitchenItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchKitchenItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Ошибка загрузки кухни';
      });
  }
});

export default kitchenSlice.reducer;