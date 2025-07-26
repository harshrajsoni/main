import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/student_Schema.js";
import Recruiter from "../models/Recruiter.js";
import College from "../models/collegeSchema.js";

export const Student_Signup = async (req, res) => {
    try {
        const { name, email, password, rollNo, college, course } = req.body;
        
        // Validate required fields
        if (!name || !email || !password || !rollNo || !college || !course) {
            return res.status(400).json({ 
                message: "All fields are required.",
                received: { name, email, password: password ? 'present' : 'missing', rollNo, college, course }
            });
        }

        // Check if user already exists
        const user = await Student.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists with this email." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new Student({
            name,
            email,
            password: hashedPassword,
            rollNumber: rollNo,
            college,
            course,
            userType: "student"
        });

        await newUser.save();

        // Generate token 
        const token = jwt.sign({ id: newUser?._id, email: newUser?.email, userType: newUser?.userType },
            process.env.JWT_SECRET,
            { expiresIn: "10d" }
        );

        // Respond with user info (excluding password)
        res.status(201)
            .cookie("token", token, {
                httpOnly: true,
                secure: false, // Set to false for localhost development
                sameSite: "lax", // Changed from "strict" for localhost
                maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in ms
            })
            .json({
                message: "Student registered successfully.",
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    userType: newUser.userType,
                    token
                },
            });
    } catch (error) {
        console.error('Student Signup Error:', error);
        res.status(500).json({
            message: "Server error during student signup.",
            error: error.message
        });
    }
};

