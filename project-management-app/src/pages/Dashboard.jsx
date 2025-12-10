import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workspaceAPI } from '../api';
import ProjectForm from '../components/ProjectForm';
import '../styles.css';

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: ""
  });
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [firstWorkspaceId, setFirstWorkspaceId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const workspacesData = await workspaceAPI.getWorkspaces();
        setWorkspaces(workspacesData);
        if (workspacesData.length > 0) {
          setFirstWorkspaceId(workspacesData[0].id);
        }
      } catch (err) {
        console.error('Failed to load workspaces:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaces();
  }, []);

  const handleOpenCreateProjectModal = (workspace) => {
    setSelectedWorkspace(workspace);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWorkspace(null);
  };

  const handleProjectCreated = () => {
    handleCloseModal();
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) {
      alert("Please enter a workspace name");
      return;
    }

    try {
      const createdWorkspace = await workspaceAPI.createWorkspace({
        name: newWorkspace.name,
      });

      setWorkspaces([...workspaces, createdWorkspace]);
      setNewWorkspace({
        name: "",
      });
      setShowCreateWorkspace(false);
    } catch (error) {
      console.error("Failed to create workspace:", error);
      alert("Workspace successfully created");
      navigate('/dashboard');
    }
  };

  const handleDeleteWorkspace = async (workspaceId, workspaceName) => {
    if (!window.confirm(`Are you sure you want to delete workspace "${workspaceName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await workspaceAPI.deleteWorkspace(workspaceId);
      setWorkspaces(workspaces.filter(workspace => workspace.id !== workspaceId));
      alert("Workspace deleted successfully");
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      alert("Failed to delete workspace");
    }
  };

  return (
    <div className="dashboard">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="workspace-info">
          <div>
            <h2>Welcome to CollabTrack</h2>
            <p className="workspace-description">
              Manage all your workspaces and projects in one place
            </p>
          </div>
        </div>

        <div className="workspace-actions">
         
          <button
            className="btn-create-workspace"
            onClick={() => setShowCreateWorkspace(true)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Workspace
          </button>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showCreateWorkspace && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Workspace</h2>
              <button
                className="btn-close"
                onClick={() => setShowCreateWorkspace(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="workspace-name">Workspace Name *</label>
                <input
                  id="workspace-name"
                  type="text"
                  value={newWorkspace.name}
                  onChange={(e) =>
                    setNewWorkspace({ ...newWorkspace, name: e.target.value })
                  }
                  placeholder="Enter workspace name"
                  className="form-input"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowCreateWorkspace(false)}
              >
                Cancel
              </button>
              <button
                className="btn-create"
                onClick={handleCreateWorkspace}
                disabled={!newWorkspace.name.trim()}
              >
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Workspaces</h3>
          <p className="stat-number">{workspaces.length}</p>
          <p className="stat-label">Workspaces you manage</p>
        </div>
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p className="stat-number">0</p>
          <p className="stat-label">Across all workspaces</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p className="stat-number">1</p>
          <p className="stat-label">Currently active</p>
        </div>
      </div>

      {/* Main Content Area - Your Workspaces */}
      <div className="recent-activities">
        <div className="section-header">
          <h2>Your Workspaces</h2>
          <span className="project-count">
            {workspaces.length} workspaces
          </span>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading workspaces...</p>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="empty-state">
            <p className="text-gray-500 mb-4">No workspaces yet</p>
            <button
              className="btn-primary"
              onClick={() => setShowCreateWorkspace(true)}
            >
              Create Your First Workspace
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="project-card"
              >
                <div className="project-card-header">
                  <Link
                    to={`/workspace/${workspace.id}/projects`}
                    className="project-card-link"
                  >
                    <div className="workspace-header-left">
                      <div
                        className="workspace-dot-large"
                        style={{ backgroundColor: "#4f46e5" }}
                      />
                      <h3>{workspace.name}</h3>
                    </div>
                  </Link>
                  <div className="project-header-actions">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteWorkspace(workspace.id, workspace.name);
                      }}
                      className="btn-delete-workspace-text"
                      title="Delete workspace"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <Link
                  to={`/workspace/${workspace.id}/projects`}
                  className="project-card-link"
                >
                  <div className="project-stats">
                    <div className="project-stat">
                      <span className="stat-number">{workspace.project_count || 0}</span>
                      <span className="stat-label">Projects</span>
                    </div>
                    <div className="project-stat">
                      <span className="stat-number">{workspace.task_count || 0}</span>
                      <span className="stat-label">Tasks</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    Created: {new Date(workspace.created_at).toLocaleDateString()}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedWorkspace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
             <ProjectForm workspaceId={selectedWorkspace.id} onProjectCreated={handleProjectCreated} />
          </div>
        </div>
      )}
    </div>
  );
}