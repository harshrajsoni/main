import express from "express";
import isAuthenticated from "../middleware/authmiddleware.js";
import { getStudentVideoCalls } from "../controller/student_controller.js";


const router = express.Router();

router.get("/video-calls", isAuthenticated, getStudentVideoCalls);

export default router;