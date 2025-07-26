import express from "express";
import {
    requestVideoCall,
    getCollegeRequests,
    acceptVideoCallRequest,
    scheduleVideoCall,
    getRecruiterRequests,
    getStudentsByCollege,
    joinVideoCall,
    getScheduledCalls
} from "../controller/videoCallRequest_controller.js";
import isAuthenticated from '../middleware/authmiddleware.js';

const router = express.Router();

// Get students by college name
router.get("/students/:collegeName", isAuthenticated, getStudentsByCollege);

// Recruiter requests a video call
router.post("/request", isAuthenticated, requestVideoCall);

// College fetches all video call requests
router.get("/college-requests", isAuthenticated, getCollegeRequests);

//recruiter fetches all video call requests
router.get("/recruiter-requests", isAuthenticated, getRecruiterRequests);

// College accepts a video call request
router.post("/accept", isAuthenticated, acceptVideoCallRequest);

// College schedules a video call
router.post("/schedule", isAuthenticated, scheduleVideoCall);

router.post("/join", isAuthenticated, joinVideoCall);

router.get("/scheduled-calls", isAuthenticated, getScheduledCalls);

export default router; 