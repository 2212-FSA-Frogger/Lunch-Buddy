import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * requestLogin accepts an object { email, password } which is used to
 * log the user in.
 *
 * The returned token is placed in both localStorage and the redux slice.
 */
export const requestLogin = createAsyncThunk(
  'auth/requestLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const { email, password } = credentials;
      let { data } = await axios.post(API_URL + '/api/auth/login', {
        email,
        password,
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
        return data;
      } else {
        throw new Error('Failed token creation');
      }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const successfulLogin = createAsyncThunk(
  'auth/successfulLogin',
  async (x, { getState }) => {
    return getState().auth;
  }
);

/**
 * tryToken takes no parameters, but it does pull token from localStorage
 * Once verified, the user info and token are placed in slice
 */
export const tryToken = createAsyncThunk(
  'tryToken',
  async (placeholder, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found in localStorage');
      }

      const { data } = await axios.get(API_URL + '/api/auth', {
        headers: {
          authorization: token,
        },
      });

      if (!data) throw new Error('Token validation failed');

      return { data, token };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: '',
    user: {},
    isLoading: false,
    error: '',
  },
  reducers: {
    resetAuthStatus: (state) => {
      state.isLoading = false;
      state.error = '';
    },
    logOut: (state) => {
      localStorage.removeItem('token');
      state.token = '';
      state.user = {};
      state.isLoading = false;
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestLogin.fulfilled, (state, { payload }) => {
        state.token = payload.token;
        state.user = {};
        state.isLoading = false;
        state.error = '';
      })
      .addCase(requestLogin.pending, (state, { payload }) => {
        state.token = '';
        state.user = {};
        state.isLoading = true;
        state.error = '';
      })
      .addCase(requestLogin.rejected, (state, action) => {
        state.token = '';
        state.user = {};
        state.isLoading = false;
        state.error = action.payload.response.data;
      })
      .addCase(tryToken.fulfilled, (state, { payload }) => {
        state.user = payload.data;
        state.isLoading = false;
        state.error = '';
        state.token = payload.token;
      })
      .addCase(tryToken.pending, (state, { payload }) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(tryToken.rejected, (state, action) => {
        // window.localStorage.removeItem('token');
        state.token = '';
        state.user = {};
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // async check to make sure a user successfully logs in before redirecting
      .addCase(successfulLogin.fulfilled, (state, action) => {
        return action.payload;
      });
  },
});

export const { resetAuthStatus, logOut } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => {
  return { isLoading: state.auth.isLoading, error: state.auth.error };
};
export default authSlice.reducer;
