import Message from "../models/messageSchema.js";
import Conversation from "../models/converstionSchema.js";
import mongoose from "mongoose";

// Create a new message and add it to a conversation
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, senderId, senderModel, message } = req.body;
        
        // Validate required fields
        if (!conversationId) {
            return res.status(400).json({ 
                message: "conversationId is required." 
            });
        }
        if (!senderId) {
            return res.status(400).json({ 
                message: "senderId is required." 
            });
        }
        if (!senderModel) {
            return res.status(400).json({ 
                message: "senderModel is required." 
            });
        }
        if (!message) {
            return res.status(400).json({ 
                message: "message is required." 
            });
        }

        // Validate senderModel
        if (!['Recruiter', 'College'].includes(senderModel)) {
            return res.status(400).json({ 
                message: `Invalid senderModel: ${senderModel}. Must be 'Recruiter' or 'College'.` 
            });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({ 
                message: `Invalid senderId format: ${senderId}` 
            });
        }
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ 
                message: `Invalid conversationId format: ${conversationId}` 
            });
        }

        // Check if conversation exists
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ 
                message: "Conversation not found." 
            });
        }

        // Create and save the message
        const newMessage = new Message({
            conversationId,
            senderId,
            senderModel,
            message
        });
        
        await newMessage.save();

        // Add message to conversation's messages array
        conversation.messages.push(newMessage._id);
        await conversation.save();

        return res.status(201).json({ 
            message: "Message sent successfully.", 
            data: newMessage 
        });
    } catch (error) {
        console.error('Send Message Error:', error); // <-- Add this line
        return res.status(500).json({ 
            message: "Server error while sending message.", 
            error: error.message 
        });
    }
};

// Get all messages for a conversation
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        if (!conversationId) {
            return res.status(400).json({ 
                message: "Conversation ID is required." 
            });
        }

        // Find messages for the conversation, sorted by creation time
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        return res.status(200).json({ 
            messages 
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Server error while fetching messages.", 
            error: error.message 
        });
    }
};
