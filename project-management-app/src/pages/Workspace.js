import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom"; // Add this import
import "./Workspace.css";

function WorkspacePage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate(); // Add navigation hook
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditWorkspace, setShowEditWorkspace] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false); // Add state for create project modal
  const [newMember, setNewMember] = useState({
    email: "",
    name: "",
    role: "member",
  });
  const [editWorkspaceData, setEditWorkspaceData] = useState({
    name: "",
    description: "",
  });
  const [newProject, setNewProject] = useState({
    // Add state for new project
    name: "",
    description: "",
    status: "active",
  });

  // Get current workspace
  const currentWorkspace = state.workspaces.find(
    (workspace) => workspace.id === state.currentWorkspace
  );

  // Get members for current workspace
  const workspaceMembers = state.workspaceMembers.filter(
    (member) => member.workspaceId === state.currentWorkspace
  );

  // Get projects for current workspace
  const workspaceProjects = state.projects.filter(
    (project) => project.workspaceId === state.currentWorkspace
  );

  // Get statistics
  const workspaceStats = {
    totalMembers: workspaceMembers.length,
    totalProjects: workspaceProjects.length,
    totalTasks: state.tasks.filter((task) =>
      workspaceProjects.some((project) => project.id === task.projectId)
    ).length,
    adminCount: workspaceMembers.filter((member) => member.role === "admin")
      .length,
  };

  const handleAddMember = () => {
    if (!newMember.email.trim() || !newMember.name.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    dispatch({
      type: "ADD_WORKSPACE_MEMBER",
      payload: {
        email: newMember.email,
        name: newMember.name,
        role: newMember.role,
      },
    });

    setNewMember({ email: "", name: "", role: "member" });
    setShowAddMember(false);
  };

  const handleUpdateRole = (memberId, newRole) => {
    dispatch({
      type: "UPDATE_WORKSPACE_MEMBER_ROLE",
      payload: { memberId, role: newRole },
    });
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      dispatch({
        type: "REMOVE_WORKSPACE_MEMBER",
        payload: { memberId },
      });
    }
  };

  const handleEditWorkspace = () => {
    if (!editWorkspaceData.name.trim()) {
      alert("Workspace name is required");
      return;
    }

    dispatch({
      type: "UPDATE_WORKSPACE_DETAILS",
      payload: editWorkspaceData,
    });

    setShowEditWorkspace(false);
  };

  // Add function to handle project creation
  const handleCreateProject = () => {
    if (!newProject.name.trim()) {
      alert("Project name is required");
      return;
    }

    dispatch({
      type: "ADD_PROJECT",
      payload: {
        name: newProject.name,
        description: newProject.description,
        status: newProject.status,
      },
    });

    // Reset form and close modal
    setNewProject({
      name: "",
      description: "",
      status: "active",
    });
    setShowCreateProject(false);
  };

  // Add function to navigate to project details
  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // Add function to navigate to all projects
  const handleViewAllProjects = () => {
    navigate("/projects");
  };

  const roleOptions = [
    { value: "admin", label: "Admin", description: "Full access to workspace" },
    {
      value: "member",
      label: "Member",
      description: "Can create and edit projects",
    },
    { value: "viewer", label: "Project Manager", description: "Edit and assign task" },
  ];

  const projectStatusOptions = [
    { value: "planning", label: "Planning" },
    { value: "active", label: "Active" },
    { value: "on-hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#dc2626";
      case "member":
        return "#059669";
      case "viewer":
        return "#4f46e5";
      default:
        return "#6b7280";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "planning":
        return "#f59e0b";
      case "on-hold":
        return "#6b7280";
      case "completed":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="workspace-page">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="workspace-info">
          <div
            className="workspace-color-large"
            style={{ backgroundColor: currentWorkspace?.color }}
          ></div>
          <div>
            <h1>{currentWorkspace?.name}</h1>
            <p className="workspace-description">
              {currentWorkspace?.description}
            </p>
            <div className="workspace-meta">
              <span className="meta-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {workspaceStats.totalMembers} members
              </span>
              <span className="meta-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {workspaceStats.totalProjects} projects
              </span>
              <span className="meta-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                {workspaceStats.totalTasks} tasks
              </span>
            </div>
          </div>
        </div>

        <div className="workspace-actions">
          <button
            className="btn-edit-workspace"
            onClick={() => {
              setEditWorkspaceData({
                name: currentWorkspace.name,
                description: currentWorkspace.description,
              });
              setShowEditWorkspace(true);
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Workspace
          </button>
          <button
            className="btn-create-project" // Changed from btn-add-member
            onClick={() => setShowCreateProject(true)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Project
          </button>
          <button
            className="btn-add-member"
            onClick={() => setShowAddMember(true)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Add Member
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="workspace-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#e0f2fe" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#0369a1">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Members</h3>
            <p className="stat-number">{workspaceStats.totalMembers}</p>
            <p className="stat-detail">
              {workspaceStats.adminCount} admin,{" "}
              {workspaceStats.totalMembers - workspaceStats.adminCount} members
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#dcfce7" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#16a34a">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Projects</h3>
            <p className="stat-number">{workspaceStats.totalProjects}</p>
            <p className="stat-detail">Active projects in workspace</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: "#fef3c7" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#d97706">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Tasks</h3>
            <p className="stat-number">{workspaceStats.totalTasks}</p>
            <p className="stat-detail">Across all projects</p>
          </div>
        </div>
      </div>

      {/* Projects Section - Moved up for better visibility */}
      <div className="workspace-section">
        <div className="section-header">
          <div className="section-title-group">
            <h2>Workspace Projects</h2>
            <span className="project-count-badge">
              {workspaceProjects.length}{" "}
              {workspaceProjects.length === 1 ? "project" : "projects"}
            </span>
          </div>
          <div className="section-actions">
            <button className="btn-view-all" onClick={handleViewAllProjects}>
              View All Projects
            </button>
            <button
              className="btn-create-new"
              onClick={() => setShowCreateProject(true)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Project
            </button>
          </div>
        </div>

        {workspaceProjects.length > 0 ? (
          <div className="projects-grid">
            {workspaceProjects.slice(0, 6).map((project) => {
              // Calculate project stats
              const projectTasks = state.tasks.filter(
                (task) => task.projectId === project.id
              );
              const completedTasks = projectTasks.filter(
                (task) => task.status === "done"
              ).length;
              const progress =
                projectTasks.length > 0
                  ? Math.round((completedTasks / projectTasks.length) * 100)
                  : 0;

              return (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    <span
                      className={`status ${project.status}`}
                      style={{
                        backgroundColor: getStatusColor(project.status),
                      }}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="project-description">{project.description}</p>

                  <div className="project-stats">
                    <div className="project-stat">
                      <span className="stat-number">{projectTasks.length}</span>
                      <span className="stat-label">Tasks</span>
                    </div>
                    <div className="project-stat">
                      <span className="stat-number">{completedTasks}</span>
                      <span className="stat-label">Completed</span>
                    </div>
                    <div className="project-stat">
                      <span className="stat-number">{progress}%</span>
                      <span className="stat-label">Progress</span>
                    </div>
                  </div>

                  <div className="project-progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: getStatusColor(project.status),
                      }}
                    ></div>
                  </div>

                  <div className="project-footer">
                    <span className="project-date">
                      Created:{" "}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      className="btn-view-project"
                      onClick={() => handleViewProject(project.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>No Projects Yet</h3>
            <p>Create your first project to start collaborating</p>
            <button
              className="btn-primary"
              onClick={() => setShowCreateProject(true)}
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>

      {/* Members Section */}
      <div className="workspace-section">
        <div className="section-header">
          <h2>Workspace Members</h2>
          <span className="section-count">
            {workspaceMembers.length} members
          </span>
        </div>

        <div className="members-table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workspaceMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="member-info">
                      <div
                        className="member-avatar"
                        style={{ backgroundColor: getRoleColor(member.role) }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="member-name">{member.name}</div>
                        {member.role === "admin" && (
                          <span className="member-badge">Owner</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="member-email">{member.email}</div>
                  </td>
                  <td>
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleUpdateRole(member.id, e.target.value)
                      }
                      className="role-select"
                      style={{ borderColor: getRoleColor(member.role) }}
                      disabled={member.id === "1"} // Disable for workspace owner
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="join-date">
                      {new Date(member.joinedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td>
                    <div className="member-actions">
                      {member.id !== "1" && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="btn-remove"
                          title="Remove member"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {workspaceMembers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <h3>No Members Yet</h3>
            <p>Add members to collaborate on this workspace</p>
            <button
              className="btn-primary"
              onClick={() => setShowAddMember(true)}
            >
              Add Your First Member
            </button>
          </div>
        )}
      </div>

      {/* Modals */}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button
                className="btn-close"
                onClick={() => setShowCreateProject(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="Enter project name"
                  className="form-input"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter project description (optional)"
                  className="form-textarea"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newProject.status}
                  onChange={(e) =>
                    setNewProject({ ...newProject, status: e.target.value })
                  }
                  className="form-select"
                >
                  {projectStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-hint">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                This project will be created in the current workspace:{" "}
                <strong>{currentWorkspace?.name}</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowCreateProject(false)}
              >
                Cancel
              </button>
              <button
                className="btn-create"
                onClick={handleCreateProject}
                disabled={!newProject.name.trim()}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Member</h2>
              <button
                className="btn-close"
                onClick={() => setShowAddMember(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  placeholder="Enter member's name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                  placeholder="Enter member's email"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <div className="role-options">
                  {roleOptions.map((option) => (
                    <label key={option.value} className="role-option">
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={newMember.role === option.value}
                        onChange={(e) =>
                          setNewMember({ ...newMember, role: e.target.value })
                        }
                      />
                      <div className="role-content">
                        <div className="role-label">{option.label}</div>
                        <div className="role-description">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowAddMember(false)}
              >
                Cancel
              </button>
              <button className="btn-create" onClick={handleAddMember}>
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Workspace Modal */}
      {showEditWorkspace && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Workspace</h2>
              <button
                className="btn-close"
                onClick={() => setShowEditWorkspace(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Workspace Name *</label>
                <input
                  type="text"
                  value={editWorkspaceData.name}
                  onChange={(e) =>
                    setEditWorkspaceData({
                      ...editWorkspaceData,
                      name: e.target.value,
                    })
                  }
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editWorkspaceData.description}
                  onChange={(e) =>
                    setEditWorkspaceData({
                      ...editWorkspaceData,
                      description: e.target.value,
                    })
                  }
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowEditWorkspace(false)}
              >
                Cancel
              </button>
              <button className="btn-create" onClick={handleEditWorkspace}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspacePage;
