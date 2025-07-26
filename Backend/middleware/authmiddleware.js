// Auth middleware for checking JWT token in cookies
import jwt from 'jsonwebtoken';
import College from '../models/collegeSchema.js';
import Recruiter from '../models/Recruiter.js';
import Student from '../models/student_Schema.js';

const isAuthenticated = async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ 
            message: "No authentication token, authorization denied." 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Try to find user in College collection (main college)
        let user = await College.findById(decoded.id);
        if (user) {
            req.user = {
                id: user._id,
                email: user.email,
                userType: user.userType, // "college"
                collegeId: user._id // for main college account
            };
            return next();
        }

        // Try to find user as a college member
        const collegeWithMember = await College.findOne({ "members._id": decoded.id });
        if (collegeWithMember) {
            const member = collegeWithMember.members.id(decoded.id);
            req.user = {
                id: member._id,
                email: member.email,
                userType: decoded.userType || "college",
                collegeId: collegeWithMember._id,
                collegeName: collegeWithMember.collegeName,
                role: member.role
            };
            return next();
        }

        // Try recruiter
        user = await Recruiter.findById(decoded.id);
        if (user) {
            req.user = {
                id: user._id,
                email: user.email,
                userType: user.userType, // "recruiter"
            };
            return next();
        }

        // Try student
        user = await Student.findById(decoded.id);
        if (user) {
            req.user = {
                id: user._id,
                email: user.email,
                userType: user.userType, // "student"
            };
            return next();
        }

        // If no user found
        return res.status(401).json({ message: "User not found." });

    } catch (err) {
        return res.status(401).json({ 
            message: "Token is not valid." 
        });
    }
};

export default isAuthenticated;
