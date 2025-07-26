import mongoose from 'mongoose';

const recruiterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    companyId: {
        type: String,
        required: true,
        unique: true
    },
    userType: {
        type: String,
        default: "recruiter"
    }
}, { timestamps: true });

export default mongoose.model('Recruiter', recruiterSchema);
