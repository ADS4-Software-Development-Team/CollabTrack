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
  .get(protect, authorize("admin"), getAllProjectMembers);

//only admin can add members
router.route("/addMemberToProject").post(protect, authorize("admin"), addMemberToProject)

router
  .route("/:projectId")
  .get(protect, getMembersForProject)
  .put(protect, authorize("admin"), updateMemberRole);

export default router;