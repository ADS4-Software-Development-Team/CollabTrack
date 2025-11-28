import express from "express";
import {
  getAllUsers,
  getUser,
  updateUserProfile,
  removeUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, authorize("admin"), getAllUsers); //only admin have access to view all users

router
  .route("/:id")
  .get(protect, getUser)
  .put(protect, updateUserProfile) // Auth user can update own profile, admin can update any. Logic is in controller.
  .delete(protect, authorize("admin"), removeUser); //only admin can remove users

export default router;
