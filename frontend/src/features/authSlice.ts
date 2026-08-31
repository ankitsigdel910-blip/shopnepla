import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../services/authService';
import { getErrorMessage } from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = { user: null, status: 'idle', error: null };

export const register = createAsyncThunk(
  'auth/register',
  async (payload: { name: string; email: string; phone: string; password: string; confirmPassword: string }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.register(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email?: string; phone?: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authApi.me();
    return data.data.user as User;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.user = a.payload.user;
        localStorage.setItem('token', a.payload.token);
      })
      .addCase(register.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload as string;
      })
      .addCase(login.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.user = a.payload.user;
        localStorage.setItem('token', a.payload.token);
      })
      .addCase(login.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload as string;
      })
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.user = a.payload;
        s.status = 'succeeded';
      })
      .addCase(fetchMe.rejected, (s) => {
        s.user = null;
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        localStorage.removeItem('token');
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
