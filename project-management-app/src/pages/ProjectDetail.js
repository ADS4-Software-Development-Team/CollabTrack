import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TaskForm from '../components/tasks/TaskForm';
import './ProjectDetail.css';

function ProjectDetail() {
  const { projectId } = useParams();
  const { state, dispatch } = useApp();
  const [showTaskForm, setShowTaskForm] = useState(false);

  const project = state.projects.find(p => p.id === projectId);
  const projectTasks = state.tasks.filter(task => task.projectId === projectId);

  const handleAddTask = (taskData) => {
    dispatch({
      type: 'ADD_TASK',
      payload: {
        ...taskData,
        projectId: projectId,
      },
    });
    setShowTaskForm(false);
  };

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    dispatch({
      type: 'UPDATE_TASK_STATUS',
      payload: {
        taskId,
        status: newStatus,
      },
    });
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
    todo: projectTasks.filter(task => task.status === 'todo'),
    'in-progress': projectTasks.filter(task => task.status === 'in-progress'),
    done: projectTasks.filter(task => task.status === 'done'),
  };

  return (
    <div className="project-detail">
      <div className="project-header">
        <Link to="/projects" className="back-link">
          ← Back to Projects
        </Link>
        <div className="project-title-section">
          <h1>{project.name}</h1>
          <button 
            className="btn-primary"
            onClick={() => setShowTaskForm(true)}
          >
            Add Task
          </button>
        </div>
        <p className="project-description">{project.description}</p>
      </div>

      {showTaskForm && (
        <TaskForm
          onSubmit={handleAddTask}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      <div className="kanban-board">
        <div className="kanban-column">
          <h3>To Do ({tasksByStatus.todo.length})</h3>
          <div className="tasks-list">
            {tasksByStatus.todo.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={handleUpdateTaskStatus}
              />
            ))}
          </div>
        </div>

        <div className="kanban-column">
          <h3>In Progress ({tasksByStatus['in-progress'].length})</h3>
          <div className="tasks-list">
            {tasksByStatus['in-progress'].map(task => (
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
            {tasksByStatus.done.map(task => (
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
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  return (
    <div className="task-card">
      <div className="task-header">
        <h4>{task.title}</h4>
        <span className={`priority ${task.priority}`}>
          {task.priority}
        </span>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-meta">
        <span className="assignee">Assignee: {task.assignee || 'Unassigned'}</span>
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
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProjectDetail;
