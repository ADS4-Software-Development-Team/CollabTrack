import express from "express";
import {
  registerUser,
  getAllUsers,
  getUser,
  updateUserProfile,
  removeUser,
  loginUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

router
  .route("/")
  .get(protect, authorize("admin"), getAllUsers); //only admin have access to view all users

router
  .route("/:id")
  .get(protect, getUser)
  .put(protect,authorize("admin"), updateUserProfile) //only admin can updated users
  .delete(protect, authorize("admin"), removeUser); //only admin can remove users

export default router;
