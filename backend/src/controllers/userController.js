import {
  addUser,
  getUsers,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
} from "../models/UserModel.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Helper function to determine dashboard route based on role
function getDashboardRoute(userRole) {
  const routes = {
    'admin': '/admin/dashboard',
    'project_manager': '/project-manager/dashboard',
    'team_member': '/team-member/dashboard'
  };
  
  return routes[userRole] || '/dashboard';
}

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { username, email, first_name, last_name, password, user_role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    // Validate user role
    const validRoles = ['admin', 'project_manager', 'team_member'];
    if (user_role && !validRoles.includes(user_role)) {
      return res.status(400).json({ message: "Invalid user role" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await addUser({
      username,
      email,
      first_name,
      last_name,
      password_hash: hashedPassword, 
      user_role: user_role || 'team_member'
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user.id,
        email: user.email,
        role: user.user_role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // Determine dashboard route
    const redirectTo = getDashboardRoute(user.user_role);

    // Don't send the password back to the client
    const { password_hash, ...userInfo } = user;

    res.status(201).json({ 
      message: "User registered successfully", 
      user: userInfo, 
      token,
      redirectTo
    });
  } catch (error) {
    console.error("Error registering user:", error);
    
    if (error.code === '23505') {
      if (error.message.includes('username')) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      if (error.message.includes('email')) {
        return res.status(409).json({ message: 'Email already exists' });
      }
    }
    
    res.status(500).json({ message: "Failed to register user" });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    
    const safeUsers = users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.status(200).json(safeUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get a single user by ID
export const getUser = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password_hash, ...userInfo } = user;
    
    res.status(200).json(userInfo);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// Get user by email
export const getUserByEmailController = async (req, res) => {
  try {
    const user = await getUserByEmail(req.params.email);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password_hash, ...userInfo } = user;
    
    res.status(200).json(userInfo);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// Update user
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.body.password) {
      req.body.password_hash = await bcrypt.hash(req.body.password, 12);
      delete req.body.password;
    }
    
    const user = await updateUser(id, req.body);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password_hash, ...userInfo } = user;
    
    res.status(200).json(userInfo);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// Delete user
export const removeUser = async (req, res) => {
  try {
    const user = await deleteUser(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user.id,
        email: user.email,
        role: user.user_role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // Determine dashboard route based on role
    const redirectTo = getDashboardRoute(user.user_role);

    // Don't send the password back to the client
    const { password_hash, ...userInfo } = user;

    res.json({ 
      message: "Login successful", 
      user: userInfo, 
      token,
      redirectTo,
      role: user.user_role
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Failed to log in" });
  }
};

// Get current user role for frontend
export const getCurrentUserRole = async (req, res) => {
  try {
    // This assumes you have authentication middleware that adds user to req
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const redirectTo = getDashboardRoute(user.role);
    
    res.json({
      role: user.role,
      redirectTo
    });
  } catch (error) {
    console.error("Error getting user role:", error);
    res.status(500).json({ message: "Failed to get user role" });
  }
};