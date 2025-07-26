import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                participantId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    refPath: "participants.participantModel",
                },
                participantModel: {
                    type: String,
                    required: true,
                    enum: ["Recruiter", "College"],
                },
                role: {
                    type: String,
                    enum: ["admin", "non-admin"],
                    required: function () {
                        return this.participantModel === "College";
                    }
                }
            },
        ],
        // Optionally, you can add lastMessage, unreadCount, etc.
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
            }
        ],
    },
    {
        timestamps: true,
    }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
