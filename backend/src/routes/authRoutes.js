import express from 'express';
import { supabase } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();


const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, user_role, first_name, last_name } = req.body;
  
  console.log('🔍 Registration attempt:', { username, email, user_role });
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate user role
  const validRoles = ['admin', 'project_manager', 'team_member'];
  if (user_role && !validRoles.includes(user_role)) {
    return res.status(400).json({ error: 'Invalid user role' });
  }

  try {
    // Hash password
    const password_hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    
    console.log('📝 Creating user in database...');
    
    // Insert user directly into users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id,
          username,
          email,
          first_name: first_name || null,
          last_name: last_name || null,
          password_hash,
          user_role: user_role || 'team_member',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (userError) {
      console.log('❌ User creation error:', userError);
      
      if (userError.code === '23505') {
        if (userError.message.includes('username')) {
          return res.status(409).json({ error: 'Username already exists' });
        }
        if (userError.message.includes('email')) {
          return res.status(409).json({ error: 'Email already exists' });
        }
      }
      
      if (userError.code === '42501') {
        return res.status(403).json({ 
          error: 'Permission denied. Check RLS policies.',
          details: 'Missing INSERT policy for users table'
        });
      }
      
      throw userError;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: userData.id,
        email: userData.email,
        role: userData.user_role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    console.log('✅ Registration successful! User:', userData);
    
    res.json({ 
      ok: true, 
      message: 'User registered successfully',
      token,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.user_role
      },
      redirectTo: getDashboardRoute(userData.user_role)
    });
  } catch (err) {
    console.error('💥 Registration error:', err);
    res.status(500).json({ 
      error: err.message,
      code: err.code
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔍 Login attempt:', { email });
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      console.log('❌ Invalid password for user:', user.id);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user.id,
        email: user.email,
        role: user.user_role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    console.log('✅ Login successful for user:', user.id, 'Role:', user.user_role);
    
    // Determine dashboard route based on user role
    const redirectTo = getDashboardRoute(user.user_role);
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.user_role
      },
      redirectTo,
      message: `Login successful! Redirecting to ${user.user_role} dashboard`
    });
  } catch (err) {
    console.error('💥 Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Helper function to determine dashboard route based on role
function getDashboardRoute(userRole) {
  const routes = {
    'admin': '/dashboard',
    'project_manager': '/managerDashboard',
    'team_member': '/teamDashboard'
  };
  
  return routes[userRole] || '/dashboard';
}

// Get user role for frontend routing (optional)
router.get('/user-role', authenticateToken, (req, res) => {
  res.json({ 
    role: req.user.role,
    redirectTo: getDashboardRoute(req.user.role)
  });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

export default router;