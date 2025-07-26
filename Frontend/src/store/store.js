import { configureStore } from '@reduxjs/toolkit';
import conversationReducer from './slice/conversationSlice';
import messageReducer from './slice/messageSlice';
import userReducer from './slice/userSlice';
import collegeReducer from './slice/fetchCollegeSlice';
import recruiterReducer from './slice/fetchRecruiterSlice';
import videoCallRequestReducer from './slice/videoCallRequestSlice';
import studentVideoCallReducer from './slice/studentVideoCallSlice';


const store = configureStore({
  reducer: {
    user: userReducer,
    conversations: conversationReducer,
    messages: messageReducer,
    colleges: collegeReducer,
    recruiters: recruiterReducer,
    videoCallRequests: videoCallRequestReducer,
    studentVideoCalls: studentVideoCallReducer,
  },
});

export default store;
