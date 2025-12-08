import React, { useEffect, useState } from 'react';
import { projectAPI } from '../api';
import ProjectForm from '../components/ProjectForm';
import { useLocation } from 'react-router-dom';

export default function Projects() {
	const [projects, setProjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState(null);
	const [selectedFull, setSelectedFull] = useState(null);
	const [detailLoading, setDetailLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const workspaceId = queryParams.get('workspace_id');

	useEffect(() => { load(); }, []);

	async function load() {
		setLoading(true);
		try {
			const data = await projectAPI.getProjects();
			setProjects(data || []);
		} catch (err) {
			console.error('Failed to load projects:', err);
			setProjects([]);
		} finally {
			setLoading(false);
		}
	}

	async function openProject(project) {
		setSelected(project);
		setDetailLoading(true);
		try {
			const data = await projectAPI.getProjectById(project.id);
			// backend returns { project, tasks }
			setSelectedFull(data?.project || project);
		} catch (err) {
			console.error('Failed to load project details:', err);
			setSelectedFull(project);
		} finally {
			setDetailLoading(false);
		}
	}

  const handleProjectCreated = () => {
    setShowCreateForm(false);
    load();
  }

	return (
		<div>
			<h1 className="text-2xl font-bold mb-4">Projects</h1>

      <div className="mb-4">
        <button onClick={() => setShowCreateForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Project
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <ProjectForm onProjectCreated={handleProjectCreated} workspaceId={workspaceId} />
          </div>
        </div>
      )}

			{loading ? (
				<p>Loading projects...</p>
			) : projects.length === 0 ? (
				<p className="text-gray-500">No projects found.</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{projects.map(p => (
						<div key={p.id} className="bg-white p-4 rounded shadow cursor-pointer" onClick={() => openProject(p)}>
							<h3 className="text-lg font-semibold">{p.title}</h3>
							<p className="text-sm text-gray-600 truncate">{p.description}</p>
							<div className="text-xs text-gray-500 mt-2">Created: {new Date(p.created_at).toLocaleDateString()}</div>
						</div>
					))}
				</div>
			)}

			{selected && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg w-full max-w-2xl p-6">
						<div className="flex justify-between items-start mb-4">
							<div>
								<h2 className="text-2xl font-bold">{selectedFull ? selectedFull.title : selected.title}</h2>
								<p className="text-gray-600">{selectedFull ? selectedFull.description : selected.description}</p>
								<div className="text-sm text-gray-500 mt-2">Created: {new Date((selectedFull ? selectedFull.created_at : selected.created_at)).toLocaleString()}</div>
							</div>
							<div>
								<button onClick={() => setSelected(null)} className="text-gray-600">Close</button>
							</div>
						</div>
						<div>
							{/* Full project details (loaded from `projects` table) */}
							<p><strong>Created by:</strong> {(selectedFull || selected).created_by || '—'}</p>
							<p><strong>Deadline:</strong> {(selectedFull || selected).deadline ? new Date((selectedFull || selected).deadline).toLocaleDateString() : '—'}</p>
							{/* Add more fields as needed */}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

