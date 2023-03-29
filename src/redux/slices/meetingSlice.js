import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const createMeeting = createAsyncThunk(
  'meeting/createMeeting',
  async ({ newMeeting }, { rejectWithValue }) => {
    try {
      const token = window.localStorage.getItem('token');

      if (!token) throw new Error('No token found in local storage...');

      const { data } = await axios.post(API_URL + '/api/meeting', newMeeting, {
        headers: {
          authorization: token,
        },
      });

      return data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error);
    }
  }
);

export const updateMeeting = createAsyncThunk(
  'meeting/updateMeeting',
  async ({ token, meetingId, meetingUpdates }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        API_URL + `/api/meeting/${meetingId}`,
        meetingUpdates,
        {
          headers: {
            authorization: token,
          },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error);
    }
  }
);

export const getMeeting = createAsyncThunk(
  'meeting/getOne',
  async ({ meetingId, userId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      let route;

      if (!token) throw new Error('No token provided');

      if (userId !== undefined) {
        route = API_URL + `/api/user/${userId}/meeting/${meetingId}`;
      } else {
        route = API_URL + `/api/meeting/${meetingId}`;
      }

      const { data } = await axios.get(route, {
        headers: {
          authorization: token,
        },
      });

      if (data.yelpBusinessId) {
        const yelpRes = await axios.get(
          API_URL + `/api/search/restaurants/${data.yelpBusinessId}`,
          {
            headers: {
              authorization: token,
            },
          }
        );
        data.restaurant = yelpRes.data;
      }

      return data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error);
    }
  }
);

export const getBusinessInfo = createAsyncThunk(
  'meeting/getBusiness',
  async (yelpBusinessId, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    try {
      console.log(API_URL + `/api/search/restaurants/${yelpBusinessId}`);
      const { data } = await axios.get(
        API_URL + `/api/search/restaurants/${yelpBusinessId}`,
        {
          headers: {
            authorization: token,
          },
        }
      );
      return data;
    } catch (error) {
      rejectWithValue(error);
    }
  }
);

export const deleteMeeting = createAsyncThunk(
  'meeting/deleteMeeting',
  async ({ token, meetingId }, { rejectWithValue }) => {
    try {
      const res = await axios.delete(API_URL + `/api/meeting/${meetingId}`, {
        headers: {
          authorization: token,
        },
      });
      return { res, meetingId };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getMeetingMessages = createAsyncThunk(
  'meeting/getMessages',
  async ({ token, meetingId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        API_URL + `/api/meeting/${meetingId}/messages`,
        {
          headers: {
            authorization: token,
          },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error);
    }
  }
);

export const addMessage = createAsyncThunk(
  'meeting/addMessage',
  async ({ token, meetingId, newMessage }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        API_URL + `/api/meeting/${meetingId}/messages`,
        { message: newMessage },
        {
          headers: {
            authorization: token,
          },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error);
    }
  }
);

export const addRating = createAsyncThunk(
  'meeting/addRating',
  async ({ meetingId, newRating }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Must be logged in to leave a rating');

      const { data } = await axios.post(
        API_URL + `/api/meeting/${meetingId}/rating`,
        newRating,
        {
          headers: {
            authorization: token,
          },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const upholdRating = createAsyncThunk(
  'meeting/upholdRating',
  async ({ token, ratingId, decision }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        API_URL + `/api/rating/${ratingId}`,
        { reportIsUpheld: decision },
        {
          headers: {
            authorization: token,
          },
        }
      );
      return data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error);
    }
  }
);

const meetingSlice = createSlice({
  name: 'meetings',
  initialState: {
    meetings: [],
    meeting: {},
    isLoading: false,
    error: '',
    status: {},
    business: {},
  },
  reducers: {
    resetMeetingStatus: (state) => {
      state.status = {};
      state.meetings = [];
      state.meeting = {};
      state.error = '';
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create a new meeting
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.meetings.push(action.payload);
        state.meeting = action.payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(createMeeting.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // Update a meeting
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.meeting = action.payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(updateMeeting.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // Get a single meeting (Already includes the messages)
      .addCase(getMeeting.fulfilled, (state, action) => {
        state.meeting = action.payload;
        if (!state.meetings.some((meeting) => meeting.id === action.payload.id))
          state.meetings.push(action.payload);
        state.isLoading = false;
        state.error = '';
      })
      .addCase(getMeeting.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMeeting.rejected, (state, action) => {
        console.log('ERROR PAYLOAD', action.payload);
        state.isLoading = false;
        state.error = action.payload.response.data;
      })
      // Delete a meeting
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        // payload comes in form {res, meetingId}
        if (action.payload.res.status === 204) {
          state.meetings = state.meetings.filter(
            (meeting) => meeting.id !== action.payload.meetingId
          );
        }
        state.isLoading = false;
        state.error = '';
      })
      .addCase(deleteMeeting.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // Get a messages for a particular meeting
      .addCase(getMeetingMessages.fulfilled, (state, action) => {
        // Payload includes messages for this particular meeting
        console.log(action.payload);
        state.meeting = action.payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(getMeetingMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMeetingMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // Add a message
      .addCase(addMessage.fulfilled, (state, action) => {
        state.meeting.messages.push(action.payload);
        state.isLoading = false;
        state.error = '';
      })
      .addCase(addMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.response.data;
      })
      // Add a rating to a meeting
      .addCase(addRating.fulfilled, (state) => {
        state.isLoading = false;
        state.error = '';
      })
      .addCase(addRating.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addRating.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // No payload returned, thunk updates the rating
      .addCase(upholdRating.fulfilled, (state) => {
        state.isLoading = false;
        state.error = '';
      })
      .addCase(upholdRating.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(upholdRating.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.response.data;
      })
      // Get business info
      .addCase(getBusinessInfo.fulfilled, (state, action) => {
        state.business[action.payload.id] = action.payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(getBusinessInfo.rejected, (state, action) => {
        state.error = action.payload.response.data;
        state.isLoading = false;
      })
      .addCase(getBusinessInfo.pending, (state, action) => {
        state.isLoading = true;
        state.error = '';
      });
  },
});

export const selectMeetings = (state) => state.meetings;
export const { resetMeetingStatus } = meetingSlice.actions;
export default meetingSlice.reducer;
