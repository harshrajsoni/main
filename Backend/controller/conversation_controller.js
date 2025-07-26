import Conversation from "../models/converstionSchema.js";
import mongoose from "mongoose";


//ye req.body se aaega and is stored in participants
// {
//     "participants": [
//         { "participantId": "665b1e2f8b1e2c0012a4d123", "participantModel": "Recruiter" },
//         { "participantId": "665b1e2f8b1e2c0012a4d456", "participantModel": "College" }
//     ]
// }

// Create a new conversation with participants
export const createConversation = async (req, res) => {
    try {
        const { participants } = req.body;
        if (!participants || !Array.isArray(participants) || participants.length < 2) {
            return res.status(400).json({
                message: "At least two participants are required."
            });
        }
        // Optionally, check for duplicate conversations here
        const conversation = new Conversation({ participants });
        await conversation.save();
        return res.status(201).json({
            message: "Conversation created.",
            data: conversation
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error while creating conversation.",
            error: error.message
        });
    }
};

// Add a participant to a conversation
export const addParticipant = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { participantId, participantModel, role } = req.body;
        if (!participantId || !participantModel) {
            return res.status(400).json({
                message: "participantId and participantModel are required."
            });
        }
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found."
            });
        }
        // Prevent duplicate participants
        const exists = conversation.participants.some(
            p => p.participantId.toString() === participantId && p.participantModel === participantModel
        );
        if (exists) {
            return res.status(400).json({
                message: "Participant already exists in conversation."
            });
        }
        conversation.participants.push({ participantId, participantModel, role });
        await conversation.save();
        return res.status(200).json({
            message: "Participant added.",
            data: conversation
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error while adding participant.",
            error: error.message
        });
    }
};

// Remove a participant from a conversation
export const removeParticipant = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { participantId, participantModel } = req.body;
        if (!participantId || !participantModel) {
            return res.status(400).json({
                message: "participantId and participantModel are required."
            });
        }
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found."
            });
        }
        conversation.participants = conversation.participants.filter(
            p => !(p.participantId.toString() === participantId && p.participantModel === participantModel)
        );
        await conversation.save();

        return res.status(200).json({
            message: "Participant removed.",
            data: conversation
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error while removing participant.",
            error: error.message
        });
    }
};

// Get all conversations for the authenticated user (by participantId and participantModel from req.user)
export const getConversationsForUser = async (req, res) => {
    try {
        // Determine participantId: use collegeId for college members, else use user's own id
        let participantId;
        if (req.user.userType === "college" && req.user.collegeId) {
            participantId = req.user.collegeId; // For college members
        } else {
            participantId = req.user.id; // For main college account, recruiter, etc.
        }

        const participantModel = req.user.userType; // "college" or "recruiter"
        const formattedModel = participantModel.charAt(0).toUpperCase() + participantModel.slice(1);

        const conversations = await Conversation.find({
            participants: {
                $elemMatch: {
                    participantId: new mongoose.Types.ObjectId(participantId),
                    participantModel: formattedModel
                }
            }
        })
        .populate({
            path: 'participants.participantId',
            select: 'collegeName name email companyName' // select only the fields you want
        })
        .sort({ updatedAt: -1 });

        return res.status(200).json({ conversations });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Server error while fetching conversations.",
            error: error.message
        });
    }
}; 