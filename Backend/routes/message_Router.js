import express from "express";
import {
    createConversation,
    addParticipant,
    removeParticipant,
    getConversationsForUser
} from "../controller/conversation_controller.js";
import {
    sendMessage,
    getMessages
} from "../controller/message_controller.js";
import isAuthenticated from "../middleware/authmiddleware.js";



const router = express.Router();

// Conversation routes
router.post('/conversations', isAuthenticated, createConversation);
//http://localhost:3000/api/message/conversations/6871003057e4e8d6dcead9ab/participants
//6871003057e4e8d6dcead9ab : this is conversationId
router.post('/conversations/:conversationId/participants', isAuthenticated, addParticipant);
router.delete('/conversations/:conversationId/participants', isAuthenticated, removeParticipant);
router.get('/get-conversations', isAuthenticated, getConversationsForUser);

// Message routes
router.post('/send-message', isAuthenticated, sendMessage);
router.get('/send-message/:conversationId', isAuthenticated, getMessages);



export default router;
