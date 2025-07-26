import express from "express";
import isAuthenticated from "../middleware/authmiddleware.js";
import { getAllColleges } from "../controller/recruiter_Controller.js";

const router = express.Router();

router.get('/colleges', isAuthenticated, getAllColleges);

export default router;