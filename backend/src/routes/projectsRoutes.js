import express from "express";
import {
  createNewProject,
  viewAllProjects,
  viewProjectByTitle,
} from "../controllers/projectController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();


router
  .route("/")
  .get(protect, viewAllProjects); //Any authenticated user can view all projects

router.route("/createProject").post(protect, authorize("admin"), createNewProject)        

router.route("/:title").get(protect, viewProjectByTitle); //Any authenticated user can view a single project

export default router;