import VideoCallRequest from "../models/videoCallRequestSchema.js";

// Get video calls for a specific student
export const getStudentVideoCalls = async (req, res) => {
    try {
        const studentId = req.user.id;
        
        // Find all video call requests where this student is included
        const videoCalls = await VideoCallRequest.find({ 
            studentIds: studentId,
            status: { $in: ['accepted', 'scheduled'] }
        })
        .populate('recruiterId', 'name email companyName')
        .populate('collegeId', 'name email collegeName')
        .populate('studentIds', 'name email rollNumber course')
        .sort({ createdAt: -1 });
        
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
