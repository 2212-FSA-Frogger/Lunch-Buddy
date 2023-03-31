import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import axios from 'axios';

const token = window.localStorage.getItem('token');

export const fetchAllTags = createAsyncThunk(
  'tag/getAll',
  async (placeholder, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL + '/api/tags', {
        headers: {
          authorization: token,
        },
      });
      return data;
    } catch (error) {
      console.log('Axios error trying to retrieve tags');
      return rejectWithValue(error);
    }
  }
);

export const fetchSingleTag = createAsyncThunk(
  'tag/getOne',
  async ({ token, id }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(API_URL + `/api/tags/${id}`, {
        headers: {
          authorization: token,
        },
      });
      return data;
    } catch (error) {
      console.log('Axios error trying to retrieve tag');
      return rejectWithValue(error);
    }
  }
);

export const editTag = createAsyncThunk(
  'tag/editTag',
  async ({ token, id, updates }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(API_URL + `/api/tags/${id}`, updates, {
        headers: {
          authorization: token,
        },
      });
      return data;
    } catch (error) {
      console.log('Axios error trying to edit tag');
      return rejectWithValue(error);
    }
  }
);

export const deleteTag = createAsyncThunk(
  'tag/deleteTag',
  async ({ token, id }, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(API_URL + `/api/tags/${id}`, {
        headers: {
          authorization: token,
        },
      });
      return data;
    } catch (error) {
      console.log('Axios error trying to delete tag');
      return rejectWithValue(error);
    }
  }
);

export const addTag = createAsyncThunk(
  'tag/addTag',
  async ({ token, newTag }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(API_URL + `/api/tags`, newTag, {
        headers: {
          authorization: token,
        },
      });
      return data;
    } catch (error) {
      console.log('Axios error trying to add tag');
      return rejectWithValue(error);
    }
  }
);

const tagSlice = createSlice({
  name: 'tags',
  initialState: {
    tags: [],
    tag: {},
    isLoading: false,
    error: '',
  },
  reducers: {
    resetTagStatus: (state) => {
      state.error = '';
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tags
      .addCase(fetchAllTags.fulfilled, (state, action) => {
        state.tags = action.payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(fetchAllTags.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchAllTags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // Fetch single tag
      .addCase(fetchSingleTag.fulfilled, (state, action) => {
        state.tag = action.payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(fetchSingleTag.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchSingleTag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // Edit a tag
      .addCase(editTag.fulfilled, (state, action) => {
        state.tag = action.payload;
        state.isLoading = false;
        state.error = '';
      })
      .addCase(editTag.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(editTag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // Delete a tag
      .addCase(deleteTag.fulfilled, (state, action) => {
        // removes tag from state that was just deleted
        state.tags = state.tags.filter((tag) => tag.id !== action.payload.id);
        state.isLoading = false;
        state.error = '';
      })
      .addCase(deleteTag.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.response.data;
      })

      // Add a tag
      .addCase(addTag.fulfilled, (state, action) => {
        // removes tag from state that was just deleted
        state.tags.push(action.payload);
        state.isLoading = false;
        state.error = '';
      })
      .addCase(addTag.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(addTag.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.response.data;
      });
  },
});

export const selectTags = (state) => state.tags;
export const { resetTagStatus } = tagSlice.actions;
export default tagSlice.reducer;
