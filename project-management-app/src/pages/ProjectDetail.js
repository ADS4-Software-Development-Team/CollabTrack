import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import TaskForm from "../components/tasks/TaskForm";
import "./ProjectDetail.css";

function ProjectDetail() {
  const { projectId } = useParams();
  const { state, dispatch } = useApp();
  const [showTaskForm, setShowTaskForm] = useState(false);

  const project = state.projects.find((p) => p.id === projectId);

  // Find the workspace this project belongs to
  const workspace = project
    ? state.workspaces.find((w) => w.id === project.workspaceId)
    : null;

  const projectTasks = state.tasks.filter(
    (task) => task.projectId === projectId
  );

  const handleAddTask = (taskData) => {
    dispatch({
      type: "ADD_TASK",
      payload: {
        ...taskData,
        projectId: projectId,
      },
    });
    setShowTaskForm(false);
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    dispatch({
      type: "UPDATE_TASK_STATUS",
      payload: {
        taskId,
        status: newStatus,
      },
    });
  };

  // Function to switch to project's workspace
  const handleSwitchToWorkspace = () => {
    if (workspace) {
      dispatch({
        type: "SWITCH_WORKSPACE",
        payload: { workspaceId: workspace.id },
      });
    }
  };

  if (!project) {
    return (
      <div className="project-detail">
        <div className="not-found">
          <h2>Project Not Found</h2>
          <p>The project you're looking for doesn't exist.</p>
          <Link to="/projects" className="btn-primary">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const tasksByStatus = {
    backlog: projectTasks.filter((task) => task.status === "backlog"),
    todo: projectTasks.filter((task) => task.status === "todo"),
    "in-progress": projectTasks.filter((task) => task.status === "in-progress"),
    done: projectTasks.filter((task) => task.status === "done"),
  };

  // Calculate project statistics
  const projectStats = {
    totalTasks: projectTasks.length,
    completedTasks: projectTasks.filter((task) => task.status === "done")
      .length,
    inProgressTasks: projectTasks.filter(
      (task) => task.status === "in-progress"
    ).length,
    todoTasks: projectTasks.filter((task) => task.status === "todo").length,
    progress:
      projectTasks.length > 0
        ? Math.round(
            (projectTasks.filter((task) => task.status === "done").length /
              projectTasks.length) *
              100
          )
        : 0,
  };

  return (
    <div className="project-detail">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <Link to="/" className="breadcrumb-item">
          Dashboard
        </Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/projects" className="breadcrumb-item">
          Projects
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active">{project.name}</span>
      </div>

      <div className="project-header">
        <div className="project-info-section">
          <div className="project-title-row">
            <div>
              <h1>{project.name}</h1>

              {/* Workspace Badge */}
              {workspace && (
                <div
                  className="workspace-badge"
                  onClick={handleSwitchToWorkspace}
                >
                  <div
                    className="workspace-dot"
                    style={{ backgroundColor: workspace.color }}
                    title={`Switch to ${workspace.name} workspace`}
                  />
                  <span className="workspace-name">{workspace.name}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="workspace-switch-icon"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </div>
              )}
            </div>

            <button
              className="btn-primary"
              onClick={() => setShowTaskForm(true)}
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
              Add Task
            </button>
          </div>

          <p className="project-description">{project.description}</p>

          {/* Project Stats */}
          <div className="project-stats">
            <div className="project-stat">
              <span className="stat-number">{projectStats.totalTasks}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
            <div className="project-stat">
              <span className="stat-number">{projectStats.completedTasks}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="project-stat">
              <span className="stat-number">
                {projectStats.inProgressTasks}
              </span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="project-stat">
              <span className="stat-number">{projectStats.progress}%</span>
              <span className="stat-label">Progress</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="project-progress">
            <div
              className="progress-bar"
              style={{
                width: `${projectStats.progress}%`,
                backgroundColor: workspace?.color || "#4f46e5",
              }}
            ></div>
          </div>
        </div>

        {/* Project Metadata */}
        <div className="project-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Status</span>
            <span className={`status-badge ${project.status}`}>
              {project.status}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Created</span>
            <span className="metadata-value">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Workspace</span>
            <div className="metadata-value">
              <div className="workspace-link" onClick={handleSwitchToWorkspace}>
                <div
                  className="workspace-color-small"
                  style={{ backgroundColor: workspace?.color }}
                />
                {workspace?.name || "Unknown Workspace"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTaskForm && (
        <TaskForm
          onSubmit={handleAddTask}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      <div className="kanban-board">
        <div className="kanban-column">
          <h3>Backlog ({tasksByStatus.backlog.length})</h3>
          <div className="tasks-list">
            {tasksByStatus.backlog.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleUpdateTaskStatus}
              />
            ))}
          </div>
        </div>
        <div className="kanban-column">
          <h3>To Do ({tasksByStatus.todo.length})</h3>
          <div className="tasks-list">
            {tasksByStatus.todo.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleUpdateTaskStatus}
              />
            ))}
          </div>
        </div>

        <div className="kanban-column">
          <h3>In Progress ({tasksByStatus["in-progress"].length})</h3>
          <div className="tasks-list">
            {tasksByStatus["in-progress"].map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleUpdateTaskStatus}
              />
            ))}
          </div>
        </div>

        <div className="kanban-column">
          <h3>Done ({tasksByStatus.done.length})</h3>
          <div className="tasks-list">
            {tasksByStatus.done.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleUpdateTaskStatus}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// TaskCard component for individual tasks
function TaskCard({ task, onStatusChange }) {
  const statusOptions = [
    { value: "backlog", label: "Backlog" },
    { value: "todo", label: "To Do" },
    { value: "in-progress", label: "In Progress" },
    { value: "done", label: "Done" },
  ];

  return (
    <div className="task-card">
      <div className="task-header">
        <h4>{task.title}</h4>
        <span className={`priority ${task.priority}`}>{task.priority}</span>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-meta">
        <span className="assignee">
          Assignee: {task.assignee || "Unassigned"}
        </span>
        {task.dueDate && (
          <span className="due-date">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      <select
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
        className="status-select"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProjectDetail;
