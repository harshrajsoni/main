import express from "express";
import isAuthenticated from "../middleware/authmiddleware.js";
import { getAllRecruiters } from "../controller/college_Controller.js";
const router = express.Router();

router.get("/recruiters", isAuthenticated, getAllRecruiters);

export default router;
