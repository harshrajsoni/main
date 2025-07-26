import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    collegeName: {
        type: String,
        required: true
    },
    members: [
        {
            name: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true,
            },
            password: {
                type: String,
                required: true
            },
            role: {
                type: String,
                enum: ['admin', 'non-admin'],
                required: true
            }
        }
    ],
    userType: {
        type: String,
        default: "college"
    }
}, { timestamps: true });

export default mongoose.model('College', collegeSchema);
