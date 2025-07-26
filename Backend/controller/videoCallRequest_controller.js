import VideoCallRequest from "../models/videoCallRequestSchema.js";
import { v4 as uuidv4 } from 'uuid';

// Request a video call (recruiter)
export const requestVideoCall = async (req, res) => {
    try {
        const { collegeId, studentIds, message, conversationId } = req.body;
        const recruiterId = req.user.id; // Changed from req.user._id to req.user.id

        console.log("Request body:", req.body);
        console.log("User:", req.user);
        console.log("Extracted values:", { collegeId, studentIds, message, conversationId, recruiterId });

        const videoCallRequest = new VideoCallRequest({
            recruiterId,
            collegeId,
            studentIds: studentIds || [],
            message: message || "Video call request",
            conversationId,
            status: "pending"
        });

        console.log("Saving video call request:", videoCallRequest);

        await videoCallRequest.save();
        console.log("Video call request saved successfully");
        
        res.status(201).json({ 
            message: "Video call request sent successfully", 
            data: videoCallRequest 
        });
    } catch (error) {
        console.error("Error requesting video call:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all requests for a college
export const getCollegeRequests = async (req, res) => {
    try {
        // Use collegeId for college members, otherwise use user's own id
        const collegeId = req.user.collegeId || req.user.id;
        
        console.log("College fetching requests for collegeId:", collegeId);
        console.log("User object:", req.user);
        
        const requests = await VideoCallRequest.find({ collegeId })
            .populate('recruiterId', 'name companyName')
            .populate('studentIds', 'name email rollNumber')
            .sort({ createdAt: -1 });

        console.log(`Found ${requests.length} requests for college ${collegeId}`);
        console.log("Requests:", requests);

        res.status(200).json({ data: requests });
    } catch (error) {
        console.error("Error fetching college requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Accept a video call request
export const acceptVideoCallRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        
        const videoCall = await VideoCallRequest.findById(requestId);
        if (!videoCall) {
            return res.status(404).json({ message: "Video call request not found" });
        }

        videoCall.status = "accepted";
        await videoCall.save();

        res.status(200).json({ 
            message: "Video call request accepted", 
            data: videoCall 
        });
    } catch (error) {
        console.error("Error accepting video call:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Schedule a video call
export const scheduleVideoCall = async (req, res) => {
    try {
        const { requestId, scheduledTime } = req.body;
        
        const videoCall = await VideoCallRequest.findById(requestId);
        if (!videoCall) {
            return res.status(404).json({ message: "Video call request not found" });
        }

        videoCall.scheduledTime = new Date(scheduledTime);
        videoCall.status = "scheduled";
        await videoCall.save();

        res.status(200).json({ 
            message: "Video call scheduled successfully", 
            data: videoCall 
        });
    } catch (error) {
        console.error("Error scheduling video call:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get recruiter requests
export const getRecruiterRequests = async (req, res) => {
    try {
        const recruiterId = req.user.id;
        
        const requests = await VideoCallRequest.find({ recruiterId })
            .populate('collegeId', 'name')
            .populate('studentIds', 'name email rollNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({ data: requests });
    } catch (error) {
        console.error("Error fetching recruiter requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get students by college
export const getStudentsByCollege = async (req, res) => {
    try {
        const { collegeName } = req.params;
        
        console.log("Fetching students for college:", collegeName);
        
        // Import Student model
        const Student = (await import("../models/student_Schema.js")).default;
        
        // Query students by college name
        const students = await Student.find({ college: collegeName })
            .select('name email rollNumber course')
            .sort({ name: 1 });

        console.log(`Found ${students.length} students for college: ${collegeName}`);
        console.log("Students:", students);
        
        res.status(200).json({ 
            message: "Students fetched successfully",
            data: students 
        });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const joinVideoCall = async (req, res) => {
    try {
        const { requestId } = req.body;
        const userId = req.user.id;
        const userType = req.user.userType;

        const videoCall = await VideoCallRequest.findById(requestId);
        if (!videoCall) {
            return res.status(404).json({ message: "Video call not found" });
        }

        if (videoCall.status !== "scheduled") {
            return res.status(400).json({ message: "Video call is not scheduled" });
        }

        // Check if it's time for the call (within 10 minutes of scheduled time)
        const now = new Date();
        const scheduledTime = new Date(videoCall.scheduledTime);
        const timeDiff = Math.abs(now - scheduledTime);
        const tenMinutes = 10 * 60 * 1000;

        if (timeDiff > tenMinutes) {
            return res.status(400).json({ message: "Video call time has passed or not yet started" });
        }

        // Generate room ID if not exists
        if (!videoCall.roomId) {
            videoCall.roomId = uuidv4();
        }

        // Add participant
        const existingParticipant = videoCall.participants.find(p => p.userId.toString() === userId.toString());
        if (!existingParticipant) {
            videoCall.participants.push({
                userId,
                userType,
                joinedAt: new Date()
            });
        }

        videoCall.status = "active";
        await videoCall.save();

        res.status(200).json({
            message: "Joined video call successfully",
            roomId: videoCall.roomId,
            data: videoCall
        });
    } catch (error) {
        console.error("Error joining video call:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getScheduledCalls = async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.user.userType;

        let query = {};
        if (userType === "recruiter") {
            query.recruiterId = userId;
        } else if (userType === "student") {
            query.studentIds = { $in: [userId] };
        } else {
            query.collegeId = userId;
        }

        const scheduledCalls = await VideoCallRequest.find({
            ...query,
            status: { $in: ["scheduled", "active"] },
            scheduledTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        })
        .populate('recruiterId', 'name companyName')
        .populate('collegeId', 'name')
        .populate('studentIds', 'name email rollNumber')
        .sort({ scheduledTime: 1 });

        res.status(200).json({ data: scheduledCalls });
    } catch (error) {
        console.error("Error fetching scheduled calls:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
