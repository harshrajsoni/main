import Recruiter from "../models/Recruiter.js";

export const getAllRecruiters = async (req, res) => {
    try {
        const recruiters = await Recruiter.find({}, "name email companyName"); // select only needed fields
        res.status(200).json({ recruiters });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
