import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
};

export const loginUser = createAsyncThunk('user/loginUser',
    async ({ userType, email, password, college_email, college_password }, { rejectWithValue }) => {
        try {
            let response;
            if (userType === 'college') {
                // College login (with college_email, college_password, member email, member password)
                response = await axios.post('/api/user/login/college',
                    {
                        college_email,
                        college_password,
                        email, // member email
                        password, // member password
                    },
                    { withCredentials: true }
                    //withCredentials is for cookies.
                );
            } else if (userType === 'student' || userType === 'recruiter') {
                // Student or recruiter login
                response = await axios.post(`/api/user/login/${userType}`,
                    {
                        email,
                        password,
                    },
                    { withCredentials: true }
                );
            } else {
                return rejectWithValue('Invalid user type');
            }
            return response.data;
        } catch (err) {
            return rejectWithValue(
                err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
        }
    }
);

export const signupUser = createAsyncThunk('user/signupUser',
    async ({ userType, ...userData }, { rejectWithValue }) => {
        try {
            let response;
            if (userType === 'college') {
                // College signup
                response = await axios.post('/api/user/signup/college-signup', userData, { withCredentials: true });
            } else if (userType === 'student') {
                // Student signup
                response = await axios.post('/api/user/signup/student-signup', userData, { withCredentials: true });
            } else if (userType === 'recruiter') {
                // Recruiter signup
                response = await axios.post('/api/user/signup/recruiter-signup', userData, { withCredentials: true });
            } else {
                return rejectWithValue('Invalid user type');
            }
            return response.data;
        } catch (err) {
            return rejectWithValue(
                err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
        }
    }
);

export const logoutUser = createAsyncThunk('user/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/user/logout', {}, {
                withCredentials: true
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(
                err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
        }
    }
);

export const getProfile = createAsyncThunk('user/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            //axios.get second argument is withCredentials.
            const response = await axios.get('/api/user/get-profile', {
                withCredentials: true
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(
                err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
        }
    }
);


//creating slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        resetUserState: (state) => {
            state.user = null;
            state.loading = false;
            state.error = null;
            state.isAuthenticated = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // signupUser
            .addCase(signupUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.loading = false;
                //state is variables and payload is response.data from above
                //also backend se jo bhi return hota h wo aaata hai.
                //action means event 
                state.user = action.payload.user || null;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.isAuthenticated = false;
            })
            // loginUser
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user || null;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.isAuthenticated = false;
                state.user = null;
            })
            // logoutUser
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // getProfile
            .addCase(getProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user || null;
                state.isAuthenticated = !!action.payload.user;
                state.error = null;
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
                state.isAuthenticated = false;
                state.user = null;
            });
    },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;