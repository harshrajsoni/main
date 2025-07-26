import mongoose from "mongoose";

const videoCallRequestSchema = new mongoose.Schema({
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
        required: true,
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        required: true,
    },
    studentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "scheduled", "active", "completed"],
        default: "pending",
    },
    scheduledTime: {
        type: Date,
    },
    roomId: {
        type: String,
        unique: true,
        sparse: true
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        userType: {
            type: String,
            enum: ["recruiter", "student"],
            required: true
        },
        joinedAt: Date,
        leftAt: Date
    }],
}, { timestamps: true });

const VideoCallRequest = mongoose.model("VideoCallRequest", videoCallRequestSchema);
export default VideoCallRequest;
