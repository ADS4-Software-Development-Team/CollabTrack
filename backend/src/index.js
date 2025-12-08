// src/index.js
import './config/env.js'; // Import first to load environment variables
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Import database client
import { supabase } from './config/database.js';
const app = express();

// For production, you should restrict the origin to your frontend's domain
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://your-frontend-domain.com']
  : ['http://localhost:3000', 'http://127.0.0.1:3000']; // Add your dev origins

// CORS configuration
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(express.json());

// Import routes
import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/users.js';
import projectsRoutes from './routes/projectsRoutes.js';
import tasksRoutes from './routes/tasks.js';
import commentsRoutes from './routes/comments.js';
import workspaceRoutes from './routes/workspaceRoutes.js';


// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/comments', commentsRoutes);


// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connection using the imported client
    const { error } = await supabase.from('users').select('id', { count: 'exact', head: true });
    
    if (error) throw error;

    res.json({
      status: 'OK',
      database: 'Supabase Connected',
      timestamp: new Date().toISOString(),
      message: 'Backend server is running with Supabase'
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Project Manager API Server with Supabase',
    version: '1.0.0',
    database: 'Supabase',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      tasks: '/api/tasks',
      comments: '/api/comments'
    }
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  Database: Supabase`);
});