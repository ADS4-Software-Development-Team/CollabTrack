import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProjectForm from '../components/projects/ProjectForm';
import './ProjectList.css';

function ProjectList() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);

  const handleAddProject = (projectData) => {
    dispatch({
      type: 'ADD_PROJECT',
      payload: projectData,
    });
    setShowForm(false);
  };

  return (
    <div className="project-list">
      <div className="page-header">
        <h1>Projects</h1>
      </div>

      {showForm && (
        <ProjectForm
          onSubmit={handleAddProject}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="projects-grid">
        {state.projects.map(project => {
          const projectTasks = state.tasks.filter(task => task.projectId === project.id);
          return (
            <Link 
              key={project.id} 
              to={`/projects/${project.id}`}
              className="project-card-link"
            >
              <div className="project-card">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="project-meta">
                  <span className="task-count">
                    {projectTasks.length} tasks
                  </span>
                  <span className={`status ${project.status}`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {state.projects.length === 0 && !showForm && (
        <div className="empty-state">
          <h2>No projects yet</h2>
          <p>Create your first project to get started!</p>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            Create Project
          </button>
        </div>
      )}
    </div>
  );
}

export default ProjectList;