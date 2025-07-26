import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/student';

// Fetch student video calls
export const fetchStudentVideoCallsThunk = createAsyncThunk(
    'studentVideoCalls/fetchStudentVideoCalls',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE}/video-calls`, {
                withCredentials: true
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch video calls');
        }
    }
);

const studentVideoCallSlice = createSlice({
    name: 'studentVideoCalls',
    initialState: {
        videoCalls: [],
        loading: false,
        error: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudentVideoCallsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentVideoCallsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.videoCalls = action.payload;
            })
            .addCase(fetchStudentVideoCallsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = studentVideoCallSlice.actions;
export default studentVideoCallSlice.reducer;