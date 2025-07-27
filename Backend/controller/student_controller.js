import VideoCallRequest from "../models/videoCallRequestSchema.js";

// Get video calls for a specific student
export const getStudentVideoCalls = async (req, res) => {
    try {
        const studentId = req.user.id;
        
        console.log("Student video calls request:", {
            studentId: studentId,
            userType: req.user.userType,
            email: req.user.email
        });
        
        // Find all video call requests where this student is included
        const videoCalls = await VideoCallRequest.find({ 
            studentIds: studentId,
            status: { $in: ['accepted', 'scheduled', 'active'] }
        })
        .populate('recruiterId', 'name email companyName')
        .populate('collegeId', 'name email collegeName')
        .populate('studentIds', 'name email rollNumber course')
        .sort({ createdAt: -1 });
        
        console.log("Found video calls for student:", videoCalls.length);
        console.log("Video calls:", videoCalls.map(call => ({
            id: call._id,
            status: call.status,
            studentIds: call.studentIds,
            recruiterId: call.recruiterId?.name,
            scheduledTime: call.scheduledTime
        })));
        
        // Debug: Check all video calls in the database
        const allVideoCalls = await VideoCallRequest.find({})
            .populate('recruiterId', 'name email')
            .populate('studentIds', 'name email')
            .sort({ createdAt: -1 });
        
        console.log("All video calls in database:", allVideoCalls.length);
        console.log("All video calls:", allVideoCalls.map(call => ({
            id: call._id,
            status: call.status,
            studentIds: call.studentIds.map(s => s._id || s),
            recruiterId: call.recruiterId?._id,
            scheduledTime: call.scheduledTime
        })));
        
        return res.status(200).json({ 
            data: videoCalls 
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            message: "Server error.", 
            error: error.message 
        });
    }
};
