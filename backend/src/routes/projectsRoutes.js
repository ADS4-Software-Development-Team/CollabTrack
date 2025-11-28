import express from "express";
import {
  createNewProject,
  viewAllProjects,
  viewProjectByTitle,
  updateProjectInfo,
} from "../controllers/projectController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, viewAllProjects) //Any authenticated user can view all projects
  .post(protect, authorize("admin"), createNewProject); // Managers can create projects

router
  .route("/:id")
  .get(protect, viewProjectByTitle) //Any authenticated user can view a single project
  .put(protect, authorize("admin"), updateProjectInfo) //Managers can update projects
  

export default router;