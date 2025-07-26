import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch all colleges
export const fetchCollegesThunk = createAsyncThunk('colleges/fetchColleges',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('http://localhost:3000/api/recruiter/colleges', {
                withCredentials: true,
            });
            return response.data.colleges || [];
        } catch (err) {
            return rejectWithValue(
                err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
        }
    }
);

const collegeSlice = createSlice({
    name: 'colleges',
    initialState: {
        colleges: [],
        loading: false,
        error: null,
    },
    reducers: {
        resetCollegesState: (state) => {
            state.colleges = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCollegesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCollegesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.colleges = action.payload;
            })
            .addCase(fetchCollegesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const { resetCollegesState } = collegeSlice.actions;
export default collegeSlice.reducer;
