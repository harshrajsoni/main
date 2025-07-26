import express from "express";
import {
    Student_Signup,
    Recruiter_Signup,
    College_Signup,
    login,
    logout,
    collegeLogin,
    getProfile
} from "../controller/user_Controller.js";
import isAuthenticated from "../middleware/authmiddleware.js";


const router = express.Router();

router.get("/", (req, res) => {
    res.send("Hello World");
});

router.post('/signup/student-signup', Student_Signup);
router.post('/signup/recruiter-signup', Recruiter_Signup);
router.post('/signup/college-signup', College_Signup);
router.post('/login/college', collegeLogin);
router.post('/login/:userType', login);
router.post('/logout', logout);
router.get('/get-profile', isAuthenticated, getProfile);



export default router;