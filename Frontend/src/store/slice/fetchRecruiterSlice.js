import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchRecruitersThunk = createAsyncThunk('recruiters/fetchRecruiters',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('http://localhost:3000/api/college/recruiters', {
                withCredentials: true
            });

            return response.data.recruiters || [];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const recruiterSlice = createSlice({
    name: 'recruiters',
    initialState: {
        recruiters: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRecruitersThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRecruitersThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.recruiters = action.payload;
            })
            .addCase(fetchRecruitersThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export default recruiterSlice.reducer;
