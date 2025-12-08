// backend/src/controllers/authController.js
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user details from users table (not auth.users)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error('User fetch error:', userError);
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('User found:', { id: user.id, role: user.user_role });

    // Create JWT token with user role included
    const token = jwt.sign(
      {
        sub: user.id, // Standard JWT claim for subject (user ID)
        email: user.email,
        role: user.user_role,
        user_role: user.user_role, // Include for compatibility
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from user object before sending
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: {
        ...userWithoutPassword,
        role: user.user_role, // Make sure role is included in response
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req, res) => {
  const { email, password, username, first_name, last_name, user_role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user in auth.users (Supabase Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase signup error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    // Create user in public.users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email,
          username: username || email.split('@')[0],
          first_name: first_name || '',
          last_name: last_name || '',
          user_role: user_role || 'team_member',
          auth_user_id: authData.user.id, // Link to auth user
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.user_role,
        user_role: user.user_role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      token,
      user: {
        ...userWithoutPassword,
        role: user.user_role,
      },
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};