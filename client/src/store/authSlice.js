import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api';

export const signup = createAsyncThunk('auth/signup', async (userData, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/signup', userData);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const signin = createAsyncThunk('auth/signin', async (credentials, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/signin', credentials);
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
    }
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const confirmEmail = createAsyncThunk('auth/confirmEmail', async (token, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/confirm', { token });
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
    }
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const googleAuth = createAsyncThunk('auth/googleAuth', async (token, { rejectWithValue }) => {
  try {
    const response = await API.post('/auth/google', { token });
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
    }
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token');
    const response = await API.get('/user/profile');
    return response.data;
  } catch (err) {
    localStorage.removeItem('token');
    throw err;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    roles: [],
    isAuth: false,
    loading: false,
    error: null,
    checked: false,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.roles = [];
      state.isAuth = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Ошибка регистрации';
      })
      .addCase(signin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { id: action.payload.id, login: action.payload.login, email: action.payload.email };
        state.roles = action.payload.roles;
        state.token = action.payload.accessToken;
        state.isAuth = true;
      })
      .addCase(signin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Ошибка входа';
      })
      .addCase(confirmEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { id: action.payload.user.id, login: action.payload.user.login, email: action.payload.user.email };
        state.roles = action.payload.roles;
        state.token = action.payload.accessToken;
        state.isAuth = true;
      })
      .addCase(confirmEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Ошибка подтверждения';
      })
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { id: action.payload.id, login: action.payload.login, email: action.payload.email };
        state.roles = action.payload.roles;
        state.token = action.payload.accessToken;
        state.isAuth = true;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Ошибка входа через Google';
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuth = true;
        state.checked = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuth = false;
        state.user = null;
        state.roles = [];
        state.token = null;
        state.checked = true;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;