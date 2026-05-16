import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';

export const fetchProfile = createAsyncThunk('profile/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await API.get('/user/profile');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const updateProfile = createAsyncThunk('profile/update', async (formData, { rejectWithValue }) => {
  try {
    const res = await API.put('/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data: null,
    loading: false,
    error: null
  },
  reducers: {
    clearProfile: (state) => {
      state.data = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; })
      .addCase(fetchProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message; })
      .addCase(updateProfile.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProfile.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; })
      .addCase(updateProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message; })
  }
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;