import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
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
    rollNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    college: {
        type: String,
        required: true,
        trim: true
    },
    course: {
        type: String,
        required: true,
        trim: true
    },
    userType: {
        type: String,
        default: "student"
    }
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

export default Student;
