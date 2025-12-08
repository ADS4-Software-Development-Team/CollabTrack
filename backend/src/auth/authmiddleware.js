// backend/src/auth/authmiddleware.js
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify JWT token
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    console.log('JWT Payload:', payload); // Debug log
    
    // Get user from Supabase users table
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .single();

    if (error || !user) {
      console.error('User not found in database:', payload.sub);
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('User found in middleware:', { 
      id: user.id, 
      email: user.email, 
      role: user.user_role 
    });

    // Set req.user with role from both JWT and database (database is source of truth)
    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_role || payload.role, // Use database role first, fallback to JWT
      user_role: user.user_role || payload.role, // For compatibility
      ...user // Include all user fields
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default authMiddleware;