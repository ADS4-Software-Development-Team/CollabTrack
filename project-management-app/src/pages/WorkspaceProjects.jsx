// frontend/src/pages/WorkspaceProjects.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workspaceAPI, projectAPI } from '../api';
import ProjectForm from '../components/ProjectForm'; // Assuming ProjectForm is used for editing as well

export default function WorkspaceProjects() {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null); // For editing

  useEffect(() => {
    async function loadWorkspaceAndProjects() {
      try {
        setLoading(true);
        // Fetch workspace details
        const workspaceData = await workspaceAPI.getWorkspaceById(workspaceId);
        setWorkspace(workspaceData);

        // Fetch projects for the workspace
        const projectsData = await workspaceAPI.getProjectsForWorkspace(workspaceId);
        setProjects(projectsData);
      } catch (err) {
        console.error('Failed to load workspace and projects:', err);
        setError('Failed to load workspace or projects.');
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaceAndProjects();
  }, [workspaceId]);

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.deleteProject(projectId);
        setProjects(projects.filter(p => p.id !== projectId));
        alert('Project deleted successfully!');
      } catch (err) {
        console.error('Failed to delete project:', err);
        alert('Failed to delete project.');
      }
    }
  };

  const handleProjectUpdated = async () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    // Refresh projects after update
    try {
      const projectsData = await workspaceAPI.getProjectsForWorkspace(workspaceId);
      setProjects(projectsData);
    } catch (err) {
      console.error('Failed to refresh projects:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading workspace projects...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!workspace) {
    return <div className="text-center py-8">Workspace not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Link to="/dashboard" className="text-blue-500 hover:underline mb-4 block">
        &larr; Back to Dashboard
      </Link>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Projects for {workspace.name}</h2>
        <button
          onClick={() => {
            setSelectedProject(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No projects in this workspace yet.</p>
          <button
            onClick={() => {
              setSelectedProject(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <p className="text-sm text-gray-500">Due: {new Date(project.due_date).toLocaleDateString()}</p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEditProject(project)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">{selectedProject ? 'Edit Project' : 'Create Project'}</h2>
            <ProjectForm
              workspaceId={workspaceId}
              project={selectedProject} // Pass project data for editing
              onProjectCreated={handleProjectUpdated} // This will also handle project updated
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
