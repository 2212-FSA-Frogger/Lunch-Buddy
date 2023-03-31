import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import checkToken from '../../utilities/checkToken';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId, { rejectWithValue }) => {
    try {
      const { token, user } = await checkToken();

      if (userId === undefined) throw new Error('No user ID provided');

      const res = await axios.get(API_URL + `/api/user/${userId}`, {
        headers: { authorization: token },
      });
      const userInfo = res.data;

      if (!userInfo) throw new Error('Failed to retrieve user information');

      return userInfo;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createNewUser = createAsyncThunk(
  'user/createNewUser',
  async (userSetupData, { rejectWithValue }) => {
    try {
      // create user
      let res = await axios.post(API_URL + '/api/user', userSetupData);
      let newUser = res.data;

      if (!newUser) throw new Error('User creation failed');

      // login & store token
      res = await axios.post(API_URL + '/api/auth/login', {
        email: userSetupData.email,
        password: userSetupData.password,
      });
      if (!res.data?.token) throw new Error('Login failed');
      localStorage.setItem('token', res.data.token);

      return newUser;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (userUpdateData, { rejectWithValue }) => {
    try {
      const { token, user } = await checkToken();

      // request update
      const res = await axios.put(
        API_URL + `/api/user/${user.id}`,
        userUpdateData,
        {
          headers: { authorization: token },
        }
      );
      const updatedUser = res.data;

      if (!updatedUser.id) throw new Error('Failed to update user');

      return updatedUser;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateLocation = createAsyncThunk(
  'user/updateLocation',
  async (location, { rejectWithValue }) => {
    try {
      const { token, user } = await checkToken();

      const res = await axios.put(
        API_URL + `/api/user/${user.id}/location`,
        location,
        { headers: { authorization: token } }
      );

      const updatedUser = res.data;
      if (!updatedUser) throw new Error('Failed to update user location');

      return updatedUser;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const banUser = createAsyncThunk(
  'user/banUser',
  async (userId, { rejectWithValue }) => {
    try {
      const { token, user } = await checkToken();

      const res = await axios.put(
        API_URL + `/api/user/${userId}`,
        { status: 'banned' },
        { headers: { authorization: token } }
      );

      const updatedUser = res.data;

      if (!updatedUser.id) throw new Error('Failed to update user status');

      return updatedUser;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const removeBan = createAsyncThunk(
  'user/removeBan',
  async (userId, { rejectWithValue }) => {
    try {
      const { token, user } = await checkToken();

      const res = await axios.put(
        API_URL + `/api/user/${userId}`,
        { status: 'inactive' },
        { headers: { authorization: token } }
      );

      const updatedUser = res.data;

      if (!updatedUser.id) throw new Error('Failed to update user status');

      return updatedUser;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchUserMeetings = createAsyncThunk(
  'user/fetchUserMeetings',
  async (userId, { rejectWithValue }) => {
    try {
      const { user, token } = await checkToken();

      // if userId isn't passed in, use the one from the token
      if (userId === undefined) userId = user.id;

      const res = await axios.get(API_URL + `/api/user/${userId}/meeting`, {
        headers: { authorization: token },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const checkUserCreated = createAsyncThunk(
  'user/checkUserCreated',
  async (x, { getState }) => {
    return getState().user;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {},
    userMeetings: [],
    error: '',
    isLoading: false,
  },
  reducers: {
    resetUserState: (state) => {
      state.user = {};
      state.userMeetings = [];
      state.error = '';
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // FETCH USER
    builder
      .addCase(fetchUser.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(fetchUser.pending, (state, { payload }) => {
        state.user = {};
        state.isLoading = true;
        state.error = '';
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.user = {};
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // CREATE NEW USER
      .addCase(createNewUser.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(createNewUser.pending, (state, { payload }) => {
        state.user = {};
        state.isLoading = true;
        state.error = '';
      })
      .addCase(createNewUser.rejected, (state, action) => {
        state.user = {};
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // UPDATE USER (general purpose)
      .addCase(updateUser.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(updateUser.pending, (state, { payload }) => {
        state.user = {};
        state.isLoading = true;
        state.error = '';
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.user = {};
        state.isLoading = false;
        state.error = action.payload.message;
      })

      // UPDATE USER LOCATION
      .addCase(updateLocation.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(updateLocation.pending, (state, { payload }) => {
        state.user = {};
        state.isLoading = true;
        state.error = '';
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.user = {};
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // BAN USER
      .addCase(banUser.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(banUser.pending, (state, { payload }) => {
        state.user = {};
        state.isLoading = true;
        state.error = '';
      })
      .addCase(banUser.rejected, (state, action) => {
        state.user = {};
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // REMOVE USER BAN
      .addCase(removeBan.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(removeBan.pending, (state, { payload }) => {
        state.user = {};
        state.isLoading = true;
        state.error = '';
      })
      .addCase(removeBan.rejected, (state, action) => {
        state.user = {};
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // Checks if user had error when creating account
      .addCase(checkUserCreated.fulfilled, (state, action) => {
        return action.payload;
      })
      // FETCH USER MEETINGS
      .addCase(fetchUserMeetings.fulfilled, (state, { payload }) => {
        state.userMeetings = payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(fetchUserMeetings.pending, (state, action) => {
        state.userMeetings = [];
        state.isLoading = true;
        state.error = '';
      })
      .addCase(fetchUserMeetings.rejected, (state, action) => {
        state.userMeetings = [];
        state.isLoading = false;
        state.error = action.payload.response.data;
      });
  },
});

export const selectUser = (state) => state.user.user;
export const selectUserLoading = (state) => state.user.isLoading;
export const selectUserError = (state) => state.user.error;
export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
