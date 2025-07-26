import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    messages: [],
    loading: false,
    error: null,
};

const API_BASE_URL = 'http://localhost:3000';

export const getMessageThunk = createAsyncThunk('messages/fetchMessages',
    async (conversationId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/message/send-message/${conversationId}`, { withCredentials: true });
            return response.data.messages;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const sendMessageThunk = createAsyncThunk('messages/sendMessage',
    async ({ conversationId, senderId, senderModel, message }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/message/send-message`,
                { conversationId, senderId, senderModel, message },
                { withCredentials: true }
            );
            return response.data.data; // the new message
        } catch (err) {
            console.log("error is", err);
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const messageSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        resetMessagesState: (state) => {
            state.messages = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMessageThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMessageThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(getMessageThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // sendMessage
            .addCase(sendMessageThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendMessageThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.messages.push(action.payload); // add new message to the list
            })
            .addCase(sendMessageThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const { resetMessagesState } = messageSlice.actions;
export default messageSlice.reducer;