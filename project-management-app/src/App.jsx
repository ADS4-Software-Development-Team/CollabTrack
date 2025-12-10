// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoutes';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import ProjectForm from './components/ProjectForm';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Landing from './pages/Landing';
import ManagerDashboard from './pages/ManagerDashboard';
import TeamDashboard from './pages/TeamDashboard';
import Workspace from './pages/Workspace';
import CreateWorkspace from './pages/CreateWorkspace';
import ManageUsers from './pages/ManageUsers';
import ViewData from './pages/ViewData';
import WorkspaceProjects from './components/WorkspaceProjects'; 
import Nav from './components/Nav';
import ProjectCharts from './pages/ProjectCharts';

export default function App() {
  return (
    <div>
      <Nav />
      <div className="container mx-auto p-4">
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Landing />} />
            
            {/* Admin only routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Project Manager routes */}
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute requiredRole={['admin', 'project_manager']}>
                  <Projects />
                </ProtectedRoute>
              } 
            />

            {/* Manager dashboard */}
            <Route
              path="/managerDashboard"
              element={
                <ProtectedRoute requiredRole="project_manager">
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
             <Route
              path="/projectCharts"
              element={
                <ProtectedRoute requiredRole="project_manager">
                  <ProjectCharts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/project-charts"
              element={
                <ProtectedRoute requiredRole="project_manager">
                  <ProjectCharts />
                </ProtectedRoute>
              }
            />
            
            {/* Team Member routes */}
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute requiredRole={['team_member', 'project_manager']}>
                  <Tasks />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin home/dashboard (kept for admin users) */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin utility pages */}
            <Route
              path="/manage-users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ManageUsers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/view-data"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ViewData />
                </ProtectedRoute>
              }
            />

            {/* Team member dashboard */}
            <Route
              path="/teamDashboard"
              element={
                <ProtectedRoute requiredRole="team_member">
                  <TeamDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/projects/create" 
              element={
                <ProtectedRoute requiredRole={['admin', 'project_manager']}>
                  <ProjectForm />
                </ProtectedRoute>
              } 
            />
            
            <Route
              path="/admin-workspace/create"
              element={
                <ProtectedRoute requiredRole="admin">
                  <CreateWorkspace />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/projectBoard" 
              element={
                <ProtectedRoute>
                  <ProjectBoard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/workspace/:id"
              element={
                <ProtectedRoute requiredRole="project_manager">
                  <Workspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace/:workspaceId/projects"
              element={
                <ProtectedRoute requiredRole={['admin', 'project_manager']}>
                  <WorkspaceProjects />
                </ProtectedRoute>
              }
            />

        </Routes>
      </div>
    </div>
  );
}