import React from 'react';
import { Link } from 'react-router-dom';
import ProjectForm from '../components/ProjectForm';

export default function WorkspaceModal({ isOpen, onClose, workspace, onProjectCreated }) {
  if (!isOpen || !workspace) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Workspace Details: {workspace.name}</h2>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <p><strong>Created At:</strong> {new Date(workspace.created_at).toLocaleDateString()}</p>
          {/* Add more workspace details here */}

          <h3 className="text-xl font-bold mt-6 mb-4">Projects</h3>
          {/* Projects list will go here, similar to WorkspaceProjects.jsx */}
          {/* For now, just a placeholder or a link to the projects page */}
          <Link to={`/workspace/${workspace.id}/projects`} className="text-blue-500 hover:underline">
            View All Projects in this Workspace
          </Link>

          <div className="mt-6">
            <button
              onClick={() => {
                // Logic to open ProjectForm modal
                // This will likely involve another state in Dashboard.jsx or passing a handler
                console.log('Open Create Project Form for workspace:', workspace.name);
                // For now, let's just close this modal and rely on the WorkspaceProjects page
                onClose(); 
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Create New Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
