import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Header from "./components/common/Header";
import ProjectList from "./pages/ProjectList";
import ProjectDetail from "./pages/ProjectDetail";
import Dashboard from "./pages/Dashboard";
import WorkspacePage from "./pages/Workspace"; // Add this import
import Landing from "./pages/Landing.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import ProtectedRoute from "./components/common/ProtectedRoute.js";
import "./App.css";

function AppRoutes() {
  const { state } = useApp();
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <WorkspacePage />
          </ProtectedRoute>
        }
      />
      <Route path="/projects">
        <Route
          index
          element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          }
        />
        <Route
          path=":projectId"
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect root to dashboard if authenticated, otherwise to landing */}
      <Route
        path="*"
        element={<Navigate to={state.isAuthenticated ? "/" : "/landing"} />}
      />
    </Routes>
  );
}

function AppLayout() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <AppRoutes />
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppLayout />
      </Router>
    </AppProvider>
  );
}

export default App;
