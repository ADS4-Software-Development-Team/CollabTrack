import express from "express";
import {
  addMemberToProject,
  getAllProjectMembers,
  getMembersForProject,
  updateMemberRole,
} from "../controllers/projectMemberController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes for /api/project-members
router
  .route("/")
  .post(protect, authorize("admin"), addMemberToProject)
  .get(protect, authorize("admin"), getAllProjectMembers);

router
  .route("/:projectId")
  .get(protect, getMembersForProject)
  .put(protect, authorize("admin"), updateMemberRole);

export default router;