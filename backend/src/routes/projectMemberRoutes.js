import express from "express";
import {
  addMemberToProject,
  getMembersForProject,
  updateMemberRole,
  //removeMemberFromProject,
} from "../controllers/projectMemberController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

// This router will be mounted with `mergeParams: true` to access `projectId` from the parent router.
const router = express.Router({ mergeParams: true });

// Routes for /api/projects/:projectId/members
router
  .route("/")
  .get(protect, getMembersForProject) // Auth users can see members of a project
  .post(protect, authorize("manager"), addMemberToProject); // Managers can add members

router
  .route("/:userId")
  .put(protect, authorize("manager"), updateMemberRole) // Managers can update a member's role
  //.delete(protect, authorize("manager"), removeMemberFromProject); // Managers can remove members

export default router;