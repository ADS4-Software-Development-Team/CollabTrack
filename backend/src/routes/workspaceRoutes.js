import express from "express";
import {
  createAndJoinWorkspace,
  addMemberToWorkspace,
  getMembersOfWorkspace,
} from "../controllers/workspaceController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route to create a new workspace
// Any authenticated user can create a workspace
router.route("/").post(protect, createAndJoinWorkspace);

// Routes for a specific workspace's members
router
  .route("/:workspaceId/members")
  .get(protect, getMembersOfWorkspace) //Any authenticated user can see members for now
  .post(protect, addMemberToWorkspace); // In a real app, you'd use authorize('admin') for the workspace

export default router;