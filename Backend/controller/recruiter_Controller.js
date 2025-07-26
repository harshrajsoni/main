import College from "../models/collegeSchema.js";

export const getAllColleges = async (req, res) => {
    try {
        const colleges = await College.find({}, { name: 1, _id: 1 });
        res.status(200).json({
            colleges
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch colleges",
            error: error.message
        });
    }
};