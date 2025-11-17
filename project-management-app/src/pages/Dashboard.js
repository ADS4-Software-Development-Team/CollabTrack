import React from 'react';
import { useApp } from '../context/AppContext';
import './Dashboard.css';

function Dashboard() {
  const { state } = useApp();

  const stats = {
    totalProjects: state.projects.length,
    totalTasks: state.tasks.length,
    completedTasks: state.tasks.filter(task => task.status === 'done').length,
    inProgressTasks: state.tasks.filter(task => task.status === 'in-progress').length,
  };

  return (
    <div className="dashboard">
      <h1>Project Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p className="stat-number">{stats.totalProjects}</p>
        </div>
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-number">{stats.totalTasks}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <p className="stat-number">{stats.completedTasks}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number">{stats.inProgressTasks}</p>
        </div>
      </div>

      <div className="recent-activities">
        <h2>Recent Projects</h2>
        {state.projects.length === 0 ? (
          <p>No projects yet. Create your first project!</p>
        ) : (
          <div className="projects-list">
            {state.projects.slice(0, 5).map(project => (
              <div key={project.id} className="project-card">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <span className={`status ${project.status}`}>{project.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;