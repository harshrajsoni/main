// Frontend/src/store/slice/videoCallRequestSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/request-video-call';

// Get students by college
export const getStudentsByCollegeThunk = createAsyncThunk(
    'videoCallRequests/getStudentsByCollege',
    async (collegeName, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE}/students/${collegeName}`, {
                withCredentials: true
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
        }
    }
);

// Request video call with selected students
export const requestVideoCallThunk = createAsyncThunk(
    'videoCallRequests/requestVideoCall',
    async ({ collegeId, conversationId, studentIds, message }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE}/request`, {
                collegeId,
                conversationId,
                studentIds,
                message: message || "Video call request"
            }, {
                withCredentials: true
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to request video call');
        }
    }
);

// Fetch recruiter requests
export const fetchRecruiterRequestsThunk = createAsyncThunk(
    'videoCallRequests/fetchRecruiterRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE}/recruiter-requests`, {
                withCredentials: true
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
        }
    }
);

// Fetch college requests
export const fetchCollegeRequestsThunk = createAsyncThunk(
    'videoCallRequests/fetchCollegeRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE}/college-requests`, {
                withCredentials: true
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
        }
    }
);

// Accept video call request
export const acceptVideoCallRequestThunk = createAsyncThunk(
    'videoCallRequests/acceptVideoCallRequest',
    async (payload, { rejectWithValue }) => {
        try {
            // Handle both string and object formats
            const requestId = typeof payload === 'string' ? payload : payload.requestId;

            const response = await axios.post(`${API_BASE}/accept`, {
                requestId
            }, {
                withCredentials: true
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to accept request');
        }
    }
);

// Schedule video call
export const scheduleVideoCallThunk = createAsyncThunk(
    'videoCallRequests/scheduleVideoCall',
    async ({ requestId, scheduledTime }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE}/schedule`, {
                requestId,
                scheduledTime
            }, {
                withCredentials: true
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to schedule video call');
        }
    }
);

const videoCallRequestSlice = createSlice({
    name: 'videoCallRequests',
    initialState: {
        requests: [],
        students: [],
        loading: false,
        error: null,
        studentsLoading: false,
        studentsError: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.studentsError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get students by college
            .addCase(getStudentsByCollegeThunk.pending, (state) => {
                state.studentsLoading = true;
                state.studentsError = null;
            })
            .addCase(getStudentsByCollegeThunk.fulfilled, (state, action) => {
                state.studentsLoading = false;
                state.students = action.payload;
            })
            .addCase(getStudentsByCollegeThunk.rejected, (state, action) => {
                state.studentsLoading = false;
                state.studentsError = action.payload;
            })
            // Request video call
            .addCase(requestVideoCallThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestVideoCallThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.requests.unshift(action.payload);
            })
            .addCase(requestVideoCallThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch recruiter requests
            .addCase(fetchRecruiterRequestsThunk.fulfilled, (state, action) => {
                state.requests = action.payload;
            })
            // Fetch college requests
            .addCase(fetchCollegeRequestsThunk.fulfilled, (state, action) => {
                state.requests = action.payload;
            })
            // Accept request
            .addCase(acceptVideoCallRequestThunk.fulfilled, (state, action) => {
                const index = state.requests.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.requests[index] = action.payload;
                }
            })
            // Schedule video call
            .addCase(scheduleVideoCallThunk.fulfilled, (state, action) => {
                const index = state.requests.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.requests[index] = action.payload;
                }
            });
    }
});

export const { clearError } = videoCallRequestSlice.actions;
export default videoCallRequestSlice.reducer;
