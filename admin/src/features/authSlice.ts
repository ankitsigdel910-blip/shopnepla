import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { getErrorMessage } from '../services/api';
import { AdminUser } from '../types';

interface AuthState {
  user: AdminUser | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  checked: boolean;
}

const initialState: AuthState = { user: null, status: 'idle', error: null, checked: false };

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', payload);
      if (data.data.user.role !== 'admin') {
        throw new Error('This account does not have admin access');
      }
      return data.data;
    } catch (err) {
      return rejectWithValue(err instanceof Error && err.message.includes('admin access') ? err.message : getErrorMessage(err));
    }
  }
);

export const fetchAdminMe = createAsyncThunk('auth/adminMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    if (data.data.user.role !== 'admin') throw new Error('not admin');
    return data.data.user as AdminUser;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const adminLogout = createAsyncThunk('auth/adminLogout', async () => {
  await api.post('/auth/logout');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(adminLogin.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.user = a.payload.user;
        s.checked = true;
        localStorage.setItem('admin_token', a.payload.token);
      })
      .addCase(adminLogin.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload as string; })
      .addCase(fetchAdminMe.fulfilled, (s, a) => { s.user = a.payload; s.checked = true; })
      .addCase(fetchAdminMe.rejected, (s) => { s.user = null; s.checked = true; })
      .addCase(adminLogout.fulfilled, (s) => { s.user = null; localStorage.removeItem('admin_token'); });
  },
});

export default authSlice.reducer;
