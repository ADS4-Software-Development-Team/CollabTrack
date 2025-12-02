import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import "./Dashboard.css";

function Dashboard() {
  const { state, dispatch } = useApp();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    description: "",
    color: "#4f46e5",
  });

  // Get current workspace
  const currentWorkspace = state.workspaces.find(
    (workspace) => workspace.id === state.currentWorkspace
  );

  // Get projects for current workspace
  const workspaceProjects = state.projects.filter(
    (project) => project.workspaceId === state.currentWorkspace
  );

  // Get tasks for current workspace projects
  const workspaceTasks = state.tasks.filter((task) =>
    workspaceProjects.some((project) => project.id === task.projectId)
  );

  const stats = {
    totalProjects: workspaceProjects.length,
    totalTasks: workspaceTasks.length,
    completedTasks: workspaceTasks.filter((task) => task.status === "done")
      .length,
    inProgressTasks: workspaceTasks.filter(
      (task) => task.status === "in-progress"
    ).length,
  };

  const handleCreateWorkspace = () => {
    if (!newWorkspace.name.trim()) {
      alert("Please enter a workspace name");
      return;
    }

    dispatch({
      type: "ADD_WORKSPACE",
      payload: {
        name: newWorkspace.name,
        description: newWorkspace.description,
        color: newWorkspace.color,
      },
    });

    // Reset form
    setNewWorkspace({
      name: "",
      description: "",
      color: "#4f46e5",
    });
    setShowCreateWorkspace(false);
  };

  const colorOptions = [
    { value: "#4f46e5", label: "Purple" },
    { value: "#059669", label: "Green" },
    { value: "#dc2626", label: "Red" },
    { value: "#2563eb", label: "Blue" },
    { value: "#f59e0b", label: "Amber" },
    { value: "#8b5cf6", label: "Violet" },
    { value: "#10b981", label: "Emerald" },
    { value: "#ef4444", label: "Rose" },
  ];

  return (
    <div className="dashboard">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="workspace-info">
          <div
            className="workspace-color"
            style={{ backgroundColor: currentWorkspace?.color }}
            title={currentWorkspace?.name}
          ></div>
          <div>
            <h1>{currentWorkspace?.name || "Workspace"}</h1>
            <p className="workspace-description">
              {currentWorkspace?.description ||
                "Select a workspace to get started"}
            </p>
          </div>
        </div>

        <div className="workspace-actions">
          <div className="workspace-switcher">
            <span className="switch-label">Active Workspace:</span>
            <select
              value={state.currentWorkspace}
              onChange={(e) => {
                dispatch({
                  type: "SWITCH_WORKSPACE",
                  payload: { workspaceId: e.target.value },
                });
              }}
              className="workspace-select"
            >
              {state.workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>
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

              <div className="form-group">
                <label htmlFor="workspace-description">Description</label>
                <textarea
                  id="workspace-description"
                  value={newWorkspace.description}
                  onChange={(e) =>
                    setNewWorkspace({
                      ...newWorkspace,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter workspace description (optional)"
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Color Theme</label>
                <div className="color-picker">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`color-option ${
                        newWorkspace.color === color.value ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() =>
                        setNewWorkspace({ ...newWorkspace, color: color.value })
                      }
                      title={color.label}
                    >
                      {newWorkspace.color === color.value && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <div
                  className="color-preview"
                  style={{ backgroundColor: newWorkspace.color }}
                >
                  <span style={{ color: getContrastColor(newWorkspace.color) }}>
                    {newWorkspace.name || "Preview"}
                  </span>
                </div>
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
          <h3>Workspace Projects</h3>
          <p className="stat-number">{stats.totalProjects}</p>
          <p className="stat-label">Total in this workspace</p>
        </div>
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{stats.totalTasks}</p>
          <p className="stat-label">Across all workspace projects</p>
        </div>
        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <p className="stat-number">{stats.completedTasks}</p>
          <p className="stat-label">In this workspace</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number">{stats.inProgressTasks}</p>
          <p className="stat-label">Tasks being worked on</p>
        </div>
      </div>

      {/* Workspace Projects */}
      <div className="recent-activities">
        <div className="section-header">
          <h2>Projects</h2>
          <span className="project-count">
            {workspaceProjects.length} projects
          </span>
        </div>

        {workspaceProjects.length === 0 ? (
          <div className="empty-state">
            <p>No projects in this workspace yet. Create your first project!</p>
            <button className="btn-primary">Create Project</button>
          </div>
        ) : (
          <div className="projects-grid">
            {workspaceProjects.map((project) => {
              // Calculate project stats
              const projectTasks = workspaceTasks.filter(
                (task) => task.projectId === project.id
              );
              const completedTasks = projectTasks.filter(
                (task) => task.status === "done"
              ).length;

              return (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    <span className={`status ${project.status}`}>
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
                      <span className="stat-number">
                        {projectTasks.length > 0
                          ? Math.round(
                              (completedTasks / projectTasks.length) * 100
                            )
                          : 0}
                        %
                      </span>
                      <span className="stat-label">Progress</span>
                    </div>
                  </div>

                  <div className="project-progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${
                          projectTasks.length > 0
                            ? Math.round(
                                (completedTasks / projectTasks.length) * 100
                              )
                            : 0
                        }%`,
                        backgroundColor: currentWorkspace?.color || "#4f46e5",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Tasks */}
      <div className="recent-activities">
        <h2>Recent Tasks in Workspace</h2>
        {workspaceTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks in workspace projects yet.</p>
          </div>
        ) : (
          <div className="tasks-list">
            {workspaceTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    <span className="assignee">{task.assignee}</span>
                    <span className={`priority ${task.priority}`}>
                      {task.priority}
                    </span>
                    <span className="due-date">Due: {task.dueDate}</span>
                  </div>
                </div>
                <span className={`task-status ${task.status}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to determine text color based on background
function getContrastColor(hexcolor) {
  const r = parseInt(hexcolor.substr(1, 2), 16);
  const g = parseInt(hexcolor.substr(3, 2), 16);
  const b = parseInt(hexcolor.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default Dashboard;
