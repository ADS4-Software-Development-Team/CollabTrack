import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceAPI } from '../api';
import ProjectForm from '../components/ProjectForm'; // Make sure this path is correct

export default function CreateWorkspace() {
  const [workspaceName, setWorkspaceName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('createWorkspace'); // 'createWorkspace' or 'createProject'
  const [newWorkspace, setNewWorkspace] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      setError('Workspace name cannot be empty.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const workspace = await workspaceAPI.createWorkspace(workspaceName);
      setNewWorkspace(workspace);
      setStage('createProject');
    } catch (err) {
      setError(err.message || 'Failed to create workspace. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProjectCreated = () => {
    if (newWorkspace) {
      navigate(`/workspace/${newWorkspace.id}`);
    } else {
      // Fallback if something went wrong
      navigate('/dashboard');
    }
  };

  if (stage === 'createProject') {
    return <ProjectForm workspaceId={newWorkspace.id} onProjectCreated={handleProjectCreated} />;
  }

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin: Create Workspace</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700">
            Workspace Name
          </label>
          <input
            type="text"
            id="workspaceName"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter workspace name"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating...' : 'Create Workspace'}
        </button>
      </form>
    </div>
  );
}