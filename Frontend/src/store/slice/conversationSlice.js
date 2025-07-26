import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    conversations: [],
    loading: false,
    error: null,
};

//this is the output of response(console.log(response))
// {
//     data: {
//         conversations: [
//             { _id: "...", participants: [...], messages: [...], ... }
//             // ...more conversations
//         ]
//     },
//     status: 200,
//         statusText: "OK",
//             headers: { ... },
//     config: { ... },
//     request: { ... }
// }
//console.log(response) prints the full Axios response object, 
// which includes your backend data under response.data and 
// other useful info like status and headers.

export const fetchConversationsThunk = createAsyncThunk('conversations/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('http://localhost:3000/api/message/get-conversations', {
                withCredentials: true
            });
            console.log(response);
            return response.data.conversations;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const createConversationThunk = createAsyncThunk('conversations/createConversation',
    async (participants, { rejectWithValue }) => {
        try {
            // participants: array of { participantId, participantModel }
            const response = await axios.post('http://localhost:3000/api/message/conversations',
                { participants },
                { withCredentials: true }
            );

            return response.data.data; // the new conversation
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const addParticipantThunk = createAsyncThunk('conversations/addParticipant',
    async ({ conversationId, participantId, participantModel, role }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`http://localhost:3000/api/message/conversations/${conversationId}/participants`,
                { participantId, participantModel, role },
                { withCredentials: true }
            );

            return response.data.data; // updated conversation
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const removeParticipantThunk = createAsyncThunk('conversations/removeParticipant',
    async ({ conversationId, participantId, participantModel }, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`http://localhost:3000/api/message/conversations/${conversationId}/participants`,
                {
                    data: { participantId, participantModel },
                    withCredentials: true
                }
            );

            return response.data.data; // updated conversation
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);



const conversationSlice = createSlice({
    name: 'conversations',
    initialState,
    reducers: {
        resetConversationsState: (state) => {
            state.conversations = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversationsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConversationsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations = action.payload;
            })
            .addCase(fetchConversationsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Create conversation
            .addCase(createConversationThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createConversationThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations.unshift(action.payload); // add new conversation to the top
                // Optionally, set the new conversation as current
                state.currentConversationId = action.payload._id;
            })
            .addCase(createConversationThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Add participant
            .addCase(addParticipantThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addParticipantThunk.fulfilled, (state, action) => {
                state.loading = false;
                // update the conversation in the list
                const updated = action.payload;
                state.conversations = state.conversations.map(conv =>
                    conv._id === updated._id ? updated : conv
                );
            })
            .addCase(addParticipantThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Remove participant
            .addCase(removeParticipantThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeParticipantThunk.fulfilled, (state, action) => {
                state.loading = false;
                // update the conversation in the list
                const updated = action.payload;
                state.conversations = state.conversations.map(conv =>
                    conv._id === updated._id ? updated : conv
                );
            })
            .addCase(removeParticipantThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const { resetConversationsState } = conversationSlice.actions;
export default conversationSlice.reducer;