// Recruiter Signup
export const Recruiter_Signup = async (req, res) => {
    try {
        const { name, email, password, companyName, companyId } = req.body;

        // Check if recruiter already exists
        const recruiter = await Recruiter.findOne({ email });
        if (recruiter) {
            return res.status(400).json({
                message: "Recruiter already exists with this email."
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new recruiter
        const newRecruiter = new Recruiter({
            name,
            email,
            password: hashedPassword,
            companyName,
            companyId,
            userType: "recruiter"
        });

        await newRecruiter.save();

        // Generate token
        const token = jwt.sign({ id: newRecruiter._id, email: newRecruiter.email, userType: "recruiter" },
            process.env.JWT_SECRET,
            { expiresIn: "10d" }
        );

        // Respond with user info (excluding password)
        res.status(201)
            .cookie("token", token, {
                httpOnly: true, // xss
                secure: false,
                sameSite: "lax", // csrf
                maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in ms
            })
            .json({
                message: "Recruiter registered successfully.",
                user: {
                    _id: newRecruiter._id,
                    email: newRecruiter.email,
                    userType: "recruiter",
                    token
                },
            });
    } catch (error) {
        res.status(500).json({
            message: "Server error during recruiter signup.",
            error: error.message
        });
    }
};


// {
//     "name": "IITG",
//     "email": "IITG@gmail.com",
//     "password": "1234",
//     "collegeName": "IITG",
//     "members": [{"name": "John Josh", "email": "john@gmail.com", "password": "1234", "role": "admin"}, 
//                 {"name": "Pradeep Das", "email": "pradeep@gmail.com", "password": "1234", "role": "admin"}, 
//                 {"name": "Vishal Rai", "email": "vishal@gmail.com", "password": "1234", "role": "non-admin"},
//                 {"name": "Rahul", "email": "rahul@gmail.com", "password": "1234", "role": "non-admin"},
//                 {"name": "Vipin ", "email": "vipin@gmail.com", "password": "1234", "role": "non-admin"}
//             ]
// }

// College Signup
export const College_Signup = async (req, res) => {
    try {
        const { name, email, password, collegeName, members } = req.body;

        // Check if college already exists
        const college = await College.findOne({ email });
        if (college) {
            return res.status(400).json({
                message: "College already exists with this email."
            });
        }

        // Hash the password for the college itself
        const hashedPassword = await bcrypt.hash(password, 10);

        // Hash each member's password
        const hashedMembers = await Promise.all(
            members.map(async (m) => ({
                ...m,
                password: await bcrypt.hash(m.password, 10)
            }))
        );

        const newCollege = new College({
            name,
            email,
            password: hashedPassword,
            collegeName,
            members: hashedMembers,
            userType: "college"
        });

        await newCollege.save();

        // Generate token
        const token = jwt.sign({ id: newCollege._id, email: newCollege.email, userType: "college" },
            process.env.JWT_SECRET,
            { expiresIn: "10d" }
        );

        // Respond with user info (excluding password)
        res.status(201)
            .cookie("token", token, {
                httpOnly: true, // xss
                secure: false,
                sameSite: "lax", // csrf
                maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in ms
            })
            .json({
                message: "College registered successfully.",
                user: {
                    _id: newCollege._id,
                    email: newCollege.email,
                    userType: "college",
                    token
                },
            });
    } catch (error) {
        // Debug: Log error stack
        console.error('College Signup Error:', error);
        res.status(500).json({
            message: "Server error during college signup.",
            error: error.message,
            stack: error.stack
        });
    }
};


//login 
export const login = async (req, res) => {
    try {
        const { userType } = req.params; // 'student-login', 'college-login', or 'recruiter-login'
        const { email, password } = req.body;

        let user = null;
        let model = null;

        // Determine which model to use based on userType param
        if (userType === "student") {
            model = Student;
        } else if (userType === "recruiter") {
            model = Recruiter;
        } else {
            return res.status(400).json({
                message: "Invalid user type."
            });
        }

        user = await model.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        //generate token
        const token = jwt.sign({ id: user?._id, email: user?.email, userType: user.userType },
            process.env.JWT_SECRET, // Make sure your .env uses JWT_SECRET
            { expiresIn: "10d" }
        );

        // Respond with user info (excluding password)
        res.status(200)
            .cookie("token", token, {
                httpOnly: true, // xss
                secure: false,
                sameSite: "lax", // csrf
                maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in ms
            })
            .json({
                message: "Login successful.",
                user: {
                    _id: user._id,
                    email: user.email,
                    userType: user.userType,
                },
            });
    } catch (error) {
        res.status(500).json({
            message: "Server error during login.",
            error: error.message
        });
    }
};

export const collegeLogin = async (req, res) => {
    const { college_email, college_password, email, password } = req.body;

    try {
        // Find college by email
        const college = await College.findOne({ email: college_email });
        if (!college) {
            return res.status(401).json({
                message: "College not found."
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(college_password, college.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid college email or password."
            });
        }

        // Find member by email
        const member = (college.members || []).find(m => m.email === email);
        if (!member) {
            return res.status(401).json({
                message: "Member not found in this college."
            });
        }

        // Compare member password
        const isMemberMatch = await bcrypt.compare(password, member.password);
        if (!isMemberMatch) {
            return res.status(400).json({
                message: "Invalid member email or password."
            });
        }

        // Generate token for member (if needed)
        // const token = jwt.sign({ id: member._id, role: member.role, collegeId: college._id }, process.env.JWT_SECRET, { expiresIn: "10d" });
        const token = jwt.sign({
            id: member._id,
            role: member.role,
            collegeId: college._id,
            collegeName: college.collegeName,
            userType: "college"
        },
            process.env.JWT_SECRET,
            { expiresIn: "10d" }
        );

        // Respond with member info (excluding password)
        return res.status(200)
            .cookie("token", token, {
                httpOnly: true, // xss
                secure: false,
                sameSite: "lax", // csrf
                maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in ms
            })
            .json({
                message: "Member login successful.",
                member: {
                    _id: member._id,
                    name: member.name,
                    email: member.email,
                    role: member.role,
                    collegeId: college._id,
                    collegeName: college.collegeName,
                    token
                }
            });
    } catch (error) {
        res.status(500).json({
            message: "Server error during college login.",
            error: error.message
        });
    }
}


//logout
export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(201).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        // Check if user is authenticated and user info is available in req.user
        //req.user auth middleware se mil rha hoga.
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized. No user info found."
            });
        }

        // Determine user type and fetch profile accordingly
        if (user.userType === "student") {
            const student = await Student.findById(user.id).select("-password");
            if (!student) {
                return res.status(404).json({
                    message: "Student not found."
                });
            }
            return res.status(200).json({
                user: { ...student.toObject(), userType: "student" }
            });
        } else if (user.userType === "recruiter") {
            const recruiter = await Recruiter.findById(user.id).select("-password");
            if (!recruiter) {
                return res.status(404).json({
                    message: "Recruiter not found."
                });
            }
            return res.status(200).json({
                user: { ...recruiter.toObject(), userType: "recruiter" }
            });
        } else if (user.userType === "college") {
            // For college, user may be a main college or a member
            const college = await College.findById(user.id).select("-password -members.password");
            if (college) {
                return res.status(200).json({ user: { ...college.toObject(), userType: "college" } });
            } else {
                // Try to find as a member
                const collegeWithMember = await College.findOne({ "members._id": user.id });
                if (!collegeWithMember) {
                    return res.status(404).json({
                        message: "College member not found."
                    });
                }
                const member = collegeWithMember.members.id(user.id);
                if (!member) {
                    return res.status(404).json({
                        message: "Member not found."
                    });
                }
                // Exclude password
                const { password, ...memberData } = member.toObject();
                return res.status(200).json({
                    user: {
                        ...memberData,
                        collegeId: collegeWithMember._id,
                        collegeName: collegeWithMember.collegeName,
                        email: member.email,
                        userType: "college"
                    }
                });
            }
        } else {
            return res.status(400).json({
                message: "Invalid user type."
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error fetching profile.",
            error: error.message
        });
    }
}